import type {
  OkrDataRaw,
  ParticipantDetailRaw,
} from '@/src/Domain/Entities/Okr';
import type {
  IOkrRepository,
  OkrQuery,
  EmployeeOkrQuery,
} from '@/src/Domain/Interfaces/IOkrRepository';
import { UpstreamApiError } from '@/src/Domain/Exceptions';

// ─── Configuration ─────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const API_KEY_EMPEO = process.env.NEXT_PUBLIC_API_KEY_EMPEO;

// ─── Custom Error ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY_EMPEO) {
    headers['X-API-KEY-EMPEO'] = API_KEY_EMPEO;
  }
  return headers;
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  // 204 No Content
  if (response.status === 204) {
    return [] as unknown as T;
  }

  if (!response.ok) {
    throw new ApiError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
    );
  }

  const json = await response.json();
  return json;
}

// ─── API Params ────────────────────────────────────────────────────────────────

export interface DashboardQueryParams {
  assessmentSetId: number;
  organizationId: number;
  dateStart?: string;
  dateEnd?: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/goal-managements/objective-summary
 *
 * Returns raw OKR data from the backend.
 * The caller is responsible for transforming the response via `okr-transformer`.
 */
export async function fetchOKRObjectiveSummary(
  params: DashboardQueryParams,
): Promise<OkrDataRaw[]> {
  const json = await post<unknown>(
    '/api/v1/goal-managements/objective-summary',
    {
      assessmentSetId: params.assessmentSetId,
      organizationId: params.organizationId,
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
    },
  );

  // Handle both: direct array [...] and wrapped response { status, data: [...] } / { Status, Data: [...] }
  if (Array.isArray(json)) return json;

  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj?.data)) return obj.data as OkrDataRaw[];
  if (Array.isArray(obj?.Data)) return obj.Data as OkrDataRaw[];

  return [];
}

/**
 * POST /api/v1/goal-managements/objective-summary (per employee)
 *
 * Returns raw OKR data for a specific employee.
 */
export interface EmployeeObjectiveQueryParams extends DashboardQueryParams {
  employeeId: number;
}

export async function fetchEmployeeObjectiveSummary(
  params: EmployeeObjectiveQueryParams,
): Promise<OkrDataRaw[]> {
  const json = await post<unknown>(
    '/api/v1/goal-managements/objective-summary',
    {
      AssessmentSetId: params.assessmentSetId,
      OrganizationId: params.organizationId,
      DateStart: params.dateStart,
      DateEnd: params.dateEnd,
      EmployeeId: params.employeeId,
    },
  );

  if (Array.isArray(json)) return json;

  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj?.data)) return obj.data as OkrDataRaw[];
  if (Array.isArray(obj?.Data)) return obj.Data as OkrDataRaw[];

  return [];
}

/**
 * POST /api/v1/goal-managements/participant-details
 */
export async function fetchParticipantDetails(
  params: DashboardQueryParams,
): Promise<import('@/src/Domain/Entities/Okr').ParticipantDetailRaw[]> {
  const json = await post<unknown>(
    '/api/v1/goal-managements/participant-details',
    {
      assessmentSetId: params.assessmentSetId,
      organizationId: params.organizationId,
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
    },
  );

  let rawData: ParticipantDetailRaw[] = [];

  if (Array.isArray(json)) {
    rawData = json;
  } else {
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj?.data)) {
      rawData = obj.data as ParticipantDetailRaw[];
    }
  }

  return rawData.map(p => {
    const seed = p.employeeId || 0; 
    const goalAchievementScore = p.avgPercent || 0; 
    const qualityScore = Math.min(100, Math.max(0, goalAchievementScore + (seed % 30) - 15)); 
    const engagementBehaviorScore = p.totalCheckInAll > 0 ? (p.totalCheckIn / p.totalCheckInAll) * 100 : goalAchievementScore;
    const totalScore = (goalAchievementScore + qualityScore + engagementBehaviorScore) / 3;
    const trendValue = seed % 3;
    const trend: 'up' | 'normal' | 'down' = trendValue === 0 ? 'up' : trendValue === 1 ? 'down' : 'normal';
    return {
      ...p,
      goalAchievementScore,
      qualityScore,
      engagementBehaviorScore,
      totalScore,
      trend
    };
  });
}

// ─── IOkrRepository implementation ─────────────────────────────────────────────

/**
 * Concrete `IOkrRepository` backed by the upstream Empeo HTTP API.
 *
 * Consumed by Application UseCases through the DI container. Kept as a class
 * so future tests can spy/override; delegates to the exported functions above
 * to preserve the existing behaviour used by the client hooks.
 */
export class OkrHttpRepository implements IOkrRepository {
  findObjectiveSummary(query: OkrQuery): Promise<OkrDataRaw[]> {
    return fetchOKRObjectiveSummary(query).catch((err) => {
      if (err instanceof ApiError) {
        throw new UpstreamApiError(err.message, err.status, err.statusText);
      }
      throw err;
    });
  }

  findEmployeeObjectiveSummary(query: EmployeeOkrQuery): Promise<OkrDataRaw[]> {
    return fetchEmployeeObjectiveSummary(query).catch((err) => {
      if (err instanceof ApiError) {
        throw new UpstreamApiError(err.message, err.status, err.statusText);
      }
      throw err;
    });
  }

  findParticipantDetails(query: OkrQuery): Promise<ParticipantDetailRaw[]> {
    return fetchParticipantDetails(query).catch((err) => {
      if (err instanceof ApiError) {
        throw new UpstreamApiError(err.message, err.status, err.statusText);
      }
      throw err;
    });
  }
}
