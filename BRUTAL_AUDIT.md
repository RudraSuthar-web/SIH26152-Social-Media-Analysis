# BRUTAL_AUDIT.md — Full System Audit for 10/10
## PS 26152 — SIH 2026 (NTRO) | Social Media Analytics Framework
### No mercy. No fluff. Only what must die and what must be built.

**Last Updated:** 2026-09-18
**Auditor:** Autonomous Engineering Agent
**Scope:** Frontend + Backend + Infrastructure + Documentation + Process

---

## 🎯 EXECUTIVE SCORE: 4.0 / 10

| Dimension | Score | Why |
|-----------|-------|-----|
| **SOUL.md Compliance** | 2/10 | Fake data everywhere; pseudonymity leaks; vanity metrics; no traceability |
| **Architecture** | 4/10 | Designed on paper; 80% not implemented; leaky abstractions; no contracts |
| **Backend Implementation** | 3/10 | Skeleton only; 5% core logic (DB done); adapters missing; pipeline missing; workers missing |
| **Frontend Implementation** | 5/10 | Pretty UI; fake data; no backend integration; architecture leaks |
| **Infrastructure** | 8/10 | Docker Compose works; TimescaleDB + Redis healthy; secrets managed; **DB migrated** |
| **Data Integrity** | 1/10 | Hardcoded mocks presented as live; no traceability; no provenance |
| **Testing & Observability** | 2/10 | Structlog/Prometheus configured but unused; 0 tests |
| **Production Readiness** | 2/10 | Far from deployable; no CI/CD; no runbooks; no chaos testing |
| **Documentation** | 8/10 | Excellent design docs; zero operational docs |

**OVERALL: 4.0/10 — "Database is live. Infrastructure solid. Code still missing."**

---

## 💀 PART 1: KILL THESE — ENTIRE SYSTEM

### 1.1 Frontend: Vanity Metric Cancer (Already Documented)
**DELETE:** `PlatformKpiMetrics`, Reddit/YouTube/Instagram from Overview, `trend.category`, `CommunityCluster.name`, `NetworkNode.handle`/`display_name`, hardcoded `defaultEmotions`, hardcoded "HEALTHY", Formula modal duplication, `mockSystemMetrics.adapter_count_healthy: 4`.

### 1.2 Backend: Fake Intelligence in Config & Mocks
**Files:** `backend/config.yaml`, `backend/app/adapters/*.py` (if they exist with mocks), any `mockData.py` in backend.

**KILL:**
- Any `mock_data` or `fake_events` in backend code
- Any adapter returning hardcoded events
- Any "synthetic_ratio" that mixes fake with real without explicit `data_source` tag
- Any `PlatformKpiMetrics`-equivalent in backend schemas

**SOUL.md §1.2:** *"Never invent posts, users, engagement counts, demographic attributes, sentiment labels, influencers, relationships, API responses, model confidence, trend statistics."*

### 1.3 Architecture: Leaky Abstractions
**KILL:**
- `useSynthetic` in frontend (move to backend ENV)
- `synthetic_ratio` in adapter config (backend decides data source)
- Any frontend knowledge of data source (frontend only reads `meta.data_source`)
- Any `any` types in API layer
- Any mock data in `src/` (move to `tests/fixtures/` only)

### 1.4 Data: Untraceable Outputs
**KILL:**
- Any analytics output without `request_id`, `timestamp`, `data_source`, `model_version`, `processing_version`
- Any sentiment without `model_name`, `model_version`, `confidence`, `sarcasm_uncertain`
- Any trend without documented formula components
- Any network edge without `provenance` (`observed` | `inferred`)
- Any demographic without `confidence_label` + `confidence_intervals`

---

## 🏗️ PART 2: BUILD THESE — BACKEND (PRIORITY ORDER)

### 2.1 Database Migrations (BLOCKER) ✅ **DONE**
**File:** `backend/alembic/versions/*.py`
**Status:** ✅ **COMPLETE** — 11 tables created in PostgreSQL
**Action:** ✅ Executed
```bash
cd backend && alembic upgrade head
```
**Verify:** 11 tables created (hypertable + indexes)
```bash
docker compose exec postgres psql -U analytics -d social_analytics -c "\dt"
```
**Tables created:** canonical_events, sentiment_results, trend_windows, network_nodes, network_edges, community_assignments, demographic_aggregates, dead_letter_events, adapter_health, model_health, alembic_version

### 2.2 Adapter Layer (CORE)
**Files to CREATE:**
```
backend/app/adapters/
├── __init__.py
├── base.py              # Abstract base + RawPlatformEvent + errors
├── x_adapter.py         # TwitterAPI.io + Official + Synthetic
├── telegram_adapter.py  # MTProto (Telethon)
└── registry.py          # Discovery + health + lifecycle
```

