# BRAIN.md — PS 26152: AI-Driven Social Media Analytics Framework
## Context for Autonomous Coding Agents (antigravity, claude-code, codex, opencode)

---

## 1. PROJECT IDENTITY

**Project:** PS 26152 — AI-driven Social Media Analytics Framework
**Challenge:** Smart India Hackathon 2026 (SIH 2026)
**Organization:** National Technical Research Organisation (NTRO)
**Category / Theme:** Software / Blockchain & Cybersecurity
**Team:** Solo / small-team build
**Charter:** `SOUL.md` (authoritative — supersedes all ad-hoc instructions)

---

## 2. CORE MISSION

Build a **production-grade** system that ingests social media data (primarily **X** and **Telegram**) and delivers **four analytical vectors** simultaneously:

| Vector | Purpose |
|--------|---------|
| **Sentiment Analysis** | Nuanced emotions (sarcasm, anxiety, excitement, supportive, opposing) over time |
| **Demographics** | Aggregate, anonymized: age brackets, geography, language, professional interests |
| **Trend Tracking** | Rising/viral/shifting topics, ranked, predicted, chronological |
| **Link/Network Analysis** | Follower relationships, key opinion leaders (KOLs), influence propagation paths |

**Non-negotiable:** Never fake intelligence. Every output traceable to source event, model, version, confidence.

---

## 3. PLATFORM PRIORITY & ADAPTERS

```
ESSENTIAL (Must-Have)     →  X (Twitter API v2) + Telegram Bot API / MTProto
DESIRABLE (Good-to-Have)  →  Instagram Graph API + Facebook Graph API
APPRECIABLE (Bonus)       →  Reddit API + YouTube Data API (comments)
```

**Every adapter must:**
- Expose normalized internal schema (see §5)
- Handle rate limits, retries, backoff, jitter
- Be idempotent (dedupe via `platform + source_event_id`)
- Gracefully degrade when API fails (other adapters continue)

---

## 4. CANONICAL DATA MODEL

```python
# All fields nullable where platform doesn't provide
CanonicalEvent = {
    "event_id": "uuid",                    # internal stable ID
    "platform": "x|telegram|instagram|facebook|reddit|youtube",
    "source_event_id": "str",              # platform-native ID
    "source_user_id": "str",               # platform-native user ID
    "text": "str",                         # raw text (preserve original)
    "language": "str|null",                # ISO 639-1 or "mixed"
    "event_timestamp": "datetime",         # when event occurred (UTC)
    "ingested_at": "datetime",             # when we received it (UTC)
    "processed_at": "datetime|null",       # when analytics completed
    "conversation_id": "str|null",         # thread/conversation grouping
    "parent_event_id": "str|null",         # reply/quote/forward parent
    "reply_to_user_id": "str|null",        # direct reply target
    "forwarded_from": "str|null",          # forward source (Telegram)
    "mentions": "list[str]",               # @handles mentioned
    "hashtags": "list[str]",               # #tags
    "urls": "list[str]",                   # extracted URLs
    "engagement": {                        # platform-specific metrics
        "likes": "int",
        "shares": "int",
        "replies": "int",
        "views": "int|null"
    },
    "metadata": "dict",                    # platform-specific extras
    "schema_version": "int"                # for migrations
}
```

**Key invariants:**
- `event_id` = deterministic hash of `(platform, source_event_id)` → enables idempotency
- `event_timestamp` ≠ `ingested_at` (handle late/out-of-order arrivals)
- Original `text` NEVER overwritten by translation
- Quarantine invalid events (dead-letter queue), never silent discard

---

