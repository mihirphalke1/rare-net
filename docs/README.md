# RareNet Documentation

**Privacy-Preserving Cross-Institution Rare Disease Diagnosis Network**

> Built with CyborgDB Encrypted Vector Search for the CyborgDB'25 Hackathon

---

> **🚨 CRITICAL: VIDEO DEMO NOT RECORDED!** Follow [submission/VIDEO_SCRIPT.md](submission/VIDEO_SCRIPT.md) for the 3-5 minute recording guide. This is worth **50% of the hackathon grade** per agent feedback.

---

## 📂 Documentation Structure

### 📋 Submission Documents ⭐ **START HERE**
**Priority documents for hackathon judges**

- [**CYBORGDB_EVALUATION.md**](./submission/CYBORGDB_EVALUATION.md) - **Required by rubric** - Performance metrics, failures, feature gaps
- [**HIPAA_COMPLIANCE.md**](./submission/HIPAA_COMPLIANCE.md) - Security controls, audit logging, compliance assessment
- [**VIDEO_SCRIPT.md**](./submission/VIDEO_SCRIPT.md) - **MUST RECORD** - 3-5 minute demo guide
- [**TECHNICAL_JOURNEY.md**](./submission/TECHNICAL_JOURNEY.md) - How we implemented CyborgDB team feedback
- [**SUBMISSION_STATEMENT.md**](./submission/SUBMISSION_STATEMENT.md) - Official hackathon submission overview
- [**DEMO_SCRIPT.md**](./submission/DEMO_SCRIPT.md) - Step-by-step live demonstration walkthrough

### 🔧 Technical Documentation
**Architecture and implementation details**

- [**ARCHITECTURE.md**](./technical/ARCHITECTURE.md) - System architecture and component diagrams
- [**PRIVACY_IMPLEMENTATION.md**](./technical/PRIVACY_IMPLEMENTATION.md) - Two-tier privacy model (K-anonymity + Differential Privacy)
- [**BENCHMARKS.md**](./technical/BENCHMARKS.md) - Performance metrics and privacy overhead analysis

### 📊 Analysis Documents
**Research and comparative studies**

- [**COMPARATIVE_ANALYSIS.md**](./analysis/COMPARATIVE_ANALYSIS.md) - RareNet vs. existing rare disease solutions
- [**CYBORG_DB_PRODUCT_GAPS.md**](./analysis/CYBORG_DB_PRODUCT_GAPS.md) - CyborgDB feedback and feature requests

### 🚀 Deployment Guides
**Getting started and deployment**

- [**QUICK_START.md**](./deployment/QUICK_START.md) - 60-second setup for judges and evaluators
- [**HEALTHCARE_DEPLOYMENT_GUIDE.md**](./deployment/HEALTHCARE_DEPLOYMENT_GUIDE.md) - Production deployment considerations

---

## 🎯 Quick Links for Evaluators

1. **🎥 Record Video (URGENT)**: [VIDEO_SCRIPT.md](./submission/VIDEO_SCRIPT.md) - 50% of grade!
2. **📊 Required Evaluation**: [CYBORGDB_EVALUATION.md](./submission/CYBORGDB_EVALUATION.md)
3. **🏥 Security Audit**: [HIPAA_COMPLIANCE.md](./submission/HIPAA_COMPLIANCE.md)
4. **🧠 Technical Story**: [TECHNICAL_JOURNEY.md](./submission/TECHNICAL_JOURNEY.md)
5. **🚀 Try the Demo**: [QUICK_START.md](./deployment/QUICK_START.md)

---

## 🏥 What is RareNet?

RareNet enables hospitals to collaboratively diagnose rare diseases without sharing patient data:

- **Problem**: 300M people suffer from rare diseases, average diagnosis takes 6+ years
- **Challenge**: Patient data trapped in HIPAA/GDPR silos
- **Solution**: CyborgDB encrypted vector search + Privacy Aggregator
- **Result**: Collaborative diagnosis with zero data exposure

### Privacy Architecture

**Tier 1 - CyborgDB Encryption Layer**
- Hospital-specific encryption keys
- Encrypted embeddings at rest, in transit, and during search
- Protection against database breaches

**Tier 2 - Privacy Aggregator Layer**  
- K-anonymity threshold (k≥5 required)
- Differential privacy noise (ε=0.1)
- Output sanitization (diagnosis only, no hospital identifiers)
- Ghost case blocking for ultra-rare conditions

---

## 📈 Key Metrics

- **146 Synthetic Patients** across 3 hospitals (Mumbai, Boston, London)
- **94% Privacy Overhead Reduction** vs. traditional federated learning
- **53ms P95 Latency** for cross-institution queries
- **100% HIPAA/GDPR Compliant** - no PHI ever leaves encrypted form

---

## 🛠️ Tech Stack

- **Backend**: FastAPI + Python 3.9
- **Vector DB**: CyborgDB 0.14.0 (encryption-in-use)
- **ML Model**: sentence-transformers (all-MiniLM-L6-v2)
- **Privacy**: K-anonymity + Differential Privacy
- **Frontend**: React + TypeScript + Tailwind
- **Deployment**: Docker Compose

---

## 👥 Team

**Aakanksha Singh** & **Mihir Phalke**  
Mumbai, India  
CyborgDB'25 Hackathon

---

## 📞 Questions?

See [QUICK_START.md](./deployment/QUICK_START.md) for setup or [TECHNICAL_JOURNEY.md](./submission/TECHNICAL_JOURNEY.md) for architecture details.
