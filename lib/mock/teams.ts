import { TeamComparisonData } from '@/lib/types/okr';

export const TEAM_CONFIG = {
  spartan: { id: 'spartan', name: 'Spartan', color: '#dc2626', accent: '#fbbf24' },
  pegasus: { id: 'pegasus', name: 'Pegasus', color: '#3b82f6', accent: '#60a5fa' },
  unicorn: { id: 'unicorn', name: 'Unicorn', color: '#a855f7', accent: '#c084fc' },
  'product-owner': { id: 'product-owner', name: 'Product Owner', color: '#f59e0b', accent: '#fcd34d' },
} as const;

export const mockTeamComparisons: TeamComparisonData[] = [
  {
    teamId: 'spartan',
    teamName: 'Spartan',
    logoColor: '#dc2626',
    memberCount: 8,
    avgProgress: 72.5,
    krCompletionRate: 68,
    checkInRate: 88,
    consistencyScore: 85,
    objectiveCount: 12,
    onTrackPercent: 75,
  },
  {
    teamId: 'pegasus',
    teamName: 'Pegasus',
    logoColor: '#3b82f6',
    memberCount: 6,
    avgProgress: 65.3,
    krCompletionRate: 55,
    checkInRate: 72,
    consistencyScore: 70,
    objectiveCount: 9,
    onTrackPercent: 56,
  },
  {
    teamId: 'unicorn',
    teamName: 'Unicorn',
    logoColor: '#a855f7',
    memberCount: 7,
    avgProgress: 80.1,
    krCompletionRate: 78,
    checkInRate: 92,
    consistencyScore: 90,
    objectiveCount: 10,
    onTrackPercent: 80,
  },
  {
    teamId: 'product-owner',
    teamName: 'Product Owner',
    logoColor: '#f59e0b',
    memberCount: 4,
    avgProgress: 58.7,
    krCompletionRate: 45,
    checkInRate: 65,
    consistencyScore: 55,
    objectiveCount: 6,
    onTrackPercent: 50,
  },
];

export function getTeamById(teamId: string): TeamComparisonData | undefined {
  return mockTeamComparisons.find(t => t.teamId === teamId);
}
