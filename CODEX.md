# CODEX — Operational Instructions for AI Coding Agents

> This file is for AI coding agents (Codex, Cursor, Claude Code, Copilot Workspace).  
> Read this FIRST before any other file. It overrides all assumptions.

---

## 🎯 Your Mission

Build the **AGATA WebGIS MVP** — a Next.js web application that showcases an Agentic GeoAI system for Jakarta ambulance hospital recommendations.

This is a **showcase/demo only**. No real APIs, no real data, no authentication. Everything must run with `npm run dev` without any external service.

---

## 📋 Mandatory Reading Order

1. **This file** (CODEX.md) — operational rules
2. `docs/AGENT_BRIEF.md` — full feature spec
3. `docs/MOCK_DATA.md` — exact data to use
4. `docs/UI_SPEC.md` — visual design rules
5. `docs/ARCHITECTURE.md` — why things are built this way

---

## ⚙️ Technical Stack (DO NOT CHANGE)

```
Framework:    Next.js 14+ (App Router)
Language:     TypeScript (strict mode)
Styling:      Tailwind CSS v3
Map:          Mapbox GL JS v3
Icons:        Lucide React
Animations:   Framer Motion (for AgentStatusBar only)
Fonts:        Inter (body) via next/font/google
```

### Installation command:
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install mapbox-gl @types/mapbox-gl lucide-react framer-motion
```

---

## 📁 File Structure to Create

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                     ← Landing page
│   └── dashboard/
│       └── page.tsx                 ← Main dashboard
├── components/
│   └── webgis/
│       ├── MapView.tsx
│       ├── ChatbotPanel.tsx
│       ├── AgentStatusBar.tsx
│       ├── HospitalCard.tsx
│       └── DashboardStats.tsx
├── lib/
│   └── mock/
│       ├── hospitals.ts
│       ├── chatResponses.ts
│       └── agentSteps.ts
└── types/
    └── index.ts

.env.example
next.config.js
tailwind.config.ts
```

---

## 🚫 Hard Rules (NEVER violate these)

1. **NO real API calls** — chatbot responses must come from `src/lib/mock/chatResponses.ts`
2. **NO external data fetching** — all data imports directly from `src/lib/mock/`
3. **NO new dependencies** beyond the list above
4. **NO localStorage / sessionStorage** — use React state only
5. **NO real patient data** — all data is synthetic/mock
6. **ALL new components** go inside `src/components/webgis/`
7. **ALL mock data** goes inside `src/lib/mock/`
8. **USE `'use client'`** on any component with state, effects, or browser APIs
9. **Mapbox token** must come from `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`
10. **TypeScript strict** — no `any` types, use interfaces from `src/types/index.ts`

---

## ✅ Definition of Done

The MVP is complete when ALL of the following work:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` passes without TypeScript errors
- [ ] `/` route shows landing page with "Enter Dashboard" button
- [ ] `/dashboard` route shows 3-panel layout: Chatbot | Map | Stats
- [ ] Map loads centered on Jakarta (`[106.8456, -6.2088]`, zoom 11)
- [ ] 15 hospital pins visible on the map
- [ ] Typing a location in chatbot triggers agent animation
- [ ] Agent animation shows 4 steps sequentially (1s each)
- [ ] Chatbot displays mock hospital recommendations after animation
- [ ] Clicking a hospital card zooms the map to that location
- [ ] DashboardStats shows 4 KPI cards
- [ ] Dark/light mode toggle works
- [ ] No console errors

---

## 🎨 Color Tokens (use in tailwind.config.ts)

```typescript
// Add to tailwind.config.ts theme.extend.colors
colors: {
  brand: {
    navy:    '#0f2d4a',
    teal:    '#01b4bc',
    tealDim: '#0a7b82',
    light:   '#e8f7f8',
  },
  agent: {
    retrieval:     '#3b82f6',  // blue
    spatial:       '#10b981',  // green
    visualization: '#f59e0b',  // amber
    report:        '#8b5cf6',  // purple
  }
}
```

---

## 🗺️ Mapbox Configuration

```typescript
// Map defaults
const MAP_CENTER: [number, number] = [106.8456, -6.2088]; // Jakarta
const MAP_ZOOM = 11;
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

// Hospital marker colors by status
const MARKER_AVAILABLE = '#10b981';   // green — beds available
const MARKER_LIMITED   = '#f59e0b';   // amber — < 5 beds
const MARKER_FULL      = '#ef4444';   // red   — no beds
```

---

## 💬 Chatbot Interaction Flow

```
1. User types in ChatbotPanel input box
2. On submit:
   a. Add user message to chat history
   b. Set agentRunning = true
   c. Trigger AgentStatusBar animation (4 steps × 1000ms each)
3. After 4000ms total:
   a. Set agentRunning = false
   b. Look up response from mockChatResponses (keyword match)
   c. Add assistant message to chat history
   d. Set recommendedHospitals from mock data
   e. Fly map camera to matched zone
4. Render HospitalCard for each recommended hospital
```

---

## 🧪 Three Demo Scenarios

These are the exact inputs that should be demonstrated:

| Input | Zone | Expected RS |
|-------|------|-------------|
| `"Pasien di Cempaka Putih"` | Jakarta Pusat | RSCM, RS Islam Jakarta, RS Pasar Rebo |
| `"Darurat di Kebayoran Baru"` | Jakarta Selatan | RS Fatmawati, RS Brawijaya, RS MMC |
| `"Ambulans dari Kelapa Gading"` | Jakarta Utara | RS Premier Kelapa Gading, RS Mitra Keluarga Kelapa Gading, RSUD Koja |

---

## 🚦 Agent Steps Spec

```typescript
// Each step: { id, name, icon, color, description, durationMs }
[
  { id: 1, name: 'Data Retrieval',     icon: 'Database',    color: '#3b82f6', description: 'Fetching hospital bed capacity & location data...', durationMs: 1000 },
  { id: 2, name: 'Spatial Analysis',  icon: 'MapPin',      color: '#10b981', description: 'Computing patient-to-hospital distances (PostGIS)...', durationMs: 1000 },
  { id: 3, name: 'Visualization',     icon: 'BarChart2',   color: '#f59e0b', description: 'Generating route overlays on WebGIS map...', durationMs: 1000 },
  { id: 4, name: 'Report Generator',  icon: 'FileText',    color: '#8b5cf6', description: 'Compiling ranked hospital recommendations...', durationMs: 1000 },
]
```

---

## 📊 DashboardStats KPI Cards

```typescript
// 4 KPI cards to show (use mock values)
[
  { label: 'RS Terjangkau',    value: '15',    unit: 'rumah sakit',  icon: 'Building2',  color: 'brand-teal' },
  { label: 'Rata-rata Jarak',  value: '4.2',   unit: 'km',           icon: 'Navigation', color: 'brand-teal' },
  { label: 'Kapasitas Bebas',  value: '67%',   unit: 'dari total',   icon: 'BedDouble',  color: 'agent-spatial' },
  { label: 'Response Time',    value: '< 8',   unit: 'menit (est.)', icon: 'Clock',      color: 'agent-retrieval' },
]
```
