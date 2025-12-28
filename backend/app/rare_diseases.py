"""
Comprehensive Rare Disease Database for RareNet
Contains real rare disease information with symptoms, prevalence, and treatment guidelines.
"""

RARE_DISEASES = {
    "TREX1 Lupus (Aicardi-Goutières Syndrome)": {
        "icd10": "G31.8",
        "prevalence": "1-9 / 1,000,000",
        "symptoms": [
            "chilblain lesions",
            "skin ulcers on fingers and toes",
            "raynaud phenomenon",
            "joint pain and stiffness",
            "chronic fatigue",
            "photosensitivity",
            "recurrent fevers",
            "developmental delay",
            "spasticity",
            "seizures",
            "intracranial calcifications"
        ],
        "description": "A rare genetic disorder caused by mutations in the TREX1 gene, leading to interferonopathy with features resembling lupus.",
        "inheritance": "Autosomal dominant/recessive",
        "onset": "Infancy to early childhood",
        "treatment": ["JAK inhibitors", "Immunosuppressants", "Physical therapy"],
        "specialist": "Rheumatologist, Neurologist"
    },
    "Kawasaki Disease": {
        "icd10": "M30.3",
        "prevalence": "1-9 / 10,000",
        "symptoms": [
            "high fever lasting 5+ days",
            "strawberry tongue",
            "red cracked lips",
            "bilateral conjunctivitis",
            "cervical lymphadenopathy",
            "polymorphous rash",
            "erythema of palms and soles",
            "peeling skin on fingers",
            "irritability",
            "coronary artery aneurysm"
        ],
        "description": "An acute vasculitis that primarily affects children under 5, can cause coronary artery abnormalities.",
        "inheritance": "Unknown, possible genetic susceptibility",
        "onset": "Childhood (6 months - 5 years)",
        "treatment": ["IV Immunoglobulin", "Aspirin", "Corticosteroids"],
        "specialist": "Pediatric Cardiologist, Rheumatologist"
    },
    "Progeria (Hutchinson-Gilford Syndrome)": {
        "icd10": "E34.8",
        "prevalence": "< 1 / 1,000,000",
        "symptoms": [
            "severe growth retardation",
            "premature aging appearance",
            "alopecia (hair loss)",
            "loss of subcutaneous fat",
            "prominent scalp veins",
            "small face relative to head",
            "micrognathia",
            "delayed tooth eruption",
            "joint contractures",
            "hip dislocation",
            "atherosclerosis",
            "cardiovascular disease"
        ],
        "description": "An extremely rare genetic disorder causing accelerated aging in children, caused by LMNA gene mutations.",
        "inheritance": "Autosomal dominant (de novo mutations)",
        "onset": "First year of life",
        "treatment": ["Lonafarnib (farnesyltransferase inhibitor)", "Cardiovascular management", "Physical therapy"],
        "specialist": "Geneticist, Cardiologist"
    },
    "Fibrodysplasia Ossificans Progressiva (FOP)": {
        "icd10": "M61.1",
        "prevalence": "< 1 / 1,000,000",
        "symptoms": [
            "malformed great toes",
            "heterotopic ossification",
            "progressive muscle stiffness",
            "painful soft tissue swelling",
            "limited jaw movement",
            "restricted arm movement",
            "spinal fusion",
            "breathing difficulties",
            "hearing loss",
            "flare-ups triggered by trauma"
        ],
        "description": "A rare connective tissue disorder where muscle and connective tissue progressively turn into bone.",
        "inheritance": "Autosomal dominant",
        "onset": "First decade of life",
        "treatment": ["Avoid trauma", "Corticosteroids during flares", "Palovarotene (investigational)"],
        "specialist": "Orthopedic Specialist, Geneticist"
    },
    "Gaucher Disease": {
        "icd10": "E75.2",
        "prevalence": "1-9 / 100,000",
        "symptoms": [
            "hepatosplenomegaly",
            "anemia",
            "thrombocytopenia",
            "bone pain",
            "bone crisis",
            "pathological fractures",
            "easy bruising",
            "fatigue",
            "growth retardation",
            "pingueculae",
            "neurological symptoms (Type 2/3)"
        ],
        "description": "A lysosomal storage disorder caused by glucocerebrosidase deficiency, leading to accumulation of glucocerebroside.",
        "inheritance": "Autosomal recessive",
        "onset": "Variable (Type 1: adulthood, Type 2/3: childhood)",
        "treatment": ["Enzyme replacement therapy", "Substrate reduction therapy", "Bone marrow transplant"],
        "specialist": "Hematologist, Geneticist"
    },
    "Ehlers-Danlos Syndrome (Vascular Type)": {
        "icd10": "Q79.6",
        "prevalence": "1-9 / 100,000",
        "symptoms": [
            "thin translucent skin",
            "easy bruising",
            "characteristic facial features",
            "arterial rupture",
            "organ rupture",
            "joint hypermobility",
            "varicose veins",
            "pneumothorax",
            "acrogeria",
            "clubfoot"
        ],
        "description": "A severe connective tissue disorder affecting blood vessels and organs, caused by COL3A1 mutations.",
        "inheritance": "Autosomal dominant",
        "onset": "Childhood to young adulthood",
        "treatment": ["Blood pressure management", "Avoid contact sports", "Surveillance imaging"],
        "specialist": "Geneticist, Vascular Specialist"
    },
    "Pompe Disease": {
        "icd10": "E74.0",
        "prevalence": "1-9 / 100,000",
        "symptoms": [
            "progressive muscle weakness",
            "cardiomegaly",
            "hypotonia (floppy baby)",
            "respiratory insufficiency",
            "difficulty feeding",
            "failure to thrive",
            "hepatomegaly",
            "macroglossia",
            "motor delay",
            "sleep apnea"
        ],
        "description": "A glycogen storage disease caused by acid alpha-glucosidase deficiency, affecting muscles and heart.",
        "inheritance": "Autosomal recessive",
        "onset": "Infantile or late-onset",
        "treatment": ["Enzyme replacement therapy (alglucosidase alfa)", "Respiratory support", "Physical therapy"],
        "specialist": "Metabolic Specialist, Neurologist"
    },
    "Niemann-Pick Disease Type C": {
        "icd10": "E75.2",
        "prevalence": "1-9 / 100,000",
        "symptoms": [
            "vertical supranuclear gaze palsy",
            "ataxia",
            "dystonia",
            "cognitive decline",
            "hepatosplenomegaly",
            "neonatal jaundice",
            "seizures",
            "cataplexy",
            "psychiatric symptoms",
            "dysphagia"
        ],
        "description": "A lysosomal storage disorder causing cholesterol trafficking defects, leading to neurodegeneration.",
        "inheritance": "Autosomal recessive",
        "onset": "Variable (childhood to adulthood)",
        "treatment": ["Miglustat (substrate reduction)", "Symptomatic treatment", "Physical therapy"],
        "specialist": "Neurologist, Metabolic Specialist"
    },
    "Fabry Disease": {
        "icd10": "E75.2",
        "prevalence": "1-9 / 100,000",
        "symptoms": [
            "acroparesthesias (burning pain in extremities)",
            "angiokeratomas",
            "hypohidrosis",
            "corneal opacity",
            "proteinuria",
            "renal failure",
            "cardiomyopathy",
            "stroke",
            "hearing loss",
            "gastrointestinal symptoms"
        ],
        "description": "An X-linked lysosomal storage disorder caused by alpha-galactosidase A deficiency.",
        "inheritance": "X-linked",
        "onset": "Childhood (males), later in females",
        "treatment": ["Enzyme replacement therapy", "Chaperone therapy (migalastat)", "Pain management"],
        "specialist": "Geneticist, Nephrologist, Cardiologist"
    },
    "Marfan Syndrome": {
        "icd10": "Q87.4",
        "prevalence": "1-9 / 10,000",
        "symptoms": [
            "tall stature with long limbs",
            "arachnodactyly (long fingers)",
            "pectus deformity",
            "scoliosis",
            "ectopia lentis (lens dislocation)",
            "myopia",
            "aortic root dilation",
            "mitral valve prolapse",
            "dural ectasia",
            "spontaneous pneumothorax",
            "striae"
        ],
        "description": "A connective tissue disorder affecting the heart, eyes, and skeleton, caused by FBN1 mutations.",
        "inheritance": "Autosomal dominant",
        "onset": "Variable, often childhood",
        "treatment": ["Beta-blockers/ARBs", "Aortic surgery when indicated", "Lens surgery", "Avoid contact sports"],
        "specialist": "Cardiologist, Geneticist, Ophthalmologist"
    },
    "Phenylketonuria (PKU)": {
        "icd10": "E70.0",
        "prevalence": "1-9 / 10,000",
        "symptoms": [
            "intellectual disability (if untreated)",
            "musty body odor",
            "eczema",
            "fair skin and hair",
            "seizures",
            "hyperactivity",
            "behavioral problems",
            "microcephaly",
            "developmental delay",
            "psychiatric symptoms"
        ],
        "description": "An inborn error of metabolism where the body cannot break down phenylalanine.",
        "inheritance": "Autosomal recessive",
        "onset": "Newborn (detectable via screening)",
        "treatment": ["Low-phenylalanine diet", "Sapropterin (BH4)", "Pegvaliase"],
        "specialist": "Metabolic Specialist, Dietitian"
    },
    "Cystic Fibrosis": {
        "icd10": "E84",
        "prevalence": "1-9 / 10,000",
        "symptoms": [
            "chronic productive cough",
            "recurrent lung infections",
            "bronchiectasis",
            "pancreatic insufficiency",
            "malabsorption",
            "failure to thrive",
            "salty-tasting skin",
            "nasal polyps",
            "male infertility",
            "liver disease"
        ],
        "description": "A genetic disorder affecting the lungs and digestive system due to CFTR mutations.",
        "inheritance": "Autosomal recessive",
        "onset": "Infancy (often detected by newborn screening)",
        "treatment": ["CFTR modulators (Trikafta)", "Airway clearance", "Pancreatic enzymes", "Antibiotics"],
        "specialist": "Pulmonologist, Gastroenterologist"
    },
    "Huntington Disease": {
        "icd10": "G10",
        "prevalence": "1-9 / 10,000",
        "symptoms": [
            "chorea (involuntary movements)",
            "dystonia",
            "cognitive decline",
            "personality changes",
            "depression",
            "anxiety",
            "difficulty swallowing",
            "weight loss",
            "sleep disturbances",
            "bradykinesia (late stage)"
        ],
        "description": "A progressive neurodegenerative disorder caused by CAG repeat expansion in the HTT gene.",
        "inheritance": "Autosomal dominant",
        "onset": "Typically 30-50 years",
        "treatment": ["Tetrabenazine (for chorea)", "Antidepressants", "Physical therapy", "Speech therapy"],
        "specialist": "Neurologist, Psychiatrist, Geneticist"
    },
    "Wilson Disease": {
        "icd10": "E83.0",
        "prevalence": "1-9 / 100,000",
        "symptoms": [
            "kayser-fleischer rings",
            "hepatitis",
            "cirrhosis",
            "tremor",
            "dystonia",
            "dysarthria",
            "psychiatric symptoms",
            "hemolytic anemia",
            "osteoporosis",
            "cardiomyopathy"
        ],
        "description": "A disorder of copper metabolism causing copper accumulation in liver, brain, and other organs.",
        "inheritance": "Autosomal recessive",
        "onset": "Childhood to young adulthood",
        "treatment": ["Chelation therapy (penicillamine, trientine)", "Zinc", "Liver transplant"],
        "specialist": "Hepatologist, Neurologist"
    },
    "Alport Syndrome": {
        "icd10": "Q87.8",
        "prevalence": "1-9 / 100,000",
        "symptoms": [
            "progressive kidney disease",
            "hematuria",
            "proteinuria",
            "sensorineural hearing loss",
            "anterior lenticonus",
            "retinal flecks",
            "end-stage renal disease"
        ],
        "description": "A genetic condition affecting the kidneys, ears, and eyes due to collagen IV mutations.",
        "inheritance": "X-linked (most common), autosomal",
        "onset": "Childhood",
        "treatment": ["ACE inhibitors", "Dialysis", "Kidney transplant", "Hearing aids"],
        "specialist": "Nephrologist, Audiologist, Ophthalmologist"
    }
}

