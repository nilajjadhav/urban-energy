import React from 'react';
import { NavTabId } from '../data/gridData';

interface EventsForecastsViewProps {
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onOpenDispatch: (assetId: string, van: string, zone: string) => void;
  onShowToast: (msg: string) => void;
}

export const EventsForecastsView: React.FC<EventsForecastsViewProps> = ({
  onNavigate,
  onOpenDispatch,
  onShowToast,
}) => {
  return (
    <div className="flex flex-col w-full">
      {/* Top Operational Banner & Breadcrumb Header */}
      <section className="px-gutter-desktop py-space-md bg-surface-container-lowest shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            <span className="text-secondary font-bold">Planning</span>
            <span>/</span>
            <span>Demand Forecasting Engine</span>
            <span>·</span>
            <span className="text-on-secondary-container font-telemetry-data font-semibold">
              ILLUSTRATIVE FIXTURE DATA
            </span>
          </div>
          <div className="flex items-baseline gap-space-sm mt-0.5">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Events &amp; Forecasts
            </h1>
            <p className="hidden sm:inline font-body-sm text-body-sm text-on-surface-variant">
              Prepare for demand changes before they impact the municipal power grid.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xs self-start md:self-auto">
          <div className="px-space-sm py-1 rounded bg-surface-container-low text-on-surface-variant flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">update</span>
            <span className="font-telemetry-data text-label-sm">Cycle 04:30 IST • Next Model Sync 11m</span>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="px-space-md py-1.5 rounded bg-primary-container text-surface hover:bg-primary font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">tune</span>
            <span>Configure Parameters</span>
          </button>
        </div>
      </section>

      {/* Main Canvas Container */}
      <div className="p-gutter-desktop flex flex-col gap-space-xl max-w-[1720px] mx-auto w-full">
        <div className="ui-card flex items-start gap-3 border-l-4 border-warning px-4 py-3 text-sm" role="note">
          <span className="material-symbols-outlined text-warning">info</span>
          <div><strong>Illustrative planning data.</strong> Event schedules, forecast figures, risk summaries, and timeline values on this page are presentation fixtures; they are not live municipal records or model output.</div>
        </div>
        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Upcoming Events
              </span>
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            </div>
            <div className="my-space-md flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface">4</span>
              <span className="font-label-lg text-label-lg text-on-surface-variant">Scheduled</span>
            </div>
            <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
                <span className="font-semibold">Next: Ganesh Chaturthi</span>
                <span className="text-error font-bold">in 3 days</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Zone 4 &amp; 5 Direct Influx Impact
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Forecast Peak Demand
              </span>
              <span className="font-telemetry-data text-label-sm text-error font-bold">Near Margin</span>
            </div>
            <div className="my-space-md flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface">284.6</span>
              <span className="font-label-lg text-label-lg text-on-surface-variant">MW</span>
              <span className="ml-auto font-telemetry-data text-label-md text-error font-semibold">+14.2%</span>
            </div>
            <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-0.5">
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <span className="text-on-surface-variant">Ceiling: 290.0 MW</span>
                <span className="text-on-surface font-telemetry-data font-semibold">Trip margin: 5.4 MW</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Peak Slot: 19:30 – 22:00 IST
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                High Risk Zones
              </span>
              <span className="w-2 h-2 rounded-full bg-error" />
            </div>
            <div className="my-space-md flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface">2</span>
              <span className="font-label-lg text-label-lg text-on-surface-variant">Zones Alert</span>
            </div>
            <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
                <span className="font-semibold">Mira Rd East, Bhayandar E</span>
                <span className="text-error font-bold font-telemetry-data">18 Tx</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                18 step-down transformers under watch
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Forecast Horizon
              </span>
              <span className="font-telemetry-data text-label-sm font-semibold text-on-surface">94.8% CI</span>
            </div>
            <div className="my-space-md flex items-baseline gap-space-xs">
              <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface">14</span>
              <span className="font-label-lg text-label-lg text-on-surface-variant">Days Ahead</span>
            </div>
            <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
                <span className="font-semibold">Meteorological Hybrid</span>
                <span className="text-secondary font-telemetry-data font-bold">ECMWF</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Coupled with SCADA high-frequency bus log
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Upcoming Events & Timeline */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">
              Upcoming Municipal &amp; Industrial Events
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Sorted by Chronological Impact
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">18 – 28 Sep</span>
                  <span className="font-label-sm text-label-sm text-error font-bold uppercase tracking-wider">
                    Critical
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight mt-1">
                  Ganesh Chaturthi Procession &amp; Mandap Illuminations
                </h2>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  <span>Mira Road East &amp; Station Corridor</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="text-on-surface-variant">Expected Surge:</span>
                  <span className="text-error font-telemetry-data font-bold">+28.5 MW (+18.4%)</span>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  42 additional temporary distribution taps identified
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">21 – 22 Sep</span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                    High Risk
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight mt-1">
                  Bhayandar Cold Storage &amp; APMC Weekend Rush
                </h2>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  <span>Bhayandar East Industrial</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="text-on-surface-variant">Expected Surge:</span>
                  <span className="text-on-surface font-telemetry-data font-bold">+12.0 MW (+8.1%)</span>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Heavy refrigeration compressor cyclic ramps (14:00 - 19:00)
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">03 – 12 Oct</span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                    High Risk
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight mt-1">
                  Navratri Festival Illuminations Staging
                </h2>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  <span>Mira Road West &amp; Central Grounds</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="text-on-surface-variant">Expected Surge:</span>
                  <span className="text-on-surface font-telemetry-data font-bold">+22.4 MW (+14.0%)</span>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Evening reactive power factor compensation (Capacitor bank 3)
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">05 Oct</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                    Warning
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight mt-1">
                  MIDC Annual Switchgear Maintenance
                </h2>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  <span>Kashimira Industrial Cluster</span>
                </div>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="text-on-surface-variant">Net Diversion:</span>
                  <span className="text-on-surface font-telemetry-data font-bold">-15.0 MW Net Diversion</span>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Feeder rerouting active via 33kV Tie-Line 2
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Regional Demand Forecast (Analytical Line Chart) */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-md text-headline-md text-primary">
                  14-Day Demand Horizon &amp; Confidence Interval
                </span>
                <span className="font-telemetry-data text-label-sm text-on-surface-variant">
                  · Resolution: 1-Hour Bins
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Comparing real-time feeder telemetry against predictive meteorological ML vector
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-on-surface">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-secondary rounded-full" />
                <span>Historical (Past 7d)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-secondary-container rounded-full" />
                <span>ML Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-secondary-fixed/40 rounded-sm" />
                <span>95% Confidence Band</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-error" />
                <span>Trip Ceiling (290 MW)</span>
              </div>
            </div>
          </div>

          <div className="relative w-full overflow-hidden bg-surface-container-lowest rounded-lg pt-4 pb-2">
            <div className="w-full h-80 relative select-none">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 320">
                <defs>
                  <linearGradient id="ci-gradient-ev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#39b8fd" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#39b8fd" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                <line stroke="#e5eeff" strokeWidth="1" x1="45" x2="980" y1="20" y2="20" />
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="35" y="24">
                  300
                </text>
                <line stroke="#ba1a1a" strokeDasharray="4 4" strokeWidth="1.5" x1="45" x2="980" y1="38" y2="38" />
                <text fill="#ba1a1a" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" textAnchor="end" x="975" y="32">
                  CRITICAL TRIP CEILING: 290 MW
                </text>
                <line stroke="#ffdad6" strokeDasharray="2 2" strokeWidth="1" x1="45" x2="980" y1="56" y2="56" />
                <line stroke="#e5eeff" strokeWidth="1" x1="45" x2="980" y1="110" y2="110" />
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="35" y="114">
                  250
                </text>
                <line stroke="#e5eeff" strokeWidth="1" x1="45" x2="980" y1="180" y2="180" />
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="35" y="184">
                  200
                </text>
                <line stroke="#e5eeff" strokeWidth="1" x1="45" x2="980" y1="250" y2="250" />
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="35" y="254">
                  150
                </text>

                <path
                  d="M 460 195 C 500 185, 540 170, 580 150 C 620 120, 660 70, 700 40 C 740 20, 780 40, 820 90 C 860 120, 900 145, 960 160 L 960 215 C 900 200, 860 175, 820 150 C 780 115, 740 85, 700 65 C 660 110, 620 160, 580 190 C 540 210, 500 215, 460 215 Z"
                  fill="url(#ci-gradient-ev)"
                />
                <path
                  d="M 50 200 C 80 190, 110 210, 140 185 C 170 160, 200 205, 230 195 C 260 185, 290 170, 320 180 C 350 190, 380 220, 410 195 C 430 180, 445 205, 460 205"
                  fill="none"
                  stroke="#006591"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <line opacity="0.6" stroke="#000d12" strokeDasharray="3 3" strokeWidth="1.5" x1="460" x2="460" y1="15" y2="280" />
                <path
                  d="M 460 205 C 500 200, 540 185, 580 170 C 620 140, 660 90, 700 48 C 740 45, 780 65, 820 120 C 860 148, 900 175, 960 190"
                  fill="none"
                  stroke="#39b8fd"
                  strokeDasharray="5 4"
                  strokeWidth="2.5"
                />
                <circle cx="700" cy="48" fill="#ba1a1a" r="5" />
                <circle className="animate-ping" cx="700" cy="48" opacity="0.5" r="9" stroke="#ba1a1a" strokeWidth="1.5" />

                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" x="50" y="300">
                  D-7 (Sep 11)
                </text>
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" x="180" y="300">
                  D-5
                </text>
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" x="320" y="300">
                  D-2
                </text>
                <text fill="#0b1c30" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" x="460" y="300">
                  TODAY 14:00
                </text>
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" x="580" y="300">
                  D+3 (Sep 21)
                </text>
                <text fill="#ba1a1a" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" x="700" y="300">
                  PEAK: D+5 (Sep 23)
                </text>
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" x="820" y="300">
                  D+8
                </text>
                <text fill="#72787a" fontFamily="JetBrains Mono" fontSize="10" x="920" y="300">
                  D+14 (Oct 02)
                </text>
              </svg>

              <div className="absolute top-4 left-[64%] -translate-x-1/2 bg-primary-container text-surface px-space-md py-space-xs rounded-lg shadow-md pointer-events-none flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span className="font-telemetry-data text-label-md font-bold text-tertiary-fixed">
                    PROJECTED PEAK 284.6 MW
                  </span>
                </div>
                <div className="font-label-sm text-label-sm text-primary-fixed-dim">
                  Ganesh Chaturthi Eve (20:45 IST)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Zone Risk Forecast Matrix */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">
              Zone Risk Forecast Matrix · 5 Regional Sub-Grids
            </span>
            <button
              onClick={() => onShowToast('Demo only: forecast matrix export is unavailable; no CSV was created.')}
              className="px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high font-label-md text-label-md text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Demo: Export CSV</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-space-sm px-space-md font-semibold">Zone</th>
                  <th className="py-space-sm px-space-md font-semibold text-right">Expected Peak Load</th>
                  <th className="py-space-sm px-space-md font-semibold text-center">Risk Score</th>
                  <th className="py-space-sm px-space-md font-semibold">High Risk Transformers</th>
                  <th className="py-space-sm px-space-md font-semibold">Forecast Period</th>
                  <th className="py-space-sm px-space-md font-semibold">Status</th>
                  <th className="py-space-sm px-space-md font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-sm px-space-md font-semibold text-primary">Mira Road East</td>
                  <td className="py-space-sm px-space-md font-telemetry-data text-right font-medium">
                    <span className="text-error font-bold">92.4 MW</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm block">94.2% Cap</span>
                  </td>
                  <td className="py-space-sm px-space-md text-center font-telemetry-data font-bold text-error">
                    88 / 100
                  </td>
                  <td className="py-space-sm px-space-md">
                    <span className="font-telemetry-data font-semibold text-error">9 Units</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm block">
                      MB-042, MB-073, MB-088...
                    </span>
                  </td>
                  <td className="py-space-sm px-space-md font-telemetry-data text-label-sm">18 – 22 Sep</td>
                  <td className="py-space-sm px-space-md font-label-sm text-label-sm text-error font-bold uppercase">
                    Critical
                  </td>
                  <td className="py-space-sm px-space-md text-right">
                    <button
                      onClick={() => onOpenDispatch('MB-042', 'Field Van #03', 'Mira Road East')}
                      className="px-2.5 py-1 rounded bg-primary-container text-surface hover:bg-primary font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                    >
                      Demo: Preview Mobile Tx Dispatch
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-sm px-space-md font-semibold text-primary">Bhayandar East</td>
                  <td className="py-space-sm px-space-md font-telemetry-data text-right font-medium">
                    <span>64.8 MW</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm block">88.5% Cap</span>
                  </td>
                  <td className="py-space-sm px-space-md text-center font-telemetry-data font-bold text-secondary">
                    76 / 100
                  </td>
                  <td className="py-space-sm px-space-md">
                    <span className="font-telemetry-data font-semibold text-secondary">5 Units</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm block">
                      MB-009, MB-112, MB-114
                    </span>
                  </td>
                  <td className="py-space-sm px-space-md font-telemetry-data text-label-sm">20 – 24 Sep</td>
                  <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary font-bold uppercase">
                    High Risk
                  </td>
                  <td className="py-space-sm px-space-md text-right">
                    <button
                      onClick={() => onShowToast('Demo only: no staff roster was changed.')}
                      className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                    >
                      Demo: Preview Roster Change
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-space-sm px-space-md font-semibold text-primary">Kashimira Industrial</td>
                  <td className="py-space-sm px-space-md font-telemetry-data text-right font-medium">
                    <span>58.2 MW</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm block">82.1% Cap</span>
                  </td>
                  <td className="py-space-sm px-space-md text-center font-telemetry-data font-bold text-on-surface">
                    68 / 100
                  </td>
                  <td className="py-space-sm px-space-md">
                    <span className="font-telemetry-data font-semibold">3 Units</span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm block">MB-118, MB-121</span>
                  </td>
                  <td className="py-space-sm px-space-md font-telemetry-data text-label-sm">21 – 25 Sep</td>
                  <td className="py-space-sm px-space-md font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
                    Elevated
                  </td>
                  <td className="py-space-sm px-space-md text-right">
                    <button
                      onClick={() => onShowToast('Demo only: no bus coupler was armed.')}
                      className="px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                    >
                      Demo: Preview Coupler Action
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Preparation & Mitigation Recommendations */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">
                Preparation &amp; Mitigation Recommendations
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Prioritized automated actions for SCADA field engineering dispatch. Requires human verification before actuation.
              </p>
            </div>
            <button
              onClick={() => onShowToast('Demo only: preparation protocols were not verified or queued.')}
              className="px-space-md py-1.5 rounded bg-primary text-surface hover:bg-surface-tint font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer self-start"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Demo: Review Protocols (4)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-error font-bold uppercase tracking-wider">
                  Priority 1 • Immediate Dispatch · Ref: REC-802
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Pre-arm Tie-Switch TS-84 for Load Shed Diversion
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Divert 45 kVA from <strong className="text-primary font-telemetry-data">MB-042</strong> (Shanti Park residential step-down) to underutilized transformer{' '}
                  <strong className="text-primary font-telemetry-data">MB-045</strong> before{' '}
                  <span className="font-semibold text-error">Sept 18 16:00 IST</span>.
                </p>
              </div>
              <div className="pt-space-xs flex items-center justify-between bg-surface-container-low p-space-xs rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Substation Engineer: Desk 2 Verification
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('what-if-simulator', 'MB-042')}
                    className="px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                  >
                    Simulate Impact
                  </button>
                  <button
                    onClick={() => onShowToast('Demo only: TS-84 was not armed and no transfer was scheduled.')}
                    className="px-space-sm py-1 rounded bg-primary-container text-surface hover:bg-primary font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                  >
                    Demo: Preview Pre-Arm
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                  Priority 2 • Capacity Buffer · Ref: REC-805
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Stage Mobile Inverter / Diesel Substation Buffer
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Position 500 kVA emergency trailer-mounted mobile diesel/inverter backup at{' '}
                  <strong className="text-primary">Mira Road Station Road Substation Yard</strong>.
                </p>
              </div>
              <div className="pt-space-xs flex items-center justify-between bg-surface-container-low p-space-xs rounded">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Fleet Transit: 40 min from Central Depot
                </span>
                <button
                  onClick={() => onOpenDispatch('MB-042', 'Field Van #03', 'Mira Road Station Yard')}
                  className="px-space-sm py-1 rounded bg-primary-container text-surface hover:bg-primary font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                >
                  Demo: Preview Trailer Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
