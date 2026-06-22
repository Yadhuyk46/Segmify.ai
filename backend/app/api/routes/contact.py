from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ContactInquiry
from app.schemas.inquiry import ContactInquiryCreate


router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("")
def create_contact_inquiry(payload: ContactInquiryCreate, db: Session = Depends(get_db)):
    try:
        inquiry = ContactInquiry(
            full_name=payload.full_name.strip(),
            email=str(payload.email).strip(),
            message=payload.message.strip(),
            status="New",
            is_read=False,
        )
        db.add(inquiry)
        db.commit()
        db.refresh(inquiry)
        return {"success": True, "message": "Inquiry submitted successfully", "inquiry_id": inquiry.id}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to submit inquiry.") from exc


@router.post("/", include_in_schema=False)
def create_contact_inquiry_with_slash(payload: ContactInquiryCreate, db: Session = Depends(get_db)):
    return create_contact_inquiry(payload, db)
