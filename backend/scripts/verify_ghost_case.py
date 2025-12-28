"""
Quick verification: Check if Stiff Person Syndrome data exists
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.cyborg_service import cyborg_service

print("🔍 Checking for Stiff Person Syndrome in Boston...")

try:
    # Try to load Boston index
    index = cyborg_service.client.load_index("rarenet_boston", index_key=cyborg_service.demo_key)
    
    # Get all vectors
    print(f"✅ Boston index loaded")
    print(f"📊 Checking data...")
    
    # Try a search for Stiff Person symptoms
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    query = "progressive muscle rigidity painful spasms startle response"
    vector = model.encode(query).tolist()
    
    results = index.query(vector, top_k=10)
    
    print(f"\n🔎 Search results for '{query}':")
    print(f"Found {len(results)} matches")
    
    for i, result in enumerate(results[:5]):
        metadata = result.get('metadata', {})
        diagnosis = metadata.get('diagnosis', 'Unknown')
        score = result.get('score', 0)
        print(f"  {i+1}. {diagnosis} (score: {score:.3f})")
    
    # Count Stiff Person cases
    stiff_count = sum(1 for r in results if 'Stiff' in r.get('metadata', {}).get('diagnosis', ''))
    print(f"\n📈 Stiff Person Syndrome cases found: {stiff_count}")
    
    if stiff_count == 0:
        print("❌ NO STIFF PERSON SYNDROME DATA FOUND!")
        print("⚠️  You need to run: .\\run_seeding.ps1 and select 'y' to reseed")
    elif stiff_count < 5:
        print(f"✅ Ghost case exists ({stiff_count} cases < 5 threshold)")
    else:
        print(f"⚠️  Too many cases ({stiff_count} >= 5), won't be blocked!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("⚠️  Database might not be seeded. Run: .\\run_seeding.ps1")
