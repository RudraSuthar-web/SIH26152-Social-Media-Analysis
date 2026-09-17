# BRUTAL_AUDIT.md — Dashboard & Architecture Changes for 10/10
## PS 26152 — SIH 2026 (NTRO)
### No mercy. No fluff. Only what must die and what must be built.

---

## 🎯 SCORE BREAKDOWN: WHY 5.5/10

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| **SOUL.md Compliance** | 4/10 | 10/10 | Fake data, fabricated categories, pseudonymity leaks |
| **Architecture** | 7/10 | 10/10 | Leaky abstractions, `useSynthetic` in UI, no error boundaries |
| **UI/UX** | 7/10 | 10/10 | Vanity metrics, missing states, no keyboard nav, no a11y |
| **Data Integrity** | 3/10 | 10/10 | Hardcoded mocks presented as live |
| **Production Readiness** | 4/10 | 10/10 | No resilience, no observability in UI, brittle |

**To hit 10/10: Every SOUL.md § must be visibly, testably implemented in the dashboard.**

---

## 💀 PART 1: KILL THESE (DELETE ENTIRELY)

### 1.1 `PlatformKpiMetrics` — The Vanity Metric Cancer
**Files:** `types/index.ts`, `services/api.ts`, `services/mockData.ts`, `pages/OverviewPage.tsx`, `components/common/MetricCard.tsx` (if used for this)

**DELETE.** SOUL.md §21 Overview requires:
- `total_events` ✓
- `active_users/accounts` ✓
- `trending_topics` ✓
- `sentiment_distribution` ✓
- `ingestion_health` ✓

**It does NOT require:** followers, impressions, engagement rate, interactions — these are **platform-native vanity metrics**, not analytics outputs. Showing them implies the system *produces* them. It doesn't. It *ingests* events.

### 1.2 Reddit/YouTube/Instagram from Overview
**File:** `mockData.ts:53-107`, `OverviewPage.tsx:22-102`

**DELETE.** Only X & Telegram are **Essential** (SOUL.md §2). The rest are Desirable/Bonus. Showing 5 platforms with equal weight = **fake intelligence** (SOUL.md §1.2 violation).

### 1.3 `trend.category` Field
**Files:** `types/index.ts` (`TrendTopic`), `mockData.ts:352,360,368,376`, `pages/TrendsPage.tsx:96,111`

**DELETE.** SOUL.md §10 requires: keyword freq, hashtag freq, topic clustering, growth, velocity, momentum, trend_score. **No taxonomy.** "Cyber Intelligence", "AI & Machine Learning" are fabricated labels with no source.

### 1.4 `CommunityCluster.name` Field
**Files:** `types/index.ts` (`CommunityCluster`), `mockData.ts:464,472,480`, `components/network/CommunityPanel.tsx`

**DELETE.** SOUL.md §16: *"Do not assign real-world ideological or political identities to communities without strong evidence and explicit methodology."* Names like "Institutional Cyber Defense & NTRO" are **fabricated identities**. Only `community_id`, `node_count`, `modularity`, `topic_distribution`, `algorithm`, `window` are allowed.

### 1.5 `NetworkNode.handle` & `display_name`
**Files:** `types/index.ts` (`NetworkNode`), `mockData.ts:444-449`, `pages/NetworkPage.tsx:93-102`

**DELETE.** SOUL.md §13: *"Use pseudonymous internal identifiers."* Exposing `@NTRO_SecurityHQ` defeats pseudonymity. The dashboard must show **only** `node_id` (or truncated hash) + centrality metrics. If analysts need real handles, that's a separate privileged workflow — not the default view.

### 1.6 `mockSystemMetrics.adapter_count_healthy: 4`
**File:** `mockData.ts:118-119`

**DELETE.** Only 2 adapters exist (X, Telegram). Claiming 4 = **fake intelligence** (SOUL.md §1.2).

### 1.7 Hardcoded `defaultEmotions` in SentimentPage
**File:** `pages/SentimentPage.tsx:20-28`

**DELETE.** Static mock data rendered instead of API-driven `EmotionBreakdown`. No `data_source` badge on radar = **fake intelligence**.

### 1.8 `DataQualityPage` Hardcoded "HEALTHY"
**File:** `pages/DataQualityPage.tsx:37`

**DELETE.** Must compute from `adapters.every(a => a.status === 'healthy') && models.every(m => m.error_rate_pct < 1)`.

### 1.9 `VelocityScatter` Formula Button → Modal Duplication
**File:** `pages/TrendsPage.tsx:34-39`, `141-183`

**DELETE MODAL.** Formula is already inline (lines 65-81). Button opens same info = UX debt.

