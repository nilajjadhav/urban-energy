import React, { useState } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  onSignInSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSignInSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'authenticating' | 'verified'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStatus('authenticating');
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        setAuthStatus('idle');
        return;
      }

      setAuthStatus('verified');
      onSignInSuccess();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
      setAuthStatus('idle');
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-surface px-3 py-4 sm:px-6 sm:py-6">
      <div className="my-auto flex min-h-[min(780px,calc(100dvh-2rem))] w-full max-w-[1440px] flex-col overflow-hidden rounded-2xl border border-outline-variant/70 bg-surface-container-lowest shadow-[0_24px_72px_rgba(18,38,60,0.14)] lg:flex-row">
        {/* LEFT COLUMN: Command Telemetry & Grid Topology (55% width on desktop) */}
        <div className="relative order-2 flex w-full flex-col justify-between overflow-hidden bg-primary text-on-primary p-6 sm:p-9 lg:order-1 lg:w-[52%] lg:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="40" id="grid-pattern-login" patternUnits="userSpaceOnUse" width="40">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#71f8e4" strokeDasharray="2 4" strokeWidth="0.75" />
                </pattern>
                <radialGradient cx="60%" cy="40%" id="teal-glow-login" r="50%">
                  <stop offset="0%" stopColor="#8ce0d0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#12263c" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect fill="url(#teal-glow-login)" height="100%" width="100%" />
              <rect fill="url(#grid-pattern-login)" height="100%" width="100%" />
            </svg>
          </div>

          {/* Top Section: Brand Identity */}
          <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 p-1.5 shadow-sm sm:h-14 sm:w-14 sm:p-2">
                <BrandLogo className="h-10 w-10" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-md text-headline-md tracking-tight text-surface-bright sm:text-headline-lg sm:font-headline-lg">
                    Urban Energy Intelligence
                  </span>
                </div>
                <p className="font-body-md text-body-md text-primary-fixed-dim">
                  AI-powered urban energy monitoring, prediction and decision support
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-fixed" />
                </span>
                <span className="font-label-md text-label-md text-surface-variant uppercase tracking-wider">
                  Current Regional Load
                </span>
                <span className="font-telemetry-kpi text-telemetry-data text-surface-bright">
                  248.6 <span className="text-tertiary-fixed text-label-sm font-label-sm">MVA</span>
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-secondary-container" />
                <span className="font-label-md text-label-md text-surface-variant uppercase tracking-wider">
                  Grid Frequency
                </span>
                <span className="font-telemetry-kpi text-telemetry-data text-surface-bright">
                  50.01 <span className="text-secondary-fixed text-label-sm font-label-sm">Hz</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Vector Graphic */}
          <div className="relative z-10 my-6 flex flex-col justify-center py-1 sm:my-8 sm:py-3">
            <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-lg backdrop-blur-md sm:p-5">
              <div className="flex items-center justify-between pb-3 text-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-body-md text-tertiary-fixed">hub</span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-surface-bright">
                    Mira-Bhayandar Urban Node Topology (33kV / 11kV)
                  </span>
                </div>
                <span className="font-telemetry-data text-body-sm text-tertiary-fixed">LIVE SCADA FEED</span>
              </div>

              <svg className="h-36 w-full text-surface-bright sm:h-44" fill="none" viewBox="0 0 540 180">
                <path
                  d="M 30 90 L 510 90"
                  stroke="#71f8e4"
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <path d="M 30 90 L 510 90" opacity="0.15" stroke="#71f8e4" strokeWidth="6" />
                <path d="M 120 90 L 120 30 L 190 30" stroke="#89ceff" strokeWidth="1.75" />
                <path d="M 120 90 L 120 150 L 190 150" stroke="#89ceff" strokeWidth="1.75" />
                <path d="M 280 90 L 280 40 L 350 40" stroke="#89ceff" strokeWidth="1.75" />
                <path d="M 280 90 L 280 140 L 350 140" stroke="#89ceff" strokeWidth="1.75" />
                <path d="M 440 90 L 440 50 L 500 50" stroke="#89ceff" strokeWidth="1.75" />
                <path d="M 440 90 L 440 130 L 500 130" stroke="#89ceff" strokeWidth="1.75" />

                <circle cx="30" cy="90" fill="#002722" r="8" stroke="#71f8e4" strokeWidth="2.5" />
                <circle cx="30" cy="90" fill="#71f8e4" r="3" />
                <text className="font-telemetry-data text-label-sm" fill="#cde7f0" fontSize="9" x="20" y="115">
                  GRID INTAKE
                </text>

                <circle cx="190" cy="30" fill="#0b252c" r="6" stroke="#89ceff" strokeWidth="2" />
                <circle cx="190" cy="30" fill="#89ceff" r="2.5" />
                <text className="font-telemetry-data" fill="#f8f9ff" fontSize="9" x="205" y="34">
                  F-01 Kanakia Ind (94.2%)
                </text>

                <circle cx="190" cy="150" fill="#0b252c" r="6" stroke="#4fdbc8" strokeWidth="2" />
                <circle cx="190" cy="150" fill="#4fdbc8" r="2.5" />
                <text className="font-telemetry-data" fill="#f8f9ff" fontSize="9" x="205" y="154">
                  F-02 Beverly Pk (68.4%)
                </text>

                <circle cx="350" cy="40" fill="#0b252c" r="6" stroke="#89ceff" strokeWidth="2" />
                <circle cx="350" cy="40" fill="#89ceff" r="2.5" />
                <text className="font-telemetry-data" fill="#f8f9ff" fontSize="9" x="365" y="44">
                  F-03 Shanti Com (81.0%)
                </text>

                <circle cx="350" cy="140" fill="#0b252c" r="6" stroke="#4fdbc8" strokeWidth="2" />
                <circle cx="350" cy="140" fill="#4fdbc8" r="2.5" />
                <text className="font-telemetry-data" fill="#f8f9ff" fontSize="9" x="365" y="144">
                  F-04 Bhayandar W (53.1%)
                </text>

                <circle cx="280" cy="90" fill="#002722" r="7" stroke="#71f8e4" strokeWidth="2" />
                <circle cx="280" cy="90" fill="#71f8e4" r="2.5" />
                <text className="font-telemetry-data" fill="#71f8e4" fontSize="9" x="270" y="112">
                  TIE-02
                </text>

                <circle cx="510" cy="90" fill="#002722" r="7" stroke="#71f8e4" strokeWidth="2" />
                <circle cx="510" cy="90" fill="#71f8e4" r="2" />
                <text className="font-telemetry-data" fill="#cde7f0" fontSize="9" x="480" y="115">
                  TERMINUS
                </text>
              </svg>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 pt-3 text-label-sm font-telemetry-data text-primary-fixed-dim">
                <span>VOLTAGE LEVEL: 33.14 kV (NOMINAL)</span>
                <span className="text-tertiary-fixed flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse" />
                  SCADA SCAN CYCLE: 250ms
                </span>
                <span>POWER FACTOR: 0.98 LAG</span>
              </div>
            </div>
          </div>

          {/* Bottom Feature Capabilities */}
          <div className="relative z-10 border-t border-white/10 pt-4 sm:pt-5">
            <span className="font-label-md text-label-md text-surface-variant uppercase tracking-wider block mb-3">
              Enterprise Core Intelligence
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-tertiary-fixed">
                  <span className="material-symbols-outlined text-body-md">analytics</span>
                  <span className="font-label-md text-label-md">Predictive Load</span>
                </div>
                <p className="font-body-sm text-body-sm text-surface-dim">
                  XGBoost &amp; LSTM neural load forecasting with 99.2% accuracy.
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-secondary-fixed">
                  <span className="material-symbols-outlined text-body-md">sync_alt</span>
                  <span className="font-label-md text-label-md">SCADA Ingestion</span>
                </div>
                <p className="font-body-sm text-body-sm text-surface-dim">
                  Sub-second telemetry ingestion over IEC 60870-5-104 protocols.
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-tertiary-fixed-dim">
                  <span className="material-symbols-outlined text-body-md">model_training</span>
                  <span className="font-label-md text-label-md">What-If Simulation</span>
                </div>
                <p className="font-body-sm text-body-sm text-surface-dim">
                  Safe virtual circuit trip &amp; contingency switching models.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Console (45% width on desktop) */}
        <div className="order-1 flex w-full flex-col justify-between bg-surface-container-lowest p-6 text-on-surface sm:p-9 lg:order-2 lg:w-[48%] lg:p-12 xl:p-14">
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant/60 pb-4 sm:pb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Gateway Terminal #MB-04
              </span>
            </div>
            <button
              onClick={() => {
                setEmail('');
                setPassword('');
                setAuthError(null);
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3 py-2 font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container-low cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-body-md text-secondary">flash_on</span>
              <span>Clear Credentials</span>
            </button>
          </div>

          <div className="my-auto flex w-full max-w-md flex-col gap-6 py-7 sm:gap-7 sm:py-10">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">Welcome back</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1.5">
                Sign in to Urban Energy Intelligence — Mira-Bhayandar Operations Division
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSignIn}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-lg text-label-lg text-on-surface" htmlFor="work-email">
                    Employee ID / Work Email
                  </label>
                  <span className="font-label-sm text-label-sm text-secondary">Official Personnel</span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-body-lg pointer-events-none">
                    badge
                  </span>
                  <input
                    id="work-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-outline-variant bg-white pl-10 pr-3 font-body-md text-body-md text-on-surface shadow-sm transition-all focus:border-secondary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-lg text-label-lg text-on-surface" htmlFor="password">
                    Console Security Key / Password
                  </label>
                  <span className="font-label-sm text-label-sm text-outline">Hardware Token Supported</span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-body-lg pointer-events-none">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-outline-variant bg-white pl-10 pr-10 font-body-md text-body-md text-on-surface shadow-sm transition-all focus:border-secondary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    className="absolute right-2 rounded-lg p-2 text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-body-lg">
                      {showPwd ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authStatus !== 'idle'}
                  className={`h-12 w-full rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-wait disabled:opacity-80 ${
                    authStatus === 'verified'
                      ? 'bg-success-container text-on-success-container'
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  {authStatus === 'idle' && (
                    <>
                      <span>Sign In to Operations Console</span>
                      <span className="material-symbols-outlined text-body-lg">arrow_forward</span>
                    </>
                  )}
                  {authStatus === 'authenticating' && (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating SCADA Gateway...</span>
                    </>
                  )}
                  {authStatus === 'verified' && (
                    <>
                      <span className="material-symbols-outlined text-body-lg text-tertiary-fixed">
                        check_circle
                      </span>
                      <span>Credentials Verified • Redirecting...</span>
                    </>
                  )}
                </button>
              </div>
              {authError && (
                <p role="alert" className="font-body-sm text-body-sm text-error">
                  {authError}
                </p>
              )}
            </form>

            <div className="flex items-start gap-3 rounded-xl border border-outline-variant/70 bg-surface-container-low p-3.5">
              <span className="material-symbols-outlined text-secondary text-body-lg shrink-0 mt-0.5">info</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface">
                  Operations Duty Roster Active
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Shift 1 (06:00 - 18:00 IST). For emergency feeder manual override protocols, contact Division Control Room directly at +91 (22) 2819-GRID.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-body-md text-secondary">lock</span>
              <span>256-bit encrypted SCADA gateway • Authorized electricity board personnel only</span>
            </div>
            <p className="font-body-sm text-body-sm text-outline">
              Compliant with Ministry of Power, CEA Technical Standards for Grid Connectivity &amp; Mira-Bhayandar Municipal Corporation (MBMC) Infrastructure Security Directives.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
