import os
import logging
from typing import List, Dict, Any
from cyborgdb import Client
from app.models import Patient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Demo key for hackathon (in production, use secure key management)
DEMO_KEY_HEX = "0000000000000000000000000000000000000000000000000000000000000001"

class CyborgService:
    def __init__(self):
        # Get API key from environment or use the one from docker-compose
        self.api_key = os.getenv("CYBORGDB_API_KEY", "cyborg_d754e642d7b94d05a4750d67a84b0efe")
        self.base_url = os.getenv("CYBORGDB_URL", "http://localhost:8000")
        
        # Handle missing scheme for Render compatibility
        if not self.base_url.startswith("http"):
            self.base_url = f"http://{self.base_url}"
            
        logger.info(f"Connecting to CyborgDB at {self.base_url} with API key: {self.api_key[:10]}...")
        
        try:
            # Pass API key properly to the client
            self.client = Client(
                base_url=self.base_url, 
                api_key=self.api_key
            )
            self.connected = True
            logger.info("CyborgDB client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to connect to CyborgDB: {e}")
            self.client = None
            self.connected = False
            
        self.institutions = ["mumbai", "boston", "london"]
        self.demo_key = bytes.fromhex(DEMO_KEY_HEX)

    def _ensure_connection(self):
        """Ensure CyborgDB connection is established."""
        if not self.connected or self.client is None:
            try:
                self.client = Client(
                    base_url=self.base_url, 
                    api_key=self.api_key
                )
                self.connected = True
            except Exception as e:
                logger.error(f"Failed to reconnect to CyborgDB: {e}")
                raise ConnectionError("CyborgDB is not available")

    def create_institution_index(self, institution_id: str, dimension: int = 384):
        """Creates a new index in CyborgDB for a specific institution."""
        self._ensure_connection()
        index_name = f"rarenet_{institution_id}"
        
        try:
            # Check if index already exists
            existing_indexes = self.client.list_indexes()
            if index_name in existing_indexes:
                logger.info(f"Index {index_name} already exists.")
                return True

            # Create index with demo key
            self.client.create_index(index_name, index_key=self.demo_key)
            logger.info(f"Index {index_name} created successfully.")
            return True
            
        except Exception as e:
            logger.warning(f"Could not create index {index_name}: {e}")
            return False

    def store_patient(self, patient: Patient, vector: List[float]):
        """Upserts the patient vector into the institution's index."""
        self._ensure_connection()
        index_name = f"rarenet_{patient.institution_id}"
        
        metadata = {
            "patient_id": patient.id,
            "institution_id": patient.institution_id,
            "diagnosis": patient.diagnosis or "Unknown",
        }

        try:
            # Load or create index
            try:
                index = self.client.load_index(index_name, index_key=self.demo_key)
            except Exception:
                self.client.create_index(index_name, index_key=self.demo_key)
                index = self.client.load_index(index_name, index_key=self.demo_key)

            # Upsert the patient vector
            item = {
                "id": patient.id,
                "vector": vector,
                "metadata": metadata
            }
            
            index.upsert([item])
            logger.info(f"Stored patient {patient.id} in {index_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store patient {patient.id}: {e}")
            raise e

    def search_institution(self, institution: str, query_vector: List[float], top_k: int = 20) -> List[Dict[str, Any]]:
        """
        Search a single institution's CyborgDB index.
        
        Used by the Privacy Aggregator to query each hospital separately.
        """
        self._ensure_connection()
        results = []
        index_name = f"rarenet_{institution}"
        
        try:
            index = self.client.load_index(index_name, index_key=self.demo_key)
            raw_results = index.query(query_vector, top_k=top_k)
            
            if raw_results:
                for match in raw_results:
                    if isinstance(match, dict):
                        match_data = match.copy()
                    else:
                        match_data = {
                            'id': getattr(match, 'id', ''),
                            'score': getattr(match, 'score', 0),
                            'metadata': getattr(match, 'metadata', {})
                        }
                    results.append(match_data)
                    
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
                index = self.client.load_index(index_name, index_key=self.demo_key)
                
                # Query the index
                results = index.query(query_vector, top_k=top_k)
                
                # Process results
                if results:
                    for match in results:
                        # Handle both dict and object responses
                        if isinstance(match, dict):
                            match_data = match.copy()
                        else:
                            match_data = {
                                'id': getattr(match, 'id', ''),
                                'score': getattr(match, 'score', 0),
                                'metadata': getattr(match, 'metadata', {})
                            }
                        
                        match_data['source_institution'] = institution
                        all_results.append(match_data)
                        
                logger.info(f"Found {len(results) if results else 0} results from {institution}")
                        
            except Exception as e:
                logger.warning(f"Search failed for {index_name}: {e}")

        # Sort by score (higher is better) and return top_k
        all_results.sort(key=lambda x: x.get('score', 0), reverse=True)
        return all_results[:top_k]

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the stored data."""
        self._ensure_connection()
        total = 0
        stats_by_institution = {}
        
        for institution in self.institutions:
            index_name = f"rarenet_{institution}"
            try:
                index = self.client.load_index(index_name, index_key=self.demo_key)
                # Try to get count if available
                count = getattr(index, 'count', lambda: 0)()
                stats_by_institution[institution] = count
                total += count
            except Exception as e:
                logger.warning(f"Could not get stats for {index_name}: {e}")
                stats_by_institution[institution] = 0
        
        return {
            "total": total,
            "by_institution": stats_by_institution
        }

# Singleton instance
cyborg_service = CyborgService()
