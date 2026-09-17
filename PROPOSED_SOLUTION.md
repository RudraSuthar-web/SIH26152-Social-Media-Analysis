# PROPOSED_SOLUTION.md — PS 26152: AI-Driven Social Media Analytics Framework
## Technical Solution for SIH 2026 (NTRO)

---

## 1. Executive Summary

This document proposes a **production-grade, modular, and security-hardened** Social Media Analytics Framework that ingests data from **X (Twitter)** and **Telegram** (essential), with extensible adapters for Instagram, Facebook, Reddit, and YouTube (desirable/bonus). The system delivers four analytical vectors simultaneously: **Sentiment & Emotion**, **Aggregate Demographics**, **Real-Time Trend Detection**, and **Link/Network Analysis** — all with full traceability, reproducibility, and graceful degradation.

**Core Philosophy:** *Correct when data is clean. Predictable when data is dirty. Recoverable when dependencies fail. Observable when something goes wrong. Secure when attacked. Honest when uncertain. Tested beyond the happy path.*

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Orchestration** | Docker Compose | Simple, portable, sufficient for hackathon scale; single-node multi-container |
| **Primary Database** | PostgreSQL 16 + TimescaleDB extension + PostGIS | ACID, time-series native hypertables, geospatial queries, mature ecosystem |
| **Event Bus / Queue** | Redis Streams | Lightweight, consumer groups, persistence, TTL, simpler than Kafka for this scale |
| **API Framework** | FastAPI (Python 3.11+) | Async-native, OpenAPI/Swagger, Pydantic validation, dependency injection |
| **ORM / Data Access** | SQLAlchemy 2.0 (async) + asyncpg | Type-safe, async, migration-friendly (Alembic) |
| **Background Workers** | Python `asyncio` + `redis-py` (consumer groups) | Native async, no external worker framework needed |
| **NLP / ML Models** | Hugging Face Transformers (PyTorch) + ONNX Runtime | State-of-the-art multilingual models, exportable to ONNX for inference speed |
| **Sentiment Base Model** | `cardiffnlp/twitter-xlm-roberta-base-sentiment` (fine-tuned) | Multilingual, handles code-switching, Twitter-domain pretrained |
| **Language Detection** | `fasttext` (lid.176.bin) or `langdetect` fallback | Fast, supports 176+ languages including Indian languages |
| **Demographics Inference** | Heuristic/rule-based v1 → Trainable classifier v2 | Privacy-first aggregate-only; v2 uses bio + behavioral signals |
| **Trend Detection** | Custom: n-gram freq + embedding clustering (sentence-transformers) | Transparent, documented math, no black-box scoring |
| **Network Analysis** | `networkx` + `python-igraph` (Leiden) + `graph-tool` (optional) | Mature algorithms: PageRank, betweenness, Leiden communities |
| **Graph Storage** | PostgreSQL (edges table) + Redis (hot subgraphs) | Relational edges for provenance; cached subgraphs for dashboard |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS | Modern, fast HMR, type-safe, utility-first styling |
| **Visualization** | Cytoscape.js (network), Chart.js (time-series), Leaflet (geo) | Performant, interactive, web-native |
| **State Management** | TanStack Query (React Query) + Zustand | Server-state caching, minimal global state |
| **Auth** | JWT (RS256) + Role-based access (analyst, admin) | Stateless, standard, short-lived access + refresh tokens |
| **Observability** | Structured JSON logs (structlog) + Prometheus metrics + Grafana dashboards | Industry standard, queryable, alertable |
| **Health Checks** | `/health` (liveness) + `/ready` (readiness) per service | Kubernetes-ready, dependency-aware |
| **Testing** | pytest + pytest-asyncio + hypothesis (property) + locust (load) + chaosmesh (chaos) | Comprehensive, brutal, automated |
| **CI/CD** | GitHub Actions (lint, type-check, test, build, security scan) | Native, free for public, matrix builds |
| **Secrets** | `.env` (dev) → GitHub Secrets / Vault (prod) | Never in code, never in images, never in logs |

---

## 3. Project Structure

