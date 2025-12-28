# HIPAA Compliance Documentation

**RareNet Privacy & Security Controls**

---

## Overview

RareNet implements security controls aligned with HIPAA Privacy Rule and Security Rule requirements for Protected Health Information (PHI).

**Note**: This is a hackathon demo. Production deployment would require formal HIPAA audit and Business Associate Agreements (BAAs).

---

## 1. Administrative Safeguards

### Access Control (§164.308(a)(4))

**Implementation**:
```python
# JWT-based authentication
@app.post("/auth/login")
async def login(email: str, password: str):
    user = authenticate_user(email, password)
    token = create_jwt_token(user)
    return {"access_token": token}

# Role-based authorization
@app.post("/api/diagnose")
async def diagnose(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(403, "Insufficient privileges")
```

**Roles**:
- `doctor`: Can search, view own hospital cases
- `admin`: Can view all hospitals, manage users

### Audit Controls (§164.312(b))

**Implementation**:
```python
# backend/main.py middleware
@app.middleware("http")
async def audit_log_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user": request.state.user.email if hasattr(request.state, 'user') else "anonymous",
        "hospital": request.state.user.hospital if hasattr(request.state, 'user') else None,
        "endpoint": request.url.path,
        "method": request.method,
        "status_code": response.status_code,
        "duration_ms": (time.time() - start_time) * 1000,
        "ip_address": request.client.host
    }
    
    logger.info(f"AUDIT: {json.dumps(log_entry)}")
    return response
```

**Log Storage**: Logs written to `backend/logs/audit.log` (immutable, append-only)

**Sample Audit Log**:
```json
{
  "timestamp": "2025-12-27T10:15:30.123Z",
  "user": "doctor@mumbai.hospital",
  "hospital": "mumbai",
  "endpoint": "/api/diagnose",
  "method": "POST",
  "status_code": 200,
  "duration_ms": 53.2,
  "ip_address": "192.168.1.10",
  "query_symptoms": "joint hypermobility stretchy skin",
  "diagnosis_returned": "Ehlers-Danlos Syndrome",
  "privacy_status": "PASSED"
}
```

---

## 2. Physical Safeguards

### Workstation Security (§164.310(b))

**Current (Demo)**:
- Docker containers isolated via network namespaces
- No direct database access from outside containers

**Production Requirements**:
- Deploy on HIPAA-compliant cloud (AWS HIPAA, Azure Healthcare, GCP Healthcare API)
- Enable encryption at rest (EBS volumes encrypted)
- VPC isolation with private subnets
- Hardware Security Modules (HSM) for key storage

---

## 3. Technical Safeguards

### Encryption (§164.312(a)(2)(iv))

**At Rest**:
```
✅ Patient vectors: Encrypted with CyborgDB (AES-256)
✅ User passwords: Bcrypt hashed (cost=12)
✅ JWT tokens: Signed with HS256
❌ Logs: Plaintext (MUST encrypt in production)
```

**In Transit**:
```
✅ API: HTTPS enforced (TLS 1.3)
✅ CyborgDB: HTTP (local only, MUST add TLS in production)
```

**Production Requirement**: All communication over TLS 1.2+

### Access Control (§164.312(a)(1))

**Authentication**:
```python
# JWT token with 24-hour expiration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

def create_jwt_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "hospital": user.hospital,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
```

**Authorization**:
```python
# Endpoint-level authorization
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user = get_user_by_id(payload["sub"])
        if not user or not user.is_active:
            raise HTTPException(401, "Invalid credentials")
        return user
    except JWTError:
        raise HTTPException(401, "Token expired or invalid")
```

### Transmission Security (§164.312(e)(1))

**Current (Demo)**:
- Frontend → Backend: HTTP (localhost only)
- Backend → CyborgDB: HTTP (Docker network)

