# BACKEND_IMPLEMENTATION.md — PS 26152 Backend Implementation Guide
## SIH 2026 (NTRO) — Production-Grade Social Media Analytics Backend

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│  X API   │    │Telegram  │    │Instagram │    │ Facebook │    │   ...        │
│ (v2)     │    │Bot/MTProto│   │Graph API │    │ Graph API│    │              │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └──────┬───────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ADAPTER LAYER (per platform)                         │
│  • Authentication & rate limiting                                           │
│  • Pagination & cursor management                                           │
│  • Error handling: retry/backoff/jitter, circuit breaker                    │
│  • Output: RawPlatformEvent (platform-specific schema)                     │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NORMALIZATION & VALIDATION                          │
│  • RawPlatformEvent → CanonicalEvent (Pydantic v2)                         │
│  • Validation: timestamps, IDs, text length, engagement ranges             │
│  • Language detection (fasttext)                                            │
│  • Deduplication: Redis SET + DB unique constraint (platform, source_id)  │
│  • Quarantine: Invalid events → dead_letter table + metrics                │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EVENT BUS (Redis Streams)                          │
│  Stream: events:raw                                                         │
│  Consumer Groups: sentiment, trends, network, demographics                  │
│  • At-least-once delivery                                                   │
│  • Consumer lag metrics                                                     │
│  • Replay capability (by timestamp or ID)                                   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ SENTIMENT     │         │ TRENDS        │         │ NETWORK       │
│ WORKER        │         │ WORKER        │         │ WORKER        │
│               │         │               │         │               │
│ • Batch N     │         │ • Time window │         │ • Edge extract│
│   events      │         │   (5m/1h/24h) │         │   from events │
│ • Inference   │         │ • N-gram freq │         │ • Graph build │
│ • Store:      │         │ • Embedding   │         │ • Centrality  │
│   sentiment   │         │   clustering  │         │ • Communities │
│   results     │         │ • Growth calc │         │ • Propagation │
└───────┬───────┘         └───────┬───────┘         └───────┬───────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ANALYTICS STORE (PostgreSQL + TimescaleDB)           │
│  Tables:                                                                    │
│  • canonical_events (hypertable on event_timestamp)                         │
│  • sentiment_results (hypertable on processed_at)                          │
│  • trend_windows (hypertable on window_start)                              │
│  • network_nodes, network_edges (provenance: observed|inferred)            │
│  • community_assignments (hypertable on window_start)                      │
│  • demographic_aggregates (hypertable on window_start)                     │
│  • dead_letter_events                                                       │
│  • adapter_health, model_health, ingestion_metrics                          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API / QUERY LAYER (FastAPI)                        │
│  • RESTful endpoints with pagination, filtering, time ranges               │
│  • JWT auth + RBAC                                                          │
│  • Rate limiting (per-IP, per-user)                                         │
│  • Request ID propagation                                                   │
│  • Structured error responses                                               │
│  • OpenAPI 3.1 + Scalar/Redoc UI                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. TECHNOLOGY STACK

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Runtime** | Python | 3.11+ | Async-native, performance, typing |
| **API Framework** | FastAPI | 0.110+ | Async, OpenAPI, Pydantic, DI |
| **Database** | PostgreSQL + TimescaleDB | 16 / 2.14+ | Time-series hypertables, PostGIS, ACID |
| **ORM** | SQLAlchemy 2.0 (async) + asyncpg | 2.0+ | Type-safe, async, Alembic migrations |
| **Event Bus** | Redis Streams | 7.2+ | Consumer groups, persistence, TTL |
| **Cache** | Redis (valkey) | 7.2+ | Hot data, rate limiting, sessions |
| **ML Inference** | ONNX Runtime | 1.18+ | GPU/CPU, no Python GIL, fast |
| **NLP Models** | Hugging Face Transformers | 4.40+ | State-of-the-art multilingual |
| **Language Detection** | fasttext | 0.9.2 | 176 languages, fast, offline |
| **Graph Analysis** | python-igraph + networkx | 0.11+ / 3.2+ | Leiden, PageRank, centrality |
| **Scheduling** | APScheduler | 3.10+ | Cron-like triggers for workers |
| **Observability** | structlog + prometheus-client | 24+ / 0.19+ | JSON logs, Prometheus metrics |
| **Auth** | python-jose + passlib | 3.3+ / 1.7+ | JWT RS256, bcrypt |
| **Validation** | Pydantic v2 | 2.7+ | Fast, strict, OpenAPI generation |
| **Testing** | pytest + pytest-asyncio + hypothesis | 8+ / 0.23+ / 6+ | Unit, integration, property-based |
| **Load Testing** | Locust | 2.20+ | Distributed, scriptable |
| **CI/CD** | GitHub Actions | — | Native, matrix builds |
| **X Data Provider** | TwitterAPI.io (primary) / Official Basic (fallback) | — | **Official Free tier discontinued (2024)**; TwitterAPI.io $1 credit = ~6K reads; Official Basic = $100/mo for 10K reads |

---

## 3. PROJECT STRUCTURE

