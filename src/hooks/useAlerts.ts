import { useCallback, useEffect, useState } from 'react';
import {
  AlertRecord,
  AlertStatus,
  clearLocalAlertStatusOverride,
  createDemoAlerts,
  fetchAlerts,
  LocalAlertStatusOverride,
  readLocalAlertStatusOverrides,
  saveLocalAlertStatusOverride,
  updateAlertStatus,
} from '../services/alertData';
import { fetchAllTransformers } from '../services/transformerData';

type AlertDataSource = 'supabase' | 'demo' | 'unavailable';

interface UseAlertsResult {
  alerts: AlertRecord[];
  dataSource: AlertDataSource;
  isLoading: boolean;
  error: string | null;
  updatingIds: ReadonlySet<string>;
  refresh: () => Promise<void>;
  setStatus: (alertId: string, status: AlertStatus, revalidate?: boolean) => Promise<AlertRecord>;
  acknowledgeWarnings: () => Promise<{ savedToSupabase: number; savedLocally: number; failed: number }>;
}

export function useAlerts(enabled: boolean): UseAlertsResult {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [dataSource, setDataSource] = useState<AlertDataSource>('unavailable');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<ReadonlySet<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    let supabaseAlerts: AlertRecord[] = [];
    let queryError: string | null = null;
    try {
      supabaseAlerts = await fetchAlerts();
    } catch (requestError) {
      queryError = requestError instanceof Error ? requestError.message : 'Unable to load alerts from Supabase.';
    }
    if (supabaseAlerts.length > 0) {
      const localOverrides = readLocalAlertStatusOverrides();
      setAlerts(supabaseAlerts.map((alert) => {
        const override = localOverrides[alert.id];
        return override ? { ...alert, ...override, statusPersistence: 'local' } : alert;
      }));
      setDataSource('supabase');
      setError(null);
      setIsLoading(false);
      return;
    }
    try {
      const transformers = await fetchAllTransformers();
      const generated = createDemoAlerts(transformers);
      const localOverrides = readLocalAlertStatusOverrides();
      setAlerts((current) => {
        const previousDemoStatus = new Map(current.filter((alert) => alert.source === 'demo').map((alert) => [alert.id, alert]));
        return generated.map((alert) => {
          const override = localOverrides[alert.id];
          if (override) return { ...alert, ...override, statusPersistence: 'local' };
          const previous = previousDemoStatus.get(alert.id);
          return previous ? { ...alert, status: previous.status, acknowledgedAt: previous.acknowledgedAt, resolvedAt: previous.resolvedAt } : alert;
        });
      });
      setDataSource(generated.length ? 'demo' : 'unavailable');
      setError(queryError);
    } catch (inventoryError) {
      setAlerts([]);
      setDataSource('unavailable');
      const inventoryMessage = inventoryError instanceof Error ? inventoryError.message : 'Transformer inventory is unavailable for demo alerts.';
      setError(queryError ? `${queryError} Demo feed could not load transformer inventory: ${inventoryMessage}` : `No Supabase alerts were returned, and the demo feed could not load transformer inventory: ${inventoryMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setAlerts([]);
      setDataSource('unavailable');
      setError(null);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [enabled, refresh]);

  const setStatus = useCallback(async (alertId: string, status: AlertStatus, revalidate = true): Promise<AlertRecord> => {
    setUpdatingIds((previous) => new Set(previous).add(alertId));
    try {
      const existing = alerts.find((alert) => alert.id === alertId);
      if (!existing) throw new Error('Alert is no longer available. Refresh the feed and try again.');
      const timestamp = new Date().toISOString();
      const localOverride: LocalAlertStatusOverride = {
        status,
        acknowledgedAt: status === 'acknowledged' ? timestamp : existing.acknowledgedAt,
        resolvedAt: status === 'resolved' ? timestamp : existing.resolvedAt,
      };
      let updatedAlert: AlertRecord;
      if (existing.source === 'demo') {
        saveLocalAlertStatusOverride(alertId, localOverride);
        updatedAlert = { ...existing, ...localOverride, statusPersistence: 'local' };
      } else {
        try {
          updatedAlert = { ...(await updateAlertStatus(alertId, status)), statusPersistence: 'supabase' };
        } catch (databaseError) {
          const databaseMessage = databaseError instanceof Error ? databaseError.message : 'Supabase did not confirm the update.';
          const fallbackOverride = { ...localOverride, statusSaveError: databaseMessage };
          saveLocalAlertStatusOverride(alertId, fallbackOverride);
          updatedAlert = { ...existing, ...fallbackOverride, statusPersistence: 'local' };
        }
        if (updatedAlert.statusPersistence === 'supabase') clearLocalAlertStatusOverride(alertId);
      }
      setAlerts((previous) => previous.map((alert) => alert.id === alertId ? updatedAlert : alert));
      if (revalidate && updatedAlert.source === 'supabase') await refresh();
      return updatedAlert;
    } finally {
      setUpdatingIds((previous) => {
        const next = new Set(previous);
        next.delete(alertId);
        return next;
      });
    }
  }, [alerts, refresh]);

  const acknowledgeWarnings = useCallback(async () => {
    const pending = alerts.filter((alert) => alert.severity === 'warning' && alert.status === 'new');
    const results = await Promise.allSettled(pending.map((alert) => setStatus(alert.id, 'acknowledged', false)));
    const succeeded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
    const failed = results.length - succeeded.length;
    if (succeeded.length > 0) await refresh();
    return {
      savedToSupabase: succeeded.filter((alert) => alert.statusPersistence === 'supabase').length,
      savedLocally: succeeded.filter((alert) => alert.statusPersistence === 'local').length,
      failed,
    };
  }, [alerts, refresh, setStatus]);

  return { alerts, dataSource, isLoading, error, updatingIds, refresh, setStatus, acknowledgeWarnings };
}
