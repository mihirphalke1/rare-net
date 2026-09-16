"""
Security Audit: Test CyborgDB's encryption enforcement
Testing if data can be accessed with WRONG encryption key
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.services.cyborg_service import cyborg_service

# Real per-institution key, derived the same way the app does — not hardcoded.
CORRECT_KEY = cyborg_service.get_index_key("mumbai")

# WRONG key (attacker's key) — 32 bytes, matching the real key's length.
WRONG_KEY = bytes(32)  # All zeros

print("🔍 SECURITY AUDIT: Encryption Key Enforcement Test")
print("=" * 60)

client = cyborg_service.client

# Test 1: Can we load an index with the WRONG key?
print("\n[Test 1] Attempting to load 'rarenet_mumbai' with WRONG encryption key...")
try:
    index = client.load_index("rarenet_mumbai", index_key=WRONG_KEY)
    print("  ❌ CRITICAL: Index loaded with wrong key!")
    
    # Test 2: Can we query with the wrong key?
    print("\n[Test 2] Attempting to query with wrong key...")
    results = index.query([0.1] * 384, top_k=1)
    if results:
        print(f"  🚨 SECURITY BREACH: Retrieved {len(results)} results with WRONG key!")
        print(f"  Data: {results[0]}")
    else:
        print("  ✅ Query returned 0 results (encrypted correctly)")
        
except Exception as e:
    print(f"  ✅ PROTECTED: {str(e)[:100]}")

# Test 3: Can we enumerate indexes without authentication?
print("\n[Test 3] Testing index enumeration without encryption key...")
try:
    indexes = client.list_indexes()
    print(f"  ⚠️  WARNING: Can list {len(indexes)} indexes without encryption key")
    print(f"  Indexes: {indexes}")
except Exception as e:
    print(f"  ✅ PROTECTED: {str(e)[:100]}")

print("\n" + "=" * 60)
