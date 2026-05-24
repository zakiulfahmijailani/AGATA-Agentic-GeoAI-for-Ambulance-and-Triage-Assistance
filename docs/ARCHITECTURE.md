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

## Why Mapbox (Not Leaflet or Google Maps)

The proposal explicitly names **Mapbox** as the mapping layer because:
1. Supports **geocoding** (converting addresses to coordinates)
2. Supports **routing** (actual road-based distance calculation)
3. Supports **custom styles** (dark WebGIS aesthetic for professional demos)
4. Supports **WebGL rendering** (performant with many markers)
5. Already budgeted in the proposal RAB (Research Budget Plan)

For MVP: use `mapbox://styles/mapbox/dark-v11`, mock routing with straight lines.

---

## Why a Chatbot Interface (Not Just a Dashboard)

The proposal emphasizes **accessibility for non-GIS experts** — ambulance dispatchers should not need to understand GIS to use the system. A natural language interface (chatbot) achieves this.

The chatbot is **not** a real LLM call in this MVP — it simulates the conversation to demonstrate the interaction paradigm. In the full system, it would use OpenRouter + an LLM API.

---

## Why 4 Agents

From Figure 2 of the proposal, the architecture has exactly 4 specialist agents:

| Agent | MVP Role | Full System Role |
|-------|----------|------------------|
| **Data Retrieval Agent** | Mock: load from JSON | Real: FastAPI → PostGIS query → Pinecone semantic search |
| **Spatial Analysis Agent** | Mock: return hardcoded distances | Real: PostGIS ST_Distance, ST_DWithin routing |
| **Data Visualization Agent** | Mock: render Mapbox pins | Real: generate dynamic map overlays, route animations |
| **Report Generator Agent** | Mock: return pre-written text | Real: LLM-generated ranked report with justification |

The `AgentStatusBar` visualizes this pipeline running in sequence.

---

## Why Next.js (Not React SPA or Vite)

1. **App Router** provides clean `/` and `/dashboard` routing without extra config
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

## Data Flow (MVP)

```
[User types in ChatbotPanel]
        ↓
[handleQuerySubmit() in /dashboard/page.tsx]
        ↓
[matchScenario(query) → finds matching DemoScenario]
        ↓
[AgentStatusBar animation — 4 × 1000ms setTimeout]
        ↓
[setRecommendedHospitals(matched hospitals from mockHospitals)]
        ↓
[setPatientLocation(scenario.patientLocation)]
        ↓
[ChatbotPanel renders scenario.chatResponse]
        ↓
[HospitalCard renders for each recommendedHospital]
        ↓
[MapView receives new recommendedIds + patientLocation props]
        ↓
[Map flies to zone, shows pulse markers + dashed route lines]
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
| Spatial DB | Mock JSON | PostGIS on AWS RDS |
| Vector DB | Not present | Pinecone (hospital embeddings) |
| Routing | Straight lines | Mapbox Directions API / OSRM |
| Bed capacity | Static mock | Real-time Satu Data Jakarta API |
| Validation | None | Cardiff Monte Carlo simulation |
| Deployment | Vercel (free) | Docker on AWS EC2 |
