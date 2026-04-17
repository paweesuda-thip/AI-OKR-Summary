export interface DdlApiStatus {
  code: string;
  description: string;
}

export interface DdlApiResponse<T> {
  status: DdlApiStatus;
  data: T;
}

export interface AssessmentSetDto {
  setId: number;
  name: string;
  isCurrentCycle: boolean;
  year: number;
  dateStart: string;
  dateEnd: string;
}

export interface OrgNodeDto {
  organizationId: number;
  value: number;
  levels?: number;
  text?: string;
  name?: string;
  name_EN?: string;
  companyId?: number;
  children?: OrgNodeDto[];
}
