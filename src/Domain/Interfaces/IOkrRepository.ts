import type { OkrDataRaw, ParticipantDetailRaw } from '@/src/Domain/Entities/Okr';

/**
 * Query parameters shared by all OKR dashboard / participant endpoints.
 *
 * Kept as a plain type inside Domain because it is a pure data shape with no
 * framework coupling; no upstream SDK or HTTP client is referenced here.
 */
export interface OkrQuery {
  assessmentSetId: number;
  organizationId: number;
  dateStart?: string;
  dateEnd?: string;
}

export interface EmployeeOkrQuery extends OkrQuery {
  employeeId: number;
}

/**
 * Contract for fetching OKR data from the outside world.
 *
 * Implementations live in `src/Infrastructure/Persistence/` and are bound via
 * the DI container. Neither Application nor Interface code should call concrete
 * repositories directly — they depend on this interface.
 */
export interface IOkrRepository {
  findObjectiveSummary(query: OkrQuery): Promise<OkrDataRaw[]>;
  findEmployeeObjectiveSummary(query: EmployeeOkrQuery): Promise<OkrDataRaw[]>;
  findParticipantDetails(query: OkrQuery): Promise<ParticipantDetailRaw[]>;
}
