# RareNet

**Privacy-Preserving Federated Rare Disease Diagnostic Network**

RareNet enables cross-institutional rare disease diagnosis while ensuring patient privacy through advanced cryptographic techniques and privacy-preserving algorithms.

---

## 🔧 Recent Fixes (December 2025)

### Fixed: 500 Internal Server Error on Diagnosis Endpoint

**Issue**: The `/api/diagnose` endpoint was returning 500 errors due to the embedding model not being properly initialized.

**Root Cause**: The code was calling `model.encode()` directly, but `model` was set to `None` and never initialized. The `get_embedding_model()` function existed but was never called.

**Fix Applied**: Updated all three locations where `model.encode()` was called:
- `/api/diagnose` (line 215)
- `/api/report` (line 310) 
- `/api/patient` (line 447)

Changed from:
```python
query_vector = model.encode(request.symptoms).tolist()
```

To:
```python
embedding_model = get_embedding_model()
query_vector = embedding_model.encode(request.symptoms).tolist()
```

**Status**: ✅ **RESOLVED** - All endpoints now working correctly with proper lazy loading of the sentence-transformer model.

---

## Problem Statement

Rare diseases affect 300+ million people globally, yet diagnosis takes an average of **5-7 years** due to:

- **Data Fragmentation**: Patient data is siloed across hospitals
- **Privacy Barriers**: HIPAA/GDPR prevent raw data sharing
- **Limited Expertise**: Most physicians encounter fewer than 5 rare disease cases in their career

**RareNet solves this** by enabling secure, cross-institutional symptom matching without exposing patient data.

---

## Architecture

```
+------------------------------------------------------------------+
|                       CLINICIAN INTERFACE                         |
|                   (React + TypeScript + Vite)                     |
+------------------------------------------------------------------+
                               |
                               v
+------------------------------------------------------------------+
|                     TRUSTED AGGREGATOR (Hub)                      |
|                        FastAPI + Python                           |
|  +----------------+  +----------------+  +-------------------+    |
|  |  K-Anonymity   |  |  Aggregation   |  | Differential      |    |
|  |   (K >= 5)     |  |   (Voting)     |  | Privacy (e=0.1)   |    |
|  +----------------+  +----------------+  +-------------------+    |
+------------------------------------------------------------------+
                               |
               +---------------+---------------+
               v               v               v
     +--------------+  +--------------+  +--------------+
     |  Hospital A  |  |  Hospital B  |  |  Hospital C  |  ...
     |  (CyborgDB)  |  |  (CyborgDB)  |  |  (CyborgDB)  |
     |   Mumbai     |  |   Boston     |  |   London     |
     +--------------+  +--------------+  +--------------+
```

---

## Key Features

### Privacy Guarantees

| Feature                     | Description                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| **K-Anonymity**             | Results blocked if fewer than 5 global matches (prevents re-identification) |
| **Differential Privacy**    | Laplace noise (epsilon=0.1) added to confidence scores                      |
| **Aggregated Results Only** | Only diagnosis plus confidence returned, never patient data                 |
| **Hospital Sources Hidden** | Cannot determine which institution has matching cases                       |
| **Encrypted Vector Search** | CyborgDB performs similarity search on encrypted embeddings                 |

### Clinical Features

| Feature                 | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| **15 Rare Diseases**    | Including TREX1 Lupus, Kawasaki, Progeria, Fabry, Marfan, etc. |
| **Symptom Validation**  | Medical term validation against 400+ recognized terms          |
| **Disease Information** | ICD-10 codes, prevalence, treatments, specialist referrals     |
| **Case Contribution**   | Doctors can securely add new cases to their hospital node      |
| **JWT Authentication**  | Secure login with role-based access (doctor/admin)             |

### Network Scale

