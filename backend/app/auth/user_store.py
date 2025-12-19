"""
User Storage for RareNet

Simple JSON-based user storage for hackathon demo.
In production, replace with a proper database.
"""

import os
import json
import uuid
from typing import Optional, List
from datetime import datetime
from pathlib import Path

from .models import UserInDB, UserCreate
from .jwt_handler import hash_password

# Path to user storage file
DATA_DIR = Path(__file__).parent.parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"


def _ensure_data_dir():
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _load_users() -> List[dict]:
    """Load users from JSON file."""
    _ensure_data_dir()
    
    if not USERS_FILE.exists():
        return []
    
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def _save_users(users: List[dict]):
    """Save users to JSON file."""
    _ensure_data_dir()
    
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2, default=str)


def get_user_by_email(email: str) -> Optional[UserInDB]:
    """
    Find a user by email address.
    
    Args:
        email: Email to search for
        
    Returns:
        UserInDB if found, None otherwise
    """
    users = _load_users()
    
    for user_data in users:
        if user_data.get("email", "").lower() == email.lower():
            return UserInDB(**user_data)
    
    return None


def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """
    Find a user by ID.
    
    Args:
        user_id: User ID to search for
        
    Returns:
        UserInDB if found, None otherwise
    """
    users = _load_users()
    
    for user_data in users:
        if user_data.get("id") == user_id:
            return UserInDB(**user_data)
    
    return None


def create_user(user_create: UserCreate) -> UserInDB:
    """
    Create a new user.
    
    Args:
        user_create: User creation data
        
    Returns:
        Created UserInDB object
        
    Raises:
        ValueError: If email already exists
    """
    # Check if email already exists
    if get_user_by_email(user_create.email):
        raise ValueError(f"User with email {user_create.email} already exists")
    
    # Create user object
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_create.password)
    
    user_data = {
        "id": user_id,
        "email": user_create.email,
        "hashed_password": hashed_password,
        "role": user_create.role,
        "hospital": user_create.hospital,
        "full_name": user_create.full_name,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Save to file
    users = _load_users()
    users.append(user_data)
    _save_users(users)
    
    return UserInDB(**user_data)


def update_user_password(user_id: str, new_password: str) -> bool:
    """
    Update a user's password.
    
    Args:
        user_id: User ID to update
        new_password: New plaintext password
        
    Returns:
        True if updated, False if user not found
    """
    users = _load_users()
    
    for user_data in users:
        if user_data.get("id") == user_id:
            user_data["hashed_password"] = hash_password(new_password)
            _save_users(users)
            return True
    
    return False


def get_all_users() -> List[UserInDB]:
    """Get all users (admin function)."""
    users = _load_users()
    return [UserInDB(**u) for u in users]


def delete_user(user_id: str) -> bool:
    """
    Delete a user by ID.
    
    Args:
        user_id: User ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    users = _load_users()
    original_count = len(users)
    
    users = [u for u in users if u.get("id") != user_id]
    
    if len(users) < original_count:
        _save_users(users)
        return True
    
    return False


def seed_demo_users():
    """
    Seed the database with demo users if empty.
    
    Creates:
    - 3 doctor accounts (one per hospital)
    - 1 admin account
    
    All demo passwords are "password123"
    """
    if _load_users():
        print("Users already exist, skipping seed.")
        return
    
    demo_users = [
        UserCreate(
            email="doctor@mumbai.hospital",
            password="password123",
            role="doctor",
            hospital="mumbai",
            full_name="Dr. Priya Sharma"
        ),
        UserCreate(
            email="doctor@boston.hospital",
            password="password123",
            role="doctor",
            hospital="boston",
            full_name="Dr. James Wilson"
        ),
        UserCreate(
            email="doctor@london.hospital",
            password="password123",
            role="doctor",
            hospital="london",
            full_name="Dr. Sarah Chen"
        ),
        UserCreate(
            email="admin@rarenet.org",
            password="admin123",
            role="admin",
            hospital=None,
            full_name="RareNet Administrator"
        ),
    ]
    
    for user_data in demo_users:
        try:
            user = create_user(user_data)
            print(f"Created user: {user.email} ({user.role})")
        except ValueError as e:
            print(f"Skipping {user_data.email}: {e}")
    
    print("Demo users seeded successfully!")

