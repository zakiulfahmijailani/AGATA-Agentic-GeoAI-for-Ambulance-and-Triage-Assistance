export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  zone: 'Pusat' | 'Selatan' | 'Timur' | 'Utara' | 'Barat';
  lat: number;
  lng: number;
  capacity: number;
  available_beds: number;
  er_status: 'AVAILABLE' | 'BUSY' | 'FULL';
  trauma_level: 1 | 2 | 3;
  operator: string;
  operator_type: string;
  website: string;
  osm_id: number;
  distance_km?: number;
}

export type BedStatus = 'available' | 'limited' | 'full';
export type ERStatus = Hospital['er_status'];
export type ReadinessCategory =
  | 'High Readiness'
  | 'Stable'
  | 'Strained'
  | 'Critical'
  | 'Overloaded';
export type ZoneFilter = 'All' | 'Pusat' | 'Selatan' | 'Timur' | 'Utara' | 'Barat';
export type TraumaFilter = 'All' | 1 | 2 | 3;
export type ERFilter = 'All' | 'AVAILABLE' | 'BUSY';

export interface HospitalFilters {
  zone: ZoneFilter;
  traumaLevel: TraumaFilter;
  erStatus: ERFilter;
}

export interface HospitalsApiResponse {
  hospitals: Hospital[];
  total: number;
}

export interface HealthApiResponse {
  success: boolean;
  status: string;
  database?: string;
  hospital_count?: number;
  hospitals_count: number;
  capacity: number;
  available_beds: number;
  postgis_version?: string;
  timestamp: string;
}

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

export interface HospitalSubScores {
  capacityScore: number;
  erStatusScore: number;
  traumaScore: number;
  accessibilityScore: number | null;
}

export interface HospitalReadinessResult {
  hospitalId: number;
  hospitalName: string;
  zone: Hospital['zone'];
  subScores: HospitalSubScores;
  baseScore: number;
  fullScore: number | null;
  scoreUsed: number;
  category: ReadinessCategory;
}

export interface ZoneReadinessResult {
  zone: Hospital['zone'];
  hospitalCount: number;
  totalCapacity: number;
  totalAvailableBeds: number;
  baseScore: number | null;
  finalScore: number | null;
  coveragePenalty: number;
  traumaCoverageModifier: number;
  category: ReadinessCategory | null;
}

export interface ZoneMvpResult {
  zone: Hospital['zone'];
  bedAvailabilityScore: number | null;
  erPressureScore: number | null;
  traumaReadinessScore: number | null;
  finalScore: number | null;
  category: ReadinessCategory | null;
}

export function getBedStatus(hospital: Hospital): BedStatus {
  if (hospital.er_status === 'FULL') return 'full';
  if (hospital.er_status === 'BUSY') return 'limited';
  return 'available';
}

export const BED_STATUS_LABEL: Record<BedStatus, string> = {
  available: 'Available',
  limited: 'Limited',
  full: 'Full',
};

export const ZONE_LABEL: Record<Hospital['zone'], string> = {
  Pusat: 'Central',
  Selatan: 'South',
  Timur: 'East',
  Utara: 'North',
  Barat: 'West',
};

export const BED_STATUS_COLOR: Record<BedStatus, string> = {
  available: '#10b981',
  limited: '#f59e0b',
  full: '#ef4444',
};

export const ER_STATUS_LABEL: Record<ERStatus, string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  FULL: 'Full',
};

export const ER_STATUS_COLOR: Record<ERStatus, string> = {
  AVAILABLE: '#10b981',
  BUSY: '#f59e0b',
  FULL: '#ef4444',
};
