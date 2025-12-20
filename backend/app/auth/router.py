"""
Authentication Router for RareNet

Provides REST API endpoints for user authentication and management.
"""

from datetime import timedelta, datetime
from fastapi import APIRouter, HTTPException, status, Depends

from .models import (
    User, 
    UserCreate, 
    UserLogin, 
    Token, 
    RefreshTokenRequest,
    PasswordChangeRequest
)
from .jwt_handler import (
    create_access_token, 
    create_refresh_token, 
    verify_password,
    verify_token,
    hash_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .user_store import (
    get_user_by_email, 
    get_user_by_id,
    create_user,
    update_user_password,
    get_all_users,
    seed_demo_users
)
from .dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================================
# Public Endpoints
# ============================================

@router.post("/login", status_code=200)
async def login(login_data: UserLogin):
    """
    Authenticate user and return JWT tokens.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns access token (24h) and refresh token (7 days).
    """
    try:
        # Find user
        user = get_user_by_email(login_data.email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled"
            )
        
        # Create tokens
        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "hospital": user.hospital
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Return response - convert UserInDB to User with proper datetime handling
        # Handle created_at conversion manually for JSON compatibility
        created_at_str = None
        if user.created_at:
            if isinstance(user.created_at, datetime):
                created_at_str = user.created_at.isoformat()
            else:
                created_at_str = str(user.created_at)
        
        user_response = User(
            id=user.id,
            email=user.email,
            role=user.role,
            hospital=user.hospital,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=created_at_str
        )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"LOGIN ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_request: RefreshTokenRequest):
    """
    Get new access token using refresh token.
    
    - **refresh_token**: Valid refresh token
    
    Returns new access token and refresh token pair.
    """
    # Verify refresh token
    payload = verify_token(refresh_request.refresh_token, token_type="refresh")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user
    user_id = payload.get("sub")
    user = get_user_by_id(user_id)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "hospital": user.hospital
    }
    
    access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    # Convert UserInDB to User with proper datetime handling
    user_response = User.from_user_in_db(user)
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )


# ============================================
# Protected Endpoints
# ============================================

@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user's information.
    
    Requires valid access token in Authorization header.
    """
    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Change current user's password.
    
    - **current_password**: User's current password
    - **new_password**: New password (min 6 characters)
    """
    # Get full user data with password
    user = get_user_by_id(current_user.id)
    
    # Verify current password
    if not verify_password(password_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    success = update_user_password(current_user.id, password_data.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"message": "Password updated successfully"}


# ============================================
# Admin Endpoints
# ============================================

@router.post("/register", response_model=User)
async def register_user(
    user_data: UserCreate,
    current_user: User = Depends(require_role(["admin"]))
):
    """
    Register a new user (admin only).
    
    - **email**: User's email address
    - **password**: User's password (min 6 characters)
    - **role**: "doctor" or "admin"
    - **hospital**: Hospital affiliation (required for doctors)
    - **full_name**: User's full name (optional)
    """
    # Validate hospital for doctors
    if user_data.role == "doctor" and not user_data.hospital:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctors must have a hospital affiliation"
        )
    
    try:
        new_user = create_user(user_data)
        return User(
            id=new_user.id,
            email=new_user.email,
            role=new_user.role,
            hospital=new_user.hospital,
            full_name=new_user.full_name,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/users", response_model=list[User])
async def list_users(
    current_user: User = Depends(require_role(["admin"]))
):
    """
    List all users (admin only).
    """
    users = get_all_users()
    return [
        User(
            id=u.id,
            email=u.email,
            role=u.role,
            hospital=u.hospital,
            full_name=u.full_name,
            is_active=u.is_active,
            created_at=u.created_at
        )
        for u in users
    ]


# ============================================
# Setup Endpoint (for demo)
# ============================================

@router.post("/seed-demo-users")
async def seed_demo():
    """
    Seed demo users for hackathon demo.
    
    Creates:
    - doctor@mumbai.hospital (password: password123)
    - doctor@boston.hospital (password: password123)
    - doctor@london.hospital (password: password123)
    - admin@rarenet.org (password: admin123)
    """
    try:
        seed_demo_users()
        return {"message": "Demo users seeded successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to seed users: {str(e)}"
        )

