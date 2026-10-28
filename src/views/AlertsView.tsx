import React, { useMemo, useState } from 'react';
import { NavTabId } from '../data/gridData';
import { AlertRecord } from '../services/alertData';
import { transformerZoneName } from '../services/transformerData';

type StatusTab = 'all' | 'new' | 'acknowledged' | 'resolved';
type SeverityFilter = 'all' | 'critical' | 'high_risk' | 'warning';

interface AlertsViewProps {
  alerts: AlertRecord[];
  dataSource: 'supabase' | 'demo' | 'unavailable';
  isLoading: boolean;
  error: string | null;
  updatingIds: ReadonlySet<string>;
  onAcknowledgeAlert: (id: string) => Promise<void>;
  onResolveAlert: (id: string) => Promise<void>;
  onAcknowledgeAllWarnings: () => void;
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onRefresh: () => Promise<void>;
}

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: 'all', label: 'All Alerts' },
  { id: 'new', label: 'New' },
  { id: 'acknowledged', label: 'Acknowledged' },
  { id: 'resolved', label: 'Resolved' },
];

function severityLabel(severity: string): string {
  if (severity === 'high_risk' || severity === 'high') return 'High Risk';
  return severity.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function severityTone(severity: string): string {
  if (severity === 'critical') return 'bg-critical-container text-on-critical-container';
  if (severity === 'high_risk' || severity === 'high') return 'bg-high-risk-container text-on-high-risk-container';
  if (severity === 'warning') return 'bg-warning-container text-on-warning-container';
  return 'bg-surface-container text-on-surface-variant';
}

function zoneLabel(zoneId: number | null): string {
  return transformerZoneName(zoneId);
}

function timestampLabel(value: string | null): string {
  if (!value) return 'Timestamp unavailable';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date) + ' IST';
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  dataSource,
  isLoading,
  error,
  updatingIds,
  onAcknowledgeAlert,
  onResolveAlert,
  onAcknowledgeAllWarnings,
  onNavigate,
  onShowToast,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<'1h' | '6h' | '24h' | 'custom'>('6h');
  const [isMuted, setIsMuted] = useState(false);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const zones = useMemo(() => [...new Set(alerts.map((alert) => alert.zoneId))].sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  }), [alerts]);
  const matchSeverity = (severity: string) => severityFilter === 'all'
    || (severityFilter === 'high_risk' ? severity === 'high_risk' || severity === 'high' : severity === severityFilter);
  const filteredAlerts = alerts.filter((alert) => {
    const matchTab = activeTab === 'all' || alert.status === activeTab;
    const matchZone = zoneFilter === 'all' || String(alert.zoneId ?? 'unknown') === zoneFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || [alert.id, alert.transformerId, zoneLabel(alert.zoneId), alert.title, alert.reason]
      .some((value) => value?.toLowerCase().includes(query));
    return matchTab && matchSeverity(alert.severity) && matchZone && matchSearch;
  });
  const sortedAlerts = [...filteredAlerts].sort((first, second) => {
    const firstDate = first.createdAt ? Date.parse(first.createdAt) : 0;
    const secondDate = second.createdAt ? Date.parse(second.createdAt) : 0;
    return sortNewestFirst ? secondDate - firstDate : firstDate - secondDate;
  });
  const countForStatus = (status: string) => alerts.filter((alert) => alert.status === status).length;
  const openSeverityCount = (severity: SeverityFilter) => alerts.filter((alert) => alert.status !== 'resolved' && matchSeverityFor(alert.severity, severity)).length;
  const newCount = countForStatus('new');
  const newWarningCount = alerts.filter((alert) => alert.severity === 'warning' && alert.status === 'new').length;
  const acknowledgedCount = countForStatus('acknowledged');
  const resolvedCount = countForStatus('resolved');
  const warningCount = alerts.filter((alert) => alert.severity === 'warning' && alert.status !== 'resolved').length;
  const highRiskCount = openSeverityCount('high_risk');
  const criticalCount = openSeverityCount('critical');

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-space-lg px-space-lg py-space-xl lg:px-margin-desktop">
        <div className="ui-card flex flex-col gap-space-lg p-space-lg sm:p-space-xl xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs"><span className={`inline-flex h-2 w-2 rounded-full ${dataSource === 'supabase' ? 'bg-secondary' : dataSource === 'demo' ? 'bg-warning' : 'bg-outline'}`} /><span className={`font-label-sm text-label-sm uppercase tracking-wider ${dataSource === 'demo' ? 'text-on-warning-container' : 'text-secondary'}`}>{dataSource === 'supabase' ? 'Supabase alert records' : dataSource === 'demo' ? 'Simulated demo alert feed' : 'Alert feed unavailable'}</span><span className="font-telemetry-data text-label-sm text-outline"> | </span><span className="font-telemetry-data text-label-sm text-on-surface-variant">{dataSource === 'demo' ? 'local only; not saved to Supabase' : dataSource === 'supabase' ? 'status updates saved to alerts' : 'no records loaded'}</span></div>
            <h1 className="mt-0.5 font-headline-xl text-headline-xl tracking-tight text-on-surface">Alerts</h1>
            <p className="mt-0.5 font-body-md text-body-md text-on-surface-variant">Review stored severity, status, transformer, zone, and available alert details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
            <button onClick={() => { setIsMuted((muted) => !muted); onShowToast('Demo only: this local mute preference does not control an audio alert system.'); }} className="ui-button-secondary flex cursor-pointer items-center gap-1.5 px-space-md py-2 font-label-md text-label-md"><span className="material-symbols-outlined text-[18px] text-on-surface-variant">{isMuted ? 'volume_off' : 'volume_up'}</span><span>{isMuted ? 'Demo Audio: Unmute' : 'Demo Audio: Mute'}</span></button>
            <button onClick={() => onShowToast('Audit export is unavailable; no export was created.', true)} className="ui-button-secondary flex cursor-pointer items-center gap-1.5 px-space-md py-2 font-label-md text-label-md"><span className="material-symbols-outlined text-[18px] text-on-surface-variant">ios_share</span><span>Audit Export Unavailable</span></button>
            <button onClick={onAcknowledgeAllWarnings} disabled={newWarningCount === 0 || isLoading} className="ui-button-primary flex cursor-pointer items-center gap-1.5 px-space-md py-2 font-label-md text-label-md disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[18px] text-tertiary-fixed">done_all</span><span>Acknowledge New Warnings</span></button>
          </div>
        </div>

        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"><span>Supabase alert query failed: {error}.{dataSource === 'demo' ? ' The separately labeled local demo feed is shown; its records are not database alerts.' : ' The alert feed is unavailable.'}</span><button onClick={() => void onRefresh()} className="rounded-lg bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-on-surface">Retry</button></div>}

        {!error && dataSource === 'demo' && <div role="status" className="rounded-xl border border-warning/30 bg-warning-container px-4 py-3 font-body-sm text-body-sm text-on-warning-container">No Supabase alert rows were returned for this session. Showing simulated demo alerts generated from the readable transformer inventory. These are local examples and are not stored in Supabase.</div>}

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Critical', count: criticalCount, tone: 'bg-error', text: 'text-error', filter: 'critical' as const },
            { label: 'High Risk', count: highRiskCount, tone: 'bg-secondary', text: 'text-secondary', filter: 'high_risk' as const },
            { label: 'Warning', count: warningCount, tone: 'bg-secondary-container', text: 'text-on-secondary-container', filter: 'warning' as const },
            { label: 'New / Unacknowledged', count: newCount, tone: 'bg-tertiary-fixed-dim', text: 'text-on-tertiary-container', filter: null },
          ].map((item) => <button key={item.label} type="button" onClick={() => item.filter ? setSeverityFilter(severityFilter === item.filter ? 'all' : item.filter) : setActiveTab(activeTab === 'new' ? 'all' : 'new')} className="ui-card relative cursor-pointer overflow-hidden p-space-lg text-left transition-shadow hover:shadow-md"><span className={`absolute bottom-0 left-0 top-0 w-1.5 ${item.tone}`} /><span className="pl-2"><span className={`font-label-sm text-label-sm font-bold uppercase tracking-wider ${item.text}`}>{item.label}</span><span className="my-2 flex items-baseline gap-space-xs"><span className="font-telemetry-kpi text-telemetry-kpi text-on-surface">{isLoading ? '—' : error ? '—' : item.count}</span><span className="font-label-md text-label-md text-on-surface-variant">{item.label === 'New / Unacknowledged' ? 'records' : 'open records'}</span></span><span className="font-body-sm text-body-sm text-on-surface-variant">Counted from records visible to the signed-in session</span></span></button>)}
        </div>

        <div className="grid grid-cols-1 gap-space-lg xl:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-space-md xl:col-span-9">
            <div className="ui-card flex flex-col gap-space-md p-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container pb-space-xs">
                <div className="flex flex-wrap items-center gap-1">{STATUS_TABS.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-space-md py-1.5 font-label-lg text-label-lg transition-colors ${activeTab === tab.id ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}><span>{tab.label}</span><span className="font-telemetry-data text-label-sm opacity-80">({tab.id === 'all' ? alerts.length : countForStatus(tab.id)})</span></button>)}</div>
                <button onClick={() => setSortNewestFirst((value) => !value)} className="ui-button-secondary inline-flex items-center gap-1.5 px-3 py-2 font-label-sm text-label-sm"><span className="material-symbols-outlined text-[16px]">{sortNewestFirst ? 'south' : 'north'}</span>{sortNewestFirst ? 'Newest first' : 'Oldest first'}</button>
              </div>
              <div className="grid grid-cols-1 items-center gap-space-sm pt-space-xs md:grid-cols-12">
                <div className="relative flex items-center md:col-span-5"><span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">search</span><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="ui-input h-10 w-full pl-9 pr-3 font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder="Search alert, transformer, zone, or reason…" aria-label="Search alerts" /></div>
                <div className="md:col-span-2"><select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)} className="ui-input h-10 w-full cursor-pointer px-space-sm font-body-sm text-body-sm text-on-surface"><option value="all">All Severities</option><option value="critical">Critical</option><option value="high_risk">High Risk</option><option value="warning">Warning</option></select></div>
                <div className="md:col-span-2"><select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)} className="ui-input h-10 w-full cursor-pointer px-space-sm font-body-sm text-body-sm text-on-surface"><option value="all">All Zones</option>{zones.map((zoneId) => <option key={zoneId ?? 'unknown'} value={String(zoneId ?? 'unknown')}>{zoneId === null ? 'Zone unavailable' : transformerZoneName(zoneId)}</option>)}</select></div>
                <div className="flex items-center justify-end rounded-lg bg-surface-container-low p-0.5 md:col-span-3" aria-label="Prototype time scope; does not filter records">{(['1h', '6h', '24h', 'custom'] as const).map((horizon) => <button key={horizon} onClick={() => { setTimeHorizon(horizon); onShowToast(`Display-only time scope: ${horizon.toUpperCase()}; records are not time-filtered.`); }} className={`flex-1 cursor-pointer rounded py-1 text-center font-label-sm text-label-sm uppercase transition-colors ${timeHorizon === horizon ? 'bg-surface-container-lowest font-bold text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>{horizon === 'custom' ? 'Range' : horizon}</button>)}</div>
              </div>
              <p className="text-right font-body-sm text-label-sm text-outline">Time scope is a display control only; it does not filter Supabase records.</p>
            </div>

            {isLoading && alerts.length === 0 && <div className="ui-card flex items-center justify-center gap-2 p-space-xl font-body-md text-body-md text-on-surface-variant"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading alerts from Supabase…</div>}
            {sortedAlerts.map((alert) => {
              const isUpdating = updatingIds.has(alert.id);
              const canOpenTransformer = Boolean(alert.transformerId);
              return <article key={alert.id} className={`ui-card relative overflow-hidden p-space-lg transition-shadow hover:shadow-md ${alert.status === 'resolved' ? 'opacity-75' : ''}`}><span className={`absolute bottom-0 left-0 top-0 w-1.5 ${alert.severity === 'critical' ? 'bg-error' : alert.severity === 'high_risk' || alert.severity === 'high' ? 'bg-secondary' : 'bg-secondary-container'}`} /><div className="flex flex-col gap-space-sm pl-2">
                <div className="flex flex-wrap items-center justify-between gap-space-sm"><div className="flex flex-wrap items-center gap-space-xs"><span className={`inline-flex rounded-full px-2.5 py-1 font-label-sm text-label-sm font-bold uppercase tracking-wider ${severityTone(alert.severity)}`}>{severityLabel(alert.severity)}</span>{alert.source === 'demo' && <span className="inline-flex rounded-full border border-warning/40 bg-warning-container px-2 py-1 font-label-sm text-label-sm font-bold uppercase text-on-warning-container">Demo / local only</span>}<span className="text-outline-variant">·</span><span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">{alert.status.replace(/[_-]+/g, ' ')}</span><span className="text-outline-variant">·</span><span className="font-telemetry-data text-label-sm font-semibold text-on-surface">{timestampLabel(alert.createdAt)}</span></div><span className="font-telemetry-data text-label-sm text-on-surface-variant">Alert {alert.id}</span></div>
                <div><div className="mb-1 flex flex-wrap items-center gap-2"><span className="font-label-lg text-label-lg font-bold text-on-surface">{alert.transformerId ?? 'Transformer unavailable'}</span><span className="text-outline-variant">·</span><span className="font-label-md text-label-md text-on-surface-variant">{zoneLabel(alert.zoneId)}</span></div><h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">{alert.title ?? 'Alert title unavailable'}</h2></div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-container-low p-space-sm font-body-sm text-body-sm text-on-surface"><p className="min-w-0 flex-1"><strong>Recorded reason:</strong> {alert.reason ?? 'No reason recorded.'}</p>{alert.riskScore !== null && <span className="shrink-0 rounded bg-surface-container px-2 py-1 font-telemetry-data text-label-sm">{alert.source === 'demo' ? 'Simulated risk score' : 'Stored risk score'}: {alert.riskScore}</span>}</div>
                {(alert.acknowledgedAt || alert.resolvedAt) && <div className="font-body-sm text-label-sm text-on-surface-variant">{alert.acknowledgedAt && <>Acknowledged: {timestampLabel(alert.acknowledgedAt)} </>}{alert.resolvedAt && <>· Resolved: {timestampLabel(alert.resolvedAt)}</>}</div>}
                <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-surface-container pt-space-xs"><span className="font-body-sm text-body-sm text-on-surface-variant">{alert.source === 'demo' ? 'Status changes affect this local demo feed only; no database write occurs.' : alert.statusPersistence === 'local' ? 'Status is saved on this browser only; the Supabase update was not confirmed.' : 'Status changes save to Supabase; audit logging is not enabled.'}</span><div className="flex flex-wrap items-center gap-space-xs">{alert.status === 'new' && <button disabled={isUpdating} onClick={() => void onAcknowledgeAlert(alert.id)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-primary-container px-space-md py-1.5 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary disabled:cursor-wait disabled:opacity-60"><span className="material-symbols-outlined text-[16px]">check_circle</span>{isUpdating ? 'Saving…' : 'Acknowledge'}</button>}{alert.status === 'acknowledged' && <button disabled={isUpdating} onClick={() => void onResolveAlert(alert.id)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-high px-space-md py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container disabled:cursor-wait disabled:opacity-60"><span className="material-symbols-outlined text-[16px]">task_alt</span>{isUpdating ? 'Saving…' : 'Resolve'}</button>}{canOpenTransformer && <button onClick={() => onNavigate('transformer-detail', alert.transformerId ?? undefined)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-high px-space-sm py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"><span className="material-symbols-outlined text-[16px]">open_in_new</span>View transformer</button>}</div></div>
              </div></article>;
            })}
            {!isLoading && !error && sortedAlerts.length === 0 && <div className="ui-card flex flex-col items-center px-5 py-14 text-center"><span className="material-symbols-outlined mb-2 text-3xl text-outline">notifications_off</span><h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">{alerts.length === 0 ? 'No alerts are available' : 'No alerts match these filters'}</h3><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{alerts.length === 0 ? 'No alert rows were returned for the signed-in session.' : 'Try another status, severity, zone, or search term.'}</p></div>}
          </div>

          <aside className="flex min-w-0 flex-col gap-space-md xl:col-span-3">
            <section className="ui-card flex flex-col gap-space-sm p-space-lg"><div className="flex items-center justify-between"><span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Alert data</span><span className="material-symbols-outlined text-[16px] text-secondary">database</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">{dataSource === 'demo' ? 'The demo feed is generated locally from transformer inventory and is never saved to Supabase. Database query errors remain visible above.' : 'Supabase alert rows are used when returned for the authenticated session. Status changes for those rows are persisted to the alerts table.'}</p><button onClick={() => void onRefresh()} disabled={isLoading} className="ui-button-secondary flex items-center justify-center gap-1.5 px-3 py-2 font-label-md text-label-md disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">refresh</span>Refresh alerts</button></section>
            <section className="ui-card flex flex-col gap-space-sm p-space-lg"><div className="flex items-center justify-between"><span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Audit trail</span><span className="material-symbols-outlined text-[16px] text-outline">history</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">Audit log write permissions and deployed policies could not be verified. Alert status changes do not claim to create audit records.</p><button onClick={() => onShowToast('Operational switching and dispatch are not available from this alert page.', true)} className="flex cursor-pointer items-center justify-between rounded bg-surface-container-low p-2 font-label-md text-label-md text-on-surface hover:bg-surface-container"><span>Operational controls unavailable</span><span className="material-symbols-outlined text-[16px]">block</span></button></section>
            <section className="ui-card flex flex-col gap-space-sm p-space-lg"><span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Advisory planning</span><p className="font-body-sm text-body-sm text-on-surface-variant">Simulation previews are advisory only and do not control electrical equipment.</p><button onClick={() => onNavigate('what-if-simulator')} className="flex cursor-pointer items-center justify-between rounded bg-surface-container-low p-2 font-label-md text-label-md text-on-surface hover:bg-surface-container"><span>Open What-If Simulator</span><span className="material-symbols-outlined text-[16px]">arrow_forward</span></button></section>
          </aside>
        </div>
      </div>
    </div>
  );
};

function matchSeverityFor(actual: string, expected: SeverityFilter): boolean {
  if (expected === 'all') return true;
  if (expected === 'high_risk') return actual === 'high_risk' || actual === 'high';
  return actual === expected;
}
