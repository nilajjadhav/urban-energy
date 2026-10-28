import React, { useState } from 'react';
import { NavTabId, TransformerNode } from '../data/gridData';
import { OperatorAvatar } from './BrandLogo';

interface NotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTabId, assetId?: string) => void;
  onShowToast: (msg: string) => void;
}

export const NotificationsFlyout: React.FC<NotificationsFlyoutProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onShowToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warnings' | 'system'>('all');
  const [unreadCount, setUnreadCount] = useState(3);

  if (!isOpen) return null;

  return (
    <>
      <div className="ui-overlay-backdrop fixed inset-0 z-40" onClick={onClose} />
      <div className="ui-overlay-panel fixed top-[4.75rem] right-3 z-50 w-[480px] max-w-[calc(100vw-1.5rem)] overflow-hidden bg-surface-container-lowest sm:right-6">
        <div className="bg-primary text-on-primary px-space-lg py-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary-fixed text-[20px]">notifications_active</span>
            <span className="font-headline-sm text-headline-sm text-on-primary tracking-tight">
              Prototype Notifications
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded font-telemetry-data text-label-sm bg-error text-on-error">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setUnreadCount(0);
              onShowToast('Demo only: notification read state was cleared locally.');
            }}
            className="font-label-md text-label-md text-secondary-fixed hover:text-white transition-colors cursor-pointer"
          >
            Demo: Mark all as read
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between px-space-lg py-2 bg-surface-container-low">
          <div className="flex items-center gap-1">
            {(['all', 'critical', 'warnings', 'system'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 rounded font-label-md text-label-md capitalize transition-colors cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="font-telemetry-data text-label-sm text-outline">42ms</span>
        </div>

        {/* Stream */}
        <div className="max-h-[400px] overflow-y-auto flex flex-col">
          {(activeFilter === 'all' || activeFilter === 'critical') && (
            <div className="p-space-md bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex gap-space-md border-b border-surface-container">
              <div className="mt-1 shrink-0">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-space-sm mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-error-container text-on-error-container uppercase">
                      CRITICAL
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                      MB-042 Predicted Overload Breach
                    </span>
                  </div>
                  <span className="font-telemetry-data text-label-sm text-outline-variant shrink-0">12m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                  Core oil temperature reached <span className="font-telemetry-data font-semibold text-error">84.2°C</span> with sustained load &gt;91%. ML failure probability:{' '}
                  <span className="font-telemetry-data font-semibold text-error">87.4%</span>.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onShowToast('Demo only: notification count changed locally; alert status was not updated.');
                      setUnreadCount((c) => Math.max(0, c - 1));
                    }}
                    className="px-3 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                  >
                    Demo: Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('transformer-detail', 'MB-042');
                      onClose();
                    }}
                    className="px-3 py-1 rounded bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-md text-label-md transition-colors cursor-pointer"
                  >
                    View Unit MB-042
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeFilter === 'all' || activeFilter === 'warnings') && (
            <div className="p-space-md bg-surface-container-low/50 hover:bg-surface-container-low transition-colors flex gap-space-md border-b border-surface-container">
              <div className="mt-1 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-space-sm mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed-variant uppercase">
                      HIGH RISK
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                      MB-118 Temperature Rising Rapidly
                    </span>
                  </div>
                  <span className="font-telemetry-data text-label-sm text-outline-variant shrink-0">34m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                  <span className="font-telemetry-data font-medium text-secondary">+3.8°C/hr</span> thermal gradient detected at Kashimira MIDC Substation.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onShowToast('Demo only: no cooling equipment was triggered.')}
                    className="px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors cursor-pointer"
                  >
                    Demo: Preview Cooling Action
                  </button>
                  <span className="font-telemetry-data text-label-sm text-outline">Feeder MIDC-1</span>
                </div>
              </div>
            </div>
          )}

          {(activeFilter === 'all' || activeFilter === 'warnings') && (
            <div className="p-space-md bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex gap-space-md border-b border-surface-container">
              <div className="mt-1 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-space-sm mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-tertiary-fixed/30 text-on-tertiary-fixed uppercase">
                      FORECAST
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                      Ganesh Chaturthi Peak Influx Tomorrow
                    </span>
                  </div>
                  <span className="font-telemetry-data text-label-sm text-outline-variant shrink-0">1h ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Model predicts <span className="font-telemetry-data font-semibold text-secondary">+28.5 MW</span> evening illumination surge on Feeder 4A across Mira Road East.
                </p>
              </div>
            </div>
          )}

          {(activeFilter === 'all' || activeFilter === 'system') && (
            <div className="p-space-md bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex gap-space-md opacity-85">
              <div className="mt-1 shrink-0">
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">check_circle</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-space-sm mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-surface-container-highest text-on-surface-variant uppercase">
                      SYSTEM
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                      SCADA Telemetry RTU Sync Completed
                    </span>
                  </div>
                  <span className="font-telemetry-data text-label-sm text-outline-variant shrink-0">3h ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  All 200 grid nodes reporting synchronized packet envelopes within nominal 42ms round-trip latency.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container text-center">
          <button
            onClick={() => {
              onNavigate('alerts');
              onClose();
            }}
            className="inline-flex items-center gap-1 font-label-lg text-label-lg text-secondary hover:text-on-secondary-fixed-variant transition-colors font-semibold cursor-pointer"
          >
            <span>View All Operational Alerts in Alerts Center</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </>
  );
};

