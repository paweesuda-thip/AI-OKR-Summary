"use client";

import { DatePickerWithRange } from "./date-range-picker";
import { DateRange } from "react-day-picker";

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Custom Spartan Switch */}
      <button
        onClick={() => setIsOverall(!isOverall)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
          isOverall
            ? "bg-[#F7931A]/10 border-[#F7931A]/30 glow-orange-subtle"
            : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
        }`}
      >
        <div
          className={`relative w-7 h-4 rounded-full transition-colors ${
            isOverall ? "bg-[#F7931A]" : "bg-white/20"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-transform ${
              isOverall ? "translate-x-3 bg-[#030304]" : "translate-x-0 bg-white/70"
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-mono font-bold tracking-widest uppercase mt-0.5 ${
            isOverall ? "text-[#F7931A]" : "text-[#94A3B8]"
          }`}
        >
          Overall Quarter
        </span>
      </button>

      {/* Date Picker Range */}
      <div className={`transition-all duration-300 ${isOverall ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
        <div className="flex flex-wrap items-center gap-2 cursor-pointer">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} disabled={isOverall} />
        </div>
      </div>
    </div>
  );
}
