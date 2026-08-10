from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project, ProjectMember, ProjectRole
from app.models.user import User
from app.routers.auth import get_current_user
from app.permissions import get_project_or_404, require_project_access, require_project_owner
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/projects", tags=["roles"])


class MemberResponse(BaseModel):
    user_id: UUID
    role: ProjectRole
    joined_at: datetime
    name: str
    email: str

    class Config:
        from_attributes = True


@router.get("/{project_id}/members", response_model=list[MemberResponse])
def get_members(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)
    require_project_access(project, current_user, db)
    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()
    result = []
    for m in members:
        result.append(MemberResponse(
            user_id=m.user_id,
            role=m.role,
            joined_at=m.joined_at,
            name=m.user.name,
            email=m.user.email,
        ))
    return result


@router.get("/{project_id}/my-role")
def my_role(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)
    member = require_project_access(project, current_user, db)
    # admin может не быть участником проекта — тогда роль условная, для UI
    role = member.role if member else ProjectRole.owner
    return {"role": role}


@router.patch("/{project_id}/members/{user_id}/role")
def change_role(
    project_id: UUID,
    user_id: UUID,
    role: ProjectRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.role = role
    db.commit()
    return {"message": f"Role updated to {role}"}
