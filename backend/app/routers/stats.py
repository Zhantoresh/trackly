from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project, ProjectMember
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.user import User
from app.routers.auth import get_current_user
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/projects", tags=["stats"])


def require_member(project_id: UUID, current_user: User, db: Session):
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this project")


@router.get("/{project_id}/stats")
def get_project_stats(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    require_member(project_id, current_user, db)

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    total = len(tasks)

    by_status = {s.value: 0 for s in TaskStatus}
    for t in tasks:
        by_status[t.status.value] += 1

    by_priority = {p.value: 0 for p in TaskPriority}
    for t in tasks:
        by_priority[t.priority.value] += 1

    overdue = sum(
        1 for t in tasks
        if t.deadline and t.deadline < datetime.utcnow() and t.status != TaskStatus.done
    )

    members_count = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).count()

    completion_rate = round((by_status["done"] / total * 100), 1) if total > 0 else 0

    return {
        "project_id": project_id,
        "project_title": project.title,
        "total_tasks": total,
        "by_status": by_status,
        "by_priority": by_priority,
        "overdue_tasks": overdue,
        "members_count": members_count,
        "completion_rate": completion_rate,
    }