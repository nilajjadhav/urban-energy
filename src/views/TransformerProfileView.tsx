import React, { useEffect, useMemo, useState } from 'react';
import { NavTabId } from '../data/gridData';
import { DataRecord, fetchTransformerReadingRows, fetchTransformerRelatedData, readNumber, readRecordTimestamp, readText, RelatedDataResult, TransformerRecord, transformerZoneName } from '../services/transformerData';
import { TransformerRiskScore } from '../hooks/useTransformerRiskScores';

interface TransformerProfileViewProps {
  transformer: TransformerRecord;
  riskData: TransformerRiskScore | null;
  riskLoading: boolean;
  riskError: string | null;
  onBack: () => void;
  onNavigate: (tab: NavTabId, assetId?: string) => void;
}

function recordTime(record: DataRecord): number {
  const time = readRecordTimestamp(record);
  return time ? Date.parse(time) : 0;
}

function readingTimestamp(record: DataRecord | null): string {
  if (!record) return 'Data not available';
  return readRecordTimestamp(record) ?? 'Data not available';
}

function latest(records: DataRecord[]): DataRecord | null {
  return [...records].sort((a, b) => recordTime(b) - recordTime(a))[0] ?? null;
}

function format(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Data not available';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'Data not available';
  if (typeof value === 'string' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function formatTimestamp(value: unknown): string {
  if (typeof value !== 'string') return format(value);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
}

function timestampField(key: string): boolean {
  return /(?:_at|_on|timestamp|datetime|date|time)$/i.test(key);
}

function formatRecordValue(key: string, value: unknown): string {
  if (timestampField(key)) return formatTimestamp(value);
  const rendered = format(value);
  const unit = unitForField(key);
  return unit && rendered !== 'Data not available' ? `${rendered} ${unit}` : rendered;
}

function unitForField(key: string): string | null {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/(percent|pct)$/.test(normalized)) return '%';
  if (normalized.includes('load') && normalized.includes('kva')) return 'kVA';
  if (normalized.includes('voltage') && normalized.includes('kv')) return 'kV';
  if (normalized.includes('voltage') && normalized.endsWith('v')) return 'V';
  if (normalized.includes('current') && /(amp|a)$/.test(normalized)) return 'A';
  if (normalized.includes('temp') && /(?:c|celsius)$/.test(normalized)) return '°C';
  if (normalized.includes('freq') && normalized.endsWith('hz')) return 'Hz';
  return null;
}

function metric(record: DataRecord | null, candidates: string[]): { value: string; unit: string | null } {
  if (!record) return { value: 'Data not available', unit: null };
  const exactKey = candidates.find((key) => record[key] !== null && record[key] !== undefined && record[key] !== '');
  if (exactKey) return { value: format(readNumber(record, [exactKey]) ?? readText(record, [exactKey]) ?? record[exactKey]), unit: unitForField(exactKey) };
  const tokens: Record<string, string[]> = {
    load_kva: ['load'],
    load: ['load'],
    current_load_kva: ['load'],
    load_value: ['load'],
    load_percentage: ['load', 'percent'],
    load_percent: ['load', 'percent'],
    load_pct: ['load', 'pct'],
    load_ratio: ['load', 'ratio'],
    voltage: ['volt'],
    voltage_v: ['volt'],
    voltage_kv: ['volt'],
    phase_voltage_kv: ['volt'],
    current: ['current'],
    current_a: ['current'],
    current_amp: ['current'],
    current_draw_a: ['current'],
    temperature: ['temp'],
    temperature_c: ['temp'],
    core_temperature_c: ['temp'],
    core_temp_c: ['temp'],
    frequency: ['freq'],
    frequency_hz: ['freq'],
  };
  const tokensForField = tokens[candidates[0]] ?? [];
  const dynamic = Object.entries(record).find(([key, value]) => {
    if (value === null || value === undefined || (typeof value !== 'number' && typeof value !== 'string')) return false;
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!tokensForField.every((token) => normalized.includes(token))) return false;
    if (candidates[0].startsWith('load_') && !candidates[0].includes('percentage') && !candidates[0].includes('percent') && !candidates[0].includes('pct') && !candidates[0].includes('ratio')) {
      return !/(percent|pct|ratio)/.test(normalized);
    }
    return true;
  });
  return dynamic
    ? { value: format(dynamic[1]), unit: unitForField(dynamic[0]) }
    : { value: 'Data not available', unit: null };
}

function displayKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function riskClass(level: string | null): string {
  switch (level?.toLowerCase()) {
    case 'critical': return 'bg-critical-container text-on-critical-container';
    case 'high risk': return 'bg-high-risk-container text-on-high-risk-container';
    case 'warning': return 'bg-warning-container text-on-warning-container';
    case 'normal': return 'bg-success-container text-on-success-container';
    default: return 'bg-surface-container-high text-on-surface-variant';
  }
}

function RecordList({ title, result, kind }: { title: string; result: RelatedDataResult | undefined; kind: 'predictions' | 'alerts' | 'maintenance' }) {
  if (!result) return <p className="font-body-sm text-body-sm text-on-surface-variant">Loading {title.toLowerCase()}…</p>;
  if (result.error) return <p role="alert" className="font-body-sm text-body-sm text-error">{title} could not be loaded: {result.error}</p>;
  if (!result.records.length) return <p className="font-body-sm text-body-sm text-on-surface-variant">Data not available.</p>;
  const records = [...result.records].sort((a, b) => recordTime(b) - recordTime(a));
  const columns = [...new Set(records.flatMap((record) => Object.keys(record)))];
  const getIdentifier = (record: DataRecord) => Object.entries(record).find(([key]) => /(?:prediction|alert|maintenance).*_id$/i.test(key));
  const severityTone = (value: unknown): string => {
    const severity = typeof value === 'string' ? value.toLowerCase() : '';
    if (severity.includes('critical') || severity.includes('high')) return 'bg-error';
    if (severity.includes('warning') || severity.includes('medium')) return 'bg-secondary';
    return 'bg-outline';
  };
  const renderValue = (key: string, value: unknown) => {
    const isStatus = /status/i.test(key);
    const isSeverity = kind === 'alerts' && /severity/i.test(key);
    const displayValue = formatRecordValue(key, value);
    return (
      <span className="inline-flex min-w-0 flex-wrap items-center gap-1.5 break-words [overflow-wrap:anywhere]">
        {isSeverity && <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${severityTone(value)}`} />}
        <span className={isStatus ? 'rounded bg-surface-container-high px-1.5 py-0.5 font-semibold' : ''}>{displayValue}</span>
      </span>
    );
  };
  return (
    <div className="min-w-0">
      <div className="hidden max-w-full overflow-x-auto rounded-lg border border-outline-variant/30 lg:block">
        <table className="w-full min-w-[960px] table-fixed border-collapse">
          <thead className="bg-surface-container-low text-left">
            <tr>{columns.map((key) => <th key={key} className={`px-4 py-3 font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant ${/(title|reason|description|message|details)/i.test(key) ? 'min-w-[260px]' : timestampField(key) ? 'min-w-[180px]' : 'min-w-[130px]'}`}>{displayKey(key)}</th>)}</tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={`${result.table}-${index}`} className="border-t border-outline-variant/20 align-top odd:bg-surface-container-lowest even:bg-surface-container-low/50">
                {columns.map((key) => <td key={key} className="px-4 py-3 font-body-sm text-body-sm leading-6 text-on-surface"><span className="font-telemetry-data">{renderValue(key, record[key])}</span></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {records.map((record, index) => {
          const identifier = getIdentifier(record);
          return (
            <article key={`${result.table}-mobile-${index}`} className="border-b border-outline-variant/30 py-4 first:pt-1 last:border-b-0">
              <h3 className="mb-3 font-label-lg text-label-lg font-semibold text-on-surface">{identifier ? `${displayKey(identifier[0])} ${format(identifier[1])}` : `${title} record ${index + 1}`}</h3>
              <dl className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
                {columns.map((key) => (
                  <div key={key} className={`min-w-0 ${/(title|reason|description|message|details)/i.test(key) ? 'sm:col-span-2' : ''}`}>
                    <dt className="font-label-sm text-label-sm text-on-surface-variant">{displayKey(key)}</dt>
                    <dd className="mt-1 break-words [overflow-wrap:anywhere] font-body-sm text-body-sm leading-6 text-on-surface">{renderValue(key, record[key])}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export const TransformerProfileView: React.FC<TransformerProfileViewProps> = ({ transformer, riskData, riskLoading, riskError, onBack, onNavigate }) => {
  const [related, setRelated] = useState<RelatedDataResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setRelated(null);
    setError(null);
    if (riskLoading) return () => { active = false; };
    const readingsRequest = riskData?.kind === 'reading'
      ? Promise.resolve<RelatedDataResult>({ table: 'transformer_readings', records: [riskData.source], error: null })
      : fetchTransformerReadingRows(transformer.transformerId);
    void Promise.all([
      fetchTransformerRelatedData(transformer.transformerId, ['risk_scores', 'transformer_readings']),
      readingsRequest,
    ])
      .then(([results, readings]) => { if (active) setRelated([...results, readings]); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load transformer profile data.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [transformer.transformerId, riskData?.kind, riskLoading]);

  const byTable = useMemo(() => new Map((related ?? []).map((result) => [result.table, result])), [related]);
  const latestReading = riskData?.kind === 'reading' ? riskData.source : latest(byTable.get('transformer_readings')?.records ?? []);
  const latestPrediction = latest(byTable.get('predictions')?.records ?? []);
  const loadHistory = useMemo(() => (byTable.get('transformer_readings')?.records ?? [])
    .map((record) => ({ record, reading: metric(record, ['load_kva', 'load', 'current_load_kva', 'load_value']) }))
    .filter(({ reading }) => reading.value !== 'Data not available' && Number.isFinite(Number(reading.value)))
    .sort((a, b) => recordTime(a.record) - recordTime(b.record)), [byTable]);
  const chartHistory = loadHistory.slice(-12);
  const loadValues = chartHistory.map(({ reading }) => Number(reading.value));
  const minLoad = Math.min(...loadValues);
  const maxLoad = Math.max(...loadValues);
  const chartPoints = chartHistory.map(({ record }, index) => {
    const x = chartHistory.length < 2 ? 50 : (index / (chartHistory.length - 1)) * 100;
    const value = loadValues[index];
    const y = maxLoad === minLoad ? 50 : 88 - ((value - minLoad) / (maxLoad - minLoad)) * 76;
    return { x, y, record };
  });

  const info = [
    ['Transformer ID', transformer.transformerId],
    ['Location', transformer.location],
    ['Zone', transformerZoneName(transformer.zoneId)],
    ['Capacity', transformer.capacityKva === null ? null : `${transformer.capacityKva} kVA`],
    ['Installation year', transformer.installationYear],
    ['Asset status', transformer.status],
    ['Maintenance status', transformer.maintenanceStatus],
  ] as const;
  const metrics = [
    ['Latest load', ['load_kva', 'load', 'current_load_kva', 'load_value']],
    ['Load percentage', ['load_percentage', 'load_percent', 'load_pct', 'load_ratio']],
    ['Voltage', ['voltage', 'voltage_v', 'voltage_kv', 'phase_voltage_kv']],
    ['Current', ['current', 'current_a', 'current_amp', 'current_draw_a']],
    ['Temperature', ['temperature', 'temperature_c', 'core_temperature_c', 'core_temp_c']],
    ['Frequency', ['frequency', 'frequency_hz']],
  ] as const;
  const riskScore = riskData?.kind === 'risk' ? riskData.score : null;
  const riskLevel = riskData?.riskLevel ?? null;

  return (
    <div className="flex w-full flex-col">
      <header className="flex flex-col gap-space-lg border-b border-outline-variant/60 bg-surface-container-lowest px-space-lg py-space-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <button onClick={onBack} className="mb-2 flex cursor-pointer items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary hover:text-on-surface">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Transformers
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">{transformer.transformerId}</h1>
            <span className="rounded-full bg-surface-container-low px-3 py-1 font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">Transformer profile</span>
          </div>
          <p className="mt-2 break-words font-body-sm text-body-sm text-on-surface-variant">{transformer.location || 'Location not available'} <span aria-hidden="true">·</span> {transformerZoneName(transformer.zoneId)}</p>
        </div>
        <button onClick={() => onNavigate('what-if-simulator', transformer.transformerId)} className="ui-button-primary inline-flex min-h-10 shrink-0 items-center justify-center gap-2 px-4 py-2.5 font-label-md text-label-md font-semibold shadow-sm">
          <span className="material-symbols-outlined text-[18px]">bolt</span> Simulate Load Shed
        </button>
      </header>

      {error && <div role="alert" className="mx-space-lg mt-space-md rounded-lg border border-error/20 bg-error-container p-3 font-body-sm text-body-sm text-on-error-container">Profile data error: {error}</div>}
      {loading && <div className="mx-space-lg mt-space-md flex items-center gap-2 rounded-lg bg-surface-container-low p-3 font-body-sm text-body-sm text-on-surface-variant"><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Loading transformer readings and related records…</div>}

      <main className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-space-lg px-space-lg py-space-lg xl:grid-cols-2">
        <section className="ui-card min-w-0 p-space-lg sm:p-space-xl">
          <div className="mb-4 flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Asset overview</h2>
            <span className="material-symbols-outlined text-secondary">settings_input_component</span>
          </div>
          <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {info.map(([label, value]) => (
              <div key={label} className="min-w-0 border-b border-outline-variant/20 py-3">
                <dt className="font-label-sm text-label-sm text-on-surface-variant">{label}</dt>
                <dd className="mt-1 break-words [overflow-wrap:anywhere] font-body-md text-body-md font-medium text-on-surface">{format(value)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="ui-card min-w-0 p-space-lg sm:p-space-xl">
          <div className="mb-4 flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Current operational risk</h2>
          </div>
          <dl className="grid grid-cols-1 divide-y divide-outline-variant/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="py-3 sm:pr-6">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Asset status</dt>
              <dd className="mt-2 font-body-md text-body-md font-medium text-on-surface">{transformer.status || 'Data not available'}</dd>
            </div>
            <div className="py-3 sm:px-6">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Operational risk</dt>
              <dd className="mt-2"><span className={`inline-flex max-w-full rounded px-2 py-1 font-label-md text-label-md font-semibold ${riskLoading ? 'bg-surface-container-high text-on-surface-variant' : riskClass(riskLevel)}`}>{riskLoading ? 'Loading…' : riskLevel || 'Risk unavailable'}</span></dd>
            </div>
            <div className="py-3 sm:pl-6">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Risk score</dt>
              <dd className="mt-2 break-words font-telemetry-data text-headline-md font-semibold tabular-nums text-on-surface">{riskScore === null ? 'Data not available' : riskScore}</dd>
            </div>
          </dl>
          {riskData?.kind === 'reading' && <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">Observed map reading: <span className="font-telemetry-data font-medium text-on-surface">{riskData.metricName.replace(/_/g, ' ')} · {riskData.score ?? 'Data not available'}</span></p>}
          {riskError && <p role="alert" className="mt-3 border-l-2 border-error px-3 py-1 font-body-sm text-body-sm text-on-error-container">Operational risk data unavailable: {riskError}</p>}
        </section>

        <section className="ui-card min-w-0 p-space-lg sm:p-space-xl xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Latest transformer reading</h2>
            </div>
            <span className="rounded-md bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">{loading ? 'Reading data loading' : latestReading ? 'Latest available reading' : 'No reading available'}</span>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map(([label, candidates], index) => {
              const reading = metric(latestReading, [...candidates]);
              const prominent = index < 2;
              return (
                <div key={label} className="min-w-0 rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4">
                  <dt className="font-label-md text-label-md text-on-surface-variant">{label}</dt>
                  <dd className={`mt-1 flex flex-wrap items-baseline gap-x-1.5 break-words [overflow-wrap:anywhere] tabular-nums text-on-surface ${prominent ? 'font-telemetry-data text-headline-md font-semibold' : 'font-body-lg text-body-lg font-medium'}`}>
                    <span>{loading ? 'Loading…' : reading.value}</span>{reading.unit && reading.value !== 'Data not available' && <span className="font-label-sm font-medium text-on-surface-variant">{reading.unit}</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-3 flex min-w-0 flex-col gap-1 border-t border-outline-variant/20 pt-3 sm:flex-row sm:items-start sm:justify-between">
            <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">Reading timestamp</span>
            <time className="min-w-0 break-words [overflow-wrap:anywhere] text-left font-telemetry-data text-label-sm text-on-surface sm:text-right">{loading ? 'Loading…' : formatTimestamp(readingTimestamp(latestReading))}</time>
          </div>
          {!loading && byTable.get('transformer_readings')?.error && <p role="alert" className="mt-3 rounded-lg bg-error-container p-3 font-body-sm text-body-sm text-on-error-container">Readings error: {byTable.get('transformer_readings')?.error}</p>}
        </section>

        <section className="ui-card min-w-0 p-space-lg sm:p-space-xl xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-3">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Load history</h2>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Recorded load values for this transformer only.</p>
            </div>
            <span className="rounded-full bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">{loading ? 'Loading readings' : `${loadHistory.length} available points`}</span>
          </div>
          {loading ? <p className="py-8 text-center font-body-sm text-body-sm text-on-surface-variant">Loading load history…</p>
            : byTable.get('transformer_readings')?.error ? <p role="alert" className="rounded-lg bg-error-container p-3 font-body-sm text-body-sm text-on-error-container">Load history could not be loaded: {byTable.get('transformer_readings')?.error}</p>
              : loadHistory.length === 0 ? <div className="rounded-lg bg-surface-container-low px-4 py-8 text-center font-body-sm text-body-sm text-on-surface-variant">No load history is available for this transformer.</div>
                : <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
                  <div className="min-w-0 rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4">
                    <div className="mb-3 flex items-center justify-between gap-2"><span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">Load trend</span><span className="font-telemetry-data text-label-sm text-on-surface-variant">{loadHistory[loadHistory.length - 1]?.reading.unit ?? ''}</span></div>
                    <svg role="img" aria-label="Recorded transformer load trend" viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full overflow-visible">
                      <path d="M 0 88 H 100 M 0 50 H 100 M 0 12 H 100" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
                      {chartPoints.length > 1 && <polyline points={chartPoints.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke="#087e8b" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />}
                      {chartPoints.map(({ x, y }, index) => <circle key={`${x}-${index}`} cx={x} cy={y} r="1.8" fill="#087e8b" />)}
                    </svg>
                    <div className="mt-2 flex justify-between font-label-sm text-label-sm text-on-surface-variant"><span>{formatTimestamp(readingTimestamp(chartHistory[0]?.record ?? null))}</span><span>{formatTimestamp(readingTimestamp(chartHistory[chartHistory.length - 1]?.record ?? null))}</span></div>
                  </div>
                  <div className="max-h-56 min-w-0 overflow-auto rounded-xl border border-outline-variant/50">
                    <table className="w-full min-w-[320px] text-left">
                      <thead className="sticky top-0 bg-surface-container-low"><tr className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant"><th className="px-3 py-2.5">Recorded at</th><th className="px-3 py-2.5 text-right">Load</th></tr></thead>
                      <tbody>{loadHistory.slice(-8).reverse().map(({ record, reading }, index) => <tr key={`${recordTime(record)}-${index}`} className="border-t border-outline-variant/40"><td className="px-3 py-2.5 font-body-sm text-body-sm text-on-surface">{formatTimestamp(readingTimestamp(record))}</td><td className="px-3 py-2.5 text-right font-telemetry-data text-label-md text-on-surface">{reading.value}{reading.unit ? ` ${reading.unit}` : ''}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>}
        </section>

        <section className="ui-card min-w-0 p-space-lg sm:p-space-xl xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Prediction history</h2>
            </div>
            {latestPrediction && <span className="font-label-sm text-label-sm text-on-surface-variant">Newest records first by available timestamp</span>}
          </div>
          <RecordList title="Predictions" result={loading ? undefined : byTable.get('predictions')} kind="predictions" />
        </section>

        <section className="ui-card min-w-0 p-space-lg sm:p-space-xl">
          <div className="mb-4 flex items-center gap-2 border-b border-outline-variant/40 pb-3">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Recent alerts</h2>
          </div>
          <RecordList title="Alerts" result={loading ? undefined : byTable.get('alerts')} kind="alerts" />
        </section>

        <section className="ui-card min-w-0 p-space-lg sm:p-space-xl">
          <div className="mb-4 flex items-center gap-2 border-b border-outline-variant/40 pb-3">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Maintenance history</h2>
          </div>
          <RecordList title="Maintenance history" result={loading ? undefined : byTable.get('maintenance_records')} kind="maintenance" />
        </section>
      </main>
    </div>
  );
};
