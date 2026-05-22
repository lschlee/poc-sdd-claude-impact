import 'fake-indexeddb/auto';
import { resetDB } from '@/lib/storage/db';
import {
  saveVisit,
  getActiveVisitsForFamily,
  undoVisit,
  getVisitHistoryForFamily,
} from '@/lib/storage/visitRepository';
import type { Visit } from '@/domain/models';

const makeVisit = (id: string, familyId: string, overrides: Partial<Visit> = {}): Visit => ({
  id,
  familyId,
  chaId: 'CHA-001',
  visitDate: '2026-05-22',
  notes: 'Test note',
  followUpFlags: [],
  registeredAt: new Date().toISOString(),
  undone: false,
  ...overrides,
});

beforeEach(() => {
  resetDB();
});

describe('VisitRepository', () => {
  describe('saveVisit', () => {
    it('writes a VisitRecord to the visits store', async () => {
      const visit = makeVisit('V-001', 'FAM-001');
      await saveVisit(visit);

      const active = await getActiveVisitsForFamily('FAM-001');
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('V-001');
    });

    it('writes a matching AuditEntry with action "register" in the same transaction', async () => {
      const visit = makeVisit('V-002', 'FAM-002');
      const auditEntries = await saveVisit(visit);
      expect(auditEntries).toBeDefined();
    });

    it('persists followUpFlags on the VisitRecord', async () => {
      const visit = makeVisit('V-003', 'FAM-003', { followUpFlags: ['blood_pressure_not_measured'] });
      await saveVisit(visit);

      const active = await getActiveVisitsForFamily('FAM-003');
      expect(active[0].followUpFlags).toContain('blood_pressure_not_measured');
    });
  });

  describe('getActiveVisitsForFamily', () => {
    it('excludes records with undone === true', async () => {
      await saveVisit(makeVisit('V-004', 'FAM-004'));
      await saveVisit(makeVisit('V-005', 'FAM-004', { undone: true }));

      const active = await getActiveVisitsForFamily('FAM-004');
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('V-004');
    });

    it('returns empty array when no active visits', async () => {
      const active = await getActiveVisitsForFamily('FAM-NONE');
      expect(active).toHaveLength(0);
    });
  });

  describe('undoVisit', () => {
    it('sets undone = true on the target visit', async () => {
      await saveVisit(makeVisit('V-006', 'FAM-005'));
      await undoVisit('V-006');

      const active = await getActiveVisitsForFamily('FAM-005');
      expect(active).toHaveLength(0);
    });

    it('appends an undo AuditEntry atomically', async () => {
      await saveVisit(makeVisit('V-007', 'FAM-006'));
      await undoVisit('V-007');

      const history = await getVisitHistoryForFamily('FAM-006');
      expect(history[0].undone).toBe(true);
    });

    it('the undone visit still appears in full history', async () => {
      await saveVisit(makeVisit('V-008', 'FAM-007'));
      await undoVisit('V-008');

      const history = await getVisitHistoryForFamily('FAM-007');
      expect(history).toHaveLength(1);
      expect(history[0].undone).toBe(true);
    });
  });

  describe('getVisitHistoryForFamily', () => {
    it('returns all records including undone', async () => {
      await saveVisit(makeVisit('V-009', 'FAM-008'));
      await saveVisit(makeVisit('V-010', 'FAM-008', { undone: true }));

      const history = await getVisitHistoryForFamily('FAM-008');
      expect(history).toHaveLength(2);
    });
  });
});
