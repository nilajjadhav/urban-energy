import React, { useEffect, useMemo, useState } from 'react';
import { NavTabId } from '../data/gridData';
import { fetchAllTransformers, TransformerRecord, transformerZoneName } from '../services/transformerData';
import { TransformerProfileView } from './TransformerProfileView';
import { TransformerRiskScore, useTransformerRiskScores } from '../hooks/useTransformerRiskScores';

interface TransformerDirectoryViewProps {
  selectedAssetId?: string | null;
  onSelectAsset: (assetId: string | null) => void;
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (message: string, isError?: boolean) => void;
}

const PAGE_SIZE = 25;

function statusClass(status: string | null): string {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'in service':
    case 'in_service': return 'bg-success-container text-on-success-container';
    default: return 'bg-surface-container-high text-on-surface-variant';
  }
}

function riskClass(level: TransformerRiskScore['riskLevel']): string {
  switch (level) {
    case 'Normal': return 'bg-success-container text-on-success-container';
    case 'Warning': return 'bg-warning-container text-on-warning-container';
    case 'High Risk': return 'bg-high-risk-container text-on-high-risk-container';
    case 'Critical': return 'bg-critical-container text-on-critical-container';
    default: return 'bg-surface-container-high text-on-surface-variant';
  }
}

function availableLoad(item: TransformerRiskScore | undefined): string {
  if (!item || item.kind !== 'reading' || !/load/i.test(item.metricName)) return 'Unavailable';
  const unit = /kva/i.test(item.metricName) ? ' kVA' : /percent|pct/i.test(item.metricName) ? '%' : '';
  return `${item.score}${unit}`;
}

