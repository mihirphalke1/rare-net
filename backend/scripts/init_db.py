#!/usr/bin/env python3
"""
RareNet Database Initialization Script

Seeds CyborgDB with synthetic patient cases for demo purposes.
Creates 300+ cases distributed across 8 hospital nodes globally.

Hospitals:
- Asia: Mumbai, Tokyo, Singapore
- Americas: Boston, Toronto, São Paulo
- Europe: London, Berlin

Diseases seeded:
- Ehlers-Danlos Syndrome (80 cases) - should pass K-anonymity
- Kawasaki Disease (70 cases) - should pass K-anonymity  
- TREX1 Lupus (40 cases) - should pass K-anonymity
- Pompe Disease (30 cases) - should pass K-anonymity
- Gaucher Disease (30 cases) - should pass K-anonymity
- Marfan Syndrome (25 cases) - should pass K-anonymity
- Wilson's Disease (20 cases) - should pass K-anonymity
- Fabry Disease (15 cases) - should pass K-anonymity
- Stiff Person Syndrome (3 cases) - GHOST CASE, should be BLOCKED
- Progeria (2 cases) - GHOST CASE, should be BLOCKED

Usage:
    python scripts/init_db.py
"""

import os
import sys
import random
import uuid
from datetime import datetime
from typing import Dict, List

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from sentence_transformers import SentenceTransformer
from app.models import Patient
from app.services.cyborg_service import cyborg_service
from app.services.stats_service import stats_service
from app.rare_diseases import RARE_DISEASES

# Initialize model
print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded!")

# Global Hospitals (8 nodes)
HOSPITALS = [
    "mumbai",      # Asia
    "tokyo",       # Asia
    "singapore",   # Asia
    "boston",      # Americas
    "toronto",     # Americas
    "sao_paulo",   # Americas
    "london",      # Europe
    "berlin"       # Europe
]

# Case distribution configuration - 315 total cases
CASE_DISTRIBUTION = {
    # Major diseases - should always pass K-anonymity
    "Ehlers-Danlos Syndrome (Vascular Type)": {
        "mumbai": 12, "tokyo": 10, "singapore": 8,
        "boston": 15, "toronto": 10, "sao_paulo": 8,
        "london": 10, "berlin": 7
    },
    "Kawasaki Disease": {
        "mumbai": 10, "tokyo": 15, "singapore": 8,
        "boston": 10, "toronto": 8, "sao_paulo": 6,
        "london": 7, "berlin": 6
    },
    "TREX1 Lupus (Aicardi-Goutières Syndrome)": {
        "mumbai": 6, "tokyo": 5, "singapore": 4,
        "boston": 8, "toronto": 5, "sao_paulo": 4,
        "london": 5, "berlin": 3
    },
    "Pompe Disease": {
        "mumbai": 4, "tokyo": 4, "singapore": 3,
        "boston": 5, "toronto": 4, "sao_paulo": 3,
        "london": 4, "berlin": 3
    },
    "Gaucher Disease": {
        "mumbai": 4, "tokyo": 3, "singapore": 3,
        "boston": 6, "toronto": 4, "sao_paulo": 3,
        "london": 4, "berlin": 3
    },
    "Marfan Syndrome": {
        "mumbai": 3, "tokyo": 3, "singapore": 2,
        "boston": 5, "toronto": 3, "sao_paulo": 3,
        "london": 4, "berlin": 2
    },
    "Wilson's Disease": {
        "mumbai": 3, "tokyo": 2, "singapore": 2,
        "boston": 4, "toronto": 3, "sao_paulo": 2,
        "london": 2, "berlin": 2
    },
    "Fabry Disease": {
        "mumbai": 2, "tokyo": 2, "singapore": 1,
        "boston": 3, "toronto": 2, "sao_paulo": 1,
        "london": 2, "berlin": 2
    },
    # Ghost cases - should be BLOCKED by K-anonymity (< 5 total)
    "Progeria (Hutchinson-Gilford Syndrome)": {
        "mumbai": 0, "tokyo": 1, "singapore": 0,
        "boston": 1, "toronto": 0, "sao_paulo": 0,
        "london": 0, "berlin": 0
    },
    "Fibrodysplasia Ossificans Progressiva (FOP)": {
        "mumbai": 1, "tokyo": 0, "singapore": 0,
        "boston": 0, "toronto": 1, "sao_paulo": 0,
        "london": 1, "berlin": 0
    }
}

# Demographics options
AGE_RANGES = ["0-18", "19-40", "41-60", "60+"]
SEXES = ["M", "F", "Other"]


