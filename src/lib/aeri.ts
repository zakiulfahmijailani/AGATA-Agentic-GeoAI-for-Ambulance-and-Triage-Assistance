import type {
  Hospital,
  HospitalReadinessResult,
  HospitalSubScores,
  ReadinessCategory,
  ZoneMvpResult,
  ZoneReadinessResult,
} from '@/types';

export const HOSPITAL_ZONES: readonly Hospital['zone'][] = [
  'Pusat',
  'Selatan',
  'Timur',
  'Utara',
  'Barat',
];

const ER_STATUS_SCORE: Record<Hospital['er_status'], number> = {
  AVAILABLE: 100,
  BUSY: 45,
  FULL: 0,
};

const TRAUMA_BASE_SCORE: Record<Hospital['trauma_level'], number> = {
  1: 100,
  2: 70,
  3: 40,
};

const ER_TRAUMA_FACTOR: Record<Hospital['er_status'], number> = {
  AVAILABLE: 1,
  BUSY: 0.7,
  FULL: 0,
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

function toNonNegativeNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function getTraumaBaseScore(traumaLevel: Hospital['trauma_level']): number {
  return TRAUMA_BASE_SCORE[traumaLevel] ?? TRAUMA_BASE_SCORE[3];
}

function getErTraumaFactor(erStatus: Hospital['er_status']): number {
  return ER_TRAUMA_FACTOR[erStatus] ?? 0;
}

function getCapacityWeight(hospital: Hospital): number {
  return toNonNegativeNumber(hospital.capacity);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]): number | null {
  return values.length > 0 ? sum(values) / values.length : null;
}

function getZoneHospitals(hospitals: Hospital[], zone: Hospital['zone']): Hospital[] {
  return hospitals.filter((hospital) => hospital.zone === zone);
}

export function getCapacityScore(hospital: Hospital): number {
  if (hospital.capacity <= 0) return 0;

  const availableBeds = toNonNegativeNumber(hospital.available_beds);
  return clampScore((availableBeds / hospital.capacity) * 100);
}

export function getERStatusScore(hospital: Hospital): number {
  return ER_STATUS_SCORE[hospital.er_status] ?? 0;
}

export function getTraumaScore(hospital: Hospital): number {
  return clampScore(
    getTraumaBaseScore(hospital.trauma_level) * getErTraumaFactor(hospital.er_status),
  );
}

export function getAccessibilityScore(distanceKm?: number | null): number | null {
  if (distanceKm === undefined || distanceKm === null || Number.isNaN(distanceKm)) return null;

  const distance = Math.max(distanceKm, 0);

  if (distance <= 5) return 100;
  if (distance <= 10) return 80;
  if (distance <= 20) return 60;
  if (distance <= 30) return 35;
  return 15;
}

export function getHospitalSubScores(hospital: Hospital): HospitalSubScores {
  return {
    capacityScore: getCapacityScore(hospital),
    erStatusScore: getERStatusScore(hospital),
    traumaScore: getTraumaScore(hospital),
    accessibilityScore: getAccessibilityScore(hospital.distance_km),
  };
}

export function getBaseHospitalReadinessScore(hospital: Hospital): number {
  const { capacityScore, erStatusScore, traumaScore } = getHospitalSubScores(hospital);

  return clampScore(0.4 * capacityScore + 0.35 * erStatusScore + 0.25 * traumaScore);
}

export function getFullHospitalReadinessScore(hospital: Hospital): number | null {
  const { capacityScore, erStatusScore, traumaScore, accessibilityScore } =
    getHospitalSubScores(hospital);

  if (accessibilityScore === null) return null;

  return clampScore(
    0.35 * capacityScore + 0.3 * erStatusScore + 0.2 * traumaScore + 0.15 * accessibilityScore,
  );
}

export function getHospitalReadinessResult(hospital: Hospital): HospitalReadinessResult {
  const subScores = getHospitalSubScores(hospital);
  const baseScore = getBaseHospitalReadinessScore(hospital);
  const fullScore = getFullHospitalReadinessScore(hospital);
  const scoreUsed = fullScore ?? baseScore;

  return {
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    zone: hospital.zone,
    subScores,
    baseScore,
    fullScore,
    scoreUsed,
    category: getReadinessCategory(scoreUsed),
  };
}

export function getReadinessCategory(score: number): ReadinessCategory {
  const clampedScore = clampScore(score);

  if (clampedScore >= 80) return 'High Readiness';
  if (clampedScore >= 60) return 'Stable';
  if (clampedScore >= 40) return 'Strained';
  if (clampedScore >= 20) return 'Critical';
  return 'Overloaded';
}

