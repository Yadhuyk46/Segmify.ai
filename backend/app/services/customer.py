from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import ActivityLog, Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def scoped_customers_query(db: Session, user):
    query = db.query(Customer)
    if user.role != "admin":
        query = query.filter(Customer.owner_id == user.id)
    return query


def list_customers(db: Session, user, page: int, page_size: int, search: str | None = None, segment_id: int | None = None) -> tuple[list[Customer], int]:
    query = scoped_customers_query(db, user)
    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(func.lower(Customer.full_name).like(pattern) | func.lower(Customer.email).like(pattern))
    if segment_id:
        query = query.filter(Customer.segment_id == segment_id)
    total = query.count()
    items = query.order_by(Customer.total_spending.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def create_customer(db: Session, payload: CustomerCreate, actor) -> Customer:
    data = payload.model_dump()
    data["customer_code"] = data["customer_code"].strip()
    data["full_name"] = data["full_name"].strip()
    data["email"] = str(data["email"]).strip()
    customer = Customer(**data, owner_id=actor.id)
    try:
        db.add(customer)
        db.add(ActivityLog(actor_email=actor.email, action="create_customer", entity_type="customer", entity_id=data["customer_code"], meta={"name": data["full_name"]}))
        db.commit()
        db.refresh(customer)
        return customer
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="A customer with this code or email already exists.") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to save customer.") from exc


def update_customer(db: Session, customer_id: int, payload: CustomerUpdate, actor) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if actor.role != "admin" and customer.owner_id != actor.id:
        raise HTTPException(status_code=403, detail="You can update only customers uploaded by your account")
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(customer, key, value)
    customer.updated_at = datetime.utcnow()
    db.add(ActivityLog(actor_email=actor.email, action="update_customer", entity_type="customer", entity_id=str(customer_id), meta=payload.model_dump(exclude_none=True)))
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int, actor) -> None:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if actor.role != "admin" and customer.owner_id != actor.id:
        raise HTTPException(status_code=403, detail="You can delete only customers uploaded by your account")
    db.add(ActivityLog(actor_email=actor.email, action="delete_customer", entity_type="customer", entity_id=str(customer_id), meta={"name": customer.full_name}))
    db.delete(customer)
    db.commit()
