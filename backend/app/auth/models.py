"""
Authentication Models for RareNet

Defines User, Token, and related Pydantic models for JWT authentication.
"""

from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserBase(BaseModel):
    """Base user model with common fields."""
    email: EmailStr
    role: Literal["doctor", "admin"] = "doctor"
    hospital: Optional[Literal["mumbai", "boston", "london"]] = None
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """Model for login request."""
    email: EmailStr
    password: str


class User(UserBase):
    """User model returned to clients (no password)."""
    id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        from_attributes = True


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

