# AGATA — Agentic GeoAI for Ambulance and Triage Assistance

> **WebGIS MVP** for the research proposal: *"Optimizing Jakarta Ambulance Services: An Agentic GeoAI Chatbot for Distance and Capacity-Aware Hospital Recommendation"*  
> Universitas Bakrie × Cardiff University | 2025–2026

---

## 🎯 Project Overview

AGATA is a **showcase MVP** demonstrating an Agentic GeoAI system that recommends destination hospitals for Jakarta ambulances, based on:
- **Patient-to-hospital distance** (geospatial routing)
- **Real-time bed capacity** (availability status)

This MVP uses **mock data only** — it is designed for proposal presentation and proof-of-concept demonstration, not production use.

---

## 🧩 System Architecture

```
User (Ambulance Dispatcher)
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                    Chatbot Interface                     │
│           (Natural language input/output)                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              LLM Orchestrator (OpenRouter)               │
│         Translates requests → coordinates agents        │
└──────┬──────────┬──────────────┬───────────────┬────────┘
       │          │              │               │
       ▼          ▼              ▼               ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────────┐
│  Data    │ │ Spatial  │ │    Data      │ │    Report     │
│Retrieval │ │Analysis  │ │Visualization │ │  Generator    │
│  Agent   │ │  Agent   │ │    Agent     │ │    Agent      │
└──────────┘ └──────────┘ └──────────────┘ └───────────────┘
       │          │              │               │
       └──────────┴──────────────┴───────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│          Data Layer: PostGIS + Pinecone + FastAPI        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│        UI Layer: Leaflet WebGIS Dashboard (dark)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/zakiulfahmijailani/AGATA-Agentic-GeoAI-for-Ambulance-and-Triage-Assistance.git
cd AGATA-Agentic-GeoAI-for-Ambulance-and-Triage-Assistance

# 2. Install dependencies
npm install

# 3. Run development server (no .env needed!)
npm run dev

# 4. Open browser
# http://localhost:3000           ← Landing page
# http://localhost:3000/dashboard ← WebGIS Dashboard
```

> ✅ **No API token required.** Map tiles are served by Carto (free, no registration).

---

## 📁 Project Structure

```
├── CODEX.md                        # Operational instructions for AI coding agents
├── .env.example                    # No tokens needed — see file for details
├── docs/
│   ├── AGENT_BRIEF.md              # Master brief: project context & MVP scope
│   ├── TASKS.md                    # Agent execution checklist (26 tasks, 5 phases)
│   ├── MOCK_DATA.md                # All mock data: 15 hospitals, 3 demo scenarios
│   ├── UI_SPEC.md                  # UI/UX design spec: layout, colors, components
│   └── ARCHITECTURE.md             # System architecture & design rationale
└── src/
    ├── app/
    │   ├── page.tsx                # Landing page
    │   ├── dashboard/
    │   │   └── page.tsx            # Main WebGIS dashboard (3-panel layout)
    │   └── layout.tsx
    ├── components/
    │   └── webgis/
    │       ├── Topbar.tsx          # App header + AgentStatusBar + live clock
    │       ├── MapView.tsx         # Leaflet map + hospital markers (dynamic import)
    │       ├── ChatbotPanel.tsx    # Chat interface sidebar
    │       ├── AgentStatusBar.tsx  # 4-agent pipeline visualization
    │       ├── HospitalCard.tsx    # Hospital recommendation card
    │       ├── KpiCard.tsx         # KPI summary card
    │       └── index.ts            # Barrel export
    ├── lib/
    │   └── mock/
    │       ├── hospitals.ts        # 15 mock hospitals, 5 Jakarta zones
    │       ├── chatResponses.ts    # Demo scenarios + matchScenario()
    │       ├── agentSteps.ts       # 4-agent pipeline mock steps
    │       └── dashboardStats.ts   # KPI card static data
    └── types/
        └── index.ts                # TypeScript interfaces
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [`CODEX.md`](CODEX.md) | Operational instructions for AI coding agents (read first) |
| [`docs/AGENT_BRIEF.md`](docs/AGENT_BRIEF.md) | Master brief: project context, MVP scope, tech stack |
| [`docs/TASKS.md`](docs/TASKS.md) | **Agent execution checklist** — 26 tasks in 5 phases |
| [`docs/MOCK_DATA.md`](docs/MOCK_DATA.md) | All mock data: 15 hospitals, demo scenarios, agent steps |
| [`docs/UI_SPEC.md`](docs/UI_SPEC.md) | UI/UX design: layout, colors, components, animations |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture rationale & component relationships |

> 🤖 **For AI coding agents**: Start with `CODEX.md` → `docs/AGENT_BRIEF.md` → `docs/TASKS.md`

---

## 🔬 Research Context

- **Lead Researcher:** Zakiul Fahmi Jailani, M.Sc. — Universitas Bakrie
- **International Partner:** Cardiff University (OR Group) — Syaribah Noor Brice, Prof. Daniel Gartner
- **SDGs:** SDG 3 (Good Health), SDG 9 (Innovation), SDG 11 (Sustainable Cities)
- **Phase:** TRL 3 — Proof of Concept (2025–2026)
- **Tech Stack:** Next.js · TypeScript · Tailwind CSS · Leaflet · react-leaflet · Carto Tiles

---

## ⚠️ MVP Disclaimer

This is a **research showcase MVP**. All hospital data, bed capacity, and routing calculations are **simulated/mocked**. No real patient data is used.
