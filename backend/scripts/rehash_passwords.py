"""Regenerate password hashes with new bcrypt implementation"""
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.auth.jwt_handler import hash_password

DATA_FILE = Path(__file__).parent.parent / "data" / "users.json"

# Load users
with open(DATA_FILE, "r") as f:
    users = json.load(f)

# Rehash all passwords (all demo users use 'doctor123' or 'admin123')
for user in users:
    if user['role'] == 'admin':
        new_hash = hash_password('admin123')
    else:
        new_hash = hash_password('doctor123')
    
    user['hashed_password'] = new_hash
    print(f"✅ Rehashed password for {user['email']}")

# Save back
with open(DATA_FILE, "w") as f:
    json.dump(users, f, indent=2)

print(f"\n🎉 All {len(users)} users rehashed successfully!")
