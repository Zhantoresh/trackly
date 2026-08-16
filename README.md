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

## Deploying on the university server (esg.kbtu.kz/trackly)

Self-contained alternative to Railway + Vercel: everything runs as three Docker
services (`trackly-db`, `trackly-backend`, `trackly-web`) behind the shared
`esg-network`, following the KBTU deploy guide (no `ports:`, project-prefixed
service names, internal Nginx unaware of the `/trackly` path prefix — the
public Nginx that DevOps runs strips it before forwarding here).

1. Copy `.env.example` to `.env` in the repo root and fill in `DB_PASSWORD`,
   `SECRET_KEY` (e.g. `openssl rand -hex 32`), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. Make sure the shared network exists once on the server: `docker network create esg-network` (skip if DevOps already created it).
3. `docker compose up -d --build`.
   - `trackly-backend` runs its own `alembic upgrade head` + creates the first
     admin on boot, same as the Railway setup. Uploaded files persist in the
     `trackly-uploads` named volume.
   - `trackly-web` builds the frontend with `VITE_BASE_PATH=/trackly/` and
     `VITE_API_URL=/trackly` baked in (see `frontend/Dockerfile`), so all
     asset and API URLs resolve correctly once requests reach this container
     with the `/trackly` prefix already stripped.
4. Ask DevOps to route `esg.kbtu.kz/trackly/` → `trackly-web:80/` (prefix
   stripped, per the KBTU deploy guide's Nginx convention).

If the project ever needs to move to a different path than `/trackly`, update
`VITE_BASE_PATH`/`VITE_API_URL` in `docker-compose.yml` and `PUBLIC_BASE_URL`
to match — those three are the only path-specific values.

