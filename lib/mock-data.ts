// ═══════════════════════════════════════════════════════════
// Mock Data for features without API support yet
// ═══════════════════════════════════════════════════════════

export interface TeamStats {
  teamName: string;
  avgProgress: number;
  checkInRate: number;
  objectiveCompletion: number;
  memberCount: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface HallOfFameEntry {
  employeeId: number;
  fullName: string;
  pictureURL: string;
  pictureMediumURL?: string;
  weightedScore: number;
  progressScore: number;
  consistencyRate: number;
  krDifficulty: number;
  streak: number;
  impactScore: number;
  paceGroup: string;
  paceGroupRank: number;
  paceGroupSize: number;
  trend: 'up' | 'down' | 'stable';
  avgPercent: number;
  totalCheckIn: number;
}

export interface Suggestion {
  id: string;
  type: 'action' | 'insight' | 'warning';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedObjective?: string;
  metric?: string;
}

// ── Team Comparison Mock Data ─────────────────────────────
export const mockTeams: TeamStats[] = [
  {
    teamName: "Spartan",
    avgProgress: 72.5,
    checkInRate: 88,
    objectiveCompletion: 65,
    memberCount: 12,
    trend: 'up',
    color: '#F7931A',
  },
  {
    teamName: "Alpha",
    avgProgress: 68.2,
    checkInRate: 82,
    objectiveCompletion: 58,
    memberCount: 9,
    trend: 'stable',
    color: '#3B82F6',
  },
  {
    teamName: "Bravo",
    avgProgress: 54.8,
    checkInRate: 71,
    objectiveCompletion: 42,
    memberCount: 11,
    trend: 'down',
    color: '#8B5CF6',
  },
  {
    teamName: "Delta",
    avgProgress: 61.0,
    checkInRate: 76,
    objectiveCompletion: 50,
    memberCount: 8,
    trend: 'up',
    color: '#10B981',
  },
];

// ── Hall of Fame Weight Config ────────────────────────────
export const WEIGHT_CONFIG = {
  krDifficulty: 0.25,
  progress: 0.30,
  consistency: 0.20,
  streak: 0.15,
  impact: 0.10,
};

// Generates weighted score from participant data + mock fields
export function generateHallOfFameEntries(
  participants: Array<{
    employeeId: number;
    fullName: string;
    pictureURL: string;
    pictureMediumURL?: string;
    avgPercent: number;
    totalCheckIn: number;
    totalCheckInAll: number;
  }>
): HallOfFameEntry[] {
  if (!participants || participants.length === 0) return [];

  return participants.map((p, index) => {
    // Real data
    const progressScore = Math.min(p.avgPercent, 100);
    const consistencyRate = p.totalCheckInAll > 0
      ? Math.round((p.totalCheckIn / p.totalCheckInAll) * 100)
      : 0;

    // Mock data (deterministic based on index for consistency)
    const seed = (p.employeeId || index) % 100;
    const krDifficulty = 2 + ((seed * 7) % 30) / 10; // 2.0 - 5.0
    const streak = Math.max(1, ((seed * 3) % 12)); // 1-12 weeks
    const impactScore = 40 + ((seed * 11) % 60); // 40-100

    // Weighted score calculation
    const weightedScore = Math.round(
      (krDifficulty / 5 * 100) * WEIGHT_CONFIG.krDifficulty +
      progressScore * WEIGHT_CONFIG.progress +
      consistencyRate * WEIGHT_CONFIG.consistency +
      (streak / 12 * 100) * WEIGHT_CONFIG.streak +
      impactScore * WEIGHT_CONFIG.impact
    );

    return {
      employeeId: p.employeeId,
      fullName: p.fullName,
      pictureURL: p.pictureURL,
      pictureMediumURL: p.pictureMediumURL,
      weightedScore,
      progressScore,
      consistencyRate,
      krDifficulty: Math.round(krDifficulty * 10) / 10,
      streak,
      impactScore,
      paceGroup: '',
      paceGroupRank: 0,
      paceGroupSize: 0,
      trend: (seed % 3 === 0 ? 'up' : seed % 3 === 1 ? 'stable' : 'down') as 'up' | 'down' | 'stable',
      avgPercent: p.avgPercent,
      totalCheckIn: p.totalCheckIn,
    };
  })
  .sort((a, b) => b.weightedScore - a.weightedScore)
  .map((entry, index, arr) => {
    // Assign pace groups
    let paceGroup: string;
    if (index < 3) paceGroup = 'Elite';
    else if (index < Math.ceil(arr.length * 0.3)) paceGroup = 'Strong';
    else if (index < Math.ceil(arr.length * 0.6)) paceGroup = 'Growing';
    else paceGroup = 'Building';

    const groupMembers = arr.filter((_, i) => {
      if (index < 3) return i < 3;
      if (index < Math.ceil(arr.length * 0.3)) return i >= 3 && i < Math.ceil(arr.length * 0.3);
      if (index < Math.ceil(arr.length * 0.6)) return i >= Math.ceil(arr.length * 0.3) && i < Math.ceil(arr.length * 0.6);
      return i >= Math.ceil(arr.length * 0.6);
    });

    const groupStartIdx = arr.indexOf(groupMembers[0]);

    return {
      ...entry,
      paceGroup,
      paceGroupRank: index - groupStartIdx + 1,
      paceGroupSize: groupMembers.length,
    };
  });
}

// ── Generate Suggestions from real data ───────────────────
export function generateSuggestions(
  objectives: Array<{ objectiveName: string; progress: number; status: string; details?: Array<{ pointCurrent: number }> }>,
  avgProgress: number,
  participantCount: number,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Find at-risk objectives
  const atRisk = objectives.filter(o => o.status === 'At Risk' || o.status === 'Behind');
  if (atRisk.length > 0) {
    suggestions.push({
      id: 'at-risk-objs',
      type: 'warning',
      title: `${atRisk.length} Objective${atRisk.length > 1 ? 's' : ''} Need${atRisk.length === 1 ? 's' : ''} Acceleration`,
      description: `${atRisk.map(o => `"${o.objectiveName.slice(0, 40)}…"`).slice(0, 2).join(', ')} ${atRisk.length > 2 ? `and ${atRisk.length - 2} more` : ''} are falling behind. Review blockers with the team.`,
      priority: 'high',
      relatedObjective: atRisk[0]?.objectiveName,
      metric: `${atRisk.length} at risk`,
    });
  }

  // Check-in gap suggestion
  if (avgProgress < 60) {
    suggestions.push({
      id: 'low-progress',
      type: 'action',
      title: 'Team Average Below Target',
      description: `Current average progress is ${avgProgress.toFixed(1)}%. Consider scheduling a mid-cycle sync to align on priorities and remove blockers.`,
      priority: 'high',
      metric: `${avgProgress.toFixed(1)}% avg`,
    });
  }

  // High performers insight
  const highPerformers = objectives.filter(o => o.progress >= 80);
  if (highPerformers.length > 0) {
    suggestions.push({
      id: 'high-performers',
      type: 'insight',
      title: `${highPerformers.length} Objective${highPerformers.length > 1 ? 's' : ''} Exceeding Expectations`,
      description: `Strong momentum on ${highPerformers.slice(0, 2).map(o => `"${o.objectiveName.slice(0, 30)}…"`).join(' and ')}. Consider sharing best practices across teams.`,
      priority: 'low',
      metric: `${highPerformers.length} excelling`,
    });
  }

  // Team size insight
  if (participantCount > 0 && objectives.length > 0) {
    const ratio = (objectives.length / participantCount).toFixed(1);
    suggestions.push({
      id: 'team-ratio',
      type: 'insight',
      title: 'OKR Distribution Check',
      description: `${participantCount} team members across ${objectives.length} objectives (${ratio} per person avg). ${Number(ratio) > 3 ? 'Consider focusing on fewer objectives for deeper impact.' : 'Good distribution ratio.'}`,
      priority: 'medium',
      metric: `${ratio}:1 ratio`,
    });
  }

  return suggestions.slice(0, 4);
}
