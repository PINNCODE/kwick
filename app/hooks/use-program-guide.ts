import useSWR from 'swr';
import { xtreamApi } from '../lib/xtream-api';
import { EpgListing } from '../types/xtream';

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export function useProgramGuide(streamId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<EpgListing[]>(
    streamId ? `/epg/${streamId}` : null,
    async () => {
      if (!streamId) return [];
      return xtreamApi.getEPG(streamId);
    },
    {
      refreshInterval: streamId ? REFRESH_INTERVAL : 0,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      shouldRetryOnError: false,
    }
  );

  return {
    programs: data || [],
    isLoading,
    error,
    retry: () => mutate(),
  };
}
