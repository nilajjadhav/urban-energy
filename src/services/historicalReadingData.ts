import { supabase } from '../lib/supabase';
import { asDataRecord } from './transformerData';

export const READING_METRICS = [
  { key: 'load_kva', label: 'Load', unit: 'kVA' },
  { key: 'load_percent', label: 'Load percent', unit: '%' },
  { key: 'voltage', label: 'Voltage', unit: 'Unit unspecified' },
  { key: 'current', label: 'Current', unit: 'Unit unspecified' },
  { key: 'temperature', label: 'Temperature', unit: 'Unit unspecified' },
  { key: 'frequency', label: 'Frequency', unit: 'Unit unspecified' },
] as const;

export type ReadingMetricKey = typeof READING_METRICS[number]['key'];

export interface HistoricalReading {
  id: string;
  transformerId: string;
  timestamp: string | null;
  value: number | string | null;
}

export interface HistoricalReadingPage {
  records: HistoricalReading[];
  totalCount: number;
}

export interface HistoricalReadingFilters {
  transformerId: string;
  metric: ReadingMetricKey;
  page: number;
  pageSize: number;
  from?: string;
  to?: string;
}

function scalar(value: unknown): number | string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function normalizeReading(value: unknown, metric: ReadingMetricKey): HistoricalReading | null {
  const row = asDataRecord(value);
  if (!row) return null;
  const id = scalar(row.reading_id);
  const transformerId = typeof row.transformer_id === 'string' ? row.transformer_id : null;
  if (id === null || !transformerId) return null;
  return {
    id: String(id),
    transformerId,
    timestamp: typeof row.timestamp === 'string' ? row.timestamp : null,
    value: scalar(row[metric]),
  };
}

export async function fetchHistoricalReadingPage(filters: HistoricalReadingFilters): Promise<HistoricalReadingPage> {
  const columns = `reading_id,transformer_id,timestamp,${filters.metric}`;
  let query = supabase
    .from('transformer_readings')
    .select(columns, { count: 'exact' })
    .eq('transformer_id', filters.transformerId)
    .order('timestamp', { ascending: false, nullsFirst: false });
  if (filters.from) query = query.gte('timestamp', filters.from);
  if (filters.to) query = query.lte('timestamp', filters.to);

  const from = filters.page * filters.pageSize;
  const { data, error, count } = await query.range(from, from + filters.pageSize - 1);
  if (error) throw new Error(error.message);
  const records = (Array.isArray(data) ? data : [])
    .map((row) => normalizeReading(row, filters.metric))
    .filter((row): row is HistoricalReading => row !== null);
  return { records, totalCount: count ?? records.length };
}
