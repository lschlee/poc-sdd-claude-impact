import { getFamiliesForCHA, getMicroArea, getCHA } from '@/lib/storage/rosterRepository';

describe('RosterRepository', () => {
  describe('getFamiliesForCHA', () => {
    it('returns only families whose microAreaId is in the CHA\'s assigned areas', () => {
      const families = getFamiliesForCHA('CHA-001');
      expect(families.length).toBeGreaterThan(0);
      families.forEach(family => {
        expect(family.microAreaId).toBe('MA-001');
      });
    });

    it('returns typed Family[] with required fields', () => {
      const families = getFamiliesForCHA('CHA-001');
      families.forEach(family => {
        expect(typeof family.id).toBe('string');
        expect(typeof family.name).toBe('string');
        expect(typeof family.microAreaId).toBe('string');
        expect(Array.isArray(family.residents)).toBe(true);
      });
    });

    it('includes families with null coordinates', () => {
      const families = getFamiliesForCHA('CHA-001');
      const nullCoords = families.filter(f => f.coordinates === null);
      expect(nullCoords.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown CHA', () => {
      const families = getFamiliesForCHA('CHA-UNKNOWN');
      expect(families).toEqual([]);
    });

    it('returns 30 families for CHA-001 (full pilot roster)', () => {
      const families = getFamiliesForCHA('CHA-001');
      expect(families.length).toBe(30);
    });
  });

  describe('getMicroArea', () => {
    it('returns the micro-area for a known CHA', () => {
      const area = getMicroArea('CHA-001');
      expect(area).not.toBeNull();
      expect(area?.id).toBe('MA-001');
      expect(area?.chaId).toBe('CHA-001');
    });

    it('returns null for unknown CHA', () => {
      const area = getMicroArea('CHA-UNKNOWN');
      expect(area).toBeNull();
    });
  });

  describe('getCHA', () => {
    it('returns CHA-001 identity', () => {
      const cha = getCHA('CHA-001');
      expect(cha).not.toBeNull();
      expect(cha?.id).toBe('CHA-001');
      expect(Array.isArray(cha?.microAreaIds)).toBe(true);
    });

    it('returns null for unknown CHA', () => {
      const cha = getCHA('CHA-UNKNOWN');
      expect(cha).toBeNull();
    });
  });
});
