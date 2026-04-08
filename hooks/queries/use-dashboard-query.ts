import { useQuery } from '@tanstack/react-query';
import { fetchOKRObjectiveSummary, type DashboardQueryParams } from '@/lib/api/okr-api';
import { transformDashboardData } from '@/lib/transformers/okr-transformer';
import type { DashboardData, TeamSummary } from '@/lib/types/okr';

/**
 * Fetches + transforms the OKR objective summary into full dashboard data.
 *
 * The `select` option transforms raw API data into the `DashboardData` shape
 * so all consumers get the same derived structure for free.
 */
export function useDashboardQuery(params: DashboardQueryParams) {
  return useQuery<import('@/lib/types/okr').OkrDataRaw[], Error, DashboardData>({
    queryKey: ['dashboard', params] as const,
    queryFn: () => fetchOKRObjectiveSummary(params),
    select: transformDashboardData,
  });
}
