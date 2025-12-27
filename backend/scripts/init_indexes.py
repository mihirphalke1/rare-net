"""Initialize CyborgDB indexes for all hospitals"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.cyborg_service import cyborg_service

hospitals = ["mumbai", "boston", "london", "tokyo", "berlin", "singapore", "toronto", "sao_paulo"]

print("Creating hospital indexes in CyborgDB...")
for hospital in hospitals:
    try:
        cyborg_service.create_institution_index(hospital)
        print(f"✓ Created index for {hospital}")
    except Exception as e:
        print(f"✗ Error creating {hospital}: {str(e)[:100]}")

print("\nIndexes initialized! You can now seed data.")
