'use client';

import { useTranslations } from 'next-intl';
import type { ScoredFamily } from '@/domain/models';

interface FamilyCardProps {
  scoredFamily: ScoredFamily;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function FamilyCard({ scoredFamily, isSelected, onSelect }: FamilyCardProps) {
  const t = useTranslations();
  const { family, score, lastVisitDate, daysSinceLastVisit } = scoredFamily;

  const topFactors = [...score.factors]
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .filter(f => f.contribution > 0);

  return (
    <div
      data-testid="family-card"
      data-family-id={family.id}
      className={`family-card${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(family.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(family.id)}
    >
      <div className="family-card-header">
        <span className="family-name">{family.name}</span>
        <span data-testid="risk-score" className="risk-score">
          {score.total.toFixed(2)}
        </span>
      </div>

      {family.coordinates === null && (
        <span data-testid="needs-location" className="needs-location">
          {t('queue.needsLocation')}
        </span>
      )}

      {lastVisitDate === null ? (
        <span data-testid="never-visited" className="never-visited">
          {t('queue.neverVisited')}
        </span>
      ) : (
        <span className="last-visit">
          {t('queue.lastVisit', { date: lastVisitDate })}
          {daysSinceLastVisit !== Infinity && ` (${daysSinceLastVisit}d)`}
        </span>
      )}

      {topFactors.length > 0 && (
        <ul className="risk-factors">
          {topFactors.map(f => (
            <li key={f.key} data-testid="risk-factor">
              {t(f.labelKey as Parameters<typeof t>[0])}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
