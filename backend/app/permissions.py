from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.models.project import Project, ProjectMember
from app.models.user import User, UserRole


def is_admin(user: User) -> bool:
    return user.role == UserRole.admin


def get_project_or_404(project_id: UUID, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def get_project_member(project_id: UUID, user_id: UUID, db: Session) -> Optional[ProjectMember]:
    return db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
    ).first()


def require_project_access(project: Project, current_user: User, db: Session) -> Optional[ProjectMember]:
    """Admin всегда имеет доступ. Иначе пользователь должен быть участником проекта.
    Возвращает членство (или None для admin, не являющегося участником)."""
    member = get_project_member(project.id, current_user.id, db)
    if is_admin(current_user):
        return member
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this project")
    return member


def require_project_owner(project: Project, current_user: User) -> None:
    """Admin или ментор-владелец этого проекта."""
    if is_admin(current_user):
        return
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project mentor can do this")


def get_accessible_project_ids(current_user: User, db: Session) -> list:
    """Все ID проектов, которые пользователь может видеть: admin — все, иначе — где он участник."""
    if is_admin(current_user):
        return [p.id for p in db.query(Project.id).all()]
    rows = db.query(ProjectMember.project_id).filter(ProjectMember.user_id == current_user.id).all()
    return [r[0] for r in rows]
