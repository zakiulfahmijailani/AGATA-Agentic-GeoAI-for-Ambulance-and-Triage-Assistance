import type { HospitalIndex, HospitalPillarVariables } from '@/lib/types';

export type DummyHospital = {
  index: HospitalIndex;
  pillars: HospitalPillarVariables;
};

function makeIndex(
  hospital_id: string,
  hospital_name: string,
  p1_bed_readiness: number,
  p2_clinical_match: number,
  p3_spatial_access: number,
  p4_severity_fit: number,
): HospitalIndex {
  return {
    hospital_id,
    hospital_name,
    agata_index: Number(
      (
        p1_bed_readiness * 0.3 +
        p2_clinical_match * 0.3 +
        p3_spatial_access * 0.25 +
        p4_severity_fit * 0.15
      ).toFixed(3),
    ),
    p1_bed_readiness,
    p2_clinical_match,
    p3_spatial_access,
    p4_severity_fit,
  };
}

export const dummyHospitals: { index: HospitalIndex; pillars: HospitalPillarVariables }[] = [
  {
    index: makeIndex('rs-siloam', 'RS Siloam', 0.62, 0.91, 0.84, 0.78),
    pillars: {
      hospital_id: 'rs-siloam',
      available_beds: 0.52,
      icu_availability: 0.58,
      specialist_on_duty: 0.94,
      facility_tier_score: 0.88,
      travel_time_score: 0.82,
      route_viability: 0.9,
      severity_match: 0.79,
    },
  },
  {
    index: makeIndex('rs-medistra', 'RS Medistra', 0.48, 0.93, 0.66, 0.8),
    pillars: {
      hospital_id: 'rs-medistra',
      available_beds: 0.38,
      icu_availability: 0.42,
      specialist_on_duty: 0.95,
      facility_tier_score: 0.91,
      travel_time_score: 0.7,
      route_viability: 0.62,
      severity_match: 0.81,
    },
  },
  {
    index: makeIndex('rs-fatmawati', 'RS Fatmawati', 0.88, 0.74, 0.58, 0.86),
    pillars: {
      hospital_id: 'rs-fatmawati',
      available_beds: 0.91,
      icu_availability: 0.86,
      specialist_on_duty: 0.72,
      facility_tier_score: 0.78,
      travel_time_score: 0.52,
      route_viability: 0.61,
      severity_match: 0.88,
    },
  },
  {
    index: makeIndex('rs-cipto-mangunkusumo', 'RS Cipto Mangunkusumo', 0.69, 0.95, 0.54, 0.92),
    pillars: {
      hospital_id: 'rs-cipto-mangunkusumo',
      available_beds: 0.64,
      icu_availability: 0.74,
      specialist_on_duty: 0.95,
      facility_tier_score: 0.95,
      travel_time_score: 0.48,
      route_viability: 0.57,
      severity_match: 0.94,
    },
  },
  {
    index: makeIndex('rs-pondok-indah', 'RS Pondok Indah', 0.72, 0.85, 0.89, 0.64),
    pillars: {
      hospital_id: 'rs-pondok-indah',
      available_beds: 0.76,
      icu_availability: 0.68,
      specialist_on_duty: 0.84,
      facility_tier_score: 0.86,
      travel_time_score: 0.92,
      route_viability: 0.88,
      severity_match: 0.62,
    },
  },
];
