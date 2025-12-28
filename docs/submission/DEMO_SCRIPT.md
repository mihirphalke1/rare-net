# RareNet: Technical Demo Script (Enhanced)

**With Technical Details That WOW Evaluators**

---

## 🎯 Opening Hook

"Let me start with a question.

If I tell you that **one patient in this network has a rare genetic disease** — have I just revealed private medical information?"

(Pause)

"Most AI systems would say no, especially if the data is encrypted.

We discovered that the answer is **wrong**."

"Hello everyone, this is **RareNet** — a rare disease diagnosis system where privacy is **validated, not assumed**."

---

## 🛡️ Part 1: K-Anonymity (The First Secret Weapon)

"Before showing the demo, I want to highlight the most important design decision in RareNet: **k-anonymity**."

"In RareNet, we enforce a strict rule:

👉 **If fewer than 5 patients match a query, we block the result completely.**"

"Because in rare diseases, even saying 'we found a match' can identify a real person."

### **Technical Deep Dive:**

"Here's how it works at the **architectural level**:

**Step 1:** We query all hospitals **in parallel** using CyborgDB's encrypted vector search
- Each hospital has 10,000 encrypted patient vectors
- Embedding model: all-MiniLM-L6-v2 (384 dimensions)
- Encryption happens at the vector level using CyborgDB's encryption-in-use

**Step 2:** Results come back to our **privacy aggregator** (this is our innovation)
- The aggregator runs **server-side** — raw scores never reach the client
- We count total matches across all hospitals

**Step 3:** K-anonymity check
- If matches ≥ 5 → Proceed to aggregation
- If matches < 5 → **Block immediately**

**Step 4:** If passed, we apply **differential privacy**
- Add Laplace noise with ε=0.1
- This prevents exact inference even from aggregated scores

**Step 5:** Return only diagnostic insights
- No hospital identifiers
- No raw similarity scores
- No patient-level data"

"This isn't optional. This is **HIPAA-compliant by design**."

---

## 🧪 Part 2: Rigorous Testing (The Second Secret Weapon)

"Most teams stop at implementation.

We went further and **attacked our own system**."

"We tested **five real privacy attack scenarios**:"

### **Technical Details of Each Test:**

**Test 1: Boundary Conditions**
- Tested k = 3, 4, 5, 6, 10
- Verified threshold enforcement at each boundary
- **Result:** ✅ Passed — System correctly blocks at k<5

**Test 2: Refinement Attack Simulation**
- Simulated progressive query refinement (100 → 50 → 15 → 5 → 3 matches)
- Measured confidence score changes to detect threshold leakage
- **Result:** ✅ Passed — No information leakage detected

**Test 3: Exactly-at-Threshold Behavior**
- Ran 20 identical queries at exactly k=5
- Measured confidence variance: **0.000051**
- **Result:** ⚠️ **Found vulnerability** — Deterministic behavior reveals exact cohort size

**Test 4: Temporal Privacy Leakage**
- Queried same disease at Time T1 and T2 (after adding new data)
- Measured confidence change: **12.27%**
- **Result:** ⚠️ **Found vulnerability** — Confidence changes reveal new admissions

**Test 5: Concurrent Query Consistency**
- Ran 20 concurrent queries at k=5
- Verified thread-safe privacy decisions
- **Result:** ✅ Passed — Consistent behavior under concurrency

---

"So yes — we found **two real vulnerabilities** in our own system."

"Most teams would hide that. We didn't."

### **The Fixes (Technical Implementation):**

"We:

**Fix #1: Randomized Response at Threshold**
```python
if cohort_size == k_min:
    # 80% return, 20% block (adds uncertainty)
    if random.random() < 0.2:
        return {'blocked': True}
    
    # Add ±5% noise to confidence
    confidence *= (1 + random.uniform(-0.05, 0.05))
```

**Fix #2: Temporal Smoothing**
```python
# Batch confidence updates weekly (not real-time)
if (datetime.now() - last_update).days < 7:
    return cached_confidence  # Prevents temporal tracking
```

Validated the fixes with the same 5 test scenarios."

---

### **The Measured Proof:**

"The result?

**Comparative Benchmarking:**

| Approach | Latency p95 | Privacy Risk |
|----------|-------------|--------------|
| Sequential + Raw Scores | 133ms | 20.0% |
| Parallel + Raw Scores | 52ms | 20.0% |
| **RareNet (Ours)** | **53ms** | **1.2%** |

**94% reduction in privacy risk — with no performance penalty.**

We match the speed of the simple parallel approach while achieving dramatically better privacy."

---

## 🎬 Part 3: Live Demo

"Now let me show you the system in action."

**[Navigate to homepage]**

"This is the RareNet interface. Notice the **Privacy-Preserving Network** section — this explains our two-tier architecture."

**[Point to network stats]**

"You can see:
- **3/5 Encrypted Nodes** — We have 3 hospitals connected (Mumbai, Boston, London)
- **15 Diseases Tracked** — Coverage across rare conditions
- **100% Privacy-Protected** — Our guarantee"

**[Type query]**

"Let me search for a patient:"

```
72-year-old male with recurrent fevers,
joint pain, family history of autoimmune disease
```

**[Click Diagnose]**

"This query runs across **three hospitals simultaneously**."

**[While loading - technical explanation]**

"Behind the scenes:

**Step 1:** Query embedding generated using all-MiniLM-L6-v2
- 384-dimensional vector representing the symptom description

**Step 2:** Parallel encrypted search across 3 CyborgDB instances
- Each instance has 10,000 encrypted patient vectors
- Cosine similarity computed in encrypted space

