// Backend API models
export interface ApiResponse<T> {
  status: {
    code: string;
    description: string;
  };
  data: T;
}

export interface OkrDataRaw {
  objectiveId: number;
  objectiveOwnerType: number;
  objectiveType: number;
  referenceObjectiveId: number;
  ownerTeam: string;
  title: string;
  title_EN: string;
  progress: number;
  objectiveDetails: OkrObjectiveDetailRaw[];
}

export interface OkrObjectiveDetailRaw {
  objectiveId: number;
  objectiveOwnerType: number;
  ownerTeam?: string | null;
  title: string;
  title_EN: string;
  progress: number;
  progressUpdate: number;
  details: OkrDetailRaw[];
}

export interface OkrDetailRaw {
  keyId: number;
  fullName: string;
  fullName_EN: string;
  pictureUrl: string;
  title: string;
  pointCurrent: number;
  pointOKR: number;
}

// Internal mapped models
export interface KrDetail {
  fullName: string;
  pictureURL: string;
  krTitle: string;
  pointCurrent: number;
  pointOKR: number;
  krProgress: number;
  isDone: boolean;
}

export interface SubObjective {
  objectiveId: number;
  objectiveOwnerType: number;
  ownerTeam?: string | null;
  title: string;
  title_EN: string;
  progress: number;
  progressUpdate: number; // For date-filtered progress
  status: 'On Track' | 'At Risk' | 'Behind';
  details: KrDetail[];
}

export interface Objective {
  objectiveId: number;
  objectiveOwnerType: number;
  objectiveType: number;
  referenceObjectiveId: number;
  objectiveName: string;
  objectiveName_EN: string;
  ownerTeam: string;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Behind';
  impactLevel?: 'high' | 'medium' | 'low';
  subObjectives: SubObjective[];
  details: KrDetail[]; // Flattened from all subObjectives for backwards compatibility if needed
}

export interface ContributorSumObj {
    objectiveId: number;
    objectiveName: string;
    progress: number;
    status: 'On Track' | 'At Risk' | 'Behind';
}

export interface ContributorSum {
    fullName: string;
    pictureURL: string;
    totalPointCurrent: number;
    totalPointOKR: number;
    krCount: number;
    checkInCount: number;
    objectives: ContributorSumObj[];
    avgObjectiveProgress: number;
}

export interface TeamSummary {
    totalObjectives: number;
    completedObjectives: number;
    avgObjectiveProgress: number;
    totalKRs: number;
    completedKRs: number;
    totalContributors: number;
    objectiveCompletionRate: number;
    krCompletionRate: number;
    onTrackCount: number;
    atRiskCount: number;
    behindCount: number;
}

export interface DashboardData {
    teamSummary: TeamSummary;
    objectives: Objective[];
    contributors: ContributorSum[];
    atRiskObjectives: Objective[];
    noCheckInEmployees: ContributorSum[];
}

export interface ParticipantDetailRaw {
  seq: number;
  employeeId: number;
  fullName: string;
  fullName_EN: string;
  pictureURL: string;
  pictureMediumURL: string;
  pictureOriginalURL: string;
  totalCheckInAll: number;
  totalCheckIn: number;
  totalMissCheckInAll: number;
  totalMissCheckIn: number;
  avgPercent: number;
}

// ─── Extended types for new dashboard ─────────────────────────────────────────

export interface TeamComparisonData {
  teamId: string;
  teamName: string;
  logoColor: string;
  memberCount: number;
  avgProgress: number;
  krCompletionRate: number;
  checkInRate: number;
  consistencyScore: number;
  objectiveCount: number;
  onTrackPercent: number;
}

export interface HallOfFameEntry {
  employeeId: number;
  fullName: string;
  fullName_EN: string;
  pictureURL: string;
  teamName: string;
  place: number;
  compositeScore: number;
  weights: {
    krDifficulty: number;
    progressScore: number;
    checkInScore: number;
    consistencyScore: number;
  };
  avgPercent: number;
  totalCheckIn: number;
  streakWeeks: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface Suggestion {
  id: string;
  type: 'warning' | 'boost' | 'insight' | 'milestone';
  title: string;
  description: string;
  metric?: string;
  target?: string;
  urgency: 'high' | 'medium' | 'low';
}

export type TeamFilterMode = 'overall' | 'spartan' | 'pegasus' | 'unicorn' | 'product-owner';
