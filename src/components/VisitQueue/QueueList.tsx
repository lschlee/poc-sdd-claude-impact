'use client';

import { useTranslations } from 'next-intl';
import { FamilyCard } from './FamilyCard';
import type { ScoredFamily } from '@/domain/models';

interface QueueListProps {
  families: ScoredFamily[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function QueueList({ families, selectedId, onSelect }: QueueListProps) {
  const t = useTranslations('queue');

  if (families.length === 0) {
    return (
      <div data-testid="queue-list" className="queue-list empty">
        <p>{t('emptyState')}</p>
      </div>
    );
  }

  return (
    <div data-testid="queue-list" className="queue-list">
      <h2 className="queue-title">{t('title')}</h2>
      {families.map(sf => (
        <FamilyCard
          key={sf.family.id}
          scoredFamily={sf}
          isSelected={selectedId === sf.family.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