---

## 🏗️ PART 2: ARCHITECTURE CHANGES (NON-NEGOTIABLE)

### 2.1 Move `useSynthetic` Out of UI — Server-Side Only
**Current:** Every page calls `apiService.getX(useSynthetic)` → UI knows about synthetic/live.

**Required:** 
```
Frontend                    Backend
    │                          │
    ├─ GET /api/v1/sentiment ─▶│
    │                          ├─ Reads ENV: DATA_SOURCE=live|synthetic|replay
    │                          ├─ Executes query
    │                          ├─ Adds `data_source` to response
    │                          ▼
    ◀──── {data: [...], data_source: "live", request_id: "..."} ──┤
    │
    ├─ Shows DataSourceBadge from response.data_source
    ▼
```

**Files to change:**
- `services/api.ts` — remove `useSynthetic` param from all methods
- `context/AnalyticsContext.tsx` — remove `useSynthetic`, keep only `timeRange`, `selectedPlatform`
- All pages — remove `useSynthetic` from `useEffect` deps
- Backend (not in repo yet) — add `data_source` to every response envelope

### 2.2 Response Envelope Standard (SOUL.md §20, §22)
**Every API response must be:**
```typescript
interface ApiResponse<T> {
  data: T;
  meta: {
    request_id: string;
    timestamp: string;           // ISO 8601 UTC
    data_source: 'live' | 'synthetic' | 'replay' | 'degraded' | 'offline';
    window?: { since: string; until: string };
    model_version?: string;      // for AI-derived data
    processing_version?: string;
  };
  error?: { code: string; message: string };
}
```

**Frontend:** `services/api.ts` interceptors unwrap `response.data.data`, pass `response.data.meta` to components via context or props.

### 2.3 Error Boundaries + Loading/Empty States (SOUL.md §31)
**Current:** Pages return `null` on empty → layout breaks.

**Required:** Every page wrapped in:
```tsx
<ErrorBoundary fallback={<PageError />}>
  <Suspense fallback={<PageSkeleton />}>
    <PageContent />
  </Suspense>
</ErrorBoundary>
```

**Components needed:**
- `PageSkeleton` — shimmer for each widget (already have `LoadingSkeleton`, compose it)
- `PageError` — shows error.meta.message, retry button, request_id for support
- `EmptyState` — "No data for selected window. Adjust filters or check ingestion health."

### 2.4 WebSocket for Real-Time (SOUL.md §21, §23)
**Current:** Polling via `useEffect` + `useSynthetic` changes.

**Required:** 
- `/api/v1/ws` WebSocket endpoint (backend)
- `hooks/useWebSocket.ts` — auto-reconnect, subscribe to topics: `ingestion.health`, `trends.new`, `model.health`
- `OverviewPage`, `TrendsPage`, `DataQualityPage` — subscribe, update local state optimistically
- Fallback to polling if WS fails (graceful degradation)

### 2.5 Request ID Propagation (SOUL.md §20, §23)
**Current:** Missing.

**Required:** 
- `services/api.ts` — generate `x-request-id` header per request (UUID v4)
- Backend — echo in response meta, include in all logs
- UI — show `request_id` in error modals, copy-to-clipboard for debugging

### 2.6 Type-Safe API Contracts (SOUL.md §32)
**Current:** `api.ts` returns `Promise<any>` or loose types.

**Required:** 
- Generate TypeScript types from OpenAPI spec (`openapi-typescript`)
- Or: define `ApiResponse<T>` + endpoint-specific `T` in `types/api.ts`
- `apiService.getTrends()` → `Promise<ApiResponse<TrendTopic[]>>`
- Compile-time guarantee: if backend changes, frontend breaks at build

---

## 🎨 PART 3: UI/UX CHANGES (BRUTAL STANDARD)

### 3.1 Overview Page — Complete Redesign
**Current:** 5-platform KPI grid (fake), MultiLineChart, DonutChart.

**Required (SOUL.md §21):**

```
┌─────────────────────────────────────────────────────────────────┐
│ OVERVIEW                                                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│ │ Events   │ │ Accounts │ │ Trends   │ │ Ingestion Health   │  │
│ │ 24h      │ │ Active   │ │ Rising   │ │ X: ●  Telegram: ●  │  │
│ │ 148,290  │ │ 18,450   │ │ 12       │ │ Reddit: ○  YT: ○   │  │
│ │ +12.3%   │ │          │ │          │ │ IG: ○  FB: ○       │  │
│ └──────────┘ └──────────┘ └──────────┘ └────────────────────┘  │
├────────────────────────────────┬────────────────────────────────┤
│ SENTIMENT SPARKLINE (6h)       │ TOP 5 TRENDS                  │
│ ▁▂▃▅▆▇█▇▆▅▃▂▁  Pos/Neg/Neu     │ 1. NTRO AI Framework    94.6 │
│                                │ 2. Multilingual Sarcasm   82.3 │
│                                │ 3. Leiden Communities     71.8 │
│                                │ 4. ⚠ BOT BURST #CyberSec  88.9 │
│                                │ 5. PostGIS Integration    45.2 │
└────────────────────────────────┴────────────────────────────────┘
```