## 5. ARCHITECTURE (Logical Components)

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────┐
│  X Adapter  │    │Normalize/    │    │  Queue /    │    │  Workers   │
│Telegram Ad. │───▶│ Validate     │───▶│  Event Bus  │───▶│ (parallel) │
│  ... Adap.  │    │ Deduplicate  │    │ (Kafka/Redis)     │            │
└─────────────┘    └──────────────┘    └─────────────┘    └─────┬──────┘
                                                                 │
                    ┌────────────────────────────────────────────┼───────────┐
                    ▼                                            ▼           ▼
             ┌─────────────┐                              ┌─────────────┐ ┌─────────────┐
             │  Sentiment  │                              │   Topic     │ │  Network    │
             │   Engine    │                              │   Engine    │ │   Engine    │
             └──────┬──────┘                              └──────┬──────┘ └──────┬──────┘
                    │                                        │            │
                    └────────────────────────────────────────┼────────────┘
                                                             ▼
                                                  ┌──────────────────┐
                                                  │  Analytics Store │
                                                  │  (PostgreSQL +   │
                                                  │   TimescaleDB?)  │
                                                  └────────┬─────────┘
                                                           │
                                                  ┌────────▼─────────┐
                                                  │  API / Query     │
                                                  │  Layer (FastAPI) │
                                                  └────────┬─────────┘
                                                           │
                                                  ┌────────▼─────────┐
                                                  │  Analyst         │
                                                  │  Dashboard       │
                                                  │  (React +        │
                                                  │   Leaflet/Vis)   │
                                                  └──────────────────┘
```

**Tech Stack (per Sentinel VMS precedent):**
- **Orchestration:** Docker Compose
- **Database:** PostgreSQL 16 + PostGIS (for geo) + TimescaleDB (for time-series)
- **Event Bus:** Redis Streams or Kafka (choose based on scale)
- **API:** FastAPI (async, OpenAPI, pydantic validation)
- **Frontend:** React + TypeScript + Vite + Leaflet (maps) + Cytoscape/Vis.js (graphs) + Chart.js
- **Auth:** JWT + roles (analyst, admin)
- **Observability:** Structured JSON logs, Prometheus metrics, `/health` + `/ready`

---

## 6. COMPONENT SPECIFICATIONS

### 6A. Data Ingestion & Timeline Management
- **Adapters:** One per platform, shared base class
- **Normalization:** Pydantic models → canonical schema
- **Validation:** Reject impossible timestamps, invalid IDs, oversized text, malformed payloads
- **Deduplication:** `ON CONFLICT (platform, source_event_id) DO NOTHING` + Redis set for hot path
- **Backfill/Replay:** CLI command accepting date range + platform
- **Health:** Per-adapter lag metric (`now - max(event_timestamp)`)

### 6B. Multi-Dimensional Sentiment Engine
- **Labels:** `positive`, `negative`, `neutral`, `supportive`, `opposing`, `anxiety`, `excitement`, `anger`, `sarcasm`, `uncertainty`
- **Output per event:**
  ```json
  {
    "event_id": "...",
    "sentiment": "negative",
    "emotions": {"anger": 0.7, "sarcasm": 0.4},
    "confidence": 0.82,
    "model": "xlm-roberta-sentiment",
    "model_version": "v3.1",
    "preprocessing_version": "v2",
    "processed_at": "..."
  }
  ```
- **Multilingual:** Preserve original text; store `detected_language`, `translation` (if used), `translation_model`
- **Sarcasm:** Never 100% confident. If uncertain → lower confidence, flag `sarcasm_uncertain: true`
- **Models:** Start with `cardiffnlp/twitter-xlm-roberta-base-sentiment` + fine-tune on Indian language code-switched data

### 6C. Automated Demographic Profiling
- **Aggregate ONLY** — no individual claims
- **Signals:** Bio text, username patterns, language, timezone, posting hours, hashtag interests, follows/followers ratio
- **Output (per time window + topic):**
  ```json
  {
    "window": "2026-01-01/2026-01-02",
    "topic": "traffic safety",
    "age_brackets": {"18-25": 0.31, "26-35": 0.42, "36-50": 0.19, "50+": 0.08},
    "languages": {"en": 0.55, "hi": 0.30, "gu": 0.10, "hinglish": 0.05},
    "geography": {"gujarat": 0.65, "maharashtra": 0.20, "other": 0.15},
    "interests": {"civic": 0.4, "tech": 0.2, "politics": 0.25, "entertainment": 0.15},
    "confidence": "estimated|inferred|uncertain",
    "sample_size": 12400
  }
  ```
- **Privacy:** Pseudonymous internal IDs; no PII in analytics store; retention policy

### 6D. Real-Time Trend & Topic Detection
- **Signals:** Keyword freq, hashtag freq, n-gram freq, embedding clustering
- **Metrics per topic:**
  - `volume` (absolute count)
  - `growth_rate` (vs previous window)
  - `velocity` (derivative of growth)
  - `momentum` (weighted combination)
  - `trend_score` = documented formula (e.g., `log(volume+1) * growth_rate * decay_factor`)
- **Emerging vs declining:** Separate detection
- **Dedupe:** Hashtag normalization (`#GujaratPolice` = `#gujaratpolice`), spelling variants, multilingual variants
- **Bot/coordination detection:** Flag burst patterns, copy-paste similarity — label as `coordinated_pattern: true`, NOT `malicious: true`

