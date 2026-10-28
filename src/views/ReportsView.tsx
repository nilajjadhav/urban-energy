import React, { useState } from 'react';
import { ReportRecord } from '../data/gridData';

interface ReportsViewProps {
  reports: ReportRecord[];
  onAddReport: (rep: ReportRecord) => void;
  onShowToast: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  onAddReport,
  onShowToast,
}) => {
  const [selectedType, setSelectedType] = useState<string>('regional');
  const [evalScope, setEvalScope] = useState('Last 7 Days (Oct 10 - Oct 17, 2024)');
  const [zoneScope, setZoneScope] = useState('Mira Road East (High Density Urban Corridor)');
  const [assetScope, setAssetScope] = useState('MB-042 (Shanti Park 1000 kVA - Feeder 4A)');
  const [isCompiling, setIsCompiling] = useState(false);

  const reportTypes = [
    {
      id: 'transformer',
      title: 'Transformer Report',
      desc: 'Detailed thermal curves, surge log, load profiles',
      tag: 'Unit Specific',
      icon: 'speed',
      isError: false,
    },
    {
      id: 'zone',
      title: 'Zone Report',
      desc: 'Aggregated sub-grid metrics, 33kV/11kV balance',
      tag: 'Feeder Level',
      icon: 'lan',
      isError: false,
    },
    {
      id: 'regional',
      title: 'Regional Summary',
      desc: 'Mira-Bhayandar overall demand & fleet overview',
      tag: 'Corridor Wide',
      icon: 'public',
      isError: false,
    },
    {
      id: 'risk',
      title: 'Risk Report',
      desc: 'High risk & critical node degradation matrix',
      tag: 'Vulnerability',
      icon: 'warning',
      isError: true,
    },
    {
      id: 'event',
      title: 'Event Preparedness',
      desc: 'Festival & holiday load mitigation plans',
      tag: 'Seasonal Action',
      icon: 'festival',
      isError: false,
    },
    {
      id: 'simulation',
      title: 'What-If Simulation',
      desc: 'Contingency load-flow & trip simulation records',
      tag: 'Stress Modeling',
      icon: 'schema',
      isError: false,
    },
  ];

  const handleGenerate = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      const activeType = reportTypes.find((t) => t.id === selectedType) || reportTypes[2];
      const newRep: ReportRecord = {
        id: `#REP-${Math.floor(8822 + Math.random() * 150)}`,
        name: `${zoneScope.split(' (')[0]} — ${activeType.title}`,
        hash: 'LOCAL PREVIEW - no artifact hash',
        type: activeType.title,
        icon: activeType.icon,
        generatedBy: 'R. Deshmukh',
        generatedTime: 'Just now (local preview)',
        period: evalScope,
        sizeFormat: 'No file generated',
        status: 'Preview only',
      };
      onAddReport(newRep);
    }, 650);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-gutter-desktop py-space-xl flex flex-col gap-space-lg max-w-[1720px] mx-auto w-full">
        <div className="ui-card flex items-start gap-3 border-l-4 border-warning px-4 py-3 text-sm" role="note">
          <span className="material-symbols-outlined text-warning">info</span>
          <div><strong>Prototype report workspace.</strong> Archive entries are supplied presentation records. Generate Report adds a local in-app record; download, raw export, and dispatch controls currently show prototype confirmations and do not create or transmit files.</div>
        </div>
        {/* Top Executive Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs max-w-3xl">
            <div className="flex items-center gap-space-sm text-secondary font-label-sm uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>Regulatory Compliance • MERC Grade-IV • Mira-Bhayandar Corridor</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">
              Reports &amp; Regulatory Filings
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Generate operational intelligence, compliance filings, and decision-support dossiers for the Mira-Bhayandar grid corridor.
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-space-md">
            <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-on-tertiary-container" />
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface uppercase">Prototype Archive</span>
                <span className="font-telemetry-data text-label-sm text-on-surface-variant">
                  Local report interaction preview
                </span>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Demo only: archive export is unavailable; no file was created.')}
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">inventory_2</span>
              <span className="font-label-lg text-label-lg">Demo: Export Archive</span>
            </button>
          </div>
        </section>

        {/* Visual Telemetry & KPI Overview Ribbon */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">MERC Filing Health</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-primary">100.0</span>
              <span className="font-label-md text-label-md text-outline">%</span>
            </div>
            <div className="flex items-center justify-between text-label-sm font-telemetry-data pt-space-xs">
              <span className="text-on-tertiary-container font-semibold">All 14 statutory cycles met</span>
              <span className="text-outline">FY24-Q3</span>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Active SCADA Feeds</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">hub</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-primary">200 / 200</span>
              <span className="font-label-md text-label-md text-outline">Units</span>
            </div>
            <div className="flex items-center justify-between text-label-sm font-telemetry-data pt-space-xs">
              <span className="text-on-surface-variant">5-min interval sync</span>
              <span className="text-on-tertiary-container font-semibold">42ms latency</span>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Peak Monitored Demand
              </span>
              <span className="material-symbols-outlined text-secondary text-[18px]">electric_meter</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-primary">318.4</span>
              <span className="font-label-md text-label-md text-outline">MW</span>
            </div>
            <div className="flex items-center justify-between text-label-sm font-telemetry-data pt-space-xs">
              <span className="text-on-surface-variant">+2.8% vs last week</span>
              <span className="text-outline">Max: 340 MW</span>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Dossier Storage</span>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-telemetry-kpi text-telemetry-kpi text-primary">1.82</span>
                <span className="font-label-md text-label-md text-outline">TB</span>
              </div>
              <span className="font-label-sm text-label-sm text-outline font-telemetry-data">
                73% of 2.5 TB Allocated
              </span>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-secondary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="73, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-telemetry-data text-label-sm font-bold text-primary">73%</span>
            </div>
          </div>
        </section>

        {/* Section 1: REPORT GENERATOR ENGINE */}
        <section className="ui-card rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm pb-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center text-surface">
                <span className="material-symbols-outlined text-[18px]">build</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-primary tracking-tight">Report Generator</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Configure telemetry scope, predictive inference models, and multi-format output criteria.
                </p>
              </div>
            </div>
          </div>

          {/* Step 1 */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Step 1: Select Operational Report Type
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-sm">
              {reportTypes.map((rt) => {
                const isSelected = selectedType === rt.id;
                return (
                  <div
                    key={rt.id}
                    onClick={() => setSelectedType(rt.id)}
                    className={`cursor-pointer p-space-md rounded-xl transition-all flex flex-col justify-between gap-space-md shadow-sm ${
                      isSelected ? 'bg-surface-container ring-2 ring-secondary' : 'bg-surface hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`material-symbols-outlined text-[22px] ${
                          rt.isError ? 'text-error' : 'text-secondary'
                        }`}
                      >
                        {rt.icon}
                      </span>
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary leading-tight">{rt.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{rt.desc}</p>
                    </div>
                    <span
                      className={`font-label-sm text-label-sm uppercase font-semibold ${
                        rt.isError ? 'text-error' : 'text-secondary'
                      }`}
                    >
                      {rt.tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Step 2: Define Analytical Boundaries
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Temporal Evaluation Scope
                </label>
                <select
                  value={evalScope}
                  onChange={(e) => setEvalScope(e.target.value)}
                  className="w-full h-10 px-space-md rounded-lg bg-surface text-on-surface font-body-md shadow-sm focus:outline-none cursor-pointer"
                >
                  <option>Last 7 Days (Oct 10 - Oct 17, 2024)</option>
                  <option>Today (Live SCADA stream)</option>
                  <option>Last 24 Hours</option>
                  <option>Last 30 Days (MERC Monthly Compliance)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Zone / Distribution Sector
                </label>
                <select
                  value={zoneScope}
                  onChange={(e) => setZoneScope(e.target.value)}
                  className="w-full h-10 px-space-md rounded-lg bg-surface text-on-surface font-body-md shadow-sm focus:outline-none cursor-pointer"
                >
                  <option>All Zones (Mira Road, Bhayandar, Kashimira)</option>
                  <option>Mira Road East (High Density Urban Corridor)</option>
                  <option>Mira Road West (Coastal &amp; Residential)</option>
                  <option>Bhayandar East (Heavy Industrial Sector)</option>
                  <option>Kashimira Sub-Transmission Node</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Transformer Fleet / Asset (preview only; not applied)
                </label>
                <select
                  value={assetScope}
                  onChange={(e) => setAssetScope(e.target.value)}
                  className="w-full h-10 px-space-md rounded-lg bg-surface text-on-surface font-body-md shadow-sm focus:outline-none cursor-pointer"
                >
                  <option>All Monitored Units (200 Assets)</option>
                  <option>MB-042 (Shanti Park 1000 kVA - Feeder 4A)</option>
                  <option>MB-118 (Kashimira MIDC 1500 kVA)</option>
                  <option>MB-009 (APMC Market 750 kVA)</option>
                  <option>MB-073 (Sheetal Nagar 1000 kVA)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pt-space-xs">
            <div className="flex items-center gap-space-sm text-outline font-telemetry-data text-label-sm">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>Local preview creation: approximately 0.65 seconds</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                onClick={() => onShowToast('Demo only: raw data export is unavailable; no file was created.')}
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-secondary text-[18px]">table_chart</span>
                <span className="font-label-lg text-label-lg">Demo: Raw Data Export</span>
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary-container text-surface hover:bg-primary shadow-sm transition-all cursor-pointer"
                type="button"
              >
                <span
                  className={`material-symbols-outlined text-tertiary-fixed text-[18px] ${
                    isCompiling ? 'animate-spin' : ''
                  }`}
                >
                  {isCompiling ? 'refresh' : 'auto_read_play'}
                </span>
                <span className="font-label-lg text-label-lg font-bold">
                  {isCompiling ? 'Preparing Local Preview...' : 'Create Local Report Preview'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: RECENT REPORTS TABLE */}
        <div className="ui-card w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="p-space-lg flex items-center justify-between border-b border-surface-container">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary tracking-tight">
                Recent Reports &amp; Filing Archive
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Validated SCADA dossiers, state load dispatch exports, and contingency stress logs ({reports.length} items).
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-space-md px-space-lg">Report Name &amp; Dossier ID</th>
                  <th className="py-space-md px-space-md">Type</th>
                  <th className="py-space-md px-space-md">Generated By</th>
                  <th className="py-space-md px-space-md">Evaluation Period</th>
                  <th className="py-space-md px-space-md">Size &amp; Format</th>
                  <th className="py-space-md px-space-md">Status</th>
                  <th className="py-space-md px-space-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-surface-container-low/70 transition-colors">
                    <td className="py-space-md px-space-lg">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-secondary text-[20px]">{rep.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-headline-sm text-primary">{rep.name}</span>
                          <span className="font-telemetry-data text-label-sm text-outline">
                            {rep.id} • {rep.hash}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-space-md px-space-md font-label-sm text-label-sm uppercase text-secondary font-bold">
                      {rep.type}
                    </td>
                    <td className="py-space-md px-space-md font-telemetry-data text-label-md text-on-surface">
                      <div className="flex flex-col">
                        <span>{rep.generatedBy}</span>
                        <span className="text-outline text-label-sm">{rep.generatedTime}</span>
                      </div>
                    </td>
                    <td className="py-space-md px-space-md font-telemetry-data text-label-md text-on-surface-variant">
                      {rep.period}
                    </td>
                    <td className="py-space-md px-space-md font-telemetry-data text-label-md text-on-surface">
                      {rep.sizeFormat}
                    </td>
                    <td className="py-space-md px-space-md font-label-sm text-label-sm font-bold text-on-tertiary-container uppercase">
                      {rep.status}
                    </td>
                    <td className="py-space-md px-space-lg text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onShowToast('Demo only: no PDF is available to download.')}
                          className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Demo only: PDF download is unavailable"
                        >
                          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        </button>
                        <button
                          onClick={() => onShowToast('Demo only: no CSV is available to download.')}
                          className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Demo only: CSV download is unavailable"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </button>
                        <button
                          onClick={() => onShowToast('Demo only: report dispatch is unavailable; nothing was transmitted.')}
                          className="p-1.5 rounded hover:bg-surface-container text-secondary transition-colors cursor-pointer"
                          title="Demo only: report dispatch is unavailable"
                        >
                          <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
