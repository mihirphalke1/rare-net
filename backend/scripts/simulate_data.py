import os
import sys
import random
import logging
import uuid
from typing import List
from faker import Faker
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Add backend directory to sys.path to import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from app.models import Patient
from app.services.cyborg_service import cyborg_service
from app.rare_diseases import RARE_DISEASES, generate_symptom_text

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Faker and Model
fake = Faker()
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_symptoms(disease_name: str) -> str:
    """Generates a symptom description based on the disease profile."""
    disease_info = RARE_DISEASES.get(disease_name)
    if not disease_info:
        return "unknown symptoms"
    
    base_symptoms = disease_info["symptoms"]
    # Pick 3-6 random symptoms
    num_symptoms = random.randint(3, min(6, len(base_symptoms)))
    selected = random.sample(base_symptoms, k=num_symptoms)
    
    # Add some variation and context
    templates = [
        f"Patient presents with {', '.join(selected)}.",
        f"Chief complaints include {', '.join(selected[:2])}. Also noted: {', '.join(selected[2:])}.",
        f"History of {selected[0]} and {selected[1]}. Currently experiencing {', '.join(selected[2:])}.",
        f"Progressive {selected[0]} with concurrent {', '.join(selected[1:])}.",
    ]
    
    description = random.choice(templates)
    
    # Add onset information occasionally
    if random.random() > 0.5:
        onset = disease_info.get("onset", "")
        if onset:
            description += f" Onset: {onset}."
    
    return description

def simulate_institution(institution_id: str, count: int, disease_weights: dict):
    """Generates and stores patients for an institution."""
    logger.info(f"Starting simulation for {institution_id} with {count} records...")
    
    # Ensure index exists
    cyborg_service.create_institution_index(institution_id)
    
    # Filter to only use diseases we have weights for
    population = [d for d in disease_weights.keys() if d in RARE_DISEASES]
    weights = [disease_weights[d] for d in population]
    
    if not population:
        logger.error(f"No valid diseases found for {institution_id}")
        return
    
    for i in range(count):
        disease = random.choices(population, weights=weights, k=1)[0]
        
        # Generate data
        patient_id = str(uuid.uuid4())
        symptoms = generate_symptoms(disease)
        
        # Create Patient Object
        patient = Patient(
            id=patient_id,
            institution_id=institution_id,
            symptoms=symptoms,
            diagnosis=disease,
            demographics={
                "age": random.randint(1, 90),
                "gender": random.choice(["M", "F", "Other"]),
                "city": fake.city()
            }
        )
        
        # Vectorize
        vector = model.encode(symptoms).tolist()
        
        # Store
        try:
            cyborg_service.store_patient(patient, vector)
            if (i + 1) % 10 == 0:
                logger.info(f"Stored {i + 1}/{count} patients for {institution_id}")
        except Exception as e:
            logger.error(f"Failed to store patient {patient_id}: {e}")

