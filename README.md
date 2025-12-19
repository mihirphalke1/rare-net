# RareNet

**RareNet** — Privacy-Preserving Cross-Institutional Rare Disease Diagnosis Network

A Trusted Aggregator architecture that enables hospitals to query encrypted patient databases across institutions while protecting patient privacy through K-anonymity, aggregation, and differential privacy.

## What's New in v4.0

- **JWT Authentication** — Role-based access control with Doctor and Admin roles
- **Contributor Mode** — Doctors can securely upload confirmed cases to their hospital's encrypted database
- **Live Network Stats** — Real-time case counter showing contributions across the network
- **Enhanced Privacy Pipeline** — Visual encryption step annotations for evaluators
- **Query Validation** — Rejects non-medical terms to ensure meaningful results

## Privacy Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Doctor)                                │
│                     Receives: Aggregated Insight ONLY                       │
│              ✗ No Patient IDs  ✗ No Institution Names  ✗ No Raw Data       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRUSTED AGGREGATOR (Backend)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Query All  │→│ K-Anonymity  │→│  Aggregate   │→│ Differential │   │
│  │    Nodes     │  │    Check     │  │   Votes      │  │   Privacy    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │              K ≥ 5?            Weighted        Add Noise         │
│         │           (Block if <5)        Voting         (ε = 0.1)         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │   Mumbai     │  │   Boston     │  │   London     │
            │  CyborgDB    │  │  CyborgDB    │  │  CyborgDB    │
            │  (Encrypted) │  │  (Encrypted) │  │  (Encrypted) │
            └──────────────┘  └──────────────┘  └──────────────┘
```

## Key Privacy Features

| Feature                  | Description                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| **K-Anonymity**          | Results blocked if < 5 matching cases (prevents identifying rare patients) |
| **Aggregation**          | Only diagnosis name + confidence returned, never patient details           |
| **Differential Privacy** | Laplace noise (ε=0.1) added to confidence scores                           |
| **No PII Leakage**       | Patient IDs and institution sources never leave the server                 |
| **Encrypted Storage**    | CyborgDB encrypts vectors at rest and during search operations             |

## Tech Stack

| Component      | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| Frontend       | React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion |
| Backend        | Python 3.12 + FastAPI                                       |
| Vector DB      | CyborgDB (encrypted vector storage)                         |
| Cache          | Redis                                                       |
| Embeddings     | Sentence Transformers (all-MiniLM-L6-v2)                    |
| Authentication | JWT with bcrypt password hashing                            |
| Privacy        | K-Anonymity + Differential Privacy + Aggregation            |

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — Required for CyborgDB and Redis
- Python 3.12+
- Node.js 18+

### 1. Start Docker Services

```bash
# From project root
docker-compose up -d
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Seed demo users and database
python -c "from app.auth.user_store import seed_demo_users; seed_demo_users()"
python scripts/init_db.py

# Start server
uvicorn main:app --reload --port 8001
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application

Open **http://localhost:5173** and login with:

| Email                  | Password    | Role   | Hospital |
| ---------------------- | ----------- | ------ | -------- |
| doctor@mumbai.hospital | password123 | Doctor | Mumbai   |
| doctor@boston.hospital | password123 | Doctor | Boston   |
| doctor@london.hospital | password123 | Doctor | London   |
| admin@rarenet.org      | admin123    | Admin  | Global   |

## Demo Scenarios

### 1. Diagnose Mode (Read)

Search for symptoms to get privacy-safe diagnostic suggestions:

| Search Query                                      | Expected Result        |
| ------------------------------------------------- | ---------------------- |
| joint hypermobility, stretchy skin, easy bruising | Ehlers-Danlos Syndrome |
| strawberry tongue, high fever, rash               | Kawasaki Disease       |
| chilblain lesions, raynaud phenomenon             | TREX1 Lupus            |

### 2. Privacy Block Test

Search: `severe growth retardation, premature aging, alopecia`

