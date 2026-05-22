'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTranslations } from 'next-intl';
import type { ScoredFamily } from '@/domain/models';

// Fix Leaflet's broken default icon resolution under webpack/Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

interface QueueMapProps {
  families: ScoredFamily[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const DEFAULT_CENTER: [number, number] = [-22.9525, -43.190];
const DEFAULT_ZOOM = 15;

export function QueueMap({ families, selectedId, onSelect }: QueueMapProps) {
  const t = useTranslations('map');
  const mapRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const sf = families.find(f => f.family.id === selectedId);
    if (sf?.family.coordinates) {
      mapRef.current.setView([sf.family.coordinates.lat, sf.family.coordinates.lng], DEFAULT_ZOOM);
    }
  }, [selectedId, families]);

  const familiesWithCoords = families.filter(sf => sf.family.coordinates !== null);
  const familiesWithoutCoords = families.filter(sf => sf.family.coordinates === null);

  return (
    <div data-testid="queue-map" className="queue-map">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          minZoom={14}
          maxZoom={17}
        />
        {familiesWithCoords.map(sf => (
          <Marker
            key={sf.family.id}
            position={[sf.family.coordinates!.lat, sf.family.coordinates!.lng]}
            eventHandlers={{ click: () => onSelect(sf.family.id) }}
          >
            <Popup>
              <strong>{sf.family.name}</strong>
              <br />
              {t('title')}: {sf.score.total.toFixed(2)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {familiesWithoutCoords.length > 0 && (
        <div className="no-coords-notice" data-testid="no-coords-list">
          {familiesWithoutCoords.map(sf => (
            <span key={sf.family.id} data-testid="needs-location-map">
              {sf.family.name}: {t('noCoordinates')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