**Each Adapter MUST implement:**
```python
async def fetch_events(since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]
async def health_check() -> dict  # {status, provider, error?, lag_seconds?}
```

**X Adapter:** TwitterAPI.io (primary), Official (fallback), Synthetic (explicit `data_source`)
**Telegram Adapter:** MTProto only (Bot API = real-time only, no history)

### 2.3 Ingestion Pipeline (CORE)
**Files to CREATE:**
```
backend/app/ingestion/
├── __init__.py
├── normalizer.py        # RawPlatformEvent → CanonicalEvent (Pydantic)
├── validator.py         # Schema + business rules (timestamps, IDs, lengths)
├── deduplicator.py      # Redis SET + DB unique constraint (platform, source_id)
├── pipeline.py          # Orchestrates: fetch → validate → normalize → dedupe → Redis Stream
├── dead_letter.py       # Quarantine invalid events → dead_letter_events table
└── scheduler.py         # APScheduler cron triggers
```

**Redis Stream:** `events:raw` with consumer groups: `sentiment`, `trends`, `network`, `demographics`

### 2.4 Canonical Event Model (CORE)
**File:** `backend/app/models/events.py` (SQLAlchemy)
**Table:** `canonical_events` (TimescaleDB hypertable on `event_timestamp`)
**Required Fields:** All from SOUL.md §3 + `data_source` + `schema_version`

### 2.5 API Contracts (CORE)
**File:** `backend/app/schemas/common.py`
```python
class ApiMeta(BaseModel):
    request_id: str
    timestamp: datetime
    data_source: Literal["live", "synthetic", "replay", "degraded", "offline"]
    window: Optional[TimeWindow]
    model_version: Optional[str]
    processing_version: Optional[str]

class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: ApiMeta
    error: Optional[ErrorDetail]
```
**ALL endpoints return this. No exceptions.**

### 2.6 API Routes (CORE)
**Files to CREATE:**
```
backend/app/api/routes/
├── __init__.py
├── events.py            # GET /events, GET /events/{id}
├── sentiment.py         # GET /sentiment/timeline, /emotions, /events, /confidence-histogram, /sarcasm-scatter, /language-heatmap
├── trends.py            # GET /trends, /trends/{id}, /trends/{id}/formula, /trends/lifecycle, /trends/coordination-scatter
├── network.py           # GET /network/graph, /network/kol, /network/communities, /network/centrality-distribution, /network/edge-sankey, /network/propagation, /network/propagation-speed
├── demographics.py      # GET /demographics, /demographics/geography
├── health.py            # GET /health, /ready
├── admin.py             # GET /admin/ingestion/status, POST /admin/ingestion/trigger, GET /admin/adapters, PATCH /admin/adapters/{platform}, GET /admin/models/status, GET /admin/models/evaluation, GET /admin/dlq, POST /admin/dlq/{id}/replay, POST /admin/dlq/replay-batch
└── websocket.py         # WS /ws with topics: ingestion.health, trends.new, model.health
```

### 2.7 Analytics Workers (CORE)
**Files to CREATE:**
```
backend/app/workers/
├── __init__.py
├── base_worker.py       # Health, metrics, graceful shutdown, Redis consumer
├── sentiment_worker.py  # ONNX inference → sentiment_results
├── trends_worker.py     # Windowed aggregation → trend_windows
├── network_worker.py    # Graph build → centrality → communities → propagation
├── demographics_worker.py # Periodic aggregate → demographic_aggregates
└── scheduler.py         # APScheduler triggers
```

**Sentiment Worker:** ONNX Runtime (CUDAExecutionProvider), batch=32, max_length=512
**Trends Worker:** 5m/1h/24h windows, documented formula, clustering
**Network Worker:** 24h window, Leiden communities, PageRank, betweenness, propagation cascades
**Demographics Worker:** 24h window, heuristic v1, confidence intervals

### 2.8 ONNX Sentiment Model (CORE)
**File:** `backend/models/xlm-roberta-sentiment-v3.1.onnx`
**Steps:**
1. Download `cardiffnlp/twitter-xlm-roberta-base-sentiment`
2. Export to ONNX with emotion heads (7 emotions + sentiment)
3. Quantize INT8
4. Place at `backend/models/xlm-roberta-sentiment-v3.1.onnx`
5. Config: `SENTIMENT_MODEL_PATH=./models/xlm-roberta-sentiment-v3.1.onnx`

### 2.9 Response Envelope Enforcement
**Middleware:** `backend/app/middleware.py`
- Inject `request_id` (UUID v4) per request
- Wrap all responses in `ApiResponse<T>`
- Add `meta.data_source` from ENV/backend logic
- Structured logging with `request_id`, `event_id`, `operation`, `duration_ms`

---

## 🎨 PART 3: BUILD THESE — FRONTEND (AFTER BACKEND CONTRACTS)

