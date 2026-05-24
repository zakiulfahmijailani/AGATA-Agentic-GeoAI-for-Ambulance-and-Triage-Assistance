# CODEX — Operational Instructions for AI Coding Agents

> This file is for AI coding agents (Codex, Cursor, Claude Code, Copilot Workspace).
> Read this FIRST before any other file. It overrides all assumptions.

---

## 🎯 Your Mission

Build the **AGATA WebGIS MVP** — a Next.js web application that showcases an Agentic GeoAI system for Jakarta ambulance hospital recommendations.

This is a **research prototype (TRL 3)**. All hospital data is real (234 hospitals from OpenStreetMap, seeded into Neon PostgreSQL). Patient/ambulance data is simulated.

---

## 📋 Mandatory Reading Order

1. **This file** (CODEX.md) — operational rules
2. `docs/DATASET.md` — what data exists, schema, guardrails ⚠️ read carefully
3. `docs/ARCHITECTURE.md` — why things are built this way
4. `docs/AGENT_BRIEF.md` — full feature spec (if exists)
5. `docs/UI_SPEC.md` — visual design rules (if exists)

---

## ⚙️ Technical Stack (DO NOT CHANGE)

```
Framework:    Next.js 14+ (App Router)
Language:     TypeScript (strict mode)
Styling:      Tailwind CSS v3
Map:          Leaflet + React-Leaflet   ← NOT Mapbox, NOT Google Maps
Database:     Neon PostgreSQL (via DATABASE_URL env)
Icons:        Lucide React
Animations:   Framer Motion (AgentStatusBar only)
Fonts:        Inter (body) via next/font/google
```

### Key Leaflet rules:
```typescript
// 1. ALWAYS use dynamic import with ssr: false for any Leaflet component
const MapView = dynamic(() => import('@/components/webgis/MapView'), { ssr: false })

// 2. Coordinates are ALWAYS [lat, lng] in Leaflet (NOT [lng, lat])
L.marker([-6.2088, 106.8456])  // ✅ correct
L.marker([106.8456, -6.2088])  // ❌ wrong — this is GeoJSON order

// 3. Import Leaflet CSS in the component
import 'leaflet/dist/leaflet.css'
```

### Installation:
```bash
npm install leaflet react-leaflet @types/leaflet lucide-react framer-motion
```

---

## 🗄️ Data Source

**Hospital data is in Neon PostgreSQL — NOT in mock files.**

- 234 real Jakarta hospitals seeded from OpenStreetMap (May 2026)
- Access via `DATABASE_URL` environment variable (injected by Vercel/Neon integration)
- Use the existing API routes — do NOT query Neon directly from client components

```typescript
// Available API routes:
GET /api/health                          // DB status + total hospital count
GET /api/hospitals                       // All hospitals (supports ?zone=&trauma_level=&er_status=)
GET /api/hospitals/nearest               // Nearest hospitals (?lat=&lng=&radius=10000&limit=3)
```

---

## 📁 File Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                     ← Landing page
│   ├── dashboard/
│   │   └── page.tsx                 ← Main dashboard
│   └── api/
│       ├── health/route.ts
│       ├── hospitals/route.ts
│       └── hospitals/nearest/route.ts
├── components/
│   └── webgis/
│       ├── MapView.tsx              ← Leaflet map (dynamic import, ssr:false)
│       ├── FilterPanel.tsx          ← Zone / trauma level / ER status filters
│       ├── ChatbotPanel.tsx
│       ├── AgentStatusBar.tsx
│       ├── HospitalCard.tsx
│       └── DashboardStats.tsx
├── lib/
│   └── mock/
│       ├── chatResponses.ts         ← Mock chatbot responses only
│       ├── agentSteps.ts            ← Agent animation steps
│       └── ambulances.ts            ← Mock ambulance positions (3-5 points)
└── types/
    └── index.ts
