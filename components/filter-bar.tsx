"use client";

import { DatePickerWithRange } from "./date-range-picker";
import { DateRange } from "react-day-picker";

interface FilterBarProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
}

export default function FilterBar({
  dateRange,
  setDateRange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="text-sm font-semibold text-muted-foreground mr-2 hidden sm:inline-block">
        Filter by:
      </span>

      <DatePickerWithRange date={dateRange} setDate={setDateRange} />
    </div>
  );
}