```
social-analytics/
├── docker-compose.yml              # Full stack orchestration
├── docker-compose.override.yml     # Local dev overrides (gitignored)
├── config.yaml                     # Non-secret configuration (committed)
├── .env.example                    # Template for secrets
├── .env                            # Local secrets (gitignored)
├── SOUL.md                         # Charter (authoritative)
├── BRAIN.md                        # Technical spec for agents
├── PROPOSED_SOLUTION.md            # This file
├── DECISIONS.md                    # Architecture decision log
├── README.md                       # Quick start, architecture overview
├── Makefile                        # Common commands
├── pyproject.toml                  # Python project config (ruff, mypy, pytest)
├── requirements.txt                # Pinned dependencies
├── requirements-dev.txt            # Dev dependencies
├── alembic.ini                     # DB migrations config
├── adapters/
│   ├── __init__.py
│   ├── base.py                     # Abstract base adapter
│   ├── x_adapter.py                # X API v2 (Essential)
│   ├── telegram_adapter.py         # Telegram Bot API + MTProto (Essential)
│   ├── instagram_adapter.py        # Instagram Graph API (Desirable)
│   ├── facebook_adapter.py         # Facebook Graph API (Desirable)
│   ├── reddit_adapter.py           # Reddit API (Bonus)
│   ├── youtube_adapter.py          # YouTube Data API (Bonus)
│   └── registry.py                 # Adapter discovery & health
├── ingestion/
│   ├── __init__.py
│   ├── normalizer.py               # Raw → CanonicalEvent
│   ├── validator.py                # Schema + business rules
│   ├── deduplicator.py             # Idempotency via (platform, source_event_id)
│   ├── pipeline.py                 # Orchestrates: fetch → validate → normalize → dedupe → queue
│   └── dead_letter.py              # Quarantine invalid events
├── analytics/
│   ├── __init__.py
│   ├── sentiment/
│   │   ├── __init__.py
│   │   ├── engine.py               # Inference pipeline
│   │   ├── models.py               # Model loading, versioning, ONNX export
│   │   ├── preprocessing.py        # Text cleaning, language handling
│   │   ├── evaluation.py           # Eval datasets, metrics, drift detection
│   │   └── schemas.py              # Pydantic output schemas
│   ├── demographics/
│   │   ├── __init__.py
│   │   ├── profiler.py             # Aggregate inference
│   │   ├── signals.py              # Feature extraction (bio, behavior, language)
│   │   ├── schemas.py              # Output schemas with confidence labels
│   │   └── privacy.py              # Anonymization, aggregation guards
│   ├── trends/
│   │   ├── __init__.py
│   │   ├── detector.py             # Main trend detection loop
│   │   ├── clustering.py           # Embedding-based topic clustering
│   │   ├── metrics.py              # Volume, growth, velocity, momentum, trend_score
│   │   ├── deduplication.py        # Hashtag/keyword normalization
│   │   └── schemas.py
│   └── network/
│       ├── __init__.py
│       ├── graph_builder.py        # Nodes + edges from canonical events
│       ├── centrality.py           # PageRank, betweenness, degree, eigenvector
│       ├── communities.py          # Leiden/Louvain + temporal tracking
│       ├── propagation.py          # Cascade reconstruction (observed vs inferred)
│       ├── influence.py            # KOL identification with provenance
│       └── schemas.py
├── storage/
│   ├── __init__.py
│   ├── models.py                   # SQLAlchemy ORM models
│   ├── migrations/                 # Alembic migrations (versioned)
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── repositories.py             # Data access layer (CRUD + analytical queries)
│   ├── connection.py               # Async engine, session management
│   └── indexes.py                  # Index definitions per SOUL.md §19
├── api/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app factory
│   ├── deps.py                     # Dependencies: DB, auth, rate limit, request ID
│   ├── schemas.py                  # Pydantic request/response models
│   ├── errors.py                   # Structured error responses
│   ├── middleware.py               # Logging, timing, request ID, error handling
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── events.py               # Raw event queries
│   │   ├── sentiment.py            # Sentiment/emotion analytics
│   │   ├── demographics.py         # Aggregate demographics
│   │   ├── trends.py               # Trend detection + history
│   │   ├── network.py              # Graph, communities, influence, propagation
│   │   ├── health.py               # /health, /ready
│   │   └── admin.py                # Ingestion control, adapter status
│   └── openapi.py                  # Custom OpenAPI schema enhancements
├── dashboard/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles/
│       │   └── globals.css
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Layout.tsx
│       │   ├── charts/
│       │   │   ├── SentimentTimeline.tsx
│       │   │   ├── EmotionDistribution.tsx
│       │   │   ├── TrendVolumeGrowth.tsx
│       │   │   └── DemographicsBars.tsx
│       │   ├── network/
│       │   │   ├── NetworkGraph.tsx
│       │   │   ├── CommunityPanel.tsx
│       │   │   ├── InfluenceTable.tsx
│       │   │   └── PropagationTimeline.tsx
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Select.tsx
│       │   │   ├── DateRangePicker.tsx
│       │   │   ├── LoadingSkeleton.tsx
│       │   │   ├── ErrorAlert.tsx
│       │   │   └── DataSourceBadge.tsx
│       │   └── DataQualityPanel.tsx
│       ├── pages/
│       │   ├── Overview.tsx
│       │   ├── Sentiment.tsx
│       │   ├── Demographics.tsx
│       │   ├── Trends.tsx
│       │   ├── Network.tsx
│       │   └── DataQuality.tsx
│       ├── hooks/
│       │   ├── useApi.ts
│       │   ├── useWebSocket.ts
│       │   ├── useDateRange.ts
│       │   └── useDebounce.ts
│       ├── services/
│       │   ├── api.ts              # Axios instance + interceptors
│       │   ├── websocket.ts        # Real-time updates
│       │   └── export.ts           # CSV/PDF export
│       ├── types/
│       │   └── index.ts            # TypeScript interfaces matching API schemas
│       └── utils/
│           ├── formatters.ts
│           ├── colorSchemes.ts
│           └── constants.ts
├── workers/
│   ├── __init__.py
│   ├── base_worker.py              # Base class with health, metrics, graceful shutdown
│   ├── sentiment_worker.py         # Consumes events → sentiment → store
│   ├── trends_worker.py            # Windowed aggregation → trend detection → store
│   ├── network_worker.py           # Graph updates → centrality → communities → store
│   ├── demographics_worker.py      # Periodic aggregate computation → store
│   └── scheduler.py                # Cron-like triggers for periodic workers
├── scripts/
│   ├── __init__.py
│   ├── backfill.py                 # Historical data backfill (--platform --since --until)
│   ├── replay.py                   # Replay from dead-letter or raw archive
│   ├── eval_models.py              # Model evaluation against labeled sets
│   ├── migrate.py                  # Alembic wrapper
│   ├── seed.py                     # Dev seed data (labeled synthetic)
│   └── benchmark.py                # Load/stress test runner
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures (DB, Redis, mock adapters)
│   ├── unit/
│   │   ├── test_normalizer.py
│   │   ├── test_validator.py
│   │   ├── test_deduplicator.py
│   │   ├── test_sentiment_preprocessing.py
│   │   ├── test_demographic_signals.py
│   │   ├── test_trend_metrics.py
│   │   └── test_graph_builder.py
│   ├── integration/
│   │   ├── test_x_adapter.py
│   │   ├── test_telegram_adapter.py
│   │   ├── test_ingestion_pipeline.py
│   │   ├── test_sentiment_worker.py
│   │   ├── test_trends_worker.py
│   │   └── test_network_worker.py
│   ├── contract/
│   │   ├── test_adapter_schemas.py
│   │   └── test_api_openapi.py
│   ├── e2e/
│   │   ├── test_ingest_to_dashboard.py
│   │   └── test_graceful_degradation.py
│   ├── load/
│   │   ├── locustfile.py
│   │   └── scenarios.py
│   ├── chaos/
│   │   ├── test_db_failure.py
│   │   ├── test_adapter_failure.py
│   │   ├── test_model_failure.py
│   │   └── test_network_partition.py
│   ├── security/
│   │   ├── test_sql_injection.py
│   │   ├── test_xss.py
│   │   ├── test_auth_bypass.py
│   │   └── test_prompt_injection.py
│   └── fixtures/
│       ├── x_events.json
│       ├── telegram_events.json
│       ├── synthetic_mixed_lang.json
│       └── adversarial/
│           ├── huge_text.json
│           ├── malformed_utf8.json
│           ├── sql_injection.json
│           └── prompt_injection.json
└── docs/
    ├── architecture.md
    ├── api.md
    ├── database_schema.md
    ├── data_model.md
    ├── environment_variables.md
    ├── local_development.md
    ├── testing.md
    ├── deployment.md
    ├── security.md
    ├── model_evaluation.md
    └── known_limitations.md
```

