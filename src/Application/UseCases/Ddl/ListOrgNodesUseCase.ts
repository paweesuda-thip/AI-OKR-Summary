import type { IDdlRepository } from '@/src/Domain/Interfaces/IDdlRepository';
import type { OrgNodeDto } from '@/src/Domain/Entities/Ddl';

/**
 * List every organisation node accessible to the current user.
 *
 * Thin orchestration: no business rules today — kept as a class so new
 * behaviour (e.g. pruning hidden teams) can be added without churn in the
 * controller or route handler.
 */
export class ListOrgNodesUseCase {
  constructor(private readonly repo: IDdlRepository) {}

  execute(): Promise<OrgNodeDto[]> {
    return this.repo.listOrgNodes();
  }
}
