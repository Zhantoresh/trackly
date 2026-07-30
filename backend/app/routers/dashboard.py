from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models.project import Project, ProjectMember, ProjectRole
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.routers.auth import require_mentor
from app.permissions import is_admin
from pydantic import BaseModel

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class StudentBreakdown(BaseModel):
    user_id: UUID
    name: str
    email: str
    total_tasks: int
    done_tasks: int
    overdue_tasks: int


class ProjectOverview(BaseModel):
    project_id: UUID
    project_title: str
    total_tasks: int
    done_tasks: int
    completion_rate: float
    overdue_tasks: int
    students: List[StudentBreakdown]


@router.get("/overview", response_model=List[ProjectOverview])
def get_mentor_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_mentor),
):
    """Только mentor/admin. Mentor видит свои проекты, admin — все."""
    if is_admin(current_user):
        projects = db.query(Project).all()
    else:
        projects = db.query(Project).filter(Project.owner_id == current_user.id).all()

    now = datetime.utcnow()
    result = []

    for project in projects:
        tasks = db.query(Task).filter(Task.project_id == project.id).all()
        total = len(tasks)
        done = sum(1 for t in tasks if t.status == TaskStatus.done)
        overdue = sum(1 for t in tasks if t.deadline and t.deadline < now and t.status != TaskStatus.done)
        completion_rate = round((done / total * 100), 1) if total > 0 else 0

        student_members = db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.role == ProjectRole.member,
        ).all()

        students = []
        for m in student_members:
            student_tasks = [t for t in tasks if t.assignee_id == m.user_id]
            students.append(StudentBreakdown(
                user_id=m.user_id,
                name=m.user.name,
                email=m.user.email,
                total_tasks=len(student_tasks),
                done_tasks=sum(1 for t in student_tasks if t.status == TaskStatus.done),
                overdue_tasks=sum(1 for t in student_tasks if t.deadline and t.deadline < now and t.status != TaskStatus.done),
            ))

        result.append(ProjectOverview(
            project_id=project.id,
            project_title=project.title,
            total_tasks=total,
            done_tasks=done,
            completion_rate=completion_rate,
            overdue_tasks=overdue,
            students=students,
        ))

    return result
