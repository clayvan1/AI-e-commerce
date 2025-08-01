"""Add payment_method to orders

Revision ID: 96be85a4e267
Revises: f3d36349e378
Create Date: 2025-07-27 07:28:40.175719

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '96be85a4e267'
down_revision = 'f3d36349e378'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('payment_method', sa.String(length=50), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_column('payment_method')

    # ### end Alembic commands ###
