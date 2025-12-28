# RareNet: Privacy-Preserving Rare Disease Diagnosis Network

**Submission for CyborgDB'25 Hackathon**  
*A Federated Encrypted Vector Search System for Cross-Institutional Rare Disease Diagnosis*

![Privacy](https://img.shields.io/badge/Privacy-K%20Anonymity%20%2B%20Differential%20Privacy-success?style=for-the-badge)
![CyborgDB](https://img.shields.io/badge/Powered%20By-CyborgDB-blue?style=for-the-badge)
![Encryption](https://img.shields.io/badge/Security-End%20to%20End%20Encrypted-blueviolet?style=for-the-badge)

---

## Demo Video

**[Watch Full System Demonstration](ADD_YOUTUBE_LINK_HERE)**

*3-minute walkthrough covering: Two-Tier Privacy Architecture, Live Search Demo, Privacy Shield (Ghost Case), and Technical Findings*

---

## Abstract

RareNet addresses the critical challenge of rare disease diagnosis through a novel privacy-preserving federated search architecture. By combining CyborgDB's encryption-in-use capabilities with application-layer privacy controls (K-anonymity and differential privacy), we enable cross-institutional collaboration while maintaining HIPAA/GDPR compliance. This system demonstrates that privacy and utility are not mutually exclusive in healthcare AI applications.

**Key Contributions:**
- Two-tier privacy architecture separating storage security from access privacy
- Practical implementation of K-anonymity (k≥5) for rare disease cohorts
- Discovery and documentation of 6 critical edge cases in CyborgDB deployment
- Demonstration of privacy-preserving blocking for ultra-rare conditions (Ghost Case)

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [System Architecture](#system-architecture)
3. [Quick Start](#quick-start)
4. [Demonstration Scenarios](#demonstration-scenarios)
5. [Technical Evaluation](#technical-evaluation)
6. [Technology Stack](#technology-stack)
7. [Documentation](#documentation)
8. [Team](#team)

---

## Problem Statement

### The Diagnostic Odyssey

Rare diseases affect approximately 300 million people globally, yet patients face an average diagnostic delay of 6-8 years. This delay stems from:

1. **Data Fragmentation:** Patient records are isolated within institutional boundaries
2. **Privacy Regulations:** HIPAA and GDPR prevent cross-institutional data sharing
3. **Knowledge Scarcity:** Individual clinicians rarely encounter specific rare diseases
4. **Pattern Recognition Gap:** Diagnostic patterns exist globally but remain inaccessible

### Research Question

**Can we enable cross-institutional rare disease pattern recognition while maintaining zero-knowledge privacy guarantees?**

---

## System Architecture

### Two-Tier Privacy Model

RareNet implements defense-in-depth through two independent privacy layers:

#### Tier 1: Storage Security (CyborgDB)

**Threat Model:** Database breach, cloud provider access, insider threats

**Implementation:**
- Encryption-in-use via CyborgDB's encrypted vector store
- Patient symptom vectors encrypted with AES-256
- Database operators cannot decrypt stored vectors
- Redis backend configured with AOF persistence

**Guarantee:** Database dump reveals only encrypted vectors (computationally indistinguishable from random noise)

#### Tier 2: Access Privacy (RareNet Aggregator)

**Threat Model:** Vector inversion attacks, re-identification through query results, membership inference

**Implementation:**
- **K-Anonymity (k=5):** Minimum cohort size enforcement
- **Differential Privacy (ε=0.1):** Laplacian noise injection on confidence scores
- **Metadata Stripping:** Source institution information removed from results
- **Aggregation-Only Response:** Raw vectors never returned to clients

**Guarantee:** Query results cannot re-identify individuals in cohorts below threshold k

### System Flow

```
1. Symptom Input → Vector Embedding (384-dim, all-MiniLM-L6-v2)
2. Federated Query → 8 Hospital Nodes (Parallel ThreadPoolExecutor)
3. Encrypted Search → CyborgDB Vector Similarity (Cosine Distance)
4. Result Aggregation → Weighted Voting by Diagnosis
5. Privacy Check → K-Anonymity on Top Diagnosis
6. Noise Injection → Differential Privacy (if k≥5)
7. Response → Diagnosis + Confidence OR Privacy Block
```

---

## Quick Start

### Prerequisites
- Docker Desktop
- Python 3.9+
- Node.js 16+

### One-Command Setup (Windows)

```powershell
.\run_seeding.ps1
```

**What this does:**
1. Starts CyborgDB + Redis (Docker)
2. Launches FastAPI backend (port 8001)
3. Seeds 8 global hospitals with 146 patient records
4. Runs privacy validation tests

### Start Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Access Points

- **Frontend Application:** http://localhost:5173
- **Backend API Documentation:** http://localhost:8001/docs
- **CyborgDB Service:** http://localhost:8000

**Detailed Setup Guide:** See [SETUP.md](./SETUP.md) for complete instructions, troubleshooting, and manual setup options.

---

## Demonstration Scenarios

### Scenario A: Utility Demonstration (Positive Case)

**Objective:** Demonstrate successful cross-institutional diagnosis

**Input Query:**
```
joint hypermobility, easy bruising, elastic skin
```

**System Behavior:**
1. Vector embedding generated (384 dimensions)
2. Query executed across 8 hospital indexes
3. 45 matching cases identified (Ehlers-Danlos Syndrome)
4. K-anonymity check: 45 ≥ 5 (PASS)
5. Differential privacy noise added to confidence score
6. Result returned with 87% confidence

**Outcome:** SUCCESS - Cohort size sufficient for privacy-preserving result

### Scenario B: Privacy Shield Demonstration (Ghost Case)

**Objective:** Demonstrate privacy-preserving blocking for ultra-rare conditions

**Input Query:**
```
stiffness in trunk muscles, exaggerated startle response, episodic spasms
```

**System Behavior:**
1. Vector embedding generated
2. Query executed across 8 hospital indexes
3. 145 total vectors scanned across all diseases
4. Top diagnosis identified: Stiff Person Syndrome (2 cases)
5. K-anonymity check: 2 < 5 (FAIL)
6. Query BLOCKED to prevent re-identification

**Outcome:** BLOCKED - Privacy protection prioritized over utility

**Significance:** This demonstrates that the system will refuse to return results when doing so would risk patient re-identification, even when a valid diagnosis exists.

---

## Technical Evaluation

We deployed CyborgDB in a realistic multi-tenant healthcare scenario and documented **6 critical findings**:

**Full Report:** [CyborgDB Evaluation Report](./docs/CYBORG_EVALUATION_REPORT.md)

### Critical Findings

1. **Ephemeral Key Trap (Critical)**
   - Issue: SDK generates random encryption keys if environment variable not set
   - Impact: Silent data loss on service restart
   - Recommendation: Fail-fast validation in production mode

2. **Redis Persistence Configuration**
   - Issue: Default Docker image lacks AOF persistence
   - Impact: Data loss on container restart
   - Solution: Explicit `appendonly yes` configuration required

3. **Query Result Metadata Leakage**
   - Issue: Index names reveal tenant information
   - Impact: Privacy leak in multi-tenant deployments
   - Recommendation: Federated query API with metadata stripping

4. **Performance Characterization**
   - Measured: 6-8ms average query latency (local Docker)
   - Claimed: Sub-millisecond performance
   - Analysis: Discrepancy due to network overhead and Python client serialization
   - Recommendation: Provide deployment-specific benchmarks

5. **Server-Side K-Anonymity (Feature Request)**
   - Current: Application-layer privacy enforcement
   - Proposed: Database-native `min_cohort` parameter
   - Benefit: Reduced trust assumptions, improved security model

6. **Index Enumeration Vulnerability (Security)**
   - Severity: HIGH
   - Issue: `list_indexes()` requires only API key, not encryption key
   - Impact: Metadata leakage (tenant discovery)
   - Recommendation: Require encryption key for index enumeration

### Performance Benchmarks

| Metric | Result | Notes |
|--------|--------|-------|
| Write Latency | ~25ms | Includes network overhead |
| Read Latency | 6-8ms | Consistent across index sizes |
| P95 Latency | 12ms | Excellent stability |
| Throughput | ~150 ops/sec | Single-threaded synchronous |

**Verdict:** CyborgDB meets real-time requirements for clinical decision support.

---

## Technology Stack

### Core Infrastructure

- **Vector Database:** CyborgDB v1.0 (Redis-backed, encrypted)
- **Persistence Layer:** Redis 7.0 with AOF
- **Embedding Model:** all-MiniLM-L6-v2 (384-dimensional vectors)

### Backend Services

- **API Framework:** FastAPI 0.104+
- **Privacy Implementation:** Custom Python (K-anonymity, Laplacian noise)
- **Concurrency:** ThreadPoolExecutor for parallel hospital queries

### Frontend Application

- **Framework:** React 18
- **Styling:** TailwindCSS 3.0
- **State Management:** React Context API

### Privacy Mechanisms

- **K-Anonymity:** Minimum cohort size k=5
- **Differential Privacy:** Laplacian mechanism with ε=0.1
- **Encryption:** AES-256 via CyborgDB

---

## Documentation

### Primary Documentation

- **[Setup Guide](./SETUP.md)** - Complete installation and running instructions
- **[CyborgDB Evaluation Report](./docs/CYBORG_EVALUATION_REPORT.md)** - Comprehensive technical analysis, benchmarks, and findings
- **[Demo Video Script](./DEMO_VIDEO.md)** - Complete recording guide and feature walkthrough

### Additional Documentation

- **[Technical Journey](./docs/submission/TECHNICAL_JOURNEY.md)** - How we implemented CyborgDB team feedback
- **[Architecture Details](./docs/technical/ARCHITECTURE.md)** - System design and implementation
- **[Privacy Implementation](./docs/technical/PRIVACY_IMPLEMENTATION.md)** - K-anonymity and differential privacy details
- **[HIPAA Compliance](./docs/submission/HIPAA_COMPLIANCE.md)** - Regulatory compliance analysis

---

## Research Impact

### Contributions to Privacy-Preserving Healthcare AI

1. **Architectural Pattern:** Demonstrated viability of two-tier privacy for federated medical search
2. **Edge Case Documentation:** Identified 6 production-critical issues in encrypted vector databases
3. **Privacy-Utility Tradeoff:** Quantified acceptable blocking rate for rare disease networks
4. **Compliance Framework:** Provided HIPAA/GDPR-compliant implementation reference

### Future Research Directions

- **Homomorphic Encryption:** Explore FHE for computation on encrypted vectors
- **Federated Learning:** Integrate model training without data centralization
- **Blockchain Audit Trail:** Immutable query logging for compliance
- **Mobile Deployment:** Edge computing for privacy-preserving mobile diagnostics

---

## Team

**RareNet Development Team**

- Mihir Phalke
- Aakanksha Singh

**Affiliation:** CyborgDB Hackathon 2025  
**Location:** Mumbai, India

---

## Citation

If you use this work in your research, please cite:

```bibtex
@software{rarenet2025,
  title={RareNet: Privacy-Preserving Rare Disease Diagnosis Network},
  author={Phalke, Mihir and Singh, Aakanksha},
  year={2025},
  publisher={CyborgDB Hackathon},
  url={https://github.com/mihirphalke1/rare-net}
}
```

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- **CyborgDB Team** for architectural guidance and feedback
- **Charlcye** for recommending the federated aggregation model
- **Sentence Transformers** for the embedding model
- **FastAPI** and **React** communities for excellent documentation

---

**Last Updated:** December 2025
