from datetime import UTC, datetime, timedelta
from pathlib import Path
from random import choice, randint, random, uniform

import csv


TARGET = Path(__file__).resolve().parent / "customers_5000.csv"
COUNTRIES = [
    ("USA", "New York"),
    ("India", "Bengaluru"),
    ("UK", "London"),
    ("Germany", "Berlin"),
    ("Canada", "Toronto"),
    ("UAE", "Dubai"),
    ("Australia", "Sydney"),
    ("Singapore", "Singapore"),
]
OCCUPATIONS = ["Engineer", "Manager", "Designer", "Consultant", "Founder", "Analyst", "Teacher", "Doctor"]
CATEGORIES = ["Electronics", "Fashion", "Home", "Sports", "Beauty", "Groceries", "Books", "Travel"]
GENDERS = ["Male", "Female", "Other"]
SEGMENTS = ["Premium Customers", "Loyal Customers", "High Spending Customers", "Budget Customers", "At-Risk Customers", "New Customers", "Occasional Buyers", "Inactive Customers"]


def infer_segment(total_spending: float, loyalty_score: float, churn_risk: float, purchase_frequency: int) -> str:
    if churn_risk > 0.75:
        return "At-Risk Customers"
    if total_spending > 9000:
        return "Premium Customers"
    if loyalty_score > 82 and purchase_frequency >= 6:
        return "Loyal Customers"
    if total_spending > 5500:
        return "High Spending Customers"
    if purchase_frequency <= 2:
        return "Occasional Buyers"
    if loyalty_score < 35:
        return "Inactive Customers"
    return choice(["Budget Customers", "New Customers"])


def main(records: int = 5000):
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with TARGET.open("w", newline="", encoding="utf-8") as handle:
      writer = csv.DictWriter(
          handle,
          fieldnames=[
              "customer_id",
              "full_name",
              "age",
              "gender",
              "email",
              "phone",
              "address",
              "country",
              "city",
              "occupation",
              "income",
              "purchase_frequency",
              "average_order_value",
              "total_spending",
              "last_purchase_date",
              "preferred_category",
              "loyalty_score",
              "customer_lifetime_value",
              "churn_risk",
              "segment",
          ],
      )
      writer.writeheader()
      for index in range(1, records + 1):
          country, city = choice(COUNTRIES)
          total_spending = round(uniform(220, 15000), 2)
          purchase_frequency = randint(1, 14)
          loyalty_score = round(uniform(8, 99), 2)
          churn_risk = round(random(), 2)
          segment = infer_segment(total_spending, loyalty_score, churn_risk, purchase_frequency)
          writer.writerow(
              {
                  "customer_id": f"SEG-{index:05d}",
                  "full_name": f"Customer {index}",
                  "age": randint(18, 72),
                  "gender": choice(GENDERS),
                  "email": f"customer{index}@segmify.ai",
                  "phone": f"+1-202-555-{1000 + (index % 9000)}",
                  "address": f"{randint(10, 999)} Market Street",
                  "country": country,
                  "city": city,
                  "occupation": choice(OCCUPATIONS),
                  "income": round(uniform(22000, 220000), 2),
                  "purchase_frequency": purchase_frequency,
                  "average_order_value": round(uniform(18, 1200), 2),
                  "total_spending": total_spending,
                  "last_purchase_date": (datetime.now(UTC) - timedelta(days=randint(1, 360))).date().isoformat(),
                  "preferred_category": choice(CATEGORIES),
                  "loyalty_score": loyalty_score,
                  "customer_lifetime_value": round(total_spending * uniform(1.2, 4.1), 2),
                  "churn_risk": churn_risk,
                  "segment": segment,
              }
          )


if __name__ == "__main__":
    main()
