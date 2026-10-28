import React, { useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { NavTabId } from '../data/gridData';
import { useTransformerLocations } from '../hooks/useTransformerLocations';
import { OperationalRiskLevel, useTransformerRiskScores } from '../hooks/useTransformerRiskScores';

interface LiveGridGeographicMapProps {
  zoneFilter: string;
  riskFilter: string;
  autoRefresh: boolean;
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (message: string) => void;
}

const MAP_CENTER: [number, number] = [19.297, 72.8587];
const MAP_ZOOM = 13;
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

function riskLevelColor(level: OperationalRiskLevel | null): string {
  if (level === 'Critical') return '#b42318';
  if (level === 'High Risk') return '#bd4b12';
  if (level === 'Warning') return '#8a5b00';
  if (level === 'Normal') return '#177245';
  return '#087e8b';
}

function matchesRiskFilter(level: OperationalRiskLevel | null, riskFilter: string): boolean {
  if (riskFilter === 'All Risk Levels') return true;
  if (riskFilter.startsWith('Critical')) return level === 'Critical' || level === 'High Risk';
  if (riskFilter.startsWith('Warning')) return level === 'Warning';
  if (riskFilter.startsWith('Normal')) return level === 'Normal';
  return true;
}

interface ZoomControlsProps {
  onRecenter: () => void;
}

const MapZoomControls: React.FC<ZoomControlsProps> = ({ onRecenter }) => {
  const map = useMap();
  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-1 rounded-xl border border-white/15 bg-primary/95 p-1.5 shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-on-primary transition-colors hover:bg-primary-container"
        title="Zoom In"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-on-primary transition-colors hover:bg-primary-container"
        title="Zoom Out"
      >
        <span className="material-symbols-outlined text-[18px]">remove</span>
      </button>
      <div className="mx-0.5 h-4 w-px bg-outline-variant/30" />
      <button
        type="button"
        onClick={() => {
          map.setView(MAP_CENTER, MAP_ZOOM);
          onRecenter();
        }}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-on-primary transition-colors hover:bg-primary-container"
        title="Recenter Mira-Bhayandar"
      >
        <span className="material-symbols-outlined text-[18px]">my_location</span>
      </button>
    </div>
  );
};

const layerOptions = [
  { id: 'substations', label: 'Substations', icon: 'apartment' },
  { id: 'transformers', label: 'Transformers', icon: 'electric_bolt' },
  { id: 'ug', label: 'Overhead / UG', icon: 'cable' },
  { id: 'heatmap', label: 'Risk Heatmap', icon: 'local_fire_department' },
] as const;

type MapLayer = (typeof layerOptions)[number]['id'];

