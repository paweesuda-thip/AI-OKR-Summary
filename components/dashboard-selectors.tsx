"use client";

import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { getGroupedOrgOptions, getCycleOptions } from "@/lib/utils/org-leaf";
import { Users, CalendarDays } from "lucide-react";

interface DashboardSelectorsProps {
  selectedCycleId: number;
  onCycleChange: (setId: number) => void;
  selectedOrgId: number;
  onOrgChange: (orgId: number) => void;
  disabled?: boolean;
}

export default function DashboardSelectors({
  selectedCycleId,
  onCycleChange,
  selectedOrgId,
  onOrgChange,
  disabled = false,
}: DashboardSelectorsProps) {
  const cycleOptions = useMemo(() => getCycleOptions(), []);
  const orgGroupedOptions = useMemo(() => getGroupedOrgOptions(), []);

  const sortedCycles = useMemo(() => {
    return [...cycleOptions].sort((a, b) => {
      if (a.isCurrentCycle && !b.isCurrentCycle) return -1;
      if (!a.isCurrentCycle && b.isCurrentCycle) return 1;
      if (a.year !== b.year) return b.year - a.year;
      return new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime();
    });
  }, [cycleOptions]);

  // Find the selected labels for the trigger display
  const selectedCycleLabel = sortedCycles.find(c => c.setId === selectedCycleId)?.label || "Select Cycle";
  const selectedOrgLabel = orgGroupedOptions.flatMap(g => g.options).find(o => o.organizationId === selectedOrgId)?.label || "Select Team";

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Cycle Selector */}
      <div className="relative w-full">
        <Select
          value={selectedCycleId.toString()}
          onValueChange={(val) => onCycleChange(Number(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2 truncate">
              <CalendarDays className="w-4 h-4 shrink-0 opacity-50" />
              <span className="truncate">{selectedCycleLabel}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {sortedCycles.map((cycle) => (
              <SelectItem key={cycle.setId} value={cycle.setId.toString()}>
                <div className="flex flex-col">
                  <span>{cycle.label}</span>
                  {cycle.isCurrentCycle && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Current Cycle</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Organization Selector */}
      <div className="relative w-full">
        <Select
          value={selectedOrgId.toString()}
          onValueChange={(val) => onOrgChange(Number(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2 truncate">
              <Users className="w-4 h-4 shrink-0 opacity-50" />
              <span className="truncate">{selectedOrgLabel}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {orgGroupedOptions.map((group, idx) => (
              <SelectGroup key={group.groupLabel}>
                <SelectLabel>{group.groupLabel}</SelectLabel>
                {group.options.map((opt) => (
                  <SelectItem key={opt.organizationId} value={opt.organizationId.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
                {idx < orgGroupedOptions.length - 1 && <SelectSeparator />}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
