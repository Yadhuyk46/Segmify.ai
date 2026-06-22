from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.api.router import api_router
from app.api.routes import admin as admin_routes, ai as ai_routes, contact as contact_routes, customers as customers_routes
from app.core.config import settings
from app.core.database import Base, engine


Base.metadata.create_all(bind=engine)

with engine.begin() as connection:
    inspector = inspect(connection)
    customer_columns = {column["name"] for column in inspector.get_columns("customers")}
    if "owner_id" not in customer_columns:
        connection.execute(text("ALTER TABLE customers ADD COLUMN owner_id INTEGER"))

app = FastAPI(
    title="Segmify.ai API",
    version="1.0.0",
    description="Smart Customer Segmentation Powered by AI",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix=settings.api_prefix)
app.include_router(ai_routes.router, prefix="/api")
app.include_router(contact_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(customers_routes.router, prefix="/api")

frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
assets_dir = frontend_dist / "assets"
index_file = frontend_dist / "index.html"

if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/health")
def health():
    return {"name": settings.app_name, "status": "ok", "docs": "/docs"}


@app.get("/{full_path:path}")
def spa(full_path: str):
    if index_file.exists():
        requested = frontend_dist / full_path
        if full_path and requested.exists() and requested.is_file():
            return FileResponse(requested)
        return FileResponse(index_file)
    return {"name": settings.app_name, "status": "ok", "docs": "/docs"}
