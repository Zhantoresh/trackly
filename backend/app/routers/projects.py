from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project, ProjectMember, ProjectRole
from app.models.user import User, UserRole
from app.routers.auth import get_current_user, require_mentor
from app.permissions import get_project_or_404, require_project_access, require_project_owner, is_admin
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    owner_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class MemberAdd(BaseModel):
    user_id: UUID


@router.post("", response_model=ProjectResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(require_mentor)):
    """Только mentor (или admin) может создавать проекты."""
    project = Project(title=data.title, description=data.description, owner_id=current_user.id)
    db.add(project)
    db.flush()
    member = ProjectMember(project_id=project.id, user_id=current_user.id, role=ProjectRole.owner)
    db.add(member)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectResponse])
def get_my_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if is_admin(current_user):
        return db.query(Project).order_by(Project.created_at.desc()).all()
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    project_ids = [m.project_id for m in memberships]
    return db.query(Project).filter(Project.id.in_(project_ids)).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    require_project_access(project, current_user, db)
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: UUID, data: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(project_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


@router.post("/{project_id}/members")
def add_member(project_id: UUID, data: MemberAdd, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != UserRole.student:
        raise HTTPException(status_code=400, detail="Only students can be assigned to a project")
    existing = db.query(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.user_id == data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
    member = ProjectMember(project_id=project_id, user_id=data.user_id, role=ProjectRole.member)
    db.add(member)
    db.commit()
    return {"message": "Member added"}


@router.delete("/{project_id}/members/{user_id}")
def remove_member(project_id: UUID, user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_project_or_404(project_id, db)
    require_project_owner(project, current_user)
    if user_id == project.owner_id:
        raise HTTPException(status_code=400, detail="Cannot remove the project mentor")
    member = db.query(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member removed"}
