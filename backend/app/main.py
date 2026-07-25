from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, tasks, projects, files, roles, stats
from app.database import engine, Base
from app.models import user, project, task

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trackly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://trackly.vercel.app",  # TODO: replace with real prod frontend URL once deployed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(projects.router)
app.include_router(files.router)
app.include_router(roles.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"message": "Trackly API is running"}
