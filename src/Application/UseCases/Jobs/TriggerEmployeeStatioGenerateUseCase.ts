import type {
  IStatioJobsService,
  TriggerEmployeeStatioGenerateInput,
  TriggerEmployeeStatioGenerateResult,
} from '@/src/Domain/Interfaces/IStatioJobsService';

/**
 * Triggers the upstream `employee-statio-generate` job for a given
 * assessment set + organization.
 *
 * The upstream API queues per-employee AI processing (the source of
 * `detail`, `qualityDetail`, `engageDetail`, etc. in `participant-details`).
 * Returns the upstream HTTP envelope so the controller can forward the
 * exact status + body to the client.
 */
export class TriggerEmployeeStatioGenerateUseCase {
  constructor(private readonly jobsService: IStatioJobsService) {}

  execute(
    input: TriggerEmployeeStatioGenerateInput,
  ): Promise<TriggerEmployeeStatioGenerateResult> {
    if (!Number.isInteger(input.assessmentSetId) || input.assessmentSetId <= 0) {
      return Promise.reject(new Error('Invalid assessmentSetId'));
    }
    if (!Number.isInteger(input.organizationId) || input.organizationId <= 0) {
      return Promise.reject(new Error('Invalid organizationId'));
    }
    return this.jobsService.triggerEmployeeStatioGenerate(input);
  }
}
