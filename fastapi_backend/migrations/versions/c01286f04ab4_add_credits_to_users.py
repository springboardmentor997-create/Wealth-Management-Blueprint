"""add_credits_to_users

Revision ID: c01286f04ab4
Revises: 
Create Date: 2026-01-06 07:57:18.466679

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c01286f04ab4'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add credits column with default value 0.0, non-nullable (since existing users need a value)
    op.add_column('users', sa.Column('credits', sa.Float(), server_default='0.0', nullable=False))
    
    # Add check constraint for non-negative credits (Works on PostgreSQL)
    # Note: For SQLite, Adding constraints to existing tables is limited.
    # We try to add it, but failure strictly shouldn't block the column addition if on SQLite.
    try:
        op.create_check_constraint('check_credits_non_negative', 'users', 'credits >= 0')
    except Exception:
        pass # Ignore constraint creation failure on SQLite if it's not supported


def downgrade() -> None:
    # Remove check constraint first
    try:
        op.drop_constraint('check_credits_non_negative', 'users', type_='check')
    except Exception:
        pass
        
    op.drop_column('users', 'credits')