```
backend/
├── pyproject.toml              # Project config, dependencies, tool config
├── requirements.txt            # Pinned production deps
├── requirements-dev.txt        # Dev deps (test, lint, type)
├── alembic.ini                 # Migration config
├── config.yaml                 # Non-secret configuration
├── .env.example                # Secrets template
├── docker-compose.yml          # Local dev stack
├── Dockerfile                  # Production image
├── Makefile                    # Common commands
├── README.md                   # Quick start
│
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app factory
│   ├── config.py               # Pydantic Settings (yaml + env)
│   ├── database.py             # Async engine, session, lifespan
│   ├── middleware.py           # Request ID, logging, timing, errors
│   ├── deps.py                 # Dependencies: DB, Redis, auth, rate limit
│   ├── exceptions.py           # Custom exceptions + handlers
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py             # Declarative base, mixins
│   │   ├── events.py           # CanonicalEvent, SentimentResult
│   │   ├── trends.py           # TrendWindow, TopicCluster
│   │   ├── network.py          # NetworkNode, NetworkEdge, Community
│   │   ├── demographics.py     # DemographicAggregate
│   │   ├── health.py           # AdapterHealth, ModelHealth, DeadLetter
│   │   └── ingestion.py        # IngestionMetric, ProcessingCheckpoint
│   │
│   ├── schemas/                # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── common.py           # ApiResponse, ApiMeta, Pagination
│   │   ├── events.py           # EventQuery, EventResponse
│   │   ├── sentiment.py        # SentimentQuery, SentimentResponse
│   │   ├── trends.py           # TrendQuery, TrendResponse, FormulaBreakdown
│   │   ├── network.py          # NetworkQuery, GraphResponse, KOLResponse
│   │   ├── demographics.py     # DemographicQuery, DemographicResponse
│   │   ├── health.py           # AdapterHealthResponse, ModelHealthResponse
│   │   └── admin.py            # BackfillRequest, AdapterConfig
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── router.py           # Main APIRouter with all sub-routers
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── events.py
│   │   │   ├── sentiment.py
│   │   │   ├── trends.py
│   │   │   ├── network.py
│   │   │   ├── demographics.py
│   │   │   ├── health.py
│   │   │   └── admin.py
│   │   └── websocket.py        # WebSocket endpoints
│   │
│   ├── adapters/               # Platform adapters
│   │   ├── __init__.py
│   │   ├── base.py             # Abstract base adapter
│   │   ├── x_adapter.py        # X API v2
│   │   ├── telegram_adapter.py # Telegram Bot API + MTProto
│   │   ├── instagram_adapter.py# Instagram Graph API (stub)
│   │   ├── facebook_adapter.py # Facebook Graph API (stub)
│   │   ├── reddit_adapter.py   # Reddit API (stub)
│   │   ├── youtube_adapter.py  # YouTube Data API (stub)
│   │   └── registry.py         # Adapter discovery, health, lifecycle
│   │
│   ├── ingestion/              # Ingestion pipeline
│   │   ├── __init__.py
│   │   ├── normalizer.py       # Raw → CanonicalEvent
│   │   ├── validator.py        # Schema + business rules
│   │   ├── deduplicator.py     # Idempotency via (platform, source_event_id)
│   │   ├── pipeline.py         # Orchestrates: fetch → validate → normalize → dedupe → queue
│   │   ├── dead_letter.py      # Quarantine invalid events
│   │   └── scheduler.py        # Cron triggers for ingestion
│   │
│   ├── analytics/              # Analytics engines
│   │   ├── __init__.py
│   │   ├── sentiment/
│   │   │   ├── __init__.py
│   │   │   ├── engine.py       # Inference pipeline (ONNX)
│   │   │   ├── models.py       # Model loading, versioning, ONNX export
│   │   │   ├── preprocessing.py# Text cleaning, language handling
│   │   │   ├── evaluation.py   # Eval datasets, metrics, drift detection
│   │   │   └── worker.py       # Consumer: events:raw → sentiment_results
│   │   ├── demographics/
│   │   │   ├── __init__.py
│   │   │   ├── profiler.py     # Aggregate inference
│   │   │   ├── signals.py      # Feature extraction (bio, behavior, language)
│   │   │   ├── privacy.py      # Anonymization, aggregation guards
│   │   │   └── worker.py       # Periodic aggregate computation
│   │   ├── trends/
│   │   │   ├── __init__.py
│   │   │   ├── detector.py     # Main trend detection loop
│   │   │   ├── clustering.py   # Embedding-based topic clustering
│   │   │   ├── metrics.py      # Volume, growth, velocity, momentum, trend_score
│   │   │   ├── deduplication.py# Hashtag/keyword normalization
│   │   │   └── worker.py       # Windowed aggregation → trend_windows
│   │   └── network/
│   │       ├── __init__.py
│   │       ├── graph_builder.py# Nodes + edges from canonical events
│   │       ├── centrality.py   # PageRank, betweenness, degree, eigenvector
│   │       ├── communities.py  # Leiden/Louvain + temporal tracking
│   │       ├── propagation.py  # Cascade reconstruction (observed vs inferred)
│   │       ├── influence.py    # KOL identification with provenance
│   │       └── worker.py       # Graph updates → centrality → communities
│   │
│   ├── workers/                # Background worker entrypoints
│   │   ├── __init__.py
│   │   ├── base_worker.py      # Base class: health, metrics, graceful shutdown
│   │   ├── sentiment_worker.py
│   │   ├── trends_worker.py
│   │   ├── network_worker.py
│   │   ├── demographics_worker.py
│   │   └── scheduler.py        # APScheduler for periodic tasks
│   │
│   ├── ml/                     # ML utilities
│   │   ├── __init__.py
│   │   ├── onnx_utils.py       # ONNX export, optimization, quantization
│   │   ├── model_registry.py   # Model versioning, artifact storage
│   │   └── evaluation.py       # Shared evaluation utilities
│   │
│   ├── observability/          # Logging, metrics, tracing
│   │   ├── __init__.py
│   │   ├── logging.py          # structlog config, JSON formatter
│   │   ├── metrics.py          # Prometheus metrics definitions
│   │   ├── health.py           # /health, /ready endpoints
│   │   └── tracing.py          # OpenTelemetry (optional)
│   │
│   └── security/               # Security utilities
│       ├── __init__.py
│       ├── auth.py             # JWT, RBAC, password hashing
│       ├── rate_limit.py       # Redis-backed sliding window
│       ├── validation.py       # Input sanitization, XSS/SSRF protection
│       └── audit.py            # Audit logging
│
├── migrations/                 # Alembic migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│
├── scripts/                    # Operational scripts
│   ├── __init__.py
│   ├── backfill.py             # Historical data backfill
│   ├── replay.py               # Replay from dead-letter or raw archive
│   ├── eval_models.py          # Model evaluation against labeled sets
│   ├── migrate.py              # Alembic wrapper
│   ├── seed.py                 # Dev seed data (labeled synthetic)
│   └── benchmark.py            # Load/stress test runner
│
└── tests/
    ├── __init__.py
    ├── conftest.py             # Pytest fixtures (DB, Redis, mock adapters)
    ├── unit/
    │   ├── test_normalizer.py
    │   ├── test_validator.py
    │   ├── test_deduplicator.py
    │   ├── test_sentiment_preprocessing.py
    │   ├── test_demographic_signals.py
    │   ├── test_trend_metrics.py
    │   └── test_graph_builder.py
    ├── integration/
    │   ├── test_x_adapter.py
    │   ├── test_telegram_adapter.py
    │   ├── test_ingestion_pipeline.py
    │   ├── test_sentiment_worker.py
    │   ├── test_trends_worker.py
    │   └── test_network_worker.py
    ├── contract/
    │   ├── test_adapter_schemas.py
    │   └── test_api_openapi.py
    ├── e2e/
    │   ├── test_ingest_to_api.py
    │   └── test_graceful_degradation.py
    ├── load/
    │   ├── locustfile.py
    │   └── scenarios.py
    ├── chaos/
    │   ├── test_db_failure.py
    │   ├── test_adapter_failure.py
    │   ├── test_model_failure.py
    │   └── test_network_partition.py
    └── fixtures/
        ├── x_events.json
        ├── telegram_events.json
        ├── synthetic_mixed_lang.json
        └── adversarial/
            ├── huge_text.json
            ├── malformed_utf8.json
            ├── sql_injection.json
            └── prompt_injection.json
```

---

## 4. DATABASE SCHEMA (TimescaleDB Hypertables)

### 4.1 Core Tables

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Canonical events (hypertable)
CREATE TABLE canonical_events (
    event_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform           VARCHAR(32) NOT NULL,
    source_event_id    VARCHAR(128) NOT NULL,
    source_user_id     VARCHAR(128) NOT NULL,
    text               TEXT NOT NULL,
    language           VARCHAR(16),
    detected_language_confidence REAL,
    translated_text    TEXT,
    event_timestamp    TIMESTAMPTZ NOT NULL,
    ingested_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at       TIMESTAMPTZ,
    conversation_id    VARCHAR(128),
    parent_event_id    VARCHAR(128),
    reply_to_user_id   VARCHAR(128),
    forwarded_from     VARCHAR(128),
    mentions           JSONB DEFAULT '[]',
    hashtags           JSONB DEFAULT '[]',
    urls               JSONB DEFAULT '[]',
    engagement         JSONB DEFAULT '{}',
    metadata           JSONB DEFAULT '{}',
    schema_version     SMALLINT NOT NULL DEFAULT 1,
    data_source        VARCHAR(16) NOT NULL DEFAULT 'live',
    UNIQUE (platform, source_event_id)
);

SELECT create_hypertable('canonical_events', 'event_timestamp',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE);