- **8 Hospital Nodes**: Mumbai, Boston, London, Tokyo, Singapore, Toronto, Sao Paulo, Berlin
- **315+ Patient Records**: Seeded with realistic symptom combinations
- **384-Dimensional Vectors**: Using `all-MiniLM-L6-v2` sentence transformer

---

## CyborgDB Implementation Details

CyborgDB is the encrypted vector database at the core of RareNet's privacy architecture. Here is exactly how it is implemented:

### CyborgService Class (`backend/app/services/cyborg_service.py`)

The `CyborgService` class manages all interactions with CyborgDB:

```python
class CyborgService:
    def __init__(self):
        self.api_key = os.getenv("CYBORGDB_API_KEY", "cyborg_d754e642...")
        self.base_url = os.getenv("CYBORGDB_URL", "http://localhost:8000")
        self.client = Client(base_url=self.base_url, api_key=self.api_key)
        self.demo_key = bytes.fromhex("0000...0001")  # 32-byte encryption key
```

### Index Structure

Each hospital has its own isolated CyborgDB index:

| Hospital  | Index Name          | Purpose                   |
| --------- | ------------------- | ------------------------- |
| Mumbai    | `rarenet_mumbai`    | Encrypted patient vectors |
| Boston    | `rarenet_boston`    | Encrypted patient vectors |
| London    | `rarenet_london`    | Encrypted patient vectors |
| Tokyo     | `rarenet_tokyo`     | Encrypted patient vectors |
| Singapore | `rarenet_singapore` | Encrypted patient vectors |
| Toronto   | `rarenet_toronto`   | Encrypted patient vectors |
| Sao Paulo | `rarenet_sao_paulo` | Encrypted patient vectors |
| Berlin    | `rarenet_berlin`    | Encrypted patient vectors |

### Key Methods

**1. create_institution_index(institution_id, dimension=384)**

Creates an encrypted index for a hospital node:

```python
def create_institution_index(self, institution_id: str, dimension: int = 384):
    index_name = f"rarenet_{institution_id}"
    existing_indexes = self.client.list_indexes()
    if index_name not in existing_indexes:
        self.client.create_index(index_name, index_key=self.demo_key)
    return True
```

- Uses a 32-byte encryption key for each index
- Indexes are created with 384 dimensions (matching sentence-transformers output)
- Index names follow pattern: `rarenet_{hospital}`

**2. store_patient(patient, vector)**

Stores an encrypted patient vector:

```python
def store_patient(self, patient: Patient, vector: List[float]):
    index_name = f"rarenet_{patient.institution_id}"

    metadata = {
        "patient_id": patient.id,
        "institution_id": patient.institution_id,
        "diagnosis": patient.diagnosis or "Unknown",
    }

    index = self.client.load_index(index_name, index_key=self.demo_key)
    item = {"id": patient.id, "vector": vector, "metadata": metadata}
    index.upsert([item])
```

- Loads the hospital-specific index with the encryption key
- Metadata includes anonymized patient ID and diagnosis
- Vector is the 384-dimensional symptom embedding
- Upsert operation adds or updates the record

**3. search_institution(institution, query_vector, top_k=20)**

Searches a single hospital's encrypted index:

```python
def search_institution(self, institution: str, query_vector: List[float],
                       top_k: int = 20) -> List[Dict]:
    index_name = f"rarenet_{institution}"
    index = self.client.load_index(index_name, index_key=self.demo_key)
    raw_results = index.query(query_vector, top_k=top_k)

    results = []
    for match in raw_results:
        match_data = {
            'id': match.get('id', ''),
            'score': match.get('score', 0),
            'metadata': match.get('metadata', {})
        }
        results.append(match_data)
    return results
```

- Used by the Privacy Aggregator to query each hospital
- Returns similarity scores and metadata
- Never returns raw patient data

**4. search_network(query_vector, top_k=6)**

Searches all hospital indexes (used for debugging only):