# Quick symptom to disease mapping for search suggestions
SYMPTOM_DISEASE_MAP = {}
for disease, info in RARE_DISEASES.items():
    for symptom in info["symptoms"]:
        if symptom.lower() not in SYMPTOM_DISEASE_MAP:
            SYMPTOM_DISEASE_MAP[symptom.lower()] = []
        SYMPTOM_DISEASE_MAP[symptom.lower()].append(disease)

def get_disease_info(disease_name: str) -> dict:
    """Get detailed information about a specific disease."""
    return RARE_DISEASES.get(disease_name, None)

def get_all_diseases() -> list:
    """Get list of all disease names."""
    return list(RARE_DISEASES.keys())

def get_all_symptoms() -> list:
    """Get unique list of all symptoms."""
    symptoms = set()
    for disease_info in RARE_DISEASES.values():
        symptoms.update(disease_info["symptoms"])
    return sorted(list(symptoms))

def find_diseases_by_symptom(symptom: str) -> list:
    """Find diseases that match a given symptom."""
    symptom_lower = symptom.lower()
    matching_diseases = []
    
    for disease, info in RARE_DISEASES.items():
        for s in info["symptoms"]:
            if symptom_lower in s.lower() or s.lower() in symptom_lower:
                matching_diseases.append(disease)
                break
    
    return matching_diseases

