from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.project import Project
from app.models.user import User
from app.routers.auth import get_current_user
from app.permissions import get_accessible_project_ids
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["tasks-overview"])


class TaskWithContext(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    assignee_id: Optional[UUID]
    assignee_name: Optional[str]
    deadline: Optional[datetime]
    project_id: UUID
    project_title: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/tasks", response_model=List[TaskWithContext])
def get_all_tasks(
    project_id: Optional[UUID] = None,
    assignee_id: Optional[UUID] = None,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Задачи по всем проектам, доступным текущему пользователю (mentor — свои проекты,
    student — проекты, где он участник, admin — все проекты), с готовым контекстом
    (название проекта, имя исполнителя) — чтобы фронту не приходилось джойнить самому."""
    project_ids = get_accessible_project_ids(current_user, db)
    if not project_ids:
        return []

    query = db.query(Task).filter(Task.project_id.in_(project_ids))

    if project_id:
        query = query.filter(Task.project_id == project_id)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    tasks = query.order_by(Task.created_at.desc()).all()

    result = []
    for t in tasks:
        result.append(TaskWithContext(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            assignee_id=t.assignee_id,
            assignee_name=t.assignee.name if t.assignee else None,
            deadline=t.deadline,
            project_id=t.project_id,
            project_title=t.project.title,
            created_at=t.created_at,
        ))
    return result
