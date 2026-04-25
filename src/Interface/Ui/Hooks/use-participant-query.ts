import { useQuery } from '@tanstack/react-query';
import { fetchParticipantDetails, type DashboardQueryParams } from '@/src/Infrastructure/Persistence/OkrHttpRepository';
import type { ParticipantDetailRaw } from '@/src/Domain/Entities/Okr';

/**
 * Fetches participant check-in details for the given assessment period.
 */
interface UseParticipantQueryOptions {
  enabled?: boolean;
}

// ── TEMP MOCK: fair-ranking fields (API WIP) ───────────────────────────────
// Deterministic per-employee PRNG so scores are stable across re-renders.
function seeded(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mockPerformanceScores(list: ParticipantDetailRaw[]): ParticipantDetailRaw[] {
  const enriched = list.map((p) => {
    const rand = seeded(p.employeeId || 1);
    const goalAchievementScore = p.goalAchievementScore ??
      Math.max(5, Math.min(100, Math.round(p.avgPercent * 0.7 + rand() * 40 - 10)));
    const qualityScore = p.qualityScore ?? Math.round(40 + rand() * 60);
    const engagementBehaviorScore = p.engagementBehaviorScore ??
      Math.round(
        40 +
          (p.totalCheckInAll > 0 ? (p.totalCheckIn / p.totalCheckInAll) * 40 : 20) +
          rand() * 20 -
          Math.min(20, p.totalMissCheckIn * 4),
      );
    const engagementClamped = Math.max(10, Math.min(100, engagementBehaviorScore));
    const totalScore = p.totalScore ??
      Math.round(goalAchievementScore * 0.5 + qualityScore * 0.3 + engagementClamped * 0.2);
    const trendRoll = p.trend ?? (() => {
      const r2 = rand();
      return r2 < 0.35 ? 'up' : r2 < 0.70 ? 'normal' : 'down';
    })();

    return {
      ...p,
      goalAchievementScore,
      qualityScore,
      engagementBehaviorScore: engagementClamped,
      totalScore,
      trend: trendRoll as 'up' | 'normal' | 'down',
    };
  });

  enriched.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
  return enriched.map((p, i) => ({ ...p, seq: i + 1 }));
}
// TODO(api): Remove mockPerformanceScores once backend returns these fields.
// ──────────────────────────────────────────────────────────────────────────

export function useParticipantQuery(
  params: DashboardQueryParams,
  options?: UseParticipantQueryOptions,
) {
  return useQuery<ParticipantDetailRaw[], Error>({
    queryKey: ['participants', params] as const,
    queryFn: async () => {
      const raw = await fetchParticipantDetails(params);
      return mockPerformanceScores(raw);
    },
    enabled: options?.enabled ?? true,
  });
}
