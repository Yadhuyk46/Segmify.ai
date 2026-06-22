from csv import DictWriter
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import BASE_DIR
from app.models import Customer, Report, User


def export_customers_report(db: Session, user: User, export_format: str = "csv") -> Report:
    export_dir = BASE_DIR / "data" / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)
    file_name = f"customer_report.{export_format}"
    target = export_dir / file_name

    customers = db.query(Customer).all()
    if export_format == "csv":
        with target.open("w", newline="", encoding="utf-8") as handle:
            writer = DictWriter(handle, fieldnames=["customer_code", "full_name", "country", "city", "total_spending", "loyalty_score"])
            writer.writeheader()
            for customer in customers:
                writer.writerow(
                    {
                        "customer_code": customer.customer_code,
                        "full_name": customer.full_name,
                        "country": customer.country,
                        "city": customer.city,
                        "total_spending": customer.total_spending,
                        "loyalty_score": customer.loyalty_score,
                    }
                )

    report = Report(user_id=user.id, report_type="customer_segment_report", file_name=file_name, export_format=export_format, meta={"rows": len(customers), "path": str(target)})
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
