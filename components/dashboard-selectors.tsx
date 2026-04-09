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
    <div className="flex flex-row items-center gap-2 sm:gap-3 w-auto">
      {/* Cycle Selector */}
      <div className="relative">
        <Select
          value={selectedCycleId.toString()}
          onValueChange={(val) => onCycleChange(Number(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px] sm:w-[160px] h-9 bg-black/40 border-white/10 hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:border-white/20 transition-all rounded-full text-xs font-semibold px-3 overflow-hidden text-zinc-300">
            <div className="flex items-center gap-2 truncate">
              <CalendarDays className="w-3.5 h-3.5 shrink-0 text-cyan-500/70" />
              <span className="truncate">{selectedCycleLabel}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0c]/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl">
            {sortedCycles.map((cycle) => (
              <SelectItem key={cycle.setId} value={cycle.setId.toString()} className="focus:bg-white/5 focus:text-cyan-400 cursor-pointer rounded-lg">
                <div className="flex flex-col items-start text-xs gap-0.5">
                  <span className="font-medium">{cycle.label}</span>
                  {cycle.isCurrentCycle && (
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Current Cycle</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Organization Selector */}
      <div className="relative">
        <Select
          value={selectedOrgId.toString()}
          onValueChange={(val) => onOrgChange(Number(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-[150px] sm:w-[180px] h-9 bg-black/40 border-white/10 hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:border-white/20 transition-all rounded-full text-xs font-semibold px-3 overflow-hidden text-zinc-300">
            <div className="flex items-center gap-2 truncate">
              <Users className="w-3.5 h-3.5 shrink-0 text-amber-500/70" />
              <span className="truncate">{selectedOrgLabel}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0c]/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl max-h-[300px]">
            {orgGroupedOptions.map((group, idx) => (
              <SelectGroup key={group.groupLabel}>
                <SelectLabel className="text-[10px] uppercase tracking-wider text-zinc-500 px-2 py-1.5">{group.groupLabel}</SelectLabel>
                {group.options.map((opt) => (
                  <SelectItem key={opt.organizationId} value={opt.organizationId.toString()} className="text-xs focus:bg-white/5 focus:text-amber-400 cursor-pointer rounded-lg px-2">
                    {opt.label}
                  </SelectItem>
                ))}
                {idx < orgGroupedOptions.length - 1 && <SelectSeparator className="bg-white/5 my-1" />}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
