# MOCK_DATA_SPEC.md — WebGIS MVP: Spesifikasi Data Mock

Dokumen ini mendefinisikan semua data palsu (mock data) yang digunakan oleh WebGIS MVP.
Semua data **statis**, tidak ada koneksi API atau database. Agent cukup buat file TypeScript di `/src/lib/mock/`.

---

## 1. `hospitals.ts` — 15 Rumah Sakit Jakarta

File: `src/lib/mock/hospitals.ts`

```typescript
import { Hospital } from '@/types/webgis';

export const mockHospitals: Hospital[] = [
  {
    id: 'rs-cipto',
    name: 'RSUPN Dr. Cipto Mangunkusumo',
    lat: -6.1952,
    lng: 106.8452,
    bedsAvailable: 45,
    totalBeds: 180,
    icuAvailable: 8,
    totalIcu: 20,
    status: 'Tersedia',
    specialization: ['Trauma', 'Jantung', 'Saraf', 'Umum'],
    address: 'Jl. Diponegoro No.71, Kenari, Senen, Jakarta Pusat',
    distances: {
      'cempaka-putih': 2.1,
      'jakarta-selatan': 8.4,
      'jakarta-timur': 6.7,
    },
  },
  {
    id: 'rs-persahabatan',
    name: 'RSUP Persahabatan',
    lat: -6.2234,
    lng: 106.8889,
    bedsAvailable: 28,
    totalBeds: 120,
    icuAvailable: 5,
    totalIcu: 14,
    status: 'Tersedia',
    specialization: ['Paru', 'Respirologi', 'Umum'],
    address: 'Jl. Persahabatan Raya No.1, Rawamangun, Jakarta Timur',
    distances: {
      'cempaka-putih': 5.3,
      'jakarta-selatan': 12.1,
      'jakarta-timur': 2.8,
    },
  },
  {
    id: 'rs-fatmawati',
    name: 'RSUP Fatmawati',
    lat: -6.2944,
    lng: 106.7985,
    bedsAvailable: 12,
    totalBeds: 150,
    icuAvailable: 3,
    totalIcu: 18,
    status: 'Terbatas',
    specialization: ['Ortopedi', 'Onkologi', 'Umum'],
    address: 'Jl. RS Fatmawati Raya, Cilandak Barat, Jakarta Selatan',
    distances: {
      'cempaka-putih': 10.2,
      'jakarta-selatan': 3.1,
      'jakarta-timur': 14.5,
    },
  },
  {
    id: 'rs-dharmais',
    name: 'RS Kanker Dharmais',
    lat: -6.1876,
    lng: 106.7897,
    bedsAvailable: 0,
    totalBeds: 80,
    icuAvailable: 0,
    totalIcu: 10,
    status: 'Penuh',
    specialization: ['Onkologi', 'Paliatif'],
    address: 'Jl. Letjen S. Parman No.84-86, Slipi, Jakarta Barat',
    distances: {
      'cempaka-putih': 7.8,
      'jakarta-selatan': 9.2,
      'jakarta-timur': 13.4,
    },
  },
  {
    id: 'rs-tarakan',
    name: 'RSUD Tarakan',
    lat: -6.1601,
    lng: 106.8283,
    bedsAvailable: 32,
    totalBeds: 100,
    icuAvailable: 6,
    totalIcu: 12,
    status: 'Tersedia',
    specialization: ['Umum', 'Bedah', 'Kebidanan'],
    address: 'Jl. Kyai Caringin No.7, Gambir, Jakarta Pusat',
    distances: {
      'cempaka-putih': 3.4,
      'jakarta-selatan': 9.7,
      'jakarta-timur': 8.1,
    },
  },
  {
    id: 'rs-koja',
    name: 'RSUD Koja',
    lat: -6.1123,
    lng: 106.8912,
    bedsAvailable: 18,
    totalBeds: 90,
    icuAvailable: 4,
    totalIcu: 10,
    status: 'Tersedia',
    specialization: ['Umum', 'Bedah', 'Penyakit Dalam'],
    address: 'Jl. Deli No.4, Koja, Jakarta Utara',
    distances: {
      'cempaka-putih': 8.9,
      'jakarta-selatan': 17.3,
      'jakarta-timur': 9.2,
    },
  },
  {
    id: 'rs-pasar-rebo',
    name: 'RSUD Pasar Rebo',
    lat: -6.3089,
    lng: 106.8612,
    bedsAvailable: 22,
    totalBeds: 110,
    icuAvailable: 5,
    totalIcu: 13,
    status: 'Tersedia',
    specialization: ['Umum', 'Bedah', 'Anak'],
    address: 'Jl. TB Simatupang No.30, Cijantung, Jakarta Timur',
    distances: {
      'cempaka-putih': 11.4,
      'jakarta-selatan': 6.2,
      'jakarta-timur': 4.1,
    },
  },
  {
    id: 'rs-budhi-asih',
    name: 'RSUD Budhi Asih',
    lat: -6.2456,
    lng: 106.9012,
    bedsAvailable: 8,
    totalBeds: 75,
    icuAvailable: 2,
    totalIcu: 8,
    status: 'Terbatas',
    specialization: ['Umum', 'Kebidanan', 'Anak'],
    address: 'Jl. Dewi Sartika No.200, Cawang, Jakarta Timur',
    distances: {
      'cempaka-putih': 9.3,
      'jakarta-selatan': 10.1,
      'jakarta-timur': 1.9,
    },
  },
  {
    id: 'rs-pertamina',
    name: 'RS Pusat Pertamina',
    lat: -6.2612,
    lng: 106.8023,
    bedsAvailable: 35,
    totalBeds: 130,
    icuAvailable: 9,
    totalIcu: 16,
    status: 'Tersedia',
    specialization: ['Jantung', 'Saraf', 'Bedah', 'Umum'],
    address: 'Jl. Kyai Maja No.43, Kebayoran Baru, Jakarta Selatan',
    distances: {
      'cempaka-putih': 8.7,
      'jakarta-selatan': 2.4,
      'jakarta-timur': 13.2,
    },
  },
  {
    id: 'rs-jakarta',
    name: 'RS Jakarta',
    lat: -6.1734,
    lng: 106.8234,
    bedsAvailable: 41,
    totalBeds: 140,
    icuAvailable: 7,
    totalIcu: 15,
    status: 'Tersedia',
    specialization: ['Umum', 'Bedah', 'Jantung'],
    address: 'Jl. Cideng Barat No.17, Gambir, Jakarta Pusat',
    distances: {
      'cempaka-putih': 4.2,
      'jakarta-selatan': 8.9,
      'jakarta-timur': 9.4,
    },
  },
  {
    id: 'rs-medistra',
    name: 'RS Medistra',
    lat: -6.2234,
    lng: 106.8156,
    bedsAvailable: 19,
    totalBeds: 85,
    icuAvailable: 4,
    totalIcu: 10,
    status: 'Tersedia',
    specialization: ['Umum', 'Bedah', 'Urologi'],
    address: 'Jl. Gatot Subroto Kav.59, Kuningan, Jakarta Selatan',
    distances: {
      'cempaka-putih': 6.1,
      'jakarta-selatan': 3.8,
      'jakarta-timur': 10.7,
    },
  },
  {
    id: 'rs-harapan-kita',
    name: 'RS Harapan Kita',
    lat: -6.1912,
    lng: 106.7812,
    bedsAvailable: 5,
    totalBeds: 95,
    icuAvailable: 1,
    totalIcu: 12,
    status: 'Terbatas',
    specialization: ['Jantung', 'Vaskular'],
    address: 'Jl. Letjen S. Parman Kav.87, Slipi, Jakarta Barat',
    distances: {
      'cempaka-putih': 9.1,
      'jakarta-selatan': 10.3,
      'jakarta-timur': 14.8,
    },
  },
  {
    id: 'rs-siloam-tb',
    name: 'RS Siloam TB Simatupang',
    lat: -6.3156,
    lng: 106.8134,
    bedsAvailable: 27,
    totalBeds: 120,
    icuAvailable: 6,
    totalIcu: 14,
    status: 'Tersedia',
    specialization: ['Umum', 'Bedah', 'Onkologi', 'Saraf'],
    address: 'Jl. TB Simatupang Kav.38, Cilandak, Jakarta Selatan',
    distances: {
      'cempaka-putih': 13.2,
      'jakarta-selatan': 4.7,
      'jakarta-timur': 11.9,
    },
  },
  {
    id: 'rs-mitra-keluarga-cempaka',
    name: 'RS Mitra Keluarga Cempaka Putih',
    lat: -6.1823,
    lng: 106.8601,
    bedsAvailable: 38,
    totalBeds: 110,
    icuAvailable: 7,
    totalIcu: 12,
    status: 'Tersedia',
    specialization: ['Umum', 'Bedah', 'Kebidanan', 'Anak'],
    address: 'Jl. Cempaka Putih Raya No.24, Cempaka Putih, Jakarta Pusat',
    distances: {
      'cempaka-putih': 0.8,
      'jakarta-selatan': 9.6,
      'jakarta-timur': 7.3,
    },
  },
  {
    id: 'rs-pondok-indah',
    name: 'RS Pondok Indah',
    lat: -6.2889,
    lng: 106.7734,
    bedsAvailable: 0,
    totalBeds: 160,
    icuAvailable: 0,
    totalIcu: 20,
    status: 'Penuh',
    specialization: ['Umum', 'Jantung', 'Onkologi', 'Saraf'],
    address: 'Jl. Metro Duta Kav. UE, Pondok Indah, Jakarta Selatan',
    distances: {
      'cempaka-putih': 14.1,
      'jakarta-selatan': 5.9,
      'jakarta-timur': 18.3,
    },
  },
];
```