---

## 4. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│  X API   │    │Telegram  │    │Instagram │    │ Facebook │    │   ...        │
│ (v2)     │    │Bot/MTProto│    │Graph API │    │ Graph API│    │              │
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
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ANALYST DASHBOARD (React)                          │
│  Pages: Overview | Sentiment | Demographics | Trends | Network | Quality   │
│  • Real-time updates via WebSocket (trends, ingestion health)              │
│  • Interactive network graph (Cytoscape.js)                                │
│  • Time-series charts (Chart.js)                                           │
│  • Map visualization (Leaflet)                                             │
│  • Data source badges (live | synthetic | replay | degraded)               │
│  • Export: CSV, PNG, PDF                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Canonical Data Model (Database Schema)

### 5.1 Core Tables

```sql
-- Canonical events (TimescaleDB hypertable)
CREATE TABLE canonical_events (
    event_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform           VARCHAR(32) NOT NULL,
    source_event_id    VARCHAR(128) NOT NULL,
    source_user_id     VARCHAR(128) NOT NULL,
    text               TEXT NOT NULL,
    language           VARCHAR(16),
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
    data_source        VARCHAR(16) NOT NULL DEFAULT 'live',  -- live|synthetic|replay|fixture|offline
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

-- Sentiment results
CREATE TABLE sentiment_results (
    id                 BIGSERIAL PRIMARY KEY,
    event_id           UUID NOT NULL REFERENCES canonical_events(event_id),
    sentiment          VARCHAR(16) NOT NULL,  -- positive|negative|neutral
    emotions           JSONB NOT NULL DEFAULT '{}',  -- {anger: 0.7, sarcasm: 0.4}
    confidence         REAL NOT NULL,
    model_name         VARCHAR(64) NOT NULL,
    model_version      VARCHAR(32) NOT NULL,
    preprocessing_version VARCHAR(32) NOT NULL,
    processed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    sarcasm_uncertain  BOOLEAN DEFAULT FALSE
);

SELECT create_hypertable('sentiment_results', 'processed_at', 
    chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

CREATE INDEX idx_sentiment_event ON sentiment_results (event_id);
CREATE INDEX idx_sentiment_model_version ON sentiment_results (model_name, model_version);

-- Trend windows (aggregated per time window)
CREATE TABLE trend_windows (
    id                 BIGSERIAL PRIMARY KEY,
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    topic_id           VARCHAR(64) NOT NULL,  -- hash of normalized topic
    topic_label        VARCHAR(256) NOT NULL, -- human-readable
    keywords           JSONB NOT NULL DEFAULT '[]',
    hashtags           JSONB NOT NULL DEFAULT '[]',
    volume             BIGINT NOT NULL DEFAULT 0,
    unique_users       BIGINT NOT NULL DEFAULT 0,
    growth_rate        REAL,       -- vs previous window
    velocity           REAL,       -- derivative of growth
    momentum           REAL,       -- weighted combination
    trend_score        REAL NOT NULL, -- documented formula
    platforms          JSONB NOT NULL DEFAULT '[]',
    languages          JSONB NOT NULL DEFAULT '[]',
    coordinated_pattern BOOLEAN DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT create_hypertable('trend_windows', 'window_start', 
    chunk_time_interval => INTERVAL '1 hour', if_not_exists => TRUE);

CREATE UNIQUE INDEX idx_trend_window_topic ON trend_windows (window_start, topic_id);
CREATE INDEX idx_trend_score ON trend_windows (window_start DESC, trend_score DESC);

-- Network nodes (pseudonymized accounts)
CREATE TABLE network_nodes (
    node_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform           VARCHAR(32) NOT NULL,
    source_user_id     VARCHAR(128) NOT NULL,  -- hashed for pseudonymity
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
    edge_type          VARCHAR(32) NOT NULL,  -- mention|reply|repost|forward|quote|shared_url|shared_hashtag|conversation|topic_similarity|co_retweet
    provenance         VARCHAR(16) NOT NULL DEFAULT 'observed',  -- observed|inferred
    weight             REAL NOT NULL DEFAULT 1.0,
    event_id           UUID REFERENCES canonical_events(event_id),  -- source event for observed edges
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_edges_source_window ON network_edges (source_node_id, window_start);
CREATE INDEX idx_edges_target_window ON network_edges (target_node_id, window_start);
CREATE INDEX idx_edges_type_provenance ON network_edges (edge_type, provenance);

-- Community assignments (per window)
CREATE TABLE community_assignments (
    id                 BIGSERIAL PRIMARY KEY,
    node_id            UUID NOT NULL REFERENCES network_nodes(node_id),
    community_id       VARCHAR(64) NOT NULL,
    algorithm          VARCHAR(32) NOT NULL,  -- leiden|louvain
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    topic_distribution JSONB DEFAULT '{}',
    modularity         REAL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_window ON community_assignments (window_start, community_id);

-- Demographic aggregates (per window + topic)
CREATE TABLE demographic_aggregates (
    id                 BIGSERIAL PRIMARY KEY,
    window_start       TIMESTAMPTZ NOT NULL,
    window_end         TIMESTAMPTZ NOT NULL,
    topic_id           VARCHAR(64),
    age_brackets       JSONB NOT NULL DEFAULT '{}',  -- {"18-25": 0.31, ...}
    languages          JSONB NOT NULL DEFAULT '{}',
    geography          JSONB NOT NULL DEFAULT '{}',
    interests          JSONB NOT NULL DEFAULT '{}',
    confidence_label   VARCHAR(16) NOT NULL,  -- estimated|inferred|uncertain
    sample_size        BIGINT NOT NULL,
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
    resolution         VARCHAR(32)  -- fixed|ignored|escalated
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
    error_rate         REAL,
    total_inferences   BIGINT DEFAULT 0,
    total_errors       BIGINT DEFAULT 0,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. Component Design Details

### 6.1 Adapter Interface (Base Class)

```python
# adapters/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import AsyncIterator, Optional
import asyncio

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

