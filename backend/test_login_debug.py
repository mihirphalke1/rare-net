"""
Test script to debug login issue
"""
import sys
sys.path.insert(0, 'c:\\Users\\aakan\\Downloads\\rare-net\\backend')

from app.auth.user_store import get_user_by_email
from app.auth.jwt_handler import verify_password, create_access_token, create_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.auth.models import User

# Test getting user
email = "doctor@mumbai.hospital"
password = "password123"

print(f"Testing login for: {email}")

user = get_user_by_email(email)
if not user:
    print("ERROR: User not found!")
    sys.exit(1)

print(f"User found: {user.email}, role: {user.role}, hospital: {user.hospital}")
print(f"User ID: {user.id}")
print(f"Is active: {user.is_active}")

# Test password verification
password_valid = verify_password(password, user.hashed_password)
print(f"Password valid: {password_valid}")

if not password_valid:
    print("ERROR: Password verification failed!")
    sys.exit(1)

# Test token creation
token_data = {
    "sub": user.id,
    "email": user.email,
    "role": user.role,
    "hospital": user.hospital
}

print(f"Token data: {token_data}")

try:
    access_token = create_access_token(token_data)
    print(f"Access token created: {access_token[:50]}...")
    
    refresh_token = create_refresh_token(token_data)
    print(f"Refresh token created: {refresh_token[:50]}...")
    
    # Test User.from_user_in_db
    user_response = User.from_user_in_db(user)
    print(f"User response created: {user_response.email}")
    print(f"User response dict: {user_response.model_dump()}")
    
    print("\nAll tests passed!")
    
except Exception as e:
    print(f"ERROR creating tokens or user response: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
