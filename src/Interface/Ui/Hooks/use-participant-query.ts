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
    const goalAchievementRounded = Math.round(goalAchievementScore);
    const qualityRounded = Math.round(qualityScore);
    const engagementRounded = Math.round(engagementClamped);
    const totalRounded = Math.round(totalScore);
    
    // Generate contextual feedback based on scores
    const goalFeedback = goalAchievementRounded >= 70 
      ? 'บรรลุเป้าหมายได้ตามที่ตั้งไว้ โดยเฉพาะ OKR ด้านการพัฒนาสินค้าและการขายที่ทำได้เกินเป้า'
      : goalAchievementRounded >= 50 
      ? 'มีความก้าวหน้าในระดับที่น่าพอใจ แต่ยังมีช่องว่างใน OKR ด้านการตลาดที่ต้องเร่งรัด'
      : 'ต้องการการปรับปรุงในการติดตามเป้าหมาย โดยเฉพาะ OKR ด้านลูกค้าที่ยังทำได้ไม่เต็มที่';
    
    const qualityFeedback = qualityRounded >= 70
      ? 'ส่งมอบงานได้คุณภาพสูง มีการ review code และ testing ที่ครบถ้วน'
      : qualityRounded >= 50
      ? 'คุณภาพงานอยู่ในระดับที่ยอมรับได้ แต่มี feedback เรื่อง bug เล็กน้อยที่ควรแก้ไข'
      : 'มีรายงานปัญหาคุณภาพงานที่ต้องเร่งแก้ไข เพื่อให้ตรงตามมาตรฐานทีม';
    
    const engagementFeedback = engagementRounded >= 70
      ? 'เข้าร่วม check-in ครบทุกครั้ง มีการ update progress สม่ำเสมอและช่วยเหลือทีมเสมอ'
      : engagementRounded >= 50
      ? 'มีการเข้าร่วมที่ดี แต่พลาด check-in ไปบางครั้ง ควรปรับปรุงความสม่ำเสมอ'
      : 'ขาดการเข้าร่วม check-in บ่อยครั้ง ต้องส่งเสริมการมีส่วนร่วมในกิจกรรมทีม';

    const aiScoreReason = p.aiScoreReason ?? 
      `คะแนนรวม ${totalRounded} คะแนน จากการประเมิน 3 ด้านหลัก: ` +
      `1) ผลงาน (${goalAchievementRounded} คะแนน) - ${goalFeedback}. ` +
      `2) คุณภาพ (${qualityRounded} คะแนน) - ${qualityFeedback}. ` +
      `3) ความตั้งใจ (${engagementRounded} คะแนน) - ${engagementFeedback}. ` +
      `${trendRoll === 'up' ? 'แนวโน้มดีขึ้น' : trendRoll === 'down' ? 'แนวโน้มลดลง' : 'ทรงตัว'} ` +
      `เมื่อเทียบกับรอบก่อน โดยรวม ${totalRounded >= 70 ? 'เป็นผลงานที่โดดเด่น ควรรักษามาตรฐานนี้ต่อไป' : totalRounded >= 50 ? 'อยู่ในระดับที่ดี มีศักยภาพพัฒนาได้อีก' : 'ต้องปรับปรุงอย่างเร่งด่วน แนะนำให้คุยกับหัวหน้างาน'}`;

    return {
      ...p,
      goalAchievementScore,
      qualityScore,
      engagementBehaviorScore: engagementClamped,
      totalScore,
      trend: trendRoll as 'up' | 'normal' | 'down',
      aiScoreReason,
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
