# MOCK DATA SPECIFICATION

> All data in this file must be used **exactly as specified** in `src/lib/mock/hospitals.ts`.

---

## TypeScript Interface

```typescript
// src/types/index.ts
export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  coordinates: [number, number];  // [lng, lat]
  address: string;
  zone: 'jakarta-pusat' | 'jakarta-selatan' | 'jakarta-timur' | 'jakarta-utara' | 'jakarta-barat';
  bedsAvailable: number;
  totalBeds: number;
  specializations: string[];
  phone: string;
  level: 'Tipe A' | 'Tipe B' | 'Tipe C';
}

export type BedStatus = 'available' | 'limited' | 'full';
// available: bedsAvailable >= 5
// limited:   bedsAvailable 1-4
// full:      bedsAvailable === 0

export interface AgentStep {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  durationMs: number;
  status: 'idle' | 'running' | 'done';
}

export interface DemoScenario {
  id: string;
  keywords: string[];             // trigger words for keyword matching
  patientLocation: [number, number];
  patientAddress: string;
  zone: string;
  recommendedHospitalIds: string[];
  chatResponse: string;
}
```

---

## Hospital Data (15 Rumah Sakit Jakarta)

Copy this exactly into `src/lib/mock/hospitals.ts`:

```typescript
import { Hospital } from '@/types';

export const mockHospitals: Hospital[] = [
  // ── JAKARTA PUSAT ─────────────────────────────────
  {
    id: 'rscm',
    name: 'RSUPN Dr. Cipto Mangunkusumo',
    shortName: 'RSCM',
    coordinates: [106.8451, -6.1954],
    address: 'Jl. Diponegoro No.71, Kenari, Senen, Jakarta Pusat',
    zone: 'jakarta-pusat',
    bedsAvailable: 12,
    totalBeds: 60,
    specializations: ['IGD 24 Jam', 'Trauma', 'Jantung', 'Neurologi'],
    phone: '021-500135',
    level: 'Tipe A',
  },
  {
    id: 'rs-islam-jakarta',
    name: 'RS Islam Jakarta Pusat',
    shortName: 'RSIJ Pusat',
    coordinates: [106.8612, -6.1816],
    address: 'Jl. Cempaka Putih Tengah I, Jakarta Pusat',
    zone: 'jakarta-pusat',
    bedsAvailable: 8,
    totalBeds: 40,
    specializations: ['IGD 24 Jam', 'Bedah', 'Kebidanan'],
    phone: '021-4244208',
    level: 'Tipe B',
  },
  {
    id: 'rs-cempaka-putih',
    name: 'RSPAD Gatot Soebroto',
    shortName: 'RSPAD',
    coordinates: [106.8400, -6.1770],
    address: 'Jl. Abdul Rahman Saleh No.24, Senen, Jakarta Pusat',
    zone: 'jakarta-pusat',
    bedsAvailable: 0,
    totalBeds: 50,
    specializations: ['IGD 24 Jam', 'Bedah', 'Kardiologi'],
    phone: '021-3441008',
    level: 'Tipe A',
  },
  // ── JAKARTA SELATAN ───────────────────────────────
  {
    id: 'rs-fatmawati',
    name: 'RSUP Fatmawati',
    shortName: 'RS Fatmawati',
    coordinates: [106.7938, -6.2933],
    address: 'Jl. TB Simatupang No.5, Cilandak, Jakarta Selatan',
    zone: 'jakarta-selatan',
    bedsAvailable: 15,
    totalBeds: 55,
    specializations: ['IGD 24 Jam', 'Orthopedi', 'Paru'],
    phone: '021-7660552',
    level: 'Tipe A',
  },
  {
    id: 'rs-brawijaya',
    name: 'RS Brawijaya Saharjo',
    shortName: 'RS Brawijaya',
    coordinates: [106.8316, -6.2520],
    address: 'Jl. Dr. Saharjo No.129, Tebet, Jakarta Selatan',
    zone: 'jakarta-selatan',
    bedsAvailable: 3,
    totalBeds: 30,
    specializations: ['IGD 24 Jam', 'Bedah', 'Penyakit Dalam'],
    phone: '021-8314841',
    level: 'Tipe B',
  },
  {
    id: 'rs-mmc',
    name: 'RS MMC Jakarta',
    shortName: 'RS MMC',
    coordinates: [106.8228, -6.2275],
    address: 'Jl. HR Rasuna Said Kav. C-21, Kuningan, Jakarta Selatan',
    zone: 'jakarta-selatan',
    bedsAvailable: 7,
    totalBeds: 35,
    specializations: ['IGD 24 Jam', 'Kardiologi', 'Onkologi'],
    phone: '021-5203435',
    level: 'Tipe B',
  },
  // ── JAKARTA TIMUR ─────────────────────────────────
  {
    id: 'rs-pasar-rebo',
    name: 'RSUD Pasar Rebo',
    shortName: 'RS Pasar Rebo',
    coordinates: [106.8710, -6.3198],
    address: 'Jl. TB Simatupang No.30, Pasar Rebo, Jakarta Timur',
    zone: 'jakarta-timur',
    bedsAvailable: 10,
    totalBeds: 45,
    specializations: ['IGD 24 Jam', 'Bedah', 'Penyakit Dalam'],
    phone: '021-8400109',
    level: 'Tipe B',
  },
  {
    id: 'rs-premier-jatinegara',
    name: 'RS Premier Jatinegara',
    shortName: 'RS Premier JTN',
    coordinates: [106.8726, -6.2208],
    address: 'Jl. Raya Jatinegara Barat No.126, Jakarta Timur',
    zone: 'jakarta-timur',
    bedsAvailable: 5,
    totalBeds: 40,
    specializations: ['IGD 24 Jam', 'Kardiologi', 'Neurologi'],
    phone: '021-2800900',
    level: 'Tipe B',
  },
  {
    id: 'rsud-budhi-asih',
    name: 'RSUD Budhi Asih',
    shortName: 'RSUD Budhi Asih',
    coordinates: [106.9016, -6.2426],
    address: 'Jl. Dewi Sartika No.200, Cawang, Jakarta Timur',
    zone: 'jakarta-timur',
    bedsAvailable: 2,
    totalBeds: 35,
    specializations: ['IGD 24 Jam', 'Bedah'],
    phone: '021-8093208',
    level: 'Tipe C',
  },
  // ── JAKARTA UTARA ─────────────────────────────────
  {
    id: 'rs-premier-kelapa-gading',
    name: 'RS Premier Kelapa Gading',
    shortName: 'RS Premier KG',
    coordinates: [106.9012, -6.1572],
    address: 'Jl. Bulevar Kelapa Gading Blok A, Jakarta Utara',
    zone: 'jakarta-utara',
    bedsAvailable: 9,
    totalBeds: 42,
    specializations: ['IGD 24 Jam', 'Kardiologi', 'Bedah'],
    phone: '021-45841234',
    level: 'Tipe B',
  },
  {
    id: 'rs-mitra-keluarga-kelapa-gading',
    name: 'RS Mitra Keluarga Kelapa Gading',
    shortName: 'RS MK Kelapa Gading',
    coordinates: [106.9097, -6.1606],
    address: 'Jl. Bukit Gading Raya, Kelapa Gading, Jakarta Utara',
    zone: 'jakarta-utara',
    bedsAvailable: 6,
    totalBeds: 38,
    specializations: ['IGD 24 Jam', 'Penyakit Dalam', 'Kebidanan'],
    phone: '021-45866000',
    level: 'Tipe B',
  },
  {
    id: 'rsud-koja',
    name: 'RSUD Koja',
    shortName: 'RSUD Koja',
    coordinates: [106.8912, -6.1302],
    address: 'Jl. Deli No.4, Koja, Jakarta Utara',
    zone: 'jakarta-utara',
    bedsAvailable: 0,
    totalBeds: 30,
    specializations: ['IGD 24 Jam', 'Penyakit Dalam'],
    phone: '021-4350580',
    level: 'Tipe C',
  },
  // ── JAKARTA BARAT ─────────────────────────────────
  {
    id: 'rs-sumber-waras',
    name: 'RS Sumber Waras',
    shortName: 'RS Sumber Waras',
    coordinates: [106.7901, -6.1688],
    address: 'Jl. Kyai Tapa No.1, Grogol, Jakarta Barat',
    zone: 'jakarta-barat',
    bedsAvailable: 11,
    totalBeds: 50,
    specializations: ['IGD 24 Jam', 'Neurologi', 'Bedah'],
    phone: '021-5682011',
    level: 'Tipe B',
  },
  {
    id: 'rs-siloam-kebon-jeruk',
    name: 'RS Siloam Kebon Jeruk',
    shortName: 'RS Siloam KJ',
    coordinates: [106.7712, -6.1972],
    address: 'Jl. Perjuangan No.8, Kebon Jeruk, Jakarta Barat',
    zone: 'jakarta-barat',
    bedsAvailable: 4,
    totalBeds: 32,
    specializations: ['IGD 24 Jam', 'Kardiologi', 'Onkologi'],
    phone: '021-53000222',
    level: 'Tipe B',
  },
  {
    id: 'rsud-cengkareng',
    name: 'RSUD Cengkareng',
    shortName: 'RSUD Cengkareng',
    coordinates: [106.7327, -6.1439],
    address: 'Jl. Benda Raya, Cengkareng, Jakarta Barat',
    zone: 'jakarta-barat',
    bedsAvailable: 14,
    totalBeds: 48,
    specializations: ['IGD 24 Jam', 'Trauma', 'Kebidanan'],
    phone: '021-5435555',
    level: 'Tipe B',
  },
];
```

