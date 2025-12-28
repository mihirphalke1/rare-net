"""
Update Network Stats After Seeding

This script updates the network_stats.json file to reflect the seeded data.
Run this after seeding to ensure the frontend displays correct case counts.
"""

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.stats_service import stats_service

# 8-Hospital seeding distribution
hospital_counts = {
    "mumbai": 20,
    "tokyo": 18,
    "singapore": 17,
    "boston": 21,
    "toronto": 17,
    "sao_paulo": 17,
    "london": 19,
    "berlin": 17
}

disease_counts = {
    "Ehlers-Danlos Syndrome": 45,
    "Kawasaki Disease": 35,
    "Cystic Fibrosis": 35,
    "TREX1 Lupus": 29,
    "Stiff Person Syndrome": 2
}

total_cases = sum(hospital_counts.values())

print(f"Updating network stats...")
print(f"Total cases: {total_cases}")
print(f"Hospitals: {len(hospital_counts)}")
print(f"Diseases: {len(disease_counts)}")

stats_service.initialize(total_cases, hospital_counts, disease_counts)

print("\n✅ Stats updated successfully!")
print(f"\nVerification:")
stats = stats_service.get_stats()
print(f"  Total cases: {stats['total_cases']}")
print(f"  Hospitals: {len(stats['cases_by_hospital'])}")
print(f"  Cases by hospital: {stats['cases_by_hospital']}")
print(f"  Cases by disease: {stats['cases_by_disease']}")
