# Cursor Prompts for RareNet Implementation

This file contains a series of detailed prompts to be used with Cursor (or another AI coding assistant) to build the RareNet project. Follow these prompts sequentially.

## Prompt 1: Project Initialization

**Goal:** Set up a monorepo structure for RareNet with a Next.js frontend and a FastAPI backend.

**Instructions:**

1.  **Directory Structure**:
    *   Inside `rare-net`, create two directories: `frontend` and `backend`.
2.  **Frontend Setup (`frontend`)**:
    *   Initialize a React (or latest) application using `npx create-react-app . --typescript --tailwind --eslint`.
    *   Select "Yes" for App Router, "No" for `src` directory (keep it simple), "Yes" for import alias (`@/*`).
    *   Install additional UI dependencies: `framer-motion` (for animations), `lucide-react` (for icons), `clsx`, `tailwind-merge`.
    *   Clean up the default `page.tsx` and `globals.css` to be empty/minimal.
3.  **Backend Setup (`backend`)**:
    *   Initialize a Python project. Create a virtual environment `venv`.
    *   Create a `requirements.txt` with: `fastapi`, `uvicorn`, `pydantic`, `python-dotenv`, `cyborgdb`, `faker` (for synthetic data), `numpy`.
    *   Create a `main.py` entry point.
    *   Create a `app` directory with `__init__.py`.
4.  **Root Configuration**:
    *   Create a `docker-compose.yml` in the root (we will fill this later).
    *   Create a `README.md` with the project title "RareNet".

**Action:** Execute the setup commands and create the file structure.

---

## Prompt 2: Infrastructure & CyborgDB Setup

**Goal:** Configure the local infrastructure using Docker Compose to run CyborgDB Service and a backing store (PostgreSQL/Redis).

**Instructions:**

1.  **Docker Compose (`docker-compose.yml`)**:
    *   Define a service `cyborgdb`:
        *   Image: `cyborginc/cyborgdb-service:latest` (or specific version if known, e.g., `v0.12.0`).
        *   Ports: `8000:8000`.
        *   Environment Variables:
            *   `CYBORGDB_API_KEY`: `rare-net-secret-key` (for local dev).
            *   `CYBORGDB_DB_TYPE`: `redis` (simpler for hackathon) or `postgres`. Let's use `redis`.
            *   `CYBORGDB_CONNECTION_STRING`: `redis://redis:6379`.
        *   Depends on: `redis`.
    *   Define a service `redis`:
        *   Image: `redis:alpine`.
        *   Ports: `6379:6379`.
2.  **Backend Environment**:
    *   In `backend/.env`, set:
        *   `CYBORGDB_URL`: `http://localhost:8000`
        *   `CYBORGDB_API_KEY`: `rare-net-secret-key`
3.  **Verification Script**:
    *   Create `backend/scripts/verify_cyborg.py`.
    *   Use `cyborgdb` client to connect to the service.
    *   Try to check health or list indices to confirm connection.

**Action:** Create the docker-compose file and the verification script. Run `docker-compose up -d` and then run the script to verify.

---

## Prompt 3: Backend Core & CyborgDB Integration

**Goal:** Implement the FastAPI backend with CyborgDB integration for storing and searching encrypted patient vectors.

**Instructions:**

1.  **Data Models (`backend/app/models.py`)**:
    *   `Patient`: `id` (str), `institution_id` (str), `symptoms` (str), `diagnosis` (str, optional), `demographics` (dict).
    *   `SymptomVector`: `vector` (list[float]), `metadata` (dict).
2.  **CyborgDB Service (`backend/app/services/cyborg_service.py`)**:
    *   Initialize `cyborgdb.Client`.
        *   **Important**: Ensure `CYBORGDB_URL` from env handles missing scheme (prepend `http://` if needed) for Render compatibility.
    *   Implement `create_institution_index(institution_id: str)`:
        *   Create a new index in CyborgDB named `rarenet_{institution_id}`.
        *   Use a standard dimension (e.g., 384 for `all-MiniLM-L6-v2` or similar).
    *   Implement `store_patient(patient: Patient, vector: list[float])`:
        *   Upsert the vector into the institution's index.
        *   Metadata should include `patient_id` and `institution_id` (but NO PII).
    *   Implement `search_network(query_vector: list[float], top_k: int = 5)`:
        *   Iterate through all known institution indices (e.g., "mumbai", "boston", "london").
        *   Search each index.
        *   Aggregate and rank results.
