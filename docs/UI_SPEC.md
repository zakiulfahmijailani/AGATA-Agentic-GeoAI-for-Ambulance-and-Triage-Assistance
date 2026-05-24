# UI_SPEC.md — WebGIS MVP: Ambulance Hospital Recommendation Dashboard

Dokumen ini adalah spesifikasi visual dan komponen untuk AI agent yang membangun WebGIS MVP.
Tujuan: **showcase proposal riset**, bukan produksi. Tampilan harus terlihat seperti sistem GovTech/smart city yang profesional dan credible secara akademik.

---

## 1. Design Language

### Tone & Persona
- **Smart City / GovTech** — bersih, data-dense, terpercaya
- Mengacu pada produk seperti: Jakarta Smart City Dashboard, WHO Health GIS Portal
- Bukan startup SaaS — lebih serius, institutional, research-oriented
- Dark mode default (peta gelap lebih mudah dibaca untuk GIS)

### Color Palette

```css
:root {
  /* Backgrounds */
  --color-bg:            #0b1120;   /* navy gelap — background utama */
  --color-surface:       #111827;   /* panel sidebar, card */
  --color-surface-2:     #1a2234;   /* hover state, nested card */
  --color-border:        #1e2d45;   /* border subtle */

  /* Text */
  --color-text:          #e2e8f0;   /* teks utama */
  --color-text-muted:    #94a3b8;   /* teks sekunder */
  --color-text-faint:    #475569;   /* label, metadata */

  /* Accent — Teal (GeoAI / Healthcare) */
  --color-primary:       #0ea5e9;   /* biru langit — link, CTA, highlight */
  --color-primary-glow:  #0ea5e922; /* glow di belakang elemen aktif */
  --color-teal:          #14b8a6;   /* agen aktif, status tersedia */
  --color-teal-dim:      #14b8a620;

  /* Status */
  --color-success:       #22c55e;   /* RS tersedia */
  --color-warning:       #f59e0b;   /* RS terbatas */
  --color-error:         #ef4444;   /* RS penuh */

  /* Agen Pipeline Colors */
  --color-agent-1:       #818cf8;   /* Data Retrieval — ungu */
  --color-agent-2:       #0ea5e9;   /* Spatial Analysis — biru */
  --color-agent-3:       #14b8a6;   /* Data Visualization — teal */
  --color-agent-4:       #22c55e;   /* Report Generator — hijau */
}
```

### Typography

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Elemen | Font | Size | Weight |
|--------|------|------|--------|
| App title / judul halaman | Inter | 1.25rem | 700 |
| Section heading | Inter | 0.875rem | 600 |
| Body / chat text | Inter | 0.875rem | 400 |
| Label, badge, metadata | Inter | 0.75rem | 500 |
| Koordinat, data teknis | JetBrains Mono | 0.75rem | 400 |
| KPI angka besar | Inter | 1.75rem | 700 |

**Tidak ada font display besar** — ini dashboard bukan landing page.

---

