# ARCHITECTURE RATIONALE — AGATA

> This document explains **why** each architectural decision was made.
> Understanding the rationale helps the AI agent prioritize correctly and avoid breaking the research narrative.

---

## Research Context

This system is built as part of a TRL 3 (Proof of Concept) research proposal between:
- **Universitas Bakrie** (lead developer, GeoAI architecture)
- **Cardiff University OR Group** (mathematical modeling, Monte Carlo validation)

The proposal follows a **Human-Centered AI (HCAI)** framework with 5 phases:
1. DEFINE–ALIGN → co-design workshops with ambulance personnel
2. IDEATE → build Agentic GeoAI architecture ← **this MVP covers phases 2–3**
3. EXPLAIN → chatbot + dashboard interfaces
4. IMPACT → Monte Carlo validation (future work)
5. DISSEMINATION → stakeholder publication

---

## Why Leaflet (Not Mapbox)

> ⚠️ **IMPORTANT FOR CODEX:** The original proposal mentioned Mapbox, but it has been replaced with **Leaflet + react-leaflet** for the MVP. Do NOT reintroduce Mapbox.

Reason for replacement:
1. Mapbox **requires a credit card** even for free-tier usage — not suitable for open research demos
2. Leaflet is **100% free** with no token required
3. Carto Dark Matter tiles provide the same dark WebGIS aesthetic
4. Leaflet is already used in the SIGAPP reference system

**Leaflet rules (MUST follow):**
```typescript
// ALWAYS use dynamic import with ssr: false
const MapView = dynamic(() => import('@/components/webgis/MapView'), { ssr: false });

// Leaflet coordinate order: [lat, lng] — NOT [lng, lat]
// Tile URL: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
// Center Jakarta: [-6.2088, 106.8456], zoom: 12
```

---

## Why a Chatbot Interface (Not Just a Dashboard)

The proposal emphasizes **accessibility for non-GIS experts** — ambulance dispatchers should not need to understand GIS to use the system. A natural language interface (chatbot) achieves this.

The chatbot is **not** a real LLM call in this MVP — it simulates the conversation to demonstrate the interaction paradigm. In the full system, it would use OpenRouter + an LLM API.

---

## Why 4 Agents

From Figure 2 of the proposal, the architecture has exactly 4 specialist agents:

| Agent | MVP Role | Full System Role |
|-------|----------|------------------|
| **Data Retrieval Agent** | Mock: load from Neon PostgreSQL | Real: FastAPI → PostGIS query → Pinecone semantic search |
| **Spatial Analysis Agent** | Mock: Euclidean distance (straight-line) | Real: PostGIS ST_Distance, ST_DWithin, OSRM routing |
| **Data Visualization Agent** | Mock: render Leaflet markers | Real: generate dynamic map overlays, route animations |
| **Report Generator Agent** | Mock: return pre-written text | Real: LLM-generated ranked report with justification |

The `AgentStatusBar` visualizes this pipeline running in sequence.

---

## Why Next.js (Not React SPA or Vite)

1. **App Router** provides clean routing without extra config
2. **`next/font`** for optimized Inter font loading
3. **Server Components** for potential future data fetching (PostGIS integration)
4. **Consistent with SIGAPP** repo architecture (previous research system at Universitas Bakrie)
5. **Vercel deployment** is trivial for demos

---

## Why Tailwind CSS

1. **Rapid UI development** — no context switching between CSS files
2. **Dark-first design** is trivial with Tailwind utility classes
3. **Consistent with the existing SIGAPP codebase**
4. Color tokens defined in `tailwind.config.ts` map directly to the design system

---

## ⛔ MVP SCOPE GUARDRAILS — DO NOT IMPLEMENT

> These are explicitly OUT OF SCOPE for TRL 3 MVP. Codex must NOT implement these, even if they seem like natural extensions.

| Feature | Why Out of Scope |
|---|---|
| OSRM / Mapbox routing | Road network data not yet available. Use Euclidean distance. |
| Pinecone / vector DB | Embedding phase is TRL 4+ |
| Real-time bed capacity API | Satu Data Jakarta API integration is TRL 4 |
| Monte Carlo simulation | Cardiff contribution — not in MVP |
| LLM API calls (OpenRouter, GPT) | Mocked responses only for MVP |
| Multi-city support | Jakarta only for TRL 3 |
| Docker / AWS deployment | Vercel only for MVP |
| Patient data / EHR | No real patient data in MVP |

See `docs/DATASET.md` for full dataset scope and guardrails.

---

## Data Flow (MVP — Current Implementation)

```
[User clicks on map / submits query]
        ↓
[Dashboard page.tsx handles state]
        ↓
[Calls GET /api/hospitals/nearest?lat=&lng=&radius=10000&limit=3]
        ↓
[API route queries Neon PostgreSQL via ST_DWithin (PostGIS)]
        ↓
[Returns top 3 nearest hospitals by Euclidean distance]
        ↓
[AgentStatusBar shows animation — simulates 4-agent pipeline]
        ↓
[HospitalSidebar renders ranked list with distance + ER status]
        ↓
[MapView highlights recommended hospitals with pulse markers]
```

---

## Technology Readiness Level Context

This MVP targets **TRL 3**: experimental proof of concept.

| TRL | Phase | Status |
|-----|-------|--------|
| TRL 1 | Basic GeoAI research (2023–2024) | ✅ Done — published in IEEE Xplore |
| TRL 2 | Framework development (2024–2025) | ✅ Done — SIGAPP framework |
| **TRL 3** | **System development + non-expert validation (2025–2026)** | **← THIS MVP** |
| TRL 4 | Full system integration + multi-city scaling (2026–2027) | Future |

---

## SDG Alignment

- **SDG 3 — Good Health & Well-being:** Improves ambulance response time → saves lives
- **SDG 9 — Industry, Innovation & Infrastructure:** AI-powered emergency infrastructure for megacities
- **SDG 11 — Sustainable Cities & Communities:** Smart city systems for urban healthcare access

---

## Future Integration Points (not in MVP)

| Component | MVP | Full System |
|-----------|-----|-------------|
| LLM | Mocked responses | OpenRouter API (GPT-4o / Claude 3.5) |
| Spatial DB | Neon PostgreSQL + PostGIS (mock seed) | PostGIS with real Dinkes DKI data |
| Vector DB | Not present | Pinecone (hospital + location embeddings) |
| Routing | Euclidean straight-line distance | Mapbox Directions API / OSRM |
| Bed capacity | Static mock data | Real-time Satu Data Jakarta API |
| Validation | None | Cardiff Monte Carlo simulation |
| Deployment | Vercel (free) | Docker on AWS EC2 |
| Data source | 15 mock hospitals | Full Dinkes DKI + SIRS Online Kemenkes |
