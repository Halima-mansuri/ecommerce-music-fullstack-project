"""like model deleted

Revision ID: 192ff348fd04
Revises: 87e74359f0e9
Create Date: 2025-06-14 17:31:55.759468
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '192ff348fd04'
down_revision = '87e74359f0e9'
branch_labels = None
depends_on = None


def upgrade():
    # First, drop foreign keys before dropping the index
    with op.batch_alter_table('likes', schema=None) as batch_op:
        batch_op.drop_constraint('likes_ibfk_1', type_='foreignkey')
        batch_op.drop_constraint('likes_ibfk_2', type_='foreignkey')
        batch_op.drop_index('unique_user_product_like')

    # Now safe to drop the table
    op.drop_table('likes')


def downgrade():
    op.create_table('likes',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('user_id', mysql.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('product_id', mysql.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('is_like', mysql.TINYINT(display_width=1), autoincrement=False, nullable=False),
        sa.Column('timestamp', mysql.DATETIME(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='likes_ibfk_1'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], name='likes_ibfk_2'),
        sa.PrimaryKeyConstraint('id'),
        mysql_collate='utf8mb4_0900_ai_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    with op.batch_alter_table('likes', schema=None) as batch_op:
        batch_op.create_index('unique_user_product_like', ['user_id', 'product_id'], unique=True)