### 3.1 Architecture Fixes (FIRST)
- Remove `useSynthetic` from `AnalyticsContext` → backend owns data source
- `ApiResponse<T>` envelope on all API calls
- `DataSourceBadge` reads `response.meta.data_source`
- Error boundaries + Suspense on all pages
- WebSocket hook with reconnect + fallback polling
- Request ID generation + propagation

### 3.2 Overview Page Redesign
**Data:** `OverviewMetrics` (total_events_24h, active_accounts_24h, trending_topics_count, sentiment_distribution, adapter_health)
**No vanity KPIs. No 5-platform grid. Only X + Telegram.**

### 3.3 Sentiment Page — Auditability
- AreaChart: stacked pos/neg/neu + sarcasm overlay
- EmotionRadar: from `/sentiment/emotions`
- Event Table: platform, language, original_text, translation, sentiment, confidence, sarcasm_flag, model_version, event_timestamp, data_source
- Copy event_id → clipboard
- Filter bar: platform, language, sentiment, sarcasm_flag, date range

### 3.4 Trends Page — Math Transparency
- Scatter: X=log(Volume), Y=Growth, Size=Velocity, Color=TrendScore, Shape=coordinated_pattern
- Table: Topic, Volume, Growth%, Velocity, TrendScore, Pattern, Platforms, Languages, Components (expandable)
- Formula Inspector: INLINE with actual computed values per topic
- Coordinated pattern = tooltip explaining detection (burst velocity + user/volume ratio + copy-paste similarity)

### 3.5 Network Page — Pseudonymity & Provenance
- Cytoscape.js: node size=PageRank, edge color=provenance (solid/dashed), community hulls
- No labels by default; hover for node_id (truncated)
- KOL Table: node_id, PageRank, Betweenness, Degree, Community, Post Count, Window, Method
- Node Modal: only pseudonymized metrics + provenance breakdown
- Propagation Tab: cascade tree for topic/event

### 3.6 Demographics Page — Confidence Transparency
- BarCharts with confidence intervals (error bars)
- Leaflet choropleth map for geography
- Methodology modal from `methodology_notes`
- Only show age brackets if confidence ≠ uncertain

### 3.7 Data Quality Page — Operational Excellence
- Adapter sparklines (lag 24h), rate limit burn projection
- Model latency percentiles (p50/p95/p99) + drift alert
- DLQ grouped by error_code, replay all per group, root cause field
- System status: computed from adapter/model health

### 3.8 Missing Pages
- `/propagation` — cascade tree (Sankey/indented)
- `/evaluation` — confusion matrices, calibration, drift timeline, version compare
- `/admin/adapters` — enable/disable, rate limits, backfill trigger, raw API debug

---

## 🔧 PART 4: INFRASTRUCTURE & OPERATIONS

### 4.1 CI/CD Pipeline
**File:** `.github/workflows/ci.yml`
- Lint (ruff), type-check (mypy), test (pytest), build (Docker)
- Security: bandit, safety, trivy
- Contract tests: schemathesis against OpenAPI
- Visual regression: Chromatic/Percy

### 4.2 Testing (SOUL.md §26-35)
| Tier | Target |
|------|--------|
| Unit | 90%+ on pure logic (normalizer, validator, metrics, graph) |
| Integration | All adapter→pipeline→store paths |
| Contract | Adapter schemas, API OpenAPI spec |
| E2E | Playwright: ingest → analyze → dashboard |
| Load | Locust: 10k events/min sustained, 50k burst |
| Chaos | Kill DB/Redis/adapter/model/worker → verify recovery |
| Security | OWASP Top 10 + LLM-specific |

### 4.3 Observability Stack
- **Logs:** structlog JSON → Loki → Grafana
- **Metrics:** Prometheus → Grafana (dashboards for ingestion, processing, API, models, DB, Redis)
- **Traces:** OpenTelemetry (optional)
- **Alerts:** Adapter down >5m, queue lag >10m, error rate >5%, disk >80%

### 4.4 Runbooks (Operational Docs)
- `docs/runbooks/ingestion_failure.md`
- `docs/runbooks/model_drift.md`
- `docs/runbooks/dlq_replay.md`
- `docs/runbooks/adapter_outage.md`
- `docs/runbooks/database_failover.md`

---

## 📋 PART 5: DEFINITION OF DONE FOR 10/10

### Ingestion Working
- [ ] `alembic upgrade head` succeeds
- [ ] `POST /admin/ingestion/trigger` returns `job_id`
- [ ] `GET /events?platform=x&limit=10` returns 10 events with `data_source: "live"`
- [ ] `GET /events?platform=telegram&limit=10` returns 10 events with `data_source: "live"`
- [ ] `GET /admin/ingestion/status` shows both adapters `healthy`

