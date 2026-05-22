import type { Family, Visit, RiskScore, ScoringConfig } from './models';

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: {
    timeSinceVisit: 0.40,
    chronicConditions: 0.25,
    vulnerableGroups: 0.25,
    followUp: 0.10,
  },
  constants: {
    neverVisitedCap: 365,
    chronicCap: 5,
  },
  recommendedIntervalDays: 30,
};

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeRiskScore(
  family: Family,
  activeVisits: Visit[],
  today: Date,
  config: Partial<ScoringConfig> = {},
): RiskScore {
  const cfg: ScoringConfig = {
    weights: { ...DEFAULT_SCORING_CONFIG.weights, ...config.weights },
    constants: { ...DEFAULT_SCORING_CONFIG.constants, ...config.constants },
    recommendedIntervalDays:
      config.recommendedIntervalDays ?? DEFAULT_SCORING_CONFIG.recommendedIntervalDays,
  };

  const { weights, constants } = cfg;

  // f_time
  let daysSince: number;
  if (activeVisits.length === 0) {
    daysSince = Infinity;
  } else {
    const latestDate = activeVisits
      .map(v => new Date(v.visitDate))
      .reduce((max, d) => (d > max ? d : max), new Date(0));
    daysSince = daysBetween(latestDate, today);
  }
  const f_time = daysSince === Infinity ? 1.0 : Math.min(daysSince / constants.neverVisitedCap, 1.0);

  // f_chronic
  const totalConditions = family.residents.reduce(
    (sum, r) => sum + r.chronicConditions.length,
    0,
  );
  const f_chronic =
    family.residents.length === 0
      ? 0
      : Math.min(totalConditions / constants.chronicCap, 1.0);

  // f_vulnerable
  const totalResidents = family.residents.length;
  const vulnerableCount = family.residents.filter(
    r => r.ageGroup === 'infant' || r.ageGroup === 'elderly' || r.isPregnant,
  ).length;
  const f_vulnerable = totalResidents === 0 ? 0 : vulnerableCount / totalResidents;

  // f_followup
  const f_followup = activeVisits.some(v => v.followUpFlags.length > 0) ? 1.0 : 0.0;

  const factors = [
    {
      key: 'time_since_visit' as const,
      value: f_time,
      weight: weights.timeSinceVisit,
      contribution: f_time * weights.timeSinceVisit,
      labelKey: 'riskFactor.timeSinceVisit',
      labelValues: { days: daysSince === Infinity ? constants.neverVisitedCap : daysSince } as Record<string, number | string>,
    },
    {
      key: 'chronic_conditions' as const,
      value: f_chronic,
      weight: weights.chronicConditions,
      contribution: f_chronic * weights.chronicConditions,
      labelKey: 'riskFactor.chronicConditions',
      labelValues: { count: totalConditions } as Record<string, number | string>,
    },
    {
      key: 'vulnerable_groups' as const,
      value: f_vulnerable,
      weight: weights.vulnerableGroups,
      contribution: f_vulnerable * weights.vulnerableGroups,
      labelKey: 'riskFactor.vulnerableGroups',
      labelValues: { count: vulnerableCount } as Record<string, number | string>,
    },
    {
      key: 'follow_up' as const,
      value: f_followup,
      weight: weights.followUp,
      contribution: f_followup * weights.followUp,
      labelKey: 'riskFactor.followUp',
    },
  ];

  const total = factors.reduce((sum, f) => sum + f.contribution, 0);

  return { total, factors };
}
