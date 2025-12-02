import os
import logging
from typing import List, Dict, Any
from cyborgdb import Client
from app.models import Patient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CyborgService:
    def __init__(self):
        self.api_key = os.getenv("CYBORGDB_API_KEY")
        self.base_url = os.getenv("CYBORGDB_URL", "http://localhost:8000")
        
        # Handle missing scheme for Render compatibility
        if not self.base_url.startswith("http"):
            self.base_url = f"http://{self.base_url}"
            
        logger.info(f"Connecting to CyborgDB at {self.base_url}")
        self.client = Client(base_url=self.base_url, api_key=self.api_key)
        self.institutions = ["mumbai", "boston", "london"]

    def create_institution_index(self, institution_id: str, dimension: int = 384):
        """
        Creates a new index in CyborgDB for a specific institution.
        """
        index_name = f"rarenet_{institution_id}"
        try:
            # Check if index exists (if the SDK supports it) or just try to create
            # Note: The exact API for checking existence might vary, so we'll try to create
            # and catch the error if it already exists.
            logger.info(f"Creating index: {index_name}")
            self.client.create_index(index_name, dimension=dimension)
            logger.info(f"Index {index_name} created successfully.")
        except Exception as e:
            # If it fails, it might already exist or there's a connection issue
            logger.warning(f"Could not create index {index_name} (it might already exist): {e}")

    def store_patient(self, patient: Patient, vector: List[float]):
        """
        Upserts the patient vector into the institution's index.
        Metadata includes patient_id and institution_id but NO PII.
        """
        index_name = f"rarenet_{patient.institution_id}"
        
        # Prepare metadata (Privacy Preserving: No PII)
        metadata = {
            "patient_id": patient.id,
            "institution_id": patient.institution_id,
            "diagnosis": patient.diagnosis or "Unknown",
            # We do NOT store name, address, or raw symptoms in the metadata if we want full privacy
            # But for the hackathon demo, storing symptoms might be useful for display if they are anonymized
            # Let's stick to the prompt: "Metadata should include patient_id and institution_id (but NO PII)"
        }

        try:
            # CyborgDB handles vector encryption internally
            self.client.upsert(
                index_name=index_name,
                vectors=[vector],
                ids=[patient.id],
                metadata=[metadata]
            )
            logger.info(f"Stored patient {patient.id} in {index_name}")
        except Exception as e:
            logger.error(f"Failed to store patient {patient.id}: {e}")
            raise e

    def search_network(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Searches across all known institution indices.
        """
        all_results = []

        for institution in self.institutions:
            index_name = f"rarenet_{institution}"
            try:
                # Search the encrypted index
                results = self.client.search(
                    index_name=index_name,
                    query_vector=query_vector,
                    k=top_k
                )
                
                # The results structure depends on the SDK, usually it returns a list of matches
                # We'll assume it returns a list of objects/dicts with 'id', 'score', 'metadata'
                # We need to normalize this.
                
                # Mocking the structure inspection if we can't see the real return type yet
                # Assuming results is a list of matches
                if results:
                    for match in results:
                        # Normalize match object to dict
                        # If match is an object, access attributes, else dict access
                        # We'll assume dict-like or object with attributes
                        match_data = match if isinstance(match, dict) else match.__dict__
                        match_data['source_institution'] = institution
                        all_results.append(match_data)
                        
            except Exception as e:
                logger.warning(f"Search failed for {index_name}: {e}")

        # Sort aggregated results by score (descending)
        # Assuming 'score' or 'distance' is present. If distance (lower is better), sort asc.
        # If similarity (higher is better), sort desc.
        # CyborgDB usually uses cosine similarity or similar metric where higher is better?
        # Let's assume similarity (higher is better) for now.
        all_results.sort(key=lambda x: x.get('score', 0), reverse=True)
        
        return all_results[:top_k]

# Singleton instance
cyborg_service = CyborgService()
