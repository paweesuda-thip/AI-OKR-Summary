"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange;
  setDate?: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);

  // Sync tempDate with actual date when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setTempDate(date);
    }
  }, [isOpen, date]);

  const handleApply = () => {
    setDate?.(tempDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          id="date"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "hover:bg-muted/50 text-foreground h-10 px-4 w-full sm:w-auto justify-between transition-all rounded-full border border-border/30 gap-2",
            !date && "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span className="truncate font-medium">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd MMM yyyy")} -{" "}
                    {format(date.to, "dd MMM yyyy")}
                  </>
                ) : (
                  format(date.from, "dd MMM yyyy")
                )
              ) : (
                "เลือกช่วงเวลา"
              )}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-background/90 backdrop-blur-xl border-border/50 text-foreground shadow-md rounded-xl"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={tempDate?.from}
            selected={tempDate}
            onSelect={setTempDate}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-end gap-2 p-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
