# StockPilot AI

Your AI-powered investment research and portfolio intelligence platform.

> ⚠️ This is a learning/portfolio project. Nothing here constitutes financial advice.

## Status: Phase 1 — Project Scaffolding ✅

Architecture: `Next.js → FastAPI (routers) → Services → Repositories → PostgreSQL`

## Repo layout

```
stockpilot-ai/
  backend/    FastAPI app (clean architecture: api → services → repositories → db)
  frontend/   Next.js 14 (App Router) + TypeScript + Tailwind
```

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload   # http://localhost:8000/docs
```

Generate a `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Get a free Postgres `DATABASE_URL` from [neon.tech](https://neon.tech) (used for `DATABASE_URL`).

Verify it's working:
- `GET http://localhost:8000/` → welcome message
- `GET http://localhost:8000/api/v1/health` → `{"status": "ok"}`
- `GET http://localhost:8000/api/v1/health/db` → confirms DB connectivity

## Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                     # http://localhost:3000
```

## What's included in this phase

- Clean architecture skeleton on the backend (api / services / repositories / models / schemas / core / db)
- Centralized, typed settings via `pydantic-settings`
- SQLAlchemy engine + session dependency, ready for models
- Health check endpoints (app + DB connectivity)
- CORS configured for the Next.js origin
- Structured logging
- Next.js App Router + TypeScript + Tailwind, with design tokens (light/dark mode CSS variables) matching the StockPilot AI palette (blue primary, emerald accent, green/amber/red for gains/warnings/losses)
- Typed API client (axios) with an auth-token interceptor stub, ready for Phase 3

## Roadmap

1. ✅ Project scaffolding
2. Database schema & models
3. Authentication
4. Portfolio CRUD (holdings, P&L)
5. Dashboard UI
6. Stock details page + Alpha Vantage integration
7. Watchlist + price alerts
8. News feed + AI summarization
9. AI portfolio assistant
10. Analytics & charts
11. Notifications
12. Settings
13. Polish pass (loading/empty/error states, animation, a11y)
14. Documentation (diagrams, API docs, deployment guide)
