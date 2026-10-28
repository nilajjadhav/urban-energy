import { supabase } from '../lib/supabase';

export type DataRecord = Record<string, unknown>;
export type RelatedTable = 'transformer_readings' | 'predictions' | 'risk_scores' | 'maintenance_records' | 'alerts';

export interface TransformerRecord {
  transformerId: string;
  zoneId: number | null;
  location: string | null;
  capacityKva: number | null;
  installationYear: number | null;
  status: string | null;
  maintenanceStatus: string | null;
  latitude: number | null;
  longitude: number | null;
  source: DataRecord;
}

const PAGE_SIZE = 500;
const ZONE_NAMES: Record<number, string> = {
  1: 'Mira Road East',
  2: 'Mira Road West',
  3: 'Bhayandar East',
  4: 'Bhayandar West',
  5: 'Bhayandar North',
  6: 'Mira-Bhayandar Central',
};

export function readText(record: DataRecord, candidates: string[]): string | null {
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function readRecordTimestamp(record: DataRecord): string | null {
  const knownKeys = ['measured_at', 'reading_timestamp', 'recorded_at', 'created_at', 'updated_at', 'timestamp', 'date'];
  const keys = [...knownKeys, ...Object.keys(record).filter((key) => !knownKeys.includes(key) && /(?:_at|_on|timestamp|datetime|date|time)$/i.test(key))];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && Number.isFinite(Date.parse(value))) return value;
  }
  return null;
}

export function readNumber(record: DataRecord, candidates: string[]): number | null {
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

export function asDataRecord(value: unknown): DataRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as DataRecord
    : null;
}

export function normalizeTransformer(value: unknown): TransformerRecord | null {
  const source = asDataRecord(value);
  if (!source) return null;
  const transformerId = readText(source, ['transformer_id', 'id']);
  if (!transformerId) return null;
  const zoneId = readNumber(source, ['zone_id']);
  const latitude = readNumber(source, ['latitude']);
  const longitude = readNumber(source, ['longitude']);
  const installationField = Object.entries(source).find(([key]) => {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized.includes('install') || normalized.includes('commission');
  })?.[1];
  const installationText = typeof installationField === 'string' ? installationField : null;
  const parsedInstallationYear = installationText ? Number(installationText.slice(0, 4)) : null;
  return {
    transformerId,
    zoneId: zoneId !== null && Number.isInteger(zoneId) ? zoneId : null,
    location: readText(source, ['location', 'name']),
    capacityKva: readNumber(source, ['capacity_kva', 'rated_kva', 'capacity']),
    installationYear: readNumber(source, ['installation_year', 'year_of_installation', 'installed_year', 'year_installed']) ??
      (parsedInstallationYear !== null && Number.isInteger(parsedInstallationYear) ? parsedInstallationYear : null),
    status: readText(source, ['status']),
    maintenanceStatus: readText(source, ['maintenance_status']),
    latitude: latitude !== null && latitude >= -90 && latitude <= 90 ? latitude : null,
    longitude: longitude !== null && longitude >= -180 && longitude <= 180 ? longitude : null,
    source,
  };
}

export function transformerZoneName(zoneId: number | null): string {
  return zoneId === null ? 'Zone unavailable' : ZONE_NAMES[zoneId] || 'Zone unavailable';
}

