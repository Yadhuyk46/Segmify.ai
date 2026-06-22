from collections import Counter, defaultdict

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import ContactInquiry, Customer, Prediction, Report, User


def build_ai_reply(db: Session, user: User, prompt: str) -> str:
    prompt_lower = prompt.lower()
    customers = _customer_query(db, user).all()
    predictions = _prediction_query(db, user).all()
    reports_count = _reports_count(db, user)
    notification_summary = _notification_summary(db) if user.role == "admin" else None

    if not customers:
        return (
            "I do not see saved customers for this workspace yet. Add customer profiles or upload a CSV, "
            "then I can summarize segments, churn risk, CLV, revenue patterns, and retention actions."
        )

    metrics = _customer_metrics(customers)

    if any(word in prompt_lower for word in ["churn", "retention", "retain", "risk"]):
        return _churn_response(metrics)
    if any(word in prompt_lower for word in ["best segment", "segment performs", "segments", "segmentation", "best customer"]):
        return _segment_response(metrics, predictions)
    if any(word in prompt_lower for word in ["revenue", "growth", "spending", "sales"]):
        return _revenue_response(metrics)
    if any(word in prompt_lower for word in ["clv", "lifetime", "value"]):
        return _clv_response(metrics)
    if any(word in prompt_lower for word in ["recommend", "offer", "marketing", "campaign", "high-value", "high value"]):
        return _recommendation_response(metrics)
    if any(word in prompt_lower for word in ["admin", "user", "report", "notification", "overview", "system"]):
        return _admin_response(db, user, metrics, reports_count, notification_summary)

    return _general_response(metrics, predictions, reports_count, notification_summary, user.role)


def _customer_query(db: Session, user: User):
    query = db.query(Customer)
    if user.role != "admin":
        query = query.filter(Customer.owner_id == user.id)
    return query


def _prediction_query(db: Session, user: User):
    query = db.query(Prediction).join(Customer, Prediction.customer_id == Customer.id)
    if user.role != "admin":
        query = query.filter(Customer.owner_id == user.id)
    return query


def _reports_count(db: Session, user: User) -> int:
    query = db.query(Report)
    if user.role != "admin":
        query = query.filter(Report.user_id == user.id)
    return query.count()


def _notification_summary(db: Session) -> dict:
    total = db.query(ContactInquiry).count()
    unread = db.query(ContactInquiry).filter(ContactInquiry.is_read.is_(False)).count()
    new = db.query(ContactInquiry).filter(ContactInquiry.status == "New").count()
    return {"total": total, "unread": unread, "new": new}


def _customer_metrics(customers: list[Customer]) -> dict:
    total_revenue = sum(float(item.total_spending or 0) for item in customers)
    avg_order = sum(float(item.average_order_value or 0) for item in customers) / max(len(customers), 1)
    avg_clv = sum(float(item.customer_lifetime_value or 0) for item in customers) / max(len(customers), 1)
    avg_loyalty = sum(float(item.loyalty_score or 0) for item in customers) / max(len(customers), 1)

    def normalized_churn(value):
        number = float(value or 0)
        return number / 100 if number > 1 else number

    high_churn = [item for item in customers if normalized_churn(item.churn_risk) >= 0.5 or float(item.loyalty_score or 0) < 40]
    medium_churn = [item for item in customers if 0.25 <= normalized_churn(item.churn_risk) < 0.5]
    high_value = sorted(customers, key=lambda item: float(item.customer_lifetime_value or item.total_spending or 0), reverse=True)[:5]

    category_revenue = defaultdict(float)
    city_counts = Counter()
    segment_spend = defaultdict(float)
    segment_count = Counter()
    for customer in customers:
        category_revenue[customer.preferred_category or "Unknown"] += float(customer.total_spending or 0)
        city_counts[f"{customer.city}, {customer.country}"] += 1
        segment_key = customer.segment.name if customer.segment else customer.preferred_category or "Unassigned"
        segment_spend[segment_key] += float(customer.total_spending or 0)
        segment_count[segment_key] += 1

    top_category = max(category_revenue.items(), key=lambda item: item[1], default=("No category", 0))
    top_city = city_counts.most_common(1)[0] if city_counts else ("No location", 0)
    top_segment = max(segment_spend.items(), key=lambda item: item[1], default=("Unassigned", 0))

    return {
        "count": len(customers),
        "total_revenue": total_revenue,
        "avg_order": avg_order,
        "avg_clv": avg_clv,
        "avg_loyalty": avg_loyalty,
        "high_churn": high_churn,
        "medium_churn": medium_churn,
        "high_value": high_value,
        "top_category": top_category,
        "top_city": top_city,
        "top_segment": top_segment,
        "segment_count": segment_count,
    }


def _money(value: float) -> str:
    return f"${value:,.0f}"


def _names(customers: list[Customer]) -> str:
    return ", ".join(item.full_name for item in customers[:4]) or "no matching customers"


