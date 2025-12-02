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
    top_k: int = 5