class BaseAdapter(ABC):
    platform: str
    
    def __init__(self, config: dict, redis_client, metrics):
        self.config = config
        self.redis = redis_client
        self.metrics = metrics
        self._rate_limiter = TokenBucket(...)
        self._circuit_breaker = CircuitBreaker(...)
    
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
                return await coro
            except RateLimitError as e:
                await asyncio.sleep(e.retry_after + jitter())
            except TransientError:
                await asyncio.sleep(backoff(attempt) + jitter())
        raise PermanentError("Max retries exceeded")
```

### 6.2 Ingestion Pipeline

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
                    # Validate
                    if not self.validator.validate(raw_event):
                        await self.dead_letter.store(raw_event, "VALIDATION_FAILED", "...")
                        continue
                    
                    # Normalize
                    canonical = self.normalizer.normalize(raw_event)
                    
                    # Deduplicate
                    if await self.deduplicator.is_duplicate(canonical):
                        self.metrics.increment("ingestion.duplicates")
                        continue
                    
                    # Publish to event bus
                    await self.event_bus.publish("events:raw", canonical.model_dump())
                    self.metrics.increment(f"ingestion.{platform}.success")
                    
                except Exception as e:
                    await self.dead_letter.store(raw_event, "PROCESSING_ERROR", str(e))
                    self.metrics.increment(f"ingestion.{platform}.errors")
```