**Data needed from API:**
```typescript
interface OverviewMetrics {
  total_events_24h: number;
  events_trend_pct: number;
  active_accounts_24h: number;
  trending_topics_count: number;
  sentiment_distribution: { positive: number; negative: number; neutral: number };
  adapter_health: Record<string, 'healthy' | 'degraded' | 'down'>;
}
```

### 3.2 Sentiment Page — Auditability First
**Current:** AreaChart + EmotionRadar (hardcoded) + Event cards.

**Required:**
- **AreaChart:** Stacked positive/negative/neutral + sarcasm flagged overlay (SOUL.md §9)
- **EmotionRadar:** Driven by `apiService.getEmotionAggregate(window)` — not hardcoded
- **Event Inspector:** Table with columns: `platform`, `language`, `original_text`, `translation`, `sentiment`, `confidence`, `sarcasm_flag`, `model_version`, `event_timestamp`, `data_source`
- **Copy-to-clipboard** on event_id for traceability (SOUL.md §22)
- **Filter bar:** platform, language, sentiment, sarcasm_flag, date range

### 3.3 Demographics Page — Confidence Transparency
**Current:** 4 BarCharts, confidence label + sample size.

**Required (SOUL.md §12):**
- Every bar shows **confidence interval** (error bars) — not just point estimate
- `confidence_label` must be: `estimated` | `inferred` | `uncertain` — no other values
- **Methodology toggle:** "How was this inferred?" → modal showing signals used (bio keywords, posting hours, language, follows ratio)
- **Geography:** Use Leaflet map (not BarChart) — SOUL.md §21 mentions "aggregate geography"
- **Age brackets:** Only show if `confidence_label !== 'uncertain'`

### 3.4 Trends Page — Math Transparency
**Current:** VelocityScatter + Table + Formula box + Modal (duplicate).

**Required:**
- **Scatter:** X=log(Volume), Y=Growth Rate, Size=Velocity, Color=Trend Score, Shape=coordinated_pattern (⚠)
- **Table:** Columns = Topic, Volume, Growth%, Velocity, Trend Score, Pattern, Platforms, Languages, **Components** (expandable: volume_score, growth_rate, velocity, decay)
- **Formula Inspector:** Inline, not modal. Show **actual computed values** for selected topic:
  ```
  Topic: NTRO AI Framework
  Volume: 24,890 → log(V+1) = 10.12
  Prev Volume: 5,632 → Growth = +342%
  Prev Growth: +120% → Velocity = +222%
  Hours since peak: 1.2 → Decay = 0.95
  TrendScore = 10.12 × 4.42 × 3.22 × 0.95 = 137.8
  ```
- **Coordinated pattern:** Tooltip explaining detection method (burst velocity + user/volume ratio + copy-paste similarity) — **not** "BOT BURST" label (SOUL.md §11: *"Do not automatically classify coordination as malicious intent. Report observable patterns, not unsupported motives."*)

### 3.5 Network Page — Pseudonymity & Provenance
**Current:** Graph + Communities + KOL Table + Node modal with handle/name.

**Required:**
- **Graph:** Cytoscape.js with:
  - Node size = PageRank (configurable: degree, betweenness)
  - Edge color = provenance: `observed` (solid) vs `inferred` (dashed) — SOUL.md §14
  - Edge width = weight (log scale)
  - Community hulls = convex hull per `community_id` (color from community)
  - **No labels by default** — hover for `node_id` (truncated)
- **KOL Table:** Columns = `node_id`, `PageRank`, `Betweenness`, `Degree`, `Community`, `Post Count`, `Window`, **Method** (e.g., "PageRank, α=0.85, 24h window, edges: mention+reply+repost")
- **Node Modal:** Only `node_id`, centrality metrics, community, `window_start/end`, **provenance breakdown** (observed edges by type, inferred edges by type)
- **Propagation View:** Separate tab — cascade tree for selected topic/event (SOUL.md §17)

### 3.6 Data Quality Page — Operational Excellence
**Current:** Adapter cards, Model cards, DLQ list.

