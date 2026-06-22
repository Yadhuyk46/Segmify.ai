from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models import Segment, User


SEGMENTS = [
    ("Premium Customers", "High lifetime value and high purchase intent.", "Prioritize exclusivity and premium service."),
    ("Loyal Customers", "Repeat buyers with healthy retention signals.", "Use loyalty rewards and referrals."),
    ("Budget Customers", "Price sensitive buyers with lower AOV.", "Promote bundles and smart discounts."),
    ("At-Risk Customers", "Customers with decreasing engagement and rising churn risk.", "Trigger reactivation campaigns."),
    ("Occasional Buyers", "Low-frequency customers with good upsell potential.", "Improve cadence with reminders and education."),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if not db.query(User).filter(User.email == "admin@segmify.ai").first():
        db.add(User(full_name="Segmify Admin", email="admin@segmify.ai", hashed_password=get_password_hash("Admin@123"), role="admin", is_verified=True))
        db.add(User(full_name="Business Analyst", email="analyst@segmify.ai", hashed_password=get_password_hash("Analyst@123"), role="analyst", is_verified=True))
        db.add(User(full_name="Standard User", email="user@segmify.ai", hashed_password=get_password_hash("User@12345"), role="user", is_verified=True))

    for name, description, strategy in SEGMENTS:
        segment = db.query(Segment).filter(Segment.name == name).first()
        if not segment:
            segment = Segment(name=name, description=description, strategy_hint=strategy)
            db.add(segment)
    db.commit()
    db.close()


if __name__ == "__main__":
    run()
