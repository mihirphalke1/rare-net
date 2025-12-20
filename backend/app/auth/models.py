"""
Authentication Models for RareNet

Defines User, Token, and related Pydantic models for JWT authentication.
"""

from typing import Optional, Literal, Union
from pydantic import BaseModel, Field
from datetime import datetime


class UserBase(BaseModel):
    """Base user model with common fields."""
    email: str
    role: Literal["doctor", "admin"] = "doctor"
    hospital: Optional[str] = None
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """Model for login request."""
    email: str
    password: str


class User(UserBase):
    """User model returned to clients (no password)."""
    id: str
    is_active: bool = True
    created_at: Optional[str] = None  # Store as ISO string for JSON compatibility
    
    model_config = {"from_attributes": True}
        
    @classmethod
    def from_user_in_db(cls, user_in_db):
        """Create User from UserInDB, converting datetime to string."""
        created_at_str = None
        if hasattr(user_in_db, 'created_at') and user_in_db.created_at:
            if isinstance(user_in_db.created_at, datetime):
                created_at_str = user_in_db.created_at.isoformat()
            else:
                created_at_str = str(user_in_db.created_at)
        
        return cls(
            id=user_in_db.id,
            email=user_in_db.email,
            role=user_in_db.role,
            hospital=user_in_db.hospital,
            full_name=user_in_db.full_name,
            is_active=user_in_db.is_active,
            created_at=created_at_str
        )


class UserInDB(User):
    """User model as stored in database (includes hashed password)."""
    hashed_password: str


class Token(BaseModel):
    """JWT Token response model."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until expiry
    user: User


class TokenData(BaseModel):
    """Data extracted from JWT token."""
    user_id: str
    email: str
    role: str
    hospital: Optional[str] = None
    exp: datetime


class RefreshTokenRequest(BaseModel):
    """Request model for token refresh."""
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    """Request model for password change."""
    current_password: str
    new_password: str = Field(..., min_length=6)

