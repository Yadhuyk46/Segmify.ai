from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models import ActivityLog, ContactInquiry, Customer, Prediction, Report, User
from app.schemas.inquiry import SupportInquiryOut, SupportInquiryUpdate


router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_roles("admin"))])


@router.get("/users")
def users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).limit(25).all()


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    return {
        "users": db.query(User).count(),
        "customers": db.query(Customer).count(),
        "reports": db.query(Report).count(),
        "predictions": db.query(Prediction).count(),
        "inquiries": db.query(ContactInquiry).count(),
        "unread_inquiries": db.query(ContactInquiry).filter(ContactInquiry.is_read.is_(False)).count(),
    }


@router.get("/notifications", response_model=list[SupportInquiryOut])
def notifications(db: Session = Depends(get_db)):
    return db.query(ContactInquiry).order_by(ContactInquiry.created_at.desc()).limit(100).all()


@router.patch("/notifications/{notification_id}", response_model=SupportInquiryOut)
def update_notification(notification_id: int, payload: SupportInquiryUpdate, db: Session = Depends(get_db)):
    inquiry = db.get(ContactInquiry, notification_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    if payload.status is not None:
        inquiry.status = payload.status
        if payload.status == "Resolved":
            inquiry.is_read = True
    if payload.is_read is not None:
        inquiry.is_read = payload.is_read
    db.commit()
    db.refresh(inquiry)
    return inquiry


@router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    inquiry = db.get(ContactInquiry, notification_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    db.delete(inquiry)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/logs")
def logs(db: Session = Depends(get_db)):
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(50).all()
