import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHistoricalReadingPage, HistoricalReading, HistoricalReadingFilters } from '../services/historicalReadingData';

interface UseHistoricalReadingsResult {
  records: HistoricalReading[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHistoricalReadings(enabled: boolean, filters: HistoricalReadingFilters): UseHistoricalReadingsResult {
  const [records, setRecords] = useState<HistoricalReading[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setRecords([]);
    setTotalCount(0);
    try {
      const result = await fetchHistoricalReadingPage(filters);
      if (requestId.current !== currentRequest) return;
      setRecords(result.records);
      setTotalCount(result.totalCount);
    } catch (requestError) {
      if (requestId.current !== currentRequest) return;
      setRecords([]);
      setTotalCount(0);
      setError(requestError instanceof Error ? requestError.message : 'Unable to load historical readings from Supabase.');
    } finally {
      if (requestId.current === currentRequest) setIsLoading(false);
    }
  }, [enabled, filters.from, filters.metric, filters.page, filters.pageSize, filters.to, filters.transformerId]);

  useEffect(() => {
    if (!enabled) {
      setRecords([]);
      setTotalCount(0);
      setError(null);
      setIsLoading(false);
      return;
    }
    void refresh();
    return () => { requestId.current += 1; };
  }, [enabled, refresh]);

  return { records, totalCount, isLoading, error, refresh };
}
