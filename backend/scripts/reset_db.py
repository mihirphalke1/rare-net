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

def reset_db():
    logger.info("Resetting CyborgDB Indices...")
    try:
        # List all indices
        indices = cyborg_service.client.list_indexes()
        logger.info(f"Found indices: {indices}")
        
        for index_name in indices:
            if index_name.startswith("rarenet_"):
                # Client doesn't have delete_index, but it has load_index.
                # We need to load it and then delete it?
                # Or maybe we can't delete from client?
                # Wait, if I can't delete, I can't reset.
                # Let's try to load it with the demo key (which we know now) and then see if index object has delete.
                demo_key_hex = "0000000000000000000000000000000000000000000000000000000000000001"
                key = bytes.fromhex(demo_key_hex)
                try:
                    index = cyborg_service.client.load_index(index_name, index_key=key)
                    if hasattr(index, 'delete'):
                        index.delete()
                        logger.info(f"Deleted {index_name}")
                    else:
                        logger.warning(f"Index object for {index_name} has no delete method. Methods: {dir(index)}")
                except Exception as e:
                    logger.error(f"Failed to load/delete {index_name}: {e}")
                
        logger.info("Reset complete.")
    except Exception as e:
        logger.error(f"Failed to reset DB: {e}")

if __name__ == "__main__":
    reset_db()
