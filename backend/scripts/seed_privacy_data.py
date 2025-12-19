"""
Privacy-Focused Data Seeding Script for RareNet

This script populates the CyborgDB with synthetic patient data designed
to test the privacy guarantees of the Trusted Aggregator Pattern:

1. Common diseases spread across all institutions (should PASS K-anonymity)
2. One "Ghost Case" - a unique rare disease in only one hospital (should be BLOCKED)

Run this script to set up the database for privacy testing.
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

# ============================================
# Disease Definitions for Privacy Testing
# ============================================

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
    # GHOST CASE: This disease will only exist in ONE hospital
    # Queries for it should be BLOCKED by K-anonymity
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
        institution_id: Hospital identifier (mumbai, boston, london)
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


def run_privacy_seed():
    """
    Main seeding function with privacy-test-focused data distribution.
    
    Distribution Strategy:
    - EDS: Common across ALL hospitals (should PASS K-anonymity)
    - Kawasaki: Concentrated in Mumbai (should PASS with cross-institution)
    - CF: Spread across Boston/London (should PASS)
    - TREX1: Spread across Boston/London (should PASS)
    - Stiff Person Syndrome: ONLY in Boston (should be BLOCKED - Ghost Case)
    """
    logger.info("=" * 60)
    logger.info("RareNet Privacy-Focused Data Seeding")
    logger.info("=" * 60)
    
    # Mumbai: EDS + Kawasaki focus
    mumbai_diseases = {
        "Ehlers-Danlos Syndrome": 15,
        "Kawasaki Disease": 25,
        "Cystic Fibrosis": 5,
        "TREX1 Lupus": 5,
        # NO Stiff Person Syndrome
    }
    
    # Boston: EDS + CF + TREX1 + GHOST CASE
    boston_diseases = {
        "Ehlers-Danlos Syndrome": 15,
        "Kawasaki Disease": 5,
        "Cystic Fibrosis": 15,
        "TREX1 Lupus": 12,
        "Stiff Person Syndrome": 2,  # GHOST CASE - only exists here!
    }
    
    # London: EDS + CF + TREX1
    london_diseases = {
        "Ehlers-Danlos Syndrome": 15,
        "Kawasaki Disease": 5,
        "Cystic Fibrosis": 15,
        "TREX1 Lupus": 12,
        # NO Stiff Person Syndrome
    }
    
    total = 0
    total += seed_institution("mumbai", mumbai_diseases)
    total += seed_institution("boston", boston_diseases)
    total += seed_institution("london", london_diseases)
    
    logger.info("=" * 60)
    logger.info(f"Seeding Complete: {total} total patients")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Privacy Test Scenarios:")
    logger.info("-" * 40)
    logger.info("1. SHOULD PASS (K >= 5):")
    logger.info("   - 'joint hypermobility, stretchy skin, easy bruising'")
    logger.info("     -> Ehlers-Danlos (45 cases across all hospitals)")
    logger.info("")
    logger.info("   - 'strawberry tongue, fever, rash'")
    logger.info("     -> Kawasaki Disease (35 cases, mostly Mumbai)")
    logger.info("")
    logger.info("   - 'chilblain lesions, raynaud phenomenon, joint pain'")
    logger.info("     -> TREX1 Lupus (29 cases in Boston/London)")
    logger.info("")
    logger.info("2. SHOULD BE BLOCKED (K < 5 - Ghost Case):")
    logger.info("   - 'muscle rigidity, spasms, stiffness, startle response'")
    logger.info("     -> Stiff Person Syndrome (only 2 cases in Boston)")
    logger.info("     -> K-Anonymity should BLOCK this result!")
    logger.info("")


if __name__ == "__main__":
    run_privacy_seed()