---

## Demo Scenarios

Copy into `src/lib/mock/chatResponses.ts`:

```typescript
import { DemoScenario } from '@/types';

export const demoScenarios: DemoScenario[] = [
  {
    id: 'jakarta-pusat',
    keywords: ['cempaka putih', 'senen', 'menteng', 'sawah besar', 'tanah abang', 'gambir', 'kemayoran', 'pusat', 'jakarta pusat'],
    patientLocation: [106.8600, -6.1816],
    patientAddress: 'Jl. Cempaka Putih Tengah, Jakarta Pusat',
    zone: 'jakarta-pusat',
    recommendedHospitalIds: ['rscm', 'rs-islam-jakarta', 'rs-pasar-rebo'],
    chatResponse: `✅ **Analisis selesai.** Ditemukan **3 rumah sakit** yang direkomendasikan untuk pasien di **Cempaka Putih, Jakarta Pusat**:

1. 🏥 **RSCM** — 2.1 km · 12 beds tersedia · *Tipe A*
2. 🏥 **RS Islam Jakarta Pusat** — 1.3 km · 8 beds tersedia · *Tipe B*
3. 🏥 **RSUD Pasar Rebo** — 5.4 km · 10 beds tersedia · *Tipe B*

Rekomendasi utama: **RS Islam Jakarta Pusat** (jarak terdekat, kapasitas memadai).`,
  },
  {
    id: 'jakarta-selatan',
    keywords: ['kebayoran', 'tebet', 'mampang', 'pasar minggu', 'pesanggrahan', 'cilandak', 'selatan', 'jakarta selatan', 'kuningan', 'gatot subroto'],
    patientLocation: [106.8000, -6.2400],
    patientAddress: 'Jl. Wijaya, Kebayoran Baru, Jakarta Selatan',
    zone: 'jakarta-selatan',
    recommendedHospitalIds: ['rs-fatmawati', 'rs-mmc', 'rs-brawijaya'],
    chatResponse: `✅ **Analisis selesai.** Ditemukan **3 rumah sakit** yang direkomendasikan untuk pasien di **Kebayoran Baru, Jakarta Selatan**:

1. 🏥 **RSUP Fatmawati** — 5.2 km · 15 beds tersedia · *Tipe A*
2. 🏥 **RS MMC Jakarta** — 3.1 km · 7 beds tersedia · *Tipe B*
3. 🏥 **RS Brawijaya** — 2.4 km · 3 beds tersedia · *Terbatas*

Rekomendasi utama: **RSUP Fatmawati** (kapasitas terbesar, Tipe A).`,
  },
  {
    id: 'jakarta-utara',
    keywords: ['kelapa gading', 'koja', 'penjaringan', 'pademangan', 'tanjung priok', 'utara', 'jakarta utara'],
    patientLocation: [106.9050, -6.1590],
    patientAddress: 'Jl. Boulevard Kelapa Gading, Jakarta Utara',
    zone: 'jakarta-utara',
    recommendedHospitalIds: ['rs-premier-kelapa-gading', 'rs-mitra-keluarga-kelapa-gading', 'rsud-koja'],
    chatResponse: `✅ **Analisis selesai.** Ditemukan **3 rumah sakit** yang direkomendasikan untuk pasien di **Kelapa Gading, Jakarta Utara**:

1. 🏥 **RS Premier Kelapa Gading** — 0.8 km · 9 beds tersedia · *Tipe B*
2. 🏥 **RS Mitra Keluarga Kelapa Gading** — 1.1 km · 6 beds tersedia · *Tipe B*
3. 🏥 **RSUD Koja** — 3.8 km · 0 beds · *Penuh*

Rekomendasi utama: **RS Premier Kelapa Gading** (jarak terdekat, kapasitas cukup).`,
  },
];

// Default response for unrecognized inputs
export const defaultChatResponse = `Saya menerima permintaan Anda. Untuk rekomendasi yang akurat, mohon sebutkan nama kelurahan atau kecamatan lokasi pasien di Jakarta. 

Contoh: *"Pasien di Cempaka Putih"*, *"Darurat di Kebayoran Baru"*, atau *"Ambulans dari Kelapa Gading"*.`;

export function matchScenario(query: string): DemoScenario | null {
  const lower = query.toLowerCase();
  return demoScenarios.find(s => s.keywords.some(k => lower.includes(k))) ?? null;
}
```

---

## Agent Steps Data

Copy into `src/lib/mock/agentSteps.ts`:

```typescript
import { AgentStep } from '@/types';

export const mockAgentSteps: AgentStep[] = [
  {
    id: 1,
    name: 'Data Retrieval',
    icon: 'Database',
    color: '#3b82f6',
    description: 'Mengambil data kapasitas & lokasi rumah sakit...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 2,
    name: 'Spatial Analysis',
    icon: 'MapPin',
    color: '#10b981',
    description: 'Menghitung jarak pasien ke RS (PostGIS routing)...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 3,
    name: 'Visualization',
    icon: 'BarChart2',
    color: '#f59e0b',
    description: 'Membuat overlay rute pada peta WebGIS...',
    durationMs: 1000,
    status: 'idle',
  },
  {
    id: 4,
    name: 'Report Generator',
    icon: 'FileText',
    color: '#8b5cf6',
    description: 'Menyusun rekomendasi RS berdasarkan skor optimal...',
    durationMs: 1000,
    status: 'idle',
  },
];
```
