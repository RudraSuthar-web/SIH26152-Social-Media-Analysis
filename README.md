# PS 26152: Sovereign AI-Driven Social Media Analytics & Threat Intelligence Framework

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://sih.gov.in)
[![Ministry / Org](https://img.shields.io/badge/Organization-NTRO-blue.svg)](https://ntro.gov.in)
[![Theme](https://img.shields.io/badge/Theme-Blockchain%20%26%20Cybersecurity-purple.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20TimescaleDB%20%7C%20Redis-009688.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB.svg)]()
[![Audit Status](https://img.shields.io/badge/Audit-100%25%20Defense%20Compliant-emerald.svg)]()

> **Smart India Hackathon 2026 (SIH 2026)**  
> **Problem Statement ID:** 26152  
> **Nodal Agency / Organization:** National Technical Research Organisation (NTRO)  
> **Category:** Software  
> **Theme:** Blockchain & Cybersecurity / Narrative & Threat Intelligence  

---

## 📌 Executive Summary

The **Sovereign AI-Driven Social Media Analytics & Threat Intelligence Framework** is an enterprise-grade, high-throughput narrative tracking and threat detection platform built for national defense and intelligence operations. Designed for real-time processing of multi-lingual social media event streams (X/Twitter, Telegram, Web streams), the platform detects coordinated disinformation campaigns, isolates botnet clusters, quantifies emotional panic/hostility levels, computes actor influence centralities, and traces cascade propagation dynamics ($R_0$).

Built under strict adherence to defense audit standards (**`BRUTAL_AUDIT.md`**), this system rejects platform vanity metrics (likes, retweets, follower counts) in favor of raw event-based signal processing, explicit mathematical formula transparency (LaTeX inspectors), pseudonymous identity masking (`node_id`), and strict data provenance tracing (`ApiResponse<T>` envelopes).

---

## 📐 End-to-End System Architecture

```
                       +--------------------------------------------------+
                       |           Multi-Platform Data Adapters            |
                       |    (X/TwitterAPI.io, Telegram MTProto/Bot)       |
                       +------------------------+-------------------------+
                                                |
                                                v
                       +------------------------+-------------------------+
                       |        FastAPI Core Ingestion & Telemetry        |
                       |    - Provenance Envelope: ApiResponse<T>         |
                       |    - Data Sources: LIVE, SYNTHETIC, DEGRADED    |
                       +------------------------+-------------------------+
                                                |
                               +----------------+----------------+
                               |                                 |
                               v                                 v
                       +---------------+                 +---------------+
                       |  TimescaleDB  |                 |  Redis Stream |
                       | (Event Store) |                 |  & Cache Layer|
                       +---------------+                 +---------------+
                               |                                 |
                               +----------------+----------------+
                                                |
                                                v
                       +------------------------+-------------------------+
                       |     AI Inference & Graph Analytics Engine        |
                       |    - XLM-RoBERTa Sentiment & Stance Analysis     |
                       |    - NetworkX (PageRank, Eigenvector, Louvain)   |
                       |    - Cascade Spread Simulator ($R_0$)             |
                       +------------------------+-------------------------+
                                                |
                                                v
                       +------------------------+-------------------------+
                       |   Command Center Dashboard (React 18 + TS)       |
                       |    - 8 Operational Vectors & 12+ Expanded Charts |
                       |    - Interactive Leaflet Geofenced Choropleth   |
                       |    - WebSocket Real-Time Stream Engine          |
                       +--------------------------------------------------+
```

---

## 🚀 Key Features & Operational Analytics Vectors

The platform frontend features **8 specialized analytical vector screens** powered by an **expanded suite of 12+ interactive charts**:

| Analytical Vector | Operational Focus & Intelligence Capabilities | Visualizations & Metrics |
| :--- | :--- | :--- |
| 📊 **Overview Vector** | Global operational awareness, adapter health & system vitals | Total Events, Active Accounts, Adapter Vitals, `SentimentConfidenceHistogram` |
| 🎭 **Sentiment Vector** | Multilingual fine-grained emotion, hostility & stance audit | Hostile/Panic distribution, Stance Radar, `SarcasmUncertaintyScatter` |
| 🗺️ **Demographics Vector** | Geofenced threat cluster isolation & language mapping | Interactive Leaflet Choropleth Map, Confidence Whiskers, `AgeLanguageStackedBar`, `LanguageSentimentHeatmap` |
| 📈 **Trends Vector** | Narrative velocity, momentum trajectory & burst detection | Velocity Index, Burst Alerts, `TrendComponentWaterfall` |
| 🕸️ **Network Vector** | Actor centrality discovery & botnet cluster detection | Force-Directed Interaction Graph, Pseudonymous `node_id`, `CentralityDistribution`, `CommunityTreemap` |
| 🌊 **Propagation Vector** | Cascade dynamics, viral spread & ground-zero tracing | Cascade Tree, Effective Reproduction Rate ($R_0$), `CoordinationScatter` |
| 🧪 **Model Evaluation** | AI drift detection, ONNX latency & formula auditability | Precision/Recall/F1, Latency Percentiles, `ModelLatencyPercentiles`, LaTeX Inspectors |
| 🛡️ **Data Sentinel** | Ingestion pipeline health & rate-limit monitoring | Provenance Badges (`LIVE`, `SYNTHETIC`), `RateLimitBurnChart`, Invariant Validators |

---

## 🛠️ Technology Stack

### Backend Engine (`backend/`)
* **API Framework**: FastAPI (Python 3.11) with Uvicorn ASGI server
* **Databases**:
  * **TimescaleDB / PostgreSQL 16**: Time-series event logging and analytics
  * **Redis 7 (Alpine)**: Real-time event streaming and query caching
* **Migrations**: Alembic with SQLAlchemy ORM models
* **AI & NLP Inference**: HuggingFace Transformers (`xlm-roberta-base`), ONNX Runtime, NumPy, SciPy
* **Network & Graph Analytics**: NetworkX, cuGraph (PageRank, Eigenvector Centrality, Louvain Community Detection)
* **Social Data Adapters**: Telegram Telethon (MTProto), TwitterAPI.io, HTTP Web Ingestion Adapters

### Command Dashboard (`dashboard/`)
* **Framework & Tooling**: React 18, TypeScript, Vite 5
* **Styling & Aesthetics**: Tailwind CSS, Lucide Icons, Glassmorphism & High-Contrast Dark Mode Palette
* **Data Visualization**: Recharts, Leaflet / React-Leaflet (Geofenced Choropleth), Canvas Force Graphs
* **State & Real-Time Sync**: Custom WebSocket hooks, React Suspense/Skeleton Loaders, CSV Exporters
* **Resiliency**: High-level Error Boundaries & Inline LaTeX Formula Inspectors

---

## 🔐 Telegram API Key & Credentials Setup Guide

To ingest live messages and channel data from Telegram, follow these steps to obtain your API credentials:

### Step 1: Obtain Telegram App `API_ID` and `API_HASH`
1. Log into your Telegram account at [https://my.telegram.org/](https://my.telegram.org/).
2. Go to **API development tools**.
3. Fill out the application form (App title e.g. `SocialMediaAnalytics`, Short name e.g. `sih_analytics`).
4. Click **Create application**.
5. Copy your **`api_id`** (numeric e.g., `39377993`) and **`api_hash`** (32-character hexadecimal string e.g., `68ee0eba6290d9fdae195c9f0b353f65`).

### Step 2: (Optional) Create Telegram Bot Token via @BotFather
1. Open Telegram and search for **`@BotFather`**.
2. Send `/newbot` and follow the prompts to set a name and username for your bot.
3. Copy the HTTP API token provided by BotFather (e.g., `7123456789:ABCdefGhIJKlmNoPQRstuVWXyz12345`).

### Step 3: Generate Telethon String Session (For User Account Ingestion)
1. Run the interactive session generator script in the backend directory:
   ```bash
   cd backend
   ./.venv/bin/python create_session.py
   ```
2. Enter your phone number (with country code) when prompted and input the login OTP sent to Telegram.
3. Copy the generated string session output (`TG_SESSION_STRING`).

### Step 4: Configure `backend/.env`
Open or create `backend/.env` and insert your credentials:
```env
# Telegram App Credentials (my.telegram.org)
TG_API_ID=39377993
TG_API_HASH=68ee0eba6290d9fdae195c9f0b353f65
TG_SESSION_STRING="your_generated_string_session_here"

# Telegram Bot Token (optional)
TELEGRAM_BOT_TOKEN="your_bot_token_here"
```

---

## 🚦 Installation & Quickstart Guide

### Prerequisites
* **Python**: `v3.11` or higher (with `uv` installed)
* **Node.js**: `v18.0.0` or higher
* **Docker & Docker Compose**: Installed and running

---

### Step 1: Clone Repository
```bash
git clone https://github.com/RudraSuthar-web/SIH26152-Social-Media-Analysis.git
cd SIH26152-Social-Media-Analysis
```

---

### Step 2: Start Infrastructure Services (TimescaleDB & Redis)
```bash
docker-compose up -d
```
*Verify containers are running:*
```bash
docker ps
# Expected: socialmediaanalysis-postgres-1 (port 5432) and socialmediaanalysis-redis-1 (port 6379)
```

---

### Step 3: Backend Setup & Database Migrations

1. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create Virtual Environment & Install Dependencies**:
   ```bash
   uv venv .venv
   source .venv/bin/activate
   uv pip install -r requirements.txt
   ```

3. **Generate JWT Cryptographic Keys**:
   ```bash
   mkdir -p secrets
   openssl genpkey -algorithm RSA -out secrets/jwt_private.pem -pkeyopt rsa_keygen_bits:2048
   openssl rsa -in secrets/jwt_private.pem -pubout -out secrets/jwt_public.pem
   ```

4. **Run Database Migrations (Alembic)**:
   ```bash
   alembic upgrade head
   ```

5. **Launch FastAPI Application Server**:
   ```bash
   ./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The API will be live at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

---

### Step 4: Frontend Command Center Setup

1. **Navigate to Dashboard Directory**:
   ```bash
   cd ../dashboard
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
   *Open browser at `http://localhost:5173`.*

4. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
cd backend
./.venv/bin/pytest -v
```
*Output: 6 passed tests verifying `/health`, `/ready`, `/events`, `/sentiment`, `/metrics/overview`, and `/demographics`.*

Run adapter live connectivity test:
```bash
./.venv/bin/python scripts/test_adapters.py
```

---

## 🛡️ Audit & Provenance Verification (`BRUTAL_AUDIT.md`)

This system implements strict defense-grade mandates:

1. **Zero Vanity Metrics**: Completely purged platform-native metrics (`followers`, `likes`, `impressions`). Operational focus is strictly on event velocity, bot network topology, and stance propagation.
2. **Pseudonymous Identity Enforcer**: Real handles/usernames are dynamically hashed to secure pseudonymous identities (`node_8f4a12`) across all network graphs and tables.
3. **LaTeX Math Inspectors**: Embedded math popups detail exact formulas for confidence, centrality (PageRank $PR(p_i)$), and viral reproduction rate ($R_0 = \beta \cdot \tau$).
4. **Strict `ApiResponse<T>` Envelopes**: All API responses carry data provenance (`LIVE`, `SYNTHETIC`, `DEGRADED`, `REPLAY`) and execution trace UUIDs.

---

## 📂 Repository Structure

```
SIH26152-Social-Media-Analysis/
├── .agents/                      # Agent Skills & Front-End Guidelines
├── backend/                      # Python FastAPI Analytical Backend
│   ├── alembic.ini               # Alembic Migration Configuration
│   ├── app/
│   │   ├── main.py               # FastAPI Core App & Route Registry
│   │   ├── models/               # SQLAlchemy ORM Event & Threat Schemas
│   │   ├── services/             # Adapters, Analytics & WebSocket Managers
│   │   └── config.py             # App Configuration Loader (config.yaml)
│   ├── config.yaml               # Non-sensitive application configuration
│   ├── .env                      # Sensitive API Keys & Telegram Credentials
│   ├── create_session.py         # Telethon User Session Generator
│   ├── migrations/               # Alembic DB Revision Scripts
│   ├── pyproject.toml            # Python Project Configuration
│   ├── requirements.txt          # Backend Dependencies
│   ├── secrets/                  # RSA JWT Key Pair Storage
│   ├── scripts/                  # Adapter & Pipeline Verification Scripts
│   └── tests/                    # Pytest Integration Test Suite
├── dashboard/                    # React 18 + TypeScript Command Center
│   ├── src/
│   │   ├── components/           # Analytical Vectors & Chart Suite
│   │   │   ├── charts/           # 12+ Interactive Recharts & Leaflet Maps
│   │   │   ├── common/           # Skeleton Loaders & Page Containers
│   │   │   └── VectorSelector.tsx
│   │   ├── hooks/                # Custom WebSocket Stream & API Hooks
│   │   ├── pages/                # Operational Vector Screens
│   │   └── types.ts              # Provenance & Data Envelope Schemas
│   ├── package.json              # Dashboard dependencies & scripts
│   └── vite.config.ts            # Vite Bundler Setup
├── docker-compose.yml            # PostgreSQL TimescaleDB & Redis Orchestration
├── .gitignore                    # Comprehensive Git Exclusions
├── BRUTAL_AUDIT.md               # Defense Audit Standards & Verification Rules
├── CHART_EXPANSION.md            # Expanded Visualizations Blueprint
├── NEXT_STEPS.md                 # Implementation Roadmap
├── PROPOSED_SOLUTION.md          # Sovereign AI Technical Architecture
└── README.md                     # Project Master Documentation
```

---

## 📄 License & Attribution

Developed for **Smart India Hackathon 2026** under Problem Statement **26152** issued by the **National Technical Research Organisation (NTRO)**. All rights reserved.
