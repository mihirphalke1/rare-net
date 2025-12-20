#!/usr/bin/env python
"""Direct test of login logic"""
import sys
sys.path.insert(0, 'c:\\Users\\aakan\\Downloads\\rare-net\\backend')

from app.auth.user_store import get_user_by_email
from app.auth.jwt_handler import verify_password, create_access_token, create_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.auth.models import User, Token

# Test getting user
email = "doctor@mumbai.hospital"
password = "password123"

print(f"Looking up user: {email}")
user = get_user_by_email(email)

if user:
    print(f"Found user: {user.email}, role: {user.role}, hospital: {user.hospital}")
    print(f"User type: {type(user)}")
    print(f"User dict: {user.__dict__}")
    
    # Test password
    if verify_password(password, user.hashed_password):
        print("Password verified!")
        
        # Try to create token data
        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "hospital": user.hospital
        }
        print(f"Token data: {token_data}")
        
        # Try to create tokens
        try:
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            print("Tokens created successfully!")
            
            # Try to create User response
            try:
                created_at_str = None
                if user.created_at:
                    from datetime import datetime
                    if isinstance(user.created_at, datetime):
                        created_at_str = user.created_at.isoformat()
                    else:
                        created_at_str = str(user.created_at)
                
                print(f"created_at_str: {created_at_str}")
                
                user_response = User(
                    id=user.id,
                    email=user.email,
                    role=user.role,
                    hospital=user.hospital,
                    full_name=user.full_name,
                    is_active=user.is_active,
                    created_at=created_at_str
                )
                print(f"User response created: {user_response}")
                
                # Try to create Token response
                try:
                    token_response = Token(
                        access_token=access_token,
                        refresh_token=refresh_token,
                        token_type="bearer",
                        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                        user=user_response
                    )
                    print(f"Token response created successfully!")
                    print(f"Token response: {token_response.model_dump_json(indent=2)}")
                except Exception as e:
                    print(f"ERROR creating Token response: {e}")
                    import traceback
                    traceback.print_exc()
                    
            except Exception as e:
                print(f"ERROR creating User response: {e}")
                import traceback
                traceback.print_exc()
                
        except Exception as e:
            print(f"ERROR creating tokens: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("Password verification failed!")
else:
    print("User not found!")
