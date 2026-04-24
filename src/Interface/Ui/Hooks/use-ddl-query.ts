import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAssessmentSets, fetchOrgNodes } from '@/src/Infrastructure/Persistence/DdlHttpRepository';
import {
  mapAssessmentSetsToCycleOptions,
  mapOrgTreeToGroupedOrgOptions,
  type GroupedOrgOption,
  type CycleOption,
} from '@/src/Interface/Ui/utils/org-leaf';

interface UseDdlOptions {
  rootOrganizationId?: number;
  groupLabelFilter?: string;
}

export function useAssessmentSetsQuery() {
  return useQuery({
    queryKey: ['ddl', 'assessment-sets'] as const,
    queryFn: fetchAssessmentSets,
    select: mapAssessmentSetsToCycleOptions,
  });
}

export function useOrgNodeQuery(options?: UseDdlOptions) {
  const query = useQuery({
    queryKey: ['ddl', 'org-node'] as const,
    queryFn: fetchOrgNodes,
  });

  const groupedOrgOptions = useMemo<GroupedOrgOption[]>(() => {
    if (!query.data) return [];
    return mapOrgTreeToGroupedOrgOptions(query.data, {
      rootOrganizationId: options?.rootOrganizationId,
      groupLabelFilter: options?.groupLabelFilter,
    });
  }, [query.data, options?.groupLabelFilter, options?.rootOrganizationId]);

  return {
    ...query,
    groupedOrgOptions,
  };
}

export function useDdlOptions(options?: UseDdlOptions) {
  const cycleQuery = useAssessmentSetsQuery();
  const orgQuery = useOrgNodeQuery(options);

  const cycleOptions = cycleQuery.data ?? ([] as CycleOption[]);
  const groupedOrgOptions = orgQuery.groupedOrgOptions ?? [];

  return {
    cycleOptions,
    groupedOrgOptions,
    isLoading: cycleQuery.isLoading || orgQuery.isLoading,
    isFetching: cycleQuery.isFetching || orgQuery.isFetching,
    error: cycleQuery.error ?? orgQuery.error ?? null,
  };
}