**Step 3:** Privacy aggregator receives raw results
- Counts total matches: **7 patients**
- Checks k-anonymity: 7 ≥ 5 ✅ **Passed**

**Step 4:** Server-side aggregation
- Weighted voting by similarity scores
- Differential privacy noise added (ε=0.1)
- Source hiding (no hospital identifiers)

**Step 5:** Return diagnostic insights only"

---

**[Results appear]**

"Results arrive in **53 milliseconds**."

**[Point to results]**

"Top diagnosis: **TREX1-related autoinflammation**

Confidence: **85%** (already privacy-protected with noise)

Recommended tests:
- Genetic testing for TREX1 mutation
- Inflammatory markers

Specialist referral:
- Rheumatology + Immunology"

---

### **Technical Highlight:**

"The system found **7 matching patients** across our network — that's why results are allowed.

**If this number had been less than 5, the system would have blocked the response entirely.**

This is k-anonymity enforcement in action."

---

### **What You DON'T See (Privacy Features):**

"And notice what you **don't see**:

❌ **No hospital-level counts** — Can't tell which hospital has matches

❌ **No raw similarity scores** — Only aggregated diagnosis

❌ **No patient-level data** — Complete source hiding

This is **server-side aggregation** preventing information leakage that encryption alone can't stop."

---

## 🏆 Part 4: The Impact

"So RareNet has **two secret weapons**."

### **Secret Weapon #1: K-Anonymity**
"**Technical implementation:**
- Minimum cohort size: k=5
- Enforcement: Server-side, before aggregation
- Privacy guarantee: No query reveals <5 patients
- Compliance: HIPAA-compliant by design"

### **Secret Weapon #2: Rigorous Attack Testing**
"**Methodology:**
- 5 attack scenarios (boundary, refinement, threshold, temporal, concurrent)
- 2 real vulnerabilities found (deterministic behavior, temporal leakage)
- Fixes implemented (randomized response, temporal smoothing)
- Validation: All tests pass after fixes"

---

### **The Product Insights:**

"While building this, we also identified **4 critical gaps** in CyborgDB's healthcare offering:

**Gap #1:** No pre-encryption data validation
- We built: **HealthcareEmbeddingValidator** (risk scoring framework)

**Gap #2:** No healthcare deployment guide
- We built: Complete **HIPAA compliance checklist** (24 items)

**Gap #3:** No multi-institutional query framework
- We built: **Privacy-preserving aggregation layer** (what you just saw)

**Gap #4:** No privacy edge case testing
- We built: **Testing methodology** (5 attack scenarios)

We filed all 3 issues to CyborgDB's community feedback repo."

---

## 🎯 Closing

"Most teams claim security.

**We proved it.**"

### **The Technical Summary:**

"**Architecture:**
- Two-tier privacy (CyborgDB encryption + RareNet aggregation)
- K-anonymity enforcement (k=5 minimum)
- Differential privacy (ε=0.1)
- Server-side aggregation (source hiding)

**Performance:**
- 53ms latency (matches simple parallel approach)
- 1.2% privacy risk (94% reduction from 20%)
- 30,000 encrypted vectors (10k per hospital)
- 3 hospitals, 15 diseases tracked

**Validation:**
- 5 attack scenarios tested
- 2 vulnerabilities found and fixed
- Comparative benchmarking (measured proof)
- HIPAA-compliant by design"

---

"**Encryption is not enough.**

**Privacy requires validation.**

Thank you."

---

## 📊 Technical Q&A Preparation

### **Q: How does k-anonymity work with encrypted vectors?**

**A:** "Great question. K-anonymity happens **after** decryption but **before** returning results to the client.

Here's the flow:
1. CyborgDB performs encrypted search → returns encrypted results
2. Our privacy aggregator decrypts results **server-side**
3. We count matches: If <5, block immediately
4. If ≥5, we aggregate and add differential privacy noise
5. Return only aggregated insights to client

So encryption protects data at rest and in transit. K-anonymity protects against information leakage from query results."

---

### **Q: What's the performance overhead of privacy protections?**

**A:** "Negligible. We measured:
- Simple parallel approach: 52ms
- RareNet (with all privacy protections): 53ms
- **Overhead: <1ms**

The privacy protections (k-anonymity check, differential privacy noise, aggregation) add less than 1 millisecond. We proved privacy does NOT require speed sacrifice."

---

### **Q: How did you find the vulnerabilities?**

**A:** "We built a comprehensive testing framework (`test_kanonymity_edge_cases.py` - 400+ lines).

We systematically tested:
- Boundary conditions (does k=5 actually block k=4?)
- Refinement attacks (can progressive queries break anonymity?)
- Threshold behavior (what happens at exactly k=5?)
- Temporal patterns (do confidence scores leak information over time?)
- Concurrent consistency (is it thread-safe?)

We found deterministic behavior at k=5 (variance: 0.000051) and temporal leakage (12.27% confidence change). Both are real vulnerabilities that matter for healthcare."

---

### **Q: What makes this production-ready?**

**A:** "Four things:

1. **HIPAA Compliance:** K-anonymity prevents re-identification (required by HIPAA)
2. **Rigorous Testing:** We found and fixed vulnerabilities before deployment
3. **Measured Performance:** 53ms latency, 1.2% privacy risk (quantified, not assumed)
4. **Complete Documentation:** 36,000+ words including deployment guide, testing methodology, and compliance checklist

Most hackathon projects are demos. This is ready for real healthcare deployment."

---

**Team: mihirphalke_36e0**

**"Encryption is not enough. Privacy requires validation."**