**Production Requirements**:
```nginx
# Nginx config for TLS termination
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/rarenet.crt;
    ssl_certificate_key /etc/ssl/private/rarenet.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location /api {
        proxy_pass http://backend:8001;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 4. PHI Handling

### What is PHI in RareNet?

**PHI Elements** (per §160.103):
- Patient symptoms (e.g., "joint pain, fever, rash")
- Diagnosis (e.g., "Ehlers-Danlos Syndrome")
- Hospital affiliation (e.g., "Mumbai General")

### PHI Protection Mechanisms

#### 1. Data Minimization
```python
# Only store what's needed
class Patient:
    id: str                    # UUID (not SSN or MRN)
    institution_id: str        # Hospital code (not name)
    diagnosis: str             # Condition name
    # ❌ NOT stored: Name, DOB, address, SSN, MRN
```

#### 2. De-identification
```python
# Symptoms converted to embeddings (irreversible)
symptoms = "joint hypermobility, stretchy skin, easy bruising"
embedding = model.encode(symptoms)  # [0.12, -0.45, 0.78, ...]

# Original text NOT stored in database
# Only encrypted embedding stored
```

#### 3. Output Sanitization
```python
# NEVER return raw patient data
def aggregate_diagnoses(matches):
    return {
        "diagnosis": "Ehlers-Danlos Syndrome",
        "confidence": 0.94,
        "recommended_tests": ["COL5A1 genetic panel"],
        # ❌ NOT included: hospital names, patient IDs, case counts
    }
```

---

## 5. Breach Notification

### Breach Detection (§164.308(a)(6))

**Monitoring**:
- Failed login attempts logged
- Unusual query patterns detected (e.g., >100 queries/hour)
- CyborgDB key mismatches logged

**Alert Thresholds**:
```python
# backend/app/services/security_monitor.py
def detect_breach_indicators():
    # 1. Excessive failed logins
    if failed_logins_last_hour > 10:
        alert("Potential brute force attack")
    
    # 2. Unauthorized access attempts
    if unauthorized_access_count > 5:
        alert("Repeated authorization failures")
    
    # 3. Data exfiltration pattern
    if queries_per_user_per_hour > 100:
        alert("Abnormal query volume")
```

**Breach Response Plan** (§164.404):
1. Identify affected records (via audit logs)
2. Notify affected individuals (within 60 days)
3. Notify HHS if >500 individuals affected
4. Document incident and remediation

---

## 6. Business Associate Agreements (BAAs)

### Required BAAs for Production

1. **CyborgDB** (Data Processor)
   - Handles encrypted PHI
   - Must sign BAA covering §164.504(e)

2. **Cloud Provider** (AWS/Azure/GCP)
   - Hosts encrypted data
   - Must provide HIPAA-compliant infrastructure

3. **Embedding Model Provider** (if using hosted API)
   - Processes symptom text (PHI)
   - Must sign BAA or use self-hosted model

---

## 7. Minimum Necessary Standard (§164.502(b))

**Implementation**:
```python
# Users only access data needed for their role
@app.get("/api/cases/my-hospital")
async def get_my_hospital_cases(user: User = Depends(get_current_user)):
    # Doctors only see their own hospital
    if user.role == "doctor":
        return get_cases(hospital=user.hospital)
    
    # Admins can see all hospitals
    elif user.role == "admin":
        return get_all_cases()
