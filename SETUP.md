# RareNet Setup Guide

## Prerequisites

1. **Docker Desktop** — must be running, with at least 4GB RAM allocated
2. **Python 3.9+**
3. **Node.js 16+**
4. **git**

---

## 1. Clone and install dependencies

```bash
git clone git@github.com:mihirphalke1/rare-net.git
cd rare-net

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

---

## 2. Environment variables

There is exactly **one** `.env` file for the whole project: `backend/.env`. Both the Python backend and `docker-compose.yml` (via `env_file:`) read from it — you do not need a second `.env` at the repo root.

Copy the example file and fill it in:

```bash
cp backend/.env.example backend/.env
```

`backend/.env` needs these values:

| Variable | What it is | How to get it |
|---|---|---|
| `CYBORGDB_URL` | Where the CyborgDB service is reachable | Default `http://localhost:8000` — correct as-is for the local Docker setup below. Only change this if you're pointing at a remote/hosted CyborgDB instance. |
| `CYBORGDB_API_KEY` | CyborgDB's own license/auth key, required by the pinned `cyborgdb-service:0.14.0` image to start at all | **Get a free temporary one yourself** — no signup needed: `python3 -c "import cyborgdb; print(cyborgdb.get_demo_api_key())"` (from an active venv with `cyborgdb` installed). **This demo key expires after 1 hour** — regenerate it whenever the CyborgDB container won't start or index calls start failing. For a permanent free key, sign up at your Cyborg account. Do **not** invent a random string here — the service validates it against Cyborg's own servers and rejects anything it doesn't recognize. |
| `CYBORGDB_MASTER_INDEX_KEY` | 32-byte (64 hex char) master key used to derive a distinct encryption key per hospital index — this one **is** purely local, RareNet's own | Generate your own: `python3 -c "import secrets; print(secrets.token_hex(32))"` (or `openssl rand -hex 32`). Never reuse the demo value in `.env.example` outside local dev — anyone who has it can decrypt every hospital's index. |
| `JWT_SECRET_KEY` | Signs login tokens | Generate your own: `openssl rand -hex 32`. **Required** — the app refuses to start without it, even locally. |
| `ALLOWED_ORIGINS` | Extra CORS origins, comma-separated | Optional. `http://127.0.0.1:5173`, `http://localhost:5173`, and `http://localhost:3000` are already allowed by default — only set this if your frontend runs somewhere else. |
| `ENVIRONMENT` | Disables `POST /auth/seed-demo-users` when set to `production` | Optional locally (leave unset). **Set to `production` on any real deployment** — that endpoint creates a well-known admin login (`admin@rarenet.org` / `admin123`) with no authentication, and this stops it from being callable outside local dev. Already set in `fly.backend.toml`. |

`frontend/.env` (create if missing):

```bash
VITE_API_URL=http://localhost:8001
```

No external key is needed for the frontend.

**Never commit `backend/.env` or `frontend/.env`.** Both are already in `.gitignore`.

**If you have an older `backend/.env` lying around from before this guide was updated,** regenerate `CYBORGDB_API_KEY` rather than reusing it — an earlier version of this repo had a real key hardcoded in `cyborg_service.py` and committed to git history, and that value should be treated as compromised even now that it's removed from the code.

---

## 3. Start CyborgDB

```bash
docker-compose up -d
```

This starts the `cyborgdb` service on port 8000, pinned to `cyborginc/cyborgdb-service:0.14.0` to match the Python client version in `requirements.txt` (see the comment in `docker-compose.yml` for why — newer images break patient storage with this client). It uses its own built-in standalone data store ("valkeylite") — no separate database container needed. It loads `CYBORGDB_API_KEY` straight from `backend/.env` via `env_file:`. Check it's healthy:

```bash
curl http://localhost:8000/v1/health
# should show "version":"0.14.0"
```

If it exits immediately, check the logs — a missing or expired `CYBORGDB_API_KEY` is the most common cause:

```bash
docker-compose logs cyborgdb
```

---

## 4. Start the backend

