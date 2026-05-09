/**
 * Input shape for triggering the upstream `employee-statio-generate` job.
 * Pure data — no framework / SDK references so this can live in Domain.
 */
export interface TriggerEmployeeStatioGenerateInput {
  assessmentSetId: number;
  organizationId: number;
}

/**
 * Result returned by the upstream `employee-statio-generate` endpoint.
 * The upstream JSON shape is opaque from Domain's view — we only model the
 * HTTP envelope so callers (Controllers / Use Cases) can forward it verbatim.
 */
export interface TriggerEmployeeStatioGenerateResult {
  status: number;
  body: unknown;
}

/**
 * Contract for kicking off backend AI/processing jobs related to OKR analytics.
 *
 * Implementations live in `src/Infrastructure/ExternalServices/`. Application
 * UseCases depend on this interface, never on the concrete HTTP client.
 */
export interface IStatioJobsService {
  triggerEmployeeStatioGenerate(
    input: TriggerEmployeeStatioGenerateInput,
  ): Promise<TriggerEmployeeStatioGenerateResult>;
}
