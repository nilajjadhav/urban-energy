import { useEffect, useState } from 'react';
import { DataRecord, fetchAllRiskRows, fetchAllTransformerReadingRows, readNumber, readRecordTimestamp } from '../services/transformerData';

export interface TransformerRiskScore {
  transformerId: string;
  score: number | null;
  metricName: string;
  kind: 'risk' | 'reading';
  riskLevel: OperationalRiskLevel | null;
  source: DataRecord;
}

export type OperationalRiskLevel = 'Normal' | 'Warning' | 'High Risk' | 'Critical';

interface Result {
  scores: TransformerRiskScore[];
  isLoading: boolean;
  error: string | null;
}

function scoreFromRow(row: DataRecord): number | null {
  const scoreKeys = Object.keys(row).filter((key) => {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized === 'score' || (normalized.includes('risk') && /(score|value|index|prob|percent)/.test(normalized));
  });
  return readNumber(row, scoreKeys);
}

function normalizeRiskLevel(value: unknown): OperationalRiskLevel | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  if (normalized === 'normal') return 'Normal';
  if (normalized === 'warning') return 'Warning';
  if (normalized === 'high risk') return 'High Risk';
  if (normalized === 'critical') return 'Critical';
  return null;
}

function levelFromRow(row: DataRecord): OperationalRiskLevel | null {
  const riskLabel = Object.entries(row).find(([key, value]) => {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized.includes('risk') && /(level|category|band|class)/.test(normalized) && typeof value === 'string';
  });
  return riskLabel ? normalizeRiskLevel(riskLabel[1]) : null;
}

function scoreTime(row: DataRecord): number {
  const value = readRecordTimestamp(row);
  return value ? Date.parse(value) : 0;
}

function readingValue(row: DataRecord): { score: number; metricName: string } | null {
  const fields = Object.entries(row).filter(([key, value]) => {
    if (typeof value !== 'number' && (typeof value !== 'string' || !Number.isFinite(Number(value)))) return false;
    const name = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return name.includes('load') || name.includes('temp');
  });
  const preferred = fields.find(([key]) => /percent|pct|ratio/i.test(key)) ?? fields[0];
  if (!preferred) return null;
  const score = typeof preferred[1] === 'number' ? preferred[1] : Number(preferred[1]);
  return Number.isFinite(score) ? { score, metricName: preferred[0] } : null;
}

function latestByTransformer(rows: DataRecord[], kind: 'risk' | 'reading'): Map<string, TransformerRiskScore> {
  const latest = new Map<string, TransformerRiskScore>();
  rows.forEach((row) => {
    const transformerId = typeof row.transformer_id === 'string' ? row.transformer_id : null;
    if (!transformerId) return;
    const score = kind === 'risk' ? scoreFromRow(row) : readingValue(row)?.score ?? null;
    const riskLevel = levelFromRow(row);
    if (kind === 'risk' && score === null && riskLevel === null) return;
    const current = latest.get(transformerId);
    if (!current || scoreTime(row) >= scoreTime(current.source)) {
      const metricName = kind === 'risk'
        ? Object.keys(row).find((key) => {
          const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalized === 'score' || (normalized.includes('risk') && /(score|value|index|prob|percent)/.test(normalized));
        }) ?? 'Risk score'
        : readingValue(row)?.metricName ?? 'Observed reading';
      latest.set(transformerId, { transformerId, score, metricName, kind, riskLevel, source: row });
    }
  });
  return latest;
}

export function useTransformerRiskScores(enabled: boolean): Result {
  const [scores, setScores] = useState<TransformerRiskScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setScores([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);
    void fetchAllRiskRows()
      .then((rows) => {
        if (!active) return;
        const riskEntries = latestByTransformer(rows, 'risk');
        const hasNumericRiskScores = [...riskEntries.values()].some((entry) => entry.score !== null);
        if (hasNumericRiskScores) {
          setScores([...riskEntries.values()]);
          return;
        }
        return fetchAllTransformerReadingRows().then((readingRows) => {
          if (!active) return;
          const readings = latestByTransformer(readingRows, 'reading');
          riskEntries.forEach((riskEntry, transformerId) => {
            if (!riskEntry.riskLevel) return;
            const readingEntry = readings.get(transformerId);
            if (readingEntry) readingEntry.riskLevel = riskEntry.riskLevel;
            else readings.set(transformerId, riskEntry);
          });
          setScores([...readings.values()]);
        });
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load transformer risk scores.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [enabled]);

  return { scores, isLoading, error };
}
