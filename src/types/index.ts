// ============================================================
// AGATA — TypeScript Interfaces
// All components and mock data use these types.
// DO NOT use `any`. Import from here, not redefine.
// ============================================================

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  coordinates: [number, number];   // [lng, lat] — Mapbox convention
  address: string;
  zone: HospitalZone;
  bedsAvailable: number;
  totalBeds: number;
  specializations: string[];
  phone: string;
  level: 'Tipe A' | 'Tipe B' | 'Tipe C';
}

export type HospitalZone =
  | 'jakarta-pusat'
  | 'jakarta-selatan'
  | 'jakarta-timur'
  | 'jakarta-utara'
  | 'jakarta-barat';

export type BedStatus = 'available' | 'limited' | 'full';

export function getBedStatus(hospital: Hospital): BedStatus {
  if (hospital.bedsAvailable === 0) return 'full';
  if (hospital.bedsAvailable < 5)  return 'limited';
  return 'available';
}

export const BED_STATUS_COLOR: Record<BedStatus, string> = {
  available: '#10b981',
  limited:   '#f59e0b',
  full:      '#ef4444',
};

export const BED_STATUS_LABEL: Record<BedStatus, string> = {
  available: 'Tersedia',
  limited:   'Terbatas',
  full:      'Penuh',
};

export interface AgentStep {
  id: number;
  name: string;
  icon: string;         // Lucide React icon name (string, resolved at runtime)
  color: string;        // hex color for this agent's theme
  description: string;  // status message shown while running
  durationMs: number;   // how long this step takes in the animation
  status: AgentStatus;
}

export type AgentStatus = 'idle' | 'running' | 'done';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  hospitals?: Hospital[];   // if present, render HospitalCards below message
}

export interface DemoScenario {
  id: string;
  keywords: string[];
  patientLocation: [number, number];  // [lng, lat]
  patientAddress: string;
  zone: string;
  recommendedHospitalIds: string[];
  chatResponse: string;
}

export interface StatCard {
  label: string;
  value: string;
  unit: string;
  icon: string;    // Lucide icon name
  color: string;   // tailwind text color class
}