### 6E. Link Analysis & Network Topology
- **Nodes:** Accounts (pseudonymized internal ID)
- **Edges (observed):**
  - `mention`, `reply`, `repost/retweet`, `forward`, `quote`, `shared_url`, `shared_hashtag`, `conversation`
- **Edges (inferred — explicitly labeled):**
  - `topic_similarity` (cosine > threshold), `co_retweet_cluster`
- **Metrics:** Degree, weighted degree, PageRank, betweenness, eigenvector, community (Leiden/Louvain)
- **Influence score:** Always expose basis: `method: "pagerank", window: "24h", interactions: ["mention","reply","repost"]`
- **Propagation:** Reconstruct cascade where platform data supports it; separate `observed` vs `inferred` edges
- **Communities:** Algorithm + window + min_size + topic distribution; NO ideological labels without evidence

---

## 7. DASHBOARD REQUIREMENTS

| View | Key Elements |
|------|--------------|
| **Overview** | Total events, active accounts, trending topics, sentiment dist, ingestion health |
| **Sentiment** | Time-series, emotion breakdown, topic-specific sentiment, confidence bands |
| **Demographics** | Aggregate bars (age, language, geo), confidence badges, sample size |
| **Trends** | Rising/declining tables, volume+growth scatter, timeline slider, topic detail drill-down |
| **Network** | Interactive graph (filter by edge type, time, community), KOL table, propagation animation |
| **Data Quality** | Ingestion status per adapter, API error rates, model latency, last successful processing, dead-letter count |

**UI States:** Empty, loading, error, partial data, stale data indicators, fallback notices

---

## 8. NON-NEGOTIABLE ENGINEERING PRINCIPLES (from SOUL.md)

| Principle | Enforcement |
|-----------|-------------|
| **Production over prototype** | No hardcoded metrics, no fake data in UI, no "works on my machine" |
| **Never fake intelligence** | Synthetic data → `DATA_SOURCE=synthetic` label everywhere |
| **Evidence before conclusions** | Every metric: source, event IDs, timestamps, model, version, confidence |
| **Idempotency** | Same event 2x → 1 canonical record (test this!) |
| **Out-of-order support** | Late arrivals, clock skew, backfills handled |
| **Graceful degradation** | X down → Telegram continues; dashboard shows degraded badge |
| **Privacy by design** | Minimize collection, encrypt secrets, audit logs, retention |
| **Explainability** | What/Why/Data/Model/Window/Confidence for every AI output |
| **Observability** | Structured logs, metrics, health endpoints |
| **Security** | All external input hostile; validate LLM output against schemas |
| **Brutal testing** | Adversarial inputs, chaos, load, failure injection |

---

## 9. TESTING REQUIREMENTS

| Tier | Scope |
|------|-------|
| **Unit** | Every pure function, transformer, validator |
| **Integration** | Adapter → normalizer → store; API → store; worker → store |
| **Contract** | Adapter schemas, API OpenAPI spec |
| **E2E** | Ingest → analyze → API → dashboard |
| **Regression** | Every bug = permanent test |
| **Load** | Normal, peak, stress, soak (define targets first) |
| **Chaos** | DB down, queue down, adapter down, model down, network latency, OOM, disk full |
| **Security** | Injection, XSS, SSRF, authz bypass, rate limit abuse, prompt injection |
| **AI Eval** | Labeled eval sets per language; precision/recall/F1/calibration; drift monitoring |

