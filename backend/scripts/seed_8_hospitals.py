"""
8-Hospital Privacy-Focused Seeding Script for RareNet

This script populates all 8 hospitals with synthetic patient data designed
to test the privacy guarantees while maintaining global coverage.

Distribution:
- 146 total cases across 8 hospitals
- 5 rare diseases (Ehlers-Danlos, Kawasaki, Cystic Fibrosis, TREX1 Lupus, Stiff Person Syndrome)
- Ghost case (Stiff Person Syndrome) only in Boston for K-anonymity testing
"""

import os
import sys
import random
import logging
import uuid

from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from app.models import Patient
from app.services.cyborg_service import cyborg_service

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Disease Definitions
PRIVACY_TEST_DISEASES = {
    "Ehlers-Danlos Syndrome": {
        "symptoms": [
            "joint hypermobility",
            "skin hyperextensibility", 
            "tissue fragility",
            "easy bruising",
            "chronic pain",
            "joint dislocations",
            "stretchy skin",
            "poor wound healing",
            "fatigue",
            "digestive issues"
        ],
        "description": "Connective tissue disorder affecting joints and skin"
    },
    "Kawasaki Disease": {
        "symptoms": [
            "prolonged fever",
            "strawberry tongue",
            "red cracked lips",
            "conjunctivitis",
            "skin rash",
            "swollen lymph nodes",
            "peeling skin on fingers",
            "irritability",
            "red palms and soles",
            "joint pain"
        ],
        "description": "Acute vasculitis primarily affecting children"
    },
    "Cystic Fibrosis": {
        "symptoms": [
            "chronic cough",
            "thick mucus production",
            "recurrent lung infections",
            "difficulty breathing",
            "poor weight gain",
            "salty-tasting skin",
            "digestive problems",
            "nasal polyps",
            "clubbing of fingers",
            "male infertility"
        ],
        "description": "Genetic disorder affecting lungs and digestive system"
    },
    "TREX1 Lupus": {
        "symptoms": [
            "chilblain lesions",
            "raynaud phenomenon",
            "skin ulcers",
            "joint pain",
            "chronic fatigue",
            "photosensitivity",
            "recurrent fevers",
            "fingertip ulcers",
            "autoimmune symptoms",
            "neurological issues"
        ],
        "description": "Rare genetic interferonopathy with lupus-like features"
    },
    "Stiff Person Syndrome": {
        "symptoms": [
            "progressive muscle rigidity",
            "painful muscle spasms",
            "stiffness in trunk muscles",
            "exaggerated startle response",
            "difficulty walking",
            "anxiety",
            "phobias",
            "autonomic dysfunction",
            "episodic spasms",
            "hyperlordosis"
        ],
        "description": "Rare neurological disorder - GHOST CASE for K-anonymity testing"
    }
}


def generate_symptom_description(disease_name: str, num_symptoms: int = 4) -> str:
    """Generate a realistic symptom description for a patient."""
    disease = PRIVACY_TEST_DISEASES.get(disease_name)
    if not disease:
        return "unknown symptoms"
    
    symptoms = disease["symptoms"]
    selected = random.sample(symptoms, min(num_symptoms, len(symptoms)))
    
    templates = [
        f"Patient presents with {', '.join(selected)}.",
        f"Chief complaints: {', '.join(selected[:2])}. Additional findings: {', '.join(selected[2:])}.",
        f"History of {selected[0]} with progressive {', '.join(selected[1:])}.",
        f"Chronic {selected[0]}, accompanied by {', '.join(selected[1:])}."
    ]
    
    return random.choice(templates)


def seed_institution(institution_id: str, disease_counts: dict):
    """
    Seed a single institution with patient data.
    
    Args:
        institution_id: Hospital identifier
        disease_counts: Dict mapping disease name to number of patients
    """
    logger.info(f"Seeding {institution_id}...")
    
    # Ensure index exists
    cyborg_service.create_institution_index(institution_id)
    
    total_patients = 0
    
    for disease, count in disease_counts.items():
        logger.info(f"  Creating {count} patients with {disease}")
        
        for i in range(count):
            patient_id = str(uuid.uuid4())
            symptoms = generate_symptom_description(disease, num_symptoms=random.randint(3, 6))
            
            patient = Patient(
                id=patient_id,
                institution_id=institution_id,
                symptoms=symptoms,
                diagnosis=disease,
                demographics={
                    "age": random.randint(5, 75),
                    "gender": random.choice(["M", "F"]),
                }
            )
            
            # Vectorize and store
            vector = model.encode(symptoms).tolist()
            
            try:
                cyborg_service.store_patient(patient, vector)
                total_patients += 1
            except Exception as e:
                logger.error(f"Failed to store patient: {e}")
    
    logger.info(f"  Completed {institution_id}: {total_patients} patients stored")
    return total_patients


