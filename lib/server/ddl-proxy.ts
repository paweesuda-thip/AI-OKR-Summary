import 'server-only';

import type { AssessmentSetDto, OrgNodeDto } from '@/lib/types/ddl';

const API_CORE_BASE_URL = process.env.NEXT_PUBLIC_API_CORE_BASE_URL ?? 'https://api-core.empeo.com';
const API_EMPEO_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.empeo.com';

const DDL_USER_ID = process.env.DDL_USER_ID;
const STATIO_GOFIVE_KEY = process.env.NEXT_PUBLIC_API_STATIO_GOFIVE_KEY;
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
): Promise<unknown> {
  const response = await fetch(url, {
    method: 'GET',
    headers,
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
  if (!STATIO_GOFIVE_KEY) {
    throw new Error('Missing API_STATIO_GOFIVE_KEY');
  }

  const url = `${API_CORE_BASE_URL}/api/v1/organizations/node?userId=${encodeURIComponent(DDL_USER_ID ?? '')}`;
  const payload = await fetchFromUpstream(url, {
    'X-API-STATIO-GOFIVE-KEY': STATIO_GOFIVE_KEY,
  });

  return {
    status: { code: '1000', description: 'Success' },
    data: extractDataArray<OrgNodeDto>(payload),
  };
}

export async function fetchAssessmentSetsFromUpstream() {
  if (!EMPEO_API_KEY) {
    throw new Error('Missing API_KEY_EMPEO');
  }

  const url = `${API_EMPEO_BASE_URL}/api/v1/okr-kpi/assessment-sets?userId=${encodeURIComponent(DDL_USER_ID ?? '')}`;
  const payload = await fetchFromUpstream(url, {
    'X-API-KEY-EMPEO': EMPEO_API_KEY,
  });

  return {
    status: { code: '1000', description: 'Success' },
    data: extractDataArray<AssessmentSetDto>(payload),
  };
}
