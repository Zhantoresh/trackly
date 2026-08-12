from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as UploadFileParam
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project_file import ProjectFile
from app.models.user import User
from app.routers.auth import get_current_user
from app.permissions import get_project_or_404, require_project_access, require_project_owner
from app.config import settings
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from pathlib import Path
import uuid
import traceback

router = APIRouter(prefix="/api/projects", tags=["project-files"])


class ProjectFileResponse(BaseModel):
    id: UUID
    file_name: str
    file_url: str
    project_id: UUID
    uploaded_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/{project_id}/files", response_model=ProjectFileResponse)
async def upload_project_file(
    project_id: UUID,
    file: UploadFile = UploadFileParam(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Загрузка в общую папку проекта. Только mentor-владелец проекта или admin."""
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)

    try:
        file_content = await file.read()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
        stored_name = f"{uuid.uuid4()}.{file_ext}" if file_ext else str(uuid.uuid4())
        storage_path = f"projects/{project_id}/{stored_name}"

        dest_path = Path(settings.UPLOAD_DIR) / storage_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.write_bytes(file_content)

        public_url = f"{settings.PUBLIC_BASE_URL}/files/{storage_path}"

        project_file = ProjectFile(
            project_id=project_id,
            file_name=file.filename,
            file_url=public_url,
            uploaded_by=current_user.id,
        )
        db.add(project_file)
        db.commit()
        db.refresh(project_file)
        return project_file

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/files", response_model=list[ProjectFileResponse])
def list_project_files(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Скачивание/просмотр — mentor-владелец, назначенные студенты и admin."""
    project = get_project_or_404(project_id, db)
    require_project_access(project, current_user, db)
    return db.query(ProjectFile).filter(ProjectFile.project_id == project_id).order_by(ProjectFile.created_at.desc()).all()


@router.delete("/{project_id}/files/{file_id}")
def delete_project_file(
    project_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалять файлы может только mentor-владелец или admin."""
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)

    project_file = db.query(ProjectFile).filter(
        ProjectFile.id == file_id, ProjectFile.project_id == project_id
    ).first()
    if not project_file:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        marker = f"/files/projects/{project_id}/"
        if marker in project_file.file_url:
            rel_path = project_file.file_url.split("/files/", 1)[1]
            (Path(settings.UPLOAD_DIR) / rel_path).unlink(missing_ok=True)
    except Exception:
        traceback.print_exc()

    db.delete(project_file)
    db.commit()
    return {"message": "File deleted"}
