import 'server-only';

import type { AssessmentSetDto, OrgNodeDto } from '@/src/Domain/Entities/Ddl';
import type { IDdlRepository } from '@/src/Domain/Interfaces/IDdlRepository';
import { UpstreamApiError } from '@/src/Domain/Exceptions';

const API_EMPEO_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.empeo.com';

const DDL_USER_ID = process.env.DDL_USER_ID;
const EMPEO_API_KEY = process.env.NEXT_PUBLIC_API_KEY_EMPEO;

type UnknownRecord = Record<string, unknown>;

export class DdlUpstreamError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'DdlUpstreamError';
  }
}

function extractDataArray<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (!json || typeof json !== 'object') return [];

  const payload = json as UnknownRecord;
  if (Array.isArray(payload.data)) return payload.data as T[];
  if (Array.isArray(payload.Data)) return payload.Data as T[];

  return [];
}

async function safeJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const text = await response.text();
    return text || null;
  }
  return response.json();
}

async function fetchFromUpstream(
  url: string,
  headers: Record<string, string>,
  options?: { method?: string; body?: unknown }
): Promise<unknown> {
  const method = options?.method ?? 'GET';
  const reqHeaders: Record<string, string> = { ...headers };
  let reqBody: string | undefined;

  if (options?.body) {
    reqHeaders['Content-Type'] = 'application/json';
    reqBody = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method,
    headers: reqHeaders,
    body: reqBody,
    cache: 'no-store',
  });

  const payload = await safeJson(response);
  if (!response.ok) {
    throw new DdlUpstreamError(
      `Upstream request failed: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
      payload,
    );
  }

  return payload;
}

export async function fetchOrgNodesFromUpstream() {
  if (!EMPEO_API_KEY) {
    throw new Error('Missing API_KEY_EMPEO');
  }

  const url = `${API_EMPEO_BASE_URL}/api/v1/organizations/node`;
  const payload = await fetchFromUpstream(
    url,
    { 'X-API-KEY-EMPEO': EMPEO_API_KEY },
    {
      method: 'POST',
      body: { userId: DDL_USER_ID ?? '' },
    }
  );

  return {
    status: { code: '1000', description: 'Success' },
    data: extractDataArray<OrgNodeDto>(payload),
  };
}

export async function fetchAssessmentSetsFromUpstream() {
  if (!EMPEO_API_KEY) {
    throw new Error('Missing API_KEY_EMPEO');
  }

  const url = `${API_EMPEO_BASE_URL}/api/v1/okr-kpi/assessment-sets`;
  const payload = await fetchFromUpstream(
    url,
    { 'X-API-KEY-EMPEO': EMPEO_API_KEY },
    {
      method: 'POST',
      body: { userId: DDL_USER_ID ?? '' },
    }
  );

  return {
    status: { code: '1000', description: 'Success' },
    data: extractDataArray<AssessmentSetDto>(payload),
  };
}

// ─── IDdlRepository implementation ─────────────────────────────────────────────

/**
 * Server-side `IDdlRepository` implementation.
 *
 * This is the repository consumed by Application UseCases; it talks to the
 * actual Empeo/Statio upstreams. The *client-side* DdlHttpRepository next door
 * is a different beast — it calls this project's own `/api/ddl/*` routes from
 * the browser, which in turn invoke this class.
 */
export class DdlServerRepository implements IDdlRepository {
  async listOrgNodes(): Promise<OrgNodeDto[]> {
    try {
      const { data } = await fetchOrgNodesFromUpstream();
      return data;
    } catch (err) {
      if (err instanceof DdlUpstreamError) {
        throw new UpstreamApiError(err.message, err.status, err.statusText, err.payload);
      }
      throw err;
    }
  }

  async listAssessmentSets(): Promise<AssessmentSetDto[]> {
    try {
      const { data } = await fetchAssessmentSetsFromUpstream();
      return data;
    } catch (err) {
      if (err instanceof DdlUpstreamError) {
        throw new UpstreamApiError(err.message, err.status, err.statusText, err.payload);
      }
      throw err;
    }
  }
}