def run_simulation():
    logger.info("=" * 60)
    logger.info("Initializing RareNet Simulation with Real Rare Diseases...")
    logger.info("=" * 60)
    
    # Disease distribution by institution (simulating real-world clusters)
    
    # 1. Mumbai General Hospital
    # Focus: High Gaucher (common in certain populations), Kawasaki (common in Asia)
    # NO TREX1 cases (for the demo scenario)
    mumbai_weights = {
        "Kawasaki Disease": 0.30,
        "Gaucher Disease": 0.25,
        "Fabry Disease": 0.15,
        "Wilson Disease": 0.10,
        "Pompe Disease": 0.10,
        "Phenylketonuria (PKU)": 0.10,
    }
    simulate_institution("mumbai", 40, mumbai_weights)
    
    # 2. Boston Children's Hospital
    # Focus: Strong genetics/autoimmune center - high TREX1, FOP
    boston_weights = {
        "TREX1 Lupus (Aicardi-Goutières Syndrome)": 0.35,
        "Fibrodysplasia Ossificans Progressiva (FOP)": 0.15,
        "Progeria (Hutchinson-Gilford Syndrome)": 0.15,
        "Ehlers-Danlos Syndrome (Vascular Type)": 0.10,
        "Marfan Syndrome": 0.10,
        "Cystic Fibrosis": 0.15,
    }
    simulate_institution("boston", 40, boston_weights)
    
    # 3. London University College Hospital
    # Focus: Metabolic/neurological disorders + TREX1
    london_weights = {
        "TREX1 Lupus (Aicardi-Goutières Syndrome)": 0.25,
        "Niemann-Pick Disease Type C": 0.20,
        "Huntington Disease": 0.15,
        "Alport Syndrome": 0.15,
        "Wilson Disease": 0.10,
        "Fabry Disease": 0.15,
    }
    simulate_institution("london", 40, london_weights)
    
    # 4. Create the "Ghost Patient" in Mumbai
    # This patient has TREX1 symptoms but hasn't been diagnosed yet
    # The demo shows how searching their symptoms finds matches in Boston/London
    logger.info("=" * 60)
    logger.info("Creating the Ghost Patient in Mumbai...")
    logger.info("=" * 60)
    
    ghost_symptoms = """
    Severe chilblain lesions on fingers and toes, persistent raynaud phenomenon 
    with color changes in cold weather, unexplained chronic fatigue and joint pain. 
    Recurrent fevers of unknown origin. Photosensitivity noted. 
    Standard lupus markers (ANA, anti-dsDNA) are negative.
    """
    
    ghost_patient = Patient(
        id="ghost-patient-001",
        institution_id="mumbai",
        symptoms=ghost_symptoms.strip(),
        diagnosis=None,  # Undiagnosed!
        demographics={"age": 7, "gender": "F", "city": "Mumbai"}
    )
    
    ghost_vector = model.encode(ghost_symptoms).tolist()
    cyborg_service.store_patient(ghost_patient, ghost_vector)
    logger.info("Ghost Patient stored successfully.")
    
    # Create a few more undiagnosed patients for realism
    undiagnosed_cases = [
        {
            "symptoms": "Progressive muscle weakness, difficulty climbing stairs, respiratory issues, enlarged heart on imaging",
            "institution": "mumbai",
            "age": 3
        },
        {
            "symptoms": "Burning pain in hands and feet, reduced sweating, small reddish spots on skin, kidney problems",
            "institution": "london", 
            "age": 28
        },
        {
            "symptoms": "Tall stature, very long fingers, chest deformity, eye problems with lens issues",
            "institution": "boston",
            "age": 14
        }
    ]
    
    for i, case in enumerate(undiagnosed_cases):
        patient = Patient(
            id=f"undiagnosed-{i+1:03d}",
            institution_id=case["institution"],
            symptoms=case["symptoms"],
            diagnosis=None,
            demographics={"age": case["age"], "gender": random.choice(["M", "F"]), "city": fake.city()}
        )
        vector = model.encode(case["symptoms"]).tolist()
        cyborg_service.store_patient(patient, vector)
        logger.info(f"Created undiagnosed case {i+1}")
    
    logger.info("=" * 60)
    logger.info("Simulation Complete. RareNet is ready for demo!")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Demo Scenarios:")
    logger.info("1. Search: 'chilblain lesions, raynaud phenomenon, joint pain'")
    logger.info("   -> Should find TREX1 Lupus cases from Boston and London")
    logger.info("")
    logger.info("2. Search: 'strawberry tongue, high fever, rash'")
    logger.info("   -> Should find Kawasaki Disease cases from Mumbai")
    logger.info("")
    logger.info("3. Search: 'progressive muscle weakness, cardiomegaly'")
    logger.info("   -> Should find Pompe Disease cases")
    logger.info("")

if __name__ == "__main__":
    run_simulation()
