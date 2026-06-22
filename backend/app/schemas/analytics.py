from pydantic import BaseModel


class MetricCard(BaseModel):
    label: str
    value: float | int | str
    delta: str


class DashboardAnalytics(BaseModel):
    metrics: list[MetricCard]
    customer_growth: list[dict]
    revenue_trend: list[dict]
    segment_distribution: list[dict]
    purchase_frequency: list[dict]
    clv_distribution: list[dict]
    geo_distribution: list[dict]
    activity_feed: list[dict]
    recommendations: list[str]