def _churn_response(metrics: dict) -> str:
    high = metrics["high_churn"]
    medium = metrics["medium_churn"]
    return (
        f"### Churn insights\n"
        f"- **{len(high)} customers** are high risk based on churn score or low loyalty.\n"
        f"- **{len(medium)} customers** sit in the medium-risk band and are good retention targets.\n"
        f"- Watchlist: **{_names(high)}**.\n\n"
        "Recommended actions: launch loyalty rewards for high-risk customers, send personalized re-engagement offers, "
        "and prioritize customers with low purchase frequency but meaningful CLV."
    )


def _segment_response(metrics: dict, predictions: list[Prediction]) -> str:
    prediction_counts = Counter(item.predicted_segment for item in predictions)
    predicted = prediction_counts.most_common(1)[0] if prediction_counts else None
    predicted_text = f" The most common predicted segment is **{predicted[0]}** ({predicted[1]} predictions)." if predicted else ""
    return (
        f"### Segment performance\n"
        f"- Best revenue segment: **{metrics['top_segment'][0]}** with {_money(metrics['top_segment'][1])} in spending.\n"
        f"- Strongest category: **{metrics['top_category'][0]}** with {_money(metrics['top_category'][1])} revenue.\n"
        f"- Average loyalty score is **{metrics['avg_loyalty']:.1f}** across {metrics['count']} customers.{predicted_text}\n\n"
        "Focus growth campaigns on the top segment first, then compare churn and CLV before expanding offers to adjacent groups."
    )


def _revenue_response(metrics: dict) -> str:
    return (
        f"### Revenue growth analysis\n"
        f"- Total tracked customer spending is **{_money(metrics['total_revenue'])}**.\n"
        f"- Average order value is **{_money(metrics['avg_order'])}**.\n"
        f"- Top revenue category is **{metrics['top_category'][0]}**.\n"
        f"- Most represented location is **{metrics['top_city'][0]}** ({metrics['top_city'][1]} customers).\n\n"
        "To grow revenue, bundle offers around the top category, then use high-CLV customers for VIP campaigns and medium-CLV customers for upsell tests."
    )


def _clv_response(metrics: dict) -> str:
    return (
        f"### CLV trends\n"
        f"- Average customer lifetime value is **{_money(metrics['avg_clv'])}**.\n"
        f"- Highest-value customers include **{_names(metrics['high_value'])}**.\n"
        f"- Average loyalty score is **{metrics['avg_loyalty']:.1f}**.\n\n"
        "CLV is strongest when purchase frequency and loyalty rise together. Prioritize premium support, early-access offers, and targeted cross-sell for the top CLV group."
    )


def _recommendation_response(metrics: dict) -> str:
    return (
        f"### High-value recommendations\n"
        f"- Target **{metrics['top_category'][0]}** customers first because they generate the most revenue.\n"
        f"- Create a retention lane for **{len(metrics['high_churn'])} high-risk customers**.\n"
        f"- Build VIP campaigns for **{_names(metrics['high_value'])}**.\n\n"
        "Suggested campaign mix: loyalty rewards for churn risk, premium bundles for high CLV, and limited-time offers for medium-spend customers."
    )


def _admin_response(db: Session, user: User, metrics: dict, reports_count: int, notification_summary: dict | None) -> str:
    if user.role != "admin":
        return (
            f"### Workspace overview\n"
            f"- You have **{metrics['count']} saved customers** in your workspace.\n"
            f"- Your accessible report count is **{reports_count}**.\n"
            f"- Current tracked spending is **{_money(metrics['total_revenue'])}**.\n\n"
            "Admin-only system totals and support notifications are restricted to admin accounts."
        )
    total_users = db.query(User).count()
    return (
        f"### Admin overview\n"
        f"- Users: **{total_users}**\n"
        f"- Customers: **{metrics['count']}**\n"
        f"- Reports: **{reports_count}**\n"
        f"- Support inquiries: **{notification_summary['total']} total**, **{notification_summary['unread']} unread**, **{notification_summary['new']} new**\n\n"
        "Operationally, review unread inquiries first, then use customer and churn views to prioritize campaigns."
    )


def _general_response(metrics: dict, predictions: list[Prediction], reports_count: int, notification_summary: dict | None, role: str) -> str:
    admin_line = ""
    if role == "admin" and notification_summary:
        admin_line = f"- Admin notifications: **{notification_summary['unread']} unread** support inquiries.\n"
    return (
        f"### Segmify.ai insight summary\n"
        f"- Customers analyzed: **{metrics['count']}**\n"
        f"- Total spending: **{_money(metrics['total_revenue'])}**\n"
        f"- Average CLV: **{_money(metrics['avg_clv'])}**\n"
        f"- High churn watchlist: **{len(metrics['high_churn'])} customers**\n"
        f"- Reports available: **{reports_count}**\n"
        f"{admin_line}\n"
        "Ask me about churn insights, best customer segments, revenue growth, CLV trends, or high-value customer recommendations."
    )
