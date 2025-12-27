"""Quick seed script - minimal dependencies"""
import requests
import json

# Login as admin to get token
login_response = requests.post(
    "http://localhost:8001/auth/login",
    json={
        "email": "doctor@mumbai.hospital",
        "password": "password123"
    }
)
print(f"Login response: {login_response.status_code}")
if login_response.status_code != 200:
    print(f"Login failed: {login_response.text}")
    exit(1)
token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("Logged in successfully!")

# Initialize hospital indexes first
print("\nInitializing hospital indexes...")
try:
    init_response = requests.post("http://localhost:8001/api/init", headers=headers)
    if init_response.status_code == 200:
        print("✓ Indexes initialized")
    else:
        print(f"⚠ Init returned {init_response.status_code}: {init_response.text[:100]}")
        print("  Continuing anyway (indexes may already exist)...")
except Exception as e:
    print(f"⚠ Init error: {str(e)[:100]}")
    print("  Continuing anyway...")

# Sample patients with common symptoms
patients = [
    # Ehlers-Danlos Syndrome cases - need at least 5 for K-anonymity
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "joint hypermobility, easy bruising, stretchy skin, thin skin, arterial rupture risk", "age": 32, "sex": "F"},
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "joint pain, skin hyperextensibility, easy bruising, vascular fragility", "age": 28, "sex": "M"},
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "hypermobile joints, thin translucent skin, easy bruising, spontaneous arterial rupture", "age": 35, "sex": "F"},
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "joint instability, stretchy elastic skin, frequent bruising, vascular complications", "age": 41, "sex": "M"},
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "flexible joints, paper-thin skin, bruising easily, risk of arterial dissection", "age": 29, "sex": "F"},
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "joint laxity, skin extensibility, easy bruising, fragile blood vessels", "age": 38, "sex": "M"},
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "hypermobile joints, thin skin, easy bruising, vascular issues", "age": 33, "sex": "F"},
    {"diagnosis": "Ehlers-Danlos Syndrome (Vascular Type)", "symptoms": "joint flexibility, stretchy skin, frequent bruising, arterial fragility", "age": 36, "sex": "M"},
    
    # Kawasaki Disease cases
    {"diagnosis": "Kawasaki Disease", "symptoms": "high fever, red eyes, swollen lymph nodes, rash, red lips, strawberry tongue", "age": 4, "sex": "M"},
    {"diagnosis": "Kawasaki Disease", "symptoms": "persistent fever over 5 days, bilateral conjunctivitis, cervical lymphadenopathy, polymorphous rash", "age": 3, "sex": "F"},
    {"diagnosis": "Kawasaki Disease", "symptoms": "prolonged fever, red swollen hands, peeling skin on fingers, red cracked lips", "age": 5, "sex": "M"},
    {"diagnosis": "Kawasaki Disease", "symptoms": "fever lasting days, red eyes without discharge, swollen neck glands, body rash", "age": 2, "sex": "F"},
    {"diagnosis": "Kawasaki Disease", "symptoms": "high temperature, irritability, red tongue, swollen lymph nodes, rash on trunk", "age": 4, "sex": "M"},
    {"diagnosis": "Kawasaki Disease", "symptoms": "fever over 102F, conjunctival injection, oral changes, extremity changes, rash", "age": 6, "sex": "F"},
    {"diagnosis": "Kawasaki Disease", "symptoms": "persistent high fever, red eyes, strawberry tongue, swollen neck nodes", "age": 3, "sex": "M"},
    
    # Marfan Syndrome cases
    {"diagnosis": "Marfan Syndrome", "symptoms": "tall stature, long limbs, aortic dilation, lens dislocation, pectus excavatum", "age": 25, "sex": "M"},
    {"diagnosis": "Marfan Syndrome", "symptoms": "unusually tall, arm span exceeds height, mitral valve prolapse, eye lens problems", "age": 30, "sex": "F"},
    {"diagnosis": "Marfan Syndrome", "symptoms": "elongated fingers, chest wall deformity, flexible joints, aortic root enlargement", "age": 28, "sex": "M"},
    {"diagnosis": "Marfan Syndrome", "symptoms": "long thin body, scoliosis, aortic aneurysm, ectopia lentis, joint hypermobility", "age": 32, "sex": "F"},
    {"diagnosis": "Marfan Syndrome", "symptoms": "disproportionate height, spinal curvature, heart valve issues, dislocated lens", "age": 27, "sex": "M"},
    {"diagnosis": "Marfan Syndrome", "symptoms": "tall thin build, long fingers and toes, aortic complications, vision problems", "age": 35, "sex": "F"},
]

print(f"\nSeeding {len(patients)} cases...")
success_count = 0
error_count = 0

for i, patient_data in enumerate(patients, 1):
    # Map age to age range
    age = patient_data["age"]
    if age <= 18:
        age_range = "0-18"
    elif age <= 40:
        age_range = "19-40"
    elif age <= 60:
        age_range = "41-60"
    else:
        age_range = "60+"
    
    payload = {
        "symptoms": patient_data["symptoms"],
        "diagnosis": patient_data["diagnosis"],
        "patient_age_range": age_range,
        "patient_sex": patient_data["sex"]
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/report",
            headers=headers,
            json=payload
        )
        if response.status_code == 200:
            success_count += 1
            disease_short = patient_data['diagnosis'][:35]
            print(f"✓ Case {i}/{len(patients)}: {disease_short}")
        else:
            error_count += 1
            print(f"✗ Case {i}/{len(patients)}: HTTP {response.status_code}")
            print(f"   {response.text[:150]}")
    except Exception as e:
        error_count += 1
        print(f"✗ Case {i}/{len(patients)}: {str(e)[:100]}")

print(f"\n{'='*50}")
print(f"Seeding complete!")
print(f"Success: {success_count}/{len(patients)}")
print(f"Errors: {error_count}")
print(f"{'='*50}\n")
print("Now try searching for symptoms like:")
print("  'joint hypermobility, easy bruising, stretchy skin'")
print("  'high fever, red eyes, swollen lymph nodes, rash'")

import random
