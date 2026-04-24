import type { AssessmentSetDto, DdlApiResponse, OrgNodeDto } from '@/src/Domain/Entities/Ddl';

type UnknownRecord = Record<string, unknown>;

export class DdlApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'DdlApiError';
  }
}

async function parseJsonOrNull(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const text = await response.text();
    return text || null;
  }

  return response.json();
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;

  const record = payload as UnknownRecord;
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }

  return fallback;
}

async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'GET',
    cache: 'no-store',
  });
  const payload = await parseJsonOrNull(response);

  if (!response.ok) {
    throw new DdlApiError(
      extractErrorMessage(payload, `Request failed (${response.status})`),
      response.status,
      payload,
    );
  }

  return payload as T;
}

function extractData<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as UnknownRecord;
  if (Array.isArray(record.data)) return record.data as T[];
  if (Array.isArray(record.Data)) return record.Data as T[];

  return [];
}

export async function fetchOrgNodes(): Promise<OrgNodeDto[]> {
  const payload = await get<DdlApiResponse<OrgNodeDto[]> | OrgNodeDto[]>(
    '/api/ddl/org-node',
  );
  return extractData<OrgNodeDto>(payload);
}

export async function fetchAssessmentSets(): Promise<AssessmentSetDto[]> {
  const payload = await get<DdlApiResponse<AssessmentSetDto[]> | AssessmentSetDto[]>(
    '/api/ddl/assessment-sets',
  );
  return extractData<AssessmentSetDto>(payload);
}
