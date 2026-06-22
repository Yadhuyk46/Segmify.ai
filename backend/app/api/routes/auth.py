from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest, TokenResponse, UserLogin, UserProfile, UserRegister, UserUpdate
from app.schemas.common import MessageResponse
from app.services.auth import login_user, register_user, update_profile


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserProfile)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, payload)
    return TokenResponse(access_token=token)


@router.post("/logout", response_model=MessageResponse)
def logout():
    return MessageResponse(message="Logout handled client-side by removing JWT token.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(_: ForgotPasswordRequest):
    return MessageResponse(message="Password reset link simulated. Integrate SMTP provider for production.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(_: ResetPasswordRequest):
    return MessageResponse(message="Password reset flow stubbed for local development.")


@router.post("/verify-email", response_model=MessageResponse)
def verify_email():
    return MessageResponse(message="Email verification endpoint ready for provider integration.")


@router.get("/me", response_model=UserProfile)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfile)
def profile_update(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_profile(db, current_user, payload)