```bash
cd backend
source venv/bin/activate        # if not already active
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Verify it's up:

```bash
curl http://localhost:8001/api/health
```

---

## 5. Seed data

With the backend running, in a new terminal:

```bash
# 1. Create the demo login accounts (one-time; safe to call again, it's a no-op if users already exist)
curl -X POST http://localhost:8001/auth/seed-demo-users

# 2. Seed the 8-hospital patient network (146 cases across Mumbai, Boston, London,
#    Tokyo, Singapore, Toronto, São Paulo, Berlin)
cd backend
python scripts/seed_8_hospitals.py
python scripts/update_stats.py
```

To verify CyborgDB connectivity and the key setup independently:

```bash
python scripts/verify_cyborg.py
```

---

## 6. Start the frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

---

## 7. Access the application

- **Frontend:** http://localhost:5173
- **Backend docs:** http://localhost:8001/docs

**Demo logins** (created by the seed-demo-users step above, all doctor passwords are `password123`):

| Email | Hospital |
|---|---|
| `doctor@mumbai.hospital` | Mumbai |
| `doctor@boston.hospital` | Boston |
| `doctor@london.hospital` | London |
| `doctor@tokyo.hospital` | Tokyo |
| `doctor@singapore.hospital` | Singapore |
| `doctor@toronto.hospital` | Toronto |
| `doctor@saopaulo.hospital` | São Paulo |
| `doctor@berlin.hospital` | Berlin |
| `admin@rarenet.org` | — (admin, password `admin123`) |

**Try the demo scenarios** (all verified working end-to-end):
- "joint hypermobility, stretchy skin, easy bruising" → passes the privacy threshold → Ehlers-Danlos Syndrome
- "strawberry tongue, fever, rash" → passes → Kawasaki Disease
- "chronic cough, thick mucus, lung infections" → passes → Cystic Fibrosis
- "chilblain lesions, raynaud phenomenon, joint pain" → passes → TREX1 Lupus
- "muscle rigidity, spasms, stiffness, startle response" → the Ghost Case (Stiff Person Syndrome, 2 cases in Boston only) → **blocked** by k-anonymity

---

## One-command setup (Windows)

`run_seeding.ps1` automates steps 3–5 (Docker, backend startup, hospital seeding) on Windows. It still expects `backend/.env` to already exist with the variables from step 2 filled in, and it does **not** seed the demo login accounts — run the `curl -X POST .../auth/seed-demo-users` step separately.

```powershell
.\run_seeding.ps1
```

Then start the frontend as in step 6.

---

## Troubleshooting

**`docker-compose up -d` fails, or the `cyborgdb` container exits immediately:**
Run `docker-compose logs cyborgdb`. The two most common causes: `CYBORGDB_API_KEY` is missing/blank in `backend/.env` (0.14.0 requires a real one — see step 2), or your demo key expired (they last 1 hour — regenerate with `python3 -c "import cyborgdb; print(cyborgdb.get_demo_api_key())"` and update `backend/.env`, then `docker-compose up -d --force-recreate cyborgdb`).

**Backend fails to start / crashes on import:**
Check that `CYBORGDB_API_KEY` and `CYBORGDB_MASTER_INDEX_KEY` are both set in `backend/.env`.

**Login fails with "user not found":**
The demo accounts aren't created automatically — run `curl -X POST http://localhost:8001/auth/seed-demo-users` once.

**All searches return "No Matches Found", even ones that should have dozens of matches:**
This means the patient data was never actually stored — check `backend/scripts/seed_8_hospitals.py`'s output for `ERROR:app.services.cyborg_service:Failed to store patient`. The most common cause is a `cyborgdb` container running a newer image version than the pinned `cyborgdb==0.14.0` Python client expects (see step 3) — `docker-compose.yml` should have `image: cyborginc/cyborgdb-service:0.14.0`, not `:latest`. Confirm with `curl http://localhost:8000/v1/health` (should say `"version":"0.14.0"`). If it's on the wrong version, fix `docker-compose.yml` and reset:
```bash
docker-compose down -v
docker-compose up -d
cd backend && python scripts/seed_8_hospitals.py && python scripts/update_stats.py
```

**Port already in use:**
Backend uses 8001, CyborgDB uses 8000, frontend uses 5173. Free the port or change it (`--port` on uvicorn, or the `ports:` mapping in `docker-compose.yml`).