```

---

## 🚫 Hard Rules (NEVER violate these)

1. **NO Mapbox** — use Leaflet only. Never import `mapbox-gl`
2. **NO direct DB calls from client** — only via `/api/*` routes
3. **NO new npm packages** without explicit approval
4. **NO localStorage / sessionStorage** — React state only
5. **NO real patient data** — patient/ambulance data is always simulated
6. **NO OSRM or road routing** — use Euclidean/Haversine distance only
7. **NO Pinecone / pgvector / embeddings** — out of scope for TRL 3
8. **ALL map components** must use `dynamic()` with `ssr: false`
9. **ALL new components** go inside `src/components/webgis/`
10. **TypeScript strict** — no `any` types, use interfaces from `src/types/index.ts`
11. **Never drop or truncate** the `hospitals` table in Neon

---

## 🗺️ Map Configuration

```typescript
// Map defaults — Jakarta center
const MAP_CENTER: [number, number] = [-6.2088, 106.8456]  // [lat, lng] for Leaflet
const MAP_ZOOM = 11
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

// Hospital marker colors by ER status
const MARKER_AVAILABLE = '#10b981'  // green
const MARKER_BUSY      = '#f59e0b'  // amber
const MARKER_FULL      = '#ef4444'  // red
```

---

## 🎨 Color Tokens

```typescript
// tailwind.config.ts — theme.extend.colors
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

## 💬 Chatbot Interaction Flow

```
1. User types location in ChatbotPanel input
2. On submit:
   a. Add user message to chat history
   b. Set agentRunning = true
   c. Trigger AgentStatusBar animation (4 steps × 1000ms)
3. After 4000ms:
   a. Call GET /api/hospitals/nearest?lat=...&lng=...&limit=3
   b. Set agentRunning = false
   c. Add assistant message with recommendations
   d. Set recommendedHospitals from API response
   e. Fly map camera to matched location
4. Render HospitalCard for each recommended hospital
```

---

## 🚦 Agent Steps Spec

```typescript
[
  { id: 1, name: 'Data Retrieval',    icon: 'Database',  color: '#3b82f6', description: 'Querying 234 hospitals from Neon PostgreSQL...', durationMs: 1000 },
  { id: 2, name: 'Spatial Analysis',  icon: 'MapPin',    color: '#10b981', description: 'Computing distances via PostGIS ST_DWithin...', durationMs: 1000 },
  { id: 3, name: 'Visualization',     icon: 'BarChart2', color: '#f59e0b', description: 'Rendering hospital markers on Leaflet map...', durationMs: 1000 },
  { id: 4, name: 'Report Generator',  icon: 'FileText',  color: '#8b5cf6', description: 'Compiling ranked hospital recommendations...', durationMs: 1000 },
]
```

---

## 📊 DashboardStats KPI Cards

```typescript
// Fetch count from /api/health for first card; rest are estimates
[
  { label: 'Hospitals Available', value: '234',   unit: 'hospitals',    icon: 'Building2',  color: 'brand-teal'       },
  { label: 'Avg. Distance',       value: '4.2',   unit: 'km',           icon: 'Navigation', color: 'brand-teal'       },
  { label: 'Free Capacity',       value: '~38%',  unit: 'of total',     icon: 'BedDouble',  color: 'agent-spatial'    },
  { label: 'Response Time',       value: '< 8',   unit: 'min (est.)',   icon: 'Clock',      color: 'agent-retrieval'  },
]
```

---

## 🧪 Demo Scenarios

| Input | Expected zone | Action |
|---|---|---|
| `"Patient at Cempaka Putih"` | Jakarta Pusat | Fly to Pusat, show 3 nearest hospitals |
| `"Emergency at Kebayoran Baru"` | Jakarta Selatan | Fly to Selatan, show 3 nearest hospitals |
| `"Ambulance from Kelapa Gading"` | Jakarta Utara | Fly to Utara, show 3 nearest hospitals |

---

## ✅ Definition of Done

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `/` route shows landing page
- [ ] `/dashboard` shows 3-panel layout: Chatbot | Map | Stats
- [ ] Map loads centered on Jakarta using Leaflet (not Mapbox)
- [ ] 234 hospital pins visible on the map from Neon API
- [ ] Pins colored by ER status (green / amber / red)
- [ ] Filter by zone, trauma level, ER status works
- [ ] Chatbot triggers agent animation then shows nearest hospitals
- [ ] Clicking a hospital card flies the map to that location
- [ ] KPI card shows 234 hospitals (from `/api/health`)
- [ ] No console errors
