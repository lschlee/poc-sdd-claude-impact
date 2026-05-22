import type { Family, Visit, ScoredFamily, ScoringConfig } from './models';

export function sortQueue(families: ScoredFamily[]): ScoredFamily[] {
  return [...families].sort((a, b) => {
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }
    const aDays = a.daysSinceLastVisit === Infinity ? Number.MAX_SAFE_INTEGER : a.daysSinceLastVisit;
    const bDays = b.daysSinceLastVisit === Infinity ? Number.MAX_SAFE_INTEGER : b.daysSinceLastVisit;
    if (bDays !== aDays) {
      return bDays - aDays;
    }
    return a.family.id < b.family.id ? -1 : a.family.id > b.family.id ? 1 : 0;
  });
}

export function filterDueToday(
  families: Family[],
  visitsByFamily: Map<string, Visit[]>,
  config: ScoringConfig,
): Family[] {
  return families.filter(family => {
    const allVisits = visitsByFamily.get(family.id) ?? [];
    const activeVisits = allVisits.filter(v => !v.undone);

    if (activeVisits.length === 0) {
      return true;
    }

    const hasFollowUp = activeVisits.some(v => v.followUpFlags.length > 0);
    if (hasFollowUp) {
      return true;
    }

    const latestDate = activeVisits
      .map(v => new Date(v.visitDate))
      .reduce((max, d) => (d > max ? d : max), new Date(0));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSince = Math.floor(
      (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysSince >= config.recommendedIntervalDays;
  });
}
