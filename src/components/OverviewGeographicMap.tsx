import React, { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { NavTabId } from '../data/gridData';
import { MapTransformer } from '../hooks/useTransformerLocations';
import { OperationalRiskLevel } from '../hooks/useTransformerRiskScores';

interface OverviewGeographicMapProps {
  layer: 'feeders' | 'thermal' | 'nodes';
  transformers: MapTransformer[];
  isLoading: boolean;
  error: string | null;
  selectedZoneId: number | null;
  riskById: ReadonlyMap<string, OperationalRiskLevel>;
  onNavigate: (tab: NavTabId, assetId?: string) => void;
}

const MAP_CENTER: [number, number] = [19.297, 72.8587];
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ZONE_NAMES: Record<number, string> = {
  1: 'Mira Road East',
  2: 'Mira Road West',
  3: 'Bhayandar East',
  4: 'Bhayandar West',
  5: 'Bhayandar North',
  6: 'Mira-Bhayandar Central',
};

function zoneName(zoneId: number | null): string {
  return zoneId === null ? 'Zone unavailable' : ZONE_NAMES[zoneId] || 'Zone unavailable';
}

function riskColor(level: OperationalRiskLevel | undefined): string {
  switch (level) {
    case 'Critical': return '#b42318';
    case 'High Risk': return '#bd4b12';
    case 'Warning': return '#8a5b00';
    case 'Normal': return '#177245';
    default: return '#087e8b';
  }
}

export const OverviewGeographicMap: React.FC<OverviewGeographicMapProps> = ({
  layer, transformers, isLoading, error, selectedZoneId, riskById, onNavigate,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTransformer = transformers.find((transformer) => transformer.transformerId === selectedId) ?? null;
  const showNodes = layer === 'nodes';

  return (
    <div className="relative h-[min(520px,62vh)] min-h-[390px] w-full overflow-hidden rounded-2xl border border-outline-variant/50 bg-primary shadow-inner sm:min-h-[460px]">
      <MapContainer
        center={MAP_CENTER}
        zoom={13}
        minZoom={11}
        maxZoom={19}
        zoomControl={false}
        scrollWheelZoom
        className="live-grid-leaflet h-full w-full"
      >
        <TileLayer
          url={TILE_URL}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        {showNodes && transformers.map((transformer) => (
          <CircleMarker
            key={transformer.transformerId}
            center={[transformer.latitude, transformer.longitude]}
            radius={selectedId === transformer.transformerId ? 7 : 4}
            pathOptions={{
              color: selectedId === transformer.transformerId ? '#ffffff' : riskColor(riskById.get(transformer.transformerId)),
              fillColor: riskColor(riskById.get(transformer.transformerId)),
              fillOpacity: 0.95,
              weight: selectedId === transformer.transformerId ? 2.5 : 1.5,
            }}
            eventHandlers={{ click: () => setSelectedId(transformer.transformerId) }}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] bg-gradient-to-t from-primary/20 via-transparent to-primary/10" />

      {isLoading && (
        <div className="absolute inset-0 z-[700] flex items-center justify-center bg-primary/55">
          <div className="rounded-lg bg-primary/95 px-4 py-3 font-label-md text-label-md text-on-primary shadow-lg">Loading transformer locations…</div>
        </div>
      )}
      {!isLoading && error && (
        <div role="alert" className="absolute left-1/2 top-4 z-[700] max-w-[85%] -translate-x-1/2 rounded-lg bg-error-container px-3 py-2 font-label-md text-label-md text-on-error-container shadow-lg">
          Unable to load transformer locations: {error}
        </div>
      )}
      {!isLoading && !error && transformers.length === 0 && (
        <div className="absolute left-1/2 top-4 z-[700] max-w-[85%] -translate-x-1/2 rounded-lg bg-primary/95 px-3 py-2 text-center font-label-md text-label-md text-on-primary shadow-lg">
          No transformers with valid coordinates are available.
        </div>
      )}
      {layer !== 'nodes' && (
        <div className="absolute left-1/2 top-4 z-[700] -translate-x-1/2 rounded-lg bg-primary/90 px-3 py-2 text-center font-label-sm text-label-sm text-on-primary shadow-lg">
          {layer === 'feeders' ? 'Feeder geometry is not available.' : 'Thermal data is not available.'}
        </div>
      )}

      <div className="absolute right-3 top-3 z-[650] rounded-full border border-white/15 bg-primary/90 px-3 py-1.5 font-telemetry-data text-label-sm text-on-primary shadow-md backdrop-blur-sm">
        {showNodes ? `${transformers.length} mapped transformers${selectedZoneId === null ? '' : ` · Zone ${selectedZoneId}`}` : 'Mira-Bhayandar'}
      </div>

      <div className="absolute bottom-3 left-3 z-[650] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-primary/95 px-3 py-2 text-on-primary shadow-lg backdrop-blur-sm">
        {[
          { label: 'Critical risk', color: '#b42318' },
          { label: 'High risk', color: '#bd4b12' },
          { label: 'Warning risk', color: '#8a5b00' },
          { label: 'Normal risk', color: '#177245' },
          { label: 'Risk unavailable', color: '#087e8b' },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 font-telemetry-data text-label-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {selectedTransformer && showNodes && (
        <div className="absolute bottom-16 right-3 z-[650] w-[min(18rem,calc(100%-1.5rem))] rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 text-on-surface shadow-xl sm:bottom-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-telemetry-data text-label-md font-bold">{selectedTransformer.transformerId}</h3>
              <p className="truncate font-label-sm text-label-sm text-on-surface-variant">
                {zoneName(selectedTransformer.zoneId)} · {selectedTransformer.location || 'Location not provided'}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close transformer details"
              className="rounded px-1 text-on-surface-variant hover:bg-surface-container-low"
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 font-label-sm text-label-sm">
            <span>Capacity: {selectedTransformer.capacityKva === null ? 'Unavailable' : `${selectedTransformer.capacityKva} kVA`}</span>
            <span>Asset status: {selectedTransformer.status || 'Unavailable'}</span>
            <span>Operational risk: {riskById.get(selectedTransformer.transformerId) ?? 'Risk unavailable'}</span>
            <span className="col-span-2">Maintenance: {selectedTransformer.maintenanceStatus || 'Unavailable'}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('transformer-detail', selectedTransformer.transformerId)}
            className="mt-2 rounded bg-primary-container px-2.5 py-1.5 font-label-sm text-label-sm font-semibold text-on-primary hover:bg-primary"
          >
            Inspect transformer
          </button>
        </div>
      )}
      <div className="absolute left-3 top-3 z-[650] max-w-[min(20rem,calc(100%-1.5rem))] rounded-lg bg-primary/90 px-2.5 py-1.5 font-label-sm text-label-sm text-on-primary shadow-md">
        Simulated prototype coordinates; not verified infrastructure locations.
      </div>
    </div>
  );
};
