import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPredictionPage, PredictionFilters, PredictionRecord } from '../services/predictionData';

interface UsePredictionsResult {
  records: PredictionRecord[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePredictions(enabled: boolean, filters: PredictionFilters): UsePredictionsResult {
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const transformerIdsKey = filters.transformerIds?.join('\u0000') ?? null;

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const page = await fetchPredictionPage(filters);
      if (requestId.current !== currentRequest) return;
      setRecords(page.records);
      setTotalCount(page.totalCount);
    } catch (requestError) {
      if (requestId.current !== currentRequest) return;
      setRecords([]);
      setTotalCount(0);
      setError(requestError instanceof Error ? requestError.message : 'Unable to load predictions from Supabase.');
    } finally {
      if (requestId.current === currentRequest) setIsLoading(false);
    }
  }, [enabled, filters.page, filters.pageSize, filters.searchText, filters.transformerId, transformerIdsKey]);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  return { records, totalCount, isLoading, error, refresh };
}
