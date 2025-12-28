"""
Quick diagnostic to check CyborgDB data
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.cyborg_service import cyborg_service

print("Checking CyborgDB indexes...")
print("=" * 60)

hospitals = ["mumbai", "boston", "london", "tokyo", "singapore", "toronto", "sao_paulo", "berlin"]

for hospital in hospitals:
    try:
        # Try to search for anything
        results = cyborg_service.search_institution(hospital, [0.1] * 384, top_k=1)
        count = len(results) if results else 0
        print(f"{hospital:15} - {count} results (has data: {'YES' if count > 0 else 'NO'})")
    except Exception as e:
        print(f"{hospital:15} - ERROR: {str(e)[:50]}")

print("=" * 60)
