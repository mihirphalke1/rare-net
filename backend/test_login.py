import requests
import json

url = "http://localhost:8001/auth/login"
data = {
    "email": "doctor@mumbai.hospital",
    "password": "password123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.ok:
        print(f"JSON: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
