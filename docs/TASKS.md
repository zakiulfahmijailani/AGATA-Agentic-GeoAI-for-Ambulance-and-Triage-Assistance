# TASKS.md — AGATA WebGIS MVP: Agent Execution Checklist

Dokumen ini adalah daftar tugas terurut yang harus dikerjakan AI agent (Codex/ChatGPT)
untuk membangun WebGIS MVP AGATA dari awal hingga bisa dijalankan dengan `npm run dev`.

Baca semua dokumen berikut sebelum mulai:
- `CODEX.md` — instruksi operasional agent
- `docs/AGENT_BRIEF.md` — konteks proyek dan scope MVP
- `docs/MOCK_DATA.md` — semua data mock yang harus digunakan (GUNAKAN INI, bukan MOCK_DATA_SPEC.md)
- `docs/UI_SPEC.md` — spesifikasi visual, layout, dan komponen
- `docs/ARCHITECTURE.md` — arsitektur sistem dan alasan desain

---

## Urutan Pengerjaan

### FASE 1 — Fondasi Types & Mock Data

- [ ] **TASK-01**: Buat `src/types/index.ts`
  - Salin semua interface dari `docs/MOCK_DATA.md` section "TypeScript Interface"
  - Interface: `Hospital`, `BedStatus`, `AgentStep`, `DemoScenario`
  - Pastikan semua field sesuai persis (termasuk `shortName`, `phone`, `level`, `zone`)

- [ ] **TASK-02**: Buat `src/lib/mock/hospitals.ts`
  - Salin array `mockHospitals` dari `docs/MOCK_DATA.md` section "Hospital Data"
  - 15 rumah sakit, 5 zona Jakarta (Pusat, Selatan, Timur, Utara, Barat)
  - Jangan ubah koordinat, id, atau data apapun

- [ ] **TASK-03**: Buat `src/lib/mock/chatResponses.ts`
  - Salin `demoScenarios`, `defaultChatResponse`, dan fungsi `matchScenario()` dari `docs/MOCK_DATA.md`
  - Pastikan `matchScenario` bisa dipanggil dari komponen chatbot

- [ ] **TASK-04**: Buat `src/lib/mock/agentSteps.ts`
  - Salin `mockAgentSteps` dari `docs/MOCK_DATA.md` section "Agent Steps Data"
  - 4 langkah: Data Retrieval, Spatial Analysis, Visualization, Report Generator
  - Masing-masing `durationMs: 1000`

- [ ] **TASK-05**: Buat `src/lib/mock/dashboardStats.ts`
  ```typescript
  export const dashboardStats = [
    { value: '15', label: 'RS Terpantau', color: '#0ea5e9' },
    { value: '3.2 km', label: 'Rata-rata Jarak', color: '#14b8a6' },
    { value: '68%', label: 'Kapasitas Tersedia', color: '#22c55e' },
    { value: '~4s', label: 'Waktu Respons Agen', color: '#818cf8' },
  ];
  ```

---

### FASE 2 — Komponen UI

- [ ] **TASK-06**: Buat `src/components/webgis/KpiCard.tsx`
  - Props: `value: string`, `label: string`, `color?: string`
  - Tampilan: background `#1a2234`, angka besar (1.75rem bold), label kecil di bawah
  - Width: 50% panel (gunakan grid 2 kolom di parent)

- [ ] **TASK-07**: Buat `src/components/webgis/AgentStatusBar.tsx`
  - Props: `steps: AgentStep[]`, `currentStepId: number | null`, `isRunning: boolean`, `isDone: boolean`
  - Idle: tampilkan `● Sistem Siap` (warna teal `#14b8a6`)
  - Running: tampilkan nama agen saat ini + spinner dot-bounce
  - Done: tampilkan `✓ Analisis Selesai` (hijau, lalu fade ke idle setelah 2 detik)
  - Animasi: CSS `agentFadeIn` keyframe (lihat `docs/UI_SPEC.md`)