def generate_symptom_text(disease_name: str, num_symptoms: int = 4) -> str:
    """Generate a realistic symptom description for a disease."""
    import random
    disease_info = RARE_DISEASES.get(disease_name)
    if not disease_info:
        return ""
    
    symptoms = disease_info["symptoms"]
    selected = random.sample(symptoms, min(num_symptoms, len(symptoms)))
    return ", ".join(selected)


# Common medical terms that indicate valid symptom input
VALID_MEDICAL_TERMS = {
    # General symptoms
    "pain", "ache", "fever", "fatigue", "weakness", "swelling", "inflammation",
    "bleeding", "bruising", "rash", "lesion", "ulcer", "numbness", "tingling",
    "stiffness", "tenderness", "discomfort", "burning", "itching", "cramping",
    
    # Body parts
    "joint", "muscle", "bone", "skin", "eye", "ear", "nose", "throat", "chest",
    "abdomen", "back", "neck", "head", "face", "hand", "foot", "arm", "leg",
    "finger", "toe", "heart", "lung", "liver", "kidney", "spleen", "brain",
    "tongue", "lip", "scalp", "nail", "hair", "teeth", "gum",
    
    # Medical descriptors
    "chronic", "acute", "progressive", "recurrent", "bilateral", "unilateral",
    "severe", "mild", "moderate", "intermittent", "persistent", "sudden",
    "gradual", "episodic", "congenital", "hereditary", "genetic",
    
    # Specific symptoms from our database
    "hypermobility", "hypotonia", "hypertension", "hypotension", "tachycardia",
    "bradycardia", "arrhythmia", "palpitation", "dyspnea", "cough", "wheeze",
    "stridor", "apnea", "cyanosis", "pallor", "jaundice", "edema", "ascites",
    "hepatomegaly", "splenomegaly", "lymphadenopathy", "cardiomegaly",
    "anemia", "thrombocytopenia", "leukopenia", "neutropenia",
    "seizure", "tremor", "ataxia", "dystonia", "chorea", "spasticity",
    "paralysis", "paresis", "neuropathy", "myopathy", "encephalopathy",
    "rigidity", "spasm", "spasms", "startle",  # Added for Stiff Person Syndrome
    "dementia", "delirium", "confusion", "amnesia", "aphasia", "dysarthria",
    "dysphagia", "nausea", "vomiting", "diarrhea", "constipation", "bloating",
    "anorexia", "polyphagia", "polydipsia", "polyuria", "oliguria", "hematuria",
    "proteinuria", "glycosuria", "dysuria", "incontinence", "retention",
    "alopecia", "hirsutism", "hyperhidrosis", "hypohidrosis", "pruritus",
    "urticaria", "eczema", "psoriasis", "dermatitis", "erythema", "petechiae",
    "purpura", "ecchymosis", "telangiectasia", "angiokeratoma",
    "photosensitivity", "raynaud", "chilblain", "acrocyanosis",
    "arthralgia", "arthritis", "myalgia", "fibromyalgia", "osteoporosis",
    "fracture", "dislocation", "contracture", "scoliosis", "kyphosis",
    "lordosis", "deformity", "malformation", "anomaly", "dysplasia",
    "hypoplasia", "hyperplasia", "atrophy", "hypertrophy",
    "retardation", "delay", "regression", "deterioration", "decline",
    "failure", "insufficiency", "deficiency", "excess", "accumulation",
    
    # Common symptom phrases
    "strawberry", "high", "low", "loss", "gain", "difficulty", "trouble",
    "problem", "issue", "disorder", "syndrome", "disease", "condition",
    "enlarged", "small", "large", "short", "tall", "thin", "thick",
    "red", "blue", "yellow", "white", "dark", "light", "pale",
    "hot", "cold", "warm", "cool", "dry", "wet", "moist",
    "hard", "soft", "firm", "tender", "sensitive", "numb",
    "vision", "hearing", "smell", "taste", "touch", "balance",
    "sleep", "appetite", "weight", "growth", "development",
    "breathing", "swallowing", "walking", "talking", "eating",
    "movement", "coordination", "reflex", "sensation", "perception",
    "painful", "response", "trunk", "exaggerated", "episodic"  # Added common descriptors
}

