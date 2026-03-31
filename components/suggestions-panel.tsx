"use client";

import { useMemo } from "react";
import { TeamSummary, Objective, ParticipantDetailRaw } from "@/lib/types/okr";
import { generateSuggestions, type Suggestion } from "@/lib/mock-data";

interface SuggestionsPanelProps {
  summary: TeamSummary | null;
  objectives: Objective[];
  participantDetails: ParticipantDetailRaw[];
}

const typeConfig: Record<string, { borderColor: string; pingColor: string; label: string }> = {
  action: {
    borderColor: "border-[#F7931A]",
    pingColor: "bg-[#F7931A]",
    label: "ACTION",
  },
  warning: {
    borderColor: "border-red-500",
    pingColor: "bg-red-500",
    label: "WARNING",
  },
  insight: {
    borderColor: "border-[#FFD600]",
    pingColor: "bg-[#FFD600]",
    label: "INSIGHT",
  },
};

const priorityConfig: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/30",
  medium: "bg-[#F7931A]/10 text-[#F7931A] border-[#F7931A]/30",
  low: "bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/30",
};

export default function SuggestionsPanel({
  summary,
  objectives,
  participantDetails,
}: SuggestionsPanelProps) {
  const suggestions = useMemo(() => {
    if (!summary || !objectives) return [];
    return generateSuggestions(
      objectives,
      summary.avgObjectiveProgress || 0,
      participantDetails.length
    );
  }, [summary, objectives, participantDetails]);

  return (
    <div className="w-full space-y-6">
      
      {/* ── Section Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="font-heading text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="text-gradient-spartan">Command Telemetry</span>
        </h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#F7931A]/30 to-transparent" />
      </div>

      {/* ── Suggestion Holographic Nodes ── */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suggestions.map((suggestion: Suggestion) => {
            const config = typeConfig[suggestion.type] || typeConfig.insight;
            const priorityCss = priorityConfig[suggestion.priority] || priorityConfig.medium;

            return (
              <div
                key={suggestion.id}
                className="group relative flex flex-col gap-4 p-8 min-h-[220px] transaction-all duration-300"
              >
                {/* Holographic Background Layer */}
                <div className="absolute inset-0 glass opacity-80 group-hover:opacity-100 transition-opacity rounded-xl" />
                
                {/* Glow shadow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_0_30px_-5px_rgba(247,147,26,0.2)] rounded-xl" />

                {/* Corner Accents (Bitcoin Style) */}
                <div className={`absolute top-0 left-0 w-8 h-8 rounded-tl-xl border-t-2 border-l-2 ${config.borderColor} opacity-30 group-hover:opacity-100 transition-all z-10`} />
                <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-br-xl border-b-2 border-r-2 ${config.borderColor} opacity-30 group-hover:opacity-100 transition-all z-10`} />

                {/* Header Context */}
                <div className="relative z-10 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Pulsing Dot */}
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pingColor} opacity-75`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.pingColor}`} />
                      </span>
                      <span className="font-mono text-[10px] font-bold text-[#94A3B8] tracking-[0.2em] uppercase">
                        {config.label}
                      </span>
                    </div>
                    
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${priorityCss} tracking-widest`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mt-2">
                    <h4 className="font-heading text-lg font-bold text-white leading-tight group-hover:text-[#F7931A] transition-colors">
                      {suggestion.title}
                    </h4>
                    <p className="font-body text-sm text-[#94A3B8] leading-relaxed line-clamp-3">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                {/* Output Metric */}
                <div className="relative z-10 mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest">Target Metric</div>
                   <div className="font-mono text-xs font-bold text-white bg-white/5 px-2 py-1 rounded">
                     {suggestion.metric || "N/A"}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
