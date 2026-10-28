import React, { useState } from 'react';
import { NavTabId } from '../data/gridData';

interface WhatIfSimulatorViewProps {
  initialOutageAsset?: string;
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (msg: string) => void;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  initialOutageAsset,
  onNavigate,
  onShowToast,
}) => {
  const [activePreset, setActivePreset] = useState<'heatwave' | 'festival' | 'industrial' | 'n1' | 'worstcase'>(
    'festival'
  );
  const [demandChange, setDemandChange] = useState<number>(40);
  const [tempShift, setTempShift] = useState<number>(8.0);
  const [eventImpact, setEventImpact] = useState<number>(35);
  const [outageAsset, setOutageAsset] = useState<string>(initialOutageAsset || 'MB-042');
  const [horizonMin, setHorizonMin] = useState<number>(60);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const applyPreset = (preset: typeof activePreset) => {
    setActivePreset(preset);
    if (preset === 'heatwave') {
      setDemandChange(25);
      setTempShift(10);
      setEventImpact(10);
    } else if (preset === 'festival') {
      setDemandChange(40);
      setTempShift(8);
      setEventImpact(35);
    } else if (preset === 'industrial') {
      setDemandChange(30);
      setTempShift(4);
      setEventImpact(5);
    } else if (preset === 'n1') {
      setDemandChange(15);
      setTempShift(2);
      setEventImpact(0);
    } else {
      setDemandChange(50);
      setTempShift(12);
      setEventImpact(45);
    }
  };

  const resetBaseline = () => {
    setDemandChange(0);
    setTempShift(0);
    setEventImpact(0);
    setOutageAsset('none');
    onShowToast('Demo only: local scenario controls reset to their preview baseline; no live telemetry was loaded.');
  };

  // Dynamic Calculations based on sliders
  const stressMultiplier = 1 + demandChange / 200 + tempShift / 80 + eventImpact / 250 + (outageAsset !== 'none' ? 0.04 : 0);
  const simFleetLoad = Math.min(115, +(74.8 * stressMultiplier).toFixed(1));
  const simPeakMw = +(218.4 * (1 + demandChange / 150 + eventImpact / 300)).toFixed(1);
  const simCriticalUnits = Math.max(0, Math.min(45, Math.round((simFleetLoad - 74.8) * 0.72)));
  const simHighUnits = Math.max(22, Math.min(80, Math.round(22 + (simFleetLoad - 74.8) * 1.3)));
  const simWarnUnits = Math.max(20, Math.min(90, Math.round(42 + (simFleetLoad - 74.8) * 1.1)));
  const simNormalUnits = Math.max(0, 200 - simCriticalUnits - simHighUnits - simWarnUnits);

  return (
    <div className="flex flex-col w-full">
      <div className="px-gutter-desktop pt-space-md">
        <div className="ui-card flex items-start gap-3 border-l-4 border-warning px-4 py-3 text-sm" role="note">
          <span className="material-symbols-outlined text-warning">info</span>
          <div>
            <strong>Advisory prototype only.</strong> This local scenario model uses illustrative fleet baselines and estimates. It does not control electrical equipment or represent a live power-flow calculation.
            <span className="block mt-1 text-on-surface-variant">{hasRun ? 'The local simulation action completed; figures remain advisory estimates.' : 'Current figures are a scenario preview; no simulation has been run yet.'}</span>
          </div>
        </div>
      </div>
      {/* Top Command & Action Bar */}
      <div className="w-full bg-surface-container-lowest px-gutter-desktop py-space-md shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-telemetry-data text-label-sm text-on-surface-variant uppercase font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                CONTINGENCY SIMULATION ENGINE
              </span>
              <span className="text-outline text-label-sm">•</span>
              <span className="font-label-sm text-label-sm text-error uppercase font-bold tracking-wide">
                NON-OPERATIONAL VIRTUAL MODEL (DECISION SUPPORT ONLY)
              </span>
            </div>
            <div className="flex items-baseline gap-space-md mt-1">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">What-If Simulator</h1>
              <p className="font-body-md text-body-sm text-on-surface-variant">
                Test future demand and thermal stress scenarios before dispatch execution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-sm self-start lg:self-center shrink-0">
            <button
              onClick={resetBaseline}
              className="flex items-center gap-1.5 px-space-md py-1.5 rounded bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors shadow-sm font-label-md text-label-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">restart_alt</span>
              Reset Defaults
            </button>
            <button
              onClick={() => onShowToast('Demo only: scenario snapshots are not saved outside this page.')}
              className="flex items-center gap-1.5 px-space-md py-1.5 rounded bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors shadow-sm font-label-md text-label-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">bookmark_add</span>
              Save Scenario
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1.5 px-space-md py-1.5 rounded bg-primary-container text-surface hover:bg-primary transition-colors shadow-sm font-label-md text-label-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">picture_as_pdf</span>
              Open Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-gutter-desktop py-space-lg">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: SCENARIO CONTROLS (4 Cols) */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            {/* Scenario Presets Selector */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md uppercase tracking-wider text-outline font-semibold">
                  Scenario Presets
                </span>
                <span className="font-telemetry-data text-label-sm text-secondary font-semibold">
                  5 Presets Configured
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-xs">
                <button
                  onClick={() => applyPreset('heatwave')}
                  className={`px-2.5 py-2 text-left rounded transition-all flex flex-col cursor-pointer ${
                    activePreset === 'heatwave'
                      ? 'bg-primary-container text-surface font-semibold shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="font-label-md text-label-md">Heatwave + Extreme</span>
                  <span className="font-telemetry-data text-label-sm opacity-80">+25% Load • +10°C</span>
                </button>

                <button
                  onClick={() => applyPreset('festival')}
                  className={`px-2.5 py-2 text-left rounded transition-all flex flex-col cursor-pointer ${
                    activePreset === 'festival'
                      ? 'bg-primary-container text-surface font-semibold shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="font-label-md text-label-md">Festival Peak Surge</span>
                  <span className="font-telemetry-data text-label-sm opacity-80">+40% Load • 60min Peak</span>
                </button>

                <button
                  onClick={() => applyPreset('industrial')}
                  className={`px-2.5 py-2 text-left rounded transition-all flex flex-col cursor-pointer ${
                    activePreset === 'industrial'
                      ? 'bg-primary-container text-surface font-semibold shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="font-label-md text-label-md">Industrial Shift Spike</span>
                  <span className="font-telemetry-data text-label-sm opacity-80">+30% MIDC • Phase Balance</span>
                </button>

                <button
                  onClick={() => applyPreset('n1')}
                  className={`px-2.5 py-2 text-left rounded transition-all flex flex-col cursor-pointer ${
                    activePreset === 'n1'
                      ? 'bg-primary-container text-surface font-semibold shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="font-label-md text-label-md">N-1 Substation Trip</span>
                  <span className="font-telemetry-data text-label-sm opacity-80">Feeder 4 Cutoff • Transfer</span>
                </button>

                <button
                  onClick={() => applyPreset('worstcase')}
                  className={`col-span-2 px-2.5 py-2 text-left rounded transition-all flex items-center justify-between cursor-pointer ${
                    activePreset === 'worstcase'
                      ? 'bg-primary-container text-surface font-semibold shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md">Custom Extreme Stress</span>
                    <span className="font-telemetry-data text-label-sm opacity-80">
                      High Ambient + Concurrent Event + Bus Trip
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </button>
              </div>
            </div>

            {/* Dynamic Parameter Sliders */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Simulation Parameters</h2>
                <span className="font-telemetry-data text-label-sm text-on-surface-variant font-semibold">
                  Active: {activePreset.toUpperCase()}
                </span>
              </div>

              {/* Parameter 1: Regional Demand */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">trending_up</span>
                    Regional Demand Change
                  </label>
                  <span className="font-telemetry-data text-label-md font-bold text-secondary">
                    {demandChange >= 0 ? '+' : ''}
                    {demandChange}% ({demandChange >= 0 ? '+' : ''}
                    {(218.4 * (demandChange / 100)).toFixed(1)} MW)
                  </span>
                </div>
                <div className="flex items-center gap-space-sm pt-1">
                  <span className="font-telemetry-data text-label-sm text-outline">-20%</span>
                  <input
                    className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-secondary"
                    max="60"
                    min="-20"
                    type="range"
                    value={demandChange}
                    onChange={(e) => setDemandChange(Number(e.target.value))}
                  />
                  <span className="font-telemetry-data text-label-sm text-outline">+60%</span>
                </div>
              </div>

              {/* Parameter 2: Ambient Temperature Shift */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-error text-[16px]">thermostat</span>
                    Ambient Temperature Shift
                  </label>
                  <span className="font-telemetry-data text-label-md font-bold text-error">
                    +{tempShift.toFixed(1)}°C (Sim {(32 + tempShift).toFixed(1)}°C)
                  </span>
                </div>
                <div className="flex items-center gap-space-sm pt-1">
                  <span className="font-telemetry-data text-label-sm text-outline">0°C</span>
                  <input
                    className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-error"
                    max="15"
                    min="0"
                    step="0.5"
                    type="range"
                    value={tempShift}
                    onChange={(e) => setTempShift(Number(e.target.value))}
                  />
                  <span className="font-telemetry-data text-label-sm text-outline">+15°C</span>
                </div>
              </div>

              {/* Parameter 3: Municipal Event Impact */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">celebration</span>
                    Municipal Event Impact
                  </label>
                  <span className="font-telemetry-data text-label-md font-bold text-on-surface">
                    +{eventImpact}% (Festival &amp; Commercial)
                  </span>
                </div>
                <div className="flex items-center gap-space-sm pt-1">
                  <span className="font-telemetry-data text-label-sm text-outline">0%</span>
                  <input
                    className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-secondary"
                    max="50"
                    min="0"
                    type="range"
                    value={eventImpact}
                    onChange={(e) => setEventImpact(Number(e.target.value))}
                  />
                  <span className="font-telemetry-data text-label-sm text-outline">+50%</span>
                </div>
              </div>

              {/* Parameter 4: Contingency Outage (N-1) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-error text-[16px]">power_off</span>
                    Contingency Outage (N-1)
                  </span>
                  <span className="font-label-sm text-label-sm text-error font-semibold uppercase">Instant Trip</span>
                </label>
                <select
                  value={outageAsset}
                  onChange={(e) => setOutageAsset(e.target.value)}
                  className="w-full px-space-md py-2 bg-surface-container-low rounded text-on-surface font-telemetry-data text-body-md focus:outline-none cursor-pointer"
                >
                  <option value="MB-042">MB-042 (1000 kVA Shanti Park Stn-4) [Selected Outage]</option>
                  <option value="MB-118">MB-118 (1500 kVA Kashimira MIDC)</option>
                  <option value="MB-009">MB-009 (750 kVA APMC Vegetable Market)</option>
                  <option value="MB-073">MB-073 (1000 kVA Sheetal Nagar)</option>
                  <option value="none">None (Full Redundant Topology)</option>
                </select>
              </div>

              {/* Parameter 5: Simulation Time Horizon */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface">Peak Stress Horizon</label>
                <div className="grid grid-cols-4 gap-space-xs">
                  {[15, 30, 60, 120].map((m) => (
                    <button
                      key={m}
                      onClick={() => setHorizonMin(m)}
                      className={`py-1.5 rounded text-center font-telemetry-data text-label-md transition-colors cursor-pointer ${
                        horizonMin === m
                          ? 'bg-primary-container text-surface font-bold shadow-sm'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Execution */}
              <div className="pt-space-sm flex flex-col gap-space-sm">
                <button
                  onClick={() => {
                    setIsSimulating(true);
                    setTimeout(() => {
                      setIsSimulating(false);
                      setHasRun(true);
                      onShowToast('Demo only: local scenario preview action completed; no external power-flow model was run.');
                    }, 400);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded bg-primary-container hover:bg-primary text-surface font-label-lg text-label-lg tracking-wide uppercase font-bold shadow-md transition-all cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-tertiary-fixed text-[20px] ${
                      isSimulating ? 'animate-spin' : ''
                    }`}
                  >
                    {isSimulating ? 'refresh' : 'bolt'}
                  </span>
                  {isSimulating ? 'Re-calculating Power Flow...' : 'Run Contingency Simulation'}
                </button>
                <button
                  onClick={resetBaseline}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-outline text-[16px]">sync</span>
                  Reset to Live Baseline
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS & COMPARISON CONSOLE (8 Cols) */}
          <div className="xl:col-span-8 flex flex-col gap-space-lg">
            {/* 1. COMPARATIVE KPI STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-sm">
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md text-outline uppercase">Average Fleet Load</span>
                  <span className="w-2 h-2 rounded-full bg-error" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-telemetry-kpi text-telemetry-kpi text-error font-bold">{simFleetLoad}%</span>
                  <span className="font-telemetry-data text-label-sm text-outline">simulated</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 bg-surface-container-low px-2 py-1 rounded">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">Live: 74.8%</span>
                  <span className="font-telemetry-data text-label-sm text-error font-bold">
                    +{(simFleetLoad - 74.8).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md text-outline uppercase">Peak Regional Demand</span>
                  <span className="font-telemetry-data text-label-sm text-error font-semibold">
                    {((simPeakMw / 280) * 100).toFixed(1)}% Cap
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">{simPeakMw}</span>
                  <span className="font-telemetry-data text-label-lg text-outline">MW</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 bg-surface-container-low px-2 py-1 rounded">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">Live: 218.4 MW</span>
                  <span className="font-telemetry-data text-label-sm text-error font-bold">
                    +{(simPeakMw - 218.4).toFixed(1)} MW
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md text-error uppercase font-semibold">
                    Critical (&gt;92%)
                  </span>
                  <span className="font-telemetry-data text-label-sm text-error font-bold">CRITICAL</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-telemetry-kpi text-telemetry-kpi text-error font-bold">
                    {simCriticalUnits}
                  </span>
                  <span className="font-telemetry-data text-label-lg text-outline">Units</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 bg-surface-container-low px-2 py-1 rounded">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">Live: 0 Units</span>
                  <span className="font-telemetry-data text-label-sm text-error font-bold">
                    +{simCriticalUnits} Units
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md text-outline uppercase">High Risk (80-92%)</span>
                  <span className="w-2 h-2 rounded-full bg-secondary-container" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-telemetry-kpi text-telemetry-kpi text-secondary font-bold">
                    {simHighUnits}
                  </span>
                  <span className="font-telemetry-data text-label-lg text-outline">Units</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 bg-surface-container-low px-2 py-1 rounded">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">Live: 22 Units</span>
                  <span className="font-telemetry-data text-label-sm text-secondary font-bold">
                    +{simHighUnits - 22} Units
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md text-outline uppercase">Warning (70-80%)</span>
                  <span className="w-2 h-2 rounded-full bg-surface-tint" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">
                    {simWarnUnits}
                  </span>
                  <span className="font-telemetry-data text-label-lg text-outline">Units</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 bg-surface-container-low px-2 py-1 rounded">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">Live: 42 Units</span>
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant font-bold">
                    {simWarnUnits >= 42 ? `+${simWarnUnits - 42}` : simWarnUnits - 42} Units
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md text-outline uppercase">Normal (&lt;70%)</span>
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">
                    {simNormalUnits}
                  </span>
                  <span className="font-telemetry-data text-label-lg text-outline">Units</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 bg-surface-container-low px-2 py-1 rounded">
                  <span className="font-telemetry-data text-label-sm text-on-surface-variant">Live: 136 Units</span>
                  <span className="font-telemetry-data text-label-sm text-outline font-bold">
                    {simNormalUnits - 136} Units
                  </span>
                </div>
              </div>
            </div>

            {/* 2. FLEET RISK MIGRATION VISUALIZATION */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Fleet Risk Migration Analysis
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Distribution transition across 200 Municipal Step-Down Transformers under stress projection.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm flex-wrap text-label-sm font-label-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-surface-container-high" /> Normal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-secondary-fixed-dim" /> Warning
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-secondary-container" /> High
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-error" /> Critical
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-space-md pt-2">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-label-md font-label-md">
                    <span className="text-on-surface-variant font-semibold">Live Fleet Baseline</span>
                    <span className="font-telemetry-data text-outline">200 Units Monitored • 0 Units Over 92%</span>
                  </div>
                  <div className="w-full h-8 bg-surface-container-low rounded flex overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-surface-container-high flex items-center justify-center font-telemetry-data text-label-sm text-on-surface font-semibold"
                      style={{ width: '68%' }}
                    >
                      136 (68%)
                    </div>
                    <div
                      className="h-full bg-secondary-fixed-dim flex items-center justify-center font-telemetry-data text-label-sm text-on-secondary-fixed font-semibold"
                      style={{ width: '21%' }}
                    >
                      42 (21%)
                    </div>
                    <div
                      className="h-full bg-secondary-container flex items-center justify-center font-telemetry-data text-label-sm text-surface font-semibold"
                      style={{ width: '11%' }}
                    >
                      22
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-label-md font-label-md">
                    <span className="text-error font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">priority_high</span>
                      Simulated Scenario ({horizonMin}m Stress Window)
                    </span>
                    <span className="font-telemetry-data text-error font-semibold">
                      {simCriticalUnits} Units Breaching Critical Limit
                    </span>
                  </div>
                  <div className="w-full h-8 bg-surface-container-low rounded flex overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-surface-container-high flex items-center justify-center font-telemetry-data text-label-sm text-on-surface font-semibold transition-all duration-300"
                      style={{ width: `${(simNormalUnits / 200) * 100}%` }}
                    >
                      {simNormalUnits}
                    </div>
                    <div
                      className="h-full bg-secondary-fixed-dim flex items-center justify-center font-telemetry-data text-label-sm text-on-secondary-fixed font-semibold transition-all duration-300"
                      style={{ width: `${(simWarnUnits / 200) * 100}%` }}
                    >
                      {simWarnUnits}
                    </div>
                    <div
                      className="h-full bg-secondary-container flex items-center justify-center font-telemetry-data text-label-sm text-surface font-semibold transition-all duration-300"
                      style={{ width: `${(simHighUnits / 200) * 100}%` }}
                    >
                      {simHighUnits}
                    </div>
                    <div
                      className="h-full bg-error flex items-center justify-center font-telemetry-data text-label-sm text-on-error font-bold transition-all duration-300"
                      style={{ width: `${(simCriticalUnits / 200) * 100}%` }}
                    >
                      {simCriticalUnits}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. TOP PRIORITY STRESSED TRANSFORMERS UNDER SIMULATION */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Stressed Distribution Transformers (Top Priority)
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Sorted by projected thermal rise and continuous overload failure risk.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase">
                      <th className="py-2.5 px-3">Unit ID &amp; Station</th>
                      <th className="py-2.5 px-3">Zone / Feeder</th>
                      <th className="py-2.5 px-3 text-right">Baseline</th>
                      <th className="py-2.5 px-3 text-right">Simulated Load</th>
                      <th className="py-2.5 px-3 text-right">Thermal Rise</th>
                      <th className="py-2.5 px-3 text-right">Failure Prob</th>
                      <th className="py-2.5 px-3 text-right">Action State</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md">
                    {[
                      {
                        id: 'MB-042',
                        station: 'Shanti Park Stn-4',
                        zone: 'Mira Rd East • Feeder 4A',
                        base: 91.4,
                        sim: +(91.4 * stressMultiplier).toFixed(1),
                        temp: +(84.2 + tempShift * 1.4).toFixed(1),
                        prob: 99.4,
                        state: 'Critical Trip',
                      },
                      {
                        id: 'MB-118',
                        station: 'Kashimira MIDC Sub',
                        zone: 'Kashimira • Feeder 9',
                        base: 88.2,
                        sim: +(88.2 * stressMultiplier).toFixed(1),
                        temp: +(79.1 + tempShift * 1.3).toFixed(1),
                        prob: 96.8,
                        state: 'Overload',
                      },
                      {
                        id: 'MB-009',
                        station: 'APMC Market Terminal',
                        zone: 'Mira Rd East • Feeder 2',
                        base: 86.7,
                        sim: +(86.7 * stressMultiplier).toFixed(1),
                        temp: +(81.0 + tempShift * 1.2).toFixed(1),
                        prob: 91.2,
                        state: 'Overload',
                      },
                    ].map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => onNavigate('transformer-detail', row.id)}
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-telemetry-data font-bold text-on-surface">{row.id}</span>
                            <span className="font-label-sm text-label-sm text-outline">{row.station}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-body-sm text-body-sm text-on-surface-variant">{row.zone}</td>
                        <td className="py-2.5 px-3 text-right font-telemetry-data text-outline">{row.base}%</td>
                        <td className="py-2.5 px-3 text-right font-telemetry-data font-bold text-error">
                          {row.sim}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-telemetry-data font-bold text-error">
                          {row.temp}°C
                        </td>
                        <td className="py-2.5 px-3 text-right font-telemetry-data font-bold text-error">
                          {row.prob}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-label-sm text-label-sm text-error uppercase font-bold">
                          {row.state}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. AI SCENARIO EXPLANATION & DECISION SUPPORT PANEL */}
            <div className="bg-primary-container text-surface p-space-lg rounded-xl shadow-md flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-tertiary-fixed text-[24px]">psychology</span>
                  <div>
                    <span className="font-headline-sm text-headline-sm text-surface font-bold">
                      AI Decision Support Diagnostics
                    </span>
                    <p className="font-telemetry-data text-label-sm text-primary-fixed-dim">
                      Engine: GridSim-XGB • Confidence 94.2%
                    </p>
                  </div>
                </div>
                <span className="font-telemetry-data text-label-sm text-tertiary-fixed font-semibold tracking-wide uppercase">
                  Simulated Advisory
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-1">
                <div className="bg-primary/40 p-space-md rounded flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-tertiary-fixed uppercase font-semibold">
                    What Changed in This Scenario?
                  </span>
                  <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                    Under a <strong className="text-surface font-bold">+{demandChange}% load surge</strong> combined with{' '}
                    <strong className="text-surface font-bold">+{tempShift}°C ambient rise</strong> and {outageAsset} bus-shedding, secondary loops in Mira Road East reach{' '}
                    <span className="text-tertiary-fixed font-semibold">{simFleetLoad}%</span> average load.
                  </p>
                </div>
                <div className="bg-primary/40 p-space-md rounded flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-tertiary-fixed uppercase font-semibold">
                    Recommended Pre-Event Staging
                  </span>
                  <p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
                    Pre-switch Feeder 4A municipal street lighting to alternate Feeder 12B and mobilize mobile forced-air blower trailers to Sector 8 substation vaults prior to 18:00 IST.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
