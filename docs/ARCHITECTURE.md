# Segmify.ai Architecture

```mermaid
flowchart LR
    A[React + Tailwind Frontend] --> B[FastAPI REST API]
    B --> C[(SQLite / PostgreSQL)]
    B --> D[Scikit-learn ML Pipeline]
    B --> E[Report Export Service]
    B --> F[Auth + RBAC + Audit Logs]
    D --> G[(Saved Model Artifact)]
```

## Modules

- `frontend/`: Landing page, auth flows, dashboard pages, charts, theme support, and reusable UI components.
- `backend/`: FastAPI services, routes, SQLAlchemy models, JWT auth, analytics, reports, and admin APIs.
- `ml/`: Model training entry point and persisted ML artifacts.
- `data/`: SQLite database, exports, and the generated customer dataset.
