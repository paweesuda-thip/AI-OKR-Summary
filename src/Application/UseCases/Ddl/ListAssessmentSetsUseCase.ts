import type { IDdlRepository } from '@/src/Domain/Interfaces/IDdlRepository';
import type { AssessmentSetDto } from '@/src/Domain/Entities/Ddl';

/**
 * List the OKR assessment-set (cycle) drop-down options.
 */
export class ListAssessmentSetsUseCase {
  constructor(private readonly repo: IDdlRepository) {}

  execute(): Promise<AssessmentSetDto[]> {
    return this.repo.listAssessmentSets();
  }
}