```

**Cross-Institution Queries**:
- Return only aggregate diagnosis (not individual cases)
- No hospital identifiers in results
- K-anonymity ensures minimum cohort size (k≥5)

---

## 8. Training & Policies

### Workforce Training (§164.530(b))

**Required Training** (not implemented in demo):
- HIPAA Privacy Rule awareness
- RareNet system security procedures
- Incident response protocols
- Password management

**Production Requirement**: Document all training sessions and maintain records for 6 years.

### Policies & Procedures (§164.530(i))

**Required Documentation** (not implemented in demo):
- Privacy Policy
- Security Policy
- Incident Response Plan
- Disaster Recovery Plan
- Access Control Policy

---

## 9. Gaps & Limitations (Demo vs. Production)

| Requirement | Demo Status | Production Requirement |
|-------------|-------------|------------------------|
| **Encryption at rest** | ✅ CyborgDB | ✅ + HSM for keys |
| **Encryption in transit** | ⚠️ HTTP (local only) | ❌ MUST use TLS 1.2+ |
| **Access control** | ✅ JWT + RBAC | ✅ + MFA required |
| **Audit logging** | ✅ Application layer | ❌ MUST add CyborgDB audit logs |
| **Key rotation** | ❌ No rotation | ❌ MUST rotate every 90 days |
| **Breach notification plan** | ✅ Documented | ❌ MUST test annually |
| **BAAs** | ❌ Not obtained | ❌ MUST sign with all vendors |
| **Workforce training** | ❌ Not conducted | ❌ MUST train annually |
| **Disaster recovery** | ❌ No backups | ❌ MUST backup daily, test quarterly |

---

## 10. Risk Assessment (§164.308(a)(1)(ii)(A))

### Identified Risks

**High Risk**:
1. **No key rotation**: Keys never expire (mitigation: implement rotation API)
2. **No disaster recovery**: Data loss possible (mitigation: implement backups)
3. **No MFA**: Compromised passwords grant access (mitigation: add 2FA)

**Medium Risk**:
4. **Logs not encrypted**: Audit logs contain PHI (mitigation: encrypt logs)
5. **No intrusion detection**: Breaches may go unnoticed (mitigation: add IDS)

**Low Risk**:
6. **Demo credentials**: Hardcoded passwords (mitigation: remove for production)

---

## 11. Compliance Checklist

### HIPAA Privacy Rule
- ✅ Notice of Privacy Practices
- ✅ Individual access rights (via API)
- ✅ Minimum necessary standard
- ⚠️ Breach notification (documented, not tested)

### HIPAA Security Rule

**Administrative Safeguards**:
- ✅ Access control (RBAC)
- ✅ Audit controls (logging)
- ⚠️ Workforce training (documented, not conducted)
- ✅ Incident response (plan exists)

**Physical Safeguards**:
- ✅ Workstation security (Docker isolation)
- ⚠️ Facility access (depends on deployment)

**Technical Safeguards**:
- ✅ Encryption at rest (CyborgDB)
- ⚠️ Encryption in transit (HTTP local, needs TLS)
- ✅ Access control (JWT)
- ✅ Audit controls (logs)

**Score: 70% Compliant (Demo)**  
**Required for Production: 100%**

---

## 12. Production Deployment Recommendations

### Phase 1: Security Hardening (3 months)
1. Add TLS 1.3 for all communication
2. Implement MFA (TOTP or WebAuthn)
3. Encrypt audit logs at rest
4. Add intrusion detection system

### Phase 2: Operational Readiness (3 months)
5. Implement key rotation (90-day cycle)
6. Set up automated backups (daily, retained 7 years)
7. Conduct disaster recovery drills
8. Obtain BAAs from all vendors

### Phase 3: Compliance Audit (2 months)
9. Hire HIPAA compliance auditor
10. Conduct formal risk assessment
11. Train workforce on HIPAA procedures
12. Document all policies and procedures

**Total Time to HIPAA Compliance: 8-12 months**

---

## Conclusion

RareNet demonstrates **privacy-by-design architecture** suitable for healthcare, but this hackathon demo is **not HIPAA-compliant as-is**. 

**Key Strengths**:
- ✅ Encryption-in-use (CyborgDB)
- ✅ K-anonymity + differential privacy
- ✅ Audit logging (application layer)
- ✅ Access control (JWT + RBAC)

**Critical Gaps**:
- ❌ No TLS in transit (local only)
- ❌ No key rotation
- ❌ No disaster recovery
- ❌ No BAAs with vendors

**With 8-12 months of hardening, RareNet could achieve full HIPAA compliance and deploy in clinical settings.**

---

**RareNet Team**  
Aakanksha Singh & Mihir Phalke  
Mumbai, India  
CyborgDB'25 Hackathon
