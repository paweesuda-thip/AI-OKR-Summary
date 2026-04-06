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
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between space-x-2 bg-background/50 border border-border/40 backdrop-blur-md px-4 py-3 rounded-xl w-full">
        <Label htmlFor="overall-mode" className="font-medium text-sm cursor-pointer whitespace-nowrap">
          Overall Quarter
        </Label>
        <Switch
          id="overall-mode"
          checked={isOverall}
          onCheckedChange={setIsOverall}
        />
      </div>

      <div className={`transition-all duration-300 w-full ${isOverall ? 'opacity-50 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-center gap-2 cursor-pointer w-full">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} disabled={isOverall} />
        </div>
      </div>
    </div>
  );
}