def validate_symptoms(query: str) -> dict:
    """
    Validate if the query contains valid medical/symptom terms.
    
    Returns:
        dict with:
        - is_valid: bool
        - valid_terms: list of recognized medical terms
        - invalid_terms: list of unrecognized terms
        - confidence: float (0-1) representing how medical the query is
        - message: str explanation
    """
    # Split query into individual terms
    query_lower = query.lower()
    
    # Remove common separators and get individual words
    for sep in [',', ';', '.', '/', '\\', '|', '-', '_']:
        query_lower = query_lower.replace(sep, ' ')
    
    words = [w.strip() for w in query_lower.split() if len(w.strip()) > 2]
    
    if not words:
        return {
            "is_valid": False,
            "valid_terms": [],
            "invalid_terms": [],
            "confidence": 0.0,
            "message": "Please enter valid symptoms (e.g., joint pain, fever, rash)"
        }
    
    # Get all known symptoms from our database
    all_symptoms = get_all_symptoms()
    all_symptoms_lower = [s.lower() for s in all_symptoms]
    
    valid_terms = []
    invalid_terms = []
    
    # Check each word/phrase
    for word in words:
        is_valid = False
        
        # Check if it's a known medical term
        if word in VALID_MEDICAL_TERMS:
            is_valid = True
        
        # Check if it's part of any known symptom
        if not is_valid:
            for symptom in all_symptoms_lower:
                if word in symptom or symptom in word:
                    is_valid = True
                    break
        
        # Check if it matches any key medical pattern
        if not is_valid:
            # Check for medical suffixes
            medical_suffixes = ['itis', 'osis', 'emia', 'pathy', 'algia', 'ectomy', 
                              'plasty', 'scopy', 'gram', 'graphy', 'megaly', 'penia',
                              'philia', 'phobia', 'plegia', 'rrhea', 'trophy']
            for suffix in medical_suffixes:
                if word.endswith(suffix):
                    is_valid = True
                    break
        
        if is_valid:
            valid_terms.append(word)
        else:
            invalid_terms.append(word)
    
    # Calculate confidence based on ratio of valid terms
    total_terms = len(valid_terms) + len(invalid_terms)
    confidence = len(valid_terms) / total_terms if total_terms > 0 else 0.0
    
    # Determine if query is valid (at least 30% medical terms and at least 1 valid term)
    # Made more lenient to accept rare disease symptoms
    is_valid = confidence >= 0.3 and len(valid_terms) >= 1
    
    # Generate appropriate message
    if is_valid:
        if invalid_terms:
            message = f"Query accepted. Unrecognized terms ignored: {', '.join(invalid_terms[:3])}"
        else:
            message = "Valid medical query"
    else:
        if invalid_terms:
            message = f"Invalid query: '{', '.join(invalid_terms[:3])}' are not recognized medical terms. Please enter valid symptoms."
        else:
            message = "Please enter valid medical symptoms (e.g., joint pain, fever, skin rash)"
    
    return {
        "is_valid": is_valid,
        "valid_terms": valid_terms,
        "invalid_terms": invalid_terms,
        "confidence": round(confidence, 2),
        "message": message
    }