---

## 2. `chatResponses.ts` — 3 Skenario Demo

File: `src/lib/mock/chatResponses.ts`

```typescript
import { ChatScenario } from '@/types/webgis';

export const chatScenarios: ChatScenario[] = [
  {
    id: 'cempaka-putih',
    triggerKeywords: ['cempaka putih', 'cempaka', 'jakarta pusat', 'pusat'],
    patientLocation: [106.8601, -6.1823],
    patientLabel: 'Pasien — Cempaka Putih',
    agentThinking: 'Menganalisis lokasi sekitar Cempaka Putih, Jakarta Pusat...',
    recommendedHospitalIds: ['rs-mitra-keluarga-cempaka', 'rs-cipto', 'rs-tarakan'],
    responseMarkdown: `## 🏥 Rekomendasi Rumah Sakit

**Lokasi pasien:** Cempaka Putih, Jakarta Pusat
**Waktu analisis:** ~3.4 detik

---

### 🥇 #1 — RS Mitra Keluarga Cempaka Putih
- 📍 **Jarak:** 0.8 km (terdekat)
- 🛏️ **Kapasitas:** 38/110 tersedia (35%)
- 🚑 **ICU:** 7 unit tersedia
- ✅ **Status:** Tersedia

### 🥈 #2 — RSUPN Dr. Cipto Mangunkusumo
- 📍 **Jarak:** 2.1 km
- 🛏️ **Kapasitas:** 45/180 tersedia (25%)
- 🚑 **ICU:** 8 unit tersedia
- ✅ **Status:** Tersedia

