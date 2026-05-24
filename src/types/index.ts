export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  coordinates: [number, number]; // [lng, lat]
  address: string;
  zone:
    | 'jakarta-pusat'
    | 'jakarta-selatan'
    | 'jakarta-timur'
    | 'jakarta-utara'
    | 'jakarta-barat';
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
  keywords: string[]; // trigger words for keyword matching
  patientLocation: [number, number];
  patientAddress: string;
  zone: string;
  recommendedHospitalIds: string[];
  chatResponse: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  hospitals?: Hospital[];
}

export function getBedStatus(hospital: Hospital): BedStatus {
  if (hospital.bedsAvailable === 0) return 'full';
  if (hospital.bedsAvailable < 5) return 'limited';
  return 'available';
}

export const BED_STATUS_LABEL: Record<BedStatus, string> = {
  available: 'Tersedia',
  limited: 'Terbatas',
  full: 'Penuh',
};

export const BED_STATUS_COLOR: Record<BedStatus, string> = {
  available: '#22c55e',
  limited: '#f59e0b',
  full: '#ef4444',
};