**Adversarial test categories (every component):**
```
empty/null/missing/extra/wrong-type fields
huge strings, Unicode, emoji, mixed languages, malformed UTF-8
duplicates, out-of-order, future/past timestamps
negative numbers, overflow, NaN/infinity
malicious HTML/SQL/shell/URL strings
timeouts, connection resets, partial responses, rate limits
worker crashes, DB failures, model failures
```

**Invariants to verify:**
- Idempotency, determinism, conservation, no phantom relationships, valid percentages, non-negative counts, pagination correctness, timestamp ordering

---

## 10. AI / MODEL SPECIFICS

| Aspect | Requirement |
|--------|-------------|
| **Versioning** | Every model + prompt + preprocessing versioned; stored with every prediction |
| **Evaluation** | Held-out test sets per language; track macro-F1, calibration, latency, failure rate |
| **Drift** | Monitor performance by language, time, topic, platform, length; alert on delta |
| **Bias** | No demographic fairness claims without measurement |
| **LLM Safety** | Never execute LLM output; validate against JSON schema; sanitize context; filter output |
| **Reproducibility** | Record: dataset/window, model, version, prompt, preprocessing, config, algorithm, params, timestamp |

---

## 11. CONFIGURATION & SECRETS

```yaml
# config.yaml (committed)
app:
  environment: development|testing|staging|production
  log_level: INFO
  api_port: 8000

database:
  host: ${DB_HOST}
  port: 5432
  name: ${DB_NAME}
  # credentials via env only

redis:
  host: ${REDIS_HOST}
  port: 6379

adapters:
  x:
    bearer_token: ${X_BEARER_TOKEN}      # NEVER in config.yaml
    rate_limit_rpm: 300
  telegram:
    bot_token: ${TELEGRAM_BOT_TOKEN}
    api_id: ${TG_API_ID}
    api_hash: ${TG_API_HASH}

models:
  sentiment:
    name: "xlm-roberta-sentiment"
    version: "v3.1"
    endpoint: ${SENTIMENT_MODEL_ENDPOINT}
  demographic:
    name: "demographic-inference"
    version: "v1.0"
```

**Secrets:** `.env` (gitignored) or secret manager. **Never** in code, logs, Docker images, frontend.

---

## 12. DEVELOPMENT WORKFLOW (Per SOUL.md §41)

```
For EVERY task:
  1. UNDERSTAND → inspect repo, arch, deps, config, tests, docs
  2. PLAN → affected components, data flow, API/DB impact, security, tests needed
  3. IMPLEMENT MINIMALLY → smallest clean change
  4. TEST AGGRESSIVELY → targeted → broad suite
  5. ATTACK → How fails? Abused? Missing data? Dependency gone? 10x traffic? Model wrong?
  6. DOCUMENT → update relevant docs
  7. VERIFY → impl + tests agree
```

**CI/CD Gate (must pass):**
- lint, type-check, unit tests, integration tests, security checks, migration checks, build
- Critical: coverage threshold, contract tests, regression tests

---

## 13. DEFINITION OF DONE (Per SOUL.md §40)

A feature is **DONE** only when:
- [ ] Implementation exists
- [ ] API/schema documented
- [ ] Tests exist (unit + integration + failure cases)
- [ ] Security implications reviewed
- [ ] Logs/metrics where appropriate
- [ ] Errors handled (no bare `except:`)
- [ ] Migration if schema changes
- [ ] Configuration externalized
- [ ] Documentation updated
- [ ] No secrets committed
- [ ] Lint/type checks pass
- [ ] Relevant integration tests pass

---

## 14. KNOWN LIMITATIONS & PROTOTYPE FLAGS

| Area | Current State | Production Need |
|------|---------------|-----------------|
| X API | Essential access tier (rate limited) | Elevated/Enterprise tier |
| Telegram | Bot API (no channel history) | MTProto for full history |
| Sentiment | Base multilingual model | Fine-tuned on Gujarati/Hindi/English code-switched |
| Demographics | Heuristic/rule-based | Trained inference model with calibrated confidence |
| Network | Static snapshot | Temporal graph evolution |
| Dashboard | Polling-based | WebSocket/push for real-time |

