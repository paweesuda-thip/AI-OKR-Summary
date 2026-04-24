import { useQuery } from '@tanstack/react-query';
import { fetchOKRObjectiveSummary, type DashboardQueryParams } from '@/src/Infrastructure/Persistence/OkrHttpRepository';
import { transformDashboardData } from '@/src/Infrastructure/Persistence/Mappers/OkrMapper';
import type { DashboardData } from '@/src/Domain/Entities/Okr';

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
  return useQuery<import('@/src/Domain/Entities/Okr').OkrDataRaw[], Error, DashboardData>({
    queryKey: ['dashboard', params] as const,
    queryFn: () => fetchOKRObjectiveSummary(params),
    select: transformDashboardData,
    enabled: options?.enabled ?? true,
  });
}