### 6.3 Sentiment Engine

```python
# analytics/sentiment/engine.py
class SentimentEngine:
    def __init__(self, model_path: str, tokenizer, preprocessing, device="cuda"):
        self.session = ort.InferenceSession(model_path, providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
        self.tokenizer = tokenizer
        self.preprocessing = preprocessing
        self.labels = ["negative", "neutral", "positive"]
        self.emotion_labels = ["anger", "excitement", "anxiety", "supportive", "opposing", "sarcasm", "uncertainty"]
    
    def predict(self, texts: list[str], languages: list[str]) -> list[SentimentResult]:
        # Preprocess per language
        processed = [self.preprocessing.clean(t, lang) for t, lang in zip(texts, languages)]
        
        # Tokenize
        inputs = self.tokenizer(processed, padding=True, truncation=True, max_length=512, return_tensors="np")
        
        # ONNX inference
        outputs = self.session.run(None, {k: v for k, v in inputs.items()})
        logits = outputs[0]
        
        # Softmax
        probs = softmax(logits, axis=-1)
        sentiment_idx = probs.argmax(axis=-1)
        sentiment_conf = probs.max(axis=-1)
        
        # Multi-label emotions (separate head or threshold)
        emotion_probs = self._predict_emotions(logits)
        
        results = []
        for i in range(len(texts)):
            emotions = {label: float(emotion_probs[i, j]) for j, label in enumerate(self.emotion_labels)}
            sarcasm_score = emotions.get("sarcasm", 0)
            sarcasm_uncertain = 0.3 < sarcasm_score < 0.7
            
            results.append(SentimentResult(
                sentiment=self.labels[sentiment_idx[i]],
                emotions=emotions,
                confidence=float(sentiment_conf[i]),
                sarcasm_uncertain=sarcasm_uncertain,
                model_name="xlm-roberta-sentiment",
                model_version="v3.1",
                preprocessing_version="v2"
            ))
        return results
```

### 6.4 Trend Detection (Documented Math)

```python
# analytics/trends/metrics.py
def compute_trend_metrics(current: TopicStats, previous: TopicStats | None, 
                         half_life_hours: float = 6.0) -> TrendMetrics:
    """
    Trend Score Formula (documented, auditable):
    
    volume_score = log(volume + 1)
    growth_rate = (current.volume - previous.volume) / max(previous.volume, 1)  if previous else 0
    velocity = growth_rate - previous.growth_rate  if previous else 0
    decay = exp(-ln(2) * hours_since_peak / half_life_hours)
    
    trend_score = volume_score * (1 + growth_rate) * (1 + velocity) * decay
    
    All components logged for explainability.
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
    
    # Decay based on time since peak volume
    hours_since_peak = (current.window_start - current.peak_at).total_seconds() / 3600
    decay = math.exp(-math.log(2) * max(hours_since_peak, 0) / half_life_hours)
    
    trend_score = volume_score * (1 + max(growth_rate, -0.99)) * (1 + velocity) * decay
    
    return TrendMetrics(
        volume=volume,
        growth_rate=growth_rate,
        velocity=velocity,
        momentum=growth_rate * decay,  # Simplified momentum
        trend_score=trend_score,
        components={
            "volume_score": volume_score,
            "growth_rate": growth_rate,
            "velocity": velocity,
            "decay": decay
        }
    )
```

### 6.5 Network Analysis

