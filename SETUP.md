# RareNet Setup Instructions

## Prerequisites

1. **Docker Desktop** (Must be running)
   - Minimum 4GB RAM allocated
2. **Python 3.9+**
3. **Node.js 16+**

---

## 1. Quick Start (Windows)

This single command sets up the entire backend, seeds data, and starts services.

```powershell
.\run_seeding.ps1
```
*When prompted "Nuke and reseed? (y/n)", type `y` and press Enter.*

**This will automatically:**
- Start Docker containers (CyborgDB + Redis)
- Launch the backend API (Port 8001)
- Seed 146 patient records across 8 hospitals

---

## 2. Start Frontend

Open a **new** terminal window:

```powershell
cd frontend
npm install
npm run dev
```

---

## 3. Access Application

- **Frontend:** http://localhost:5173
- **Login Email:** `doctor@mumbai.hospital`
- **Login Password:** `secure123`

---

## Troubleshooting

**If Ghost Case fails to block:**
Database has old data. Run this to reset:
```powershell
docker-compose down -v
.\run_seeding.ps1
```

**If Backend fails to start:**
Ensure no other service is using port 8001.
