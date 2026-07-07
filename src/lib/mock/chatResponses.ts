import { DemoScenario } from '@/types';

export const demoScenarios: DemoScenario[] = [
  {
    id: 'jakarta-pusat',
    keywords: [
      'cempaka putih',
      'senen',
      'menteng',
      'sawah besar',
      'tanah abang',
      'gambir',
      'kemayoran',
      'pusat',
      'jakarta pusat',
    ],
    patientLocation: [106.86, -6.1816],
    patientAddress: 'Jl. Cempaka Putih Tengah, Jakarta Pusat',
    zone: 'jakarta-pusat',
    recommendedHospitalIds: ['rscm', 'rs-islam-jakarta', 'rs-pasar-rebo'],
    chatResponse: `Analysis complete. Found **3 recommended hospitals** for the patient in **Cempaka Putih, Jakarta Pusat**:

1. **RSCM** - 2.1 km - 12 beds available - *Type A*
2. **RS Islam Jakarta Pusat** - 1.3 km - 8 beds available - *Type B*
3. **RSUD Pasar Rebo** - 5.4 km - 10 beds available - *Type B*

Top recommendation: **RS Islam Jakarta Pusat** (nearest distance, adequate capacity).`,
  },
  {
    id: 'jakarta-selatan',
    keywords: [
      'kebayoran',
      'tebet',
      'mampang',
      'pasar minggu',
      'pesanggrahan',
      'cilandak',
      'selatan',
      'jakarta selatan',
      'kuningan',
      'gatot subroto',
    ],
    patientLocation: [106.8, -6.24],
    patientAddress: 'Jl. Wijaya, Kebayoran Baru, Jakarta Selatan',
    zone: 'jakarta-selatan',
    recommendedHospitalIds: ['rs-fatmawati', 'rs-mmc', 'rs-brawijaya'],
    chatResponse: `Analysis complete. Found **3 recommended hospitals** for the patient in **Kebayoran Baru, Jakarta Selatan**:

1. **RSUP Fatmawati** - 5.2 km - 15 beds available - *Type A*
2. **RS MMC Jakarta** - 3.1 km - 7 beds available - *Type B*
3. **RS Brawijaya** - 2.4 km - 3 beds available - *Limited*

Top recommendation: **RSUP Fatmawati** (largest capacity, Type A).`,
  },
  {
    id: 'jakarta-utara',
    keywords: [
      'kelapa gading',
      'koja',
      'penjaringan',
      'pademangan',
      'tanjung priok',
      'utara',
      'jakarta utara',
    ],
    patientLocation: [106.905, -6.159],
    patientAddress: 'Jl. Boulevard Kelapa Gading, Jakarta Utara',
    zone: 'jakarta-utara',
    recommendedHospitalIds: [
      'rs-premier-kelapa-gading',
      'rs-mitra-keluarga-kelapa-gading',
      'rsud-koja',
    ],
    chatResponse: `Analysis complete. Found **3 recommended hospitals** for the patient in **Kelapa Gading, Jakarta Utara**:

1. **RS Premier Kelapa Gading** - 0.8 km - 9 beds available - *Type B*
2. **RS Mitra Keluarga Kelapa Gading** - 1.1 km - 6 beds available - *Type B*
3. **RSUD Koja** - 3.8 km - 0 beds - *Full*

Top recommendation: **RS Premier Kelapa Gading** (nearest distance, sufficient capacity).`,
  },
];

// Default response for unrecognized inputs
export const defaultChatResponse = `I received your request. For an accurate recommendation, please mention the patient's subdistrict or district in Jakarta.

Examples: *"Patient in Cempaka Putih"*, *"Emergency in Kebayoran Baru"*, or *"Ambulance from Kelapa Gading"*.`;

export function matchScenario(query: string): DemoScenario | null {
  const lower = query.toLowerCase();
  return demoScenarios.find((s) => s.keywords.some((k) => lower.includes(k))) ?? null;
}
