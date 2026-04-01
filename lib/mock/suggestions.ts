import { Suggestion, TeamSummary, Objective } from '@/lib/types/okr';

export function generateSuggestions(
  summary: TeamSummary | null,
  objectives: Objective[]
): Suggestion[] {
  if (!summary) return [];
  const s: Suggestion[] = [];
  const avg = summary.avgObjectiveProgress;
  const gap = ((100 - avg) / 6).toFixed(1);

  if (avg < 70) {
    s.push({ id: 'pace', type: 'warning', title: 'Below target pace', description: `Need +${gap}%/week to hit 70% by quarter end.`, metric: `${avg.toFixed(1)}%`, target: '70%', urgency: 'high' });
  } else if (avg < 90) {
    s.push({ id: 'boost', type: 'boost', title: 'Push for excellence', description: `At ${avg.toFixed(1)}% — a strong final push could reach 90%+.`, metric: `${avg.toFixed(1)}%`, target: '90%', urgency: 'medium' });
  }

  if (summary.behindCount > 0) {
    s.push({ id: 'behind', type: 'warning', title: `${summary.behindCount} objectives behind`, description: 'Focus resources on lagging objectives to recover.', urgency: 'high' });
  }

  if (summary.atRiskCount > 0) {
    s.push({ id: 'atrisk', type: 'insight', title: `${summary.atRiskCount} at risk`, description: 'Review blockers and reallocate support where needed.', urgency: 'medium' });
  }

  const topObj = objectives.filter(o => o.progress >= 90);
  if (topObj.length > 0) {
    s.push({ id: 'milestone', type: 'milestone', title: `${topObj.length} near completion`, description: 'Final check-ins could close these objectives this cycle.', urgency: 'low' });
  }

  if (summary.krCompletionRate < 50) {
    s.push({ id: 'kr-lag', type: 'warning', title: 'KR completion lagging', description: `Only ${summary.krCompletionRate}% of KRs done. Prioritize key results.`, urgency: 'high' });
  }

  return s;
}
