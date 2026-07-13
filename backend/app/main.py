from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, tasks
from app.database import engine, Base
from app.models import user, project, task
from app.routers import auth, tasks, files
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trackly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(files.router)

@app.get("/")
def root():
    return {"message": "Trackly API is running"}
