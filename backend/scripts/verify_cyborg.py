import os
import sys
from cyborgdb import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

CYBORGDB_URL = os.getenv("CYBORGDB_URL", "http://localhost:8000")
if not CYBORGDB_URL.startswith("http"):
    CYBORGDB_URL = f"http://{CYBORGDB_URL}"
CYBORGDB_API_KEY = os.getenv("CYBORGDB_API_KEY", "rare-net-secret-key")

def verify_connection():
    print(f"Attempting to connect to CyborgDB at {CYBORGDB_URL}...")
    
    try:
        client = Client(base_url=CYBORGDB_URL, api_key=CYBORGDB_API_KEY)
        # Try to perform a simple operation to verify connectivity
        # Since specific health check methods might vary, we'll try to list indices or just instantiate
        # If the service is down, the client might not error immediately until a request is made.
        # Let's try to create a dummy index or list them if the SDK supports it.
        # Based on docs, we might not have a direct 'list_indices' exposed easily without parameters.
        # We will try to hit the health endpoint using standard requests as a fallback/pre-check
        import requests
        health_resp = requests.get(f"{CYBORGDB_URL}/v1/health")
        if health_resp.status_code == 200:
            print("✅ CyborgDB Service Health Check Passed!")
        else:
            print(f"⚠️ CyborgDB Service Health Check returned {health_resp.status_code}")

        print("✅ CyborgDB Client initialized successfully.")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to CyborgDB: {e}")
        print("Ensure that Docker is running and the cyborgdb service is up.")
        return False

if __name__ == "__main__":
    if verify_connection():
        sys.exit(0)
    else:
        sys.exit(1)
