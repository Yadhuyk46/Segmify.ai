from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import ActivityLog, User
from app.schemas.auth import UserLogin, UserRegister, UserUpdate


def register_user(db: Session, payload: UserRegister) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    role = "user" if payload.role not in {"user", "analyst"} else payload.role
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        phone_number=payload.phone_number,
        company_name=payload.company_name,
        business_type=payload.business_type,
        role=role,
        remember_me=payload.remember_me,
    )
    db.add(user)
    db.add(ActivityLog(actor_email=payload.email, action="register", entity_type="user", entity_id=payload.email, meta={"role": role}))
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, payload: UserLogin) -> str:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    expires = timedelta(days=30) if payload.remember_me else timedelta(minutes=settings.access_token_expire_minutes)
    db.add(ActivityLog(actor_email=user.email, action="login", entity_type="user", entity_id=str(user.id), meta={"remember_me": payload.remember_me}))
    db.commit()
    return create_access_token(user.email, expires_delta=expires, extra={"role": user.role})


def update_profile(db: Session, user: User, payload: UserUpdate) -> User:
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(user, key, value)
    db.add(ActivityLog(actor_email=user.email, action="profile_update", entity_type="user", entity_id=str(user.id), meta=payload.model_dump(exclude_none=True)))
    db.commit()
    db.refresh(user)
    return user
