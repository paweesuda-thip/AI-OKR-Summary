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

interface GroupedOrgOptionsConfig {
  groupLabelFilter?: string;
  rootOrganizationId?: number;
}

type OrgNode = {
  organizationId: number;
  value: number;
  text?: string;
  name?: string;
  name_EN?: string;
  children?: OrgNode[];
};

const findOrgNodeById = (node: OrgNode, targetId: number): OrgNode | null => {
  if (node.organizationId === targetId) return node;
  if (!node.children?.length) return null;

  for (const child of node.children) {
    const found = findOrgNodeById(child, targetId);
    if (found) return found;
  }

  return null;
};

export function getGroupedOrgOptions(config?: string | GroupedOrgOptionsConfig): GroupedOrgOption[] {
  const root = orgNodeMock.data.find(node => node.organizationId === 1);
  if (!root || !root.children) return [];

  const resolvedConfig: GroupedOrgOptionsConfig =
    typeof config === "string" ? { groupLabelFilter: config } : (config ?? {});
  const { groupLabelFilter, rootOrganizationId } = resolvedConfig;

  const extractLeaves = (node: OrgNode, leaves: OrgOption[]) => {
    const validChildren = node.children ? node.children.filter((c: any) => !/^Team [1-9]$/i.test(c.name)) : [];

    if (validChildren.length === 0) {
      leaves.push({
        organizationId: node.organizationId,
        value: node.value,
        label: node.text || node.name || "",
        name_EN: node.name_EN || ""
      });
    } else {
      for (const child of validChildren) {
        extractLeaves(child, leaves);
      }
    }
  };

  if (rootOrganizationId) {
    const targetNode = findOrgNodeById(root as OrgNode, rootOrganizationId);
    if (!targetNode) return [];

    const leaves: OrgOption[] = [];
    extractLeaves(targetNode, leaves);
    if (leaves.length === 0) return [];

    return [
      {
        groupLabel: targetNode.text || targetNode.name || "",
        options: leaves,
      },
    ];
  }

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

  if (!groupLabelFilter) return groupedOptions;

  const normalizedFilter = groupLabelFilter.trim().toLowerCase();
  return groupedOptions.filter(
    (group) => group.groupLabel.trim().toLowerCase() === normalizedFilter
  );
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
