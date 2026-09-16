import hashlib
import hmac
import os
import logging
from typing import List, Dict, Any, Optional

from cyborgdb import Client
from app.models import Patient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# All 8 hospital nodes queried by the privacy aggregator
INSTITUTIONS = [
    "mumbai", "tokyo", "singapore",
    "boston", "toronto", "sao_paulo",
    "london", "berlin",
]


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"{name} environment variable is required. "
            "Set it in backend/.env or your deployment secrets."
        )
    return value


def derive_index_key(institution_id: str, master_key_hex: Optional[str] = None) -> bytes:
    """
    Derive a per-hospital index key from a master key via HMAC-SHA256.

    Each hospital index uses a distinct key. The trusted aggregator holds the
    master key and derives per-institution keys at query time.
    """
    master_hex = master_key_hex or _require_env("CYBORGDB_MASTER_INDEX_KEY")
    master = bytes.fromhex(master_hex)
    if len(master) != 32:
        raise ValueError("CYBORGDB_MASTER_INDEX_KEY must be a 64-character hex string (32 bytes)")
    return hmac.new(master, institution_id.encode(), hashlib.sha256).digest()


class CyborgService:
    def __init__(self):
        # CYBORGDB_API_KEY is the CyborgDB service's own license key, not a
        # RareNet secret. Unset = the service runs in free tier (per the
        # vendor's own service, this caps at 1M items per index, which is
        # far more than this app needs); a real key only raises that cap.
        self.api_key = os.getenv("CYBORGDB_API_KEY", "")
        self.base_url = os.getenv("CYBORGDB_URL", "http://localhost:8000")

        if not self.base_url.startswith("http"):
            self.base_url = f"http://{self.base_url}"

        key_display = f"{self.api_key[:8]}..." if self.api_key else "(unset — free tier)"
        logger.info(f"Connecting to CyborgDB at {self.base_url} (API key: {key_display})")

        try:
            self.client = Client(base_url=self.base_url, api_key=self.api_key)
            self.connected = True
            logger.info("CyborgDB client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to connect to CyborgDB: {e}")
            self.client = None
            self.connected = False

        self.institutions = INSTITUTIONS

    def _ensure_connection(self):
        if not self.connected or self.client is None:
            try:
                self.client = Client(base_url=self.base_url, api_key=self.api_key)
                self.connected = True
            except Exception as e:
                logger.error(f"Failed to reconnect to CyborgDB: {e}")
                raise ConnectionError("CyborgDB is not available") from e

    def get_index_key(self, institution_id: str) -> bytes:
        """Return the derived encryption key for a hospital index."""
        return derive_index_key(institution_id)

    def create_institution_index(self, institution_id: str, dimension: int = 384):
        """Creates a new index in CyborgDB for a specific institution."""
        self._ensure_connection()
        index_name = f"rarenet_{institution_id}"
        index_key = self.get_index_key(institution_id)

        try:
            existing_indexes = self.client.list_indexes()
            if index_name in existing_indexes:
                logger.info(f"Index {index_name} already exists.")
                return True

            self.client.create_index(index_name, index_key=index_key)
            logger.info(f"Index {index_name} created with per-hospital derived key.")
            return True

        except Exception as e:
            logger.warning(f"Could not create index {index_name}: {e}")
            return False

    def store_patient(self, patient: Patient, vector: List[float]):
        """Upserts the patient vector into the institution's index."""
        self._ensure_connection()
        index_name = f"rarenet_{patient.institution_id}"
        index_key = self.get_index_key(patient.institution_id)

        metadata = {
            "patient_id": patient.id,
            "institution_id": patient.institution_id,
            "diagnosis": patient.diagnosis or "Unknown",
        }

        try:
            try:
                index = self.client.load_index(index_name, index_key=index_key)
            except Exception:
                self.client.create_index(index_name, index_key=index_key)
                index = self.client.load_index(index_name, index_key=index_key)

            item = {
                "id": patient.id,
                "vector": vector,
                "metadata": metadata,
            }

            index.upsert([item])
            logger.info(f"Stored patient {patient.id} in {index_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to store patient {patient.id}: {e}")
            raise e

    @staticmethod
    def _normalize_match(match) -> Dict[str, Any]:
        """Normalize CyborgDB query results across SDK versions."""
        if isinstance(match, dict):
            match_data = match.copy()
        else:
            match_data = {
                "id": getattr(match, "id", ""),
                "score": getattr(match, "score", None),
                "distance": getattr(match, "distance", None),
                "metadata": getattr(match, "metadata", {}),
            }

        # CyborgDB v0.16.1+ returns distance instead of score unless include=["distance"]
        if match_data.get("score") is None and match_data.get("distance") is not None:
            distance = match_data["distance"]
            # Cosine distance -> similarity score for downstream voting
            match_data["score"] = max(0.0, 1.0 - float(distance))

        if match_data.get("score") is None:
            match_data["score"] = 0.5

        return match_data

    def search_institution(
        self, institution: str, query_vector: List[float], top_k: int = 20
    ) -> List[Dict[str, Any]]:
        """Search a single institution's CyborgDB index."""
        self._ensure_connection()
        results = []
        index_name = f"rarenet_{institution}"
        index_key = self.get_index_key(institution)

        try:
            index = self.client.load_index(index_name, index_key=index_key)
            try:
                raw_results = index.query(
                    query_vector,
                    top_k=top_k,
                    include=["distance", "metadata"],
                )
            except TypeError:
                # Older CyborgDB client without include= parameter
                raw_results = index.query(query_vector, top_k=top_k)

            if raw_results:
                for match in raw_results:
                    results.append(self._normalize_match(match))

            logger.info(f"Search {index_name}: found {len(results)} results")

        except Exception as e:
            logger.warning(f"Search failed for {index_name}: {e}")

        return results

    def search_network(self, query_vector: List[float], top_k: int = 6) -> List[Dict[str, Any]]:
        """Searches across all known institution indices."""
        self._ensure_connection()
        all_results = []

        for institution in self.institutions:
            index_name = f"rarenet_{institution}"
            try:
                index = self.client.load_index(
                    index_name, index_key=self.get_index_key(institution)
                )
                try:
                    results = index.query(
                        query_vector,
                        top_k=top_k,
                        include=["distance", "metadata"],
                    )
                except TypeError:
                    results = index.query(query_vector, top_k=top_k)

                if results:
                    for match in results:
                        match_data = self._normalize_match(match)
                        match_data["source_institution"] = institution
                        all_results.append(match_data)

                logger.info(
                    f"Found {len(results) if results else 0} results from {institution}"
                )

            except Exception as e:
                logger.warning(f"Search failed for {index_name}: {e}")

        all_results.sort(key=lambda x: x.get("score", 0), reverse=True)
        return all_results[:top_k]

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the stored data."""
        self._ensure_connection()
        total = 0
        stats_by_institution = {}

        for institution in self.institutions:
            index_name = f"rarenet_{institution}"
            try:
                index = self.client.load_index(
                    index_name, index_key=self.get_index_key(institution)
                )
                count = getattr(index, "count", lambda: 0)()
                stats_by_institution[institution] = count
                total += count
            except Exception as e:
                logger.warning(f"Could not get stats for {index_name}: {e}")
                stats_by_institution[institution] = 0

        return {
            "total": total,
            "by_institution": stats_by_institution,
        }


cyborg_service = CyborgService()
