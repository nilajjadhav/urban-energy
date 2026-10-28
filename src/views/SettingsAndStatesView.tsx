import React, { useState } from 'react';
import { ASSETS, NavTabId } from '../data/gridData';
import { OperatorAvatar } from '../components/BrandLogo';

interface SettingsAndStatesViewProps {
  initialTab?: 'profile' | 'notifications' | 'thresholds' | 'system' | 'security' | 'edge-states';
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (msg: string) => void;
  onSignOut: () => void | Promise<void>;
}

export const SettingsAndStatesView: React.FC<SettingsAndStatesViewProps> = ({
  initialTab = 'profile',
  onNavigate,
  onShowToast,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [thermalWarn, setThermalWarn] = useState(75.0);
  const [thermalTrip, setThermalTrip] = useState(82.0);
  const [thermalCrit, setThermalCrit] = useState(88.0);
  const [feederWarn, setFeederWarn] = useState(80);
  const [feederTrip, setFeederTrip] = useState(92);
  const [timeoutSec, setTimeoutSec] = useState(15);

  const resetThresholds = () => {
    setThermalWarn(75.0);
    setThermalTrip(82.0);
    setThermalCrit(88.0);
    setFeederWarn(80);
    setFeederTrip(92);
    setTimeoutSec(15);
    onShowToast('Demo only: local threshold inputs were reset; no device parameters were changed.');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-gutter-desktop max-w-[1720px] mx-auto w-full space-y-space-lg">
        <div className="ui-card flex items-start gap-3 border-l-4 border-warning px-4 py-3 text-sm" role="note">
          <span className="material-symbols-outlined text-warning">info</span>
          <div><strong>Local prototype settings.</strong> Threshold fields and notification controls are held in this page's UI state. Save Preview displays a confirmation only; values are not persisted to Supabase or a device configuration.</div>
        </div>
        {/* Top System Architecture Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Settings &amp; Parameters
              </span>
              <span className="font-telemetry-data text-label-sm text-on-surface-variant uppercase">
                · IEC 60870-5-104
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Configure regional grid parameters, telemetry ingestion, alert thresholds, security protocols, and SCADA edge state fallbacks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-md">
            <button
              onClick={() => onShowToast('Demo only: settings remain local to this page and were not saved.')}
              className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary-container text-surface hover:bg-primary transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">save</span>
              <span className="font-label-md text-label-md">Save Preview (Local Only)</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Layout with Vertical Tabs */}
        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12 lg:gap-space-xl">
          {/* Operational Navigation Sub-rail */}
          <div className="lg:col-span-3 flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-xl shadow-sm lg:sticky lg:top-20">
            <span className="font-label-sm text-label-sm uppercase text-outline px-space-md py-space-xs tracking-wider">
              Navigation Context
            </span>
            {(
              [
                { id: 'profile', label: 'Profile & Duty', icon: 'badge' },
                { id: 'notifications', label: 'Alarm Routing', icon: 'cell_tower' },
                { id: 'thresholds', label: 'Alert Thresholds', icon: 'tune' },
                { id: 'system', label: 'Inference Engine', icon: 'memory' },
                { id: 'security', label: 'Security & Audit', icon: 'shield' },
                { id: 'edge-states', label: 'System States (HUD 04)', icon: 'developer_board' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-primary-container text-surface'
                    : 'hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-space-sm">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      activeTab === item.id ? 'text-tertiary-fixed' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-lg text-label-lg">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            ))}

            <div className="mt-space-md p-space-md bg-surface-container-low rounded-lg flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Grid Node Telemetry
              </span>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant">SCADA Heartbeat</span>
                <span className="font-telemetry-data text-label-sm font-semibold text-secondary">0.04s latency</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Sync Target</span>
                <span className="font-telemetry-data text-label-sm text-on-surface">SLDC Kalwa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Active Zone Scope</span>
                <span className="font-telemetry-data text-label-sm font-bold text-on-surface">MBMC Z1-Z6</span>
              </div>
            </div>
          </div>

          {/* Tab Content Panels */}
          <div className="lg:col-span-9 flex flex-col gap-space-lg">
            {/* TAB 1: PROFILE & DUTY */}
            {activeTab === 'profile' && (
              <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <OperatorAvatar className="w-16 h-16" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-headline-md text-headline-md text-on-surface font-bold">
                          R. Deshmukh
                        </span>
                        <span className="font-telemetry-data text-label-sm text-on-tertiary-container uppercase font-bold">
                          · Shift Active
                        </span>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        Senior Field Dispatch &amp; Grid Reliability Engineer
                      </span>
                      <span className="font-telemetry-data text-label-sm text-outline">
                        ENG-ID: MBMC-TX-8842-D
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <button
                      onClick={() => { void onSignOut(); }}
                      className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-outline uppercase">Official Dispatch Mail</span>
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry-data text-body-md font-medium text-on-surface">
                        r.deshmukh@mb-energy.gov.in
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">verified</span>
                    </div>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-outline uppercase">Jurisdiction / Corridor</span>
                    <span className="font-body-md text-body-md font-medium text-on-surface">
                      Mira-Bhayandar Municipal Operational Corridor (Zones 1-6)
                    </span>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Duty Roster &amp; Assignment
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-body-md text-body-md font-medium text-on-surface">
                        Shift 1 (06:00 - 18:00 IST) Active
                      </span>
                      <span className="font-telemetry-data text-label-sm text-secondary font-bold">
                        5h 22m remaining
                      </span>
                    </div>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Field Station Assignment
                    </span>
                    <span className="font-body-md text-body-md font-medium text-on-surface">
                      Station 4 Dispatch Hub (Mira Road East)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Regional Dispatch Geographic Anchor
                    </span>
                    <span className="font-telemetry-data text-label-sm text-on-surface-variant">
                      19.2812° N, 72.8561° E • Western Railway Line Corridor
                    </span>
                  </div>
                  <div
                    className="w-full h-44 rounded-lg bg-cover bg-center overflow-hidden relative shadow-inner"
                    style={{ backgroundImage: `url('${ASSETS.gisMapBg}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-primary-container/90 backdrop-blur-md px-space-md py-1 rounded flex items-center gap-space-sm text-surface">
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping" />
                      <span className="font-label-md text-label-md">
                        Station 4 Dispatch Hub • 3 Feeders Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ALARM ROUTING */}
            {activeTab === 'notifications' && (
              <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-headline-md text-headline-md text-on-surface">
                    Multi-Channel Alarm Routing Matrix
                  </span>
                  <p className="font-body-md text-body-sm text-on-surface-variant">
                    Deterministic routing ensures life-safety breaches propagate instantly through hardware control room annunciators and mobile escalation channels.
                  </p>
                </div>

                <div className="flex flex-col gap-space-md">
                  {[
                    {
                      title: 'Critical SCADA Breaches',
                      sub: '>95% LOAD / >85°C OIL',
                      desc: 'Immediate thermal runaway or primary circuit trip risk.',
                      channels: ['SMS Gateway', 'Room Buzzer', 'Mobile Push'],
                    },
                    {
                      title: 'High-Risk Predictive Anomaly',
                      sub: 'XGBOOST >75% 4H PROB',
                      desc: 'Statistical degradation model predicts transformer winding insulation degradation.',
                      channels: ['SMS Gateway', 'Email Digest', 'Mobile Push'],
                    },
                    {
                      title: 'Forecast & Meteorological Warnings',
                      sub: 'IMD MONSOON / HEATWAVE',
                      desc: 'Severe precipitation or extreme ambient peak cooling demand.',
                      channels: ['Email Digest', 'Console Banner'],
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-space-lg rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md"
                    >
                      <div className="flex flex-col gap-1 max-w-xl">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {item.title}
                          </span>
                          <span className="font-telemetry-data text-label-sm text-secondary font-bold">
                            · {item.sub}
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</span>
                      </div>
                      <div className="flex items-center gap-space-sm flex-wrap">
                        {item.channels.map((ch) => (
                          <label
                            key={ch}
                            className="flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest cursor-pointer shadow-sm"
                          >
                            <input
                              defaultChecked
                              onChange={() => onShowToast(`Demo only: ${ch} routing changed locally; it was not saved.`)}
                              className="w-4 h-4 rounded text-primary focus:ring-0"
                              type="checkbox"
                            />
                            <span className="font-label-md text-label-md text-on-surface">{ch}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ALERT THRESHOLDS */}
            {activeTab === 'thresholds' && (
              <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex flex-col">
                    <span className="font-headline-md text-headline-md text-on-surface">
                      Parametric SCADA Alert Thresholds
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Real-time tripping matrices governing auto-curtailment and operator alert cues.
                    </span>
                  </div>
                  <button
                    onClick={resetThresholds}
                    className="px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    Reset Parametric Set
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-label-lg text-label-lg text-on-surface">Thermal Warning Threshold</span>
                      <span className="font-telemetry-kpi text-telemetry-kpi text-secondary font-bold">
                        {thermalWarn.toFixed(1)}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="85"
                      step="0.5"
                      value={thermalWarn}
                      onChange={(e) => setThermalWarn(Number(e.target.value))}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>

                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-label-lg text-label-lg text-on-surface">
                        Thermal High-Risk Trip Warning
                      </span>
                      <span className="font-telemetry-kpi text-telemetry-kpi text-primary font-bold">
                        {thermalTrip.toFixed(1)}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="75"
                      max="95"
                      step="0.5"
                      value={thermalTrip}
                      onChange={(e) => setThermalTrip(Number(e.target.value))}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-label-lg text-label-lg text-on-surface">Critical Thermal Limit</span>
                      <span className="font-telemetry-kpi text-telemetry-kpi text-error font-bold">
                        {thermalCrit.toFixed(1)}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="100"
                      step="0.5"
                      value={thermalCrit}
                      onChange={(e) => setThermalCrit(Number(e.target.value))}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-error"
                    />
                  </div>

                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-label-lg text-label-lg text-on-surface">Feeder Load Warning</span>
                      <span className="font-telemetry-kpi text-telemetry-kpi text-secondary font-bold">
                        {feederWarn}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="90"
                      step="1"
                      value={feederWarn}
                      onChange={(e) => setFeederWarn(Number(e.target.value))}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>

                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-label-lg text-label-lg text-on-surface">Feeder Overload Trip Risk</span>
                      <span className="font-telemetry-kpi text-telemetry-kpi text-error font-bold">{feederTrip}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="98"
                      step="1"
                      value={feederTrip}
                      onChange={(e) => setFeederTrip(Number(e.target.value))}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-error"
                    />
                  </div>

                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-label-lg text-label-lg text-on-surface">Telemetry Latency Timeout</span>
                      <span className="font-telemetry-kpi text-telemetry-kpi text-on-surface font-bold">
                        {timeoutSec}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="1"
                      value={timeoutSec}
                      onChange={(e) => setTimeoutSec(Number(e.target.value))}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: INFERENCE ENGINE */}
            {activeTab === 'system' && (
              <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-headline-md text-headline-md text-on-surface">
                    Inference Pipeline &amp; Ingestion Config
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Controls state estimation frequency, spatial-temporal forecast models, and RTU communication cadence across the distribution nodes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col justify-between gap-space-md">
                    <span className="font-label-lg text-label-lg text-on-surface">
                      ML Inference Refresh Frequency
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry-data text-headline-sm font-bold text-on-surface">
                        Every 30 seconds
                      </span>
                      <span className="font-telemetry-data text-label-sm text-secondary font-semibold">
                        GPU Cluster #2
                      </span>
                    </div>
                  </div>
                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col justify-between gap-space-md">
                    <span className="font-label-lg text-label-lg text-on-surface">SCADA Telemetry Polling Rate</span>
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry-data text-headline-sm font-bold text-on-surface">
                        5 seconds
                      </span>
                      <span className="font-telemetry-data text-label-sm text-on-tertiary-container font-semibold">
                        Loss &lt; 0.01%
                      </span>
                    </div>
                  </div>
                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col justify-between gap-space-md">
                    <span className="font-label-lg text-label-lg text-on-surface">
                      Load Forecast Prediction Horizon
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry-data text-headline-sm font-bold text-on-surface">
                        14 Days Ahead
                      </span>
                      <span className="font-telemetry-data text-label-sm text-on-surface">1-Hour Bins</span>
                    </div>
                  </div>
                  <div className="p-space-lg bg-surface-container-low rounded-xl flex flex-col justify-between gap-space-md">
                    <span className="font-label-lg text-label-lg text-on-surface">
                      Contingency Simulator Default Model
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry-data text-headline-sm font-bold text-on-surface">
                        IEEE 33-Bus
                      </span>
                      <span className="font-telemetry-data text-label-sm text-on-surface">IEC 60076 Thermal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY & AUDIT */}
            {activeTab === 'security' && (
              <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-headline-md text-headline-md text-on-surface">
                    Security, SCADA Hardening &amp; Compliance
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Enforces operational perimeter boundaries, cryptographic signatures on control directives, and statutory regulatory compliance.
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden bg-surface-container-low shadow-inner">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container font-label-md text-label-md text-outline uppercase tracking-wider">
                        <th className="py-2.5 px-space-md">Timestamp (IST)</th>
                        <th className="py-2.5 px-space-md">Operator ID</th>
                        <th className="py-2.5 px-space-md">Substation / Target</th>
                        <th className="py-2.5 px-space-md">Action Directive</th>
                        <th className="py-2.5 px-space-md text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="font-telemetry-data text-label-md text-on-surface">
                      <tr className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-2.5 px-space-md text-on-surface-variant">11:42:09 IST</td>
                        <td className="py-2.5 px-space-md font-semibold">R. Deshmukh</td>
                        <td className="py-2.5 px-space-md">Feeder-04 Mira Rd</td>
                        <td className="py-2.5 px-space-md">Bus-Tie Switch Arming Check</td>
                        <td className="py-2.5 px-space-md text-right text-on-tertiary-container font-bold">VERIFIED</td>
                      </tr>
                      <tr className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-2.5 px-space-md text-on-surface-variant">10:15:32 IST</td>
                        <td className="py-2.5 px-space-md font-semibold">System Daemon</td>
                        <td className="py-2.5 px-space-md">TX-102 Step-Down</td>
                        <td className="py-2.5 px-space-md">Thermal Sensor Re-calibration</td>
                        <td className="py-2.5 px-space-md text-right text-secondary font-bold">OK</td>
                      </tr>
                      <tr className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-2.5 px-space-md text-on-surface-variant">08:00:04 IST</td>
                        <td className="py-2.5 px-space-md font-semibold">R. Deshmukh</td>
                        <td className="py-2.5 px-space-md">Console Session #812</td>
                        <td className="py-2.5 px-space-md">Shift Login (FIPS YubiKey Authenticated)</td>
                        <td className="py-2.5 px-space-md text-right text-on-tertiary-container font-bold">
                          AUTH_GRANTED
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: SYSTEM STATES & OPERATIONAL EDGE CASES WORKBENCH (HUD 04) */}
            {activeTab === 'edge-states' && (
              <div className="flex flex-col gap-space-lg">
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">developer_board</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      System States &amp; Operational Edge Cases (HUD 04)
                    </h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Standardized telemetry fallback containers, offline buffering behaviors, empty queues, and critical gateway timeout representations tailored for SCADA control room operators.
                  </p>
                </div>

                {/* 4-Quadrant Edge Cases Workbench Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-desktop">
                  {/* STATE 1: LOADING STATE */}
                  <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md p-space-lg">
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[20px]">sync</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          Loading State — Substation Telemetry
                        </span>
                      </div>
                      <span className="font-telemetry-data text-label-sm text-secondary animate-pulse">
                        STREAMING...
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-space-sm mb-space-md">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-2">
                          <div className="h-3 w-16 bg-surface-container rounded animate-pulse" />
                          <div className="h-7 w-20 bg-surface-container-highest rounded animate-pulse" />
                          <div className="h-2.5 w-12 bg-surface-container rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                    <div className="bg-surface-container-low p-space-md rounded-lg mb-space-md flex flex-col gap-space-sm">
                      <div className="h-16 w-full flex items-end gap-1.5 pt-4">
                        {[6, 10, 8, 14, 11, 9, 16, 12].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h * 4}px` }}
                            className="flex-1 bg-surface-container-highest rounded-t animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between text-outline font-telemetry-data text-label-sm">
                      <span>Target: Mira-Bhayandar Cluster 07</span>
                      <span>Awaiting RTU Packet...</span>
                    </div>
                  </div>

                  {/* STATE 2: EMPTY STATE */}
                  <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md p-space-lg">
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">verified</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          Empty State — Active Critical Incidents
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-tertiary-container">HEALTHY GRID</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-space-lg bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-[36px] text-tertiary-fixed-dim mb-2">
                        shield_with_heart
                      </span>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                        Zero Grid Disruptions Detected
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-md">
                        No critical alerts found. All 200 monitored transformers across Mira-Bhayandar are operating within nominal thermal and voltage envelopes.
                      </p>
                      <button
                        onClick={() => onShowToast('Demo only: no diagnostic sweep was run.')}
                        className="px-4 py-2 rounded bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                      >
                        Demo: Preview Anomaly Diagnostic
                      </button>
                    </div>
                  </div>

                  {/* STATE 3: ERROR STATE */}
                  <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md p-space-lg">
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-error text-[20px]">cloud_off</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          Error State — SCADA RTU Stream Interrupted
                        </span>
                      </div>
                      <span className="font-telemetry-data text-label-sm text-error">ERR_SCADA_504</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-space-lg bg-error-container/20 rounded-xl">
                      <span className="material-symbols-outlined text-[36px] text-error mb-2">warning_amber</span>
                      <h4 className="font-headline-sm text-headline-sm text-on-error-container font-bold mb-1">
                        Telemetry Feed Disconnected
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-md">
                        Unable to load real-time telemetry from <strong>Kashimira Sector C</strong>. Remote Terminal Unit communication timed out (504 Gateway Timeout).
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onShowToast('Demo only: SCADA retry is not connected; no handshake was attempted.')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded bg-error text-on-error hover:bg-error/90 font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">sync</span>
                          <span>Demo: Retry SCADA Sync</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* STATE 4: NO DATA STATE */}
                  <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md p-space-lg">
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[20px]">database</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          No Data State — Historical Query
                        </span>
                      </div>
                      <span className="font-telemetry-data text-label-sm text-on-surface-variant">
                        0 RECORDS RETURNED
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-space-lg bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-[36px] text-outline mb-2">query_stats</span>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                        No Telemetry Records Found
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-md">
                        No historical telemetry records found for <strong>Feeder 12B</strong> in the selected 15-minute sampling interval due to planned maintenance.
                      </p>
                      <button
                        onClick={() => onNavigate('historical-data')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        <span>Expand Date Range</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
