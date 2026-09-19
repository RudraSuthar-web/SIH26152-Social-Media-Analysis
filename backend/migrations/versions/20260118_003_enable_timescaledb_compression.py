"""Enable TimescaleDB Compression Policy Migration

Revision ID: 003_enable_compression
Revises: 002_hypertables_and_indexes
Create Date: 2026-01-18 02:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = '003_enable_compression'
down_revision: Union[str, None] = '002_hypertables_and_indexes'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
            ALTER TABLE canonical_events SET (
                timescaledb.compress,
                timescaledb.compress_segmentby = 'platform',
                timescaledb.compress_orderby = 'event_timestamp DESC'
            );
            PERFORM add_compression_policy('canonical_events', INTERVAL '7 days', if_not_exists => true);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'TimescaleDB compression policy notice: %', SQLERRM;
    END $$;
    """)

def downgrade() -> None:
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
            PERFORM remove_compression_policy('canonical_events', if_exists => true);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END $$;
    """)