## 2. Layout Dashboard Utama (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TOPBAR (56px)  — Logo | Judul Proyek | AgentStatusBar | Timestamp     │
├──────────────────┬──────────────────────────────────┬───────────────────┤
│                  │                                  │                   │
│  CHATBOT PANEL   │        MAPBOX MAP CANVAS         │  HOSPITAL LIST    │
│  (320px, fixed)  │      (flex-grow, 100%)           │  PANEL            │
│                  │                                  │  (340px)          │
│  - Input bar     │  - Marker RS (custom icon)       │  - slide-in       │
│  - Chat history  │  - Garis rute mock               │    saat ada       │
│  - Suggestion    │  - Popup info RS                 │    rekomendasi    │
│    chips         │  - Radius coverage               │                   │
│                  │                                  │  - Default:       │
│                  │                                  │    KPI Stats      │
│                  │                                  │    cards          │
│                  │                                  │                   │
└──────────────────┴──────────────────────────────────┴───────────────────┘
```

### Topbar

- **Logo**: SVG inline — ikon peta + pulse (ambulance/emergency)
- **Judul**: "Agentic GeoAI — Jakarta Ambulance Recommendation"
- **AgentStatusBar** (tengah-kanan): pill kecil yang beranimasi saat agent berjalan
- **Timestamp**: live clock `HH:MM:SS` dengan JetBrains Mono
- Background: `--color-surface` + `border-bottom: 1px solid var(--color-border)`
- Height: `56px`

### Chatbot Panel (Kiri, 320px)

- Background: `--color-surface`
- Border-right: `1px solid var(--color-border)`
- Chat bubbles:
  - **User**: align right, `background: var(--color-primary)`, warna teks putih
  - **Assistant**: align left, `background: var(--color-surface-2)`, teks `--color-text`
- **Suggestion chips**: 3 buah, border teal, klik otomatis isi input
- **Input bar**: bottom sticky, input `background: --color-surface-2`

### Mapbox Map Canvas (Tengah, flex-grow)

- **Style**: `mapbox://styles/mapbox/dark-v11` (dark map wajib)
- **Default center**: `[106.8456, -6.2088]` (Jakarta Pusat)
- **Default zoom**: `11`
- **Custom markers RS**:
  - Tersedia: ikon `+` berwarna `--color-success` (hijau)
  - Terbatas: ikon `+` berwarna `--color-warning` (kuning)
  - Penuh: ikon `+` berwarna `--color-error` (merah)
- **Marker pasien**: ikon bintang/pulse berwarna `--color-primary`
- **Popup** saat klik marker: nama RS, status, jumlah beds tersedia
- **Radius circle**: lingkaran transparan 5km dari posisi pasien (fill `#0ea5e915`, stroke `#0ea5e9`)
- **Mock route line**: `LineString` GeoJSON dari titik pasien ke RS terdekat, warna `--color-teal`, `line-width: 2`, `line-dasharray: [2, 1]`

### Hospital List Panel (Kanan, 340px)

**Default state** (sebelum ada query): tampilkan 4 KPI cards

**Active state** (setelah ada rekomendasi): list HospitalCard dengan rank, nama, jarak, kapasitas bar, status badge, tombol "Lihat di Peta"

---

## 3. Komponen Inventory

### `<Topbar />`
- Props: `agentStatus: AgentStep | null`, `isRunning: boolean`
- Berisi: Logo SVG, judul, AgentStatusBar, LiveClock

### `<AgentStatusBar />`
- Props: `steps: AgentStep[]`, `currentStep: number`, `isRunning: boolean`
- Tampilan saat idle: `● Sistem Siap` (teal)
- Tampilan saat running: pill animasi dengan nama agen saat ini + spinner kecil
- Tampilan saat selesai: `✓ Analisis Selesai` (hijau, 2 detik lalu fade ke idle)
- Animasi: `opacity` fade + subtle slide dari kiri

### `<ChatbotPanel />`
- State: `messages: Message[]`, `inputValue: string`, `isLoading: boolean`
- Saat kirim pesan: trigger `onQuery(input)` → parent mulai pipeline agen
- Render `content` dengan `react-markdown`
- Auto-scroll ke bawah setiap ada pesan baru

### `<MapView />`
- Props: `hospitals: Hospital[]`, `patientLocation: [number,number] | null`, `recommendedIds: string[]`
- Gunakan `mapbox-gl` langsung (bukan react-map-gl)
- `useEffect` untuk init map, cleanup saat unmount
- `recommendedIds`: highlight marker RS yang direkomendasikan (scale up + glow)

### `<HospitalCard />`
- Props: `hospital: Hospital`, `rank: number`, `isRecommended: boolean`
- Tampilan: nomor ranking, nama, jarak, kapasitas bar, status badge, tombol "Lihat di Peta"

### `<KpiCard />`
- Props: `value: string`, `label: string`, `icon: ReactNode`, `color?: string`
- Ukuran: setengah lebar panel, height 80px

### `<AgentPipelineVisualizer />` (opsional)
- 4 kotak agen berurutan dengan connector arrow `→`
- State aktif: border glow + warna agen

---

## 4. Landing Page (`/`)