def run_8_hospital_seed():
    """
    Seed all 8 hospitals with privacy-test-focused data distribution.
    
    Total: 146 cases across 8 hospitals
    Ghost Case: Stiff Person Syndrome only in Boston (2 cases, K < 5)
    """
    logger.info("=" * 60)
    logger.info("RareNet 8-Hospital Privacy-Focused Data Seeding")
    logger.info("=" * 60)
    
    # Hospital configurations
    hospitals = {
        "mumbai": {
            "Ehlers-Danlos Syndrome": 6,
            "Kawasaki Disease": 10,
            "Cystic Fibrosis": 2,
            "TREX1 Lupus": 2,
        },
        "boston": {
            "Ehlers-Danlos Syndrome": 6,
            "Kawasaki Disease": 2,
            "Cystic Fibrosis": 6,
            "TREX1 Lupus": 5,
            "Stiff Person Syndrome": 2,  # GHOST CASE - only exists here!
        },
        "london": {
            "Ehlers-Danlos Syndrome": 6,
            "Kawasaki Disease": 2,
            "Cystic Fibrosis": 6,
            "TREX1 Lupus": 5,
        },
        "tokyo": {
            "Ehlers-Danlos Syndrome": 5,
            "Kawasaki Disease": 8,
            "Cystic Fibrosis": 3,
            "TREX1 Lupus": 2,
        },
        "singapore": {
            "Ehlers-Danlos Syndrome": 5,
            "Kawasaki Disease": 6,
            "Cystic Fibrosis": 3,
            "TREX1 Lupus": 3,
        },
        "toronto": {
            "Ehlers-Danlos Syndrome": 6,
            "Kawasaki Disease": 2,
            "Cystic Fibrosis": 5,
            "TREX1 Lupus": 4,
        },
        "sao_paulo": {
            "Ehlers-Danlos Syndrome": 5,
            "Kawasaki Disease": 3,
            "Cystic Fibrosis": 5,
            "TREX1 Lupus": 4,
        },
        "berlin": {
            "Ehlers-Danlos Syndrome": 6,
            "Kawasaki Disease": 2,
            "Cystic Fibrosis": 5,
            "TREX1 Lupus": 4,
        }
    }
    
    total = 0
    for hospital_id, diseases in hospitals.items():
        total += seed_institution(hospital_id, diseases)
    
    logger.info("=" * 60)
    logger.info(f"Seeding Complete: {total} total patients")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Disease Distribution:")
    logger.info("-" * 40)
    
    # Calculate totals
    disease_totals = {}
    for diseases in hospitals.values():
        for disease, count in diseases.items():
            disease_totals[disease] = disease_totals.get(disease, 0) + count
    
    for disease, count in sorted(disease_totals.items(), key=lambda x: x[1], reverse=True):
        logger.info(f"  {disease}: {count} cases")
    
    logger.info("")
    logger.info("Privacy Test Scenarios:")
    logger.info("-" * 40)
    logger.info("1. SHOULD PASS (K >= 5):")
    logger.info("   - 'joint hypermobility, stretchy skin, easy bruising'")
    logger.info(f"     -> Ehlers-Danlos ({disease_totals.get('Ehlers-Danlos Syndrome', 0)} cases across all hospitals)")
    logger.info("")
    logger.info("   - 'strawberry tongue, fever, rash'")
    logger.info(f"     -> Kawasaki Disease ({disease_totals.get('Kawasaki Disease', 0)} cases)")
    logger.info("")
    logger.info("   - 'chronic cough, thick mucus, lung infections'")
    logger.info(f"     -> Cystic Fibrosis ({disease_totals.get('Cystic Fibrosis', 0)} cases)")
    logger.info("")
    logger.info("   - 'chilblain lesions, raynaud phenomenon, joint pain'")
    logger.info(f"     -> TREX1 Lupus ({disease_totals.get('TREX1 Lupus', 0)} cases)")
    logger.info("")
    logger.info("2. SHOULD BE BLOCKED (K < 5 - Ghost Case):")
    logger.info("   - 'muscle rigidity, spasms, stiffness, startle response'")
    logger.info(f"     -> Stiff Person Syndrome (only {disease_totals.get('Stiff Person Syndrome', 0)} cases in Boston)")
    logger.info("     -> K-Anonymity should BLOCK this result!")
    logger.info("")


if __name__ == "__main__":
    run_8_hospital_seed()
