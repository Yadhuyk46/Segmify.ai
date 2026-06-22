from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=2)
    age: int = Field(ge=0, le=120)
    gender: str = Field(min_length=1)
    email: EmailStr
    phone: str = Field(min_length=3)
    address: str = Field(min_length=2)
    country: str = Field(min_length=2)
    city: str = Field(min_length=2)
    occupation: str = Field(min_length=2)
    income: float = Field(ge=0)
    purchase_frequency: int = Field(ge=0)
    average_order_value: float = Field(ge=0)
    total_spending: float = Field(ge=0)
    last_purchase_date: datetime
    preferred_category: str = Field(min_length=2)
    loyalty_score: float = Field(ge=0)
    customer_lifetime_value: float = Field(ge=0)
    churn_risk: float = Field(default=0.0, ge=0)
    is_active: bool = True


class CustomerCreate(CustomerBase):
    customer_code: str = Field(min_length=2)
    segment_id: int | None = None


class CustomerUpdate(BaseModel):
    full_name: str | None = None
    age: int | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    country: str | None = None
    city: str | None = None
    occupation: str | None = None
    income: float | None = None
    purchase_frequency: int | None = None
    average_order_value: float | None = None
    total_spending: float | None = None
    preferred_category: str | None = None
    loyalty_score: float | None = None
    customer_lifetime_value: float | None = None
    churn_risk: float | None = None
    is_active: bool | None = None
    segment_id: int | None = None


class CustomerRead(CustomerBase):
    id: int
    customer_code: str
    owner_id: int | None = None
    segment_id: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SegmentRead(BaseModel):
    id: int
    name: str
    description: str
    strategy_hint: str
    model_config = ConfigDict(from_attributes=True)


class PredictCustomerInput(BaseModel):
    age: int
    gender: str
    country: str
    preferred_category: str | None = None
    income: float
    purchase_frequency: int
    average_order_value: float
    total_spending: float
    loyalty_score: float
    customer_lifetime_value: float
    churn_risk: float = 0.0


class PredictRequest(BaseModel):
    customer_id: int | None = None
    customer: PredictCustomerInput | None = None


class PredictResponse(BaseModel):
    segment: str
    probability_score: float
    spending_category: str
    spending_summary: str
    recommendations: list[str]
