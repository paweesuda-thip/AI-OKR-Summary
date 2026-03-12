// Backend C# model: OkrObjectiveContributorModel
export interface OkrContributorRaw {
    // JsonProperty mapped fields from C# backend
    FullName?: string;        // EmployeeName mapped to FullName
    PictureURL?: string;      // PictureUrl mapped to PictureURL  
    Title?: string;           // KeyResultTitle mapped to Title
    
    // Direct C# properties
    PointCurrent?: number;
    PointOKR?: number;
    
    // Fallback properties for compatibility
    fullName?: string;
    employeeName?: string;
    pictureURL?: string;
    pictureUrl?: string;
    title?: string;
    keyResultTitle?: string;
    pointCurrent?: number;
    pointOKR?: number;
}

// Backend C# model: OkrObjectiveSummaryModel
export interface OkrObjectiveRaw {
    // Direct C# properties
    ObjectiveId?: number;
    Title?: string;
    Title_EN?: string;
    OwnerEmployeeFullName?: string;
    OwnerTeam?: string;
    Progress?: number;
    
    // JsonProperty mapped field - Contributors mapped to Details
    Details?: OkrContributorRaw[];
    
    // Fallback properties for compatibility
    objectiveId?: number;
    title?: string;
    title_EN?: string;
    ownerEmployeeFullName?: string;
    ownerTeam?: string;
    progress?: number;
    details?: OkrContributorRaw[];
    Contributors?: OkrContributorRaw[];
    contributors?: OkrContributorRaw[];
}

export interface KrDetail {
    fullName: string;
    pictureURL: string;
    krTitle: string;
    pointCurrent: number;
    pointOKR: number;
    krProgress: number;
    isDone: boolean;
}

export interface Objective {
    objectiveId: number;
    objectiveName: string;
    objectiveName_EN: string;
    ownerName: string;
    ownerTeam: string;
    progress: number;
    status: 'On Track' | 'At Risk' | 'Behind';
    impactLevel?: 'high' | 'medium' | 'low';
    details: KrDetail[];
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