### 🥉 #3 — RSUD Tarakan
- 📍 **Jarak:** 3.4 km
- 🛏️ **Kapasitas:** 32/100 tersedia (32%)
- 🚑 **ICU:** 6 unit tersedia
- ✅ **Status:** Tersedia

---

> ⚠️ **Rekomendasi:** Kirim ke **RS Mitra Keluarga Cempaka Putih** — jarak paling dekat dengan ketersediaan ICU yang memadai.`,
  },
  {
    id: 'jakarta-selatan',
    triggerKeywords: ['jakarta selatan', 'selatan', 'kebayoran', 'tebet', 'fatmawati', 'cilandak', 'mampang'],
    patientLocation: [106.8023, -6.2612],
    patientLabel: 'Pasien — Jakarta Selatan',
    agentThinking: 'Menganalisis lokasi sekitar Jakarta Selatan...',
    recommendedHospitalIds: ['rs-pertamina', 'rs-fatmawati', 'rs-siloam-tb'],
    responseMarkdown: `## 🏥 Rekomendasi Rumah Sakit

**Lokasi pasien:** Jakarta Selatan
**Waktu analisis:** ~3.4 detik

---

### 🥇 #1 — RS Pusat Pertamina
- 📍 **Jarak:** 2.4 km (terdekat)
- 🛏️ **Kapasitas:** 35/130 tersedia (27%)
- 🚑 **ICU:** 9 unit tersedia
- ✅ **Status:** Tersedia

