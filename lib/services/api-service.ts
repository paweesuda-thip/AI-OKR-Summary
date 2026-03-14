import axios from 'axios';
import { OkrObjectiveRaw, OkrContributorRaw, KrDetail, Objective, ContributorSum, ContributorSumObj, TeamSummary, DashboardData } from '../types/okr';

// Use explicit backend base URL so requests go directly to the API host.
// In development, you can set VITE_API_BASE_URL to '' (empty) to proxy through Vite dev server (no CORS/preflight).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// This API is authenticated via Empeo API key.
// No longer required: Authorization Bearer token.
const API_KEY_EMPEO = process.env.NEXT_PUBLIC_API_KEY_EMPEO;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // Note: we still set this here so any direct use of apiClient has it.
        ...(API_KEY_EMPEO && { 'X-API-KEY-EMPEO': API_KEY_EMPEO }),
    },
});

apiClient.interceptors.request.use(
    (config) => {
        // Always attach API key header (in case env changed or request override)
        if (API_KEY_EMPEO) {
            config.headers.set('X-API-KEY-EMPEO', API_KEY_EMPEO);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ─── Mapping ───────────────────────────────────────────────────────────────────

/**
 * Map a single raw API item to internal format.
 *
 * Actual response uses PascalCase:
 * {
 *   ObjectiveId, Title, Title_EN, OwnerTeam, Progress,
 *   Details: [{ FullName, PictureURL, Title, PointCurrent, PointOKR }]
 * }
 *
 * Also handles the camelCase spec shape just in case:
 * { objectiveId, title, title_EN, ownerEmployeeFullName, ownerTeam, progress,
 *   contributors: [{ employeeName, pictureUrl, keyResultTitle, pointCurrent, pointOKR }] }
 */
function mapObjective(item: OkrObjectiveRaw): Objective {
    // Support both PascalCase (actual) and camelCase (spec)
    const progress = item.Progress ?? item.progress ?? 0;
    const rawDetails: OkrContributorRaw[] = item.Details ?? item.details ?? item.Contributors ?? item.contributors ?? [];

    const details: KrDetail[] = rawDetails.map((d: OkrContributorRaw) => {
        // PascalCase: FullName, PictureURL, Title, PointCurrent, PointOKR
        // camelCase:  fullName, pictureURL, title, pointCurrent, pointOKR
        const pointCurrent = d.PointCurrent ?? d.pointCurrent ?? 0;
        const pointOKR = d.PointOKR ?? d.pointOKR ?? 0;
        const krProgress = pointOKR > 0 ? Math.round((pointCurrent / pointOKR) * 100) : 0;

        return {
            fullName: d.FullName ?? d.fullName ?? d.employeeName ?? '',
            pictureURL: d.PictureURL ?? d.pictureURL ?? d.pictureUrl ?? '',
            krTitle: d.Title ?? d.title ?? d.keyResultTitle ?? '',
            pointCurrent,
            pointOKR,
            krProgress,
            isDone: pointOKR > 0 && pointCurrent >= pointOKR,
        };
    });

    return {
        objectiveId: item.ObjectiveId ?? item.objectiveId ?? 0,
        objectiveName: (item.Title ?? item.title ?? '').trim(),
        objectiveName_EN: (item.Title_EN ?? item.title_EN ?? '').trim(),
        ownerName: item.OwnerEmployeeFullName ?? item.ownerEmployeeFullName ?? '',
        ownerTeam: item.OwnerTeam ?? item.ownerTeam ?? '',
        progress,
        status: progress >= 70 ? 'On Track' : progress >= 40 ? 'At Risk' : 'Behind',
        impactLevel: progress >= 80 ? 'high' : progress >= 60 ? 'medium' : 'low',
        details,
    };
}

function calculateSummary(objectives: Objective[]): TeamSummary {
    const total = objectives.length;
    const completed = objectives.filter((o) => o.progress >= 70).length;
    const avgProgress = total > 0
        ? Math.round(objectives.reduce((s, o) => s + o.progress, 0) / total * 10) / 10
        : 0;

    const allDetails = objectives.flatMap((o) => o.details);
    const totalKRs = allDetails.length;
    const completedKRs = allDetails.filter((d) => d.isDone).length;
    const uniqueNames = new Set(allDetails.map((d) => d.fullName).filter(Boolean));

    return {
        totalObjectives: total,
        completedObjectives: completed,
        avgObjectiveProgress: avgProgress,
        totalKRs,
        completedKRs,
        totalContributors: uniqueNames.size,
        objectiveCompletionRate: total > 0 ? Math.round(completed / total * 100) : 0,
        krCompletionRate: totalKRs > 0 ? Math.round(completedKRs / totalKRs * 100) : 0,
        onTrackCount: objectives.filter((o) => o.status === 'On Track').length,
        atRiskCount: objectives.filter((o) => o.status === 'At Risk').length,
        behindCount: objectives.filter((o) => o.status === 'Behind').length,
    };
}

function aggregateContributors(objectives: Objective[]): ContributorSum[] {
    const map = new Map();

    objectives.forEach((obj) => {
        obj.details.forEach((d) => {
            if (!d.fullName) return;
            if (!map.has(d.fullName)) {
                map.set(d.fullName, {
                    fullName: d.fullName,
                    pictureURL: d.pictureURL,
                    totalPointCurrent: 0,
                    totalPointOKR: 0,
                    krCount: 0,
                    checkInCount: 0,
                    objectives: [],
                });
            }
            const c = map.get(d.fullName);
            c.totalPointCurrent += d.pointCurrent;
            c.totalPointOKR += d.pointOKR;
            c.krCount++;
            if (d.pointCurrent > 0) c.checkInCount++;
            if (!c.objectives.find((o: ContributorSumObj) => o.objectiveId === obj.objectiveId)) {
                c.objectives.push({
                    objectiveId: obj.objectiveId,
                    objectiveName: obj.objectiveName,
                    progress: obj.progress,
                    status: obj.status,
                });
            }
        });
    });

    const list: ContributorSum[] = [...map.values()].map((c: ContributorSum) => ({
        ...c,
        avgObjectiveProgress: c.objectives.length > 0
            ? Math.round(c.objectives.reduce((s: number, o: ContributorSumObj) => s + o.progress, 0) / c.objectives.length)
            : 0,
    }));

    // Sort by avgObjectiveProgress DESC, then checkInCount DESC as tiebreaker
    list.sort((a, b) => {
        if (b.avgObjectiveProgress !== a.avgObjectiveProgress) {
            return b.avgObjectiveProgress - a.avgObjectiveProgress;
        }
        return b.checkInCount - a.checkInCount;
    });

    return list;
}

// ─── API Service ──────────────────────────────────────────────────────────────

const apiService = {
    /**
     * POST /api/okr/objective-summary
     *
     * Response: { status, data: [...] } or direct array [...]
     * 204 No Content → empty result
     */
    async getOKRTeamDashboard(params: { assessmentSetId: number, organizationId: number }): Promise<DashboardData> {
        try {
            const response = await apiClient.post('/api/v1/goal-managements/objective-summary', {
                assessmentSetId: params.assessmentSetId,
                organizationId: params.organizationId,
            });

            // 204 No Content
            if (response.status === 204 || !response.data) {
                const empty = calculateSummary([]);
                return { teamSummary: empty, objectives: [], contributors: [], atRiskObjectives: [], noCheckInEmployees: [] };
            }

            // Handle both: direct array [...] and wrapped response { status, data: [...] } / { Status, Data: [...] }
            const raw: OkrObjectiveRaw[] = Array.isArray(response.data)
                ? response.data
                : (Array.isArray(response.data?.data)
                    ? response.data.data
                    : (Array.isArray(response.data?.Data) ? response.data.Data : []));

            const objectives: Objective[] = raw.map((item) => mapObjective(item));
            const teamSummary = calculateSummary(objectives);
            const contributors = aggregateContributors(objectives);
            const atRiskObjectives = objectives.filter((o) => o.progress < 70);
            const noCheckInEmployees = contributors.filter((c) => c.checkInCount === 0);

            return { teamSummary, objectives, contributors, atRiskObjectives, noCheckInEmployees };
        } catch (error) {
            console.error('Error fetching OKR objective summary:', error);
            throw error;
        }
    },

    /**
     * POST /api/v1/goal-managements/participant-details
     */
    async getParticipantDetails(params: {
        assessmentSetId: number,
        organizationId: number,
        dateStart?: string,
        dateEnd?: string
    }): Promise<import('../types/okr').ParticipantDetailRaw[]> {
        try {
            const response = await apiClient.post('/api/v1/goal-managements/participant-details', {
                assessmentSetId: params.assessmentSetId,
                organizationId: params.organizationId,
                dateStart: params.dateStart,
                dateEnd: params.dateEnd,
            });

            if (response.status === 204 || !response.data) {
                return [];
            }

            return Array.isArray(response.data?.data) ? response.data.data : [];
        } catch (error) {
            console.error('Error fetching participant details:', error);
            throw error;
        }
    },
};

export default apiService;