**Required:**
- **Adapter Health:** Per-adapter sparkline (lag over 24h), rate limit budget bar with projection ("Exhausts at 14:32 UTC"), last 5 errors (expandable)
- **Model Health:** Latency percentiles (p50/p95/p99) sparklines, error rate trend, **drift alert** if `macro_f1` drops > 5% vs baseline
- **DLQ:** Group by `error_code`, show count, **replay all** button per group, **root cause** field (filled by engineer)
- **System Status:** Computed badge: `HEALTHY` | `DEGRADED` | `CRITICAL` based on:
  - Any adapter `down` → `CRITICAL`
  - Any adapter `degraded` OR model `error_rate > 1%` → `DEGRADED`
  - Else `HEALTHY`

### 3.7 Global UI Standards

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard navigation** | All interactive elements: `tabindex`, focus-visible rings, `Enter`/`Space` activation |
| **Screen readers** | Semantic HTML (`<table>`, `<thead>`, `<th scope="col">`), `aria-label` on icon buttons, `role="status"` for live updates |
| **Color blindness** | Never color-only encoding — use shape + pattern + label (e.g., coordinated pattern = ⚠ triangle + red + "COORDINATED") |
| **Responsive** | Mobile: stack cards, scrollable tables, collapsible sidebar |
| **Dark mode only** | Per spec — but ensure contrast ratios ≥ 4.5:1 (WCAG AA) |
| **Data density** | Compact mode toggle (comfortable/cozy/compact) for analyst workflows |
| **Export** | Every table → CSV (with meta: request_id, timestamp, data_source, window) |
| **Timezone** | All timestamps UTC in API, convert to local in UI with TZ indicator |

---

## 📦 PART 4: MISSING PAGES (SOUL.md §21 GAPS)

### 4.1 Propagation / Timeline Page (SOUL.md §17)
**New page:** `/propagation`
- Input: `topic_id` or `event_id`
- Output: Time-ordered cascade tree (Sankey or indented tree)
- Nodes: `event_id`, `platform`, `user_hash`, `timestamp`, `edge_type`
- Edge provenance: `observed` | `inferred`
- Filter: depth, time window, edge types

### 4.2 Model Evaluation Page (SOUL.md §34)
**New page:** `/evaluation`
- Per-model: confusion matrix, precision/recall/F1 per class, calibration plot, latency distribution
- Language-specific breakdown
- Drift timeline (macro-F1 over time)
- **Compare versions** side-by-side

### 4.3 Adapter Management Page (SOUL.md §5)
**New page:** `/admin/adapters`
- Enable/disable adapters
- Configure rate limits, lookback windows
- Manual backfill trigger (with progress)
- View raw API responses (debug)

---

## 🔧 PART 5: BACKEND CONTRACTS (UI CANNOT BE 10/10 WITHOUT THESE)

| Endpoint | Required Response Shape | SOUL.md Ref |
|----------|------------------------|-------------|
| `GET /api/v1/overview` | `OverviewMetrics` + `meta` | §21 |
| `GET /api/v1/sentiment/timeline` | `SentimentTimePoint[]` + `meta.model_version` | §7, §22 |
| `GET /api/v1/sentiment/emotions` | `EmotionBreakdown` + `meta` | §7 |
| `GET /api/v1/sentiment/events` | `CanonicalEventWithSentiment[]` (paginated) | §22 |
| `GET /api/v1/demographics` | `DemographicAggregate` + `meta.method_version` + `confidence_intervals` | §12, §22 |
| `GET /api/v1/trends` | `TrendTopic[]` (no `category`, with `components`) | §10, §11, §22 |
| `GET /api/v1/trends/{id}/formula` | `TrendFormulaBreakdown` (actual computed values) | §10, §22 |
| `GET /api/v1/network/graph` | `{ nodes: NetworkNode[], edges: NetworkEdge[], communities: CommunityCluster[] }` | §14, §15, §16 |
| `GET /api/v1/network/kol` | `KOLEntry[]` with `method` field | §15, §22 |
| `GET /api/v1/network/propagation` | `CascadeNode[]` (tree) | §17 |
| `GET /api/v1/health/adapters` | `AdapterHealth[]` | §23 |
| `GET /api/v1/health/models` | `ModelHealth[]` + `drift_alert` | §23, §35 |
| `GET /api/v1/dlq` | `DeadLetterEntry[]` (groupable by error_code) | §6, §23 |
| `POST /api/v1/dlq/{id}/replay` | `{ success: boolean, new_event_id?: string }` | §6 |
| `GET /api/v1/ws` | WebSocket: `ingestion.health`, `trends.new`, `model.health` | §21, §23 |