### 🥈 #2 — RSUP Fatmawati
- 📍 **Jarak:** 3.1 km
- 🛏️ **Kapasitas:** 12/150 tersedia (8%)
- 🚑 **ICU:** 3 unit tersedia
- ⚠️ **Status:** Terbatas

### 🥉 #3 — RS Siloam TB Simatupang
- 📍 **Jarak:** 4.7 km
- 🛏️ **Kapasitas:** 27/120 tersedia (23%)
- 🚑 **ICU:** 6 unit tersedia
- ✅ **Status:** Tersedia

---

> ⚠️ **Rekomendasi:** Kirim ke **RS Pusat Pertamina** — kapasitas ICU terbaik di area ini.`,
  },
  {
    id: 'jakarta-timur',
    triggerKeywords: ['jakarta timur', 'timur', 'cawang', 'rawamangun', 'jatinegara', 'duren sawit'],
    patientLocation: [106.9012, -6.2456],
    patientLabel: 'Pasien — Jakarta Timur',
    agentThinking: 'Menganalisis lokasi sekitar Jakarta Timur...',
    recommendedHospitalIds: ['rs-budhi-asih', 'rs-pasar-rebo', 'rs-persahabatan'],
    responseMarkdown: `## 🏥 Rekomendasi Rumah Sakit

**Lokasi pasien:** Jakarta Timur
**Waktu analisis:** ~3.4 detik

---

### 🥇 #1 — RSUD Budhi Asih
- 📍 **Jarak:** 1.9 km (terdekat)
- 🛏️ **Kapasitas:** 8/75 tersedia (11%)
- 🚑 **ICU:** 2 unit tersedia
- ⚠️ **Status:** Terbatas

### 🥈 #2 — RSUD Pasar Rebo
- 📍 **Jarak:** 4.1 km
- 🛏️ **Kapasitas:** 22/110 tersedia (20%)
- 🚑 **ICU:** 5 unit tersedia
- ✅ **Status:** Tersedia

### 🥉 #3 — RSUP Persahabatan
- 📍 **Jarak:** 2.8 km
- 🛏️ **Kapasitas:** 28/120 tersedia (23%)
- 🚑 **ICU:** 5 unit tersedia
- ✅ **Status:** Tersedia

---

> ⚠️ **Rekomendasi:** Budhi Asih paling dekat namun terbatas — pertimbangkan **RSUP Persahabatan** sebagai alternatif utama dengan keseimbangan jarak dan kapasitas.`,
  },
];

export const defaultWelcomeMessage = `Halo! Saya **AGATA** — Agentic GeoAI for Ambulance and Triage Assistance.

