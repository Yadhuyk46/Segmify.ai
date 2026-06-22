from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models import User
from app.services.report import export_customers_report


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/export")
def export_report(
    export_format: str = Query("csv", pattern="^(csv|pdf|excel)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    report = export_customers_report(db, current_user, "csv" if export_format in {"pdf", "excel"} else export_format)
    return {"message": "Report generated", "report": {"file_name": report.file_name, "format": export_format, "meta": report.meta}}