interface ProfileFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTabId) => void;
  onSignOut: () => void | Promise<void>;
}

export const ProfileFlyout: React.FC<ProfileFlyoutProps> = ({ isOpen, onClose, onNavigate, onSignOut }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="ui-overlay-backdrop fixed inset-0 z-40" onClick={onClose} />
      <div className="ui-overlay-panel fixed top-[4.75rem] right-3 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden bg-surface-container-lowest sm:right-6">
        <div className="p-space-lg bg-primary text-on-primary">
          <div className="flex items-start gap-space-md">
            <div className="relative">
              <OperatorAvatar className="w-12 h-12" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary-fixed ring-2 ring-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-headline-md text-headline-md text-on-primary font-bold truncate">R. Deshmukh</h3>
                <span className="px-2 py-0.5 rounded font-telemetry-data text-label-sm bg-tertiary-container text-tertiary-fixed shrink-0">
                  SHIFT 1 ON-DUTY
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-primary-container truncate mt-0.5">
                Field Engineer • ID: ENG-MB-4029
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 font-telemetry-data text-label-sm text-outline-variant">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                <span className="truncate">r.deshmukh@mb-energy.gov.in</span>
              </div>
            </div>
          </div>
          <div className="mt-space-md p-space-sm rounded-lg bg-primary-container flex items-center justify-between font-telemetry-data text-label-sm">
            <div className="flex items-center gap-1.5 text-on-primary">
              <span className="material-symbols-outlined text-secondary-fixed text-[16px]">verified_user</span>
              <span>Clearance: Level 4 Dispatch</span>
            </div>
            <span className="text-tertiary-fixed font-semibold">Valid 06:00 - 18:00</span>
          </div>
        </div>

        <div className="py-space-xs flex flex-col">
          <button
            onClick={() => {
              onNavigate('settings');
              onClose();
            }}
            className="flex items-center justify-between px-space-lg py-2.5 hover:bg-surface-container-low transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-[20px] text-secondary">badge</span>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface">Profile &amp; Credentials</span>
                <span className="font-body-sm text-body-sm text-outline">Certification valid till Dec 2026</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
          </button>
          <button
            onClick={() => {
              onNavigate('system-states');
              onClose();
            }}
            className="flex items-center justify-between px-space-lg py-2.5 hover:bg-surface-container-low transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-[20px] text-secondary">layers</span>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface">System Overlays &amp; Edge States</span>
                <span className="font-body-sm text-body-sm text-outline">Inspect SCADA HUD 04 &amp; Fallbacks</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
          </button>
          <button
            onClick={() => {
              onNavigate('settings');
              onClose();
            }}
            className="flex items-center justify-between px-space-lg py-2.5 hover:bg-surface-container-low transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-[20px] text-secondary">key</span>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface">Security &amp; MFA Hardware Key</span>
                <span className="font-body-sm text-body-sm text-outline">Yubikey 5 NFC (Active)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded font-label-sm text-label-sm bg-surface-container-high text-on-surface">
              HARDWARE
            </span>
          </button>

          <div className="h-px bg-surface-container mx-space-lg my-1.5" />
          <div className="px-space-lg py-space-sm flex items-center justify-between bg-surface-container-lowest">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-outline">Next Reliever</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">S. Kulkarni (ID: 3822)</span>
            </div>
            <button
              onClick={() => {
                void onSignOut();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out &amp; Handover</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

interface DispatchModalProps {
  isOpen: boolean;
  assetId: string;
  vanName: string;
  zone: string;
  onClose: () => void;
  onConfirm: (assetId: string, van: string, priority: string, notes: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  assetId,
  vanName,
  zone,
  onClose,
  onConfirm,
}) => {
  const [selectedVan, setSelectedVan] = useState(vanName || 'Field Van #03');
  const [priority, setPriority] = useState<'Code Red' | 'Urgent' | 'Standard'>('Code Red');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="ui-overlay-backdrop fixed inset-0 z-50 flex items-center justify-center p-space-md">
      <div className="ui-overlay-panel flex w-full max-w-lg flex-col gap-space-md bg-surface-container-lowest p-space-lg">
        <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">local_shipping</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Emergency Field Crew Dispatch
              </h3>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                SOP Protocol 4-A Immediate Triage
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-space-sm font-body-sm text-body-sm">
          <div role="note" className="rounded-lg border border-warning/30 bg-warning-container px-3 py-2 text-on-warning-container">
            Prototype dispatch form: confirming only closes this dialog. No crew is contacted and no work order is created.
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
              Target Asset &amp; Location
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {assetId} — {zone}
            </span>
            <span className="text-on-surface-variant font-telemetry-data text-label-sm">
              Mira-Bhayandar Municipal Distribution Feeder Corridor
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">Assigned Unit</label>
            <select
              value={selectedVan}
              onChange={(e) => setSelectedVan(e.target.value)}
              className="w-full h-9 px-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none"
            >
              <option value="Field Van #03">Field Van #03 (Heavy Duty Line Crew) — ETA 6 min</option>
              <option value="Field Van #01">Field Van #01 (Harmonic &amp; Power Quality Diagnostic) — ETA 11 min</option>
              <option value="Field Van #02">Field Van #02 (Substation Auxiliary Crew) — ETA 14 min</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">Dispatch Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Code Red', 'Urgent', 'Standard'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 rounded-lg font-label-sm text-label-sm font-bold uppercase text-center transition-colors cursor-pointer ${
                    priority === p
                      ? p === 'Code Red'
                        ? 'bg-error-container text-on-error-container border-2 border-error'
                        : 'bg-secondary-fixed text-on-secondary-fixed-variant border-2 border-secondary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">
              Operator Instructions / Gate Pass
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none"
              placeholder="Verify core oil temperature and prepare portable radiator blower..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-space-xs pt-space-xs border-t border-surface-container">
          <button
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(assetId, selectedVan, priority, notes)}
            className="px-space-lg py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">send</span>
            <span>Confirm Demo Only</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformers: TransformerNode[];
  onNavigate: (tab: NavTabId, assetId?: string) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  transformers,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredTx = transformers.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.zone.toLowerCase().includes(query.toLowerCase()) ||
      t.feeder.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="ui-overlay-backdrop fixed inset-0 z-50 flex items-start justify-center px-space-md pt-20 pb-space-md">
      <div className="ui-overlay-panel w-full max-w-xl overflow-hidden bg-surface-container-lowest">
        <div className="p-space-md border-b border-surface-container flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">search</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to transformer (e.g. MB-042), zone, feeder, or console module..."
            className="flex-1 bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
          />
          <button
            onClick={onClose}
            className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-telemetry-data text-label-sm cursor-pointer"
          >
            ESC
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-space-sm flex flex-col gap-1">
          <span className="px-space-sm py-1 font-label-sm text-label-sm uppercase text-outline">
            Monitored Transformers ({filteredTx.length})
          </span>
          {filteredTx.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onNavigate('transformer-detail', t.id);
                onClose();
              }}
              className="flex items-center justify-between px-space-md py-2 rounded-lg hover:bg-surface-container-low transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-telemetry-data font-bold text-on-surface">{t.id}</span>
                <span className="text-on-surface-variant text-body-sm">{t.name}</span>
                <span className="text-outline text-label-sm">• {t.zone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-telemetry-data text-label-sm font-bold ${
                    t.loadRatio >= 90 ? 'text-error' : t.loadRatio >= 80 ? 'text-secondary' : 'text-on-surface'
                  }`}
                >
                  {t.loadRatio}% Load
                </span>
                <span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
