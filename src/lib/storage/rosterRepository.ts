import { roster } from '@/data/roster';
import type { CHA, Family, MicroArea } from '@/domain/models';

export function getFamiliesForCHA(chaId: string): Family[] {
  const cha = roster.cha.id === chaId ? roster.cha : null;
  if (!cha) return [];

  return roster.families.filter(f => cha.microAreaIds.includes(f.microAreaId));
}

export function getMicroArea(chaId: string): MicroArea | null {
  if (roster.cha.id !== chaId) return null;
  const microAreaId = roster.cha.microAreaIds[0];
  return roster.microArea.id === microAreaId ? roster.microArea : null;
}

export function getCHA(chaId: string): CHA | null {
  return roster.cha.id === chaId ? roster.cha : null;
}
