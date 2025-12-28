# RareNet Setup Instructions

Complete guide to running the RareNet privacy-preserving rare disease diagnosis network.

---

## Prerequisites

### Required Software

1. **Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Minimum 4GB RAM allocated to Docker

2. **Python 3.9+**
   - Download: https://www.python.org/downloads/

3. **Node.js 16+**
   - Download: https://nodejs.org/

---

## Quick Start

### 1. Clone Repository

```powershell
git clone https://github.com/mihirphalke1/rare-net.git
cd rare-net
```

### 2. Run Setup Script

```powershell
.\run_seeding.ps1
```

When prompted "Nuke and reseed? (y/n)", type `y` and press Enter.

This will:
- Start Docker containers (CyborgDB + Redis)
- Launch backend API on port 8001
- Seed 146 patient records across 8 hospitals
- Update network statistics

### 3. Start Frontend

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

### 4. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8001/docs

---

## Test the System

### Login Credentials

- Email: `doctor@mumbai.hospital`
- Password: `secure123`

### Demo Scenarios

1. **Success Demo**
   - Click "Ehlers-Danlos" quick search button
   - Expected: 87% confidence, 45 cases found

2. **Privacy Shield Demo**
   - Click "Ghost Case" button
   - Expected: BLOCKED (cohort size 2 < threshold 5)

---

## Troubleshooting

### Docker containers won't start

```powershell
docker-compose down -v
docker-compose up -d
```

### Backend connection refused

- Ensure Docker containers are running: `docker ps`
- Check CyborgDB health: http://localhost:8000/v1/health

### Frontend shows blank page

```powershell
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Ghost Case returns results instead of blocking

Database has old data. Reset:

```powershell
docker-compose down -v
.\run_seeding.ps1
```

Type `y` when prompted.

---

## Stopping the System

```powershell
# Stop Docker containers
docker-compose down

# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)
```

### Complete Reset

```powershell
docker-compose down -v
```

This removes all data. Run `.\run_seeding.ps1` to start fresh.

---

## Architecture

```
Frontend (React) → Backend (FastAPI) → CyborgDB (Encrypted) → Redis (Storage)
Port 5173          Port 8001            Port 8000             Port 6379
```

---

## Credits

**Built by:** Mihir Phalke & Aakanksha Singh

**For:** CyborgDB Hackathon 2025

**Special Thanks:** Charlcye (CyborgDB) for architectural guidance

---

**Last Updated:** December 2025
