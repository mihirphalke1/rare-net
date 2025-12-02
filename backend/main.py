import os
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import numpy as np

from app.models import Patient, SearchRequest
from app.services.cyborg_service import cyborg_service

app = FastAPI(title="RareNet API")

# CORS Setup
origins = [
    "http://localhost:5173",  # Local Frontend
    "http://localhost:3000",  # Alternative Local
    os.getenv("FRONTEND_URL", "*") # Production Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Embedding Model
# We use a small, fast model for the hackathon
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.get("/")
def read_root():
    return {"status": "online", "service": "RareNet Backend"}

@app.post("/api/init")
def initialize_network():
    """
    Initialize indices for simulated hospitals.
    """
    institutions = ["mumbai", "boston", "london"]
    for inst in institutions:
        cyborg_service.create_institution_index(inst)
    return {"message": "Network initialized successfully"}

@app.post("/api/patient")
def add_patient(patient: Patient):
    """
    Add a new patient record.
    Converts symptoms to vector and stores in CyborgDB.
    """
    try:
        # Generate vector from symptoms
        vector = model.encode(patient.symptoms).tolist()
        
        # Store in CyborgDB
        cyborg_service.store_patient(patient, vector)
        
        return {"message": f"Patient {patient.id} stored securely in {patient.institution_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
def search_network(request: SearchRequest):
    """
    Search the network for similar cases.
    """
    try:
        # Generate query vector
        query_vector = model.encode(request.symptoms).tolist()
        
        # Search CyborgDB
        results = cyborg_service.search_network(query_vector, request.top_k)
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
