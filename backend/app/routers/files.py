from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.task import Task, TaskFile
from app.models.project import Project
from app.models.user import User
from app.routers.auth import get_current_user
from app.permissions import get_project_or_404, require_project_access
from app.config import settings
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from pathlib import Path
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
        project = get_project_or_404(project_id, db)
        require_project_access(project, current_user, db)

        task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        file_content = await file.read()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
        stored_name = f"{uuid.uuid4()}.{file_ext}" if file_ext else str(uuid.uuid4())
        storage_path = f"{project_id}/{task_id}/{stored_name}"

        dest_path = Path(settings.UPLOAD_DIR) / storage_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.write_bytes(file_content)

        public_url = f"{settings.PUBLIC_BASE_URL}/files/{storage_path}"

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
    project = get_project_or_404(project_id, db)
    require_project_access(project, current_user, db)
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
    project = get_project_or_404(project_id, db)
    require_project_access(project, current_user, db)
    task_file = db.query(TaskFile).filter(TaskFile.id == file_id, TaskFile.task_id == task_id).first()
    if not task_file:
        raise HTTPException(status_code=404, detail="File not found")

    # best-effort: remove the file from disk too, DB row is the source of truth either way
    try:
        marker = f"/files/{project_id}/{task_id}/"
        if marker in task_file.file_url:
            rel_path = task_file.file_url.split("/files/", 1)[1]
            (Path(settings.UPLOAD_DIR) / rel_path).unlink(missing_ok=True)
    except Exception:
        traceback.print_exc()

    db.delete(task_file)
    db.commit()
    return {"message": "File deleted"}


@router.get("/files/project/{project_id}")
def get_project_files(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)
    require_project_access(project, current_user, db)
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    task_ids = [t.id for t in tasks]
    files = db.query(TaskFile).filter(TaskFile.task_id.in_(task_ids)).all()
    return files
