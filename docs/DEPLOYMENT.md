# Deployment Guide

## Local

1. Copy `.env.example` to `.env`.
2. Install Python dependencies from `backend/requirements.txt`.
3. Run `python backend/seed.py`.
4. Start the API with `uvicorn app.main:app --reload` from `backend/`.
5. Install frontend dependencies in `frontend/` and run `npm run dev`.

## Docker

1. Ensure Docker Desktop is running.
2. Create `.env` at the repository root.
3. Run `docker compose up --build`.

## Production Notes

- Replace SQLite with PostgreSQL.
- Store JWT secret in a managed secret store.
- Wire the password reset and email verification endpoints to SMTP or a transactional email provider.
- Serve the frontend behind Nginx or Vercel and the API behind a reverse proxy with HTTPS.