CREATE INDEX idx_canonical_platform_time ON canonical_events (platform, event_timestamp DESC);
CREATE INDEX idx_canonical_conversation ON canonical_events (conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX idx_canonical_user_time ON canonical_events (source_user_id, event_timestamp DESC);
CREATE INDEX idx_canonical_language ON canonical_events (language);
CREATE INDEX idx_canonical_data_source ON canonical_events (data_source);

-- Sentiment results (hypertable)
CREATE TABLE sentiment_results (
    id                 BIGSERIAL PRIMARY KEY,
    event_id           UUID NOT NULL REFERENCES canonical_events(event_id),
    sentiment          VARCHAR(16) NOT NULL,
    emotions           JSONB NOT NULL DEFAULT '{}',
    confidence         REAL NOT NULL,
    sarcasm_uncertain  BOOLEAN DEFAULT FALSE,
    model_name         VARCHAR(64) NOT NULL,
    model_version      VARCHAR(32) NOT NULL,
    preprocessing_version VARCHAR(32) NOT NULL,
    processed_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT create_hypertable('sentiment_results', 'processed_at',
    chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

CREATE INDEX idx_sentiment_event ON sentiment_results (event_id);
CREATE INDEX idx_sentiment_model_version ON sentiment_results (model_name, model_version);

-- Trend windows (hypertable)
CREATE TABLE trend_windows (
    id                 BIGSERIAL PRIMARY KEY,
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    topic_id           VARCHAR(64) NOT NULL,
    topic_label        VARCHAR(256) NOT NULL,
    keywords           JSONB NOT NULL DEFAULT '[]',
    hashtags           JSONB NOT NULL DEFAULT '[]',
    volume             BIGINT NOT NULL DEFAULT 0,
    unique_users       BIGINT NOT NULL DEFAULT 0,
    growth_rate        REAL,
    velocity           REAL,
    momentum           REAL,
    trend_score        REAL NOT NULL,
    platforms          JSONB NOT NULL DEFAULT '[]',
    languages          JSONB NOT NULL DEFAULT '[]',
    coordinated_pattern BOOLEAN DEFAULT FALSE,
    components         JSONB NOT NULL DEFAULT '{}',
    sparkline          JSONB DEFAULT '[]',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT create_hypertable('trend_windows', 'window_start',
    chunk_time_interval => INTERVAL '1 hour', if_not_exists => TRUE);

CREATE UNIQUE INDEX idx_trend_window_topic ON trend_windows (window_start, topic_id);
CREATE INDEX idx_trend_score ON trend_windows (window_start DESC, trend_score DESC);

-- Network nodes (pseudonymized)
CREATE TABLE network_nodes (
    node_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform           VARCHAR(32) NOT NULL,
    source_user_id     VARCHAR(128) NOT NULL,
    first_seen         TIMESTAMPTZ NOT NULL,
    last_seen          TIMESTAMPTZ NOT NULL,
    post_count         BIGINT DEFAULT 0,
    metadata           JSONB DEFAULT '{}',
    UNIQUE (platform, source_user_id)
);

CREATE INDEX idx_network_nodes_platform ON network_nodes (platform);

-- Network edges (with provenance)
CREATE TABLE network_edges (
    id                 BIGSERIAL PRIMARY KEY,
    source_node_id     UUID NOT NULL REFERENCES network_nodes(node_id),
    target_node_id     UUID NOT NULL REFERENCES network_nodes(node_id),
    edge_type          VARCHAR(32) NOT NULL,
    provenance         VARCHAR(16) NOT NULL DEFAULT 'observed',
    weight             REAL NOT NULL DEFAULT 1.0,
    event_id           UUID REFERENCES canonical_events(event_id),
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_edges_source_window ON network_edges (source_node_id, window_start);
CREATE INDEX idx_edges_target_window ON network_edges (target_node_id, window_start);
CREATE INDEX idx_edges_type_provenance ON network_edges (edge_type, provenance);

-- Community assignments (hypertable)
CREATE TABLE community_assignments (
    id                 BIGSERIAL PRIMARY KEY,
    node_id            UUID NOT NULL REFERENCES network_nodes(node_id),
    community_id       VARCHAR(64) NOT NULL,
    algorithm          VARCHAR(32) NOT NULL,
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    topic_distribution JSONB DEFAULT '{}',
    modularity         REAL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_window ON community_assignments (window_start, community_id);

-- Demographic aggregates (hypertable)
CREATE TABLE demographic_aggregates (
    id                 BIGSERIAL PRIMARY KEY,
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    topic_id           VARCHAR(64),
    age_brackets       JSONB NOT NULL DEFAULT '{}',
    age_confidence_intervals JSONB DEFAULT '{}',
    languages          JSONB NOT NULL DEFAULT '{}',
    geography          JSONB NOT NULL DEFAULT '{}',
    interests          JSONB NOT NULL DEFAULT '{}',
    confidence_label   VARCHAR(16) NOT NULL,
    sample_size        BIGINT NOT NULL,
    methodology_notes  JSONB DEFAULT '[]',
    method_version     VARCHAR(32) NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT create_hypertable('demographic_aggregates', 'window_start',
    chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

CREATE INDEX idx_demo_window_topic ON demographic_aggregates (window_start, topic_id);

-- Dead letter queue
CREATE TABLE dead_letter_events (
    id                 BIGSERIAL PRIMARY KEY,
    platform           VARCHAR(32),
    raw_payload        JSONB NOT NULL,
    error_code         VARCHAR(64) NOT NULL,
    error_message      TEXT NOT NULL,
    received_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    retry_count        SMALLINT DEFAULT 0,
    resolved_at        TIMESTAMPTZ,
    resolution         VARCHAR(32)
);

CREATE INDEX idx_dead_letter_platform_time ON dead_letter_events (platform, received_at DESC);

-- Adapter health
CREATE TABLE adapter_health (
    platform           VARCHAR(32) PRIMARY KEY,
    last_success_at    TIMESTAMPTZ,
    last_failure_at    TIMESTAMPTZ,
    consecutive_failures SMALLINT DEFAULT 0,
    last_error         TEXT,
    events_ingested_total BIGINT DEFAULT 0,
    events_failed_total   BIGINT DEFAULT 0,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Model health
CREATE TABLE model_health (
    model_name         VARCHAR(64) PRIMARY KEY,
    model_version      VARCHAR(32) NOT NULL,
    last_inference_at  TIMESTAMPTZ,
    avg_latency_ms     REAL,
    p95_latency_ms     REAL,
    p99_latency_ms     REAL,
    error_rate         REAL,
    total_inferences   BIGINT DEFAULT 0,
    total_errors       BIGINT DEFAULT 0,
    drift_detected     BOOLEAN DEFAULT FALSE,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ingestion metrics
CREATE TABLE ingestion_metrics (
    id                 BIGSERIAL PRIMARY KEY,
    platform           VARCHAR(32) NOT NULL,
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    events_fetched     BIGINT DEFAULT 0,
    events_validated   BIGINT DEFAULT 0,
    events_deduplicated BIGINT DEFAULT 0,
    events_queued      BIGINT DEFAULT 0,
    events_failed      BIGINT DEFAULT 0,
    avg_latency_ms     REAL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT create_hypertable('ingestion_metrics', 'window_start',
    chunk_time_interval => INTERVAL '1 hour', if_not_exists => TRUE);
```

---

## 5. API ENDPOINTS (OpenAPI 3.1)

### 5.1 Response Envelope (All Endpoints)

```python
# schemas/common.py
class ApiMeta(BaseModel):
    request_id: str
    timestamp: datetime
    data_source: Literal["live", "synthetic", "replay", "degraded", "offline"]
    window: Optional[TimeWindow] = None
    model_version: Optional[str] = None
    processing_version: Optional[str] = None

class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: ApiMeta
    error: Optional[ErrorDetail] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None
```

### 5.2 Endpoint Catalog

| Endpoint | Method | Description | Query Params | Response |
|----------|--------|-------------|--------------|----------|
| `/api/v1/events` | GET | Query canonical events | `platform`, `since`, `until`, `conversation_id`, `language`, `limit`, `offset` | `ApiResponse[List[CanonicalEvent]]` |
| `/api/v1/events/{event_id}` | GET | Single event by ID | — | `ApiResponse[CanonicalEvent]` |
| `/api/v1/sentiment/timeline` | GET | Sentiment distribution over time | `since`, `until`, `interval`, `platform`, `topic_id` | `ApiResponse[List[SentimentTimePoint]]` |
| `/api/v1/sentiment/emotions` | GET | Aggregate emotion breakdown | `since`, `until`, `platform`, `topic_id` | `ApiResponse[EmotionBreakdown]` |
| `/api/v1/sentiment/events` | GET | Per-event sentiment (paginated) | `event_ids[]`, `since`, `until`, `platform`, `limit`, `offset` | `ApiResponse[List[EventWithSentiment]]` |
| `/api/v1/sentiment/confidence-histogram` | GET | Confidence calibration histogram | `since`, `until`, `platform` | `ApiResponse[ConfidenceHistogram]` |
| `/api/v1/sentiment/sarcasm-scatter` | GET | Sarcasm uncertainty scatter | `since`, `until`, `platform` | `ApiResponse[SarcasmScatterData]` |
| `/api/v1/sentiment/language-heatmap` | GET | Language × sentiment matrix | `since`, `until`, `platform` | `ApiResponse[LanguageHeatmap]` |
| `/api/v1/demographics` | GET | Aggregate demographics | `since`, `until`, `topic_id`, `platform` | `ApiResponse[DemographicAggregate]` |
| `/api/v1/demographics/geography` | GET | Geography for choropleth | `since`, `until`, `topic_id` | `ApiResponse[GeographyData]` |
| `/api/v1/trends` | GET | Trending topics | `since`, `until`, `limit`, `min_volume`, `sort` | `ApiResponse[List[TrendTopic]]` |
| `/api/v1/trends/{topic_id}` | GET | Single topic detail | — | `ApiResponse[TrendTopic]` |
| `/api/v1/trends/{topic_id}/formula` | GET | Computed formula breakdown | — | `ApiResponse[TrendFormulaBreakdown]` |
| `/api/v1/trends/lifecycle` | GET | Topic lifecycle horizon | `since`, `until`, `topic_ids[]` | `ApiResponse[TrendLifecycle]` |
| `/api/v1/trends/coordination-scatter` | GET | Coordinated vs organic | `since`, `until` | `ApiResponse[CoordinationScatter]` |
| `/api/v1/network/graph` | GET | Subgraph for visualization | `since`, `until`, `node_ids[]`, `edge_types[]`, `min_weight`, `limit` | `ApiResponse[GraphData]` |
| `/api/v1/network/kol` | GET | Top KOLs | `since`, `until`, `metric`, `limit` | `ApiResponse[List[KOLEntry]]` |
| `/api/v1/network/communities` | GET | Communities | `since`, `until`, `algorithm`, `min_size` | `ApiResponse[List[CommunityCluster]]` |
| `/api/v1/network/communities/treemap` | GET | Community treemap data | `since`, `until` | `ApiResponse[CommunityTreemap]` |
| `/api/v1/network/centrality-distribution` | GET | Centrality histograms | `since`, `until` | `ApiResponse[CentralityDistribution]` |
| `/api/v1/network/edge-sankey` | GET | Edge type flow | `since`, `until` | `ApiResponse[EdgeSankeyData]` |
| `/api/v1/network/propagation` | GET | Cascade for topic/event | `topic_id` or `event_id`, `depth` | `ApiResponse[CascadeNode]` |
| `/api/v1/network/propagation-speed` | GET | Propagation latency histogram | `since`, `until` | `ApiResponse[PropagationSpeed]` |
| `/api/v1/health` | GET | Liveness probe | — | `{status: "ok"}` |
| `/api/v1/ready` | GET | Readiness probe | — | `ApiResponse[ReadinessResponse]` |
| `/api/v1/ws` | WS | Real-time updates | `topics[]` | Stream of events |
| `/api/v1/admin/ingestion/status` | GET | Per-adapter health | — | `ApiResponse[List[AdapterHealth]]` |
| `/api/v1/admin/ingestion/trigger` | POST | Manual backfill | `platform`, `since`, `until` | `ApiResponse[BackfillJob]` |
| `/api/v1/admin/adapters` | GET | Adapter configurations | — | `ApiResponse[List[AdapterConfig]]` |
| `/api/v1/admin/adapters/{platform}` | PATCH | Update adapter config | `rate_limit_rpm`, `enabled` | `ApiResponse[AdapterConfig]` |
| `/api/v1/admin/models/status` | GET | Model health + drift | — | `ApiResponse[List[ModelHealth]]` |
| `/api/v1/admin/models/evaluation` | GET | Model evaluation results | `model_name` | `ApiResponse[List[ModelEvaluation]]` |
| `/api/v1/admin/dlq` | GET | Dead letter queue | `platform`, `error_code`, `limit`, `offset` | `ApiResponse[List[DeadLetterEntry]]` |
| `/api/v1/admin/dlq/{id}/replay` | POST | Replay single payload | — | `ApiResponse[ReplayResult]` |
| `/api/v1/admin/dlq/replay-batch` | POST | Replay by error_code | `error_code`, `platform` | `ApiResponse[BatchReplayResult]` |

---

## 6. KEY IMPLEMENTATION PATTERNS

### 6.1 Adapter Base Class

```python
# adapters/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import AsyncIterator, Optional
import asyncio
import logging

logger = logging.getLogger(__name__)

@dataclass
class RawPlatformEvent:
    platform: str
    source_event_id: str
    source_user_id: str
    text: str
    event_timestamp: datetime
    conversation_id: Optional[str] = None
    parent_event_id: Optional[str] = None
    reply_to_user_id: Optional[str] = None
    forwarded_from: Optional[str] = None
    mentions: list[str] = None
    hashtags: list[str] = None
    urls: list[str] = None
    engagement: dict = None
    metadata: dict = None

class RateLimitError(Exception):
    def __init__(self, retry_after: float):
        self.retry_after = retry_after

class TransientError(Exception):
    pass

class PermanentError(Exception):
    pass

class BaseAdapter(ABC):
    platform: str
    
    def __init__(self, config: dict, redis_client, metrics):
        self.config = config
        self.redis = redis_client
        self.metrics = metrics
        self._rate_limiter = TokenBucket(
            rate=config.get("rate_limit_rpm", 300) / 60.0,
            burst=config.get("rate_limit_burst", 50)
        )
        self._circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=60
        )
    
    @abstractmethod
    async def fetch_events(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        """Yield events in chronological order (oldest first)."""
        pass
    
    @abstractmethod
    async def health_check(self) -> dict:
        """Return {status: healthy|degraded|down, details: ...}"""
        pass
    
    async def _respect_rate_limit(self):
        await self._rate_limiter.acquire()
    
    async def _with_retry(self, coro, max_retries=3):
        for attempt in range(max_retries):
            try:
                async with self._circuit_breaker:
                    await self._respect_rate_limit()
                    return await coro
            except RateLimitError as e:
                wait = e.retry_after + random.uniform(0, 1)
                logger.warning(f"Rate limited, waiting {wait:.1f}s", platform=self.platform)
                await asyncio.sleep(wait)
            except TransientError as e:
                wait = min(2 ** attempt + random.uniform(0, 1), 60)
                logger.warning(f"Transient error, retry {attempt+1}/{max_retries}: {e}")
                await asyncio.sleep(wait)
        raise PermanentError(f"Max retries exceeded for {self.platform}")
```

### 6.1.1 X Adapter — Multi-Provider (TwitterAPI.io + Official + Synthetic)

```python
# adapters/x_adapter.py
import httpx
import random
from datetime import datetime, timezone
from typing import AsyncIterator
from .base import BaseAdapter, RawPlatformEvent, RateLimitError, TransientError, PermanentError

class XAdapter(BaseAdapter):
    platform = "x"
    
    def __init__(self, config: dict, redis_client, metrics):
        super().__init__(config, redis_client, metrics)
        self.provider = config.get("provider", "twitterapi_io")
        self.synthetic_ratio = config.get("synthetic_ratio", 0.0)
        
        # Provider-specific clients
        if self.provider == "twitterapi_io":
            self.api_key = config["api_key"]
            self.base_url = config.get("base_url", "https://api.twitterapi.io/v1")
            self.client = httpx.AsyncClient(
                headers={"X-API-Key": self.api_key},
                timeout=30.0
            )
        elif self.provider == "official":
            self.bearer_token = config["bearer_token"]
            self.base_url = "https://api.twitter.com/2"
            self.client = httpx.AsyncClient(
                headers={"Authorization": f"Bearer {self.bearer_token}"},
                timeout=30.0
            )
        else:
            self.client = None
    
    async def fetch_events(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        # Synthetic fallback
        if self.synthetic_ratio > 0 and random.random() < self.synthetic_ratio:
            async for event in self._generate_synthetic(since, until):
                yield event
            return
        
        if self.provider == "twitterapi_io":
            async for event in self._fetch_twitterapi_io(since, until):
                yield event
        elif self.provider == "official":
            async for event in self._fetch_official(since, until):
                yield event
        else:
            raise PermanentError(f"Unknown X provider: {self.provider}")
    
    async def _fetch_twitterapi_io(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        cursor = None
        while True:
            params = {
                "query": self._build_query(),
                "max_results": self.config.get("max_results_per_request", 100),
            }
            if cursor:
                params["cursor"] = cursor
            
            resp = await self._with_retry(lambda: self.client.get(f"{self.base_url}/tweets/search", params=params))
            data = resp.json()
            
            for tweet in data.get("tweets", []):
                yield self._normalize_twitterapi_io(tweet)
            
            cursor = data.get("next_cursor")
            if not cursor:
                break
            await asyncio.sleep(1)
    
    async def _fetch_official(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        next_token = None
        while True:
            params = {
                "query": self._build_query(),
                "start_time": since.isoformat().replace("+00:00", "Z"),
                "end_time": until.isoformat().replace("+00:00", "Z"),
                "max_results": self.config.get("max_results_per_request", 100),
                "tweet.fields": "created_at,author_id,conversation_id,in_reply_to_user_id,referenced_tweets,entities,public_metrics,lang",
                "expansions": "author_id,referenced_tweets.id,entities.mentions.username",
                "user.fields": "created_at,description,location,public_metrics,verified"
            }
            if next_token:
                params["next_token"] = next_token
            
            resp = await self._with_retry(lambda: self.client.get(f"{self.base_url}/tweets/search/recent", params=params))
            
            # Check rate limit headers
            remaining = int(resp.headers.get("x-rate-limit-remaining", 1))
            reset_time = int(resp.headers.get("x-rate-limit-reset", 0))
            if remaining == 0:
                wait = max(reset_time - time.time(), 0) + 1
                raise RateLimitError(retry_after=wait)
            
            data = resp.json()
            
            for tweet in data.get("data", []):
                includes = data.get("includes", {})
                yield self._normalize_official(tweet, includes)
            
            next_token = data.get("meta", {}).get("next_token")
            if not next_token:
                break
            await asyncio.sleep(1)
    
    def _build_query(self) -> str:
        # Configurable via config.yaml
        return self.config.get("search_query", "(NTRO OR cyber OR security OR hackathon) lang:en OR lang:hi OR lang:gu -is:retweet")
    
    def _normalize_twitterapi_io(self, tweet: dict) -> RawPlatformEvent:
        return RawPlatformEvent(
            platform="x",
            source_event_id=tweet["id"],
            source_user_id=tweet["author_id"],
            text=tweet["text"],
            event_timestamp=datetime.fromisoformat(tweet["created_at"].replace("Z", "+00:00")),
            conversation_id=tweet.get("conversation_id"),
            parent_event_id=tweet.get("in_reply_to_user_id"),
            mentions=[m["username"] for m in tweet.get("entities", {}).get("mentions", [])],
            hashtags=[h["tag"] for h in tweet.get("entities", {}).get("hashtags", [])],
            urls=[u["expanded_url"] for u in tweet.get("entities", {}).get("urls", [])],
            engagement={
                "likes": tweet.get("public_metrics", {}).get("like_count", 0),
                "shares": tweet.get("public_metrics", {}).get("retweet_count", 0),
                "replies": tweet.get("public_metrics", {}).get("reply_count", 0),
            },
            metadata={"lang": tweet.get("lang")}
        )
    
    def _normalize_official(self, tweet: dict, includes: dict) -> RawPlatformEvent:
        # Similar normalization for official API format
        return RawPlatformEvent(
            platform="x",
            source_event_id=tweet["id"],
            source_user_id=tweet["author_id"],
            text=tweet["text"],
            event_timestamp=datetime.fromisoformat(tweet["created_at"].replace("Z", "+00:00")),
            conversation_id=tweet.get("conversation_id"),
            parent_event_id=tweet.get("in_reply_to_user_id"),
            mentions=[m["username"] for m in tweet.get("entities", {}).get("mentions", [])],
            hashtags=[h["tag"] for h in tweet.get("entities", {}).get("hashtags", [])],
            urls=[u["expanded_url"] for u in tweet.get("entities", {}).get("urls", [])],
            engagement={
                "likes": tweet.get("public_metrics", {}).get("like_count", 0),
                "shares": tweet.get("public_metrics", {}).get("retweet_count", 0),
                "replies": tweet.get("public_metrics", {}).get("reply_count", 0),
            },
            metadata={"lang": tweet.get("lang")}
        )
    
    async def _generate_synthetic(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        # Generate realistic synthetic events for demo
        import faker
        fake = faker.Faker()
        
        templates = [
            "Critical update on cyber defense frameworks: NTRO initiative for social media analytics! #CyberSecurity #NTRO",
            "NTRO National Cyber Security Hackathon: automated verification ensures 0 fake intelligence. #SIH2026",
            "નવા નેશનલ સાયબર ગ્રીડ અને સોશિયલ મીડિયા એનાલિ�ಟિક્સ ફ્રેમવર્ક વિશે ચર્ચા. #NationalCyberGrid",
            "Wow, another policy update... sure, this will totally fix server latency 🙄 #SarcasmCheck",
        ]
        
        for i, template in enumerate(templates):
            yield RawPlatformEvent(
                platform="x",
                source_event_id=f"synthetic_{int(since.timestamp())}_{i}",
                source_user_id=f"synthetic_user_{i}",
                text=template,
                event_timestamp=since,
                conversation_id=f"synthetic_conv_{i}",
                mentions=["@NTRO_India", "@CyberCell"][:i%2+1],
                hashtags=["#CyberSecurity", "#NTRO", "#SIH2026"][:i%3+1],
                urls=["https://sih.gov.in/ps/26152"] if i % 2 == 0 else [],
                engagement={"likes": fake.random_int(10, 500), "shares": fake.random_int(5, 100), "replies": fake.random_int(1, 50)},
                metadata={"lang": ["en", "hi", "gu"][i % 3], "data_source": "synthetic"}
            )
    
    async def health_check(self) -> dict:
        try:
            if self.provider == "twitterapi_io":
                resp = await self.client.get(f"{self.base_url}/tweets/search", params={"query": "test", "max_results": 1})
            else:
                resp = await self.client.get(f"{self.base_url}/tweets/search/recent", params={"query": "test", "max_results": 10})
            
            if resp.status_code == 200:
                return {"status": "healthy", "provider": self.provider}
            elif resp.status_code == 429:
                return {"status": "degraded", "provider": self.provider, "error": "rate_limited"}
            else:
                return {"status": "down", "provider": self.provider, "error": f"http_{resp.status_code}"}
        except Exception as e:
            return {"status": "down", "provider": self.provider, "error": str(e)}
```

```python
# ingestion/pipeline.py
class IngestionPipeline:
    def __init__(self, adapters: list[BaseAdapter], normalizer, validator, deduplicator, 
                 event_bus, dead_letter, metrics):
        self.adapters = {a.platform: a for a in adapters}
        self.normalizer = normalizer
        self.validator = validator
        self.deduplicator = deduplicator
        self.event_bus = event_bus
        self.dead_letter = dead_letter
        self.metrics = metrics
    
    async def run_once(self, since: datetime, until: datetime):
        for platform, adapter in self.adapters.items():
            if not await self._is_healthy(adapter):
                self.metrics.increment(f"ingestion.{platform}.skipped")
                continue
            
            async for raw_event in adapter.fetch_events(since, until):
                try:
                    if not self.validator.validate(raw_event):
                        await self.dead_letter.store(raw_event, "VALIDATION_FAILED", "...")
                        continue
                    
                    canonical = self.normalizer.normalize(raw_event)
                    
                    if await self.deduplicator.is_duplicate(canonical):
                        self.metrics.increment("ingestion.duplicates")
                        continue
                    
                    await self.event_bus.publish("events:raw", canonical.model_dump())
                    self.metrics.increment(f"ingestion.{platform}.success")
                    
                except Exception as e:
                    await self.dead_letter.store(raw_event, "PROCESSING_ERROR", str(e))
                    self.metrics.increment(f"ingestion.{platform}.errors")
```

### 6.3 Sentiment Worker (ONNX Inference)

```python
# analytics/sentiment/worker.py
import onnxruntime as ort
import numpy as np
from sentence_transformers import SentenceTransformer

class SentimentWorker(BaseWorker):
    def __init__(self, config, db_pool, redis, metrics):
        super().__init__("sentiment", config, db_pool, redis, metrics)
        self.session = ort.InferenceSession(
            config["sentiment"]["model_path"],
            providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
        )
        self.tokenizer = AutoTokenizer.from_pretrained(config["sentiment"]["tokenizer_name"])
        self.labels = ["negative", "neutral", "positive"]
        self.emotion_labels = ["anger", "excitement", "anxiety", "supportive", "opposing", "sarcasm", "uncertainty"]
        self.embedding_model = SentenceTransformer(config["trends"]["embedding_model"])
    
    async def process_batch(self, events: list[CanonicalEvent]):
        texts = [e.text for e in events]
        languages = [e.language for e in events]
        
        # Preprocess
        processed = [self.preprocess(t, lang) for t, lang in zip(texts, languages)]
        
        # Tokenize
        inputs = self.tokenizer(processed, padding=True, truncation=True, max_length=512, return_tensors="np")
        
        # ONNX inference
        outputs = self.session.run(None, {k: v for k, v in inputs.items()})
        logits = outputs[0]
        
        # Softmax
        probs = softmax(logits, axis=-1)
        sentiment_idx = probs.argmax(axis=-1)
        sentiment_conf = probs.max(axis=-1)
        
        # Multi-label emotions (sigmoid)
        emotion_logits = outputs[1] if len(outputs) > 1 else logits[:, :7]
        emotion_probs = 1 / (1 + np.exp(-emotion_logits))
        
        # Store results
        async with self.db_pool.acquire() as conn:
            async with conn.transaction():
                for i, event in enumerate(events):
                    emotions = {label: float(emotion_probs[i, j]) for j, label in enumerate(self.emotion_labels)}
                    sarcasm_score = emotions.get("sarcasm", 0)
                    sarcasm_uncertain = 0.3 < sarcasm_score < 0.7
                    
                    await conn.execute("""
                        INSERT INTO sentiment_results (event_id, sentiment, emotions, confidence, sarcasm_uncertain, model_name, model_version, preprocessing_version)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (event_id) DO UPDATE SET
                            sentiment = EXCLUDED.sentiment,
                            emotions = EXCLUDED.emotions,
                            confidence = EXCLUDED.confidence,
                            sarcasm_uncertain = EXCLUDED.sarcasm_uncertain,
                            processed_at = now()
                    """, event.event_id, self.labels[sentiment_idx[i]], json.dumps(emotions),
                        float(sentiment_conf[i]), sarcasm_uncertain,
                        "xlm-roberta-sentiment", "v3.1", "v2")
                    
                    # Update canonical_events processed_at
                    await conn.execute("""
                        UPDATE canonical_events SET processed_at = now() WHERE event_id = $1
                    """, event.event_id)
        
        self.metrics.increment("sentiment.events_processed", len(events))
```

### 6.4 Trend Detection (Documented Math)

```python
# analytics/trends/metrics.py
def compute_trend_metrics(current: TopicStats, previous: TopicStats | None, 
                         half_life_hours: float = 6.0) -> TrendMetrics:
    """
    Trend Score Formula (SOUL.md §10 - documented, auditable):
    
    volume_score = log(volume + 1)
    growth_rate = (current.volume - previous.volume) / max(previous.volume, 1)  if previous else 0
    velocity = growth_rate - previous.growth_rate  if previous else 0
    decay = exp(-ln(2) * hours_since_peak / half_life_hours)
    
    trend_score = volume_score * (1 + growth_rate) * (1 + velocity) * decay
    """
    volume = current.volume
    volume_score = math.log(volume + 1)
    
    if previous and previous.volume > 0:
        growth_rate = (volume - previous.volume) / previous.volume
    else:
        growth_rate = 0.0
    
    if previous:
        velocity = growth_rate - previous.growth_rate
    else:
        velocity = 0.0
    
    hours_since_peak = (current.window_start - current.peak_at).total_seconds() / 3600
    decay = math.exp(-math.log(2) * max(hours_since_peak, 0) / half_life_hours)
    
    trend_score = volume_score * (1 + max(growth_rate, -0.99)) * (1 + velocity) * decay
    
    return TrendMetrics(
        volume=volume,
        growth_rate=growth_rate,
        velocity=velocity,
        momentum=growth_rate * decay,
        trend_score=trend_score,
        components={
            "volume_score": volume_score,
            "growth_rate": growth_rate,
            "velocity": velocity,
            "decay": decay
        }
    )
```

### 6.5 Network Worker

```python
# analytics/network/worker.py
import igraph as ig
import leidenalg as la

class NetworkWorker(BaseWorker):
    async def process_window(self, window_start: datetime, window_end: datetime):
        # Fetch events in window
        events = await self.fetch_events(window_start, window_end)
        
        # Build graph
        G = self.graph_builder.build_from_events(events, window_start, window_end)
        
        # Compute centrality
        pagerank = G.pagerank(weights="weight", damping=0.85)
        betweenness = G.betweenness(weights="weight", directed=True)
        degree = G.degree(mode="all")
        
        # Community detection (Leiden)
        partition = la.find_partition(G, la.ModularityVertexPartition, weights="weight")
        communities = {node: comm for node, comm in enumerate(partition)}
        modularity = partition.modularity
        
        # Store nodes
        await self.store_nodes(G, pagerank, betweenness, degree, communities)
        
        # Store edges with provenance
        await self.store_edges(G)
        
        # Store community assignments
        await self.store_communities(communities, modularity, window_start, window_end)
        
        # Compute propagation cascades
        await self.compute_propagation(G, events)
```

---

## 7. CONFIGURATION

### 7.1 config.yaml

```yaml
app:
  environment: development
  log_level: DEBUG
  api_host: 0.0.0.0
  api_port: 8000
  cors_origins: ["http://localhost:3000"]
  jwt_algorithm: RS256
  jwt_access_ttl_minutes: 15
  jwt_refresh_ttl_days: 7

database:
  host: postgres
  port: 5432
  name: social_analytics
  user: ${DB_USER}
  password: ${DB_PASSWORD}
  pool_size: 20
  max_overflow: 10

redis:
  host: redis
  port: 6379
  db: 0
  stream_max_len: 100000

adapters:
  x:
    enabled: true
    provider: "twitterapi_io"  # "twitterapi_io" | "official" | "synthetic"
    # TwitterAPI.io (FREE $1 credit = ~6K reads) — PRIMARY for hackathon
    api_key: ${TWITTERAPI_IO_KEY}
    base_url: "https://api.twitterapi.io/v1"
    rate_limit_rpm: 300
    rate_limit_burst: 50
    lookback_minutes: 60
    max_results_per_request: 100
    # Official API (fallback) — requires $100/mo Basic tier
    bearer_token: ${X_BEARER_TOKEN}
    search_endpoint: "https://api.twitter.com/2/tweets/search/recent"
    # Synthetic fallback (zero cost, guaranteed demo)
    synthetic_ratio: 0.3  # 30% synthetic to fill gaps
  
  telegram:
    enabled: true
    bot_token: ${TELEGRAM_BOT_TOKEN}
    api_id: ${TG_API_ID}
    api_hash: ${TG_API_HASH}
    channels: ["@channel1", "@channel2"]
    use_mtproto: false
    mtproto_session: ${TG_SESSION_STRING}
  
  instagram:
    enabled: false
    access_token: ${IG_ACCESS_TOKEN}
  
  facebook:
    enabled: false
    access_token: ${FB_ACCESS_TOKEN}
  
  reddit:
    enabled: false
    client_id: ${REDDIT_CLIENT_ID}
    client_secret: ${REDDIT_CLIENT_SECRET}
  
  youtube:
    enabled: false
    api_key: ${YOUTUBE_API_KEY}

ingestion:
  batch_size: 100
  flush_interval_seconds: 5
  dead_letter_max_retries: 3
  deduplication_ttl_hours: 168

sentiment:
  model_path: models/xlm-roberta-sentiment-v3.1.onnx
  tokenizer_name: cardiffnlp/twitter-xlm-roberta-base-sentiment
  batch_size: 32
  max_length: 512
  device: cuda
  confidence_threshold: 0.5
  sarcasm_uncertainty_range: [0.3, 0.7]

trends:
  window_sizes_minutes: [5, 60, 1440]
  min_volume: 10
  ngram_range: [1, 3]
  embedding_model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
  clustering_threshold: 0.7
  half_life_hours: 6
  deduplication:
    hashtag_normalize: true
    fuzzy_match_threshold: 0.85

network:
  window_hours: 24
  slide_hours: 1
  min_edge_weight: 1
  community_algorithm: leiden
  community_min_size: 3
  pagerank_damping: 0.85
  pagerank_iterations: 30

demographics:
  window_hours: 24
  age_brackets: ["13-17", "18-25", "26-35", "36-50", "51+"]
  confidence_threshold: 0.6
  method_version: "heuristic-v1"

api:
  rate_limit_per_minute: 100
  rate_limit_burst: 20
  pagination_default_limit: 50
  pagination_max_limit: 500

observability:
  metrics_port: 9090
  log_format: json
  health_check_interval: 30
```

### 7.2 .env.example

```bash
# Database
DB_USER=analytics
DB_PASSWORD=changeme
DATABASE_URL=postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@postgres:5432/social_analytics

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_PRIVATE_KEY_PATH=/secrets/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/secrets/jwt_public.pem

# X (Twitter) Data Source
# Option 1: TwitterAPI.io (FREE $1 credit = ~6K reads) — PRIMARY for hackathon
TWITTERAPI_IO_KEY=your_twitterapi_io_key
X_PROVIDER=twitterapi_io

# Option 2: Official API (requires $100/mo Basic tier) — fallback
# X_BEARER_TOKEN=your_bearer_token

# Option 3: Synthetic only (no API needed)
# X_PROVIDER=synthetic

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TG_API_ID=123456
TG_API_HASH=your_api_hash
TG_SESSION_STRING=  # For MTProto userbot

# Instagram (optional)
IG_ACCESS_TOKEN=

# Facebook (optional)
FB_ACCESS_TOKEN=

# Reddit (optional)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# YouTube (optional)
YOUTUBE_API_KEY=

# Model storage
MODEL_STORAGE_PATH=/models
```

---

## 8. DOCKER COMPOSE (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_DB: social_analytics
      POSTGRES_USER: ${DB_USER:-analytics}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./migrations:/migrations:ro
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-analytics} -d social_analytics"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    environment:
      - CONFIG_PATH=/app/config.yaml
      - PYTHONPATH=/app
    volumes:
      - ./app:/app/app
      - ./config.yaml:/app/config.yaml
      - ./models:/models:ro
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker-sentiment:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    command: python -m app.workers.sentiment_worker
    environment:
      - CONFIG_PATH=/app/config.yaml
      - PYTHONPATH=/app
    volumes:
      - ./app:/app/app
      - ./config.yaml:/app/config.yaml
      - ./models:/models:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  worker-trends:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    command: python -m app.workers.trends_worker
    environment:
      - CONFIG_PATH=/app/config.yaml
      - PYTHONPATH=/app
    volumes:
      - ./app:/app/app
      - ./config.yaml:/app/config.yaml
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker-network:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    command: python -m app.workers.network_worker
    environment:
      - CONFIG_PATH=/app/config.yaml
      - PYTHONPATH=/app
    volumes:
      - ./app:/app/app
      - ./config.yaml:/app/config.yaml
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker-demographics:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    command: python -m app.workers.demographics_worker
    environment:
      - CONFIG_PATH=/app/config.yaml
      - PYTHONPATH=/app
    volumes:
      - ./app:/app/app
      - ./config.yaml:/app/config.yaml
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker-scheduler:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    command: python -m app.workers.scheduler
    environment:
      - CONFIG_PATH=/app/config.yaml
      - PYTHONPATH=/app
    volumes:
      - ./app:/app/app
      - ./config.yaml:/app/config.yaml
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  prometheus:
    image: prom/prometheus:v2.52
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - promdata:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:10.4
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  pgdata:
  redisdata:
  promdata:
  grafana-data:
```

---

## 9. DOCKERFILE

```dockerfile
# Dockerfile
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml requirements.txt requirements-dev.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Development stage
FROM base AS development
RUN pip install -r requirements-dev.txt
COPY . .

# Production stage
FROM base AS production
COPY --from=development /app /app
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

## 10. IMPLEMENTATION PHASES

| Phase | Deliverable | Tests | SOUL.md Coverage |
|-------|-------------|-------|------------------|
| **0. Foundation** | Docker stack, DB, Redis, FastAPI skeleton, logging, health, CI | Unit: config, health | §19, §23, §39 |
| **1. X Adapter + Ingestion** | Fetch → normalize → validate → dedupe → queue → store | Integration: adapter→pipeline→DB | §2, §3, §5, §6 |
| **2. Telegram Adapter** | Same pipeline, Telegram fields (forwarded_from) | Integration: adapter→pipeline→DB | §2, §5 |
| **3. Sentiment Engine** | Worker + ONNX model + API + eval | Unit: preprocessing, inference; Integration: worker→API | §7, §8, §9, §22, §34 |
| **4. Trend Engine** | Worker + metrics + clustering + API | Unit: metrics, clustering; Integration: worker→API | §10, §11, §22 |
| **5. Network Engine** | Graph builder + centrality + communities + propagation + API | Unit: graph, centrality; Integration: worker→API | §14, §15, §16, §17 |
| **6. Demographics** | Profiler + signals + aggregate API | Unit: signals, privacy; Integration: worker→API | §12, §13, §22 |
| **7. Admin & Observability** | Adapter management, DLQ replay, model eval API, WS | Integration: admin flows; Chaos: failure injection | §5, §6, §23, §24, §25 |
| **8. Hardening** | Load tests, chaos tests, security audit, docs, runbooks | Load: 10k events/min; Chaos: kill all deps | §29, §30, §47 |

---

## 11. TESTING STRATEGY

### 11.1 Unit Tests (Target: 90%+ coverage on pure logic)

```python
# tests/unit/test_trend_metrics.py
import pytest
from app.analytics.trends.metrics import compute_trend_metrics

def test_trend_score_formula():
    current = TopicStats(volume=24890, window_start=now, peak_at=now, growth_rate=3.42)
    previous = TopicStats(volume=5632, growth_rate=1.20)
    metrics = compute_trend_metrics(current, previous, half_life_hours=6)
    
    assert metrics.volume == 24890
    assert abs(metrics.growth_rate - 3.42) < 0.01
    assert metrics.components["volume_score"] == pytest.approx(math.log(24891))
    assert metrics.trend_score > 0

def test_trend_score_no_previous():
    current = TopicStats(volume=100, window_start=now, peak_at=now)
    metrics = compute_trend_metrics(current, None)
    assert metrics.growth_rate == 0
    assert metrics.velocity == 0
```

### 11.2 Integration Tests (Testcontainers)

```python
# tests/integration/test_ingestion_pipeline.py
@pytest.mark.asyncio
async def test_ingestion_idempotency(postgres, redis, x_adapter):
    pipeline = IngestionPipeline(...)
    event = create_raw_event()
    
    await pipeline.run_once(event.event_timestamp, event.event_timestamp)
    await pipeline.run_once(event.event_timestamp, event.event_timestamp)
    
    count = await postgres.fetchval("SELECT COUNT(*) FROM canonical_events WHERE source_event_id = $1", event.source_event_id)
    assert count == 1  # Idempotent!
```

### 11.3 Contract Tests (Schemathesis)

```python
# tests/contract/test_api_openapi.py
import schemathesis

schema = schemathesis.openapi.from_path("/openapi.json")

@schema.parametrize()
@pytest.mark.asyncio
async def test_api_conformance(case, api_client):
    response = await case.call_async(api_client)
    case.validate_response(response)
```

### 11.4 Chaos Tests

```python
# tests/chaos/test_adapter_failure.py
@pytest.mark.asyncio
async def test_x_adapter_down_telegram_continues(ingestion_pipeline, x_adapter, telegram_adapter):
    x_adapter.health_check = AsyncMock(return_value={"status": "down"})
    
    await ingestion_pipeline.run_once(since, until)
    
    # X should be skipped, Telegram should process
    assert x_adapter.fetch_events.call_count == 0
    assert telegram_adapter.fetch_events.call_count > 0
```

---

## 12. SECURITY CHECKLIST

- [ ] All secrets via environment variables (never in config.yaml)
- [ ] JWT RS256 with rotating keys
- [ ] Rate limiting: per-IP (100/min) + per-user (1000/min)
- [ ] Input validation: Pydantic on all endpoints
- [ ] SQL injection: SQLAlchemy ORM only, no raw SQL
- [ ] XSS: API returns JSON only, no HTML
- [ ] SSRF: Allowlist outbound URLs in adapters
- [ ] Prompt injection: LLM output validated against JSON schema
- [ ] Audit logging: All admin actions, auth events, data access
- [ ] Dependency scanning: `safety check` in CI
- [ ] Container hardening: non-root user, read-only filesystem, drop capabilities

---

## 13. OBSERVABILITY

### 13.1 Structured Logging (structlog)

```python
# observability/logging.py
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

def get_logger(name: str):
    return structlog.get_logger(name)
```

### 13.2 Prometheus Metrics

```python
# observability/metrics.py
from prometheus_client import Counter, Histogram, Gauge

INGESTION_EVENTS = Counter("ingestion_events_total", "Total events ingested", ["platform", "status"])
INGESTION_LAG = Gauge("ingestion_lag_seconds", "Ingestion lag per platform", ["platform"])
PROCESSING_LATENCY = Histogram("processing_latency_seconds", "Processing latency", ["worker"], buckets=[0.1, 0.5, 1, 2, 5, 10, 30])
MODEL_LATENCY = Histogram("model_inference_latency_seconds", "Model inference latency", ["model"], buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2])
QUEUE_DEPTH = Gauge("queue_depth", "Redis stream depth", ["stream", "consumer_group"])
API_REQUESTS = Counter("api_requests_total", "API requests", ["endpoint", "method", "status"])
API_LATENCY = Histogram("api_latency_seconds", "API latency", ["endpoint"], buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2])
```

---

## 14. DEPLOYMENT CHECKLIST (Production)

- [ ] PostgreSQL: TimescaleDB tuned (chunk_interval, compression, retention)
- [ ] Redis: Persistence (AOF), memory policy, TLS
- [ ] API: Gunicorn + Uvicorn workers (4+), TLS termination
- [ ] Workers: Horizontal scaling per queue depth
- [ ] Models: ONNX optimized, quantized (INT8), versioned in artifact store
- [ ] Secrets: Vault/Sealed Secrets, rotation policy
- [ ] Backups: Daily PG base backup + WAL archiving, point-in-time recovery
- [ ] Monitoring: Grafana dashboards (ingestion, processing, API, models, DB, Redis)
- [ ] Alerting: PagerDuty/Slack on: adapter down, queue lag > 10m, error rate > 5%, disk > 80%
- [ ] Runbooks: Adapter failure, model drift, DLQ backlog, DB failover
- [ ] Load tested: 10k events/min sustained, 50k burst, 2h soak

---

## 15. NEXT STEPS

1. **Initialize repo** with this structure, `pyproject.toml`, `requirements.txt`, `docker-compose.yml`
2. **Phase 0**: Implement Foundation (DB, Redis, FastAPI skeleton, logging, health, CI)
3. **Phase 1**: X Adapter + Ingestion Pipeline (vertical slice)
4. **Iterate** through Phases 2-8 per §10

**Each phase must:** Pass all tests → Update DECISIONS.md → Demo end-to-end → Document

---

*This implementation guide is the single source of truth for backend development. Update it as architecture decisions are made (append to DECISIONS.md).*