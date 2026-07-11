export interface HospitalIndex {
  hospital_id: string;
  hospital_name: string;
  agata_index: number;
  p1_bed_readiness: number;
  p2_clinical_match: number;
  p3_spatial_access: number;
  p4_severity_fit: number;
}

export interface HospitalPillarVariables {
  hospital_id: string;
  available_beds: number;
  icu_availability: number;
  specialist_on_duty: number;
  facility_tier_score: number;
  travel_time_score: number;
  route_viability: number;
  severity_match: number;
}
