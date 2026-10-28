import { supabase } from '../lib/supabase';
import { asDataRecord, DataRecord, readNumber, readText } from './transformerData';

export interface PredictionRecord {
  id: string;
  transformerId: string;
  timestamp: string | null;
  predictedLoadKva: number | null;
  overloadProbability: number | string | null;
  failureRisk: number | string | null;
  modelVersion: string | null;
}

export interface PredictionPage {
  records: PredictionRecord[];
  totalCount: number;
}

export interface PredictionFilters {
  page: number;
  pageSize: number;
  transformerId?: string;
  transformerIds?: string[];
  searchText?: string;
}

export const PREDICTION_COLUMNS = 'prediction_id,transformer_id,timestamp,predicted_load_kva,overload_probability,failure_risk,model_version';

function readPredictionId(row: DataRecord): string | null {
  const value = row.prediction_id;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isSafeInteger(value)) return String(value);
  return null;
}

function readScalar(record: DataRecord, key: string): number | string | null {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function normalizePrediction(value: unknown): PredictionRecord | null {
  const row = asDataRecord(value);
  if (!row) return null;
  const id = readPredictionId(row);
  const transformerId = readText(row, ['transformer_id']);
  if (!id || !transformerId) return null;
  return {
    id,
    transformerId,
    timestamp: readText(row, ['timestamp']),
    predictedLoadKva: readNumber(row, ['predicted_load_kva']),
    overloadProbability: readScalar(row, 'overload_probability'),
    failureRisk: readScalar(row, 'failure_risk'),
    modelVersion: readText(row, ['model_version']),
  };
}

function predictionRejectionReason(value: unknown): string {
  const row = asDataRecord(value);
  if (!row) return 'row is not a non-null object';
  if (!readPredictionId(row)) return 'prediction_id is missing or is not a nonempty string or safe integer';
  if (!readText(row, ['transformer_id'])) return 'transformer_id is missing or is not a nonempty string';
  return 'row failed normalization for an unclassified reason';
}

function predictionFieldDiagnostics(value: unknown): Record<string, { present: boolean; type: string }> | null {
  const row = asDataRecord(value);
  if (!row) return null;
  return Object.fromEntries(['prediction_id', 'transformer_id'].map((field) => [
    field,
    {
      present: Object.prototype.hasOwnProperty.call(row, field),
      type: Object.prototype.hasOwnProperty.call(row, field) ? typeof row[field] : 'missing',
    },
  ]));
}

export async function fetchPredictionPage(filters: PredictionFilters): Promise<PredictionPage> {
  if (filters.transformerIds && filters.transformerIds.length === 0) return { records: [], totalCount: 0 };
  const from = filters.page * filters.pageSize;
  let query = supabase
    .from('predictions')
    .select(PREDICTION_COLUMNS, { count: 'exact' })
    .order('timestamp', { ascending: false, nullsFirst: false });

  if (filters.transformerId) query = query.eq('transformer_id', filters.transformerId);
  if (filters.transformerIds) query = query.in('transformer_id', filters.transformerIds);
  if (filters.searchText) query = query.ilike('transformer_id', `%${filters.searchText}%`);

  const { data, error, count } = await query.range(from, from + filters.pageSize - 1);
  if (error) throw new Error(error.message);
  const records = (Array.isArray(data) ? data : [])
    .map(normalizePrediction)
    .filter((record): record is PredictionRecord => record !== null);
  if (import.meta.env.DEV) {
    const rawRows: unknown[] = Array.isArray(data) ? data : [];
    const firstRejectedRow = rawRows.find((row) => normalizePrediction(row) === null);
    console.info('[predictions normalization diagnostic]', {
      exactCount: count,
      rawRowsReturnedForCurrentPage: rawRows.length,
      normalizedRowsReturned: records.length,
      rejectedRowCount: rawRows.length - records.length,
      firstRowFields: predictionFieldDiagnostics(rawRows[0]),
      firstRejectedRowReason: firstRejectedRow === undefined ? null : predictionRejectionReason(firstRejectedRow),
    });
  }
  return { records, totalCount: count ?? records.length };
}
