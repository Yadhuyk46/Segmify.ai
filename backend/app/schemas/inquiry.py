from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


InquiryStatus = Literal["New", "In Progress", "Resolved"]


class ContactInquiryCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    message: str = Field(min_length=5, max_length=4000)


class SupportInquiryUpdate(BaseModel):
    status: InquiryStatus | None = None
    is_read: bool | None = None


class SupportInquiryOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    message: str
    status: str
    is_read: bool
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
