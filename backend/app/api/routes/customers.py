from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.services.customer import create_customer, delete_customer, list_customers, update_customer


router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("")
def get_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    segment_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_customers(db, current_user, page, page_size, search, segment_id)
    return {"items": [CustomerRead.model_validate(item) for item in items], "total": total, "page": page, "page_size": page_size}


@router.get("/", include_in_schema=False)
def get_customers_with_slash(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    segment_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_customers(page, page_size, search, segment_id, db, current_user)


@router.post("", response_model=CustomerRead)
def add_customer(payload: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_customer(db, payload, current_user)


@router.post("/", response_model=CustomerRead, include_in_schema=False)
def add_customer_with_slash(payload: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_customer(db, payload, current_user)


@router.post("/import")
def import_customers(payload: list[CustomerCreate], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    created = []
    failures = []
    for row in payload:
        try:
            created.append(create_customer(db, row, current_user))
        except Exception as exc:
            db.rollback()
            failures.append({"customer_code": row.customer_code, "detail": str(exc)})
    return {"created": len(created), "failed": len(failures), "failures": failures[:10]}


@router.put("/{customer_id}", response_model=CustomerRead)
def edit_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_customer(db, customer_id, payload, current_user)


@router.delete("/{customer_id}")
def remove_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    delete_customer(db, customer_id, current_user)
    return {"message": "Customer deleted"}
