'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getFamiliesForCHA } from '@/lib/storage/rosterRepository';
import { getVisitHistoryForFamily } from '@/lib/storage/visitRepository';
import { registerVisit, undoVisit } from '@/lib/services/visitService';
import { VisitForm } from '@/components/VisitForm/VisitForm';
import type { Family, Visit } from '@/domain/models';

export function FamilyDetailClient({ familyId }: { familyId: string }) {
  const t = useTranslations();

  const [family, setFamily] = useState<Family | null>(null);
  const [visitHistory, setVisitHistory] = useState<Visit[]>([]);

  const loadHistory = useCallback(async () => {
    const history = await getVisitHistoryForFamily(familyId);
    setVisitHistory(history.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)));
  }, [familyId]);

  useEffect(() => {
    const families = getFamiliesForCHA('CHA-001');
    const found = families.find(f => f.id === familyId) ?? null;
    setFamily(found);
    loadHistory();
  }, [familyId, loadHistory]);

  const handleSubmit = async (data: {
    visitDate: string;
    notes: string;
    followUpFlags: string[];
  }) => {
    await registerVisit({
      familyId,
      visitDate: data.visitDate,
      notes: data.notes,
      followUpFlags: data.followUpFlags,
    });
    await loadHistory();
  };

  const handleUndo = async (visitId: string) => {
    await undoVisit(visitId);
    await loadHistory();
  };

  const latestActiveVisit = visitHistory.find(v => !v.undone);

  if (!family) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <main className="family-detail-page">
      <nav>
        <Link href="/" data-testid="back-to-queue">
          ← {t('familyDetail.backToQueue')}
        </Link>
      </nav>

      <h1>{family.name}</h1>

      <section className="residents-section">
        <h2>{t('familyDetail.residents')}</h2>
        <ul>
          {family.residents.map(r => (
            <li key={r.id}>
              {t(`common.ageGroup.${r.ageGroup}`)}
              {r.isPregnant && ` — ${t('common.pregnant')}`}
              {r.chronicConditions.length > 0 &&
                ` (${r.chronicConditions
                  .map(c => t(`chronicCondition.${c}` as Parameters<typeof t>[0]))
                  .join(', ')})`}
            </li>
          ))}
        </ul>
      </section>

      <section className="visit-form-section">
        <VisitForm familyId={familyId} onSubmit={handleSubmit} />
      </section>

      <section className="visit-history-section">
        <h2>{t('familyDetail.visitHistory')}</h2>

        {latestActiveVisit && (
          <button
            data-testid="undo-visit"
            onClick={() => handleUndo(latestActiveVisit.id)}
            className="btn-danger"
          >
            {t('visitForm.undoButton')}
          </button>
        )}

        {visitHistory.length === 0 ? (
          <p>{t('familyDetail.noVisits')}</p>
        ) : (
          <ul>
            {visitHistory.map(v => (
              <li key={v.id} data-testid="visit-history-item">
                <span data-testid="visit-date-display">
                  {t('familyDetail.visitDate', { date: v.visitDate })}
                </span>
                {v.notes && (
                  <span>{t('familyDetail.visitNotes', { notes: v.notes })}</span>
                )}
                {v.undone && (
                  <span data-testid="visit-undone-label">{t('familyDetail.visitUndone')}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
