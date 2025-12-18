# RareNet

**RareNet** — Privacy-Preserving Cross-Institutional Rare Disease Diagnosis Network powered by CyborgDB.

## Overview

RareNet enables hospitals worldwide to search for similar rare disease cases across encrypted patient databases without exposing Protected Health Information (PHI). Using CyborgDB's encrypted vector storage, symptom patterns can be compared across institutions while maintaining full data privacy.

## Features

- 🔐 **Zero-Knowledge Search** — Query encrypted patient vectors without decryption
- 🌍 **Multi-Institution Network** — Connected to Mumbai, Boston, and London hospitals
- 🧬 **15+ Rare Diseases** — Comprehensive database including TREX1 Lupus, Kawasaki, Progeria, and more
- ⚡ **Real-time Matching** — Semantic similarity search using sentence transformers
- 🎨 **Modern UI** — Beautiful glassmorphism design with smooth animations

## Tech Stack

| Component  | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion |
| Backend    | Python 3.12 + FastAPI                                       |
| Vector DB  | CyborgDB (encrypted vector storage)                         |
| Cache      | Redis                                                       |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2)                    |

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — Required for CyborgDB and Redis
- Python 3.12+
- Node.js 18+

### 1. Start Docker Services

**Important**: Open Docker Desktop first and ensure it's running (whale icon in menu bar).

```bash
# Start CyborgDB and Redis containers
docker-compose up -d

# Verify containers are running
docker ps
```

You should see `rare-net-cyborgdb-1` and `rare-net-redis-1` running.

### 2. Start Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8001
```

Backend runs at: http://localhost:8001

### 3. Initialize Database with Sample Data

In a new terminal (with backend venv activated):

```bash
cd backend
source venv/bin/activate

# Populate database with rare disease cases
python scripts/simulate_data.py
```

This creates ~120 synthetic patient records across 3 institutions with 15+ rare diseases.

### 4. Start Frontend

In a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

## Demo Scenarios

Once everything is running, try these searches:

| Search Query                                        | Expected Results                       |
| --------------------------------------------------- | -------------------------------------- |
| `chilblain lesions, raynaud phenomenon, joint pain` | TREX1 Lupus cases from Boston & London |
| `strawberry tongue, high fever, rash, red eyes`     | Kawasaki Disease from Mumbai           |
| `enlarged spleen, bone pain, anemia`                | Gaucher Disease                        |
| `muscle weakness, cardiomegaly, respiratory issues` | Pompe Disease                          |
| `tall stature, long fingers, lens dislocation`      | Marfan Syndrome                        |

## API Endpoints

| Endpoint        | Method | Description                |
| --------------- | ------ | -------------------------- |
| `/`             | GET    | Health check               |
| `/api/health`   | GET    | Detailed health status     |
| `/api/search`   | POST   | Search for similar cases   |
| `/api/diseases` | GET    | List all rare diseases     |
| `/api/symptoms` | GET    | List all symptoms          |
| `/api/init`     | POST   | Initialize network indices |

API Documentation: http://localhost:8001/docs

## Project Structure

```
rare-net/
├── backend/
│   ├── app/
│   │   ├── models.py           # Pydantic models
│   │   ├── rare_diseases.py    # Disease database
│   │   └── services/
│   │       └── cyborg_service.py
│   ├── scripts/
│   │   ├── simulate_data.py    # Generate test data
│   │   └── verify_cyborg.py
│   ├── main.py                 # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── WorldMap.tsx
│   │   │   ├── SearchConsole.tsx
│   │   │   └── ResultsGrid.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Common Commands

```bash
# Stop all Docker services
docker-compose down

# View Docker logs
docker-compose logs -f

# Reset database
cd backend && python scripts/reset_db.py

# Run backend tests
cd backend && pytest

# Build frontend for production
cd frontend && npm run build
```

## Troubleshooting

### "Cannot connect to the Docker daemon"

→ Open Docker Desktop and wait for it to fully start

### "Port 8000 already allocated"

→ CyborgDB uses port 8000. Kill the conflicting process: `lsof -i :8000`

### "Connection refused" when searching

→ Ensure backend is running on port 8001 and Docker services are up

### No results from search

→ Run `python scripts/simulate_data.py` to populate the database

## Privacy & Security

- **No PII Storage**: Only symptom vectors and anonymized metadata stored
- **Encrypted at Rest**: CyborgDB encrypts all vectors
- **Encrypted in Transit**: HTTPS for production deployments
- **Institution Isolation**: Each hospital's data in separate encrypted indices

## License

MIT License — Built for Healthcare Hackathon 2024
