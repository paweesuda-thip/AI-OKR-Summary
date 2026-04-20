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

/**
 * Sub-Objective with person-specific progress values.
 * See OKR_API_DOCS.md §5.1–5.2.
 */
export interface PersonSubObjective extends SubObjective {
  /** avg(details[].pointOKR) — for sub-OKR display */
  personProgress: number;
  /** min(personProgress, sub.progress) — for aggregating into main obj */
  personProgressCapped: number;
}

/**
 * Objective with person-specific progress and filtered sub-OKRs.
 * Only sub-OKRs where the person owns at least one KR are kept.
 * See OKR_API_DOCS.md §5.3.
 */
export interface PersonObjective extends Omit<Objective, 'subObjectives'> {
  subObjectives: PersonSubObjective[];
  /** avg(subObjectives[].personProgressCapped) */
  personProgress: number;
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