- [ ] **TASK-08**: Buat `src/components/webgis/HospitalCard.tsx`
  - Props: `hospital: Hospital`, `rank: number`, `distance: number`
  - Tampilkan: badge rank (#1/#2/#3), nama, shortName, jarak (km), beds tersedia, level (Tipe A/B/C)
  - Status badge: `available`=hijau, `limited`=kuning, `full`=merah (gunakan logika `BedStatus` dari types)
  - Animasi masuk: `slideInRight` keyframe

- [ ] **TASK-09**: Buat `src/components/webgis/ChatbotPanel.tsx`
  - State: `messages`, `inputValue`, `isLoading`
  - Pesan awal (system): "Halo! Saya AGATA... masukkan lokasi pasien..."
  - Suggestion chips: `"Cempaka Putih"`, `"Jakarta Selatan"`, `"Kelapa Gading"`
  - Saat submit: panggil `onQuery(input)` prop
  - Render markdown dengan `react-markdown`
  - Auto-scroll ke bawah setiap ada pesan baru
  - Typing indicator: 3 dot bounce saat `isLoading === true`

- [ ] **TASK-10**: Buat `src/components/webgis/MapView.tsx`
  - Props: `hospitals: Hospital[]`, `patientLocation: [number,number] | null`, `recommendedIds: string[]`
  - **WAJIB**: Gunakan `react-leaflet` + `leaflet` — JANGAN gunakan mapbox-gl
  - **WAJIB**: Tambahkan `'use client'` directive di baris pertama
  - **WAJIB**: File ini harus di-import dengan `dynamic()` + `{ ssr: false }` dari parent (lihat TASK-13)
  - Tile map: Carto Dark Matter (gratis, tanpa token)
    ```
    https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
    ```
  - Attribution: `&copy; <a href="https://carto.com">CARTO</a>`
  - Default center: `[−6.2088, 106.8456]` *(perhatian: Leaflet pakai [lat, lng] bukan [lng, lat])*
  - Default zoom: `11`
  - Marker RS: gunakan `L.divIcon()` dengan warna sesuai status:
    - `available` (beds ≥ 5): `#22c55e` hijau
    - `limited` (beds 1–4): `#f59e0b` kuning
    - `full` (beds = 0): `#ef4444` merah
  - Marker pasien: `L.divIcon()` dengan CSS pulse animation, warna `#0ea5e9`
  - Popup klik marker RS: tampilkan nama, shortName, beds tersedia, level
  - Saat `patientLocation` berubah: `map.flyTo(patientLocation, 13)`
  - Saat `patientLocation` berubah: tambahkan `L.circle()` radius 5000m (5km), warna `#0ea5e9` transparan
  - Saat `recommendedIds` berubah: highlight marker RS yang direkomendasikan (scale lebih besar + border glow)
  - Import CSS Leaflet di file ini: `import 'leaflet/dist/leaflet.css'`
  - Fix icon default Leaflet di Next.js:
    ```typescript
    import L from 'leaflet';
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
    ```

- [ ] **TASK-11**: Buat `src/components/webgis/Topbar.tsx`
  - Props: `currentStepId: number | null`, `isRunning: boolean`, `isDone: boolean`
  - Kiri: Logo SVG (ikon ambulance/cross sederhana) + teks "AGATA — Agentic GeoAI Ambulance"
  - Tengah-kanan: `<AgentStatusBar />` terintegrasi
  - Kanan: live clock `HH:MM:SS` dengan `useEffect` interval 1 detik, font JetBrains Mono
  - Height: 56px, background `#111827`, border-bottom `1px solid #1e2d45`

- [ ] **TASK-12**: Buat `src/components/webgis/index.ts` (barrel export)
  ```typescript
  export { default as Topbar } from './Topbar';
  export { default as ChatbotPanel } from './ChatbotPanel';
  export { default as HospitalCard } from './HospitalCard';
  export { default as KpiCard } from './KpiCard';
  export { default as AgentStatusBar } from './AgentStatusBar';
  // MapView TIDAK di-export dari sini — harus pakai dynamic import di page.tsx
  ```

---

### FASE 3 — Halaman & Logika Utama

- [ ] **TASK-13**: Buat `src/app/dashboard/page.tsx`
  - `'use client'` directive
  - Import MapView dengan dynamic (WAJIB untuk Leaflet):
    ```typescript
    import dynamic from 'next/dynamic';
    const MapView = dynamic(() => import('@/components/webgis/MapView'), { ssr: false });
    ```
  - State: `messages`, `patientLocation`, `recommendedIds`, `currentStepId`, `isRunning`, `isDone`, `recommendedHospitals`
  - Layout: full-height flex column
    - Row 1: `<Topbar />` (56px)
    - Row 2: flex row, height `calc(100vh - 56px)`
      - Col 1: `<ChatbotPanel />` (320px, fixed width)
      - Col 2: `<MapView />` (flex-grow)
      - Col 3: Panel kanan 340px
        - Jika belum ada rekomendasi: grid 2x2 `<KpiCard />`
        - Jika ada rekomendasi: list `<HospitalCard />` (max 3, dengan rank dan distance)
  - Fungsi `handleQuery(input: string)`:
    ```
    1. Tambah bubble user ke messages
    2. Set isRunning = true, isLoading = true
    3. Jalankan setTimeout chain:
       - +1000ms: currentStepId = 1
       - +2000ms: currentStepId = 2
       - +3000ms: currentStepId = 3
       - +4000ms: currentStepId = 4
       - +4000ms: jalankan matchScenario(input)
         - Jika match: set patientLocation, recommendedIds, recommendedHospitals, tambah bubble assistant
         - Jika tidak: tambah bubble defaultChatResponse
         - Set isDone=true, isRunning=false, isLoading=false, currentStepId=null
    ```

- [ ] **TASK-14**: Update `src/app/page.tsx` (Landing Page)
  - Background: `#0b1120` + subtle CSS grid pattern
  - Logo SVG sederhana (ambulance cross atau map pin dengan pulse)
  - Judul besar: "AGATA"
  - Subjudul: "Agentic GeoAI for Ambulance and Triage Assistance"
  - Deskripsi: "Sistem rekomendasi rumah sakit berbasis multi-agent AI dan analisis geospasial real-time"
  - Badge institusi: "Universitas Bakrie × Cardiff University"
  - CTA Button: `<Link href="/dashboard">Buka Dashboard →</Link>`
  - Footer: "Agentic GeoAI Research Roadmap 2023–2027 — TRL Phase 3"

---

### FASE 4 — Styling & Konfigurasi

- [ ] **TASK-15**: Update `src/app/globals.css`
  - Tambahkan CSS variables dari `docs/UI_SPEC.md` section "Color Palette"
  - Tambahkan keyframes: `slideInRight`, `markerPulse`, `typingBounce`, `agentFadeIn`
  - Set `body { background: var(--color-bg); color: var(--color-text); }`
  - Import Google Fonts Inter + JetBrains Mono via `@import`

- [ ] **TASK-16**: Update `tailwind.config.ts`
  - Extend colors dengan semua `--color-*` variables
  - Extend fontFamily: `inter` dan `mono`

- [ ] **TASK-17**: Install dependencies jika belum ada
  ```bash
  npm install leaflet react-leaflet @types/leaflet react-markdown
  ```
  - ⛔ JANGAN install: `mapbox-gl`, `@types/mapbox-gl`, `react-map-gl`
  - Cek `package.json` dulu sebelum install

- [ ] **TASK-18**: Salin Leaflet marker icons ke folder `public/leaflet/`
  - Copy file-file berikut dari `node_modules/leaflet/dist/images/` ke `public/leaflet/`:
    - `marker-icon.png`
    - `marker-icon-2x.png`
    - `marker-shadow.png`
  - Ini diperlukan karena Next.js tidak bisa resolve asset path Leaflet secara otomatis

- [ ] **TASK-19**: TIDAK PERLU `.env.local`
  - Leaflet + Carto tiles tidak memerlukan API token apapun
  - Hapus atau abaikan referensi `NEXT_PUBLIC_MAPBOX_TOKEN` jika ada

---

### FASE 5 — Verifikasi

- [ ] **TASK-20**: `npm run dev` — tidak ada error
- [ ] **TASK-21**: `localhost:3000` — landing page tampil
- [ ] **TASK-22**: Klik "Buka Dashboard" — 3-panel dashboard tampil, peta Carto dark muncul
- [ ] **TASK-23**: Ketik `"Cempaka Putih"` — verifikasi 4 agent steps + peta zoom + 3 HospitalCard
- [ ] **TASK-24**: Ketik `"Jakarta Selatan"` — skenario kedua berjalan
- [ ] **TASK-25**: Ketik `"Kelapa Gading"` — skenario ketiga berjalan
- [ ] **TASK-26**: Ketik input acak misal `"Bandung"` — defaultChatResponse muncul

---

## Catatan Penting untuk Agent

- **Prioritas**: Selesaikan FASE 1 sebelum FASE 2. Jangan mulai komponen sebelum types dan mock data selesai.
- **Sumber data tunggal**: Gunakan `docs/MOCK_DATA.md`. Abaikan `docs/MOCK_DATA_SPEC.md`.
- **Tidak perlu**: API routes, database, autentikasi, unit test, deployment config, env token.
- **⚠️ Leaflet SSR**: MapView WAJIB di-import dengan `dynamic(() => import(...), { ssr: false })` di dashboard/page.tsx. Tanpa ini akan error `window is not defined`.
- **⚠️ Koordinat Leaflet**: Format `[lat, lng]` — KEBALIKAN dari Mapbox yang `[lng, lat]`.
- **Error path alias**: pastikan `tsconfig.json` punya `"paths": { "@/*": ["./src/*"] }`.

---

*Dokumen ini adalah checklist operasional. Baca `docs/AGENT_BRIEF.md` untuk konteks penuh proyek.*