export const TransformerDirectoryView: React.FC<TransformerDirectoryViewProps> = ({
  selectedAssetId,
  onSelectAsset,
  onNavigate,
  onShowToast,
}) => {
  const [transformers, setTransformers] = useState<TransformerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [maintenanceFilter, setMaintenanceFilter] = useState('All Maintenance');
  const [page, setPage] = useState(0);
  const { scores: riskScores, isLoading: isRiskLoading, error: riskError } = useTransformerRiskScores(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void fetchAllTransformers()
      .then((rows) => { if (active) { setTransformers(rows); setError(null); } })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load transformer records.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const zones = useMemo(() => [...new Set(transformers.map((row) => transformerZoneName(row.zoneId)))].sort(), [transformers]);
  const statuses = useMemo(() => [...new Set(transformers.map((row) => row.status).filter((value): value is string => Boolean(value)))].sort(), [transformers]);
  const maintenanceStatuses = useMemo(() => [...new Set(transformers.map((row) => row.maintenanceStatus).filter((value): value is string => Boolean(value)))].sort(), [transformers]);
  const filtered = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return transformers.filter((row) => {
      const matchesSearch = !search || row.transformerId.toLowerCase().includes(search) || (row.location ?? '').toLowerCase().includes(search);
      return matchesSearch &&
        (zoneFilter === 'All Zones' || transformerZoneName(row.zoneId) === zoneFilter) &&
        (statusFilter === 'All Statuses' || row.status === statusFilter) &&
        (maintenanceFilter === 'All Maintenance' || row.maintenanceStatus === maintenanceFilter);
    });
  }, [transformers, searchQuery, zoneFilter, statusFilter, maintenanceFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selectedTransformer = selectedAssetId ? transformers.find((row) => row.transformerId === selectedAssetId) : null;
  const riskById = useMemo(() => new Map(riskScores.map((item) => [item.transformerId, item])), [riskScores]);

  useEffect(() => { setPage(0); }, [searchQuery, zoneFilter, statusFilter, maintenanceFilter]);

  if (selectedAssetId) {
    if (isLoading) return <div className="p-space-xl font-body-md text-body-md text-on-surface-variant">Loading transformer {selectedAssetId}…</div>;
    if (error) return (
      <div className="p-space-xl">
        <button onClick={() => onSelectAsset(null)} className="mb-4 font-label-md text-label-md text-secondary">← Back to transformers</button>
        <p role="alert" className="rounded-lg bg-error-container p-4 text-on-error-container">Unable to load transformer profile: {error}</p>
      </div>
    );
    if (!selectedTransformer) return (
      <div className="p-space-xl">
        <button onClick={() => onSelectAsset(null)} className="mb-4 font-label-md text-label-md text-secondary">← Back to transformers</button>
        <p className="rounded-lg bg-surface-container-lowest p-4 text-on-surface">Transformer {selectedAssetId} was not returned by Supabase.</p>
      </div>
    );
    return <TransformerProfileView transformer={selectedTransformer} riskData={riskById.get(selectedTransformer.transformerId) ?? null} riskLoading={isRiskLoading} riskError={riskError} onBack={() => onSelectAsset(null)} onNavigate={onNavigate} />;
  }

  const countRisk = (level: NonNullable<TransformerRiskScore['riskLevel']>) => transformers.filter((row) => riskById.get(row.transformerId)?.riskLevel === level).length;
  return (
    <div className="flex w-full flex-col">
      <header className="flex flex-col gap-space-lg border-b border-outline-variant/60 bg-surface-container-lowest px-space-lg py-space-xl lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-[0.16em] text-secondary">Asset registry</span>
            <span className="rounded-full bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">SUPABASE INVENTORY</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Transformers</h1>
          <p className="mt-1 max-w-2xl font-body-sm text-body-sm text-on-surface-variant">Browse transformer assets, current operational risk, and maintenance status.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <label className="sr-only" htmlFor="transformer-search">Search transformers</label>
          <input id="transformer-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search ID or location…" className="ui-input h-10 min-w-48 px-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
          <button onClick={() => { onShowToast('Transformer creation is not connected to Supabase.', true); }} className="ui-button-primary flex h-10 shrink-0 items-center justify-center gap-1.5 px-4 font-label-md text-label-md font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[16px]">add</span> Add New Asset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-space-md px-space-lg py-space-lg sm:grid-cols-3">
        {[
          ['Total Transformers', transformers.length, 'account_tree'],
          ['Normal Risk', countRisk('Normal'), 'verified'],
          ['Warning Risk', countRisk('Warning'), 'warning'],
        ].map(([label, value, icon]) => (
          <div key={String(label)} className="ui-card min-w-0 p-space-lg">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-[0.12em] text-on-surface-variant">{label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-secondary"><span className="material-symbols-outlined">{icon}</span></span>
            </div>
            <div className="mt-2 font-telemetry-kpi text-telemetry-kpi font-bold text-on-surface">{isLoading || isRiskLoading ? '—' : value}</div>
          </div>
        ))}
      </div>

      <section className="ui-card mx-space-lg mb-space-lg min-w-0 p-space-lg sm:p-space-xl">
        <div className="mb-space-md flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Transformer registry</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{isLoading ? 'Loading records…' : `${filtered.length} of ${transformers.length} transformers`}{isRiskLoading ? ' · Loading operational risk…' : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Filter by zone" value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)} className="ui-input h-10 px-3 font-label-md text-label-md text-on-surface">
              <option>All Zones</option>{zones.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="ui-input h-10 px-3 font-label-md text-label-md text-on-surface">
              <option>All Statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <select aria-label="Filter by maintenance status" value={maintenanceFilter} onChange={(event) => setMaintenanceFilter(event.target.value)} className="ui-input h-10 px-3 font-label-md text-label-md text-on-surface">
              <option>All Maintenance</option>{maintenanceStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-3 rounded-lg bg-error-container p-3 font-body-sm text-body-sm text-on-error-container">
            Transformer inventory could not be loaded: {error}
          </div>
        )}
        {riskError && (
          <div role="alert" className="mb-3 rounded-lg bg-error-container p-3 font-body-sm text-body-sm text-on-error-container">
            Operational risk data could not be loaded. Risk levels are shown as unavailable: {riskError}
          </div>
        )}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/70">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="sticky top-0 bg-surface-container-low"><tr className="border-b border-outline-variant/70 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th className="px-4 py-3">Transformer</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Zone</th><th className="px-4 py-3 text-right">Capacity</th><th className="px-4 py-3 text-right">Latest load</th><th className="px-4 py-3 text-right">Installed</th><th className="px-4 py-3">Asset status</th><th className="px-4 py-3">Operational risk</th><th className="px-4 py-3">Maintenance</th><th className="px-4 py-3" />
            </tr></thead>
            <tbody>
              {(isLoading || isRiskLoading) && <tr><td colSpan={10} className="px-4 py-12 text-center font-body-sm text-body-sm text-on-surface-variant"><span className="material-symbols-outlined mr-2 inline-block animate-spin align-middle text-[18px]">progress_activity</span>{isLoading ? 'Loading transformer inventory…' : 'Loading operational risk levels…'}</td></tr>}
              {!isLoading && !isRiskLoading && !error && visibleRows.map((row) => {
                const risk = riskById.get(row.transformerId);
                const riskLevel = risk?.riskLevel ?? null;
                return (
                <tr key={row.transformerId} onClick={() => onSelectAsset(row.transformerId)} className="cursor-pointer border-b border-outline-variant/40 text-on-surface transition-colors odd:bg-surface-container-lowest even:bg-surface-container-low/40 hover:bg-secondary-fixed/30">
                  <td className="px-4 py-3.5 font-telemetry-data text-label-md font-semibold text-primary">{row.transformerId}</td>
                  <td className="max-w-56 truncate px-4 py-3.5 font-body-sm text-body-sm">{row.location || 'Data not available'}</td>
                  <td className="px-4 py-3.5 font-body-sm text-body-sm">{transformerZoneName(row.zoneId)}</td>
                  <td className="px-4 py-3.5 text-right font-telemetry-data text-label-md">{row.capacityKva === null ? 'Unavailable' : `${row.capacityKva} kVA`}</td>
                  <td className="px-4 py-3.5 text-right font-telemetry-data text-label-md">{availableLoad(risk)}</td>
                  <td className="px-4 py-3.5 text-right font-telemetry-data text-label-md">{row.installationYear ?? 'Unavailable'}</td>
                  <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 font-label-sm text-label-sm ${statusClass(row.status)}`}>{row.status || 'Unavailable'}</span></td>
                  <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 font-label-sm text-label-sm ${riskClass(riskLevel)}`}>{riskLevel ?? 'Risk unavailable'}</span></td>
                  <td className="px-4 py-3.5 font-body-sm text-body-sm">{row.maintenanceStatus || 'Unavailable'}</td>
                  <td className="px-4 py-3.5"><button onClick={(event) => { event.stopPropagation(); onSelectAsset(row.transformerId); }} className="ui-button-secondary whitespace-nowrap px-3 py-2 font-label-sm text-label-sm font-semibold">View profile →</button></td>
                </tr>
              );})}
              {!isLoading && !isRiskLoading && !error && filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-14 text-center font-body-sm text-body-sm text-on-surface-variant"><span className="material-symbols-outlined mb-2 block text-2xl text-outline">search_off</span>No transformers match these search and filter settings.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-outline-variant/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Page {Math.min(page + 1, pageCount)} of {pageCount} · {PAGE_SIZE} per page</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="ui-button-secondary px-3 py-2 font-label-sm text-label-sm disabled:opacity-40">Previous</button>
            <button disabled={page + 1 >= pageCount} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} className="ui-button-secondary px-3 py-2 font-label-sm text-label-sm disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
};