export const LiveGridGeographicMap: React.FC<LiveGridGeographicMapProps> = ({
  zoneFilter,
  riskFilter,
  autoRefresh,
  onNavigate,
  onShowToast,
}) => {
  const { transformers: mapTransformers, isLoading, error: loadError } = useTransformerLocations(autoRefresh ? 5000 : null);
  const [selectedTransformerId, setSelectedTransformerId] = useState('MB-042');
  const [activeLayer, setActiveLayer] = useState<MapLayer>('transformers');
  const { scores: riskScores, isLoading: isRiskLoading, error: riskError } = useTransformerRiskScores(true);
  const riskScoresById = useMemo(() => new Map(riskScores.map((entry) => [entry.transformerId, entry])), [riskScores]);
  const numericRiskScores = useMemo(() => riskScores.flatMap((entry) => entry.score === null ? [] : [entry.score]), [riskScores]);

  const filteredTransformers = useMemo(
    () => mapTransformers.filter((transformer) => {
      const matchesZone = zoneFilter === 'All Zones (6)' || zoneName(transformer.zoneId) === zoneFilter;
      return matchesZone && matchesRiskFilter(riskScoresById.get(transformer.transformerId)?.riskLevel ?? null, riskFilter);
    }),
    [mapTransformers, riskFilter, riskScoresById, zoneFilter],
  );
  const selectedTransformer = mapTransformers.find((item) => item.transformerId === selectedTransformerId) ?? mapTransformers[0] ?? null;
  const heatMin = numericRiskScores.length ? Math.min(...numericRiskScores) : 0;
  const heatMax = numericRiskScores.length ? Math.max(...numericRiskScores) : 0;
  const selectedRisk = selectedTransformer ? riskScoresById.get(selectedTransformer.transformerId) : undefined;
  const heatSourceLabel = riskScores[0]?.kind === 'reading'
    ? `Observed ${riskScores[0].metricName.replace(/_/g, ' ')}`
    : 'Observed risk score';
  const riskColor = (score: number): string => {
    const ratio = heatMax === heatMin ? 0.5 : (score - heatMin) / (heatMax - heatMin);
    const red = Math.round(34 + ratio * 187);
    const green = Math.round(190 - ratio * 139);
    const blue = Math.round(208 - ratio * 198);
    return `rgb(${red}, ${green}, ${blue})`;
  };
  const canShowTransformers = activeLayer === 'transformers' || activeLayer === 'heatmap';

  const handleRecenter = () => {
    setSelectedTransformerId(mapTransformers.find((item) => item.transformerId === 'MB-042')?.transformerId ?? mapTransformers[0]?.transformerId ?? 'MB-042');
    onShowToast('Map recentered on Mira-Bhayandar');
  };

  return (
    <div className="relative h-[min(72vh,760px)] min-h-[520px] w-full select-none overflow-hidden rounded-2xl border border-outline-variant/50 bg-primary shadow-lg md:min-h-[580px] xl:min-h-[620px]">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
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

        {canShowTransformers && filteredTransformers.map((transformer) => {
          const transformerRisk = riskScoresById.get(transformer.transformerId);
          if (activeLayer === 'heatmap' && (!transformerRisk || (transformerRisk.score === null && transformerRisk.riskLevel === null))) return null;
          const markerColor = activeLayer === 'heatmap' && transformerRisk?.score !== null && transformerRisk?.score !== undefined
            ? riskColor(transformerRisk.score)
            : riskLevelColor(transformerRisk?.riskLevel ?? null);
          const isSelected = transformer.transformerId === selectedTransformer?.transformerId;
          return (
            <CircleMarker
              key={transformer.transformerId}
              center={[transformer.latitude, transformer.longitude]}
              radius={activeLayer === 'heatmap' && transformerRisk?.score !== null && transformerRisk?.score !== undefined
                ? Math.min(11, Math.max(5, 5 + ((transformerRisk.score - heatMin) / (heatMax - heatMin || 1)) * 6))
                : isSelected ? 8 : 5}
              pathOptions={{
                color: isSelected ? '#ffffff' : markerColor,
                fillColor: markerColor,
                fillOpacity: 0.96,
                opacity: 1,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{ click: () => setSelectedTransformerId(transformer.transformerId) }}
            />
          );
        })}

        <MapZoomControls onRecenter={handleRecenter} />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] bg-gradient-to-t from-primary/25 via-transparent to-primary/10" />

      <div className="absolute left-3 right-3 top-3 z-[1000] flex flex-row flex-wrap gap-1.5 rounded-xl border border-white/15 bg-primary/95 p-1.5 shadow-xl backdrop-blur-md sm:left-4 sm:right-auto sm:top-4 sm:flex-col">
        {layerOptions.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => setActiveLayer(layer.id)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-label-md text-label-md transition-colors ${
              activeLayer === layer.id ? 'bg-white text-primary shadow-sm' : 'text-on-primary-container hover:bg-white/10'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${layer.id === 'transformers' ? 'text-tertiary-fixed' : layer.id === 'heatmap' ? 'text-error' : 'text-secondary'}`}>
              {layer.icon}
            </span>
            <span>{layer.label}{layer.id === 'transformers' ? ` (${mapTransformers.length})` : ''}</span>
          </button>
        ))}
      </div>

      <div className="absolute right-3 top-[4.35rem] z-[1000] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-space-md gap-y-space-xs rounded-xl border border-white/15 bg-primary/95 p-space-sm text-on-primary shadow-xl backdrop-blur-md sm:right-4 sm:top-4">
        {activeLayer === 'heatmap' && numericRiskScores.length > 0 ? (
          <>
            <span className="font-label-sm text-label-sm">{heatSourceLabel} (relative)</span>
            <span className="h-2.5 w-20 rounded-full bg-gradient-to-r from-[#22bed0] via-[#a17b6e] to-[#dd3332]" />
            <span className="font-label-sm text-label-sm">Lower → Higher</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-critical" /><span className="font-label-sm text-label-sm">Critical / High Risk</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" /><span className="font-label-sm text-label-sm">Warning</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" /><span className="font-label-sm text-label-sm">Normal</span></div>
          </>
        )}
      </div>

      {activeLayer === 'substations' && (
        <div className="absolute left-1/2 top-20 z-[1000] max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-primary/95 px-3 py-2 text-center font-label-md text-label-md text-on-primary shadow-lg">
          Substation coordinates are not included in the transformer dataset.
        </div>
      )}
      {activeLayer === 'ug' && (
        <div className="absolute left-1/2 top-20 z-[1000] max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-primary/95 px-3 py-2 text-center font-label-md text-label-md text-on-primary shadow-lg">
          Feeder geometry is not loaded; no lines are being inferred.
        </div>
      )}
      {activeLayer === 'heatmap' && !isRiskLoading && !riskError && !riskScores.some((entry) => entry.score !== null || entry.riskLevel !== null) && (
        <div className="absolute left-1/2 top-20 z-[1000] max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-primary/95 px-3 py-2 text-center font-label-md text-label-md text-on-primary shadow-lg">
          No numeric risk values or explicit operational risk levels are available for this layer.
        </div>
      )}
      {activeLayer === 'heatmap' && !isRiskLoading && numericRiskScores.length === 0 && riskScores.some((entry) => entry.riskLevel !== null) && (
        <div className="absolute left-1/2 top-20 z-[1000] max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-primary/95 px-3 py-2 text-center font-label-md text-label-md text-on-primary shadow-lg">
          Numeric scores unavailable; showing explicit risk levels only.
        </div>
      )}
      {activeLayer === 'heatmap' && riskError && (
        <div role="alert" className="absolute left-1/2 top-20 z-[1000] max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-xl bg-error-container px-3 py-2 text-center font-label-md text-label-md text-on-error-container shadow-lg">
          Risk scores unavailable: {riskError}
        </div>
      )}
      {activeLayer === 'heatmap' && isRiskLoading && (
        <div className="absolute left-1/2 top-20 z-[1000] max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-primary/95 px-3 py-2 text-center font-label-md text-label-md text-on-primary shadow-lg">
          Loading risk data…
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-primary/55 backdrop-blur-[1px]">
          <div className="rounded-lg bg-primary/95 px-4 py-3 font-label-md text-label-md text-on-primary shadow-xl">Loading transformer coordinates…</div>
        </div>
      )}
      {!isLoading && loadError && (
        <div role="alert" className="absolute left-1/2 top-28 z-[1100] max-w-[85%] -translate-x-1/2 rounded-xl bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container shadow-xl">
          Unable to load transformer locations: {loadError}
        </div>
      )}
      {!isLoading && !loadError && mapTransformers.length === 0 && (
        <div className="absolute left-1/2 top-28 z-[1100] max-w-[85%] -translate-x-1/2 rounded-xl border border-white/15 bg-primary/95 px-4 py-3 text-center font-label-md text-label-md text-on-primary shadow-xl">
          No transformer rows with valid latitude and longitude are available.
        </div>
      )}
      {!isLoading && !loadError && canShowTransformers && mapTransformers.length > 0 && filteredTransformers.length === 0 && (
        <div className="absolute left-1/2 top-28 z-[1100] max-w-[85%] -translate-x-1/2 rounded-xl border border-white/15 bg-primary/95 px-4 py-3 text-center font-label-md text-label-md text-on-primary shadow-xl">
          No transformers match the selected filters.
        </div>
      )}

      <div className="absolute left-4 top-[50%] z-[900] hidden -translate-y-1/2 flex-col gap-1.5 rounded-xl border border-white/10 bg-primary/90 px-3 py-2.5 text-on-primary shadow-lg backdrop-blur-sm sm:flex">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline-variant">Geographic view</span>
        <span className="font-headline-sm text-headline-sm font-semibold">Mira-Bhayandar</span>
        <span className="font-telemetry-data text-label-sm text-tertiary-fixed">{filteredTransformers.length} mapped transformers</span>
      </div>

      {selectedTransformer && (
        <div className="absolute bottom-[4.5rem] left-1/2 z-[950] w-[min(22rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-space-md text-on-surface shadow-2xl">
          <div className="mb-2 flex items-start justify-between gap-2 border-b border-outline-variant pb-2">
            <div className="min-w-0">
              <h4 className="font-headline-sm text-headline-sm font-bold">Transformer {selectedTransformer.transformerId}</h4>
              <p className="truncate font-label-sm text-label-sm text-on-surface-variant">{zoneName(selectedTransformer.zoneId)} · {selectedTransformer.location || 'Location not provided'}</p>
            </div>
            <span className="shrink-0 rounded bg-surface-container-high px-1.5 py-0.5 font-telemetry-data text-label-sm font-bold">
              {selectedTransformer.status || 'Status unavailable'}
            </span>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 text-left">
            <div className="rounded-lg border border-outline-variant/70 bg-surface-container-low p-2">
              <span className="block font-label-sm text-label-sm uppercase text-on-surface-variant">Capacity</span>
              <span className="font-telemetry-data text-label-lg font-semibold">{selectedTransformer.capacityKva === null ? 'Not loaded' : `${selectedTransformer.capacityKva} kVA`}</span>
            </div>
            <div className="rounded-lg border border-outline-variant/70 bg-surface-container-low p-2">
              <span className="block font-label-sm text-label-sm uppercase text-on-surface-variant">Maintenance</span>
              <span className="font-telemetry-data text-label-lg font-semibold">{selectedTransformer.maintenanceStatus || 'Not loaded'}</span>
            </div>
            <div className="rounded-lg border border-outline-variant/70 bg-surface-container-low p-2">
              <span className="block font-label-sm text-label-sm uppercase text-on-surface-variant">Operational risk</span>
              <span className="font-telemetry-data text-label-lg font-semibold">{selectedRisk?.riskLevel ?? 'Risk unavailable'}</span>
            </div>
          </div>

          <div className="mb-3 rounded bg-surface-container-low p-2 font-label-sm text-label-sm text-on-surface-variant">
            Load, temperature, current, and voltage readings appear in the full profile when available.
            {activeLayer === 'heatmap' && ` ${selectedRisk?.score !== null && selectedRisk?.score !== undefined ? `${selectedRisk.metricName.replace(/_/g, ' ')}: ${selectedRisk.score}` : 'Risk score: Data not available'}.`}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onNavigate('transformer-detail', selectedTransformer.transformerId);
              }}
            className="ui-button-primary flex-1 px-2 py-1.5 text-center font-label-sm text-label-sm font-semibold"
            >
              View Full Profile
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('what-if-simulator', selectedTransformer.transformerId);
                onShowToast(`Opening What-If Simulator for ${selectedTransformer.transformerId}`);
              }}
            className="ui-button-secondary px-2 py-1.5 font-label-sm text-label-sm"
            >
              Divert Load
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
