import type { Hospital } from '@/types';
import {
  getAllZoneReadinessScores,
  getHospitalReadinessResult,
  getZoneMvpScore,
  getZoneReadinessScore,
} from './aeri';

export const AERI_DEMO_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: 'AGATA Demo Central Trauma Center',
    address: 'Jl. Demo Pusat 1',
    phone: '021-0001',
    zone: 'Pusat',
    lat: -6.19,
    lng: 106.84,
    capacity: 100,
    available_beds: 80,
    er_status: 'AVAILABLE',
    trauma_level: 1,
    operator: 'Demo Public Operator',
    operator_type: 'Public',
    website: '',
    osm_id: 1001,
    distance_km: 4,
  },
  {
    id: 2,
    name: 'AGATA Demo Busy Regional Hospital',
    address: 'Jl. Demo Pusat 2',
    phone: '021-0002',
    zone: 'Pusat',
    lat: -6.2,
    lng: 106.83,
    capacity: 60,
    available_beds: 18,
    er_status: 'BUSY',
    trauma_level: 2,
    operator: 'Demo Regional Operator',
    operator_type: 'Public',
    website: '',
    osm_id: 1002,
    distance_km: 12,
  },
  {
    id: 3,
    name: 'AGATA Demo Full Community Hospital',
    address: 'Jl. Demo Selatan 1',
    phone: '021-0003',
    zone: 'Selatan',
    lat: -6.26,
    lng: 106.8,
    capacity: 40,
    available_beds: 0,
    er_status: 'FULL',
    trauma_level: 3,
    operator: 'Demo Private Operator',
    operator_type: 'Private',
    website: '',
    osm_id: 1003,
  },
];

export const AERI_DEMO_HOSPITAL_RESULTS = AERI_DEMO_HOSPITALS.map(
  getHospitalReadinessResult,
);

export const AERI_DEMO_ZONE_RESULTS = getAllZoneReadinessScores(AERI_DEMO_HOSPITALS);

export const AERI_DEMO_ZONE_MVP_RESULTS = [
  getZoneMvpScore(AERI_DEMO_HOSPITALS, 'Pusat'),
  getZoneMvpScore(AERI_DEMO_HOSPITALS, 'Selatan'),
];

export const AERI_DEMO_EMPTY_ZONE_RESULT = getZoneReadinessScore(
  AERI_DEMO_HOSPITALS,
  'Timur',
);