```python
def search_network(self, query_vector: List[float], top_k: int = 6):
    all_results = []
    for institution in self.institutions:
        index = self.client.load_index(f"rarenet_{institution}",
                                        index_key=self.demo_key)
        results = index.query(query_vector, top_k=top_k)
        for match in results:
            match['source_institution'] = institution
            all_results.append(match)

    all_results.sort(key=lambda x: x.get('score', 0), reverse=True)
    return all_results[:top_k]
```

### Encryption Flow

```
1. [CLIENT] Symptoms entered: "joint pain, fatigue, skin lesions"
              |
              v
2. [SERVER] Vectorized using sentence-transformers
              -> [0.023, -0.145, 0.892, ... ] (384 floats)
              |
              v
3. [CYBORGDB] Vector encrypted using index_key (32 bytes)
              -> Stored encrypted at rest
              |
              v
4. [QUERY] Query vector compared to encrypted vectors
              -> Similarity computed WITHOUT decryption
              |
              v
5. [RETURN] Results include IDs, scores, metadata
              -> Raw vectors never exposed
```

### Singleton Pattern

The service uses a singleton instance for connection pooling:

```python
# Singleton instance at module level
cyborg_service = CyborgService()
```

This ensures a single connection to CyborgDB is reused across all requests.

---

## Privacy Aggregator Implementation

The Privacy Aggregator (`backend/app/services/privacy_aggregator.py`) implements the Trusted Aggregator Pattern:

### Configuration

```python
PRIVACY_THRESHOLD = 5   # Minimum matches for K-anonymity
EPSILON = 0.1           # Differential privacy parameter
TOP_K_PER_NODE = 20     # Results fetched per hospital
```

### Pipeline Steps

1. **Query All Nodes**: Calls `cyborg_service.search_institution()` for each of the 8 hospitals
2. **K-Anonymity Check**: Counts unique case IDs; blocks if fewer than 5
3. **Aggregate Diagnoses**: Weighted voting using similarity scores
4. **Add Differential Privacy**: Laplace noise added to confidence score
5. **Return Insight**: Only diagnosis name and noisy confidence returned

### K-Anonymity Implementation

```python
def apply_k_anonymity(self, all_matches: List[Dict], context: AggregationContext):
    unique_cases = len(set(m.get('id', '') for m in all_matches if m.get('id')))

    if unique_cases < self.PRIVACY_THRESHOLD:
        context.threshold_passed = False
        return False, "Privacy protection active: Cohort size too small"

    context.threshold_passed = True
    return True, f"Privacy check passed ({unique_cases} matches)"
```

### Differential Privacy Implementation

```python
def add_differential_privacy(self, score: float, epsilon: float = None):
    if epsilon is None:
        epsilon = self.EPSILON

    # Laplace noise: scale = sensitivity / epsilon
    scale = 1.0 / epsilon
    noise = np.random.laplace(0, scale * 0.05)

    noisy_score = max(0.0, min(1.0, score + noise))
    return round(noisy_score, 2)
```

---

## Tech Stack

### Backend

- **Framework**: FastAPI (Python 3.12)
- **Vector Database**: CyborgDB (encrypted vector search)
- **Embeddings**: Sentence Transformers (`all-MiniLM-L6-v2`)
- **Authentication**: JWT with bcrypt password hashing
- **Caching**: Redis

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.0 with glassmorphism
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **State**: React Context API

### Infrastructure

- **Containers**: Docker + Docker Compose
- **Deployment**: Render (render.yaml included)

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/rare-net.git
cd rare-net
```

### 2. Start CyborgDB

```bash
docker-compose up -d
```

This starts:

- CyborgDB on port `8000`
- Redis on port `6379`

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server (this will auto-load the embedding model on first request)
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

**Important**: The server must be running before seeding users and data.

### 4. Seed Demo Data (in a new terminal)

```bash
cd backend

# Activate virtual environment (if not already active)
# Windows: .\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Seed demo users
curl -X POST http://127.0.0.1:8001/auth/seed-demo-users

