from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas.analytics import DashboardAnalytics
from app.services.analytics import dashboard_snapshot


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardAnalytics)
def dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return dashboard_snapshot(db, current_user)
