# AGENT BRIEF — AGATA WebGIS MVP

> **For AI coding agents:** This is the complete feature specification.  
> Read `CODEX.md` first for operational rules, then this file for feature details.

---

## Project Summary

**AGATA** (Agentic GeoAI for Ambulance and Triage Assistance) is a WebGIS MVP for a Universitas Bakrie × Cardiff University research proposal. The system demonstrates how an AI agent pipeline can recommend hospitals to ambulance dispatchers in real time, based on distance and bed capacity.

This MVP is for **proposal showcase only** — all data is mocked, no real APIs are called.

---

## Pages to Build

### Page 1: Landing (`/`)

A minimal, professional landing page that sets context before entering the dashboard.

**Must contain:**
- Logo/wordmark: `AGATA` in brand navy + teal accent
- Tagline: *"Agentic GeoAI untuk Rekomendasi Rumah Sakit Ambulans Jakarta"*
- Sub-tagline: *"Universitas Bakrie × Cardiff University | Research Proposal 2025–2026"*
- 3 feature badges: `🏥 15 Rumah Sakit` · `🤖 4 AI Agents` · `📍 Real-time GeoAI`
- One CTA button: `Buka Dashboard →` (links to `/dashboard`)
- Footer: SDG badges (SDG 3, SDG 9, SDG 11) + peneliti names
- Background: dark navy (`#0f2d4a`) with subtle grid pattern

---

### Page 2: Dashboard (`/dashboard`)

The main interface. Three-panel layout:

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: Logo | AgentStatusBar (center) | Stats toggle (right)│
├──────────────────────────────────────────────────────────────┤
│              │                              │                  │
│  CHATBOT     │      MAP (Mapbox GL)         │  HOSPITAL        │
│  PANEL       │                             │  CARDS           │
│  (300px)     │   Full height, flex-grow     │  (320px)         │
│              │                             │  (slide in when  │
│  Chat input  │   Hospital pins overlay     │  results ready)  │
│  at bottom   │   Route highlight           │                  │
│              │                             │  DashboardStats  │
│              │                             │  at bottom       │
└──────────────┴─────────────────────────────┴──────────────────┘
```

**Header (full width):**
- Left: AGATA logo + `WebGIS Dashboard` label
- Center: `AgentStatusBar` component (shows pipeline status)
- Right: dark/light toggle icon + `?` help tooltip

**Left Panel — ChatbotPanel (300px fixed):**
- Title: `Asisten AGATA` with robot icon
- Chat message list (scrollable, flex-grow)
- On load: show system message: *"Selamat datang di AGATA. Ketik lokasi pasien untuk mendapatkan rekomendasi rumah sakit terdekat."*
- Text input + send button at bottom
- Show typing indicator (3 dots animation) while agents are running
- Message bubbles: user (right, teal bg) / assistant (left, surface bg)
- Each assistant message that contains recommendations shows `HospitalCard` components below the text

**Center Panel — MapView (flex-grow):**
- Mapbox GL map, dark style (`mapbox://styles/mapbox/dark-v11`)
- Default center: Jakarta `[106.8456, -6.2088]`, zoom 11
- Show all 15 hospital pins (colored by bed availability status)
- Legend overlay (bottom-left): green=tersedia / amber=terbatas / red=penuh
- On recommendation: highlight 3 recommended hospitals with larger animated pulse marker
- On recommendation: draw mock route lines from a demo patient pin to each hospital
- Patient pin: different icon (ambulance emoji or red cross)

**Right Panel — Hospital Results + Stats (320px fixed):**
- Initially shows `DashboardStats` (4 KPI cards)
- When recommendations arrive: slide in `HospitalCard` list above stats
- `HospitalCard` shows: rank badge | hospital name | distance | beds available | status badge | `Pilih` button
- `Pilih` button: flies map camera to that hospital's coordinates

---

## Components Specification

### `MapView.tsx`

```typescript
interface MapViewProps {
  hospitals: Hospital[];
  recommendedIds?: string[];     // highlight these hospitals
  patientLocation?: [number, number];
  onHospitalClick: (hospital: Hospital) => void;
}
```

**Behavior:**
- `mapbox-gl` map, full height of container
- Each hospital: circular marker, colored by `bedsAvailable / totalBeds` ratio
- On `recommendedIds` change: add pulse animation CSS to those markers
- On `patientLocation` change: add ambulance pin + draw dashed lines to recommended hospitals
- Map controls: zoom +/-, fullscreen, north reset
- `'use client'` required (browser API)

---

### `ChatbotPanel.tsx`

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  hospitals?: Hospital[];   // if present, render HospitalCards after message
}

interface ChatbotPanelProps {
  onQuerySubmit: (query: string) => void;
  messages: Message[];
  isLoading: boolean;       // shows typing indicator
}
```

---

### `AgentStatusBar.tsx`

```typescript
interface AgentStep {
  id: number;
  name: string;
  icon: string;        // Lucide icon name
  color: string;       // hex
  description: string;
  status: 'idle' | 'running' | 'done';
}

interface AgentStatusBarProps {
  steps: AgentStep[];
  isRunning: boolean;
  currentStep: number; // 0-indexed, -1 when idle
}
```

**Visual:** 4 pill/badge items in a horizontal row connected by animated dots. When `isRunning`:
- Steps before `currentStep`: green checkmark, dimmed
- `currentStep`: pulsing spinner + highlighted color
- Steps after: grey, inactive

Use **Framer Motion** for the transitions between states.

---

### `HospitalCard.tsx`

```typescript
interface HospitalCardProps {
  hospital: Hospital;
  rank?: number;             // 1, 2, 3 for top recommendations
  isRecommended?: boolean;   // adds highlight border
  onSelect: (hospital: Hospital) => void;
}
```

**Visual:**
- Rank badge (gold/silver/bronze for 1/2/3)
- Hospital name (bold)
- Distance: `2.1 km` with navigation icon
- Beds: `12 / 40 tersedia` with bed icon
- Status badge: `Tersedia` (green) / `Terbatas` (amber) / `Penuh` (red)
- `Pilih RS Ini` button → calls `onSelect`

---

### `DashboardStats.tsx`

```typescript
interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: string;   // Lucide icon name
  color: string;  // tailwind color class
}
```

4 stat cards stacked vertically (right panel, bottom section).

---

## State Management (in `/dashboard/page.tsx`)

All state lives in the dashboard page component:

```typescript
const [messages, setMessages] = useState<Message[]>([initialSystemMessage]);
const [isAgentRunning, setIsAgentRunning] = useState(false);
const [currentAgentStep, setCurrentAgentStep] = useState(-1);
const [recommendedHospitals, setRecommendedHospitals] = useState<Hospital[]>([]);
const [patientLocation, setPatientLocation] = useState<[number,number] | undefined>();
const [agentSteps, setAgentSteps] = useState<AgentStep[]>(mockAgentSteps);
```

**`handleQuerySubmit` function logic:**
```typescript
async function handleQuerySubmit(query: string) {
  // 1. Add user message
  // 2. setIsAgentRunning(true), setCurrentAgentStep(0)
  // 3. Loop steps with setTimeout (1000ms each), updating currentStep
  // 4. After all steps: setIsAgentRunning(false), setCurrentAgentStep(-1)
  // 5. Match query to mockChatResponses (keyword matching)
  // 6. setRecommendedHospitals from matched scenario
  // 7. setPatientLocation for matched scenario
  // 8. Add assistant message with hospitals attached
}
```