Masukkan lokasi pasien untuk mendapatkan rekomendasi rumah sakit terdekat yang tersedia.

**Contoh input:**
- "Pasien di Cempaka Putih"
- "Lokasi: Jakarta Selatan"
- "Jakarta Timur, kondisi kritis"`;

export const fallbackResponse = `Maaf, saya tidak dapat mengidentifikasi lokasi tersebut dengan tepat.

Coba masukkan salah satu area berikut:
- **Cempaka Putih** / Jakarta Pusat
- **Jakarta Selatan** (Kebayoran, Tebet, Fatmawati)
- **Jakarta Timur** (Cawang, Rawamangun, Jatinegara)

Atau ketik nama kelurahan/kecamatan di Jakarta untuk skenario demo.`;
```

---

## 3. `agentSteps.ts` — Pipeline 4 Agen

File: `src/lib/mock/agentSteps.ts`

```typescript
import { AgentStep } from '@/types/webgis';

export const agentSteps: AgentStep[] = [
  {
    id: 1,
    name: 'Data Retrieval Agent',
    description: 'Mengambil data rumah sakit dan kapasitas real-time...',
    durationMs: 1000,
    color: '#818cf8',
    outputSummary: '15 RS ditemukan dalam radius 20km',
  },
  {
    id: 2,
    name: 'Spatial Analysis Agent',
    description: 'Menghitung jarak pasien ke setiap RS...',
    durationMs: 1000,
    color: '#0ea5e9',
    outputSummary: 'Jarak dihitung via jaringan jalan Jakarta',
  },
  {
    id: 3,
    name: 'Data Visualization Agent',
    description: 'Menyiapkan layer peta dan visualisasi...',
    durationMs: 800,
    color: '#14b8a6',
    outputSummary: 'Layer GeoJSON dan markers disiapkan',
  },
  {
    id: 4,
    name: 'Report Generator Agent',
    description: 'Menyusun rekomendasi dan laporan...',
    durationMs: 600,
    color: '#22c55e',
    outputSummary: 'Top 3 RS direkomendasikan berdasarkan skor komposit',
  },
];

export const TOTAL_AGENT_DURATION_MS = agentSteps.reduce(
  (acc, step) => acc + step.durationMs,
  0
); // 3400ms
```

---

## 4. `dashboardStats.ts` — KPI Cards

File: `src/lib/mock/dashboardStats.ts`

```typescript
import { KpiStat } from '@/types/webgis';

export const dashboardStats: KpiStat[] = [
  {
    value: '15',
    label: 'RS Aktif Terpantau',
    iconName: 'hospital',
    color: '#0ea5e9',
  },
  {
    value: '4.2 km',
    label: 'Rata-rata Jarak',
    iconName: 'map-pin',
    color: '#14b8a6',
  },
  {
    value: '73%',
    label: 'Kapasitas Tersedia',
    iconName: 'bed',
    color: '#22c55e',
  },
  {
    value: '~3.4s',
    label: 'Waktu Respons Agen',
    iconName: 'zap',
    color: '#818cf8',
  },
];
```

---

## 5. Catatan Penting untuk Agent

- **Semua data di atas adalah hardcoded** — tidak ada fetch, tidak ada async
- **Koordinat lat/lng** menggunakan sistem WGS84, sesuai standar Mapbox
- **Jarak** dalam satuan kilometer, sudah dihitung manual (perkiraan jalan, bukan garis lurus)
- **Skenario matching** dilakukan dengan `triggerKeywords`: cek apakah input user mengandung salah satu keyword (case-insensitive)
- Jika tidak ada keyword yang cocok, tampilkan `fallbackResponse`
- `recommendedHospitalIds` harus berkorespondensi dengan `id` di `mockHospitals`

---

*Dokumen ini dibaca bersama `AGENT_BRIEF.md`, `UI_SPEC.md`, dan `ARCHITECTURE.md`.*
