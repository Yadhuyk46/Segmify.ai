# Installation Guide

## Prerequisites

- Python 3.13+
- Node.js 20+
- npm 10+
- Docker Desktop optional

## Steps

1. Copy `.env.example` to `.env`.
2. Install backend dependencies:
   `cd backend && python -m pip install -r requirements.txt`
3. Seed the local database:
   `python seed.py`
4. Start the backend:
   `uvicorn app.main:app --reload`
5. Install frontend dependencies:
   `cd ../frontend && npm install`
6. Start the frontend:
   `npm run dev`
