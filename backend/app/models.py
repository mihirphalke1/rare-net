from typing import Optional, Dict, List, Any
from pydantic import BaseModel

class Patient(BaseModel):
    id: str
    institution_id: str
    symptoms: str
    diagnosis: Optional[str] = None
    demographics: Dict[str, Any]

class SymptomVector(BaseModel):
    vector: List[float]
    metadata: Dict[str, Any]

class SearchRequest(BaseModel):
    symptoms: str
    top_k: int = 6

class DiseaseInfo(BaseModel):
    name: str
    icd10: str
    prevalence: str
    symptoms: List[str]
    description: str
    inheritance: str
    onset: str
    treatment: List[str]
    specialist: str

class SearchResult(BaseModel):
    id: str
    score: float
    metadata: Dict[str, Any]
    source_institution: str
    disease_info: Optional[Dict[str, Any]] = None
