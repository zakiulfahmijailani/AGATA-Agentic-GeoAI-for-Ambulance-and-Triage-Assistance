export const scenarioDistances: Record<string, Record<string, number>> = {
  'jakarta-pusat': {
    rscm: 2.1,
    'rs-islam-jakarta': 1.3,
    'rs-pasar-rebo': 5.4,
  },
  'jakarta-selatan': {
    'rs-fatmawati': 5.2,
    'rs-mmc': 3.1,
    'rs-brawijaya': 2.4,
  },
  'jakarta-utara': {
    'rs-premier-kelapa-gading': 0.8,
    'rs-mitra-keluarga-kelapa-gading': 1.1,
    'rsud-koja': 3.8,
  },
};

export function getScenarioDistance(scenarioId: string | null, hospitalId: string): number {
  if (!scenarioId) return 0;
  return scenarioDistances[scenarioId]?.[hospitalId] ?? 0;
}
