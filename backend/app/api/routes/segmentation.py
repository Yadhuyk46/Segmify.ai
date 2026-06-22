from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.ml.pipeline import FEATURE_COLUMNS, SegmentationEngine
from app.models import Customer, Prediction, User
from app.schemas.customer import PredictRequest, PredictResponse
from app.services.customer import scoped_customers_query
from app.services.recommendation import build_recommendations


router = APIRouter(prefix="/segmentation", tags=["Segmentation"])
engine = SegmentationEngine()


def spending_profile(customer_dict: dict) -> tuple[str, str]:
    total_spending = float(customer_dict.get("total_spending", 0.0))
    average_order_value = float(customer_dict.get("average_order_value", 0.0))
    preferred_category = customer_dict.get("preferred_category") or "selected category"
    if total_spending >= 5000 or average_order_value >= 350:
        level = "High Spender"
    elif total_spending >= 1500 or average_order_value >= 120:
        level = "Moderate Spender"
    else:
        level = "Low Spender"
    return level, f"{level} in {preferred_category} based on total spending and average order value."


@router.post("/train")
def train_model(payload: PredictRequest | None = Body(default=None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload and payload.customer:
        customer_rows = [{column: payload.customer.model_dump().get(column) for column in FEATURE_COLUMNS}]
    else:
        customers = scoped_customers_query(db, current_user).all()
        customer_rows = [{column: getattr(customer, column) for column in FEATURE_COLUMNS} for customer in customers]
    if not customer_rows:
        raise HTTPException(status_code=400, detail="No customer records available for your account. Upload or add customers first.")
    import pandas as pd

    frame = pd.DataFrame(customer_rows)
    model_key = "global" if current_user.role == "admin" else f"user_{current_user.id}"
    result = engine.train(frame, model_key=model_key)
    return {
        "message": "Model trained successfully",
        "accuracy": result["accuracy"],
        "training_size": result["training_size"],
        "test_size": result["test_size"],
        "confusion_matrix": result["confusion_matrix"],
    }


@router.post("/predict", response_model=PredictResponse)
def predict_segment(payload: PredictRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer_dict = {}
    customer_entity = None
    if payload.customer_id:
        customer_entity = scoped_customers_query(db, current_user).filter(Customer.id == payload.customer_id).first()
        if not customer_entity:
            raise HTTPException(status_code=404, detail="Customer not found")
        customer_dict = {column: getattr(customer_entity, column) for column in FEATURE_COLUMNS}
    elif payload.customer:
        customer_dict = payload.customer.model_dump()
    else:
        raise HTTPException(status_code=400, detail="customer_id or customer payload is required")

    try:
        model_key = "global" if current_user.role == "admin" else f"user_{current_user.id}"
        segment, probability = engine.predict(customer_dict, model_key=model_key)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail="Model is not trained yet. Train the model before predicting.") from exc
    recommendations = build_recommendations(segment, float(customer_dict.get("churn_risk", 0.0)), float(customer_dict.get("loyalty_score", 0.0)))
    spending_category, spending_summary = spending_profile(customer_dict)
    if customer_entity:
        prediction = Prediction(
            customer_id=customer_entity.id,
            model_name="KNN + KMeans",
            predicted_segment=segment,
            probability_score=probability,
            recommendations={"items": recommendations},
        )
        db.add(prediction)
        db.commit()
    return PredictResponse(
        segment=segment,
        probability_score=probability,
        spending_category=spending_category,
        spending_summary=spending_summary,
        recommendations=recommendations,
    )
