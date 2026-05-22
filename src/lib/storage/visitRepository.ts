import { getDB } from './db';
import type { Visit } from '@/domain/models';
import type { AuditEntry, VisitRecord } from './db';

function toVisit(record: VisitRecord): Visit {
  return {
    id: record.id,
    familyId: record.familyId,
    chaId: record.chaId,
    visitDate: record.visitDate,
    notes: record.notes,
    followUpFlags: record.followUpFlags,
    registeredAt: record.registeredAt,
    undone: record.undone,
  };
}

export async function saveVisit(visit: Visit): Promise<{ visitId: string; auditId: string }> {
  const db = await getDB();
  const tx = db.transaction(['visits', 'auditLog'], 'readwrite');

  const record: VisitRecord = {
    id: visit.id,
    familyId: visit.familyId,
    chaId: visit.chaId,
    visitDate: visit.visitDate,
    notes: visit.notes,
    followUpFlags: visit.followUpFlags,
    registeredAt: visit.registeredAt,
    undone: visit.undone,
  };

  const audit: AuditEntry = {
    id: `audit-${visit.id}-register`,
    visitId: visit.id,
    familyId: visit.familyId,
    chaId: visit.chaId,
    action: 'register',
    timestamp: new Date().toISOString(),
  };

  await tx.objectStore('visits').put(record);
  await tx.objectStore('auditLog').put(audit);
  await tx.done;
  return { visitId: visit.id, auditId: audit.id };
}

export async function getActiveVisitsForFamily(familyId: string): Promise<Visit[]> {
  const db = await getDB();
  const records = await db.getAllFromIndex('visits', 'by-family', familyId);
  return records.filter(r => !r.undone).map(toVisit);
}

export async function undoVisit(visitId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['visits', 'auditLog'], 'readwrite');

  const record = await tx.objectStore('visits').get(visitId);
  if (!record) {
    await tx.done;
    return;
  }

  record.undone = true;
  await tx.objectStore('visits').put(record);

  const audit: AuditEntry = {
    id: `audit-${visitId}-undo-${Date.now()}`,
    visitId,
    familyId: record.familyId,
    chaId: record.chaId,
    action: 'undo',
    timestamp: new Date().toISOString(),
  };
  await tx.objectStore('auditLog').put(audit);
  await tx.done;
}

export async function getVisitHistoryForFamily(familyId: string): Promise<Visit[]> {
  const db = await getDB();
  const records = await db.getAllFromIndex('visits', 'by-family', familyId);
  return records.map(toVisit);
}
