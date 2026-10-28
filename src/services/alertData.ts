import { supabase } from '../lib/supabase';
import { asDataRecord, DataRecord, readNumber, readText, TransformerRecord } from './transformerData';

export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface AlertRecord {
  id: string;
  source: 'supabase' | 'demo';
  transformerId: string | null;
  zoneId: number | null;
  severity: string;
  status: string;
  title: string | null;
  reason: string | null;
  riskScore: number | null;
  createdAt: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  statusPersistence?: 'supabase' | 'local';
  statusSaveError?: string;
}

export interface LocalAlertStatusOverride {
  status: AlertStatus;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  statusSaveError?: string;
}

const LOCAL_ALERT_STATUS_KEY = 'urban-energy-alert-status-overrides-v1';

function isAlertStatus(value: unknown): value is AlertStatus {
  return value === 'new' || value === 'acknowledged' || value === 'resolved';
}

export function readLocalAlertStatusOverrides(): Record<string, LocalAlertStatusOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(LOCAL_ALERT_STATUS_KEY) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const result: Record<string, LocalAlertStatusOverride> = {};
    Object.entries(parsed).forEach(([id, value]) => {
      const row = asDataRecord(value);
      if (!row || !isAlertStatus(row.status)) return;
      result[id] = {
        status: row.status,
        acknowledgedAt: typeof row.acknowledgedAt === 'string' ? row.acknowledgedAt : null,
        resolvedAt: typeof row.resolvedAt === 'string' ? row.resolvedAt : null,
        ...(typeof row.statusSaveError === 'string' ? { statusSaveError: row.statusSaveError } : {}),
      };
    });
    return result;
  } catch {
    return {};
  }
}

export function saveLocalAlertStatusOverride(alertId: string, override: LocalAlertStatusOverride): void {
  if (typeof window === 'undefined') throw new Error('Browser storage is unavailable.');
  const overrides = readLocalAlertStatusOverrides();
  overrides[alertId] = override;
  window.localStorage.setItem(LOCAL_ALERT_STATUS_KEY, JSON.stringify(overrides));
}

export function clearLocalAlertStatusOverride(alertId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const overrides = readLocalAlertStatusOverrides();
    delete overrides[alertId];
    window.localStorage.setItem(LOCAL_ALERT_STATUS_KEY, JSON.stringify(overrides));
  } catch {
    // A confirmed Supabase update remains successful even if stale local data cannot be cleared.
  }
}

const PAGE_SIZE = 500;
const ALERT_RETURNING_COLUMNS = 'alert_id,transformer_id,zone_id,severity,status,title,reason,risk_score,created_at,acknowledged_at,resolved_at';

function readAlertId(row: DataRecord): string | null {
  const value = row.alert_id;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
  return null;
}

function normalizeAlert(value: unknown): AlertRecord | null {
  const row = asDataRecord(value);
  if (!row) return null;
  const id = readAlertId(row);
  const severity = readText(row, ['severity']);
  const status = readText(row, ['status']);
  if (!id || !severity || !status) return null;
  const zone = readNumber(row, ['zone_id']);
  return {
    id,
    source: 'supabase',
    statusPersistence: 'supabase',
    transformerId: readText(row, ['transformer_id']),
    zoneId: zone !== null && Number.isInteger(zone) ? zone : null,
    severity,
    status,
    title: readText(row, ['title']),
    reason: readText(row, ['reason']),
    riskScore: readNumber(row, ['risk_score']),
    createdAt: readText(row, ['created_at']),
    acknowledgedAt: readText(row, ['acknowledged_at']),
    resolvedAt: readText(row, ['resolved_at']),
  };
}

function alertRejectionReason(value: unknown): string {
  const row = asDataRecord(value);
  if (!row) return 'row is not a non-null object';
  if (!readAlertId(row)) return 'alert_id is missing or is not a nonempty string or safe integer';
  if (!readText(row, ['severity'])) return 'severity is missing or is not a nonempty string';
  if (!readText(row, ['status'])) return 'status is missing or is not a nonempty string';
  return 'row failed normalization for an unclassified reason';
}

function alertFieldDiagnostics(value: unknown): Record<string, { present: boolean; type: string }> | null {
  const row = asDataRecord(value);
  if (!row) return null;
  return Object.fromEntries(['alert_id', 'severity', 'status'].map((field) => [
    field,
    {
      present: Object.prototype.hasOwnProperty.call(row, field),
      type: Object.prototype.hasOwnProperty.call(row, field) ? typeof row[field] : 'missing',
    },
  ]));
}