def generate_symptom_text(disease_name: str) -> str:
    """Generate realistic symptom text for a disease."""
    disease_info = RARE_DISEASES.get(disease_name, {})
    symptoms = disease_info.get("symptoms", [])
    
    if not symptoms or len(symptoms) == 0:
        symptoms = ["fatigue", "weakness", "general malaise"]
    
    # Select 2-5 random symptoms (handle small symptom lists)
    min_symptoms = min(2, len(symptoms))
    max_symptoms = min(5, len(symptoms))
    num_symptoms = random.randint(min_symptoms, max_symptoms)
    selected = random.sample(symptoms, num_symptoms)
    
    # Add some natural variation
    if len(selected) == 1:
        return selected[0]
    
    variations = [
        ", ".join(selected),
        " and ".join(selected[:-1]) + f", with {selected[-1]}",
        f"presenting with {', '.join(selected)}",
        f"patient exhibits {', '.join(selected)}"
    ]
    
    return random.choice(variations)


def generate_demographics() -> Dict:
    """Generate random patient demographics."""
    return {
        "age_range": random.choice(AGE_RANGES),
        "sex": random.choice(SEXES),
        "admission_year": random.randint(2020, 2024)
    }


def seed_cases():
    """Seed all cases into CyborgDB."""
    print("\n" + "="*60)
    print("RareNet Database Initialization")
    print("="*60)
    
    # Step 1: Initialize indexes for all hospitals
    print("\n[Step 1] Initializing CyborgDB indexes for 8 hospitals...")
    for hospital in HOSPITALS:
        try:
            cyborg_service.create_institution_index(hospital)
            print(f"  ✓ {hospital.replace('_', ' ').title()} index ready")
        except Exception as e:
            print(f"  ✗ {hospital} index error: {e}")
    
    # Step 2: Seed cases
    print("\n[Step 2] Seeding patient cases...")
    
    total_cases = 0
    cases_by_hospital = {h: 0 for h in HOSPITALS}
    cases_by_disease = {}
    
    for disease_name, distribution in CASE_DISTRIBUTION.items():
        print(f"\n  Disease: {disease_name}")
        disease_cases = 0
        
        for hospital, count in distribution.items():
            if count == 0:
                continue
                
            for i in range(count):
                # Generate case
                case_id = f"seed-{uuid.uuid4().hex[:8]}"
                symptoms = generate_symptom_text(disease_name)
                demographics = generate_demographics()
                demographics["seeded"] = True
                demographics["seed_date"] = datetime.utcnow().isoformat()
                
                patient = Patient(
                    id=case_id,
                    institution_id=hospital,
                    symptoms=symptoms,
                    diagnosis=disease_name,
                    demographics=demographics
                )
                
                # Vectorize and store
                vector = model.encode(symptoms).tolist()
                
                try:
                    cyborg_service.store_patient(patient, vector)
                    total_cases += 1
                    cases_by_hospital[hospital] += 1
                    disease_cases += 1
                except Exception as e:
                    print(f"    ✗ Error storing case: {e}")
            
            if count > 0:
                print(f"    → {hospital.replace('_', ' ').title()}: {count} cases")
        
        cases_by_disease[disease_name] = disease_cases
    
    # Step 3: Update stats
    print("\n[Step 3] Updating network statistics...")
    stats_service.initialize(total_cases, cases_by_hospital, cases_by_disease)
    
    # Summary
    print("\n" + "="*60)
    print("Seeding Complete!")
    print("="*60)
    print(f"\nTotal cases: {total_cases}")
    
    print(f"\nBy Hospital:")
    for hospital, count in sorted(cases_by_hospital.items(), key=lambda x: -x[1]):
        print(f"  {hospital.replace('_', ' ').title()}: {count} cases")
    
    print(f"\nBy Disease:")
    for disease, count in sorted(cases_by_disease.items(), key=lambda x: -x[1]):
        status = "✓ Should PASS" if count >= 5 else "✗ Should BLOCK (K-anon)"
        print(f"  {disease}: {count} cases - {status}")
    
    print("\n" + "="*60)
    print("Demo Test Scenarios:")
    print("="*60)
    print("""
1. PASS SCENARIO - Search for Ehlers-Danlos:
   Query: "joint hypermobility, stretchy skin, easy bruising"
   Expected: Diagnosis with confidence score
   
2. PASS SCENARIO - Search for Kawasaki Disease:
   Query: "strawberry tongue, high fever, rash, conjunctivitis"
   Expected: Diagnosis with confidence score

3. PASS SCENARIO - Search for Pompe Disease:
   Query: "muscle weakness, respiratory difficulty, enlarged heart"
   Expected: Diagnosis with confidence score

4. BLOCK SCENARIO - Search for rare disease (< 5 cases):
   Query: "severe growth retardation, premature aging, alopecia"
   Expected: "Privacy Protection Active" - K-anonymity block

5. INVALID SCENARIO - Random words:
   Query: "hello world meow"
   Expected: "Invalid Query" - validation failure
""")


if __name__ == "__main__":
    seed_cases()