**Mark prototype code with:**
```python
# PROTOTYPE LIMITATION
# Current: ...
# Production: ...
# Risk: ...
```

---

## 15. FILE STRUCTURE (Target)

```
social-analytics/
├── docker-compose.yml
├── config.yaml
├── .env.example
├── SOUL.md
├── BRAIN.md
├── DECISIONS.md
├── README.md
├── adapters/
│   ├── __init__.py
│   ├── base.py
│   ├── x_adapter.py
│   ├── telegram_adapter.py
│   └── registry.py
├── ingestion/
│   ├── normalizer.py
│   ├── validator.py
│   ├── deduplicator.py
│   └── pipeline.py
├── analytics/
│   ├── sentiment/
│   │   ├── engine.py
│   │   ├── models.py
│   │   └── evaluation.py
│   ├── demographics/
│   │   ├── profiler.py
│   │   └── signals.py
│   ├── trends/
│   │   ├── detector.py
│   │   ├── clustering.py
│   │   └── metrics.py
│   └── network/
│       ├── graph_builder.py
│       ├── centrality.py
│       ├── communities.py
│       └── propagation.py
├── storage/
│   ├── models.py          # SQLAlchemy / asyncpg
│   ├── migrations/        # Alembic
│   └── repositories.py
├── api/
│   ├── routes/
│   │   ├── events.py
│   │   ├── sentiment.py
│   │   ├── demographics.py
│   │   ├── trends.py
│   │   └── network.py
│   ├── schemas.py         # Pydantic request/response
│   ├── deps.py            # Auth, DB, rate limit
│   └── main.py
├── dashboard/
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── vite.config.ts
├── workers/
│   ├── sentiment_worker.py
│   ├── trends_worker.py
│   └── network_worker.py
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── e2e/
│   ├── load/
│   ├── chaos/
│   ├── security/
│   └── fixtures/
└── scripts/
    ├── backfill.py
    ├── replay.py
    └── eval_models.py
```

---

## 16. AGENT INSTRUCTIONS

**When working on this project:**

1. **Read SOUL.md first** — it's the constitution
2. **Read this BRAIN.md** — it's the technical spec
3. **Check DECISIONS.md** — for prior architectural decisions
4. **Follow the workflow (§12)** — understand → plan → implement → test → attack → document → verify
5. **Never skip tests** — if a test fails, fix the code, not the test
6. **Never hardcode secrets** — use `${ENV_VAR}` pattern
7. **Never fake data** — label synthetic explicitly
8. **Prefer explicit over clever** — maintainable at 2am
9. **Vertical slices** — end-to-end before breadth
10. **Log decisions** — append to DECISIONS.md with date, context, tradeoffs

**Common commands:**
```bash
# Start dev stack
docker compose up -d

# Run tests
pytest tests/ -v --tb=short

# Type check
mypy .

# Lint
ruff check .

# Run single adapter test
pytest tests/integration/test_x_adapter.py -v

# Backfill historical data
python scripts/backfill.py --platform x --since 2026-01-01 --until 2026-01-31
```

---

## 17. DECISION LOG (Append to DECISIONS.md)

| Date | Decision | Rationale | Tradeoffs |
|------|----------|-----------|-----------|
| 2026-01-16 | PostgreSQL + TimescaleDB for analytics store | Time-series native, PostGIS for geo, ACID | More complex than pure TimescaleDB |
| 2026-01-16 | Redis Streams for event bus | Simpler than Kafka, sufficient for hackathon scale | Less durable than Kafka |
| 2026-01-16 | XLM-RoBERTa base for sentiment | Multilingual, handles code-switching | Needs fine-tuning for Indian languages |
| 2026-01-16 | Aggregate-only demographics | Privacy compliance, ethical | Less granular than per-user |

---

**End of BRAIN.md** — This file is the single source of truth for coding agents. Update it when architecture changes.