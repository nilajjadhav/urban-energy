import React, { useMemo, useState } from 'react';
import { NavTabId } from '../data/gridData';
import { OverviewGeographicMap } from '../components/OverviewGeographicMap';
import { MapTransformer, useTransformerLocations } from '../hooks/useTransformerLocations';
import { usePredictions } from '../hooks/usePredictions';
import { OperationalRiskLevel, useTransformerRiskScores } from '../hooks/useTransformerRiskScores';
import { transformerZoneName } from '../services/transformerData';

interface OverviewViewProps {
  onNavigate: (tab: NavTabId, assetId?: string) => void;
}

const RISK_LEVELS: OperationalRiskLevel[] = ['Normal', 'Warning', 'High Risk', 'Critical'];
const RISK_DOT: Record<OperationalRiskLevel, string> = {
  Normal: 'bg-on-tertiary-container',
  Warning: 'bg-amber-500',
  'High Risk': 'bg-secondary',
  Critical: 'bg-error',
};

function predictionDateLabel(value: string | null): string {
  if (!value) return 'Timestamp unavailable';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? `${new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(date)} IST`
    : value;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [mapLayer, setMapLayer] = useState<'feeders' | 'thermal' | 'nodes'>('nodes');
  const { allTransformers, transformers: locatedTransformers, isLoading, error } = useTransformerLocations();
  const { scores: riskScores, isLoading: riskLoading, error: riskError } = useTransformerRiskScores(true);

  const zoneIds = useMemo(
    () => [...new Set(allTransformers.map((transformer) => transformer.zoneId).filter((id): id is number => id !== null))].sort((a, b) => a - b),
    [allTransformers],
  );
  const scopedAssets = selectedZoneId === null
    ? allTransformers
    : allTransformers.filter((transformer) => transformer.zoneId === selectedZoneId);
  const visibleTransformers = selectedZoneId === null
    ? locatedTransformers
    : locatedTransformers.filter((transformer) => transformer.zoneId === selectedZoneId);
  const scopedRiskScores = new Map(riskScores.map((score) => [score.transformerId, score]));
  const riskById = new Map<string, OperationalRiskLevel>();
  riskScores.forEach((score) => {
    if (score.riskLevel) riskById.set(score.transformerId, score.riskLevel);
  });
  const riskCounts = RISK_LEVELS.reduce<Record<OperationalRiskLevel, number>>((counts, level) => {
    counts[level] = scopedAssets.filter((asset) => scopedRiskScores.get(asset.transformerId)?.riskLevel === level).length;
    return counts;
  }, { Normal: 0, Warning: 0, 'High Risk': 0, Critical: 0 });
  const categorizedRiskCount = RISK_LEVELS.reduce((sum, level) => sum + riskCounts[level], 0);
  const unavailableRiskCount = Math.max(0, scopedAssets.length - categorizedRiskCount);
  const statuses = [...new Set(scopedAssets.map((asset) => asset.status).filter((status): status is string => Boolean(status)))];
  const assetsWithStatus = scopedAssets.filter((asset) => asset.status !== null).length;
  const scopedZoneLabel = selectedZoneId === null ? 'All zones' : transformerZoneName(selectedZoneId);
  const predictionTransformerIds = selectedZoneId === null
    ? undefined
    : scopedAssets.map((transformer) => transformer.transformerId);
  const {
    records: latestPredictions,
    totalCount: predictionCount,
    isLoading: predictionsLoading,
    error: predictionsError,
    refresh: refreshPredictions,
  } = usePredictions(true, {
    page: 0,
    pageSize: 4,
    ...(predictionTransformerIds ? { transformerIds: predictionTransformerIds } : {}),
  });

  const unavailablePanel = (message: string) => (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
      {message}
    </div>
  );

  const statusSummary = statuses.length
    ? statuses.map((status) => `${status}: ${scopedAssets.filter((asset) => asset.status === status).length}`).join(' · ')
    : 'Asset status unavailable';

  return (
    <div className="overview-page flex w-full flex-col gap-space-lg pb-space-xl">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col justify-between gap-space-md px-space-lg pt-space-xl lg:flex-row lg:items-center md:px-gutter-desktop">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Overview</h1>
            <span className="font-telemetry-data text-label-sm text-on-surface-variant">· GRID CELL 19-MB</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Transformer inventory and recorded risk classifications for the Mira-Bhayandar prototype.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-3 py-1.5 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
            <span className="font-label-md text-label-md text-on-surface font-semibold">Supabase data</span>
            <span className="font-body-sm text-label-sm text-on-surface-variant">· Prototype coordinates are simulated</span>
          </div>
          <select
            aria-label="Filter overview by zone"
            value={selectedZoneId ?? ''}
            onChange={(event) => setSelectedZoneId(event.target.value ? Number(event.target.value) : null)}
            disabled={isLoading || zoneIds.length === 0}
            className="h-10 rounded-xl border border-outline-variant bg-white px-3 text-on-surface transition-colors hover:bg-surface-container-low font-label-md text-label-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">All available zones</option>
            {zoneIds.map((zoneId) => <option key={zoneId} value={zoneId}>{transformerZoneName(zoneId)}</option>)}
          </select>
          <button onClick={() => onNavigate('reports')} className="ui-button-primary flex items-center gap-1.5 px-3 py-2 font-label-md text-label-md cursor-pointer whitespace-nowrap">
            <span className="material-symbols-outlined text-[16px]">description</span><span>Open Reports</span>
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-space-lg px-space-lg md:px-gutter-desktop">
        {error && <div role="alert" className="rounded-xl border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container">Unable to load transformer inventory from Supabase: {error}</div>}
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          <button type="button" onClick={() => onNavigate('transformers')} className="ui-card flex min-h-[170px] flex-col justify-between p-space-lg text-left transition-shadow hover:shadow-md">
            <div><span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Network inventory</span><h2 className="mt-0.5 font-headline-sm text-headline-sm text-on-surface font-semibold">Total transformers</h2></div>
            <div><div className="flex items-baseline gap-1.5"><span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">{isLoading ? '—' : error ? 'Unavailable' : scopedAssets.length}</span><span className="font-telemetry-data text-body-sm text-outline">records</span></div><p className="mt-2 rounded-lg bg-surface-container-low px-2.5 py-1.5 font-body-sm text-body-sm text-on-surface-variant">{scopedZoneLabel}</p></div>
          </button>
          <button type="button" onClick={() => onNavigate('transformers')} className="ui-card flex min-h-[170px] flex-col justify-between p-space-lg text-left transition-shadow hover:shadow-md">
            <div><span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Asset data</span><h2 className="mt-0.5 font-headline-sm text-headline-sm text-on-surface font-semibold">Status recorded</h2></div>
            <div><div className="flex items-baseline gap-1.5"><span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">{isLoading || error ? '—' : assetsWithStatus}</span><span className="font-telemetry-data text-body-sm text-outline">of {isLoading || error ? '—' : scopedAssets.length}</span></div><p className="mt-2 line-clamp-2 rounded-lg bg-surface-container-low px-2.5 py-1.5 font-body-sm text-body-sm text-on-surface-variant">{statusSummary}</p></div>
          </button>
          <button type="button" onClick={() => onNavigate('alerts')} className="ui-card flex min-h-[170px] flex-col justify-between p-space-lg text-left transition-shadow hover:shadow-md">
            <div><span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Operational risk</span><h2 className="mt-0.5 font-headline-sm text-headline-sm text-on-surface font-semibold">Categorized records</h2></div>
            <div><div className="flex items-baseline gap-1.5"><span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">{riskLoading ? '—' : riskError ? 'Unavailable' : categorizedRiskCount}</span><span className="font-telemetry-data text-body-sm text-outline">of {isLoading ? '—' : scopedAssets.length}</span></div><p className="mt-2 rounded-lg bg-surface-container-low px-2.5 py-1.5 font-body-sm text-body-sm text-on-surface-variant">Stored categorical risk levels only</p></div>
          </button>
          <button type="button" onClick={() => onNavigate('predictions')} className="ui-card flex min-h-[170px] flex-col justify-between p-space-lg text-left transition-shadow hover:shadow-md">
            <div><span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Risk coverage</span><h2 className="mt-0.5 font-headline-sm text-headline-sm text-on-surface font-semibold">Risk unavailable</h2></div>
            <div><div className="flex items-baseline gap-1.5"><span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">{riskLoading ? '—' : riskError ? 'Unavailable' : unavailableRiskCount}</span><span className="font-telemetry-data text-body-sm text-outline">transformers</span></div><p className="mt-2 rounded-lg bg-surface-container-low px-2.5 py-1.5 font-body-sm text-body-sm text-on-surface-variant">Asset status is not used as risk</p></div>
          </button>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-space-md xl:grid-cols-12">
          <div className="ui-card flex flex-col p-space-md xl:col-span-8 xl:p-space-lg">
            <div className="flex flex-col justify-between gap-space-sm pb-space-sm sm:flex-row sm:items-center">
              <div><div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">map</span><h2 className="font-headline-md text-headline-md text-on-surface">Transformer Map — Mira-Bhayandar</h2></div><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">Supabase transformer records plotted at simulated prototype coordinates.</p></div>
              <div className="flex items-center gap-1.5 self-start rounded-lg bg-surface-container-low p-1 sm:self-auto">
                {(['feeders', 'thermal', 'nodes'] as const).map((layer) => <button key={layer} onClick={() => setMapLayer(layer)} className={`rounded px-2.5 py-1 font-label-sm text-label-sm capitalize transition-colors ${mapLayer === layer ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}>{layer === 'nodes' ? 'Nodes' : layer}</button>)}
                <button onClick={() => onNavigate('live-grid')} className="flex h-6 w-6 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container" title="Open Full Live Grid"><span className="material-symbols-outlined text-[16px]">fullscreen</span></button>
              </div>
            </div>
            <OverviewGeographicMap layer={mapLayer} transformers={visibleTransformers} isLoading={isLoading} error={error} selectedZoneId={selectedZoneId} riskById={riskById} onNavigate={onNavigate} />
          </div>

          <div className="flex flex-col gap-space-md xl:col-span-4">
            <div className="flex flex-col rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-center justify-between"><h3 className="font-headline-sm text-headline-sm text-on-surface">Operational Risk</h3><span className="font-label-sm text-label-sm uppercase text-outline">{scopedZoneLabel}</span></div>
              {riskError ? <p role="alert" className="mt-4 rounded-lg bg-error-container p-3 font-body-sm text-body-sm text-on-error-container">Risk classifications unavailable: {riskError}</p> : riskLoading ? <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">Loading stored risk classifications…</p> : (
                <div className="mt-4 flex flex-col gap-3">
                  {RISK_LEVELS.map((level) => <div key={level} className="flex items-center justify-between"><span className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface"><span className={`h-2 w-2 rounded-full ${RISK_DOT[level]}`} />{level}</span><span className="font-telemetry-data text-body-sm font-semibold text-on-surface">{riskCounts[level]}</span></div>)}
                  <div className="flex items-center justify-between border-t border-outline-variant pt-2"><span className="font-body-sm text-body-sm text-on-surface-variant">Risk unavailable</span><span className="font-telemetry-data text-body-sm font-semibold text-on-surface">{unavailableRiskCount}</span></div>
                </div>
              )}
              <p className="mt-3 rounded-lg bg-surface-container-low p-2 font-body-sm text-body-sm text-on-surface-variant">Only stored categorical levels are counted; numeric scores are not reclassified here.</p>
            </div>
            <div className="flex flex-1 flex-col rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-center justify-between pb-2"><div><h3 className="font-headline-sm text-headline-sm text-on-surface">Transformer Asset Status</h3><span className="font-body-sm text-body-sm text-outline">From transformer inventory records</span></div><button onClick={() => onNavigate('transformers')} className="cursor-pointer font-label-md text-label-md text-secondary hover:underline">View all</button></div>
              {error ? unavailablePanel('Asset status summary unavailable because transformer inventory could not be loaded.') : isLoading ? <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">Loading transformer inventory…</p> : statuses.length ? <div className="mt-3 flex flex-col gap-2">{statuses.map((status) => <div key={status} className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2"><span className="font-body-sm text-body-sm text-on-surface">{status}</span><span className="font-telemetry-data text-label-md font-semibold text-on-surface">{scopedAssets.filter((asset) => asset.status === status).length}</span></div>)}</div> : unavailablePanel('No asset status values are available for this selection.')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><div className="mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[18px]">bolt</span><h3 className="font-headline-sm text-headline-sm text-on-surface">Feeder Loading</h3></div>{unavailablePanel('Feeder telemetry is not connected to this Overview. No live loading values are available.')}</section>
          <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[18px]">psychology</span><h3 className="font-headline-sm text-headline-sm text-on-surface">Predictions & Activity</h3></div><button onClick={() => onNavigate('predictions')} className="cursor-pointer font-label-md text-label-md text-secondary hover:underline">Open predictions</button></div><div className="mb-3 flex items-center justify-between"><span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Latest stored predictions · {scopedZoneLabel}</span><span className="font-telemetry-data text-label-sm text-on-surface-variant">{predictionsLoading ? 'Loading…' : predictionsError ? 'Unavailable' : `${predictionCount} records`}</span></div>{predictionsError ? <div role="alert" className="rounded-lg border border-error/30 bg-error-container p-3 font-body-sm text-body-sm text-on-error-container"><p>Predictions could not be loaded: {predictionsError}</p><button onClick={() => void refreshPredictions()} className="mt-2 font-label-md text-label-md font-semibold underline">Retry predictions</button></div> : predictionsLoading && latestPredictions.length === 0 ? <div className="rounded-lg bg-surface-container-low p-4 text-center font-body-sm text-body-sm text-on-surface-variant">Loading stored predictions…</div> : latestPredictions.length > 0 ? <div className="divide-y divide-outline-variant/40">{latestPredictions.map((prediction) => <div key={prediction.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 first:pt-0"><div className="min-w-0"><button onClick={() => onNavigate('transformer-detail', prediction.transformerId)} className="font-telemetry-data text-label-md font-semibold text-primary hover:text-secondary">{prediction.transformerId}</button><p className="font-body-sm text-label-sm text-on-surface-variant">{predictionDateLabel(prediction.timestamp)} · prediction record</p></div><div className="flex flex-wrap gap-x-3 font-telemetry-data text-label-sm text-on-surface"><span>Predicted load: {prediction.predictedLoadKva === null ? 'Unavailable' : `${prediction.predictedLoadKva} kVA`}</span><span>Overload probability: {prediction.overloadProbability ?? 'Unavailable'}</span></div></div>)}</div> : predictionCount > 0 ? <div className="rounded-lg bg-warning-container p-3 font-body-sm text-body-sm text-on-warning-container">{predictionCount} prediction records were counted, but no usable rows were returned for this page.</div> : <div className="rounded-lg bg-surface-container-low p-4 text-center font-body-sm text-body-sm text-on-surface-variant">No prediction records are available for {scopedZoneLabel}.</div>}<div className="mt-3 border-t border-outline-variant/40 pt-3"><h4 className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Activity</h4><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Unavailable: no connected activity data source is configured.</p></div></section>
          <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[18px]">tune</span><h3 className="font-headline-sm text-headline-sm text-on-surface">Grid Operations</h3></div><button onClick={() => onNavigate('settings')} className="cursor-pointer font-label-md text-label-md text-secondary hover:underline">Settings</button></div>{unavailablePanel('Aggregate load, frequency, shift activity, and operational infrastructure controls are not available from connected Overview data.')}</section>
        </div>
      </div>
    </div>
  );
};
