import { orgNodeMock } from '@/data/ddl.org-node.mock';
import { ddlMock } from '@/data/ddl.mock';

export interface OrgOption {
  organizationId: number;
  value: number;
  label: string;
  name_EN: string;
}

export interface GroupedOrgOption {
  groupLabel: string;
  options: OrgOption[];
}

export function getGroupedOrgOptions(): GroupedOrgOption[] {
  const root = orgNodeMock.data.find(node => node.organizationId === 1);
  if (!root || !root.children) return [];

  const extractLeaves = (node: any, leaves: OrgOption[]) => {
    const validChildren = node.children ? node.children.filter((c: any) => !/^Team [1-9]$/i.test(c.name)) : [];

    if (validChildren.length === 0) {
      leaves.push({
        organizationId: node.organizationId,
        value: node.value,
        label: node.text || node.name,
        name_EN: node.name_EN
      });
    } else {
      for (const child of validChildren) {
        extractLeaves(child, leaves);
      }
    }
  };

  const groupedOptions: GroupedOrgOption[] = [];

  for (const child of root.children) {
    const leaves: OrgOption[] = [];
    extractLeaves(child, leaves);
    if (leaves.length > 0) {
      groupedOptions.push({
        groupLabel: child.text || child.name,
        options: leaves
      });
    }
  }

  return groupedOptions;
}

export interface CycleOption {
  setId: number;
  label: string;
  isCurrentCycle: boolean;
  year: number;
  dateStart: string;
  dateEnd: string;
}

export function getCycleOptions(): CycleOption[] {
  return ddlMock.data.map(item => ({
    setId: item.setId,
    label: item.name,
    isCurrentCycle: item.isCurrentCycle,
    year: item.year,
    dateStart: item.dateStart,
    dateEnd: item.dateEnd
  }));
}