### Analytics Working
- [ ] Sentiment worker processes events → `sentiment_results` populated
- [ ] Trends worker computes windows → `trend_windows` populated
- [ ] Network worker builds graph → `network_nodes/edges/communities` populated
- [ ] Demographics worker aggregates → `demographic_aggregates` populated

### Dashboard Connected
- [ ] Overview shows real event counts
- [ ] Sentiment timeline/emotions from API
- [ ] Trends scatter/table from API
- [ ] Network graph from API
- [ ] Demographics from API
- [ ] Data quality from API
- [ ] WebSocket updates on Overview/Trends/DataQuality

### Quality Gates
- [ ] Zero hardcoded mock data in `src/`
- [ ] All responses have `meta.data_source`, `meta.request_id`, `meta.timestamp`
- [ ] All sentiment has `model_name`, `model_version`, `confidence`, `sarcasm_uncertain`
- [ ] All trends have `components` with documented formula
- [ ] All network edges have `provenance`
- [ ] All demographics have `confidence_label` + `confidence_intervals`
- [ ] Unit tests >90% on pure logic
- [ ] Integration tests pass
- [ ] Contract tests pass
- [ ] Load test: 10k events/min
- [ ] Chaos test: kill any component → graceful degradation
- [ ] Security scan clean

---

## 📋 PART 6: EXECUTION ORDER (VERTICAL SLICES)

| Slice | Deliverable | Est. Time | Dependencies |
|-------|-------------|-----------|--------------|
| **0. Foundation** | Tables, Alembic, Base Adapter, Pipeline Skeleton | 4h | DB running |
| **1. X Adapter** | TwitterAPI.io + Official + Synthetic → events:raw | 6h | Foundation |
| **2. Telegram Adapter** | MTProto → events:raw | 4h | Foundation |
| **3. Ingestion Pipeline** | Normalize → Validate → Dedupe → Queue → Store | 6h | Adapters |
| **4. API Contracts** | ApiResponse<T>, Routes: events, health, admin | 4h | Pipeline |
| **5. Sentiment Worker** | ONNX model + worker → sentiment_results | 8h | Pipeline, Model |
| **6. Trends Worker** | Windows + formula → trend_windows | 6h | Pipeline |
| **7. Network Worker** | Graph + centrality + communities + propagation | 8h | Pipeline |
| **8. Demographics Worker** | Heuristic aggregates → demographic_aggregates | 4h | Pipeline |
| **9. Frontend Contracts** | ApiResponse<T>, remove useSynthetic, WS, ErrorBoundary | 6h | API |
| **10. Dashboard Pages** | Overview, Sentiment, Trends, Network, Demographics, Quality | 12h | Frontend Contracts |
| **11. Missing Pages** | Propagation, Evaluation, Adapter Admin | 6h | Dashboard |
| **12. Hardening** | Tests, CI, Docs, Runbooks, Chaos, Load | 16h | All |

**Total: ~88 hours (2.5 focused engineer-weeks)**

---

## 🎯 FINAL VERDICT

### Current State: **3.5/10**
- **Documentation:** 8/10 (World-class design docs)
- **Infrastructure:** 7/10 (Docker, TimescaleDB, Redis, secrets)
- **Backend Code:** 2/10 (Skeleton only; 0% core logic)
- **Frontend Code:** 5/10 (Pretty UI; fake data; architecture leaks)
- **Integration:** 1/10 (None)
- **Testing:** 2/10 (Config only; 0 tests)
- **Operations:** 2/10 (No CI/CD, no runbooks)

### The Hard Truth
> **You have a world-class specification for a system that doesn't exist.**

The documentation (`SOUL.md`, `BRAIN.md`, `PROPOSED_SOLUTION.md`, `BACKEND_IMPLEMENTATION.md`, `BRUTAL_AUDIT.md`, `CHART_EXPANSION.md`, `IN_PROGRESS.md`, `NEXT_STEPS.md`) is **better than most production systems**. But the code is **<10% implemented**.

### The Path to 10/10
1. **Stop writing docs. Start writing code.**
2. **Run `alembic upgrade head` NOW.** (Unblocks everything)
3. **Build adapters → pipeline → API → workers → dashboard** in that order.
4. **Vertical slices only.** Each slice = end-to-end working feature.
5. **No mock data in `src/`.** Ever. `data_source` on every response.
6. **Test brutally.** Chaos, load, contract, security.

### Estimated Effort to Demo-Ready
| Scenario | Time |
|----------|------|
| Solo, focused | 3-4 weeks |
| Solo, part-time | 6-8 weeks |
| 2 engineers | 2 weeks |

**The hackathon is in ~2 weeks.** You need ~88 hours of focused coding. That's **6+ hours/day every day**.

**Your call. The spec is ready. The infrastructure is ready. The code is not.**

---

*This audit is brutal because the stakes are real. NTRO evaluates working systems, not beautiful docs.*