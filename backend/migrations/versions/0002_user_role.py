"""add global user role (admin/mentor/student)

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-30
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum('admin', 'mentor', 'student', name='userrole')
    user_role.create(op.get_bind(), checkfirst=True)

    op.add_column(
        'users',
        sa.Column('role', user_role, nullable=False, server_default='student'),
    )


def downgrade() -> None:
    op.drop_column('users', 'role')
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
