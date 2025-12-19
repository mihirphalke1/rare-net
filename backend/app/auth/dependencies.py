"""
Authentication Dependencies for RareNet

Provides FastAPI dependencies for route protection and role-based access control.
"""

from typing import List, Optional, Callable
from functools import wraps
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .jwt_handler import verify_token
from .user_store import get_user_by_id
from .models import User, TokenData

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: Bearer token from Authorization header
        
    Returns:
        User object for the authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token, token_type="access")
    
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    
    return User(
        id=user.id,
        email=user.email,
        role=user.role,
        hospital=user.hospital,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at
    )


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure the current user is active.
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        User object if active
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_role(allowed_roles: List[str]):
    """
    Dependency factory for role-based access control.
    
    Args:
        allowed_roles: List of role names that can access the route
        
    Returns:
        Dependency function that validates user role
        
    Example:
        @app.get("/admin-only")
        def admin_route(user: User = Depends(require_role(["admin"]))):
            return {"message": "Admin access granted"}
    """
    async def role_checker(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {allowed_roles}"
            )
        return current_user
    
    return role_checker


def require_hospital(hospital_id: Optional[str] = None):
    """
    Dependency factory to restrict access to a specific hospital.
    If hospital_id is None, user can only access their own hospital.
    
    Args:
        hospital_id: Specific hospital to require, or None for user's own
        
    Returns:
        Dependency function that validates hospital access
    """
    async def hospital_checker(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        # Admins can access any hospital
        if current_user.role == "admin":
            return current_user
            
        # Doctors can only access their own hospital
        if hospital_id and current_user.hospital != hospital_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. You can only access {current_user.hospital} hospital data."
            )
            
        return current_user
    
    return hospital_checker


# Optional auth - returns None if no valid token
async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[User]:
    """
    Optional authentication - returns user if valid token, None otherwise.
    Useful for routes that work with or without authentication.
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = verify_token(token, token_type="access")
        
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        user = get_user_by_id(user_id)
        if user is None:
            return None
        
        return User(
            id=user.id,
            email=user.email,
            role=user.role,
            hospital=user.hospital,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at
        )
    except Exception:
        return None

