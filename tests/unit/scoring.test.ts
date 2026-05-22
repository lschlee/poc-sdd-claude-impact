import { computeRiskScore, DEFAULT_SCORING_CONFIG } from '@/domain/scoring';
import type { Family, Visit } from '@/domain/models';

const today = new Date('2026-05-22');

const baseFamily: Family = {
  id: 'FAM-TEST',
  name: 'Test Family',
  microAreaId: 'MA-001',
  address: null,
  coordinates: null,
  residents: [
    { id: 'R1', familyId: 'FAM-TEST', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  ],
};

const familyWithResidents: Family = {
  ...baseFamily,
  residents: [
    { id: 'R1', familyId: 'FAM-TEST', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension', 'diabetes'] },
    { id: 'R2', familyId: 'FAM-TEST', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },
    { id: 'R3', familyId: 'FAM-TEST', ageGroup: 'adult', isPregnant: true, chronicConditions: ['asthma'] },
  ],
};

const makeVisit = (daysAgo: number, followUpFlags: string[] = []): Visit => {
  const visitDate = new Date(today);
  visitDate.setDate(visitDate.getDate() - daysAgo);
  return {
    id: `V-${daysAgo}`,
    familyId: 'FAM-TEST',
    chaId: 'CHA-001',
    visitDate: visitDate.toISOString().slice(0, 10),
    notes: '',
    followUpFlags,
    registeredAt: new Date().toISOString(),
    undone: false,
  };
};

describe('computeRiskScore', () => {
  describe('f_time factor', () => {
    it('returns f_time = 1.0 when activeVisits is empty (never visited)', () => {
      const result = computeRiskScore(baseFamily, [], today);
      const timeFactor = result.factors.find(f => f.key === 'time_since_visit')!;
      expect(timeFactor.value).toBe(1.0);
    });

    it('returns f_time proportional to days since visit', () => {
      const visit = makeVisit(180);
      const result = computeRiskScore(baseFamily, [visit], today, DEFAULT_SCORING_CONFIG);
      const timeFactor = result.factors.find(f => f.key === 'time_since_visit')!;
      expect(timeFactor.value).toBeCloseTo(180 / 365, 5);
    });

    it('caps f_time at 1.0 when days exceed neverVisitedCap', () => {
      const visit = makeVisit(400);
      const result = computeRiskScore(baseFamily, [visit], today);
      const timeFactor = result.factors.find(f => f.key === 'time_since_visit')!;
      expect(timeFactor.value).toBe(1.0);
    });

    it('returns 0 days for a visit today', () => {
      const visit = makeVisit(0);
      const result = computeRiskScore(baseFamily, [visit], today);
      const timeFactor = result.factors.find(f => f.key === 'time_since_visit')!;
      expect(timeFactor.value).toBeCloseTo(0, 5);
    });
  });

  describe('f_chronic factor', () => {
    it('returns f_chronic = 0 for empty residents', () => {
      const emptyFamily: Family = { ...baseFamily, residents: [] };
      const result = computeRiskScore(emptyFamily, [], today);
      const chronicFactor = result.factors.find(f => f.key === 'chronic_conditions')!;
      expect(chronicFactor.value).toBe(0);
    });

    it('calculates f_chronic as total conditions / chronicCap', () => {
      const familyWith3Conditions: Family = {
        ...baseFamily,
        residents: [
          { id: 'R1', familyId: 'FAM-TEST', ageGroup: 'adult', isPregnant: false, chronicConditions: ['hypertension', 'diabetes', 'asthma'] },
        ],
      };
      const result = computeRiskScore(familyWith3Conditions, [], today);
      const chronicFactor = result.factors.find(f => f.key === 'chronic_conditions')!;
      expect(chronicFactor.value).toBeCloseTo(3 / 5, 5);
    });

    it('caps f_chronic at 1.0 when conditions exceed chronicCap', () => {
      const familyWithManyConditions: Family = {
        ...baseFamily,
        residents: [
          { id: 'R1', familyId: 'FAM-TEST', ageGroup: 'adult', isPregnant: false, chronicConditions: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] },
        ],
      };
      const result = computeRiskScore(familyWithManyConditions, [], today);
      const chronicFactor = result.factors.find(f => f.key === 'chronic_conditions')!;
      expect(chronicFactor.value).toBe(1.0);
    });
  });

  describe('f_vulnerable factor', () => {
    it('returns f_vulnerable = 0 for empty residents', () => {
      const emptyFamily: Family = { ...baseFamily, residents: [] };
      const result = computeRiskScore(emptyFamily, [], today);
      const vulnFactor = result.factors.find(f => f.key === 'vulnerable_groups')!;
      expect(vulnFactor.value).toBe(0);
    });

    it('counts elderly as vulnerable', () => {
      const result = computeRiskScore(familyWithResidents, [], today);
      const vulnFactor = result.factors.find(f => f.key === 'vulnerable_groups')!;
      // R1=elderly, R2=infant, R3=pregnant → 3 vulnerable out of 3
      expect(vulnFactor.value).toBeCloseTo(3 / 3, 5);
    });

    it('counts infants and pregnant as vulnerable', () => {
      const result = computeRiskScore(familyWithResidents, [], today);
      const vulnFactor = result.factors.find(f => f.key === 'vulnerable_groups')!;
      expect(vulnFactor.value).toBe(1.0);
    });

    it('non-vulnerable adults have value 0 / total residents', () => {
      const adultOnly: Family = {
        ...baseFamily,
        residents: [
          { id: 'R1', familyId: 'FAM-TEST', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
          { id: 'R2', familyId: 'FAM-TEST', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
        ],
      };
      const result = computeRiskScore(adultOnly, [], today);
      const vulnFactor = result.factors.find(f => f.key === 'vulnerable_groups')!;
      expect(vulnFactor.value).toBe(0);
    });
  });

  describe('f_followup factor', () => {
    it('returns f_followup = 0 when no active visits have follow-up flags', () => {
      const visit = makeVisit(10, []);
      const result = computeRiskScore(baseFamily, [visit], today);
      const followFactor = result.factors.find(f => f.key === 'follow_up')!;
      expect(followFactor.value).toBe(0);
    });

    it('returns f_followup = 1.0 when any active visit has follow-up flags', () => {
      const visitWithFlags = makeVisit(10, ['blood_pressure_not_measured']);
      const result = computeRiskScore(baseFamily, [visitWithFlags], today);
      const followFactor = result.factors.find(f => f.key === 'follow_up')!;
      expect(followFactor.value).toBe(1.0);
    });
  });

  describe('total score', () => {
    it('total stays in [0, 1]', () => {
      const result = computeRiskScore(familyWithResidents, [], today);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(1);
    });

    it('total equals sum of contributions', () => {
      const result = computeRiskScore(familyWithResidents, [makeVisit(100)], today);
      const sumContributions = result.factors.reduce((s, f) => s + f.contribution, 0);
      expect(result.total).toBeCloseTo(sumContributions, 10);
    });

    it('is deterministic — same inputs produce same output', () => {
      const visit = makeVisit(50, ['referral_needed']);
      const r1 = computeRiskScore(familyWithResidents, [visit], today);
      const r2 = computeRiskScore(familyWithResidents, [visit], today);
      expect(r1.total).toBe(r2.total);
      r1.factors.forEach((f, i) => {
        expect(f.value).toBe(r2.factors[i].value);
      });
    });

    it('returns exactly 4 factors', () => {
      const result = computeRiskScore(baseFamily, [], today);
      expect(result.factors).toHaveLength(4);
    });

    it('factors contain all 4 required keys', () => {
      const result = computeRiskScore(baseFamily, [], today);
      const keys = result.factors.map(f => f.key);
      expect(keys).toContain('time_since_visit');
      expect(keys).toContain('chronic_conditions');
      expect(keys).toContain('vulnerable_groups');
      expect(keys).toContain('follow_up');
    });
  });
});