3.  **API Routes (`backend/app/main.py`)**:
    *   `POST /api/init`: Initialize indices for simulated hospitals.
    *   `POST /api/search`: Accept symptom text, convert to vector (mock or use sentence-transformers), search network.
    *   `POST /api/patient`: Add a new patient record.

**Note on Encryption:** CyborgDB handles the vector encryption internally. Ensure we highlight this in comments.

**Action:** Implement the backend logic.

---

## Prompt 4: Synthetic Data Simulation

**Goal:** Generate realistic synthetic patient data for "Mumbai General", "Boston Children's", and "London UCH" to simulate the RareNet network.

**Instructions:**

1.  **Simulation Script (`backend/scripts/simulate_data.py`)**:
    *   Use `faker` and `numpy` to generate data.
    *   Define a list of Rare Diseases (e.g., "Kawasaki Disease", "Progeria", "TREX1 Lupus").
    *   For each disease, define a "symptom profile" (keywords).
    *   **Institutions**:
        *   `mumbai`: 1000 records.
        *   `boston`: 1000 records.
        *   `london`: 1000 records.
    *   **The "Ghost Patient"**:
        *   Create a specific patient in `mumbai` with ambiguous symptoms matching "TREX1 Lupus".
        *   Ensure `mumbai` has NO other cases of this.
        *   Ensure `boston` and `london` HAVE clusters of this disease.
2.  **Ingestion**:
    *   The script should iterate through the generated data.
    *   Convert symptoms to vectors (use a simple deterministic hash or a real lightweight model like `sentence-transformers` if possible, otherwise mock it with consistent random seeds for the hackathon). *Better: Use `sentence-transformers` for "Technical Execution" points.*
    *   Call the `store_patient` API (or service function) to save to CyborgDB.

**Action:** Create and run the simulation script to populate the database.

---

## Prompt 5: Frontend Dashboard (The "Wow" Factor)

**Goal:** Build a high-fidelity, "Glassmorphism" style dashboard for RareNet.

**Instructions:**

1.  **Design System (`frontend/tailwind.config.ts`)**:
    *   Colors: Deep Medical Blue (`#0f172a`), Neon Cyan (`#06b6d4`) for accents, Translucent White for glass effect.
    *   Fonts: `Inter` or `Outfit`.
2.  **Components**:
    *   `Navbar`: Logo "RareNet", Status "Network Secure | CyborgDB Active".
    *   `WorldMap`: A visual representation (SVG or simple div map) showing the 3 nodes (Mumbai, Boston, London) with pulsing "Encrypted Link" lines.
    *   `SearchConsole`: A central input box "Enter Patient Symptoms...".
    *   `ResultsGrid`: Cards showing "Match Found" with "Similarity Score %".
        *   **Privacy Feature**: The cards should NOT show patient names. They should show "Patient #12345 (Boston)" and "Diagnosis: TREX1".
3.  **Pages**:
    *   `Home`: The main dashboard.
    *   **Interactive Flow**:
        1.  User selects "Mumbai General" view.
        2.  Enters symptoms for the "Ghost Patient".
        3.  Clicks "Scan Network".
        4.  Animation: "Encrypting Query..." -> "Broadcasting to CyborgDB..." -> "Retrieving Encrypted Matches...".
        5.  Results appear from Boston and London.
4.  **Tech Stack**: Use `framer-motion` for the "scanning" animations.

**Action:** Implement the frontend interface.

---

## Prompt 6: Deployment & Technical Feedback

**Goal:** Prepare for deployment on Render (Backend) and Vercel (Frontend), and gather metrics.

**Instructions:**

1.  **Deployment Config**:
    *   Ensure `render.yaml` is present in the root (already created).
    *   Ensure `frontend/vercel.json` (optional, or just standard Vercel setup) is ready.
    *   Update `backend/main.py` to handle CORS:
        *   Import `CORSMiddleware`.
        *   Allow origins from `os.getenv("FRONTEND_URL", "*")`.
2.  **Feedback Logger**:
    *   Add a simple logger in the backend to measure:
        *   `search_latency_ms`: Time taken for CyborgDB to return results.
        *   `encryption_overhead_ms`: Time taken to encrypt (if client-side) or network overhead.
    *   Create a `BENCHMARKS.md` file to record these observations during the demo.
3.  **Documentation**:
    *   Update `README.md` with "How to Run", "Architecture Diagram" (text description), and "Privacy Guarantee".

**Action:** Finalize the project for submission.
