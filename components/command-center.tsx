"use client";

import { TeamSummary, Suggestion, ParticipantDetailRaw } from "@/lib/types/okr";
import { IconShield, IconTarget, IconFlame, IconLightning, IconPulse, IconUsers } from "@/components/icons";

interface CommandCenterProps {
  summary: TeamSummary | null;
  suggestions: Suggestion[];
  participantDetails?: ParticipantDetailRaw[];
}

const suggestionStyles: Record<Suggestion["type"], { border: string; bg: string; icon: typeof IconFlame }> = {
  warning: { border: "border-red-500/40", bg: "bg-red-500/5", icon: IconFlame },
  boost: { border: "border-amber-500/40", bg: "bg-amber-500/5", icon: IconLightning },
  insight: { border: "border-blue-500/40", bg: "bg-blue-500/5", icon: IconPulse },
  milestone: { border: "border-emerald-500/40", bg: "bg-emerald-500/5", icon: IconTarget },
};

export default function CommandCenter({ summary, suggestions, participantDetails = [] }: CommandCenterProps) {
  if (!summary) return null;

  const progressColor =
    summary.avgObjectiveProgress >= 70 ? "text-emerald-400" :
    summary.avgObjectiveProgress >= 40 ? "text-amber-400" : "text-red-400";

  const progressBarColor =
    summary.avgObjectiveProgress >= 70 ? "bg-emerald-500" :
    summary.avgObjectiveProgress >= 40 ? "bg-amber-500" : "bg-red-500";

  // Calculate check-in stats from participantDetails
  const totalCheckIns = participantDetails.reduce((sum, p) => sum + (p.totalCheckIn || 0), 0);
  const totalMissedCheckIns = participantDetails.reduce((sum, p) => sum + (p.totalMissCheckIn || 0), 0);
  const totalCheckInAll = participantDetails.reduce((sum, p) => sum + (p.totalCheckInAll || 0), 0);
  
  // Calculate check-in rate based on actual check-ins vs total expected (all)
  const checkInRate = totalCheckInAll > 0 
    ? Math.round((totalCheckIns / totalCheckInAll) * 100) 
    : 0;

  return (
    <div className="w-full">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {/* Overall Progress — spans 2 on mobile */}
        <div className="col-span-2 lg:col-span-1 relative p-4 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-card to-card overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <IconShield size={16} className="text-violet-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Cycle Health</span>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${progressColor}`}>
            {summary.avgObjectiveProgress.toFixed(1)}%
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className={`h-full rounded-full ${progressBarColor} transition-all duration-700`} style={{ width: `${Math.min(summary.avgObjectiveProgress, 100)}%` }} />
          </div>
        </div>

        {/* Objectives */}
        <div className="p-4 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-card/60">
          <div className="flex items-center gap-2 mb-2">
            <IconTarget size={14} className="text-blue-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Objectives</span>
          </div>
          <div className="text-2xl font-bold">{summary.totalObjectives}</div>
          <div className="flex gap-2 mt-1 text-[10px] font-medium">
            <span className="text-emerald-400">{summary.onTrackCount} on track</span>
            <span className="text-red-400">{summary.behindCount} behind</span>
          </div>
        </div>

        {/* Key Results */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card/60">
          <div className="flex items-center gap-2 mb-2">
            <IconFlame size={14} className="text-amber-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Key Results</span>
          </div>
          <div className="text-2xl font-bold">{summary.completedKRs}<span className="text-sm text-muted-foreground font-normal">/{summary.totalKRs}</span></div>
          <div className="text-[10px] text-muted-foreground mt-1">{summary.krCompletionRate}% complete</div>
        </div>

        {/* Check-ins (New) */}
        <div className="p-4 rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-card/60">
          <div className="flex items-center gap-2 mb-2">
            <IconUsers size={14} className="text-teal-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Check-ins</span>
          </div>
          <div className="text-2xl font-bold">{checkInRate}%</div>
          <div className="flex gap-2 mt-1 text-[10px] font-medium">
            <span className="text-emerald-400">{totalCheckIns} active</span>
            <span className="text-red-400">{totalMissedCheckIns} missed</span>
          </div>
        </div>

        {/* Contributors */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-card/60">
          <div className="flex items-center gap-2 mb-2">
            <IconPulse size={14} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Warriors</span>
          </div>
          <div className="text-2xl font-bold">{summary.totalContributors}</div>
          <div className="text-[10px] text-muted-foreground mt-1">active contributors</div>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-card/60">
          <div className="flex items-center gap-2 mb-2">
            <IconLightning size={14} className="text-rose-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">OBJ Rate</span>
          </div>
          <div className="text-2xl font-bold">{summary.objectiveCompletionRate}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">objectives completed</div>
        </div>
      </div>

      {/* Suggestion Cards */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {suggestions.map((sug) => {
            const style = suggestionStyles[sug.type];
            const SugIcon = style.icon;
            return (
              <div key={sug.id} className={`p-3 rounded-lg border ${style.border} ${style.bg} flex items-start gap-3`}>
                <SugIcon size={18} className="mt-0.5 shrink-0 opacity-70" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">{sug.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{sug.description}</div>
                </div>
                {sug.urgency === 'high' && (
                  <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">urgent</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
