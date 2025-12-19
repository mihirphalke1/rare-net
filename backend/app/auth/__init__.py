"""
RareNet Authentication Module

Provides JWT-based authentication with role-based access control.
Supports Doctor and Admin roles with hospital affiliations.
"""

from .models import User, UserCreate, UserInDB, Token, TokenData
from .jwt_handler import create_access_token, create_refresh_token, verify_token
from .dependencies import get_current_user, get_current_active_user, require_role
from .router import router as auth_router

__all__ = [
    "User",
    "UserCreate", 
    "UserInDB",
    "Token",
    "TokenData",
    "create_access_token",
    "create_refresh_token",
    "verify_token",
    "get_current_user",
    "get_current_active_user",
    "require_role",
    "auth_router"
]

