"""Quick seed script - minimal dependencies"""
# -*- coding: utf-8 -*-
import requests
import json
import random
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Rotate through all 8 hospitals
hospitals = ["mumbai", "boston", "london", "tokyo", "singapore", "toronto", "sao_paulo", "berlin"]
hospital_tokens = {}

# Login to all 8 hospitals to get tokens
print("Logging in to all 8 hospitals...")
for hospital in hospitals:
    try:
        login_response = requests.post(
            "http://localhost:8001/auth/login",
            json={
                "email": f"doctor@{hospital if hospital != 'sao_paulo' else 'saopaulo'}.hospital",
                "password": "password123"
            }
        )
        if login_response.status_code == 200:
            hospital_tokens[hospital] = login_response.json()["access_token"]
            print(f"[OK] {hospital.capitalize()}")
        else:
            print(f"[FAIL] {hospital.capitalize()}: {login_response.status_code}")
    except Exception as e:
        print(f"[ERROR] {hospital.capitalize()}: {str(e)[:50]}")

if not hospital_tokens:
    print("Failed to login to any hospital!")
    exit(1)

print(f"\nSuccessfully logged into {len(hospital_tokens)} hospitals!")

# Use first available token to initialize all indexes
first_token = list(hospital_tokens.values())[0]
headers = {"Authorization": f"Bearer {first_token}"}

print("\nInitializing hospital indexes...")
try:
    init_response = requests.post("http://localhost:8001/api/init", headers=headers)
    if init_response.status_code == 200:
        print("[OK] All 8 hospital indexes initialized")
    else:
        print(f"[WARN] Init returned {init_response.status_code}: {init_response.text[:100]}")
        print("  Continuing anyway (indexes may already exist)...")
except Exception as e:
    print(f"[WARN] Init error: {str(e)[:100]}")
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

print(f"\nSeeding {len(patients)} cases across all hospitals...")
success_count = 0
error_count = 0

# Distribute cases across all hospitals
for i, patient_data in enumerate(patients, 1):
    # Round-robin distribution across hospitals
    hospital = list(hospital_tokens.keys())[i % len(hospital_tokens)]
    token = hospital_tokens[hospital]
    headers = {"Authorization": f"Bearer {token}"}
    
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
            disease_short = patient_data['diagnosis'][:25]
            hospital_short = hospital[:8]
            print(f"[OK] Case {i}/{len(patients)}: {disease_short} -> {hospital_short}")
        else:
            error_count += 1
            print(f"[FAIL] Case {i}/{len(patients)}: HTTP {response.status_code}")
            print(f"   {response.text[:150]}")
    except Exception as e:
        error_count += 1
        print(f"[ERROR] Case {i}/{len(patients)}: {str(e)[:100]}")

print(f"\n{'='*50}")
print(f"Seeding complete!")
print(f"Success: {success_count}/{len(patients)}")
print(f"Errors: {error_count}")
print(f"{'='*50}\n")
print("Now try searching for symptoms like:")
print("  'joint hypermobility, easy bruising, stretchy skin'")
print("  'high fever, red eyes, swollen lymph nodes, rash'")

import random
