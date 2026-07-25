from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.task import Task, TaskFile
from app.models.user import User
from app.routers.auth import get_current_user
from app.config import settings
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
import httpx
import uuid

router = APIRouter(prefix="/api/projects", tags=["files"])


# --- Supabase Storage helpers ---

SUPABASE_STORAGE_URL = f"{settings.SUPABASE_URL}/storage/v1/object"
SUPABASE_HEADERS = {
    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
    "apikey": settings.SUPABASE_SERVICE_KEY,
}
BUCKET = "task-files"


def upload_to_supabase(file_bytes: bytes, file_name: str, content_type: str) -> str:
    """Загружает файл в Supabase Storage, возвращает публичный URL."""
    path = f"{uuid.uuid4()}_{file_name}"
    url = f"{SUPABASE_STORAGE_URL}/{BUCKET}/{path}"

    with httpx.Client() as client:
        response = client.post(
            url,
            content=file_bytes,
            headers={**SUPABASE_HEADERS, "Content-Type": content_type},
        )
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=f"Upload failed: {response.text}")

    public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path}"
    return public_url, path


def delete_from_supabase(path: str):
    """Удаляет файл из Supabase Storage по пути."""
    url = f"{SUPABASE_STORAGE_URL}/{BUCKET}/{path}"
    with httpx.Client() as client:
        response = client.delete(url, headers=SUPABASE_HEADERS)
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail=f"Delete failed: {response.text}")


# --- Schemas ---

class FileResponse(BaseModel):
    id: UUID
    task_id: UUID
    file_name: str
    file_url: str
    uploaded_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Endpoints ---

@router.post("/{project_id}/tasks/{task_id}/files", response_model=FileResponse)
async def upload_file(
    project_id: UUID,
    task_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Проверяем что задача существует и принадлежит проекту
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"

    public_url, storage_path = upload_to_supabase(file_bytes, file.filename, content_type)

    task_file = TaskFile(
        task_id=task_id,
        file_name=file.filename,
        file_url=public_url,
        uploaded_by=current_user.id,
    )
    db.add(task_file)
    db.commit()
    db.refresh(task_file)
    return task_file


@router.get("/{project_id}/tasks/{task_id}/files", response_model=list[FileResponse])
def get_files(
    project_id: UUID,
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    files = db.query(TaskFile).filter(TaskFile.task_id == task_id).all()
    return files


@router.delete("/{project_id}/tasks/{task_id}/files/{file_id}")
def delete_file(
    project_id: UUID,
    task_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task_file = db.query(TaskFile).filter(
        TaskFile.id == file_id,
        TaskFile.task_id == task_id
    ).first()
    if not task_file:
        raise HTTPException(status_code=404, detail="File not found")

    # Достаём path из URL чтобы удалить из Storage
    # URL формат: .../object/public/task-files/{path}
    try:
        path = task_file.file_url.split(f"/public/{BUCKET}/")[1]
        delete_from_supabase(path)
    except Exception:
        pass  # если файл уже удалён из storage — просто удаляем запись из БД

    db.delete(task_file)
    db.commit()
    return {"message": "File deleted"}
