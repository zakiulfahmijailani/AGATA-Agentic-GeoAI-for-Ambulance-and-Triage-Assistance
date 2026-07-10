export interface RouteScoreInput {
  bedsAvailable: number;
  erStatus: string;
  specialistPresent: boolean;
  etaMinutes: number;
}

export function computeRouteScore(input: RouteScoreInput): number {
  const bedScore = Math.min(input.bedsAvailable / 20, 1);
  const erScore =
    input.erStatus === 'Available' ? 1.0 : input.erStatus === 'Full' ? 0.3 : 0.0;
  const specialistScore = input.specialistPresent ? 1.0 : 0.5;
  const etaScore = Math.max(0, 1 - input.etaMinutes / 60);

  const routeScore =
    bedScore * 0.3 + erScore * 0.35 + specialistScore * 0.2 + etaScore * 0.15;

  return Math.round(routeScore * 100) / 100;
}

export function routeScoreLabel(score: number): { label: string; color: string } {
  if (score >= 0.75) return { label: 'Ready', color: '#16a34a' };
  if (score >= 0.5) return { label: 'Moderate', color: '#d97706' };
  return { label: 'Limited', color: '#dc2626' };
}
