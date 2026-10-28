import React, { useMemo, useState } from 'react';
import { NavTabId } from '../data/gridData';
import { useTransformerLocations } from '../hooks/useTransformerLocations';
import { usePredictions } from '../hooks/usePredictions';
import { transformerZoneName } from '../services/transformerData';

interface PredictionsViewProps {
  onNavigate: (tab: NavTabId, assetId?: string) => void;
}

const PAGE_SIZE = 50;

function valueLabel(value: number | string | null): string {
  return value === null ? 'Unavailable' : String(value);
}

function dateLabel(value: string | null): string {
  if (!value) return 'Timestamp unavailable';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return `${new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(date)} IST`;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({ onNavigate }) => {
  const [page, setPage] = useState(0);
  const [zoneFilter, setZoneFilter] = useState('all');
  const [transformerFilter, setTransformerFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const { allTransformers, isLoading: transformersLoading, error: transformersError } = useTransformerLocations();

  const zoneIds = useMemo(() => [...new Set(allTransformers.map((transformer) => transformer.zoneId)
    .filter((zoneId): zoneId is number => zoneId !== null))].sort((a, b) => a - b), [allTransformers]);
  const selectedZoneId = zoneFilter === 'all' ? null : Number(zoneFilter);
  const zoneTransformerIds = selectedZoneId === null
    ? undefined
    : allTransformers.filter((transformer) => transformer.zoneId === selectedZoneId).map((transformer) => transformer.transformerId);
  const filters = {
    page,
    pageSize: PAGE_SIZE,
    ...(transformerFilter !== 'all' ? { transformerId: transformerFilter } : {}),
    ...(selectedZoneId !== null ? { transformerIds: zoneTransformerIds ?? [] } : {}),
    ...(searchText.trim() ? { searchText: searchText.trim() } : {}),
  };
  const { records, totalCount, isLoading, error, refresh } = usePredictions(true, filters);
  const transformerById = useMemo(() => new Map(allTransformers.map((transformer) => [transformer.transformerId, transformer])), [allTransformers]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const numericLoads = records.flatMap((record) => record.predictedLoadKva === null ? [] : [record.predictedLoadKva]);
  const maxLoad = Math.max(...numericLoads, 0);
  const loadRows = [...records].filter((record) => record.predictedLoadKva !== null)
    .sort((first, second) => (second.predictedLoadKva ?? 0) - (first.predictedLoadKva ?? 0)).slice(0, 8);
  const probabilityRows = [...records].filter((record) => typeof record.overloadProbability === 'number')
    .sort((first, second) => (Number(second.overloadProbability) || 0) - (Number(first.overloadProbability) || 0)).slice(0, 8);
  const maxProbabilityValue = Math.max(...probabilityRows.map((record) => Math.abs(Number(record.overloadProbability))), 0);
  const uniqueVersions = [...new Set(records.map((record) => record.modelVersion).filter((version): version is string => Boolean(version)))];
  const latestTimestamp = records.find((record) => record.timestamp)?.timestamp ?? null;
  const zoneLabel = selectedZoneId === null ? 'All zones' : transformerZoneName(selectedZoneId);

  const updateFilter = (update: () => void) => {
    setPage(0);
    update();
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-space-lg p-space-lg">
        <header className="ui-card flex flex-col gap-space-lg p-space-lg sm:p-space-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-space-xs"><span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Supabase prediction records</span><span className="font-telemetry-data text-label-sm text-outline">·</span><span className="font-telemetry-data text-label-sm text-on-surface-variant">Forecasts, not measured readings</span></div>
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">Predictions</h1>
            <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">Explore stored prediction outputs by transformer, zone, and model metadata.</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-space-xs rounded-lg bg-surface-container-low px-space-sm py-1.5 text-on-surface"><span className="material-symbols-outlined text-[18px] text-secondary">neurology</span><div className="flex flex-col"><span className="font-label-sm text-label-sm uppercase leading-none text-outline">Prediction source</span><span className="font-telemetry-data text-label-sm font-semibold text-on-surface">public.predictions</span></div></div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2"><span className="font-label-sm text-label-sm text-outline">Forecast horizon</span><select aria-label="Forecast horizon unavailable" disabled className="cursor-not-allowed bg-transparent font-label-md text-label-md text-on-surface-variant opacity-75"><option>Unavailable in schema</option></select></div>
            <button onClick={() => onNavigate('reports')} className="ui-button-primary flex cursor-pointer items-center gap-1.5 px-space-md py-2 font-label-md text-label-md font-semibold shadow-sm"><span className="material-symbols-outlined text-[18px] text-tertiary-fixed">description</span><span>Open Reports</span></button>
          </div>
        </header>

        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"><span>Unable to load predictions from Supabase: {error}. Fixture forecasts are not shown.</span><button onClick={() => void refresh()} className="rounded-lg bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-on-surface">Retry</button></div>}
        {transformersError && <div role="status" className="rounded-xl border border-warning/30 bg-warning-container px-4 py-3 font-body-sm text-body-sm text-on-warning-container">Transformer metadata is unavailable: zone and location labels may be unavailable. Prediction records remain linked by transformer ID.</div>}

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Prediction records" value={isLoading ? '—' : error ? 'Unavailable' : String(totalCount)} note={`${zoneLabel} · ${transformerFilter === 'all' ? 'All transformers' : transformerFilter}`} />
          <SummaryCard label="Predicted load values" value={isLoading ? '—' : String(numericLoads.length)} note="Available on this page · kVA" />
          <SummaryCard label="Latest prediction timestamp" value={dateLabel(latestTimestamp)} note="Latest record on this page" compact />
          <SummaryCard label="Model versions" value={isLoading ? '—' : uniqueVersions.length ? uniqueVersions.join(', ') : 'Unavailable'} note="Versions present on this page" compact />
        </div>

        <div className="grid grid-cols-1 items-start gap-space-lg xl:grid-cols-12">
          <section className="ui-card min-w-0 p-space-lg xl:col-span-7">
            <div className="mb-5 flex flex-col gap-3 border-b border-outline-variant/40 pb-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Predicted transformer load</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Highest available predicted load values on the current results page. No measured readings are mixed in.</p></div><span className="rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm text-on-secondary-container">Predicted values · kVA</span></div>
            {isLoading ? <ChartMessage>Loading prediction records…</ChartMessage> : loadRows.length === 0 ? <ChartMessage>No predicted load values are available in this result set.</ChartMessage> : <div className="space-y-4">{loadRows.map((record) => <div key={record.id}><div className="mb-1 flex items-center justify-between gap-3"><button onClick={() => onNavigate('transformer-detail', record.transformerId)} className="font-telemetry-data text-label-sm font-semibold text-primary hover:text-secondary">{record.transformerId}</button><span className="font-telemetry-data text-label-sm font-semibold text-on-surface">{record.predictedLoadKva} kVA</span></div><div className="h-2.5 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-secondary" style={{ width: `${maxLoad > 0 ? Math.max(0, Math.min(100, (record.predictedLoadKva ?? 0) / maxLoad * 100)) : 0}%` }} /></div><p className="mt-1 font-body-sm text-label-sm text-outline">{transformerById.get(record.transformerId)?.location ?? 'Location unavailable'} · {transformerById.has(record.transformerId) ? transformerZoneName(transformerById.get(record.transformerId)?.zoneId ?? null) : 'Transformer metadata unavailable'}</p></div>)}</div>}
          </section>
          <section className="ui-card flex h-full min-w-0 flex-col p-space-lg xl:col-span-5">
            <div className="mb-5 border-b border-outline-variant/40 pb-4"><h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Stored overload probability</h2><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Raw stored values; bars show relative magnitude within this page and do not indicate a threshold.</p></div>
            {isLoading ? <ChartMessage>Loading prediction records…</ChartMessage> : probabilityRows.length === 0 ? <ChartMessage>Overload probability is unavailable for the loaded records.</ChartMessage> : <div className="max-h-[390px] space-y-3 overflow-y-auto pr-1">{probabilityRows.map((record) => <div key={record.id}><div className="mb-1 flex items-center justify-between gap-3"><button onClick={() => onNavigate('transformer-detail', record.transformerId)} className="font-telemetry-data text-label-sm font-semibold text-primary hover:text-secondary">{record.transformerId}</button><span className="font-telemetry-data text-label-sm font-semibold text-on-surface">{valueLabel(record.overloadProbability)}</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-error" style={{ width: `${maxProbabilityValue > 0 ? Math.max(0, Math.min(100, Math.abs(Number(record.overloadProbability)) / maxProbabilityValue * 100)) : 0}%` }} /></div></div>)}</div>}
          </section>
        </div>

        <section className="ui-card flex min-w-0 flex-col overflow-hidden">
          <div className="flex flex-col items-stretch justify-between gap-space-sm bg-surface-container-low/60 p-space-md xl:flex-row xl:items-center">
            <div className="flex flex-wrap items-center gap-space-sm">
              <label className="flex items-center gap-1 rounded-lg bg-surface-container-lowest px-space-sm py-1.5 shadow-sm"><span className="font-label-sm text-label-sm uppercase text-outline">Zone</span><select aria-label="Filter by zone" value={zoneFilter} disabled={transformersLoading || zoneIds.length === 0} onChange={(event) => updateFilter(() => setZoneFilter(event.target.value))} className="cursor-pointer bg-transparent pr-2 font-label-md text-label-md text-on-surface"><option value="all">All available zones</option>{zoneIds.map((zoneId) => <option key={zoneId} value={String(zoneId)}>{transformerZoneName(zoneId)}</option>)}</select></label>
              <label className="flex items-center gap-1 rounded-lg bg-surface-container-lowest px-space-sm py-1.5 shadow-sm"><span className="font-label-sm text-label-sm uppercase text-outline">Transformer</span><select aria-label="Filter by transformer" value={transformerFilter} disabled={transformersLoading} onChange={(event) => updateFilter(() => setTransformerFilter(event.target.value))} className="max-w-56 cursor-pointer bg-transparent pr-2 font-label-md text-label-md text-on-surface"><option value="all">All transformers</option>{allTransformers.map((transformer) => <option key={transformer.transformerId} value={transformer.transformerId}>{transformer.transformerId}</option>)}</select></label>
            </div>
            <div className="relative w-full xl:w-80"><span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">search</span><input value={searchText} onChange={(event) => updateFilter(() => setSearchText(event.target.value))} className="h-9 w-full rounded-lg bg-surface-container-lowest pl-9 pr-3 font-body-sm text-body-sm text-on-surface shadow-sm placeholder:text-outline focus:outline-none" placeholder="Search transformer ID…" aria-label="Search transformer ID" /></div>
          </div>

          <div className="w-full overflow-x-auto rounded-b-xl border-t border-outline-variant/50">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead><tr className="select-none bg-surface-container-low font-label-md text-label-md uppercase tracking-wider text-on-surface-variant"><th className="px-space-md py-2.5">Transformer</th><th className="px-space-md py-2.5">Zone / Location</th><th className="px-space-md py-2.5">Prediction timestamp</th><th className="px-space-md py-2.5 text-right">Predicted load</th><th className="px-space-md py-2.5 text-right">Overload probability</th><th className="px-space-md py-2.5">Failure risk</th><th className="px-space-md py-2.5">Model version</th><th className="px-space-md py-2.5 text-right">Action</th></tr></thead>
              <tbody className="font-body-sm text-body-sm text-on-surface">
                {records.map((record) => {
                  const transformer = transformerById.get(record.transformerId);
                  return <tr key={record.id} className="border-b border-outline-variant/30 odd:bg-surface-container-lowest even:bg-surface-container-low/40 transition-colors hover:bg-secondary-fixed/30"><td className="px-space-md py-3"><span className="font-telemetry-data text-label-md font-bold">{record.transformerId}</span>{transformer && transformer.capacityKva !== null && <span className="ml-2 font-telemetry-data text-label-sm text-on-surface-variant">· {transformer.capacityKva} kVA capacity</span>}</td><td className="px-space-md py-3"><span className="block font-label-md text-label-md font-semibold">{transformer ? transformerZoneName(transformer.zoneId) : 'Zone unavailable'}</span><span className="text-label-sm text-on-surface-variant">{transformer?.location ?? (transformersError ? 'Metadata unavailable' : 'Location unavailable')}</span></td><td className="px-space-md py-3 font-telemetry-data text-label-sm">{dateLabel(record.timestamp)}</td><td className="px-space-md py-3 text-right font-telemetry-data font-semibold">{record.predictedLoadKva === null ? 'Unavailable' : `${record.predictedLoadKva} kVA`}</td><td className="px-space-md py-3 text-right font-telemetry-data">{valueLabel(record.overloadProbability)}</td><td className="px-space-md py-3 font-telemetry-data">{valueLabel(record.failureRisk)}</td><td className="px-space-md py-3 font-telemetry-data">{record.modelVersion ?? 'Unavailable'}</td><td className="px-space-md py-3 text-right"><div className="flex justify-end gap-1"><button onClick={() => onNavigate('transformer-detail', record.transformerId)} className="cursor-pointer rounded bg-surface-container-low px-2 py-1 font-label-sm text-label-sm font-semibold text-on-surface hover:bg-surface-container">Profile</button><button onClick={() => onNavigate('what-if-simulator', record.transformerId)} className="cursor-pointer rounded bg-primary px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-primary shadow-sm hover:bg-primary-container">Scenario</button></div></td></tr>;
                })}
                {isLoading && records.length === 0 && <tr><td colSpan={8} className="px-4 py-14 text-center font-body-sm text-body-sm text-on-surface-variant">Loading predictions from Supabase…</td></tr>}
                {!isLoading && !error && records.length === 0 && <tr><td colSpan={8} className="px-4 py-14 text-center font-body-sm text-body-sm text-on-surface-variant">{totalCount === 0 ? 'No prediction records are available for the signed-in session and selected filters.' : 'No prediction records match the selected filters.'}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 px-space-md py-space-sm"><span className="font-body-sm text-body-sm text-on-surface-variant">{error ? 'Results unavailable' : `${totalCount.toLocaleString()} records · page ${Math.min(page + 1, totalPages)} of ${totalPages}`}</span><div className="flex gap-2"><button disabled={page === 0 || isLoading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="ui-button-secondary px-3 py-1.5 font-label-sm text-label-sm disabled:cursor-not-allowed disabled:opacity-50">Previous</button><button disabled={page + 1 >= totalPages || isLoading} onClick={() => setPage((value) => value + 1)} className="ui-button-secondary px-3 py-1.5 font-label-sm text-label-sm disabled:cursor-not-allowed disabled:opacity-50">Next</button></div></div>
        </section>

        <div className="grid grid-cols-1 gap-space-md lg:grid-cols-3">
          <div className="flex items-start gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant"><span className="material-symbols-outlined text-[22px]">swap_calls</span></div><div><h3 className="font-headline-sm text-headline-sm text-on-surface">Scenario analysis</h3><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">Use the simulator to explore advisory scenarios; prediction records do not directly control equipment.</p><button onClick={() => onNavigate('what-if-simulator')} className="mt-2 inline-flex cursor-pointer items-center gap-1 font-label-md text-label-md font-semibold text-secondary hover:underline">Open simulator <span className="material-symbols-outlined text-[14px]">arrow_forward</span></button></div></div>
          <div className="flex items-start gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary"><span className="material-symbols-outlined text-[22px]">model_training</span></div><div><h3 className="font-headline-sm text-headline-sm text-on-surface">Model metadata</h3><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">Model version is shown only when supplied on each prediction row. No model performance metric is inferred.</p></div></div>
          <div className="flex items-start gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-container text-on-warning-container"><span className="material-symbols-outlined text-[22px]">schedule</span></div><div><h3 className="font-headline-sm text-headline-sm text-on-surface">Forecast horizon</h3><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">The verified predictions schema has no horizon column, so horizon-specific filtering is unavailable.</p></div></div>
        </div>
      </div>
    </div>
  );
};

function SummaryCard({ label, value, note, compact = false }: { label: string; value: string; note: string; compact?: boolean }) {
  return <div className="ui-card flex min-w-0 flex-col justify-between p-space-lg"><div className="flex items-center justify-between"><span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">{label}</span><span className="h-2 w-2 rounded-full bg-secondary-container" /></div><div className={`my-space-sm font-telemetry-kpi text-on-surface ${compact ? 'text-[1.05rem] leading-snug' : 'text-telemetry-kpi'}`}>{value}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{note}</div></div>;
}

function ChartMessage({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-surface-container-low p-8 text-center font-body-sm text-body-sm text-on-surface-variant">{children}</div>;
}
