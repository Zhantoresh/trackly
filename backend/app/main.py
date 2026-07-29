import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, tasks, projects, files, roles, stats
from app.config import settings

# Schema is managed by Alembic migrations (see Dockerfile CMD: `alembic upgrade head`),
# so we don't call Base.metadata.create_all() here anymore — it was redundant and
# could mask a broken/missing migration by silently creating tables from the models.

app = FastAPI(title="Trackly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://trackly.vercel.app",
        "https://trackly-mo3g.vercel.app",
          
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploaded task files, served directly by this API (backed by a Railway Volume
# mounted at settings.UPLOAD_DIR for persistence across deploys).
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=settings.UPLOAD_DIR), name="files")

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(projects.router)
app.include_router(files.router)
app.include_router(roles.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"message": "Trackly API is running"}
