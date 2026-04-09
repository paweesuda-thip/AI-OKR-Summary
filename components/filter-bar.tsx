"use client";

import { DatePickerWithRange } from "./date-range-picker";
import { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  isOverall: boolean;
  setIsOverall: (val: boolean) => void;
  className?: string;
}

export default function FilterBar({
  dateRange,
  setDateRange,
  isOverall,
  setIsOverall,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-row items-center gap-2 sm:gap-3", className)}>
      <div className="flex items-center space-x-2 bg-black/40 border border-white/10 hover:bg-white/5 transition-all backdrop-blur-md px-3 h-9 rounded-full relative group">
        <Label htmlFor="overall-mode" className="font-semibold text-xs cursor-pointer whitespace-nowrap text-zinc-300 group-hover:text-zinc-100 transition-colors">
          Overall QTR
        </Label>
        <Switch
          id="overall-mode"
          checked={isOverall}
          onCheckedChange={setIsOverall}
          className="scale-75 data-[state=checked]:bg-cyan-500"
        />
      </div>

      <div className={`transition-all duration-300 ${isOverall ? 'opacity-40 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} disabled={isOverall} />
      </div>
    </div>
  );
}