```python
# analytics/network/graph_builder.py
class GraphBuilder:
    EDGE_TYPES_OBSERVED = {"mention", "reply", "repost", "forward", "quote", 
                           "shared_url", "shared_hashtag", "conversation"}
    EDGE_TYPES_INFERRED = {"topic_similarity", "co_retweet"}
    
    def build_from_events(self, events: list[CanonicalEvent], window_start, window_end) -> nx.MultiDiGraph:
        G = nx.MultiDiGraph()
        
        # Ensure nodes exist
        for event in events:
            self._ensure_node(G, event)
        
        # Observed edges from platform interactions
        for event in events:
            if event.parent_event_id:
                parent = self._find_event(events, event.parent_event_id)
                if parent:
                    G.add_edge(event.source_user_id, parent.source_user_id, 
                              type="reply", provenance="observed", event_id=event.event_id)
            
            for mention in event.mentions:
                G.add_edge(event.source_user_id, mention,
                          type="mention", provenance="observed", event_id=event.event_id)
            
            # ... other observed edge types
        
        # Inferred edges (explicitly labeled)
        self._add_topic_similarity_edges(G, events, threshold=0.75)
        self._add_co_retweet_edges(G, events)
        
        return G
    
    def _add_topic_similarity_edges(self, G, events, threshold):
        # Compute embeddings, add edges where cosine > threshold
        # provenance = "inferred", edge_type = "topic_similarity"
        pass
```

---

## 7. API Design (Key Endpoints)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/v1/events` | GET | Query canonical events | `platform`, `since`, `until`, `conversation_id`, `language`, `limit`, `offset` |
| `/api/v1/sentiment/summary` | GET | Sentiment distribution over time | `since`, `until`, `interval`, `platform`, `topic_id` |
| `/api/v1/sentiment/events` | GET | Per-event sentiment | `event_ids[]`, `since`, `until` |
| `/api/v1/demographics` | GET | Aggregate demographics | `since`, `until`, `topic_id`, `platform` |
| `/api/v1/trends` | GET | Trending topics | `since`, `until`, `limit`, `min_volume`, `sort=trend_score|growth|volume` |
| `/api/v1/trends/{topic_id}/timeline` | GET | Topic evolution over time | `topic_id`, `since`, `until` |
| `/api/v1/network/graph` | GET | Subgraph for visualization | `since`, `until`, `node_ids[]`, `edge_types[]`, `min_weight`, `limit` |
| `/api/v1/network/influence` | GET | Top KOLs | `since`, `until`, `metric=pagerank|betweenness|degree`, `limit` |
| `/api/v1/network/communities` | GET | Communities | `since`, `until`, `algorithm`, `min_size` |
| `/api/v1/network/propagation` | GET | Cascade for topic/event | `topic_id` or `event_id`, `depth` |
| `/api/v1/health` | GET | Liveness probe | — |
| `/api/v1/ready` | GET | Readiness probe (DB, Redis, adapters) | — |
| `/api/v1/admin/ingestion/status` | GET | Per-adapter health, lag | — |
| `/api/v1/admin/ingestion/trigger` | POST | Manual backfill trigger | `platform`, `since`, `until` |

**All responses include:** `request_id`, `timestamp`, `data_source` badge (live|synthetic|replay|degraded)

---

## 8. Dashboard Specification

### 8.1 Pages & Components

| Page | Key Components | Real-time? |
|------|----------------|------------|
| **Overview** | KPI cards (events, users, topics), sentiment sparkline, top trends, ingestion health | WebSocket (health, top trends) |
| **Sentiment** | Time-series (area), emotion stack, topic sentiment table, confidence bands | Polling (30s) |
| **Demographics** | Stacked bars (age, language, geo), confidence badges, sample size | Polling (5m) |
| **Trends** | Rising/declining tables, volume vs growth scatter, timeline slider, topic detail drawer | WebSocket (new trends) |
| **Network** | Cytoscape graph (filter: edge type, time, community), KOL table, propagation animation | WebSocket (graph updates) |
| **Data Quality** | Adapter status cards, dead letter count, model latency, last successful processing | WebSocket (health changes) |

### 8.2 Data Source Indicators

Every widget shows a badge:
- 🟢 **LIVE** — Fresh data from platform APIs
- 🟡 **DEGRADED** — One+ adapters down, partial data
- 🟠 **REPLAY** — Historical backfill in progress
- 🔵 **SYNTHETIC** — Development/test data only
- 🔴 **OFFLINE** — No ingestion for > threshold

---

## 9. Security Architecture

| Threat | Mitigation |
|--------|------------|
| SQL/NoSQL Injection | Parameterized queries (SQLAlchemy), no raw SQL |
| XSS | React auto-escaping, CSP headers, sanitize API responses |
| SSRF | Allowlist outbound URLs, no user-controlled fetch targets |
| Auth Bypass | JWT RS256, short expiry (15m), refresh rotation, RBAC middleware |
| Rate Limit Abuse | Redis-backed sliding window (per-IP, per-user), 429 with `Retry-After` |
| Prompt Injection | LLM output validated against JSON schema, never executed |
| Secret Leakage | `.env` gitignored, GitHub Secrets for CI, Vault for prod, structlog filters |
| Data Leakage | Row-level security (if multi-tenant), aggregate-only demographics, pseudonymized nodes |

---

## 10. Observability Stack

