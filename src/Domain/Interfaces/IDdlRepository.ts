import type { AssessmentSetDto, OrgNodeDto } from '@/src/Domain/Entities/Ddl';

/**
 * Contract for the upstream drop-down-list (DDL) data source.
 *
 * Provides reference data used by the dashboard filter bar (cycles, org tree).
 */
export interface IDdlRepository {
  listOrgNodes(): Promise<OrgNodeDto[]>;
  listAssessmentSets(): Promise<AssessmentSetDto[]>;
}
