import React, { useMemo, useState } from 'react';
import { NavTabId } from '../data/gridData';
import { useTransformerLocations } from '../hooks/useTransformerLocations';
import { useHistoricalReadings } from '../hooks/useHistoricalReadings';
import { HistoricalReading, READING_METRICS, ReadingMetricKey } from '../services/historicalReadingData';
import { transformerZoneName } from '../services/transformerData';

interface HistoricalDataViewProps {
  onNavigate: (tab: NavTabId, assetId?: string) => void;
}

const PAGE_SIZE = 100;
type RangePreset = 'all' | '24H' | '7D' | '30D' | '1Y' | 'custom';

function localDateInput(date: Date): string {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function toIsoDate(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function scalarNumber(value: HistoricalReading['value']): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function formatTime(value: string | null): string {
  if (!value) return 'Timestamp unavailable';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? `${new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(date)} IST`
    : value;
}

function quoteCsv(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function exportPageCsv(transformerId: string, metric: string, records: HistoricalReading[]): void {
  const lines = [
    ['reading_id', 'transformer_id', 'timestamp', metric].join(','),
    ...records.map((record) => [record.id, record.transformerId, record.timestamp, record.value]
      .map(quoteCsv).join(',')),
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${transformerId}-${metric}-page.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export const HistoricalDataView: React.FC<HistoricalDataViewProps> = ({ onNavigate }) => {
  const [selectedTransformerId, setSelectedTransformerId] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [metric, setMetric] = useState<ReadingMetricKey>('load_kva');
  const [rangePreset, setRangePreset] = useState<RangePreset>('all');
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [page, setPage] = useState(0);
  const { allTransformers, isLoading: transformersLoading, error: transformersError } = useTransformerLocations();

  const zones = useMemo(() => [...new Set(allTransformers.map((transformer) => transformer.zoneId)
    .filter((zoneId): zoneId is number => zoneId !== null))].sort((a, b) => a - b), [allTransformers]);
  const visibleTransformers = zoneFilter === 'all'
    ? allTransformers
    : allTransformers.filter((transformer) => String(transformer.zoneId ?? 'unknown') === zoneFilter);
  const rangeInvalid = Boolean(fromInput && toInput && new Date(fromInput).getTime() > new Date(toInput).getTime());
  const from = toIsoDate(fromInput);
  const to = toIsoDate(toInput);
  const queryFilters = {
    transformerId: selectedTransformerId,
    metric,
    page,
    pageSize: PAGE_SIZE,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
  const { records, totalCount, isLoading, error, refresh } = useHistoricalReadings(
    Boolean(selectedTransformerId) && !rangeInvalid,
    queryFilters,
  );
  const selectedTransformer = allTransformers.find((transformer) => transformer.transformerId === selectedTransformerId);
  const metricInfo = READING_METRICS.find((item) => item.key === metric) ?? READING_METRICS[0];
  const numericRecords = records.flatMap((record) => {
    const value = scalarNumber(record.value);
    return value === null ? [] : [{ record, value }];
  });
  const numericValues = numericRecords.map(({ value }) => value);
  const mean = numericValues.length ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length : null;
  const minValue = Math.min(...numericValues);
  const maxValue = Math.max(...numericValues);
  const ascendingRecords = [...numericRecords].sort((first, second) => {
    const firstTime = first.record.timestamp ? Date.parse(first.record.timestamp) : 0;
    const secondTime = second.record.timestamp ? Date.parse(second.record.timestamp) : 0;
    return firstTime - secondTime;
  });
  const chartWidth = 900;
  const chartHeight = 240;
  const chartPoints = ascendingRecords.map(({ value }, index) => {
    const x = ascendingRecords.length < 2 ? chartWidth / 2 : index * chartWidth / (ascendingRecords.length - 1);
    const y = maxValue === minValue ? chartHeight / 2 : chartHeight - ((value - minValue) / (maxValue - minValue)) * (chartHeight - 24) - 12;
    return `${x},${y}`;
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeText = fromInput || toInput
    ? `${fromInput || 'Start unavailable'} — ${toInput || 'End unavailable'}`
    : 'All available timestamps';

  const changeRangePreset = (preset: RangePreset) => {
    setRangePreset(preset);
    setPage(0);
    if (preset === 'all') {
      setFromInput('');
      setToInput('');
      return;
    }
    if (preset === 'custom') return;
    const now = new Date();
    const start = new Date(now);
    if (preset === '24H') start.setHours(start.getHours() - 24);
    if (preset === '7D') start.setDate(start.getDate() - 7);
    if (preset === '30D') start.setDate(start.getDate() - 30);
    if (preset === '1Y') start.setFullYear(start.getFullYear() - 1);
    setFromInput(localDateInput(start));
    setToInput(localDateInput(now));
  };

  const onZoneChange = (value: string) => {
    setZoneFilter(value);
    const current = allTransformers.find((transformer) => transformer.transformerId === selectedTransformerId);
    if (current && value !== 'all' && String(current.zoneId ?? 'unknown') !== value) setSelectedTransformerId('');
    setPage(0);
  };

  const onTransformerChange = (value: string) => {
    setSelectedTransformerId(value);
    setPage(0);
  };

  return (
    <div className="flex w-full flex-col">
      <header className="flex flex-col justify-between gap-space-lg border-b border-outline-variant/60 bg-surface-container-lowest p-space-lg shadow-sm md:px-margin-desktop md:py-space-xl xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-col"><div className="mb-1 flex items-center gap-space-sm"><h1 className="font-headline-xl text-headline-xl tracking-tight text-on-surface">Historical Data</h1><span className="rounded-full bg-secondary-container px-2.5 py-1 font-label-sm text-label-sm font-semibold uppercase text-on-secondary-container">Measured readings</span></div><p className="max-w-4xl font-body-md text-body-md text-on-surface-variant">Explore timestamped transformer measurements returned from Supabase. Predictions are not included.</p></div>
        <div className="flex flex-wrap items-center gap-space-sm"><button disabled className="ui-button-secondary inline-flex h-10 cursor-not-allowed items-center gap-1.5 px-space-md font-label-md text-label-md opacity-50" title="Saved queries are not connected"><span className="material-symbols-outlined text-[18px]">bookmark_border</span><span>Saved Queries Unavailable</span></button><button onClick={() => exportPageCsv(selectedTransformerId, metric, records)} disabled={!selectedTransformerId || !records.length || isLoading || Boolean(error)} className="ui-button-secondary inline-flex h-10 items-center gap-1.5 px-space-md font-label-md text-label-md disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[18px] text-secondary">file_download</span><span>Download Current Page CSV</span></button><button onClick={() => onNavigate('reports')} className="ui-button-primary inline-flex h-10 items-center gap-1.5 px-space-md font-label-md text-label-md"><span className="material-symbols-outlined text-[18px] text-tertiary-fixed">picture_as_pdf</span><span>Open Reports</span></button></div>
      </header>

      {transformersError && <div role="alert" className="mx-space-lg mt-space-md rounded-xl border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container md:mx-margin-desktop">Unable to load transformer inventory for selection: {transformersError}</div>}
      {error && <div role="alert" className="mx-space-lg mt-space-md flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container md:mx-margin-desktop"><span>Unable to load historical readings: {error}. No fixture values are displayed.</span><button onClick={() => void refresh()} className="rounded-lg bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-on-surface">Retry</button></div>}

      <div className="px-space-lg pt-space-lg md:px-margin-desktop">
        <div className="grid grid-cols-1 items-end gap-space-sm md:grid-cols-2 xl:grid-cols-12">
          <div className="flex flex-col gap-1 xl:col-span-3"><label htmlFor="history-zone" className="flex items-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Zone filter</label><select id="history-zone" value={zoneFilter} disabled={transformersLoading || Boolean(transformersError)} onChange={(event) => onZoneChange(event.target.value)} className="ui-input h-10 w-full cursor-pointer px-3 font-body-sm text-body-sm"><option value="all">All available zones</option>{zones.map((zoneId) => <option key={zoneId} value={String(zoneId)}>{transformerZoneName(zoneId)}</option>)}</select></div>
          <div className="flex flex-col gap-1 xl:col-span-3"><label htmlFor="history-transformer" className="flex items-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Transformer</label><select id="history-transformer" value={selectedTransformerId} disabled={transformersLoading || Boolean(transformersError)} onChange={(event) => onTransformerChange(event.target.value)} className="ui-input h-10 w-full cursor-pointer px-3 font-body-sm text-body-sm"><option value="">Select a transformer</option>{visibleTransformers.map((transformer) => <option key={transformer.transformerId} value={transformer.transformerId}>{transformer.transformerId}{transformer.location ? ` · ${transformer.location}` : ''}</option>)}</select></div>
          <div className="flex flex-col gap-1 xl:col-span-3"><label htmlFor="history-metric" className="flex items-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Measurement</label><select id="history-metric" value={metric} onChange={(event) => { setMetric(event.target.value as ReadingMetricKey); setPage(0); }} className="ui-input h-10 w-full cursor-pointer px-3 font-body-sm text-body-sm">{READING_METRICS.map((item) => <option key={item.key} value={item.key}>{item.label}{item.unit === 'Unit unspecified' ? ' (unit unspecified)' : ` (${item.unit})`}</option>)}</select></div>
          <div className="flex flex-col gap-1 xl:col-span-3"><label className="flex items-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Time range</label><select value={rangePreset} onChange={(event) => changeRangePreset(event.target.value as RangePreset)} className="ui-input h-10 w-full cursor-pointer px-3 font-body-sm text-body-sm"><option value="all">All available timestamps</option><option value="24H">Last 24 hours</option><option value="7D">Last 7 days</option><option value="30D">Last 30 days</option><option value="1Y">Last year</option><option value="custom">Custom date/time</option></select></div>
        </div>
        <div className="mt-space-sm grid grid-cols-1 gap-space-sm sm:grid-cols-2"><label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">From (local time)<input type="datetime-local" value={fromInput} onChange={(event) => { setRangePreset('custom'); setFromInput(event.target.value); setPage(0); }} className="ui-input h-10 px-3 font-body-sm text-body-sm" /></label><label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">To (local time)<input type="datetime-local" value={toInput} onChange={(event) => { setRangePreset('custom'); setToInput(event.target.value); setPage(0); }} className="ui-input h-10 px-3 font-body-sm text-body-sm" /></label></div>
        {rangeInvalid && <p role="alert" className="mt-2 font-body-sm text-body-sm text-error">The start date/time must be earlier than the end date/time.</p>}
        <p className="mt-2 font-body-sm text-label-sm text-on-surface-variant">Custom and preset ranges filter the verified timestamp column. Each page contains at most {PAGE_SIZE} rows; charts and page summaries describe only the current page, while the record total describes the full selected range.</p>
      </div>

      <main className="flex flex-col gap-space-lg p-space-lg md:p-margin-desktop">
        {!selectedTransformerId && <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-space-md text-center font-body-sm text-body-sm text-on-surface-variant">Select a transformer to load its measured historical readings.</div>}
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Readings in selected range" value={isLoading ? '—' : error ? 'Unavailable' : String(totalCount)} note={selectedTransformerId ? `${selectedTransformerId} · ${rangeText}` : 'Select a transformer'} />
          <SummaryCard label="Latest reading on page" value={records.length ? formatTime(records[0].timestamp) : 'Unavailable'} note={metricInfo.label} compact />
          <SummaryCard label="Mean on current page" value={mean === null ? 'Unavailable' : `${mean.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${metricInfo.unit}`} note={`${numericValues.length} numeric values · ${metricInfo.label}`} compact />
          <SummaryCard label="Current page" value={isLoading ? '—' : `${records.length} / ${totalCount}`} note={`Page ${Math.min(page + 1, totalPages)} of ${totalPages}`} />
        </div>

        <section className="ui-card flex min-w-0 flex-col p-space-lg">
          <div className="flex flex-col justify-between gap-space-sm pb-space-md md:flex-row md:items-center"><div><div className="flex items-center gap-space-sm"><h2 className="font-headline-md text-headline-md text-on-surface">{metricInfo.label} history</h2><span className="rounded-full bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">Measured</span></div><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{selectedTransformerId || 'No transformer selected'} · {selectedTransformer ? transformerZoneName(selectedTransformer.zoneId) : 'Zone unavailable'} · {metricInfo.unit}</p><p className="font-body-sm text-label-sm text-outline">{rangeText}</p></div><div className="font-telemetry-data text-label-sm text-on-surface-variant">{isLoading ? 'Loading…' : error ? 'Unavailable' : `${numericRecords.length} numeric samples on this page`}</div></div>
          {isLoading ? <ChartMessage>Loading measured readings from transformer_readings…</ChartMessage> : error ? <ChartMessage>Chart unavailable because the readings query failed.</ChartMessage> : !selectedTransformerId ? <ChartMessage>Select a transformer to view its readings.</ChartMessage> : numericRecords.length === 0 ? <ChartMessage>No numeric {metricInfo.label.toLowerCase()} readings are available on this page for the selected range.</ChartMessage> : <div className="w-full overflow-x-auto"><svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${metricInfo.label} readings for ${selectedTransformerId}`} className="h-[280px] min-w-[620px] w-full text-secondary"><path d={`M 0 ${chartHeight - 12} H ${chartWidth}`} fill="none" stroke="currentColor" strokeOpacity="0.16" strokeDasharray="4 6" />{chartPoints.length > 1 && <polyline points={chartPoints.join(' ')} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}{chartPoints.map((point, index) => { const [cx, cy] = point.split(','); return <circle key={ascendingRecords[index]?.record.id} cx={cx} cy={cy} r="4" fill="currentColor" />; })}</svg><div className="flex justify-between font-telemetry-data text-label-sm text-on-surface-variant"><span>{ascendingRecords[0]?.record.timestamp ? formatTime(ascendingRecords[0].record.timestamp) : 'Timestamp unavailable'}</span><span>{ascendingRecords.at(-1)?.record.timestamp ? formatTime(ascendingRecords.at(-1)?.record.timestamp ?? null) : 'Timestamp unavailable'}</span></div></div>}
          <div className="mt-space-md grid grid-cols-1 gap-2 border-t border-outline-variant/40 pt-space-md sm:grid-cols-3"><MetricRange label="Minimum on page" value={numericValues.length ? `${minValue.toLocaleString()} ${metricInfo.unit}` : 'Unavailable'} /><MetricRange label="Maximum on page" value={numericValues.length ? `${maxValue.toLocaleString()} ${metricInfo.unit}` : 'Unavailable'} /><MetricRange label="Reading identifier" value={records[0]?.id ?? 'Unavailable'} /></div>
        </section>

        <section className="ui-card min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low/60 p-space-md"><div><h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Reading records</h2><p className="font-body-sm text-label-sm text-on-surface-variant">Exact records returned for the selected transformer, field, and time filter.</p></div><span className="font-telemetry-data text-label-sm text-on-surface-variant">{selectedTransformerId ? `${selectedTransformerId} · ${metricInfo.key}` : 'No transformer selected'}</span></div>
          <div className="w-full overflow-x-auto border-t border-outline-variant/50"><table className="w-full min-w-[620px] border-collapse text-left"><thead><tr className="bg-surface-container-low font-label-md text-label-md uppercase tracking-wider text-on-surface-variant"><th className="px-space-md py-3">Reading ID</th><th className="px-space-md py-3">Timestamp</th><th className="px-space-md py-3">Transformer</th><th className="px-space-md py-3 text-right">{metricInfo.label} · {metricInfo.unit}</th><th className="px-space-md py-3 text-right">Profile</th></tr></thead><tbody className="font-body-sm text-body-sm text-on-surface">{records.map((record) => <tr key={record.id} className="border-b border-outline-variant/30 odd:bg-surface-container-lowest even:bg-surface-container-low/40"><td className="px-space-md py-3 font-telemetry-data text-label-sm">{record.id}</td><td className="px-space-md py-3 font-telemetry-data text-label-sm">{formatTime(record.timestamp)}</td><td className="px-space-md py-3 font-telemetry-data text-label-md font-semibold">{record.transformerId}</td><td className="px-space-md py-3 text-right font-telemetry-data font-semibold">{record.value === null ? 'Unavailable' : String(record.value)}</td><td className="px-space-md py-3 text-right"><button onClick={() => onNavigate('transformer-detail', record.transformerId)} className="cursor-pointer rounded bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm font-semibold hover:bg-surface-container">Profile</button></td></tr>)}{isLoading && <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">Loading reading records…</td></tr>}{!isLoading && !error && selectedTransformerId && records.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">No readings were returned for this transformer and range.</td></tr>}</tbody></table></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 px-space-md py-space-sm"><span className="font-body-sm text-body-sm text-on-surface-variant">{error ? 'Results unavailable' : `${totalCount.toLocaleString()} readings in range · page ${Math.min(page + 1, totalPages)} of ${totalPages}`}</span><div className="flex gap-2"><button disabled={page === 0 || isLoading || !selectedTransformerId} onClick={() => setPage((value) => Math.max(0, value - 1))} className="ui-button-secondary px-3 py-1.5 font-label-sm text-label-sm disabled:cursor-not-allowed disabled:opacity-50">Previous</button><button disabled={page + 1 >= totalPages || isLoading || !selectedTransformerId} onClick={() => setPage((value) => value + 1)} className="ui-button-secondary px-3 py-1.5 font-label-sm text-label-sm disabled:cursor-not-allowed disabled:opacity-50">Next</button></div></div>
        </section>
      </main>
    </div>
  );
};

function SummaryCard({ label, value, note, compact = false }: { label: string; value: string; note: string; compact?: boolean }) {
  return <div className="ui-card flex min-w-0 flex-col justify-between p-space-lg"><div className="flex items-center justify-between"><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</span><span className="h-2 w-2 rounded-full bg-secondary" /></div><div className={`my-space-sm break-words font-telemetry-kpi text-on-surface ${compact ? 'text-[1rem] leading-snug' : 'text-telemetry-kpi'}`}>{value}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{note}</div></div>;
}

function MetricRange({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2"><span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span><span className="font-telemetry-data text-label-sm font-semibold text-on-surface">{value}</span></div>;
}

function ChartMessage({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-surface-container-low p-8 text-center font-body-sm text-body-sm text-on-surface-variant">{children}</div>;
}
