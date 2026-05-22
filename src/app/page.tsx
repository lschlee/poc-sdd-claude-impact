'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useVisitQueue } from '@/lib/hooks/useVisitQueue';
import { QueueList } from '@/components/VisitQueue/QueueList';
import Link from 'next/link';

const QueueMap = dynamic(() => import('@/components/VisitQueue/QueueMap').then(m => m.QueueMap), {
  ssr: false,
  loading: () => <div data-testid="map-loading" style={{ height: '100%' }}>Carregando mapa...</div>,
});

export default function HomePage() {
  const t = useTranslations();
  const { families, selectedId, select } = useVisitQueue();

  return (
    <main className="home-page">
      <h1 className="page-title">{t('queue.title')}</h1>
      <div className="queue-container">
        <div className="queue-list-panel">
          <QueueList
            families={families}
            selectedId={selectedId}
            onSelect={id => {
              select(id);
            }}
          />
        </div>
        <div className="queue-map-panel" data-testid="queue-map-wrapper">
          <QueueMap
            families={families}
            selectedId={selectedId}
            onSelect={id => {
              select(id);
            }}
          />
        </div>
      </div>
      <div className="family-links" style={{ display: 'none' }}>
        {families.map(sf => (
          <Link
            key={sf.family.id}
            href={`/family/${sf.family.id}`}
            data-testid={`family-link-${sf.family.id}`}
          >
            {sf.family.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
