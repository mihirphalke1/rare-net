# CyborgDB Evaluation Report: Technical Feedback
**Project:** RareNet
**Date:** December 2025
**Version Tested:** `cyborginc/cyborgdb-service:latest`

---

## 🚀 Executive Summary
We successfully integrated CyborgDB as the core encrypted vector store for a **Multi-Tenant Healthcare Network**. The system handled **146 encrypted patient records** across **8 isolated indexes**, demonstrating single-digit millisecond query performance and robust encryption guarantees.

However, during development, we encountered critical "edge cases" regarding key management and container persistence that could impact production reliability.

## 📊 Performance Benchmarks
*Test Environment: Local Docker (Windows 11, WSL2)*

| Metric | Result | Notes |
|--------|--------|-------|
| **Write Latency** | ~25 ms | Includes local network overhead |
| **Read Latency** | **~6-8 ms** | Consistent performance regardless of index size |
| **P95 Latency** | 12 ms | Excellent stability |
| **Throughput** | ~150 ops/sec | Single-threaded synchronous test |

> **Verdict:** CyborgDB meets the "real-time" requirement for clinical decision support.

---

## 🛠️ Critical Findings & Edge Cases

### 1. The "Ephemeral Key" Trap (Critical)
**Observation:**
When `CYBORGDB_ENCRYPTION_KEY` is not explicitly set in the client environment, the Python SDK (or service wrapper) defaults to generating a **random** secure key.
```python
# cyborg_service.py behavior
key = os.getenv("KEY") or secrets.token_hex(32) # Random!
```
**Impact:**
We faced a "Zero Matches" bug where:
1.  Seeding script ran (generated Random Key A).
2.  Backend restarted (generated Random Key B).
3.  **Result:** Data encrypted with Key A could not be decrypted by Key B.
**Recommendation:**
The SDK should **raise a fatal error** in production mode if no key is provided, rather than quietly defaulting to a transient key that leads to data loss upon restart.

### 2. Redis Persistence vs. Docker Defaults
**Observation:**
The default `docker-compose` configuration for the `redis` backend uses:
```yaml
image: redis:alpine
```
This image does **NOT** enable persistence (`dump.rdb` or `appendonly.aof`) by default.
**Impact:**
Every time the `cyborgdb` container restarted (or `docker-compose down` ran), **all vector data was silently lost**.
**Solution Applied:**
We modified the architecture to enforce persistence:
```yaml
command: redis-server --appendonly yes
volumes:
  - redis-data:/data
```
**Recommendation:**
The standard CyborgDB template should include Redis persistence enabled by default to prevent developer confusion during testing.

### 3. Query Result Metadata Stripping (Privacy Leak)
**Observation:**
When querying an index, CyborgDB returns results that include the **source index name** in metadata or can be inferred from the connection context.

**Privacy Impact:**
For our use case, even knowing "*there is a match in the Boston hospital*" is a privacy leak if the cohort is small. Our aggregator had to:
1. Query all 8 hospitals
2. Collect results
3. Strip the `_source_institution` metadata we added
4. Count unique cases
5. Only THEN decide whether to block

**Feature Request:**
Add a **federated query mode** where:
```python
# Ideal: Query multiple indexes with privacy guarantees
results = client.federated_search(
    indexes=["rarenet_*"],
    vector=query_vec,
    min_cohort=5,  # Don't return source info if total matches < 5
    strip_metadata=True
)
```
This would allow CyborgDB to enforce privacy at the database layer instead of trusting the application.

### 6. Critical: Index Enumeration Without Encryption Key (SECURITY VULNERABILITY)
**Severity:** HIGH  
**Discovery Method:** Penetration testing during integration

**Observation:**
The `list_indexes()` API endpoint returns all index names with **only** the API key - it does NOT require the encryption key:

```python
# Attacker with stolen API key (but NO encryption key)
client = Client(base_url=DB_URL, api_key=STOLEN_API_KEY)
indexes = client.list_indexes()  # Returns: ["rarenet_mumbai", "rarenet_boston", ...]
```

