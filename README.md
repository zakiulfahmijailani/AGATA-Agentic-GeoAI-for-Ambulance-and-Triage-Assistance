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
       ▼          ▼              ▼               ▼
┌─────────────────────────────────────────────────────────┐
│          Data Layer: PostGIS + Pinecone + FastAPI        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           UI Layer: Mapbox WebGIS Dashboard              │
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

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Mapbox public token

# 4. Run development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/
│   │   └── page.tsx                # Main WebGIS dashboard
│   └── layout.tsx
├── components/
│   └── webgis/
│       ├── MapView.tsx             # Mapbox GL map + hospital pins
│       ├── ChatbotPanel.tsx        # Chat interface sidebar
│       ├── AgentStatusBar.tsx      # 4-agent pipeline visualization
│       ├── HospitalCard.tsx        # Hospital info card
│       └── DashboardStats.tsx      # KPI summary cards
├── lib/
│   └── mock/
│       ├── hospitals.ts            # Mock hospital GeoJSON data
│       ├── chatResponses.ts        # Mock chatbot responses
│       └── agentSteps.ts           # Mock agent pipeline steps
└── types/
    └── index.ts                    # TypeScript interfaces
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [`docs/AGENT_BRIEF.md`](docs/AGENT_BRIEF.md) | **Master brief for AI coding agents** (Codex, Cursor, Claude) |
| [`docs/MOCK_DATA.md`](docs/MOCK_DATA.md) | All mock data specifications |
| [`docs/UI_SPEC.md`](docs/UI_SPEC.md) | UI/UX design specification |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture rationale |
| [`CODEX.md`](CODEX.md) | Operational instructions for AI coding agents |

---

## 🔬 Research Context

- **Lead Researcher:** Zakiul Fahmi Jailani, M.Sc. — Universitas Bakrie
- **International Partner:** Cardiff University (OR Group) — Syaribah Noor Brice, Prof. Daniel Gartner
- **SDGs:** SDG 3 (Good Health), SDG 9 (Innovation), SDG 11 (Sustainable Cities)
- **Phase:** TRL 3 — Proof of Concept (2025–2026)
- **Tech Stack:** Next.js · TypeScript · Tailwind CSS · Mapbox GL JS · FastAPI · PostGIS · Pinecone

---

## ⚠️ MVP Disclaimer

This is a **research showcase MVP**. All hospital data, bed capacity, and routing calculations are **simulated/mocked**. No real patient data is used.