export function getZoneReadinessScore(
  hospitals: Hospital[],
  zone: Hospital['zone'],
): ZoneReadinessResult {
  const zoneHospitals = getZoneHospitals(hospitals, zone);
  const hospitalCount = zoneHospitals.length;
  const totalCapacity = sum(zoneHospitals.map(getCapacityWeight));
  const totalAvailableBeds = sum(
    zoneHospitals.map((hospital) => toNonNegativeNumber(hospital.available_beds)),
  );
  const coveragePenalty = getCoveragePenalty(hospitalCount);
  const traumaCoverageModifier = getTraumaCoverageModifier(zoneHospitals);

  if (hospitalCount === 0) {
    return {
      zone,
      hospitalCount,
      totalCapacity,
      totalAvailableBeds,
      baseScore: null,
      finalScore: null,
      coveragePenalty,
      traumaCoverageModifier,
      category: null,
    };
  }

  const hospitalScores = zoneHospitals.map((hospital) => ({
    score: getHospitalReadinessResult(hospital).scoreUsed,
    weight: getCapacityWeight(hospital),
  }));
  const weightedScores = hospitalScores.map(({ score, weight }) => score * weight);
  const simpleAverageScore = average(hospitalScores.map(({ score }) => score));
  const baseScore =
    totalCapacity > 0
      ? sum(weightedScores) / totalCapacity
      : simpleAverageScore;
  const finalScore =
    baseScore === null
      ? null
      : clampScore(baseScore * coveragePenalty * traumaCoverageModifier);

  return {
    zone,
    hospitalCount,
    totalCapacity,
    totalAvailableBeds,
    baseScore,
    finalScore,
    coveragePenalty,
    traumaCoverageModifier,
    category: finalScore === null ? null : getReadinessCategory(finalScore),
  };
}

export function getAllZoneReadinessScores(hospitals: Hospital[]): ZoneReadinessResult[] {
  return HOSPITAL_ZONES.map((zone) => getZoneReadinessScore(hospitals, zone));
}

export function getZoneMvpScore(hospitals: Hospital[], zone: Hospital['zone']): ZoneMvpResult {
  const zoneHospitals = getZoneHospitals(hospitals, zone);

  if (zoneHospitals.length === 0) {
    return {
      zone,
      bedAvailabilityScore: null,
      erPressureScore: null,
      traumaReadinessScore: null,
      finalScore: null,
      category: null,
    };
  }

  const totalCapacity = sum(zoneHospitals.map(getCapacityWeight));
  const totalAvailableBeds = sum(
    zoneHospitals.map((hospital) => toNonNegativeNumber(hospital.available_beds)),
  );
  const availableCount = zoneHospitals.filter(
    (hospital) => hospital.er_status === 'AVAILABLE',
  ).length;
  const busyCount = zoneHospitals.filter((hospital) => hospital.er_status === 'BUSY').length;
  const fullCount = zoneHospitals.filter((hospital) => hospital.er_status === 'FULL').length;
  const bedAvailabilityScore =
    totalCapacity > 0 ? clampScore((totalAvailableBeds / totalCapacity) * 100) : 0;
  const erPressureScore =
    100 * (1 * availableCount + 0.45 * busyCount + 0 * fullCount) / zoneHospitals.length;
  const traumaReadinessScore = getZoneTraumaReadinessScore(zoneHospitals, totalCapacity);
  const finalScore =
    traumaReadinessScore === null
      ? null
      : clampScore(
          0.45 * bedAvailabilityScore + 0.35 * erPressureScore + 0.2 * traumaReadinessScore,
        );

  return {
    zone,
    bedAvailabilityScore,
    erPressureScore,
    traumaReadinessScore,
    finalScore,
    category: finalScore === null ? null : getReadinessCategory(finalScore),
  };
}

function getCoveragePenalty(hospitalCount: number): number {
  if (hospitalCount >= 3) return 1;
  if (hospitalCount === 2) return 0.9;
  if (hospitalCount === 1) return 0.75;
  return 0;
}

function getTraumaCoverageModifier(hospitals: Hospital[]): number {
  const hasOpenTraumaLevel = (traumaLevel: Hospital['trauma_level']) =>
    hospitals.some(
      (hospital) => hospital.trauma_level === traumaLevel && hospital.er_status !== 'FULL',
    );

  if (hasOpenTraumaLevel(1)) return 1;
  if (hasOpenTraumaLevel(2)) return 0.85;
  if (hasOpenTraumaLevel(3)) return 0.7;
  return 0.5;
}

function getZoneTraumaReadinessScore(
  hospitals: Hospital[],
  totalCapacity: number,
): number | null {
  if (hospitals.length === 0) return null;

  const weightedTraumaScores = hospitals.map(
    (hospital) => getTraumaScore(hospital) * getCapacityWeight(hospital),
  );

  if (totalCapacity > 0) return sum(weightedTraumaScores) / totalCapacity;

  return average(hospitals.map(getTraumaScore));
}