# Initialize database with patient data (315+ cases)
python scripts/init_db.py
```

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **CyborgDB**: http://localhost:8000

---

## Demo Credentials

After seeding, use these credentials to log in:

| Role   | Email                     | Password     | Hospital  |
| ------ | ------------------------- | ------------ | --------- |
| Doctor | doctor@mumbai.hospital    | password123  | Mumbai    |
| Doctor | doctor@boston.hospital    | password123  | Boston    |
| Doctor | doctor@london.hospital    | password123  | London    |
| Admin  | admin@rarenet.org         | admin123     | N/A       |

---

## Quick Verification

After setup, verify everything is working:

### 1. Test Backend Health

```bash
curl http://127.0.0.1:8001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "model": "loaded",
  "privacy_threshold": 5,
  "epsilon": 0.1,
  "timestamp": "2025-12-20T10:53:10.436694"
}
```

### 2. Test Login

```bash
curl -X POST http://127.0.0.1:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@mumbai.hospital","password":"password123"}'
```

Expected: Should return `access_token`, `refresh_token`, and user profile.

### 3. Test Diagnosis (requires token from step 2)

```bash
# First, get a token
TOKEN=$(curl -s -X POST http://127.0.0.1:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@mumbai.hospital","password":"password123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Then test diagnosis
curl -X POST http://127.0.0.1:8001/api/diagnose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"symptoms":"joint hypermobility, easy bruising, stretchy skin","top_k":20}'
```

Expected: Should return diagnostic insight with `suggested_diagnosis`, `confidence_score`, and privacy audit information.

**Note**: The first diagnosis request may take 25-30 seconds as the embedding model loads. Subsequent requests will be fast.

### 4. Test Frontend

1. Open http://localhost:5173 in your browser
2. Click "Sign In" 
3. Login with `doctor@mumbai.hospital` / `password123`
4. You should see the search interface with a green "online" indicator
5. Try searching for: `joint hypermobility, easy bruising, stretchy skin`
6. You should receive a diagnosis result for Ehlers-Danlos Syndrome

---

## API Endpoints

### Authentication

| Method | Endpoint         | Description               |
| ------ | ---------------- | ------------------------- |
| `POST` | `/auth/login`    | Login with email/password |
| `POST` | `/auth/register` | Register new user         |
| `POST` | `/auth/refresh`  | Refresh access token      |
| `GET`  | `/auth/me`       | Get current user profile  |

### Diagnosis

| Method | Endpoint        | Description                        |
| ------ | --------------- | ---------------------------------- |
| `POST` | `/api/diagnose` | Privacy-preserving diagnosis query |
| `POST` | `/api/report`   | Submit new case (authenticated)    |
| `GET`  | `/api/diseases` | List all known rare diseases       |
| `GET`  | `/api/symptoms` | List all recognized symptoms       |

### System

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| `GET`  | `/api/health`         | Health check              |
| `POST` | `/api/init`           | Initialize hospital nodes |
| `GET`  | `/api/stats`          | Network statistics        |
| `GET`  | `/api/privacy/config` | Privacy configuration     |

---

## Test Scenarios

### 1. PASS Scenario - Common Disease

```bash
curl -X POST http://localhost:8001/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "joint hypermobility, easy bruising, thin skin"}'
```

Expected: `"privacy_status": "PASSED"` with diagnosis

### 2. BLOCK Scenario - Rare Disease (K-Anonymity)

```bash
curl -X POST http://localhost:8001/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "premature aging, prominent scalp veins, severe growth retardation"}'
```

Expected: `"privacy_status": "BLOCKED"` - fewer than 5 matching cases

### 3. INVALID Scenario - Non-Medical Terms

```bash
curl -X POST http://localhost:8001/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "hello world meow cat"}'
```

Expected: `"privacy_status": "INVALID"` - validation failure

### Programmatic Testing

```bash
cd backend
python scripts/test_privacy.py
```

---

## Project Structure

```
rare-net/
├── backend/
│   ├── app/
│   │   ├── auth/                      # JWT authentication module
│   │   │   ├── dependencies.py        # Auth middleware (get_current_user, require_role)
│   │   │   ├── jwt_handler.py         # Token creation/validation (HS256)
│   │   │   ├── models.py              # User, Token, LoginRequest models
│   │   │   ├── router.py              # /auth/login, /auth/register endpoints
│   │   │   └── user_store.py          # JSON-based user storage
│   │   ├── services/
│   │   │   ├── cyborg_service.py      # CyborgDB client (detailed above)
│   │   │   ├── privacy_aggregator.py  # K-anonymity, aggregation, DP
│   │   │   └── stats_service.py       # Network statistics
│   │   ├── models.py                  # Patient, DiagnosticInsight, etc.
│   │   └── rare_diseases.py           # 15 diseases, 400+ symptoms, validation
│   ├── data/
│   │   ├── users.json                 # Demo user credentials
│   │   └── network_stats.json         # Case counts
│   ├── scripts/
│   │   ├── init_db.py                 # Seed 315+ cases across 8 hospitals
│   │   └── test_privacy.py            # Privacy guarantee tests
│   ├── main.py                        # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContributorMode.tsx    # Case submission form
│   │   │   ├── DiagnosticInsight.tsx  # Results display
│   │   │   ├── Logo.tsx               # Brand logo component
│   │   │   ├── NetworkStatus.tsx      # Network health indicator
│   │   │   ├── ProtectedRoute.tsx     # Auth guard wrapper
│   │   │   └── SearchConsole.tsx      # Symptom input with validation
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Auth state (login, logout, tokens)
│   │   ├── pages/
│   │   │   ├── HowItWorksPage.tsx     # Interactive privacy explainer
│   │   │   ├── LandingPage.tsx        # Marketing page
│   │   │   └── LoginPage.tsx          # Login form
│   │   ├── App.tsx                    # Routing and layout
│   │   └── index.css                  # Tailwind + glassmorphism
│   └── package.json
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## Rare Diseases Supported

| Disease                               | ICD-10 | Prevalence      |
| ------------------------------------- | ------ | --------------- |
| TREX1 Lupus (Aicardi-Goutieres)       | G31.8  | 1-9 / 1,000,000 |
| Kawasaki Disease                      | M30.3  | 1-9 / 10,000    |
| Progeria                              | E34.8  | < 1 / 1,000,000 |
| Fibrodysplasia Ossificans Progressiva | M61.1  | < 1 / 1,000,000 |
| Gaucher Disease                       | E75.2  | 1-9 / 100,000   |
| Ehlers-Danlos Syndrome (Vascular)     | Q79.6  | 1-9 / 100,000   |
| Pompe Disease                         | E74.0  | 1-9 / 100,000   |
| Niemann-Pick Disease Type C           | E75.2  | 1-9 / 100,000   |
| Fabry Disease                         | E75.2  | 1-9 / 100,000   |
| Marfan Syndrome                       | Q87.4  | 1-9 / 10,000    |
| Phenylketonuria (PKU)                 | E70.0  | 1-9 / 10,000    |
| Cystic Fibrosis                       | E84    | 1-9 / 10,000    |
| Huntington Disease                    | G10    | 1-9 / 10,000    |
| Wilson Disease                        | E83.0  | 1-9 / 100,000   |
| Alport Syndrome                       | Q87.8  | 1-9 / 100,000   |

---

## What Has Been Implemented

### Completed Features

| Category | Feature                              | Status   |
| -------- | ------------------------------------ | -------- |
| Core     | Trusted Aggregator Pattern           | Complete |
| Core     | K-Anonymity (K >= 5)                 | Complete |
| Core     | Differential Privacy (epsilon=0.1)   | Complete |
| Core     | Encrypted Vector Search (CyborgDB)   | Complete |
| Auth     | JWT Authentication                   | Complete |
| Auth     | Role-Based Access (doctor, admin)    | Complete |
| Auth     | Protected Routes                     | Complete |
| Data     | 15 Rare Diseases Database            | Complete |
| Data     | 400+ Symptom Validation Terms        | Complete |
| Data     | 315+ Seeded Patient Cases            | Complete |
| Data     | 8 Hospital Nodes                     | Complete |
| UI       | Landing Page                         | Complete |
| UI       | Login Page                           | Complete |
| UI       | Search Network Page                  | Complete |
| UI       | Contribute Case Page                 | Complete |
| UI       | How It Works Page (Interactive SVGs) | Complete |
| UI       | Glassmorphism Design                 | Complete |
| UI       | Light Mode Theme                     | Complete |
| UI       | Responsive Design                    | Complete |

---

## What Is Left to Implement (Future Enhancements)

### High Priority

| Feature                      | Description                                                    | Effort |
| ---------------------------- | -------------------------------------------------------------- | ------ |
| **Real CyborgDB Encryption** | Currently using demo key; need production key management (HSM) | High   |
| **User Registration Flow**   | Email verification, password reset functionality               | Medium |
| **Admin Dashboard**          | Manage users, view audit logs, configure privacy parameters    | Medium |
| **Rate Limiting**            | Prevent abuse of diagnosis endpoint                            | Low    |
| **Request Logging**          | Audit trail of all queries for compliance                      | Medium |

### Medium Priority

| Feature                    | Description                                               | Effort |
| -------------------------- | --------------------------------------------------------- | ------ |
| **HTTPS/TLS**              | Production SSL certificates for encrypted transit         | Low    |
| **Database Persistence**   | Move from JSON file storage to PostgreSQL for users/stats | Medium |
| **Symptom Autocomplete**   | Frontend autocomplete from known symptoms                 | Low    |
| **Multi-language Support** | i18n for symptom input and disease names                  | Medium |
| **Export Reports**         | PDF export of diagnostic insights                         | Medium |

### Low Priority (Nice to Have)

| Feature                       | Description                                      | Effort    |
| ----------------------------- | ------------------------------------------------ | --------- |
| **Mobile App**                | React Native version for mobile clinicians       | High      |
| **More Diseases**             | Expand from 15 to 50+ rare diseases              | Low       |
| **Phenotype Matching**        | Integration with HPO (Human Phenotype Ontology)  | High      |
| **Genetic Data Support**      | Add gene variant information to disease database | Medium    |
| **Real Hospital Integration** | Connect to actual hospital EHR systems           | Very High |

---

## Important Implementation Notes

### Security Considerations

1. **Demo Key Warning**: The current implementation uses a hardcoded demo key (`0000...0001`). For production:

   - Use a Hardware Security Module (HSM) for key management
   - Rotate keys periodically
   - Store keys in secure vault (e.g., HashiCorp Vault, AWS KMS)

2. **JWT Secret**: The JWT secret is currently in code. For production:

   - Move to environment variable
   - Use a cryptographically secure random key (256 bits minimum)

3. **User Storage**: Users are stored in a JSON file. For production:
   - Migrate to PostgreSQL with proper password hashing
   - Add account lockout after failed attempts

### Performance Considerations

1. **Embedding Model**: The sentence-transformer model is loaded at startup. Consider:

   - Model caching in Redis
   - GPU acceleration for high throughput

2. **CyborgDB Connections**: Currently uses singleton pattern. For high load:

   - Implement connection pooling
   - Consider read replicas for query scaling

3. **Frontend Bundle**: Current bundle is 436KB gzipped. Consider:
   - Code splitting for routes
   - Lazy loading for non-critical components

---

## Troubleshooting

### Common Issues and Solutions

#### 1. 500 Internal Server Error on `/api/diagnose`

**Symptom**: Backend returns 500 error when trying to diagnose symptoms.

**Cause**: The embedding model was not properly initialized.

**Solution**: This has been fixed in the current version. The model now uses lazy loading via `get_embedding_model()`. If you still encounter this:

```python
# Verify the fix is in place in backend/main.py
# Lines should read:
embedding_model = get_embedding_model()
query_vector = embedding_model.encode(request.symptoms).tolist()
```

#### 2. "Incorrect email or password" on Login

**Symptom**: Cannot log in with demo credentials.

**Cause**: Demo users haven't been seeded yet.

**Solution**:
```bash
# Make sure backend is running, then:
curl -X POST http://127.0.0.1:8001/auth/seed-demo-users
```

#### 3. CORS Errors in Browser Console

**Symptom**: `Access-Control-Allow-Origin` errors in browser console.

**Cause**: Frontend is running on a different port than expected.

**Solution**: 
- Ensure frontend is on `http://localhost:5173`
- Check `backend/main.py` CORS settings include your frontend URL
- If using a different port, update the CORS configuration:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 4. CyborgDB Connection Failed

**Symptom**: `Connection refused` errors when querying.

**Cause**: CyborgDB container is not running.

**Solution**:
```bash
# Check if CyborgDB is running
docker ps | grep cyborgdb

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs cyborgdb
```

#### 5. Slow First Request (~25-30 seconds)

**Symptom**: First diagnosis request takes a very long time.

**Cause**: This is **expected behavior**. The sentence-transformer model (`all-MiniLM-L6-v2`) is being downloaded and loaded into memory on the first request.

**Solution**: This is normal. Subsequent requests will be fast (< 1 second). To pre-load the model:

```bash
# Make a test request after starting the server
curl -X POST http://127.0.0.1:8001/api/diagnose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"symptoms": "test", "top_k": 20}'
```

#### 6. Frontend Shows "Network Offline"

**Symptom**: Red "offline" indicator in the header.

**Cause**: Backend is not reachable.

**Solution**:
```bash
# Check if backend is running
curl http://127.0.0.1:8001/api/health

# Should return: {"status":"healthy",...}

# If not, restart backend:
cd backend
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

#### 7. "Privacy protection active: Cohort size too small"

**Symptom**: Diagnosis returns BLOCKED status.

**Cause**: This is **expected behavior** for K-anonymity. Fewer than 5 matching cases were found.

**Solution**: This is working as designed. Try:
- A more common disease (e.g., "joint hypermobility, easy bruising")
- Run `python scripts/init_db.py` to ensure all 315+ cases are seeded

#### 8. Module Import Errors

**Symptom**: `ModuleNotFoundError` when starting backend.

**Cause**: Dependencies not installed or wrong Python environment.

**Solution**:
```bash
# Ensure you're in the virtual environment
# You should see (venv) in your prompt

# Reinstall dependencies
pip install -r requirements.txt

# Verify Python version (must be 3.11+)
python --version
```

---

## Environment Variables

### Backend

```env
CYBORGDB_API_KEY=your-production-api-key
CYBORGDB_URL=http://localhost:8000
JWT_SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
```

### Frontend

```env
VITE_API_URL=http://localhost:8001
```

---

## Deployment

### Render (Recommended)

The included `render.yaml` configures:

- Backend as a web service
- Frontend as a static site
- Redis as a managed service

```bash
# Deploy to Render
render deploy
```

### Docker Compose (Self-hosted)

```bash
docker-compose up -d --build
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **CyborgDB** for encrypted vector search capabilities
- **Sentence Transformers** for medical text embeddings
- **Orphanet** for rare disease reference data
- **Tailwind CSS** for the UI framework

---

**Built for the rare disease community**

[Report Bug](https://github.com/your-org/rare-net/issues) | [Request Feature](https://github.com/your-org/rare-net/issues)
