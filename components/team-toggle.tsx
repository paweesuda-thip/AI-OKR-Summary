"use client";

import { TeamFilterMode } from "@/lib/types/okr";
import { TEAM_CONFIG } from "@/lib/mock/teams";

const options: { value: TeamFilterMode; label: string; color?: string }[] = [
  { value: "overall", label: "Overall" },
  ...Object.values(TEAM_CONFIG).map((t) => ({
    value: t.id as TeamFilterMode,
    label: t.name,
    color: t.color,
  })),
];

interface TeamToggleProps {
  value: TeamFilterMode;
  onChange: (mode: TeamFilterMode) => void;
}

const OVERALL_COLOR = "#8b5cf6";

export default function TeamToggle({ value, onChange }: TeamToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/50">
      {options.map((opt) => {
        const active = value === opt.value;
        const accentColor = opt.color || OVERALL_COLOR;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              relative px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-300
              ${active
                ? "text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }
            `}
            style={active ? {
              backgroundColor: accentColor,
              boxShadow: `0 4px 14px ${accentColor}40`,
            } : undefined}
          >
            <span className="flex items-center gap-1.5">
              {opt.color && !active && (
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
