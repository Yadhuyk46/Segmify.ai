from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: int | None = None


class AIChatMessageOut(BaseModel):
    id: int
    role: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIChatResponse(BaseModel):
    session_id: int
    reply: str
    messages: list[AIChatMessageOut]


class AIHistoryResponse(BaseModel):
    session_id: int | None
    messages: list[AIChatMessageOut]
