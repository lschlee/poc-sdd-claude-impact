'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFamiliesForCHA } from '@/lib/storage/rosterRepository';
import { filterDueToday } from '@/domain/queue';
import { computeRiskScore, DEFAULT_SCORING_CONFIG } from '@/domain/scoring';
import { sortQueue } from '@/domain/queue';
import type { ScoredFamily, Visit } from '@/domain/models';
import { getDB } from '@/lib/storage/db';

const CHA_ID = 'CHA-001';

async function loadActiveVisits(): Promise<Map<string, Visit[]>> {
  try {
    const db = await getDB();
    const allVisits = await db.getAll('visits');
    const map = new Map<string, Visit[]>();
    for (const v of allVisits) {
      if (v.undone) continue;
      const list = map.get(v.familyId) ?? [];
      list.push(v as Visit);
      map.set(v.familyId, list);
    }
    return map;
  } catch {
    return new Map();
  }
}

export function useVisitQueue() {
  const [families, setFamilies] = useState<ScoredFamily[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allFamilies = getFamiliesForCHA(CHA_ID);
    const activeVisitsByFamily = await loadActiveVisits();

    const dueFamilies = filterDueToday(allFamilies, activeVisitsByFamily, DEFAULT_SCORING_CONFIG);

    const scored: ScoredFamily[] = dueFamilies.map(family => {
      const activeVisits = (activeVisitsByFamily.get(family.id) ?? []) as Visit[];
      const score = computeRiskScore(family, activeVisits, today, DEFAULT_SCORING_CONFIG);

      let lastVisitDate: string | null = null;
      let daysSinceLastVisit = Infinity;

      if (activeVisits.length > 0) {
        const sorted = [...activeVisits].sort(
          (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
        );
        lastVisitDate = sorted[0].visitDate;
        daysSinceLastVisit = Math.floor(
          (today.getTime() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      const followUpRequired = activeVisits.some(v => v.followUpFlags.length > 0);

      return { family, activeVisits, score, daysSinceLastVisit, lastVisitDate, followUpRequired };
    });

    setFamilies(sortQueue(scored));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    families,
    selectedId,
    select: setSelectedId,
    refresh,
  };
}
