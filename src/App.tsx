/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_REPORTS,
  INITIAL_TRANSFORMERS,
  NavTabId,
  ReportRecord,
  TransformerNode,
} from './data/gridData';
import { BrandLogo, OperatorAvatar } from './components/BrandLogo';
import { AskAiDrawer } from './components/AskAiDrawer';
import {
  CommandSearchModal,
  DispatchModal,
  NotificationsFlyout,
  ProfileFlyout,
} from './components/HeaderOverlays';
import { OverviewView } from './views/OverviewView';
import { LiveGridView } from './views/LiveGridView';
import { TransformersView } from './views/TransformersView';
import { PredictionsView } from './views/PredictionsView';
import { AlertsView } from './views/AlertsView';
import { HistoricalDataView } from './views/HistoricalDataView';
import { EventsForecastsView } from './views/EventsForecastsView';
import { WhatIfSimulatorView } from './views/WhatIfSimulatorView';
import { ZoneIntelligenceView } from './views/ZoneIntelligenceView';
import { ReportsView } from './views/ReportsView';
import { SettingsAndStatesView } from './views/SettingsAndStatesView';
import { LoginView } from './views/LoginView';
import { supabase } from './lib/supabase';
import { useAlerts } from './hooks/useAlerts';

interface ToastItem {
  id: string;
  message: string;
  isError?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [selectedTransformerId, setSelectedTransformerId] = useState<string | null>(null);
  const [transformers] = useState<TransformerNode[]>(INITIAL_TRANSFORMERS);
  const [reports, setReports] = useState<ReportRecord[]>(INITIAL_REPORTS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const alertData = useAlerts(isAuthReady && isAuthenticated);

  // Overlays & Modals
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [dispatchModal, setDispatchModal] = useState<{
    isOpen: boolean;
    assetId: string;
    vanName: string;
    zone: string;
  }>({
    isOpen: false,
    assetId: 'MB-042',
    vanName: 'Field Van #03',
    zone: 'Mira Road East',
  });

  // Live IST Clock
  const [istTime, setIstTime] = useState('14:38:05');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setIsAuthReady(true);
    });

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!error) setIsAuthenticated(Boolean(data.session));
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsAuthReady(true));

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setIstTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K for global search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = (message: string, isError = false) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, message, isError }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleNavigate = (tab: NavTabId, assetId?: string) => {
    setIsMobileNavOpen(false);
    if (tab === 'transformer-detail') {
      setActiveTab('transformers');
      setSelectedTransformerId(assetId || 'MB-042');
    } else if (tab === 'system-states') {
      setActiveTab('system-states');
      setSelectedTransformerId(null);
    } else {
      setActiveTab(tab);
      if (tab === 'what-if-simulator' && assetId) {
        setSelectedTransformerId(assetId);
      } else if (tab !== 'transformers') {
        setSelectedTransformerId(null);
      } else if (!assetId) {
        setSelectedTransformerId(null);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDispatch = (assetId: string, vanName: string, zone: string) => {
    setDispatchModal({
      isOpen: true,
      assetId,
      vanName,
      zone,
    });
  };

  const handleConfirmDispatch = (assetId: string, van: string, priority: string) => {
    setDispatchModal((prev) => ({ ...prev, isOpen: false }));
    showToast(`Prototype only: dispatch for ${assetId} (${priority}) was not sent and no work order was created.`);
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const updated = await alertData.setStatus(id, 'acknowledged');
      showToast(updated.source === 'demo'
        ? 'Demo alert acknowledged locally; no Supabase record was changed.'
        : updated.statusPersistence === 'local'
          ? 'Alert acknowledged and saved on this browser. Supabase did not confirm the update.'
          : 'Alert acknowledged and saved to Supabase.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to acknowledge alert.', true);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      const updated = await alertData.setStatus(id, 'resolved');
      showToast(updated.source === 'demo'
        ? 'Demo alert resolved locally; no Supabase record was changed.'
        : updated.statusPersistence === 'local'
          ? 'Alert resolved and saved on this browser. Supabase did not confirm the update.'
          : 'Alert resolved and saved to Supabase.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to resolve alert.', true);
    }
  };

  const handleAcknowledgeAllWarnings = async () => {
    const { savedToSupabase, savedLocally, failed } = await alertData.acknowledgeWarnings();
    const succeeded = savedToSupabase + savedLocally;
    if (failed > 0) showToast(`Acknowledged ${succeeded} warning alert(s): ${savedToSupabase} saved to Supabase, ${savedLocally} saved on this browser; ${failed} failed.`, true);
    else if (succeeded > 0) showToast(`Acknowledged ${succeeded} warning alert(s): ${savedToSupabase} saved to Supabase, ${savedLocally} saved on this browser.`);
    else showToast('No new warning alerts are available to acknowledge.');
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) showToast(error.message, true);
      else {
        setIsProfileOpen(false);
        showToast('Signed out successfully');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to sign out. Please try again.', true);
    }
  };

  if (!isAuthReady) return null;

  if (!isAuthenticated) {
    return (
      <LoginView
        onSignInSuccess={() => {
          setActiveTab('overview');
          showToast('Signed in to Mira-Bhayandar SCADA Gateway Terminal #MB-04');
        }}
      />
    );
  }

  const unacknowledgedCount = alertData.alerts.filter((alert) => alert.status === 'new').length;

  const monitoringLinks: { id: NavTabId; label: string; icon: string; badge?: number; pulse?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'live-grid', label: 'Live Grid', icon: 'grid_view', pulse: true },
    { id: 'transformers', label: 'Transformers', icon: 'electric_bolt' },
    { id: 'predictions', label: 'Predictions', icon: 'insights' },
    { id: 'alerts', label: 'Alerts', icon: 'warning', badge: unacknowledgedCount },
    { id: 'historical-data', label: 'Historical Data', icon: 'history' },
  ];

  const planningLinks: { id: NavTabId; label: string; icon: string }[] = [
    { id: 'events-forecasts', label: 'Events & Forecasts', icon: 'event' },
    { id: 'what-if-simulator', label: 'What-If Simulator', icon: 'precision_manufacturing' },
    { id: 'zone-intelligence', label: 'Zone Intelligence', icon: 'hub' },
    { id: 'reports', label: 'Reports', icon: 'description' },
  ];

  const systemLinks: { id: NavTabId; label: string; icon: string }[] = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'system-states', label: 'System States', icon: 'developer_board' },
  ];

  return (
    <div className="app-shell font-body-md text-on-surface antialiased">
      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-primary/45 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      {/* Left Sidebar Navigation */}
      <aside className={`app-sidebar fixed left-0 top-0 z-50 flex h-dvh flex-col justify-between select-none ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div
            onClick={() => handleNavigate('overview')}
            className="app-sidebar-brand flex items-center gap-space-sm cursor-pointer transition-colors hover:bg-white/5"
          >
            <BrandLogo className="h-8 w-8" />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-on-primary truncate tracking-tight">
                Urban Energy Intelligence
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container truncate uppercase">
                Grid Operations OS • Mira-Bhayandar
              </span>
            </div>
          </div>

          <div className="h-px bg-outline-variant/20 mx-space-md my-space-xs" />

          {/* Monitoring Section */}
          <div className="app-nav-group">
            <span className="app-nav-heading font-label-sm uppercase">
              Monitoring
            </span>
            <nav className="mt-space-xs flex flex-col gap-0.5">
              {monitoringLinks.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`app-nav-link flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'app-nav-link-active font-semibold'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span className="font-label-lg text-label-lg">{item.label}</span>
                    </div>
                    {item.pulse && <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse" />}
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded font-telemetry-data text-label-sm bg-secondary-fixed text-on-secondary-fixed-variant">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Planning Section */}
          <div className="app-nav-group">
            <span className="app-nav-heading font-label-sm uppercase">
              Planning
            </span>
            <nav className="mt-space-xs flex flex-col gap-0.5">
              {planningLinks.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`app-nav-link flex items-center gap-space-sm transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'app-nav-link-active font-semibold'
                        : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span className="font-label-lg text-label-lg">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Section */}
          <div className="app-nav-group">
            <span className="app-nav-heading font-label-sm uppercase">
              System
            </span>
            <nav className="mt-space-xs flex flex-col gap-0.5">
              {systemLinks.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`app-nav-link flex items-center gap-space-sm transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'app-nav-link-active font-semibold'
                        : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span className="font-label-lg text-label-lg">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Operational Status Box */}
        <div className="app-system-status">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-fixed" />
            </span>
            <span className="font-label-sm text-label-sm text-on-primary font-bold uppercase tracking-wider">
              System Operational
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-primary-container truncate">
            Mira-Bhayandar • {transformers.length > 8 ? 200 + (transformers.length - 8) : 200} Nodes
          </p>
          <div className="flex items-center justify-between mt-1 text-outline-variant font-telemetry-data text-label-sm">
            <span>Telemetry Latency</span>
            <span className="text-tertiary-fixed font-semibold">42ms</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="app-header fixed top-0 right-0 z-40 flex w-full items-center justify-between px-space-lg lg:left-64 lg:w-[calc(100%-16rem)]">
          <div className="flex min-w-0 items-center gap-space-sm">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isMobileNavOpen}
              onClick={() => setIsMobileNavOpen(true)}
              className="app-icon-button flex shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface lg:hidden"
            >
              <span className="material-symbols-outlined text-[21px]">menu</span>
            </button>
            <button
              onClick={() => handleNavigate('zone-intelligence')}
              aria-label="Select Mira-Bhayandar, Maharashtra"
              className="app-location-button flex shrink-0 items-center gap-space-xs rounded-lg px-space-sm text-on-surface transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
              <span className="hidden font-label-lg text-label-lg font-semibold sm:inline">Mira-Bhayandar, Maharashtra</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] max-sm:hidden">expand_more</span>
            </button>
          </div>

          <div className="mx-space-sm min-w-0 max-w-md flex-1 lg:mx-space-lg">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="relative flex min-w-0 items-center cursor-pointer"
            >
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
              <input
                readOnly
                className="app-search-trigger h-10 w-full rounded-lg pl-9 pr-11 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none cursor-pointer"
                placeholder="Search transformers, zones (e.g. Mira Road East), feeders..."
                type="text"
              />
              <span className="absolute right-2 rounded border border-outline-variant bg-white px-1.5 py-0.5 font-telemetry-data text-label-sm text-on-surface-variant max-sm:hidden">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-space-xs sm:gap-space-sm lg:gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low font-telemetry-data text-label-md text-on-surface">
              <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span>
              <span>IST {istTime}</span>
              <span className="text-outline-variant">•</span>
              <span className="text-on-secondary-fixed-variant font-semibold">50.02 Hz Stable</span>
            </div>

            <button
              onClick={() => handleNavigate('settings')}
              className="app-icon-button flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              title="System Parameters"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>

            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="app-icon-button relative flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              title="Notifications & Dispatches"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unacknowledgedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
              )}
            </button>

            <button
              onClick={() => setIsAskAiOpen(true)}
              className="app-ask-button flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-on-primary transition-colors cursor-pointer whitespace-nowrap sm:px-space-md"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">auto_awesome</span>
              <span className="hidden font-label-md text-label-md sm:inline">Ask AI</span>
            </button>

            <div className="h-6 w-px bg-outline-variant/30" />

            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-space-xs cursor-pointer hover:opacity-90 transition-opacity"
            >
              <OperatorAvatar className="w-8 h-8" />
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-tight">R. Deshmukh</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Field Engineer</span>
              </div>
            </button>
          </div>
        </header>

        {/* Active View Canvas */}
        <main className="app-main-frame w-full">
          {activeTab === 'overview' && (
            <OverviewView
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'live-grid' && (
            <LiveGridView
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'transformers' && (
            <TransformersView
              selectedAssetId={selectedTransformerId}
              onSelectAsset={(id) => setSelectedTransformerId(id)}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'predictions' && (
            <PredictionsView
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alertData.alerts}
              dataSource={alertData.dataSource}
              isLoading={alertData.isLoading}
              error={alertData.error}
              updatingIds={alertData.updatingIds}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onAcknowledgeAllWarnings={handleAcknowledgeAllWarnings}
              onNavigate={handleNavigate}
              onShowToast={showToast}
              onRefresh={alertData.refresh}
            />
          )}

          {activeTab === 'historical-data' && (
            <HistoricalDataView
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'events-forecasts' && (
            <EventsForecastsView
              onNavigate={handleNavigate}
              onOpenDispatch={handleOpenDispatch}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'what-if-simulator' && (
            <WhatIfSimulatorView
              initialOutageAsset={selectedTransformerId || 'MB-042'}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'zone-intelligence' && (
            <ZoneIntelligenceView
              transformers={transformers}
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              reports={reports}
              onAddReport={(newRep) => {
                setReports((prev) => [newRep, ...prev]);
                showToast(`Local report preview ${newRep.id} added to this session; no file was generated.`);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsAndStatesView
              initialTab="profile"
              onNavigate={handleNavigate}
              onShowToast={showToast}
              onSignOut={handleSignOut}
            />
          )}

          {activeTab === 'system-states' && (
            <SettingsAndStatesView
              initialTab="edge-states"
              onNavigate={handleNavigate}
              onShowToast={showToast}
              onSignOut={handleSignOut}
            />
          )}
        </main>
      </div>

      {/* Global Overlays & Slide-Out Drawers */}
      <AskAiDrawer
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        onNavigate={handleNavigate}
        onShowToast={showToast}
      />

      <NotificationsFlyout
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigate={handleNavigate}
        onShowToast={showToast}
      />

      <ProfileFlyout
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      />

      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        transformers={transformers}
        onNavigate={handleNavigate}
      />

      <DispatchModal
        isOpen={dispatchModal.isOpen}
        assetId={dispatchModal.assetId}
        vanName={dispatchModal.vanName}
        zone={dispatchModal.zone}
        onClose={() => setDispatchModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDispatch}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col gap-2 pointer-events-none sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`app-toast pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 font-label-md text-label-md transition-all ${
              t.isError ? 'bg-error text-on-error' : 'bg-primary-container text-on-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">
              {t.isError ? 'warning' : 'check_circle'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
