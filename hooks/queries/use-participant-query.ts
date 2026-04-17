import { useQuery } from '@tanstack/react-query';
import { fetchParticipantDetails, type DashboardQueryParams } from '@/lib/api/okr-api';
import type { ParticipantDetailRaw } from '@/lib/types/okr';

/**
 * Fetches participant check-in details for the given assessment period.
 */
interface UseParticipantQueryOptions {
  enabled?: boolean;
}

export function useParticipantQuery(
  params: DashboardQueryParams,
  options?: UseParticipantQueryOptions,
) {
  return useQuery<ParticipantDetailRaw[], Error>({
    queryKey: ['participants', params] as const,
    queryFn: () => fetchParticipantDetails(params),
    enabled: options?.enabled ?? true,
  });
}
