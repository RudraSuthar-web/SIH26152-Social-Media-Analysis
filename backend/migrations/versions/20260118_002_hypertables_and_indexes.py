"""TimescaleDB Hypertables and Indexes Migration

Revision ID: 002_hypertables_and_indexes
Revises: 001_initial_schema
Create Date: 2026-01-18 01:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_hypertables_and_indexes'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Add node_id column to canonical_events
    op.add_column('canonical_events', sa.Column('node_id', sa.String(length=64), nullable=True))
    
    # 2. Performance B-Tree and GIN Indexes
    op.create_index('idx_events_timestamp_platform', 'canonical_events', ['event_timestamp', 'platform'])
    op.create_index('idx_events_node_id', 'canonical_events', ['node_id'])
    op.create_index('idx_sentiment_event_id', 'sentiment_results', ['event_id'])
    op.create_index('idx_trends_created_at', 'trend_windows', ['created_at'])
    op.create_index('idx_network_edges_source_target', 'network_edges', ['source_node_id', 'target_node_id'])

    # 3. Create composite primary key or hypertable migration safely
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
            -- TimescaleDB hypertable setup for tables with time columns
            PERFORM create_hypertable('canonical_events', 'event_timestamp', migrate_data => true, if_not_exists => true);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'TimescaleDB hypertable creation notice: %', SQLERRM;
    END $$;
    """)

def downgrade() -> None:
    op.drop_index('idx_network_edges_source_target', table_name='network_edges')
    op.drop_index('idx_trends_created_at', table_name='trend_windows')
    op.drop_index('idx_sentiment_event_id', table_name='sentiment_results')
    op.drop_index('idx_events_node_id', table_name='canonical_events')
    op.drop_index('idx_events_timestamp_platform', table_name='canonical_events')
    op.drop_column('canonical_events', 'node_id')
