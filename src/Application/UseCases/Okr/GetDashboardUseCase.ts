import type { IOkrRepository, OkrQuery } from '@/src/Domain/Interfaces/IOkrRepository';
import type { DashboardData } from '@/src/Domain/Entities/Okr';
import { transformDashboardData } from '@/src/Infrastructure/Persistence/Mappers/OkrMapper';

/**
 * Load the full dashboard view (objectives + contributors + summary) for
 * a given assessment set / organisation / date range.
 *
 * Currently invoked only from a client hook via the future `/api/okr/dashboard`
 * route; exposed through the container so Server Components can call it
 * directly without an HTTP hop.
 */
export class GetDashboardUseCase {
  constructor(private readonly repo: IOkrRepository) {}

  async execute(query: OkrQuery): Promise<DashboardData> {
    const raw = await this.repo.findObjectiveSummary(query);
    return transformDashboardData(raw);
  }
}