| Component | Tool | Key Metrics |
|-----------|------|-------------|
| **Logs** | structlog → stdout → Loki/Grafana | `request_id`, `event_id`, `operation`, `duration_ms`, `error_code` |
| **Metrics** | Prometheus client → Prometheus → Grafana | `ingestion_rate`, `processing_latency_p95`, `queue_depth`, `model_latency_p99`, `api_error_rate`, `adapter_lag_seconds` |
| **Traces** | OpenTelemetry (optional) | End-to-end latency, DB query time, model inference time |
| **Health** | `/health` (process), `/ready` (deps) | DB pool, Redis, adapter reachability, model server |
| **Alerts** | Prometheus Alertmanager | Adapter down > 5m, queue lag > 10m, error rate > 5%, disk > 80% |

---

## 11. Testing Strategy (Per SOUL.md §26-35)

| Tier | Tool | Coverage Target |
|------|------|-----------------|
| **Unit** | pytest + hypothesis | 90%+ on pure logic (normalizer, validator, metrics, graph) |
| **Integration** | pytest-asyncio + testcontainers | All adapter → pipeline → store paths |
| **Contract** | schemathesis (OpenAPI) | Adapter schemas, API spec |
| **E2E** | Playwright (frontend) + pytest (backend) | Ingest → analyze → API → dashboard |
| **Regression** | pytest + git hooks | Every bug = test in `tests/regression/` |
| **Load** | Locust | 10k events/min sustained, 50k burst |
| **Stress** | Locust + chaos | Beyond breaking point, observe degradation |
| **Soak** | Locust (2h+) | Memory leaks, connection leaks, metric drift |
| **Chaos** | chaosmesh / custom scripts | Kill DB, Redis, adapter, model, worker; verify recovery |
| **Security** | bandit, safety, custom penetration tests | OWASP Top 10 + LLM-specific |
| **AI Evaluation** | Custom eval harness | Labeled sets per language, macro-F1, calibration, latency |

**Adversarial Fixtures** (in `tests/fixtures/adversarial/`):
- Empty/null/missing/extra/wrong-type fields
- Huge strings (10MB+), Unicode, emoji, mixed Hinglish/Gujarati-English
- Malformed UTF-8, duplicate events, out-of-order, future/past timestamps
- SQL/shell/HTML injection payloads, prompt injection attempts
- Network timeouts, partial responses, rate limit responses

---

## 12. Deployment & Operations

### 12.1 Docker Compose Services

```yaml
# docker-compose.yml (simplified)
services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    environment: [POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD]
    volumes: [pgdata:/var/lib/postgresql/data]
    ports: ["5432:5432"]
    healthcheck: pg_isready
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes: [redisdata:/data]
    ports: ["6379:6379"]
    healthcheck: redis-cli ping
  
  api:
    build: ./api
    depends_on: [postgres, redis]
    environment: [DATABASE_URL, REDIS_URL, JWT_SECRET, CONFIG_PATH]
    ports: ["8000:8000"]
    healthcheck: curl -f /health
  
  worker-sentiment:
    build: ./workers
    command: python -m workers.sentiment_worker
    depends_on: [postgres, redis]
    deploy: {replicas: 2}
  
  worker-trends:
    build: ./workers
    command: python -m workers.trends_worker
    depends_on: [postgres, redis]
    deploy: {replicas: 1}
  
  worker-network:
    build: ./workers
    command: python -m workers.network_worker
    depends_on: [postgres, redis]
    deploy: {replicas: 1}
  
  dashboard:
    build: ./dashboard
    ports: ["3000:80"]
    depends_on: [api]
  
  prometheus:
    image: prom/prometheus
    volumes: [./prometheus.yml:/etc/prometheus/prometheus.yml]
    ports: ["9090:9090"]
  
  grafana:
    image: grafana/grafana
    volumes: [grafana-data:/var/lib/grafana, ./dashboards:/etc/grafana/provisioning/dashboards]
    ports: ["3001:3000"]
```

### 12.2 Environments

| Env | Purpose | Data Source | Scale |
|-----|---------|-------------|-------|
| **development** | Local dev | Synthetic fixtures | Minimal |
| **testing** | CI/CD | Synthetic + replay | Small |
| **staging** | Pre-prod | Live (limited) | Medium |
| **production** | Hackathon demo | Live (full) | Target |

---

## 13. Development Phases (Vertical Slices)