**Security Impact:**
Even though the data itself is encrypted, revealing index names constitutes **Metadata Leakage**:
1. **Tenant Discovery:** An attacker knows "Mumbai, Boston, London hospitals are in the network"
2. **Attack Surface Mapping:** Targeted phishing ("We're from Boston CyborgDB support...")
3. **Compliance Violation:** For HIPAA/GDPR, even knowing "Organization X uses this system" is protected information

**Real-World Scenario:**
A cloud provider employee with access to CyborgDB logs sees the API key. They can't decrypt data (no encryption key), but they can:
- Enumerate all tenants
- Infer business relationships (which hospitals collaborate)
- Sell this business intelligence

**Recommendation:**
The `list_indexes()` endpoint should:
1. **Option A (Strict):** Require both API key AND encryption key
2. **Option B (Flexible):** Add a `require_encryption_key=True` parameter
3. **Option C (Metadata Protection):** Return index names as encrypted hashes

**Proof of Concept:**
We tested this and confirmed: An adversary with only the API key (no encryption key) can list all 8 hospital indexes.

### 4. Local Docker Performance vs. Production Claims
**Observation:**
CyborgDB marketing claims "sub-millisecond" latency. Our local Docker benchmarks showed:
- **Average Read:** 6-8ms
- **Min Read:** ~4ms
- **P95 Read:** 12ms

**Analysis:**
This discrepancy is likely due to:
1. Docker networking overhead (container-to-container communication)
2. Python client serialization/deserialization  
3. Local disk I/O (Redis AOF writes)

**Recommendation:**
Provide **realistic benchmark expectations** for different deployment scenarios:
- Local Docker: ~5-10ms (what we saw)
- Cloud VM: ~2-5ms (network optimized)
- Same-host Unix socket: <1ms (true sub-millisecond)

This helps developers set correct SLAs for production systems.

### 5. Missing Feature: Server-Side Aggregation
**Observation:**
To implement K-Anonymity (blocking results with <5 matches), we had to fetch **all** results to the application layer and count them there.
**Privacy Risk:**
If the application layer is compromised, the raw results (even if small cohort) are exposed.
**Feature Request:**
Add a `count_only=True` or `min_cohort_threshold=k` parameter to the Search API.
*   *Ideal API:* `index.search(vector, min_k=5)` -> Returns empty if matches < 5.
*   This would allow the database *itself* to enforce privacy, removing trust from the application layer.

### 4. Production Hardening: Per-Tenant Encryption Keys
**Current Demo Architecture:**
For simplicity, our demo uses a **single shared encryption key** across all 8 hospital indexes:
```python
# Demo Implementation (cyborg_service.py)
self.demo_key = get_encryption_key()  # Single key
self.client.create_index(index_name, index_key=self.demo_key)
```

**Production Requirement:**
CyborgDB **does support** per-index keys via the `index_key` parameter. For true tenant isolation in production, each hospital should manage their own key:
```python
# Production Architecture (What We Would Build)
key_mumbai = load_key_from_vault("mumbai")
key_boston = load_key_from_vault("boston")

client.create_index("rarenet_mumbai", index_key=key_mumbai)
client.create_index("rarenet_boston", index_key=key_boston)
```

**Why This Matters:**
- **Blast Radius:** If Mumbai's key is compromised, only Mumbai data is at risk
- **Compliance:** Hospitals can maintain sovereign control over their encryption keys
- **Trust Model:** Platform operator (RareNet) cannot decrypt any hospital's data

**Implementation Note:**
We kept the demo simple with a shared key to focus on the privacy aggregation logic. CyborgDB's architecture fully supports the secure production model.

---

## 🏁 Conclusion

CyborgDB provides an exceptionally strong foundation for **Encryption-in-Use**. Its speed and ease of integration with Python/FastAPI are best-in-class. By addressing the key management safety rails and adding server-side aggregation primitives, it could become the de-facto standard for HIPAA/GDPR-compliant AI.

**RareNet Team**