Expected: **Privacy Protection Active** — Only 2 cases exist globally, below K=5 threshold.

### 3. Query Validation Test

Search: `hello world meow`

Expected: **Invalid Query** — Non-medical terms rejected.

### 4. Contributor Mode (Write)

1. Login as any doctor
2. Switch to "Contribute" tab
3. Enter symptoms and select diagnosis
4. Click "Encrypt & Upload"
5. Watch network stats counter increment

## API Endpoints

### Authentication

| Endpoint         | Method | Description                  |
| ---------------- | ------ | ---------------------------- |
| `/auth/login`    | POST   | Get JWT token                |
| `/auth/me`       | GET    | Get current user info        |
| `/auth/refresh`  | POST   | Refresh access token         |
| `/auth/register` | POST   | Create new user (admin only) |

### Diagnosis & Reporting

| Endpoint        | Method | Auth Required | Description                          |
| --------------- | ------ | ------------- | ------------------------------------ |
| `/api/diagnose` | POST   | Yes           | Privacy-safe diagnosis (K-anon + DP) |
| `/api/report`   | POST   | Doctor        | Upload confirmed case to hospital    |
| `/api/validate` | POST   | No            | Validate symptom query               |

### Reference & Stats

| Endpoint              | Method | Description                   |
| --------------------- | ------ | ----------------------------- |
| `/api/stats`          | GET    | Network statistics            |
| `/api/diseases`       | GET    | List all rare diseases        |
| `/api/symptoms`       | GET    | List all symptoms             |
| `/api/privacy/config` | GET    | Privacy configuration details |
| `/api/health`         | GET    | Health check                  |

**API Documentation:** http://localhost:8001/docs

## Privacy Pipeline (for Judges)

```
1. [CLIENT]  Symptoms entered as plaintext
2. [SERVER]  Vectorized using sentence-transformers (384 dims)
3. [CYBORG]  Vector encrypted at rest in CyborgDB index
4. [CYBORG]  Similarity search performed on ENCRYPTED vectors
5. [SERVER]  K-anonymity check: require >= 5 matches
6. [SERVER]  Aggregation: weighted voting on diagnoses
7. [SERVER]  Differential privacy: Laplace noise added (ε=0.1)
8. [CLIENT]  Only diagnosis label + noisy confidence returned
```

## Project Structure

```
rare-net/
├── backend/
│   ├── app/
│   │   ├── auth/              # JWT authentication module
│   │   │   ├── models.py      # User, Token models
│   │   │   ├── jwt_handler.py # Token creation/verification
│   │   │   ├── router.py      # Auth endpoints
│   │   │   ├── dependencies.py # Auth middleware
│   │   │   └── user_store.py  # User storage (JSON)
│   │   ├── services/
│   │   │   ├── cyborg_service.py     # CyborgDB client
│   │   │   ├── privacy_aggregator.py # Trusted Aggregator
│   │   │   └── stats_service.py      # Network stats
│   │   ├── models.py          # API models
│   │   └── rare_diseases.py   # Disease database
│   ├── data/
│   │   ├── users.json         # Demo users
│   │   └── network_stats.json # Case statistics
│   ├── scripts/
│   │   └── init_db.py         # Database seeding
│   └── main.py                # FastAPI app
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchConsole.tsx
│   │   │   ├── DiagnosticInsight.tsx
│   │   │   ├── ContributorMode.tsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## Troubleshooting

### "Cannot connect to the Docker daemon"

→ Open Docker Desktop and wait for it to fully start

### "Port 8001 already in use"

→ Kill the process: `lsof -ti:8001 | xargs kill`

### "Connection refused" when searching

→ Ensure backend is running on port 8001 and Docker services are up

### "Invalid credentials" on login

→ Run: `python -c "from app.auth.user_store import seed_demo_users; seed_demo_users()"`

### No results from search

→ Run: `python scripts/init_db.py` to populate the database

## License

MIT License — Built for the CyborgDB Hackathon 2024
