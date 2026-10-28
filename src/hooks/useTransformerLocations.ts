import { useCallback, useEffect, useState } from 'react';
import { fetchAllTransformers, TransformerRecord } from '../services/transformerData';

export type MapTransformer = TransformerRecord & { latitude: number; longitude: number };

interface UseTransformerLocationsResult {
  allTransformers: TransformerRecord[];
  transformers: MapTransformer[];
  isLoading: boolean;
  error: string | null;
}

export function useTransformerLocations(refreshIntervalMs: number | null = null): UseTransformerLocationsResult {
  const [allTransformers, setAllTransformers] = useState<TransformerRecord[]>([]);
  const [transformers, setTransformers] = useState<MapTransformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransformers = useCallback(async (isActive: () => boolean) => {
    try {
      const rows = await fetchAllTransformers();
      if (!isActive()) return;
      setAllTransformers(rows);
      setTransformers(rows.filter((row): row is MapTransformer => row.latitude !== null && row.longitude !== null));
      setError(null);
    } catch (requestError) {
      if (isActive()) setError(requestError instanceof Error ? requestError.message : 'Unknown Supabase request error.');
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const isActive = () => active;
    setIsLoading(true);
    void loadTransformers(isActive);

    const timer = refreshIntervalMs === null
      ? undefined
      : window.setInterval(() => void loadTransformers(isActive), refreshIntervalMs);

    return () => {
      active = false;
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [loadTransformers, refreshIntervalMs]);

  return { allTransformers, transformers, isLoading, error };
}