| Phase | Deliverable | SOUL.md Coverage |
|-------|-------------|------------------|
| **0. Foundation** | Docker stack, DB, event bus, CI, logging, health checks | §19, §23, §39 |
| **1. X Adapter + Ingestion** | Fetch → normalize → validate → dedupe → store (canonical_events) | §2, §3, §5, §6 |
| **2. Telegram Adapter** | Same pipeline, Telegram-specific fields (forwarded_from) | §2, §5 |
| **3. Sentiment Engine** | Worker + model + API + dashboard (sentiment page) | §7, §8, §9, §22, §34 |
| **4. Trend Engine** | Worker + metrics + API + dashboard (trends page) | §10, §11, §22 |
| **5. Network Engine** | Graph builder + centrality + communities + API + dashboard (network page) | §14, §15, §16, §17 |
| **6. Demographics** | Profiler + aggregate API + dashboard (demographics page) | §12, §13, §22 |
| **7. Dashboard Polish** | All pages, WebSocket, export, data source badges, mobile | §21, §31 |
| **8. Hardening** | Chaos tests, load tests, security audit, docs, runbooks | §24, §25, §29, §30, §46, §47 |

**Each phase:** End-to-end working → tested → documented → demoable.

---

## 14. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| X API rate limits too restrictive | High | High | Cache, backfill, prioritize essential endpoints, elevate tier request |
| Telegram channel history access | Medium | High | MTProto (userbot) for history, Bot API for real-time |
| Multilingual model accuracy (Gujarati/Hinglish) | High | Medium | Fine-tune on Indian code-switched data, ensemble with rules |
| Network graph scalability | Medium | Medium | Subgraph sampling, Redis-cached hot graphs, pagination |
| Privacy/compliance (DPDP Act) | Medium | High | Aggregate-only, pseudonymization, retention, audit logs |
| Model inference latency | Medium | Medium | ONNX export, batching, GPU, async workers |
| Team bandwidth (solo/small) | High | High | Vertical slices, ruthless scope control, reuse proven libraries |

---

## 15. Success Criteria (Hackathon Demo)

| Criterion | Measurable Target |
|-----------|-------------------|
| **Ingestion** | X + Telegram live, < 30s lag, 0 duplicates in 1h test |
| **Sentiment** | > 80% macro-F1 on eval set, < 200ms/event batch inference |
| **Trends** | Detects known spike in replay test, trend_score formula documented |
| **Network** | Graph renders 1k nodes / 5k edges @ 60fps, KOLs match manual inspection |
| **Demographics** | Aggregate distributions sum to 100%, confidence labels shown |
| **Dashboard** | All 6 pages load < 2s, WebSocket updates < 1s, data source badges visible |
| **Resilience** | Kill any single component → others degrade gracefully, recover < 30s |
| **Security** | No secrets in repo, bandit/safety clean, authz tested |
| **Observability** | Logs structured, metrics in Grafana, `/ready` checks all deps |

---

## 16. Appendix: Configuration Example

```yaml
# config.yaml
app:
  environment: development
  log_level: DEBUG
  api_host: 0.0.0.0
  api_port: 8000
  dashboard_url: http://localhost:3000
  cors_origins: ["http://localhost:3000"]

database:
  host: postgres
  port: 5432
  name: social_analytics
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
    bearer_token_env: X_BEARER_TOKEN
    rate_limit_rpm: 300
    lookback_hours: 1
    max_results_per_request: 100
  
  telegram:
    enabled: true
    bot_token_env: TELEGRAM_BOT_TOKEN
    api_id_env: TG_API_ID
    api_hash_env: TG_API_HASH
    channels: ["@channel1", "@channel2"]
    use_mtproto: false  # true for history backfill
  
  instagram:
    enabled: false
  
  facebook:
    enabled: false
  
  reddit:
    enabled: false
  
  youtube:
    enabled: false

ingestion:
  batch_size: 100
  flush_interval_seconds: 5
  dead_letter_max_retries: 3
  deduplication_ttl_hours: 168  # 7 days

sentiment:
  model_path: models/xlm-roberta-sentiment-v3.1.onnx
  tokenizer_name: cardiffnlp/twitter-xlm-roberta-base-sentiment
  batch_size: 32
  max_length: 512
  device: cuda
  confidence_threshold: 0.5
  sarcasm_uncertainty_range: [0.3, 0.7]

trends:
  window_sizes_minutes: [5, 60, 1440]  # 5m, 1h, 24h
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
  jwt_algorithm: RS256
  jwt_access_ttl_minutes: 15
  jwt_refresh_ttl_days: 7
  pagination_default_limit: 50
  pagination_max_limit: 500

dashboard:
  websocket_enabled: true
  refresh_intervals:
    overview: 10
    sentiment: 30
    trends: 15
    network: 30
    quality: 10
```

---

## 17. Next Steps

1. **Initialize repo** with this structure, `pyproject.toml`, `requirements.txt`, `docker-compose.yml`
2. **Implement Phase 0** (Foundation): DB, Redis, logging, health, CI
3. **Implement Phase 1** (X Adapter + Ingestion Pipeline)
4. **Iterate vertically** through Phases 2–8 per §13
5. **Daily**: Run chaos/load tests, update `DECISIONS.md`, review `SOUL.md` compliance

---

*This proposed solution is a living document. Update it as architecture decisions are made (append to `DECISIONS.md`).*