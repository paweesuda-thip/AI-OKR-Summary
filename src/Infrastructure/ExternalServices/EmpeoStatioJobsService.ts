import 'server-only';

import type {
  IStatioJobsService,
  TriggerEmployeeStatioGenerateInput,
  TriggerEmployeeStatioGenerateResult,
} from '@/src/Domain/Interfaces/IStatioJobsService';
import { UpstreamApiError } from '@/src/Domain/Exceptions';

/**
 * Concrete `IStatioJobsService` backed by the Empeo HTTP API.
 *
 * POST {API_BASE_URL}/api/v1/services/jobs/employee-statio-generate
 *   ?assessmentSetId=...&organizationId=...
 *   header: X-API-KEY-EMPEO
 *
 * Server-only — the API key never leaves the server. The browser hits our
 * own route handler, which delegates here.
 */
export class EmpeoStatioJobsService implements IStatioJobsService {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  constructor() {
    // Reuse the public base URL var so dev/prod stays consistent with the
    // existing repository. The API key prefers a server-only var; falls back
    // to the existing public one for backwards-compat.
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY_EMPEO;
  }

  async triggerEmployeeStatioGenerate(
    input: TriggerEmployeeStatioGenerateInput,
  ): Promise<TriggerEmployeeStatioGenerateResult> {
    if (!this.apiKey) {
      throw new Error('Empeo API key is not configured');
    }

    const url = new URL(
      '/api/v1/services/jobs/employee-statio-generate',
      this.baseUrl,
    );
    url.searchParams.set('assessmentSetId', String(input.assessmentSetId));
    url.searchParams.set('organizationId', String(input.organizationId));

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'X-API-KEY-EMPEO': this.apiKey },
    });

    // Read body once. Try JSON first; fall back to text for non-JSON responses
    // (e.g. plain "queued" messages) so the caller can still see what was sent.
    const rawText = await response.text();
    let body: unknown;
    try {
      body = rawText ? JSON.parse(rawText) : null;
    } catch {
      body = rawText;
    }

    if (!response.ok) {
      throw new UpstreamApiError(
        `employee-statio-generate failed: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        body,
      );
    }

    return { status: response.status, body };
  }
}
