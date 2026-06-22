from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    phone_number: str | None = None
    company_name: str | None = None
    business_type: str | None = None
    role: str = "user"
    remember_me: bool = False


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: str | None = None
    company_name: str | None = None
    business_type: str | None = None
    profile_photo: str | None = None
    role: str
    is_active: bool
    is_verified: bool
    remember_me: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    company_name: str | None = None
    business_type: str | None = None
    profile_photo: str | None = None