- Background: `--color-bg` + subtle grid pattern CSS
- Logo SVG ambulance + map pulse
- Judul, subjudul, badge "Universitas Bakrie × Cardiff University"
- CTA button `[ Buka Dashboard → ]`
- Footer kecil: "Agentic GeoAI 2023–2027 (TRL 3 Phase)"

---

## 5. Interaksi & Animasi

### Alur Interaksi Utama (setTimeout chain)

```
1. User submit input di ChatbotPanel
2. Bubble user muncul (langsung)
3. AgentStatusBar: mulai pipeline
   - Step 1 (1000ms): "● Data Retrieval Agent — Mengambil data RS..."
   - Step 2 (1000ms): "● Spatial Analysis Agent — Menghitung jarak..."
   - Step 3 (800ms):  "● Data Visualization Agent — Menyiapkan peta..."
   - Step 4 (600ms):  "● Report Generator Agent — Menyusun rekomendasi..."
4. MapView: zoom ke area pasien, munculkan markers + radius circle + route line
5. HospitalCard muncul di panel kanan (slide-in dari kanan)
6. Bubble assistant muncul di chat dengan respons lengkap
7. AgentStatusBar: "✓ Analisis Selesai" → fade ke idle
```

### CSS Animations

```css
@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes markerPulse {
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%       { transform: scale(1.3); opacity: 0.8; }
}
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%            { transform: translateY(-6px); }
}
@keyframes agentFadeIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

---

## 6. File Structure yang Harus Dibuat Agent

```
src/
├── app/
│   ├── page.tsx                          ← Landing page
│   └── dashboard/
│       └── page.tsx                      ← Dashboard utama
├── components/
│   └── webgis/
│       ├── Topbar.tsx
│       ├── AgentStatusBar.tsx
│       ├── ChatbotPanel.tsx
│       ├── MapView.tsx
│       ├── HospitalCard.tsx
│       ├── KpiCard.tsx
│       ├── AgentPipelineVisualizer.tsx   ← opsional
│       └── index.ts
├── lib/
│   └── mock/
│       ├── hospitals.ts
│       ├── chatResponses.ts
│       ├── agentSteps.ts
│       └── dashboardStats.ts
└── types/
    └── webgis.ts
```

### `types/webgis.ts`

```typescript
export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  bedsAvailable: number;
  totalBeds: number;
  icuAvailable: number;
  totalIcu: number;
  status: 'Tersedia' | 'Terbatas' | 'Penuh';
  specialization: string[];
  address: string;
  distances: Record<ScenarioId, number>;
}

export type ScenarioId = 'cempaka-putih' | 'jakarta-selatan' | 'jakarta-timur';

export interface AgentStep {
  id: number;
  name: string;
  description: string;
  durationMs: number;
  color: string;
  outputSummary: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatScenario {
  id: ScenarioId;
  triggerKeywords: string[];
  patientLocation: [number, number];
  patientLabel: string;
  agentThinking: string;
  recommendedHospitalIds: string[];
  responseMarkdown: string;
}

export interface KpiStat {
  value: string;
  label: string;
  iconName: string;
  color: string;
}
```

---

## 7. Dependency yang Diizinkan

```json
{
  "mapbox-gl": "^3.x",
  "@types/mapbox-gl": "^3.x",
  "react-markdown": "^9.x"
}
```

**JANGAN install**: `react-map-gl`, `leaflet`, `deck.gl`, `axios`, `swr`, `zustand`

---

## 8. Environment Variable

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZGVtby10b2tlbiIsImEiOiJja...
```

---

## 9. Hal yang TIDAK Perlu Dikerjakan Agent

- ❌ Autentikasi / login
- ❌ API routes (`/api/*`)
- ❌ Koneksi database
- ❌ Pemanggilan LLM nyata
- ❌ Unit test / E2E test
- ❌ Deployment config
- ❌ PWA / service worker
- ❌ Internasionalisasi

---

*Dokumen ini dibaca bersama `AGENT_BRIEF.md`, `MOCK_DATA_SPEC.md`, dan `ARCHITECTURE.md`.*
