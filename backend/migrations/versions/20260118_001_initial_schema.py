"""Initial database schema migration

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-01-18 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'canonical_events',
        sa.Column('event_id', sa.String(length=64), nullable=False),
        sa.Column('platform', sa.String(length=32), nullable=False),
        sa.Column('source_event_id', sa.String(length=128), nullable=False),
        sa.Column('source_user_id', sa.String(length=128), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=16), nullable=True),
        sa.Column('detected_language_confidence', sa.Float(), nullable=True),
        sa.Column('translated_text', sa.Text(), nullable=True),
        sa.Column('event_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ingested_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('conversation_id', sa.String(length=128), nullable=True),
        sa.Column('parent_event_id', sa.String(length=128), nullable=True),
        sa.Column('mentions', sa.JSON(), nullable=True),
        sa.Column('hashtags', sa.JSON(), nullable=True),
        sa.Column('urls', sa.JSON(), nullable=True),
        sa.Column('engagement', sa.JSON(), nullable=True),
        sa.Column('sentiment', sa.String(length=16), nullable=True),
        sa.Column('sentiment_confidence', sa.Float(), nullable=True),
        sa.Column('data_source', sa.String(length=16), nullable=False),
        sa.PrimaryKeyConstraint('event_id')
    )

    op.create_table(
        'sentiment_results',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.String(length=64), nullable=False),
        sa.Column('sentiment', sa.String(length=16), nullable=False),
        sa.Column('emotions', sa.JSON(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('sarcasm_uncertain', sa.Boolean(), nullable=True),
        sa.Column('model_name', sa.String(length=64), nullable=False),
        sa.Column('model_version', sa.String(length=32), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'trend_windows',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('topic_id', sa.String(length=64), nullable=False),
        sa.Column('topic_label', sa.String(length=256), nullable=False),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('hashtags', sa.JSON(), nullable=True),
        sa.Column('volume', sa.Integer(), nullable=False),
        sa.Column('unique_users', sa.Integer(), nullable=False),
        sa.Column('growth_rate', sa.Float(), nullable=True),
        sa.Column('velocity', sa.Float(), nullable=True),
        sa.Column('momentum', sa.Float(), nullable=True),
        sa.Column('trend_score', sa.Float(), nullable=False),
        sa.Column('platforms', sa.JSON(), nullable=True),
        sa.Column('languages', sa.JSON(), nullable=True),
        sa.Column('coordinated_pattern', sa.Boolean(), nullable=True),
        sa.Column('components', sa.JSON(), nullable=True),
        sa.Column('sparkline', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'network_nodes',
        sa.Column('node_id', sa.String(length=64), nullable=False),
        sa.Column('platform', sa.String(length=32), nullable=False),
        sa.Column('source_user_id', sa.String(length=128), nullable=False),
        sa.Column('avatar_color', sa.String(length=16), nullable=True),
        sa.Column('pagerank', sa.Float(), nullable=True),
        sa.Column('betweenness', sa.Float(), nullable=True),
        sa.Column('degree', sa.Integer(), nullable=True),
        sa.Column('community_id', sa.String(length=64), nullable=False),
        sa.Column('post_count', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('node_id')
    )

    op.create_table(
        'network_edges',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('source_node_id', sa.String(length=64), nullable=False),
        sa.Column('target_node_id', sa.String(length=64), nullable=False),
        sa.Column('edge_type', sa.String(length=32), nullable=False),
        sa.Column('provenance', sa.String(length=16), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('event_id', sa.String(length=64), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'community_assignments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('community_id', sa.String(length=64), nullable=False),
        sa.Column('node_count', sa.Integer(), nullable=True),
        sa.Column('modularity', sa.Float(), nullable=True),
        sa.Column('dominant_topics', sa.JSON(), nullable=True),
        sa.Column('color', sa.String(length=16), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'demographic_aggregates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('window', sa.String(length=32), nullable=True),
        sa.Column('topic', sa.String(length=256), nullable=False),
        sa.Column('sample_size', sa.Integer(), nullable=True),
        sa.Column('confidence_label', sa.String(length=16), nullable=False),
        sa.Column('age_brackets', sa.JSON(), nullable=True),
        sa.Column('age_confidence_intervals', sa.JSON(), nullable=True),
        sa.Column('languages', sa.JSON(), nullable=True),
        sa.Column('geography', sa.JSON(), nullable=True),
        sa.Column('interests', sa.JSON(), nullable=True),
        sa.Column('methodology_notes', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'adapter_health',
        sa.Column('platform', sa.String(length=32), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=True),
        sa.Column('healthy', sa.Boolean(), nullable=True),
        sa.Column('status', sa.String(length=16), nullable=True),
        sa.Column('lag_seconds', sa.Float(), nullable=True),
        sa.Column('rate_limit_usage_pct', sa.Integer(), nullable=True),
        sa.Column('events_ingested_24h', sa.Integer(), nullable=True),
        sa.Column('last_success_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('error_count', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('platform')
    )

    op.create_table(
        'model_health',
        sa.Column('model_name', sa.String(length=64), nullable=False),
        sa.Column('version', sa.String(length=32), nullable=False),
        sa.Column('p95_latency_ms', sa.Float(), nullable=True),
        sa.Column('p99_latency_ms', sa.Float(), nullable=True),
        sa.Column('error_rate_pct', sa.Float(), nullable=True),
        sa.Column('total_inferences', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=16), nullable=True),
        sa.PrimaryKeyConstraint('model_name')
    )

    op.create_table(
        'dead_letter_events',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('platform', sa.String(length=32), nullable=False),
        sa.Column('error_code', sa.String(length=64), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=False),
        sa.Column('received_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('retry_count', sa.Integer(), nullable=True),
        sa.Column('raw_payload_snippet', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('dead_letter_events')
    op.drop_table('model_health')
    op.drop_table('adapter_health')
    op.drop_table('demographic_aggregates')
    op.drop_table('community_assignments')
    op.drop_table('network_edges')
    op.drop_table('network_nodes')
    op.drop_table('trend_windows')
    op.drop_table('sentiment_results')
    op.drop_table('canonical_events')
