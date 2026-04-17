import { useQuery } from '@tanstack/react-query';
import { fetchOKRObjectiveSummary, type DashboardQueryParams } from '@/lib/api/okr-api';
import { transformDashboardData } from '@/lib/transformers/okr-transformer';
import type { DashboardData } from '@/lib/types/okr';

/**
 * Fetches + transforms the OKR objective summary into full dashboard data.
 *
 * The `select` option transforms raw API data into the `DashboardData` shape
 * so all consumers get the same derived structure for free.
 */
interface UseDashboardQueryOptions {
  enabled?: boolean;
}

export function useDashboardQuery(
  params: DashboardQueryParams,
  options?: UseDashboardQueryOptions,
) {
  return useQuery<import('@/lib/types/okr').OkrDataRaw[], Error, DashboardData>({
    queryKey: ['dashboard', params] as const,
    queryFn: () => fetchOKRObjectiveSummary(params),
    select: transformDashboardData,
    enabled: options?.enabled ?? true,
  });
}
