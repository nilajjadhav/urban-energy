import React, { useState } from 'react';
import { NavTabId } from '../data/gridData';
import { LiveGridGeographicMap } from '../components/LiveGridGeographicMap';

interface LiveGridViewProps {
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (msg: string) => void;
}

export const LiveGridView: React.FC<LiveGridViewProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [zoneFilter, setZoneFilter] = useState('All Zones (6)');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');


  return (
    <div className="live-grid-page mx-auto flex w-full max-w-[1920px] flex-col gap-space-md px-space-lg pb-space-xl pt-space-lg md:px-gutter-desktop">
      {/* Control Header & Operational Filter Strip */}
      <div className="ui-card flex flex-col justify-between gap-space-md p-space-md sm:p-space-lg xl:flex-row xl:items-center">
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-x-space-sm gap-y-1">
            <span className="inline-block h-2 w-2 rounded-full bg-secondary" />
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Live Grid</h1>
            <span className="font-telemetry-data text-label-sm text-on-secondary-fixed-variant">
              · SCADA SYNC ACTIVE
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
            Transformer coordinates and risk come from Supabase. Supporting telemetry panels contain prototype values.
          </p>
        </div>

        {/* Live Filters & Polling Controls */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <select
            value={zoneFilter}
            onChange={(e) => {
              setZoneFilter(e.target.value);
              onShowToast(`Zone filter: ${e.target.value}`);
            }}
            className="h-10 min-w-0 max-w-full rounded-xl border border-outline-variant bg-white px-space-sm text-on-surface font-label-md text-label-md transition-colors hover:bg-surface-container-low cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
          >
            <option>All Zones (6)</option>
            <option>Mira Road East</option>
            <option>Mira Road West</option>
            <option>Bhayandar East</option>
            <option>Bhayandar West</option>
            <option>Bhayandar North</option>
            <option>Mira-Bhayandar Central</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              onShowToast(`Risk filter: ${e.target.value}`);
            }}
            className="h-10 min-w-0 max-w-full rounded-xl border border-outline-variant bg-white px-space-sm text-on-surface font-label-md text-label-md transition-colors hover:bg-surface-container-low cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
          >
            <option>All Risk Levels</option>
            <option>Critical &amp; High Risk (&gt;80%)</option>
            <option>Warning (70-80%)</option>
            <option>Normal (&lt;70%)</option>
          </select>

          <div className="hidden sm:flex h-10 items-center gap-1.5 rounded-xl border border-success-container bg-success-container/60 px-space-sm text-on-success-container font-telemetry-data text-label-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-ping" />
            <span>5-sec Polling</span>
          </div>

          <button
            onClick={() => {
              setAutoRefresh(!autoRefresh);
              onShowToast(autoRefresh ? 'Auto-refresh paused' : 'Auto-refresh resumed (5s polling)');
            }}
            className="ui-button-secondary flex h-10 items-center gap-1 whitespace-nowrap px-space-sm font-label-md text-label-md cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[16px] text-secondary ${autoRefresh ? 'animate-spin' : ''}`}
            >
              sync
            </span>
            <span className="font-semibold">Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Primary Viewport Canvas (75% Map Workspace / 25% Telemetry Sidebar) */}
      <div className="grid grid-cols-1 gap-space-md">
        {/* 75% Map Workspace */}
        <div className="flex min-w-0 flex-col gap-space-md">
          <LiveGridGeographicMap
            zoneFilter={zoneFilter}
            riskFilter={riskFilter}
            autoRefresh={autoRefresh}
            onNavigate={onNavigate}
            onShowToast={onShowToast}
          />

          {/* Quick Feeder Status Mini-Bento Strip */}
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
            <div className="ui-card flex items-center justify-between p-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Substation Mira-01
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Feeder F04 (West Link)
                </span>
                <span className="font-telemetry-data text-label-sm text-secondary font-medium mt-0.5">
                  33.2 MW / 42.0 MW Cap
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-telemetry-data text-label-sm text-on-secondary-container font-semibold">
                  79% LOAD
                </span>
                <svg className="w-16 h-5 mt-1" viewBox="0 0 64 20">
                  <path d="M 0,14 L 14,12 L 28,15 L 42,9 L 64,11" fill="none" stroke="#006591" strokeWidth="1.8" />
                </svg>
              </div>
            </div>

            <div className="ui-card flex items-center justify-between p-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Substation Bhayandar-North
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Feeder F07 (Ind. GIDC)
                </span>
                <span className="font-telemetry-data text-label-sm text-error font-medium mt-0.5">
                  48.9 MW / 52.0 MW Cap
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-telemetry-data text-label-sm text-error font-bold">94% LOAD</span>
                <svg className="w-16 h-5 mt-1" viewBox="0 0 64 20">
                  <path d="M 0,16 L 14,14 L 28,10 L 42,6 L 64,3" fill="none" stroke="#ba1a1a" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="ui-card flex items-center justify-between p-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Substation Kashimira-Main
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Feeder F12 (Highway Arterial)
                </span>
                <span className="font-telemetry-data text-label-sm text-on-tertiary-fixed-variant font-medium mt-0.5">
                  22.4 MW / 40.0 MW Cap
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-telemetry-data text-label-sm text-on-surface-variant font-semibold">
                  56% LOAD
                </span>
                <svg className="w-16 h-5 mt-1" viewBox="0 0 64 20">
                  <path d="M 0,12 L 14,13 L 28,11 L 42,12 L 64,13" fill="none" stroke="#005048" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 25% Telemetry Summary Sidebar Panel */}
        <div className="grid grid-cols-1 items-start gap-space-md md:grid-cols-2 xl:grid-cols-4">
          <div className="ui-card flex items-center justify-between p-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Polled SCADA Telemetry
                </span>
                <span className="font-telemetry-data text-label-md font-semibold text-on-surface">
                  14:38:12 IST • Node 14
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-tertiary-fixed-variant">sensors</span>
          </div>

          {/* Live Grid Transformer Population Status */}
          <div className="ui-card flex flex-col p-space-md">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-container">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Grid Cohort</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Transformer Inventory</h3>
              </div>
              <span className="font-telemetry-kpi text-headline-lg font-bold text-on-surface">200</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
                    Normal Operations
                  </span>
                  <span className="font-telemetry-data font-semibold text-on-surface">
                    136 <span className="text-on-surface-variant font-normal">(68.0%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-secondary-container" />
                    Elevated / Warning
                  </span>
                  <span className="font-telemetry-data font-semibold text-on-surface">
                    42 <span className="text-on-surface-variant font-normal">(21.0%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary-container rounded-full" style={{ width: '21%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-error" />
                    High Risk
                  </span>
                  <span className="font-telemetry-data font-semibold text-error">
                    22 <span className="text-on-surface-variant font-normal">(11.0%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-error rounded-full" style={{ width: '11%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Composite Grid Telemetry */}
          <div className="ui-card flex flex-col gap-space-md p-space-md">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Composite Telemetry</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
            </div>
            <div className="space-y-3">
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase">
                  <span>Regional Load</span>
                  <span>Cap 280 MW</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-telemetry-kpi text-headline-lg font-bold text-on-surface">
                    218.4 <span className="text-headline-sm text-on-surface-variant">MW</span>
                  </span>
                  <span className="font-telemetry-data text-label-sm text-secondary font-bold">78.0% Pk</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Voltage (Avg)</span>
                  <span className="font-telemetry-data text-headline-sm font-bold text-on-surface mt-1">
                    11.04 <span className="text-body-sm font-normal">kV</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-on-tertiary-fixed-variant mt-0.5">
                    ±0.36% Nominal
                  </span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Frequency</span>
                  <span className="font-telemetry-data text-headline-sm font-bold text-on-surface mt-1">
                    50.02 <span className="text-body-sm font-normal">Hz</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-on-tertiary-fixed-variant mt-0.5">
                    Grid Band OK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Current</span>
                  <span className="font-telemetry-data text-headline-sm font-bold text-on-surface mt-1">
                    11,480 <span className="text-body-sm font-normal">A</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Balanced Ph-3</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Power Factor</span>
                  <span className="font-telemetry-data text-headline-sm font-bold text-on-surface mt-1">
                    0.96 <span className="text-body-sm font-normal">lag</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary mt-0.5">Optimal Var</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Rapid Actions */}
          <div className="ui-card flex flex-col gap-2 p-space-md">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
              Operational Commands
            </span>
            <button
              onClick={() => onShowToast('Demo only: grid snapshot export is unavailable; no file was created.')}
              className="w-full py-2.5 px-space-md rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md flex items-center justify-between shadow-sm transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Demo: Grid Snapshot Export</span>
              </span>
              <span className="font-telemetry-data text-label-sm text-on-primary-container">CSV / SCADA</span>
            </button>
            <button
              onClick={() => {
                setRiskFilter('Critical & High Risk (>80%)');
                onShowToast('Map markers filtered to the selected high and critical risk levels.');
              }}
              className="w-full py-2.5 px-space-md rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-error">filter_list</span>
                <span>Filter High / Critical Risk</span>
              </span>
              <span className="font-telemetry-data text-label-sm text-error font-bold">Filter</span>
            </button>
            <button
              onClick={() => onNavigate('transformer-detail', 'MB-042')}
              className="w-full py-2.5 px-space-md rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary">camera_indoor</span>
                <span>Open MB-042 Transformer Profile</span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