export async function fetchAllTransformers(): Promise<TransformerRecord[]> {
  const allRows: unknown[] = [];
  let from = 0;
  let expectedCount: number | null = null;
  for (;;) {
    const { data, error, count } = await supabase
      .from('transformers')
      .select('*', { count: 'exact' })
      .order('transformer_id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    if (count !== null) expectedCount = count;
    const rows: unknown[] = Array.isArray(data) ? data : [];
    allRows.push(...rows);
    if (rows.length === 0) break;
    from += rows.length;
    if (expectedCount !== null && from >= expectedCount) break;
    if (rows.length < PAGE_SIZE && expectedCount === null) break;
  }
  return allRows.map(normalizeTransformer).filter((row): row is TransformerRecord => row !== null);
}

const RELATED_TABLES: RelatedTable[] = [
  'transformer_readings', 'predictions', 'risk_scores', 'maintenance_records', 'alerts',
];

export interface RelatedDataResult {
  table: RelatedTable;
  records: DataRecord[];
  error: string | null;
}

function rowTransformerId(row: DataRecord): string | null {
  const exact = readText(row, ['transformer_id', 'asset_id', 'transformer', 'asset']);
  if (exact) return exact;
  const idField = Object.entries(row).find(([key]) => {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized.includes('transformer') && normalized.endsWith('id');
  });
  const value = idField?.[1];
  return typeof value === 'string' ? value : null;
}

export function relatedTransformerId(row: DataRecord): string | null {
  return rowTransformerId(row);
}

export async function fetchTransformerRelatedData(transformerId: string, skippedTables: RelatedTable[] = []): Promise<RelatedDataResult[]> {
  const tables = RELATED_TABLES.filter((table) => !skippedTables.includes(table));
  return Promise.all(tables.map(async (table): Promise<RelatedDataResult> => {
    let lastError = 'No supported transformer reference field was found.';
    let querySucceeded = false;
    for (const foreignKey of ['transformer_id', 'asset_id', 'transformer', 'asset']) {
      const allRows: unknown[] = [];
      let fieldError: string | null = null;
      let from = 0;
      let expectedCount: number | null = null;
      for (;;) {
        const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).eq(foreignKey, transformerId).range(from, from + PAGE_SIZE - 1);
        if (error) {
          fieldError = error.message;
          break;
        }
        if (count !== null) expectedCount = count;
        const page: unknown[] = Array.isArray(data) ? data : [];
        allRows.push(...page);
        if (page.length === 0) break;
        from += page.length;
        if (expectedCount !== null && from >= expectedCount) break;
        if (page.length < PAGE_SIZE && expectedCount === null) break;
      }
      if (!fieldError) {
        querySucceeded = true;
        const records = allRows
          .map(asDataRecord)
          .filter((row): row is DataRecord => row !== null)
          .filter((row) => rowTransformerId(row) === transformerId);
        if (records.length) return { table, records, error: null };
        continue;
      }
      lastError = fieldError;
      if (!/column .* does not exist|could not find the .* column|schema cache/i.test(fieldError)) {
        return { table, records: [], error: fieldError };
      }
    }
    return { table, records: [], error: querySucceeded ? null : lastError };
  }));
}

export async function fetchAllRiskRows(): Promise<DataRecord[]> {
  return fetchAllTableRows('risk_scores');
}

export async function fetchAllTransformerReadingRows(): Promise<DataRecord[]> {
  return fetchAllTableRows('transformer_readings');
}

export async function fetchTransformerReadingRows(transformerId: string): Promise<RelatedDataResult> {
  const records: DataRecord[] = [];
  let from = 0;
  let expectedCount: number | null = null;

  for (;;) {
    const { data, error, count } = await supabase
      .from('transformer_readings')
      .select('*', { count: 'exact' })
      .eq('transformer_id', transformerId)
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { table: 'transformer_readings', records: [], error: error.message };
    if (count !== null) expectedCount = count;
    const batch = (Array.isArray(data) ? data : [])
      .map(asDataRecord)
      .filter((row): row is DataRecord => row !== null)
      .filter((row) => row.transformer_id === transformerId);
    records.push(...batch);
    if (batch.length === 0) break;
    from += batch.length;
    if (expectedCount !== null && from >= expectedCount) break;
    if (batch.length < PAGE_SIZE && expectedCount === null) break;
  }

  return { table: 'transformer_readings', records, error: null };
}

async function fetchAllTableRows(table: 'risk_scores' | 'transformer_readings'): Promise<DataRecord[]> {
  const rows: unknown[] = [];
  let from = 0;
  let expectedCount: number | null = null;
  for (;;) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    if (count !== null) expectedCount = count;
    const batch: unknown[] = Array.isArray(data) ? data : [];
    rows.push(...batch);
    if (batch.length === 0) break;
    from += batch.length;
    if (expectedCount !== null && from >= expectedCount) break;
    if (batch.length < PAGE_SIZE && expectedCount === null) break;
  }
  return rows.map(asDataRecord).filter((row): row is DataRecord => row !== null);
}
