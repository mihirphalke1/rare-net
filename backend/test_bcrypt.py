"""
Simple test to check bcrypt directly
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Test password
password = "password123"
print(f"Password: '{password}'")
print(f"Password length: {len(password)} chars")
print(f"Password bytes: {len(password.encode('utf-8'))} bytes")
print(f"Password repr: {repr(password)}")

# Try to hash it
try:
    hashed = pwd_context.hash(password)
    print(f"Hash successful: {hashed}")
    
    # Try to verify
    result = pwd_context.verify(password, hashed)
    print(f"Verify result: {result}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
