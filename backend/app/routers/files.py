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
import traceback

router = APIRouter(prefix="/api/projects", tags=["files"])

class FileResponse(BaseModel):
    id: UUID
    file_name: str
    file_url: str
    task_id: UUID
    uploaded_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/{project_id}/tasks/{task_id}/files")
async def upload_file(
    project_id: UUID,
    task_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        file_content = await file.read()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
        storage_path = f"{project_id}/{task_id}/{uuid.uuid4()}.{file_ext}"

        print(f"Uploading to Supabase: {storage_path}")
        print(f"SUPABASE_URL: {settings.SUPABASE_URL}")

        async with httpx.AsyncClient() as client:
            upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/files/{storage_path}"
            headers = {
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                "Content-Type": file.content_type or "application/octet-stream",
            }
            response = await client.post(upload_url, content=file_content, headers=headers)
            print(f"Supabase response: {response.status_code} {response.text}")
            if response.status_code not in (200, 201):
                raise HTTPException(status_code=500, detail=f"Storage error: {response.text}")

        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/files/{storage_path}"

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

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/tasks/{task_id}/files")
def get_files(
    project_id: UUID,
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    current_user: User = Depends(get_current_user)
):
    task_file = db.query(TaskFile).filter(TaskFile.id == file_id, TaskFile.task_id == task_id).first()
    if not task_file:
        raise HTTPException(status_code=404, detail="File not found")
    db.delete(task_file)
    db.commit()
    return {"message": "File deleted"}


@router.get("/files/project/{project_id}")
def get_project_files(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    task_ids = [t.id for t in tasks]
    files = db.query(TaskFile).filter(TaskFile.task_id.in_(task_ids)).all()
    return files