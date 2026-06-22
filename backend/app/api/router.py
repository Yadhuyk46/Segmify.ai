from fastapi import APIRouter

from app.api.routes import admin, ai, analytics, auth, contact, customers, notifications, reports, segmentation


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(ai.router)
api_router.include_router(contact.router)
api_router.include_router(customers.router)
api_router.include_router(segmentation.router)
api_router.include_router(analytics.router)
api_router.include_router(reports.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
