"use client";

import { DatePickerWithRange } from "./date-range-picker";
import { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FilterBarProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  isOverall: boolean;
  setIsOverall: (val: boolean) => void;
}

export default function FilterBar({
  dateRange,
  setDateRange,
  isOverall,
  setIsOverall,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center space-x-2 bg-background/50 border border-border/40 backdrop-blur-md px-4 py-2 rounded-xl">
        <Switch
          id="overall-mode"
          checked={isOverall}
          onCheckedChange={setIsOverall}
        />
        <Label htmlFor="overall-mode" className="font-medium text-sm cursor-pointer whitespace-nowrap">
          Overall Progress
        </Label>
      </div>

      <div className={`transition-all duration-300 ${isOverall ? 'opacity-50 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} disabled={isOverall} />
        </div>
      </div>
    </div>
  );
}
