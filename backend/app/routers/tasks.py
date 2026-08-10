from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.task import Task, TaskStatus, TaskPriority
from app.routers.auth import get_current_user
from app.models.user import User
from app.permissions import get_project_or_404, require_project_access, require_project_owner, is_admin
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/projects", tags=["tasks"])

# Поля задачи, которые может менять student — только статус своей задачи.
STUDENT_EDITABLE_FIELDS = {"status"}


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee_id: Optional[UUID] = None
    deadline: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[UUID] = None
    deadline: Optional[datetime] = None
    priority: Optional[TaskPriority] = None

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    assignee_id: Optional[UUID]
    deadline: Optional[datetime]
    project_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


def get_task_or_404(project_id: UUID, task_id: UUID, db: Session) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/{project_id}/tasks", response_model=list[TaskResponse])
def get_tasks(project_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    require_project_access(project, current_user, db)
    return db.query(Task).filter(Task.project_id == project_id).all()


@router.post("/{project_id}/tasks", response_model=TaskResponse)
def create_task(project_id: UUID, data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)  # только mentor-владелец проекта или admin ставит задачи

    task = Task(
        project_id=project_id,
        title=data.title,
        description=data.description,
        assignee_id=data.assignee_id,
        deadline=data.deadline,
        priority=data.priority,
        created_by=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{project_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(project_id: UUID, task_id: UUID, data: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    task = get_task_or_404(project_id, task_id, db)
    updates = data.model_dump(exclude_unset=True)

    if is_admin(current_user) or project.owner_id == current_user.id:
        # mentor-владелец и admin могут менять любое поле
        pass
    else:
        # студент: только своя задача и только статус
        require_project_access(project, current_user, db)
        if task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="You can only update tasks assigned to you")
        disallowed = set(updates) - STUDENT_EDITABLE_FIELDS
        if disallowed:
            raise HTTPException(status_code=403, detail="Students can only change task status")

    for field, value in updates.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{project_id}/tasks/{task_id}")
def delete_task(project_id: UUID, task_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    task = get_task_or_404(project_id, task_id, db)
    require_project_owner(project, current_user)  # только mentor-владелец или admin удаляет задачи
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