**All responses:** `ApiResponse<T>` envelope with `meta.data_source`, `meta.request_id`, `meta.timestamp`.

---

## ✅ PART 6: DEFINITION OF DONE FOR 10/10

### UI/UX
- [ ] Overview page shows ONLY SOUL.md §21 metrics (no vanity KPIs)
- [ ] All 6 required pages + 3 missing pages implemented
- [ ] Every widget shows `DataSourceBadge` from response `meta.data_source`
- [ ] Empty/loading/error states on every page (no `null` returns)
- [ ] Keyboard navigable, screen-reader accessible, color-blind safe
- [ ] Export (CSV) on every table with full meta
- [ ] WebSocket real-time updates on Overview, Trends, DataQuality
- [ ] Request ID visible in errors, copyable
- [ ] No hardcoded mock data in any component
- [ ] Formula Inspector shows **actual computed values** per topic
- [ ] Network graph: provenance visual encoding, no handles/names
- [ ] Communities: no names, only topic_distribution
- [ ] Demographics: confidence intervals, methodology modal, Leaflet map
- [ ] Propagation page with cascade tree
- [ ] Model evaluation page with drift detection

### Architecture
- [ ] `useSynthetic` removed from frontend entirely
- [ ] `ApiResponse<T>` envelope on all endpoints
- [ ] Type-safe API contracts (generated from OpenAPI or shared types)
- [ ] Error boundaries + Suspense on all pages
- [ ] WebSocket hook with reconnect + fallback polling
- [ ] Request ID generation + propagation
- [ ] No `any` types in API layer
- [ ] All mock data moved to `/tests/fixtures/` only (never in `src/`)

### Testing (SOUL.md §26-35)
- [ ] Unit tests: all chart components, formatters, hooks
- [ ] Integration tests: API service with MSW mock server
- [ ] Contract tests: API response schemas validated
- [ ] E2E tests: Playwright — ingest → analyze → dashboard renders
- [ ] Accessibility tests: axe-core in CI
- [ ] Visual regression: Chromatic or Percy
- [ ] Load test: 100 concurrent dashboard users
- [ ] Chaos test: kill backend → UI shows DEGRADED, recovers

### Documentation
- [ ] `docs/dashboard.md` — component map, data flow, theming
- [ ] `docs/api.md` — every endpoint with example response
- [ ] `docs/accessibility.md` — a11y checklist
- [ ] `DECISIONS.md` updated with every architectural choice

---

## 📋 EXECUTION ORDER (VERTICAL SLICES)

| Slice | Deliverable | Files Touched |
|-------|-------------|---------------|
| **0. Contracts** | `ApiResponse<T>`, TypeScript types, OpenAPI spec | `types/api.ts`, `services/api.ts`, backend |
| **1. Overview** | Real Overview page (no vanity KPIs) | `pages/OverviewPage.tsx`, `components/charts/*`, API |
| **2. Sentiment** | Auditability: timeline + emotions + event table | `pages/SentimentPage.tsx`, `components/charts/EmotionRadar.tsx` |
| **3. Trends** | Math transparency + scatter + table (no modal) | `pages/TrendsPage.tsx`, `components/charts/VelocityScatter.tsx` |
| **4. Network** | Pseudonymity + provenance + propagation tab | `pages/NetworkPage.tsx`, `components/network/*` |
| **5. Demographics** | Confidence intervals + Leaflet map + methodology | `pages/DemographicsPage.tsx`, `components/charts/BarChart.tsx` |
| **6. Data Quality** | Computed status + DLQ grouping + replay | `pages/DataQualityPage.tsx` |
| **7. Missing Pages** | Propagation, Model Evaluation, Adapter Admin | New pages + routes |
| **8. Infra** | Error boundaries, WS, request ID, a11y, export | `App.tsx`, `hooks/*`, `components/common/*` |
| **9. Hardening** | Tests, CI, docs, visual regression | `tests/*`, `.github/workflows/*`, `docs/*` |

---

## 🎯 FINAL VERDICT

**This dashboard is a beautiful shell with a rotten core.** It looks like a product but violates the charter at every data layer. 

**To ship 10/10:** Delete 40% of current code (vanity metrics, fake categories, pseudonymity leaks), rebuild Overview/Demographics/Trends/Network around **auditability**, add 3 missing pages, fix the architecture leaks (`useSynthetic`, no envelopes, no WS), and test brutally.

**Estimated effort:** 3-4 focused engineer-weeks (solo: 6-8 weeks).

**The alternative:** Ship the current dashboard → fail SOUL.md compliance → fail NTRO evaluation → waste the hackathon.

**Your call.**