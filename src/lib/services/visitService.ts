import { saveVisit, undoVisit as repoUndoVisit } from '@/lib/storage/visitRepository';
import type { Visit, FollowUpFlag } from '@/domain/models';

const CHA_ID = 'CHA-001';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface RegisterVisitParams {
  familyId: string;
  visitDate: string;
  notes: string;
  followUpFlags: FollowUpFlag[];
  onRefresh?: () => void;
}

export async function registerVisit({
  familyId,
  visitDate,
  notes,
  followUpFlags,
  onRefresh,
}: RegisterVisitParams): Promise<Visit> {
  const visit: Visit = {
    id: generateId(),
    familyId,
    chaId: CHA_ID,
    visitDate,
    notes,
    followUpFlags,
    registeredAt: new Date().toISOString(),
    undone: false,
  };

  await saveVisit(visit);
  onRefresh?.();
  return visit;
}

export async function undoVisit(visitId: string, onRefresh?: () => void): Promise<void> {
  await repoUndoVisit(visitId);
  onRefresh?.();
}