const DEMO_TEMPLATES = [
  { severity: 'critical', status: 'new', title: 'Simulated overload risk escalation', reason: 'Demo scenario: a sustained evening demand pattern is approaching the transformer capacity envelope.', riskScore: 94 },
  { severity: 'high_risk', status: 'acknowledged', title: 'Simulated elevated load trend', reason: 'Demo scenario: successive readings indicate a rising load trend that merits operator review.', riskScore: 86 },
  { severity: 'warning', status: 'new', title: 'Simulated temperature advisory', reason: 'Demo scenario: transformer temperature is above its illustrative advisory band.', riskScore: 68 },
  { severity: 'critical', status: 'acknowledged', title: 'Simulated voltage deviation', reason: 'Demo scenario: a sustained voltage deviation has been included for alert workflow demonstration.', riskScore: 92 },
  { severity: 'high_risk', status: 'new', title: 'Simulated forecasted capacity pressure', reason: 'Demo scenario: a forecasted demand peak may reduce the available operating margin.', riskScore: 82 },
  { severity: 'warning', status: 'resolved', title: 'Simulated maintenance advisory', reason: 'Demo scenario: a routine inspection reminder is included to demonstrate resolved-alert handling.', riskScore: 61 },
  { severity: 'critical', status: 'resolved', title: 'Simulated phase imbalance incident', reason: 'Demo scenario: phase imbalance was flagged for the example incident-management workflow.', riskScore: 90 },
  { severity: 'high_risk', status: 'acknowledged', title: 'Simulated repeated load fluctuation', reason: 'Demo scenario: repeated load variation is shown as a review item, not a live grid event.', riskScore: 79 },
  { severity: 'warning', status: 'new', title: 'Simulated telemetry review notice', reason: 'Demo scenario: an illustrative telemetry condition is included for the hackathon demo feed.', riskScore: 57 },
  { severity: 'high_risk', status: 'resolved', title: 'Simulated reduced operating margin', reason: 'Demo scenario: a reduced margin notification is shown as a completed example workflow.', riskScore: 84 },
  { severity: 'critical', status: 'new', title: 'Simulated thermal limit warning', reason: 'Demo scenario: the example event represents a high thermal reading requiring review.', riskScore: 96 },
  { severity: 'warning', status: 'acknowledged', title: 'Simulated service check reminder', reason: 'Demo scenario: this reminder demonstrates the acknowledged status state.', riskScore: 64 },
] as const;

/** Build clearly simulated local-only alerts from the currently readable transformer inventory. */
export function createDemoAlerts(transformers: TransformerRecord[], now = Date.now()): AlertRecord[] {
  if (transformers.length === 0) return [];
  const count = Math.min(24, transformers.length);
  return Array.from({ length: count }, (_, index) => {
    const transformerIndex = Math.floor(index * transformers.length / count);
    const transformer = transformers[transformerIndex];
    const template = DEMO_TEMPLATES[index % DEMO_TEMPLATES.length];
    const createdAt = new Date(now - (index * 53 + 11) * 60_000).toISOString();
    return {
      id: `demo-alert-${String(index + 1).padStart(3, '0')}`,
      source: 'demo',
      statusPersistence: 'local',
      transformerId: transformer.transformerId,
      zoneId: transformer.zoneId,
      severity: template.severity,
      status: template.status,
      title: template.title,
      reason: template.reason,
      riskScore: template.riskScore,
      createdAt,
      acknowledgedAt: template.status === 'acknowledged' ? createdAt : null,
      resolvedAt: template.status === 'resolved' ? createdAt : null,
    };
  });
}

export async function fetchAlerts(): Promise<AlertRecord[]> {
  const rows: unknown[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('alerts')
      .select(ALERT_RETURNING_COLUMNS)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch: unknown[] = Array.isArray(data) ? data : [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    offset += batch.length;
  }
  const alerts = rows.map(normalizeAlert).filter((alert): alert is AlertRecord => alert !== null);
  if (import.meta.env.DEV) {
    const firstRejectedRow = rows.find((row) => normalizeAlert(row) === null);
    console.info('[alerts normalization diagnostic]', {
      rawRowCount: rows.length,
      normalizedRowCount: alerts.length,
      rejectedRowCount: rows.length - alerts.length,
      firstRowFields: alertFieldDiagnostics(rows[0]),
      firstRejectedRowReason: firstRejectedRow === undefined ? null : alertRejectionReason(firstRejectedRow),
    });
  }
  if (rows.length > 0 && alerts.length === 0) {
    throw new Error('Alert rows were returned, but none contained a usable alert ID, severity, and status.');
  }
  return alerts;
}

export async function updateAlertStatus(alertId: string, status: AlertStatus): Promise<AlertRecord> {
  const timestamp = new Date().toISOString();
  const update = status === 'acknowledged'
    ? { status, acknowledged_at: timestamp }
    : { status, resolved_at: timestamp };
  const { data, error } = await supabase
    .from('alerts')
    .update(update)
    .eq('alert_id', alertId)
    .select(ALERT_RETURNING_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const alert = normalizeAlert(data);
  if (!alert) throw new Error('Alert was not updated. It may be unavailable or you may not have permission.');
  return alert;
}
