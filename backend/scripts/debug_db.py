import os
import sys
import logging
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from app.services.cyborg_service import cyborg_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def debug_db():
    logger.info("Debugging CyborgDB Indices...")
    try:
        # List all indices
        indices = cyborg_service.client.list_indexes()
        logger.info(f"Found indices: {indices}")
        
        demo_key_hex = "0000000000000000000000000000000000000000000000000000000000000001"
        key = bytes.fromhex(demo_key_hex)

        for index_name in indices:
            if index_name.startswith("rarenet_"):
                try:
                    logger.info(f"Inspecting index: {index_name}")
                    index = cyborg_service.client.load_index(index_name, index_key=key)
                    # Note: There isn't a direct 'count' method usually, but we can try to search or list items if supported
                    # Or just try a dummy search
                    dummy_vector = [0.0] * 384
                    results = index.query(dummy_vector, top_k=1)
                    logger.info(f"Index {index_name} is accessible. Dummy search result count: {len(results) if results else 0}")
                except Exception as e:
                    logger.error(f"Failed to inspect {index_name}: {e}")
                
        logger.info("Debug complete.")
    except Exception as e:
        logger.error(f"Failed to debug DB: {e}")

if __name__ == "__main__":
    debug_db()
