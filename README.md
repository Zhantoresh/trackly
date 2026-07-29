# trackly
Team project management platform

## Stack
- **Frontend:** React + Vite + Tailwind, deployed on Vercel
- **Backend:** FastAPI, deployed on Railway (Docker)
- **Database:** PostgreSQL, hosted on Railway (Postgres plugin, same project as backend — internal network, no public egress)
- **File storage:** local disk on the backend service, served directly by the API and backed by a Railway Volume for persistence (no external storage provider)

## Deploying the backend (Railway)

1. Create a new Railway project → **+ New → Database → PostgreSQL**.
2. In the same project → **+ New → GitHub Repo** → select this repo.
   - In the service's Settings → set **Root Directory** to `backend`.
   - Railway will auto-detect `backend/railway.json` and build from `backend/Dockerfile`.
3. Add a **Volume** to the backend service (Settings → Volumes → **+ New Volume**), mount path `/app/uploads`. Without this, uploaded files are lost on every redeploy.
4. Set environment variables on the backend service:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=<generate a new secret, e.g. `openssl rand -hex 32`>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   UPLOAD_DIR=/app/uploads
   PUBLIC_BASE_URL=<this service's public domain, set after step 6, e.g. https://trackly-backend-production.up.railway.app>
   ```
5. Deploy. The container entrypoint runs `alembic upgrade head` before starting `uvicorn`, so the schema is created automatically on first boot — you start with a clean, empty database.
6. Under Settings → Networking → **Generate Domain** to get a public URL for the API, then go back and set `PUBLIC_BASE_URL` to that domain (step 4) and redeploy — it's used to build links to uploaded files.

## Deploying the frontend (Vercel)

Set `VITE_API_URL` in `frontend/.env.production` (or as a Vercel project env var) to the Railway backend's public domain, then redeploy. No other frontend changes are needed — the app talks to the backend exclusively through `VITE_API_URL`.

