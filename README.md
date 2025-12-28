# RareNet: Privacy-Preserving Rare Disease Diagnosis Network 🌐🏥

> **Submission for CyborgDB'25 Hackathon**  
> *Breaking the Diagnostic Odyssey with Encrypted Federated Search*

![RareNet Privacy Shield](https://img.shields.io/badge/Privacy-K%20Anonymity%20%2B%20Differential%20Privacy-success?style=for-the-badge)
![CyborgDB](https://img.shields.io/badge/Powered%20By-CyborgDB-blue?style=for-the-badge)
![Encryption](https://img.shields.io/badge/Security-End%20to%20End%20Encrypted-blueviolet?style=for-the-badge)

---

## � Quick Start (One Command)

```powershell
# Windows PowerShell
.\run_seeding.ps1
```

**What this does:**
1. Starts CyborgDB + Redis (Docker)
2. Launches FastAPI backend
3. Seeds 8 global hospitals with 146 patient records
4. Runs the privacy tests

**Then access:**
- Frontend: [http://localhost:5173](http://localhost:5173) (run `cd frontend; npm run dev`)
- Backend API: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 🎯 The Problem We're Solving

**300 Million people** worldwide suffer from rare diseases, yet diagnosis takes **6-8 years** on average. Why?

**The Barrier:** Patient data is trapped in institutional silos due to HIPAA/GDPR. A doctor in Mumbai can't see that a doctor in Boston solved the exact same case yesterday.

**The Solution:** RareNet allows hospitals to **query global patient patterns** without ever decrypting or sharing Protected Health Information (PHI).

---

## 🏗️ Two-Tier Privacy Architecture

We separate **Storage Security** from **Access Privacy**:

### 🛡️ Tier 1: CyborgDB (Encryption-in-Use)
- **Threat:** Database breach, cloud provider snooping
- **Defense:** All patient vectors encrypted at-rest, in-transit, and in-use
- **Guarantee:** Database dump = random noise

### 🎭 Tier 2: Privacy Firewall (K-Anonymity + Differential Privacy)
- **Threat:** Vector inversion, re-identification attacks
- **Defense:** Application-layer aggregator enforces minimum cohort size (k≥5)
- **Guarantee:** Ultra-rare cases are **blocked**, not revealed

---

## 🎬 Live Demo Scenarios

### ✅ Scenario A: The Breakthrough (Utility Demo)
**Query:** `joint hypermobility, easy bruising, elastic skin`

**Result:**
```
✅ SUCCESS: Ehlers-Danlos Syndrome (87% confidence)
   Cohort: 45 cases across 8 hospitals
```

### 🛑 Scenario B: The Privacy Shield (Safety Demo)
**Query:** `stiffness in trunk muscles, exaggerated startle response, episodic spasms`

**Result:**
```
🔴 BLOCKED: Privacy protection active
   Reason: Cohort size (2) below threshold (5)
   Impact: Prevents re-identification of Boston patients
```

**This is the WOW moment.** The system chooses safety over utility.

---

## � What We Stress-Tested

We deployed CyborgDB in a realistic multi-tenant healthcare scenario and documented **6 critical findings**:

📄 **[Read Full CyborgDB Evaluation Report](./CYBORG_EVALUATION_REPORT.md)**

### Key Findings:
1. **Ephemeral Key Trap** - Silent data loss if encryption key not set
2. **Redis Persistence** - Default Docker config loses data on restart
3. **Query Metadata Leak** - Index names reveal tenant info
4. **Performance Reality** - 6-8ms (not sub-ms) in Docker
5. **Server-Side K-Anonymity** - Missing federated search API
6. 🚨 **SECURITY VULNERABILITY** - Index enumeration without encryption key (metadata leakage)

---

## 🛠️ Technology Stack

- **Vector Database:** CyborgDB (Redis-backed, Encrypted)
- **Embeddings:** all-MiniLM-L6-v2 (384-dim)
- **Backend:** FastAPI, Python 3.9+
- **Frontend:** React, TailwindCSS
- **Privacy:** Custom K-Anonymity + Laplacian Noise (ε=0.1)

---

## � Complete Documentation

- 📄 [CyborgDB Evaluation Report](./CYBORG_EVALUATION_REPORT.md) - Technical findings & benchmarks
- 🎬 [Demo Video](./DEMO_VIDEO.md) - Recording & walkthrough
- � [Setup Guide](./run_seeding.ps1) - Automated startup script

---

## 👥 Team RareNet

**Built by:**
- Mihir Phalke
- Aakanksha Singh

**For:** CyborgDB Hackathon '25  
**From:** Mumbai, India 🇮🇳

