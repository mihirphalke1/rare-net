"""
Security Audit: Test CyborgDB's encryption enforcement
Testing if data can be accessed with WRONG encryption key
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from cyborgdb import Client

# Correct credentials
API_KEY = "cyborg_d754e642d7b94d05a4750d67a84b0efe"
CORRECT_KEY = bytes.fromhex("deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678")

# WRONG key (attacker's key)
WRONG_KEY = bytes.fromhex("0" * 128)  # All zeros

print("🔍 SECURITY AUDIT: Encryption Key Enforcement Test")
print("=" * 60)

client = Client(base_url="http://localhost:8000", api_key=API_KEY)

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
