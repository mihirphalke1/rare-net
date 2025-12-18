import os
import time
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import numpy as np

from app.models import Patient, SearchRequest, SearchResult, DiseaseInfo
from app.services.cyborg_service import cyborg_service
from app.rare_diseases import RARE_DISEASES, get_all_symptoms, get_all_diseases, find_diseases_by_symptom

app = FastAPI(title="RareNet API", description="Cross-Institution Rare Disease Diagnosis Network")

# CORS Setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Embedding Model
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.get("/")
def read_root():
    return {"status": "online", "service": "RareNet Backend", "version": "2.0"}

@app.get("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "database": "connected",
        "model": "loaded"
    }

@app.post("/api/init")
def initialize_network():
    """Initialize indices for simulated hospitals."""
    institutions = ["mumbai", "boston", "london"]
    results = []
    for inst in institutions:
        try:
            cyborg_service.create_institution_index(inst)
            results.append({"institution": inst, "status": "initialized"})
        except Exception as e:
            results.append({"institution": inst, "status": "error", "error": str(e)})
    return {"message": "Network initialization complete", "results": results}

@app.post("/api/patient")
def add_patient(patient: Patient):
    """Add a new patient record. Converts symptoms to vector and stores in CyborgDB."""
    try:
        vector = model.encode(patient.symptoms).tolist()
        cyborg_service.store_patient(patient, vector)
        return {"message": f"Patient {patient.id} stored securely in {patient.institution_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
def search_network(request: SearchRequest):
    """Search the network for similar cases across all institutions."""
    try:
        start_time = time.time()
        
        # Generate query vector
        query_vector = model.encode(request.symptoms).tolist()
        
        # Search CyborgDB
        raw_results = cyborg_service.search_network(query_vector, request.top_k)
        
        # Enrich results with disease information
        enriched_results = []
        for result in raw_results:
            metadata = result.get('metadata', {})
            diagnosis = metadata.get('diagnosis', 'Unknown')
            
            # Find matching disease info
            disease_info = None
            for disease_name, info in RARE_DISEASES.items():
                if diagnosis.lower() in disease_name.lower() or disease_name.lower() in diagnosis.lower():
                    disease_info = info
                    break
            
            enriched_result = {
                "id": result.get('id', ''),
                "score": result.get('score', 0),
                "metadata": {
                    "patient_id": metadata.get('patient_id', result.get('id', '')),
                    "diagnosis": diagnosis,
                    "institution_id": metadata.get('institution_id', result.get('source_institution', '')),
                },
                "source_institution": result.get('source_institution', metadata.get('institution_id', '')),
                "disease_info": {
                    "icd10": disease_info.get('icd10', '') if disease_info else '',
                    "prevalence": disease_info.get('prevalence', '') if disease_info else '',
                    "description": disease_info.get('description', '') if disease_info else '',
                    "specialist": disease_info.get('specialist', '') if disease_info else '',
                    "treatment": disease_info.get('treatment', []) if disease_info else []
                } if disease_info else None
            }
            enriched_results.append(enriched_result)
        
        search_time = (time.time() - start_time) * 1000
        
        return {
            "results": enriched_results,
            "query": request.symptoms,
            "search_time_ms": round(search_time, 2),
            "total_matches": len(enriched_results)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/diseases")
def get_diseases():
    """Get list of all rare diseases in the database."""
    diseases = []
    for name, info in RARE_DISEASES.items():
        diseases.append({
            "name": name,
            "icd10": info["icd10"],
            "prevalence": info["prevalence"],
            "symptom_count": len(info["symptoms"]),
            "specialist": info["specialist"]
        })
    return {"diseases": diseases, "total": len(diseases)}

@app.get("/api/diseases/{disease_name}")
def get_disease_detail(disease_name: str):
    """Get detailed information about a specific disease."""
    for name, info in RARE_DISEASES.items():
        if disease_name.lower() in name.lower():
            return {
                "name": name,
                **info
            }
    raise HTTPException(status_code=404, detail="Disease not found")

@app.get("/api/symptoms")
def get_symptoms():
    """Get list of all symptoms for autocomplete."""
    symptoms = get_all_symptoms()
    return {"symptoms": symptoms, "total": len(symptoms)}

@app.get("/api/symptoms/suggest")
def suggest_symptoms(query: str = ""):
    """Get symptom suggestions based on partial input."""
    all_symptoms = get_all_symptoms()
    if not query:
        return {"suggestions": all_symptoms[:20]}
    
    query_lower = query.lower()
    suggestions = [s for s in all_symptoms if query_lower in s.lower()]
    return {"suggestions": suggestions[:10]}

@app.get("/api/stats")
def get_network_stats():
    """Get network statistics."""
    try:
        stats = cyborg_service.get_stats()
        return {
            "institutions": ["mumbai", "boston", "london"],
            "total_patients": stats.get("total", 0),
            "diseases_tracked": len(RARE_DISEASES),
            "symptoms_indexed": len(get_all_symptoms())
        }
    except:
        return {
            "institutions": ["mumbai", "boston", "london"],
            "total_patients": 0,
            "diseases_tracked": len(RARE_DISEASES),
            "symptoms_indexed": len(get_all_symptoms())
        }
