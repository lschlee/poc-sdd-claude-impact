import { sortQueue, filterDueToday } from '@/domain/queue';
import { DEFAULT_SCORING_CONFIG } from '@/domain/scoring';
import type { ScoredFamily, Family, Visit } from '@/domain/models';

const makeFamily = (id: string): Family => ({
  id,
  name: `Family ${id}`,
  microAreaId: 'MA-001',
  address: null,
  coordinates: null,
  residents: [],
});

const makeScoredFamily = (
  id: string,
  total: number,
  daysSinceLastVisit: number,
  lastVisitDate: string | null = null,
): ScoredFamily => ({
  family: makeFamily(id),
  activeVisits: [],
  score: {
    total,
    factors: [
      { key: 'time_since_visit', value: 0, weight: 0.4, contribution: 0, labelKey: 'riskFactor.timeSinceVisit' },
      { key: 'chronic_conditions', value: 0, weight: 0.25, contribution: 0, labelKey: 'riskFactor.chronicConditions' },
      { key: 'vulnerable_groups', value: 0, weight: 0.25, contribution: 0, labelKey: 'riskFactor.vulnerableGroups' },
      { key: 'follow_up', value: 0, weight: 0.1, contribution: 0, labelKey: 'riskFactor.followUp' },
    ],
  },
  daysSinceLastVisit,
  lastVisitDate,
  followUpRequired: false,
});

describe('sortQueue', () => {
  it('sorts families by total score descending', () => {
    const families = [
      makeScoredFamily('B', 0.5, 10),
      makeScoredFamily('A', 0.9, 5),
      makeScoredFamily('C', 0.2, 30),
    ];
    const sorted = sortQueue(families);
    expect(sorted[0].family.id).toBe('A');
    expect(sorted[1].family.id).toBe('B');
    expect(sorted[2].family.id).toBe('C');
  });

  it('tie-breaks on daysSinceLastVisit descending when total scores are equal', () => {
    const families = [
      makeScoredFamily('A', 0.5, 10),
      makeScoredFamily('B', 0.5, 30),
      makeScoredFamily('C', 0.5, 20),
    ];
    const sorted = sortQueue(families);
    expect(sorted[0].family.id).toBe('B');
    expect(sorted[1].family.id).toBe('C');
    expect(sorted[2].family.id).toBe('A');
  });

  it('secondary tie-breaks on family.id ascending when both total and days are equal', () => {
    const families = [
      makeScoredFamily('C', 0.5, 20),
      makeScoredFamily('A', 0.5, 20),
      makeScoredFamily('B', 0.5, 20),
    ];
    const sorted = sortQueue(families);
    expect(sorted[0].family.id).toBe('A');
    expect(sorted[1].family.id).toBe('B');
    expect(sorted[2].family.id).toBe('C');
  });

  it('returns a new array and does not mutate the input', () => {
    const families = [
      makeScoredFamily('B', 0.5, 10),
      makeScoredFamily('A', 0.9, 5),
    ];
    const original = [...families];
    const sorted = sortQueue(families);
    expect(sorted).not.toBe(families);
    expect(families[0].family.id).toBe(original[0].family.id);
    expect(families[1].family.id).toBe(original[1].family.id);
  });

  it('is deterministic — same input always produces same output', () => {
    const families = [
      makeScoredFamily('C', 0.7, 15),
      makeScoredFamily('A', 0.7, 15),
      makeScoredFamily('B', 0.9, 5),
    ];
    const r1 = sortQueue(families);
    const r2 = sortQueue(families);
    r1.forEach((f, i) => {
      expect(f.family.id).toBe(r2[i].family.id);
    });
  });

  it('handles Infinity daysSinceLastVisit for never-visited families', () => {
    const families = [
      makeScoredFamily('A', 0.5, 10),
      makeScoredFamily('B', 0.5, Infinity),
    ];
    const sorted = sortQueue(families);
    expect(sorted[0].family.id).toBe('B');
  });
});

// ---------- filterDueToday tests ----------

const today = new Date('2026-05-22');

const makeFullFamily = (id: string): Family => ({
  id,
  name: `Family ${id}`,
  microAreaId: 'MA-001',
  address: null,
  coordinates: null,
  residents: [],
});

const makeVisit = (
  familyId: string,
  daysAgo: number,
  undone = false,
  followUpFlags: string[] = [],
): Visit => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `V-${familyId}-${daysAgo}`,
    familyId,
    chaId: 'CHA-001',
    visitDate: d.toISOString().slice(0, 10),
    notes: '',
    followUpFlags,
    registeredAt: new Date().toISOString(),
    undone,
  };
};

const config = { ...DEFAULT_SCORING_CONFIG, recommendedIntervalDays: 30 };

describe('filterDueToday', () => {
  it('includes a family past its recommended visit interval', () => {
    const family = makeFullFamily('F1');
    const visits = new Map([['F1', [makeVisit('F1', 31)]]]);
    const result = filterDueToday([family], visits, config);
    expect(result.map(f => f.id)).toContain('F1');
  });

  it('excludes a recently visited family with no active follow-up flags', () => {
    const family = makeFullFamily('F2');
    const visits = new Map([['F2', [makeVisit('F2', 5)]]]);
    const result = filterDueToday([family], visits, config);
    expect(result.map(f => f.id)).not.toContain('F2');
  });

  it('includes a family with an active follow-up flag regardless of recency', () => {
    const family = makeFullFamily('F3');
    const visits = new Map([['F3', [makeVisit('F3', 5, false, ['referral_needed'])]]]);
    const result = filterDueToday([family], visits, config);
    expect(result.map(f => f.id)).toContain('F3');
  });

  it('includes a never-visited family (no non-undone visits)', () => {
    const family = makeFullFamily('F4');
    const visits = new Map<string, Visit[]>([['F4', []]]);
    const result = filterDueToday([family], visits, config);
    expect(result.map(f => f.id)).toContain('F4');
  });

  it('includes a family whose only visit was undone (treated as never-visited)', () => {
    const family = makeFullFamily('F5');
    const visits = new Map([['F5', [makeVisit('F5', 5, true)]]]);
    const result = filterDueToday([family], visits, config);
    expect(result.map(f => f.id)).toContain('F5');
  });

  it('excludes a family not in the visits map when recently visited', () => {
    const family = makeFullFamily('F6');
    const visits = new Map([['F6', [makeVisit('F6', 10)]]]);
    const result = filterDueToday([family], visits, config);
    expect(result.map(f => f.id)).not.toContain('F6');
  });
});
