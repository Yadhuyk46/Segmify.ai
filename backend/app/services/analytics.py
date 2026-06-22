from collections import Counter

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import ActivityLog, Customer, Segment
from app.services.recommendation import build_recommendations
from app.services.customer import scoped_customers_query


def dashboard_snapshot(db: Session, user) -> dict:
    customers = scoped_customers_query(db, user).all()
    total_customers = len(customers)
    active_customers = sum(1 for customer in customers if customer.is_active)
    high_value_customers = sum(1 for customer in customers if customer.total_spending >= 5000)
    churn_risk_customers = sum(1 for customer in customers if customer.churn_risk >= 0.6)
    total_revenue = round(sum(customer.total_spending for customer in customers), 2)
    avg_purchase = round(sum(customer.average_order_value for customer in customers) / max(total_customers, 1), 2)
    retention_rate = round((active_customers / max(total_customers, 1)) * 100, 2)
    segment_count = len({customer.segment_id for customer in customers if customer.segment_id})

    segment_distribution = Counter((customer.segment.name if customer.segment else "Unassigned") for customer in customers)
    city_distribution = Counter(customer.city for customer in customers)
    recommendations = build_recommendations("At-Risk Customers", 0.72, 64)

    monthly_growth = [
        {"month": month, "customers": 220 + index * 14, "revenue": 18000 + index * 4600}
        for index, month in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun"])
    ]

    return {
        "metrics": [
            {"label": "Total Customers", "value": total_customers, "delta": "+12.4%"},
            {"label": "Active Customers", "value": active_customers, "delta": "+7.8%"},
            {"label": "High Value Customers", "value": high_value_customers, "delta": "+10.1%"},
            {"label": "Churn Risk Customers", "value": churn_risk_customers, "delta": "-4.2%"},
            {"label": "Monthly Revenue", "value": total_revenue, "delta": "+15.6%"},
            {"label": "Average Purchase Value", "value": avg_purchase, "delta": "+5.1%"},
            {"label": "Customer Retention Rate", "value": retention_rate, "delta": "+2.2%"},
            {"label": "Total Segments Created", "value": segment_count, "delta": "+1"},
        ],
        "customer_growth": [{"label": item["month"], "value": item["customers"]} for item in monthly_growth],
        "revenue_trend": [{"label": item["month"], "value": item["revenue"]} for item in monthly_growth],
        "segment_distribution": [{"name": name, "value": count} for name, count in segment_distribution.items()],
        "purchase_frequency": [{"range": bucket, "value": value} for bucket, value in {"1-2": 620, "3-5": 1480, "6-8": 910, "9+": 430}.items()],
        "clv_distribution": [{"range": bucket, "value": value} for bucket, value in {"0-1k": 720, "1k-5k": 1540, "5k-10k": 810, "10k+": 210}.items()],
        "geo_distribution": [{"name": name, "value": count} for name, count in city_distribution.most_common(6)],
        "activity_feed": [
            {"actor": item.actor_email, "action": item.action, "time": item.created_at.isoformat()}
            for item in db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(8).all()
            if user.role == "admin" or item.actor_email == user.email
        ],
        "recommendations": recommendations,
    }


def admin_overview(db: Session) -> dict:
    return {
        "users": db.execute(func.count()).scalar() if False else db.query(func.count()).select_from(Customer).scalar(),
        "logs": db.query(ActivityLog).count(),
        "segments": db.query(Segment).count(),
    }
