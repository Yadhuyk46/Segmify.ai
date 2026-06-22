from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MessageResponse(BaseModel):
    message: str


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 10


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int


class TimestampedSchema(BaseModel):
    created_at: datetime
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
