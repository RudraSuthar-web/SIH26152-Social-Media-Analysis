# PS 26152: Sovereign AI-Driven Social Media Analytics & Threat Intelligence Framework

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://sih.gov.in)
[![Ministry / Org](https://img.shields.io/badge/Organization-NTRO-blue.svg)](https://ntro.gov.in)
[![Theme](https://img.shields.io/badge/Theme-Blockchain%20%26%20Cybersecurity-purple.svg)]()
[![Build Status](https://img.shields.io/badge/Dashboard-Production%20Ready-emerald.svg)]()

> **Smart India Hackathon 2026 (SIH 2026)**  
> **Problem Statement ID:** 26152  
> **Nodal Agency / Organization:** National Technical Research Organisation (NTRO)  
> **Category:** Software  
> **Theme:** Blockchain & Cybersecurity / Narrative & Threat Intelligence  

---

## 📌 Executive Summary

The **Sovereign AI-Driven Social Media Analytics Framework** is an enterprise-grade, high-throughput narrative tracking and threat intelligence platform designed for sovereign defense and security applications. Built to process massive multi-lingual event streams, the system isolates kinetic narrative campaigns, identifies botnet dynamics, quantifies emotional panic/hostility levels, maps network influence structures, and traces propagation vectors in real-time.

Designed under strict compliance with defense audit requirements (**`BRUTAL_AUDIT.md`**), this framework rejects platform-native vanity metrics (e.g., likes, followers) in favor of raw event-based signal processing, explicit mathematical formula transparency, pseudonymous node identity protection, and full provenance envelope tracing.

---

## 🚀 Key Features & Analytical Vectors

The platform frontend features **8 specialized analytical vector screens**, accessible via the interactive command bar:

| Vector | Focus & Capabilities | Key Metrics & Data Visualizations |
| :--- | :--- | :--- |
| 📊 **Overview Vector** | High-level operational awareness & system vitals | Total Events, Active Accounts, Trending Topics, Sentiment Distribution, Adapter Vitals |
| 🎭 **Sentiment Vector** | Fine-grained multi-class emotion & stance analysis | Hostile, Panicked, Negative, Neutral, Positive distribution with target entity filters & auditability scores |
| 🗺️ **Demographics Vector** | Multilingual & geofenced threat isolation | Language distribution (Hindi, English, Bengali, Punjabi, Tamil), location clusters, threat level mapping |
| 📈 **Trends Vector** | Early narrative detection & velocity tracking | Narrative velocity index, momentum trajectory, burst detection algorithms, early warning alerts |
| 🕸️ **Network Vector** | Link analysis & actor centrality discovery | Force-directed interaction graph, Eigenvector/PageRank centrality scores, pseudonymous `node_id` inspection |
| 🌊 **Propagation Vector** | Information cascade & origin tracing | Cascade tree mapping, effective reproduction rate ($R_0$), viral spread dynamics, ground-zero node identification |
| 🧪 **Model Evaluation** | AI Model performance & drift auditability | Precision/Recall/F1 scores, ONNX inference latency, confidence distribution, mathematical formulas |
| 🛡️ **Data Sentinel** | Ingestion pipeline health & data provenance | Live vs Synthetic toggle, `ApiResponse<T>` envelope validation, `data_source` provenance badges (`LIVE`, `SYNTHETIC`, `DEGRADED`, `REPLAY`) |

---

## 📐 Architecture & Standards

### System Architecture Overview

```
                      +---------------------------------------+
                      |   Multi-Platform Data Adapters         |
                      |   (X/Twitter, Telegram, Web Stream)   |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |   Data Ingestion & Invariant Audit    |
                      |   Envelope Wrapper: ApiResponse<T>    |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |   AI Analysis & Inference Engine      |
                      |   - XLM-RoBERTa (Sentiment/Stance)    |
                      |   - NetworkX Graph Centrality         |
                      |   - Cascade Spread Simulator ($R_0$)  |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |   Command Dashboard (React + TS)      |
                      |   - 8 Operational Vectors             |
                      |   - Pseudonymous Node Identity (`node_id`)
                      |   - Inline Math Formula Inspectors    |
                      +---------------------------------------+
```

### Data Envelope Standard

Every API payload adheres to strict schema validation with data provenance metadata:

```typescript
interface ApiResponse<T> {
  request_id: string;        // UUIDv4 execution trace ID
  timestamp: string;         // ISO 8601 UTC timestamp
  data_source: 'LIVE' | 'SYNTHETIC' | 'DEGRADED' | 'REPLAY' | 'OFFLINE';
  data: T;
}
```

---

## 🛠️ Technology Stack

* **Frontend Dashboard**:
  * **Framework**: React 18 with TypeScript
  * **Build System**: Vite 5
  * **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism & High-Contrast Dark Mode Palette
  * **Components**: Error Boundaries, CSV Data Exporting, Interactive Vector Selectors, Math Formula Tooltips
* **Target Analytical Pipeline**:
  * **API Layer**: FastAPI (Python 3.11)
  * **Inference**: ONNX Runtime, HuggingFace Transformers (`xlm-roberta-base`)
  * **Graph Analysis**: NetworkX / cuGraph (PageRank, Betweenness Centrality, Louvain Community Detection)
  * **Database**: TimescaleDB (Time-series event logs) + Redis (Stream Caching)

---

## 🔐 Audit & Compliance Standards (`BRUTAL_AUDIT.md`)

This implementation strictly satisfies defense-grade requirements:

1. **Purged Platform Vanity Metrics**: Completely removed platform-native vanity metrics (`followers`, `likes`, `impressions`) in favor of system telemetry (`total_events`, `active_accounts`, `adapter_health`).
2. **Pseudonymous Identity Enforcer**: Handles and user identities are hashed to system-level `node_id`s (e.g., `node_8f4a12`) to preserve operational privacy.
3. **Auditable Math Inspectors**: Key AI metrics (Confidence, Entropy, Centrality, Velocity) feature embedded LaTeX mathematical definitions explaining exact underlying formulas.
4. **Fail-Safe UI**: Wrapped with React `ErrorBoundary` handlers to ensure total dashboard resiliency during pipeline anomalies.
5. **Data Provenance Badges**: All analytical views render unambiguous indicators for data lineage (`LIVE`, `SYNTHETIC`, `DEGRADED`, etc.).

---

## 🚦 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### Quickstart Guide

1. **Clone Repository**:
   ```bash
   git clone https://github.com/RudraSuthar-web/SIH26152-Social-Media-Analysis.git
   cd SIH26152-Social-Media-Analysis
   ```

2. **Navigate to Dashboard & Install Dependencies**:
   ```bash
   cd dashboard
   npm install
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build & Preview Production Bundle**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📂 Repository Structure

```
SIH26152-Social-Media-Analysis/
├── .agents/                      # Custom Agent Skills & Configurations
│   └── skills/
│       └── frontend-design/      # UI/UX & Design Guidelines Skill
├── dashboard/                    # React + TypeScript Web Command Center
│   ├── src/
│   │   ├── components/           # UI Components & Analytics Views
│   │   │   ├── VectorSelector.tsx
│   │   │   ├── OverviewVector.tsx
│   │   │   ├── SentimentVector.tsx
│   │   │   ├── DemographicsVector.tsx
│   │   │   ├── TrendsVector.tsx
│   │   │   ├── NetworkVector.tsx
│   │   │   ├── PropagationVector.tsx
│   │   │   ├── ModelEvalVector.tsx
│   │   │   ├── DataSentinelVector.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── CsvExportButton.tsx
│   │   ├── types.ts              # System Data Envelopes & Domain Types
│   │   ├── mockData.ts           # Audit-Compliant ApiResponse Envelopes
│   │   ├── App.tsx               # Main Dashboard Application
│   │   └── index.css             # Tailwind Design System & Custom Tokens
│   ├── package.json              # Dashboard dependencies & scripts
│   ├── vite.config.ts            # Vite bundler configuration
│   └── tailwind.config.js        # Tailwind CSS configuration
├── .gitignore                    # Repository git ignore rules
├── BRUTAL_AUDIT.md               # Strict Audit Verification Guidelines
├── PROPOSED_SOLUTION.md          # Technical Proposal & Solution Architecture
├── SOUL.md                       # Product Vision & Metric Mandates
└── README.md                     # Project Documentation
```

---

## 📄 License & Attribution

Developed for **Smart India Hackathon 2026** under Problem Statement **26152** issued by the **National Technical Research Organisation (NTRO)**. All rights reserved.
