import React, { useState } from 'react';
import { NavTabId, TransformerNode } from '../data/gridData';

interface ZoneIntelligenceViewProps {
  transformers: TransformerNode[];
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (msg: string) => void;
}

export const ZoneIntelligenceView: React.FC<ZoneIntelligenceViewProps> = ({
  transformers,
  onNavigate,
  onShowToast,
}) => {
  const [selectedZone, setSelectedZone] = useState<'mre' | 'mrw' | 'bhe' | 'kashimira' | 'uttan'>('mre');
  const [mapLayer, setMapLayer] = useState<'all' | 'feeders' | 'heatmap' | 'ids'>('all');
  const [tieSwitchArmed, setTieSwitchArmed] = useState(false);

  const zoneMeta: Record<
    typeof selectedZone,
    {
      name: string;
      riskScore: number;
      avgLoad: number;
      peakMw: number;
      totalUnits: number;
      critCount: number;
      highCount: number;
    }
  > = {
    mre: {
      name: 'Mira Road East',
      riskScore: 78,
      avgLoad: 78.4,
      peakMw: 92.4,
      totalUnits: 48,
      critCount: 2,
      highCount: 7,
    },
    mrw: {
      name: 'Mira Road West',
      riskScore: 42,
      avgLoad: 64.2,
      peakMw: 44.1,
      totalUnits: 28,
      critCount: 0,
      highCount: 2,
    },
    bhe: {
      name: 'Bhayandar East',
      riskScore: 69,
      avgLoad: 74.1,
      peakMw: 64.8,
      totalUnits: 38,
      critCount: 1,
      highCount: 4,
    },
    kashimira: {
      name: 'Kashimira Industrial',
      riskScore: 74,
      avgLoad: 76.8,
      peakMw: 58.2,
      totalUnits: 36,
      critCount: 1,
      highCount: 5,
    },
    uttan: {
      name: 'Uttan Coastal',
      riskScore: 28,
      avgLoad: 52.0,
      peakMw: 25.1,
      totalUnits: 14,
      critCount: 0,
      highCount: 0,
    },
  };

  const currentZone = zoneMeta[selectedZone];

  return (
    <div className="flex flex-col w-full">
      <div className="p-gutter-desktop flex flex-col gap-space-lg max-w-[1720px] mx-auto w-full">
        <div className="ui-card flex items-start gap-3 border-l-4 border-warning px-4 py-3 text-sm" role="note">
          <span className="material-symbols-outlined text-warning">info</span>
          <div><strong>Prototype zone intelligence.</strong> Zone totals, risk and load metrics, topology, and environmental figures are illustrative fixtures. Transformer rows are supplied by the application data pipeline; verify their source before operational use.</div>
        </div>
        {/* Zone Context Header & Operations Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-secondary">hub</span>
              <span>Municipal Operational Sub-Grid</span>
              <span>•</span>
              <span className="text-tertiary font-bold">Corridor Division II</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-space-md gap-y-space-xs">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Zone Intelligence: {currentZone.name}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Zone metrics and topology preview for the selected service area.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value as typeof selectedZone)}
              className="bg-surface-container-low text-on-surface font-label-lg text-label-lg px-space-md py-2 rounded-lg cursor-pointer focus:outline-none"
            >
              <option value="mre">Mira Road East (Active Alert)</option>
              <option value="mrw">Mira Road West</option>
              <option value="bhe">Bhayandar East</option>
              <option value="kashimira">Kashimira Industrial</option>
              <option value="uttan">Uttan Coastal</option>
            </select>

            <button
              onClick={() => onShowToast('Demo only: zone briefing export is unavailable; no PDF was created.')}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">picture_as_pdf</span>
              <span>Demo: Export Zone Briefing</span>
            </button>

            <button
              onClick={() => onNavigate('what-if-simulator')}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container text-surface hover:bg-primary font-label-lg text-label-lg transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">query_stats</span>
              <span>Simulate What-If</span>
            </button>
          </div>
        </div>

        {/* Top KPI Telemetry Stream */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Zone Risk Score
              </span>
              <span className="font-label-sm text-label-sm text-error font-bold">
                {currentZone.riskScore >= 70 ? 'HIGH RISK' : 'NOMINAL'}
              </span>
            </div>
            <div className="my-space-xs flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-error font-bold">
                {currentZone.riskScore}
              </span>
              <span className="font-telemetry-data text-body-sm text-on-surface-variant">/ 100</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span className="truncate">MBMC Sub-Grid</span>
              <span className="text-error font-medium font-telemetry-data">+12 pts</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Avg Zone Load
              </span>
              <span className="material-symbols-outlined text-[18px] text-secondary">speed</span>
            </div>
            <div className="my-space-xs flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">
                {currentZone.avgLoad}
              </span>
              <span className="font-telemetry-data text-label-lg text-on-surface-variant">%</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>{currentZone.totalUnits} Transformers active</span>
              <span className="text-error font-medium font-telemetry-data">+5.2% vs reg</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Peak Zone Demand
              </span>
              <span className="material-symbols-outlined text-[18px] text-outline">trending_up</span>
            </div>
            <div className="my-space-xs flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">
                {currentZone.peakMw}
              </span>
              <span className="font-telemetry-data text-label-lg text-on-surface-variant">MW</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Cap: 98.0 MW</span>
              <span className="font-telemetry-data text-label-sm">18:30-21:00</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Total Transformers
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-tertiary-container">check_circle</span>
            </div>
            <div className="my-space-xs flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">
                {currentZone.totalUnits}
              </span>
              <span className="font-telemetry-data text-label-lg text-on-surface-variant">Units</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>100% Online telemetry</span>
              <span className="font-label-sm text-label-sm text-on-surface">3 Hubs</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Stressed Units
              </span>
              <span className="font-telemetry-data text-label-sm text-error font-bold">
                {currentZone.critCount + currentZone.highCount} Total
              </span>
            </div>
            <div className="my-space-xs flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-error font-bold">
                {currentZone.critCount}
              </span>
              <span className="font-telemetry-data text-label-lg text-on-surface-variant">Crit</span>
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface ml-2">
                {currentZone.highCount}
              </span>
              <span className="font-telemetry-data text-label-lg text-on-surface-variant">High</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Fdr 4A Alert</span>
              <span className="text-error font-medium font-telemetry-data">Action Req</span>
            </div>
          </div>
        </div>

        {/* Main Operational Workspace: 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Primary 8-Column Zone Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* GIS Topology Vector Map Module */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-space-md bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      {currentZone.name} Sub-Grid GIS Topology
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Spatial topology showing 33kV intake, 11kV distribution branches, and transformer pods
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container-lowest p-1 rounded-lg shadow-sm">
                  {(['all', 'feeders', 'heatmap', 'ids'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setMapLayer(l)}
                      className={`px-2.5 py-1 rounded font-label-sm text-label-sm capitalize transition-colors cursor-pointer ${
                        mapLayer === l
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {l === 'all' ? 'All Layers' : l === 'ids' ? 'Asset IDs' : l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full h-[430px] bg-primary-container overflow-hidden select-none">
                <svg className="w-full h-full relative z-10" fill="none" viewBox="0 0 880 460">
                  <path
                    d="M 60 40 Q 420 20 820 60 L 840 400 Q 450 440 60 380 Z"
                    fill="none"
                    opacity="0.6"
                    stroke="#324a52"
                    strokeDasharray="6 4"
                    strokeWidth="1.5"
                  />
                  <text className="font-label-sm text-[11px] font-bold tracking-widest uppercase" fill="#748d96" x="90" y="70">
                    Poonam Sagar Corridor
                  </text>
                  <text className="font-label-sm text-[11px] font-bold tracking-widest uppercase" fill="#748d96" x="640" y="90">
                    Beverly Park Hub
                  </text>
                  <text className="font-label-sm text-[11px] font-bold tracking-widest uppercase" fill="#748d96" x="110" y="390">
                    Shanti Park Sector
                  </text>

                  <path
                    d="M 240 230 C 290 190, 340 160, 430 180 C 490 190, 520 220, 580 210"
                    fill="none"
                    stroke="#ba1a1a"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                  <path
                    d="M 240 230 C 260 290, 310 330, 420 320 C 500 310, 570 340, 680 320"
                    fill="none"
                    stroke="#ea580c"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 680 140 C 620 180, 550 160, 480 130 C 390 100, 300 120, 240 140"
                    fill="none"
                    stroke="#4fdbc8"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />

                  <path
                    d="M 430 180 L 480 130"
                    fill="none"
                    stroke={tieSwitchArmed ? '#71f8e4' : '#89ceff'}
                    strokeDasharray={tieSwitchArmed ? 'none' : '4 4'}
                    strokeWidth="2"
                  />

                  <g transform="translate(210, 205)">
                    <rect fill="#041f26" height="50" rx="4" stroke="#4fdbc8" strokeWidth="2" width="60" x="0" y="0" />
                    <text className="font-label-md text-[11px] font-bold" fill="#eaf1ff" x="8" y="22">
                      STN-04
                    </text>
                    <text className="font-telemetry-data text-[9px]" fill="#748d96" x="8" y="38">
                      33/11kV
                    </text>
                  </g>

                  <g
                    className="cursor-pointer"
                    transform="translate(420, 170)"
                    onClick={() => onNavigate('transformer-detail', 'MB-042')}
                  >
                    <circle cx="10" cy="10" fill="#ba1a1a" r="8" stroke="#ffffff" strokeWidth="2" />
                    <text className="font-telemetry-data text-[11px] font-bold" fill="#ffffff" x="24" y="14">
                      MB-042
                    </text>
                  </g>

                  <g
                    className="cursor-pointer"
                    transform="translate(570, 200)"
                    onClick={() => onNavigate('transformer-detail', 'MB-073')}
                  >
                    <circle cx="10" cy="10" fill="#ba1a1a" r="7" stroke="#ffffff" strokeWidth="1.5" />
                    <text className="font-telemetry-data text-[10px]" fill="#eaf1ff" x="22" y="14">
                      MB-073
                    </text>
                  </g>

                  <g
                    className="cursor-pointer"
                    transform="translate(470, 120)"
                    onClick={() => onNavigate('transformer-detail', 'MB-191')}
                  >
                    <circle cx="10" cy="10" fill="#4fdbc8" r="7" stroke="#ffffff" strokeWidth="1.5" />
                    <text className="font-telemetry-data text-[10px] font-bold" fill="#4fdbc8" x="20" y="14">
                      MB-045
                    </text>
                  </g>
                </svg>

                {/* Floating Pinned Asset Callout: MB-042 Focus */}
                <div className="absolute top-12 left-1/2 -translate-x-12 bg-primary/95 text-surface p-space-md rounded-xl backdrop-blur-md shadow-xl max-w-xs z-20">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
                      <span className="font-telemetry-data text-label-md font-bold text-surface tracking-wide">
                        MB-042 • CRITICAL
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-error-container">Feeder 4A</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs py-2 font-telemetry-data text-body-sm">
                    <div>
                      <span className="text-on-primary-container text-label-sm block">CURRENT LOAD</span>
                      <span className="font-bold text-error text-[15px]">91.4% (914 kVA)</span>
                    </div>
                    <div>
                      <span className="text-on-primary-container text-label-sm block">OIL TEMP</span>
                      <span className="font-bold text-error text-[15px]">84.2°C</span>
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-label-sm text-on-primary-container">
                    <span>Location: Shanti Park Junction</span>
                    <span className="text-tertiary-fixed font-bold">
                      {tieSwitchArmed ? 'TS-84 DEMO STATE' : 'Tie TS-84 Preview'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Stressed Distribution Transformers in Zone Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-space-md bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px]">warning</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Top Stressed Distribution Transformers in Zone
                  </h3>
                </div>
                <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">
                  Sorted by Thermal &amp; KVA Load Index
                </span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase">
                      <th className="py-2.5 px-space-md">Asset ID</th>
                      <th className="py-2.5 px-space-md">Substation &amp; Feeder</th>
                      <th className="py-2.5 px-space-md text-right">Current Load</th>
                      <th className="py-2.5 px-space-md text-right">Temp (°C)</th>
                      <th className="py-2.5 px-space-md text-right">4H Forecast</th>
                      <th className="py-2.5 px-space-md text-center">Risk Score</th>
                      <th className="py-2.5 px-space-md text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface">
                    {transformers.slice(0, 5).map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => onNavigate('transformer-detail', t.id)}
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-space-md font-telemetry-data font-bold text-primary">{t.id}</td>
                        <td className="py-2.5 px-space-md">
                          <span className="font-medium text-on-surface block">{t.substation}</span>
                          <span className="font-telemetry-data text-body-sm text-on-surface-variant">{t.feeder}</span>
                        </td>
                        <td className="py-2.5 px-space-md text-right font-telemetry-data font-bold text-error">
                          {t.currentLoadKva} kVA ({t.loadRatio}%)
                        </td>
                        <td className="py-2.5 px-space-md text-right font-telemetry-data font-bold text-error">
                          {t.coreTempC}°C
                        </td>
                        <td className="py-2.5 px-space-md text-right font-telemetry-data text-error font-medium">
                          {t.predictedLoadKva} kVA ({t.predictedLoadRatio}%)
                        </td>
                        <td className="py-2.5 px-space-md text-center font-telemetry-data font-bold text-error">
                          {t.riskScore}
                        </td>
                        <td className="py-2.5 px-space-md text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('what-if-simulator', t.id);
                            }}
                            className="px-2 py-1 bg-primary text-on-primary hover:bg-surface-tint rounded font-label-sm text-label-sm transition-colors cursor-pointer"
                          >
                            Offload
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Operational Context, AI Engine (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Meteorological & Event Correlation Module */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-secondary">thermostat</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Zone Ambient &amp; Stress Vectors
                  </h3>
                </div>
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">IMD Colaba Sync</span>
              </div>
              <div className="grid grid-cols-3 gap-space-xs">
                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Ambient</span>
                  <span className="font-telemetry-kpi text-[20px] font-bold text-on-surface leading-tight mt-1">
                    35.8°C
                  </span>
                  <span className="font-body-sm text-[11px] text-error">+3.2°C anomaly</span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Humidity</span>
                  <span className="font-telemetry-kpi text-[20px] font-bold text-on-surface leading-tight mt-1">
                    79%
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">Coastal shelf</span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Heat Index</span>
                  <span className="font-telemetry-kpi text-[20px] font-bold text-error leading-tight mt-1">
                    41.0°C
                  </span>
                  <span className="font-body-sm text-[11px] text-error">Cooling -12%</span>
                </div>
              </div>
            </div>

            {/* 4-Hour Ahead AI Risk Engine */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-secondary">psychology</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">4H Ahead ML Inference</h3>
                </div>
                <span className="font-telemetry-data text-label-sm text-error font-bold">
                  P(TRIP): {tieSwitchArmed ? '18.2%' : '68.4%'}
                </span>
              </div>
              <div className="space-y-space-sm">
                <div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">
                      Expected Peak Load
                    </span>
                    <span className="font-telemetry-kpi text-[22px] font-bold text-error">
                      {tieSwitchArmed ? '86.2 MW' : '94.6 MW'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">
                      Peak Timestamp
                    </span>
                    <span className="font-telemetry-data text-label-lg font-bold text-on-surface">19:45 IST</span>
                  </div>
                </div>

                {/* Recommended Tie Switch */}
                <div className="p-space-sm rounded-lg bg-surface-container-high flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[20px]">toggle_on</span>
                    <div>
                      <span className="font-label-md text-label-md font-bold text-on-surface block">
                        Preview Tie-Switch Scenario
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        Divert 45 kVA to MB-045 (Feeder 09)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTieSwitchArmed(!tieSwitchArmed);
                      onShowToast(
                        !tieSwitchArmed
                          ? 'Demo only: simulated TS-84 state changed; no switch or load was controlled.'
                          : 'Demo only: simulated TS-84 state reset; no electrical operation occurred.'
                      );
                    }}
                    className={`px-2.5 py-1.5 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                      tieSwitchArmed
                        ? 'bg-tertiary-container text-tertiary-fixed'
                        : 'bg-primary text-on-primary hover:bg-surface-tint'
                    }`}
                  >
                    {tieSwitchArmed ? 'Demo Scenario On' : 'Preview Scenario'}
                  </button>
                </div>
              </div>
            </div>

            {/* Zone AI Operational Recommendations */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[20px] text-secondary">rule</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">SCADA Prescriptive Actions</h3>
              </div>
              <ul className="space-y-space-sm">
                <li className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-surface font-telemetry-data text-label-sm shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      Pre-emptive Feeder Load Roll
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Close tie TS-84 between Shanti Park (Fdr 4A) and Beverly Park (Fdr 09) prior to 18:00 IST to flatten the 92 MW surge.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-surface font-telemetry-data text-label-sm shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      Field Van Dispatch #03
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Conduct infrared thermal imaging on MB-042 terminal bushings. Current oil temperature indicates elevated contact resistance.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
