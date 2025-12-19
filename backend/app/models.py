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


# ============================================
# Privacy-Preserving Response Models
# ============================================

class DiagnosticInsight(BaseModel):
    """
    Privacy-safe diagnostic insight returned to the client.
    
    Contains NO patient IDs, NO institution names, NO individual case details.
    Only aggregated diagnostic information.
    """
    suggested_diagnosis: str
    confidence_score: float  # 0.0 - 1.0, with differential privacy noise applied
    recommended_tests: List[str]
    specialist_referral: str
    privacy_status: str  # "PASSED" | "BLOCKED"
    privacy_message: Optional[str] = None  # Explanation if blocked
    icd10_code: Optional[str] = None
    prevalence: Optional[str] = None
    description: Optional[str] = None


class PrivacyAuditLog(BaseModel):
    """
    Audit log showing what data was accessed vs what was returned.
    
    Demonstrates to the user that privacy protections are active
    without revealing any protected information.
    """
    vectors_scanned: int
    institutions_queried: int
    raw_matches_found: int
    privacy_threshold: int
    threshold_passed: bool
    noise_epsilon: float
    data_returned: str  # "AGGREGATED_INSIGHT" | "BLOCKED"
    diagnosis_distribution: Optional[Dict[str, int]] = None  # Only shown if passed


class DiagnosticResponse(BaseModel):
    """
    Complete response from the /api/diagnose endpoint.
    
    Includes the diagnostic insight and privacy audit log.
    """
    insight: DiagnosticInsight
    audit: PrivacyAuditLog
    query: str
    search_time_ms: float
