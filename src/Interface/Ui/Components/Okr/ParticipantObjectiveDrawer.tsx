import React, { useCallback } from 'react';
import { ParticipantDetailRaw, Objective, PersonObjective } from "@/src/Domain/Entities/Okr";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/Interface/Ui/Primitives/avatar";
import { 
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  ChevronDown,
  Loader2,
  AlertCircle,
  Star,
  Flame
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/src/Interface/Ui/Primitives/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/Interface/Ui/Primitives/tooltip";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import { mapObjectiveForPerson } from "@/src/Infrastructure/Persistence/Mappers/OkrMapper";

type ParticipantWithDisplayRank = ParticipantDetailRaw & { displayRank: number };

interface ParticipantObjectiveDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    person: ParticipantWithDisplayRank | null;
    objectives: Objective[];
    loading: boolean;
    error: string | null;
    showStatus?: boolean;
    showAiReason?: boolean;
}

export function ParticipantObjectiveDrawer({ 
    open, 
    onOpenChange, 
    person, 
    objectives, 
    loading, 
    error, 
    showStatus = true,
    showAiReason = false
}: ParticipantObjectiveDrawerProps) {
  const [expandedObjectiveId, setExpandedObjectiveId] = React.useState<number | null>(null);

  const closeDrawer = useCallback(() => {
      onOpenChange(false);
  }, [onOpenChange]);

  const getStatusData = (percent: number) => {
    if (!showStatus) return {
      label: 'TBD',
      color: 'text-zinc-500',
      bg: 'bg-zinc-500/10',
      border: 'border-zinc-500/20',
      icon: Activity,
      chartColor: 'zinc',
      isPending: true
    };
    if (percent >= 80) return { 
      label: 'Beyond', 
      color: 'text-violet-400', 
      bg: 'bg-violet-500/10', 
      border: 'border-violet-500/20', 
      icon: TrendingUp,
      chartColor: 'violet'
    };
    if (percent >= 60) return { 
      label: 'On Track', 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20', 
      icon: TrendingUp,
      chartColor: 'emerald'
    };
    if (percent >= 40) return { 
      label: 'At Risk', 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20', 
      icon: Activity,
      chartColor: 'amber'
    };
    return { 
      label: 'Behind', 
      color: 'text-rose-400', 
      bg: 'bg-rose-500/10', 
      border: 'border-rose-500/20', 
      icon: TrendingDown,
      chartColor: 'rose'
    };
  };

  const toStatus = (p: number): 'Beyond' | 'On Track' | 'At Risk' | 'Behind' =>
      p >= 80 ? 'Beyond' : p >= 60 ? 'On Track' : p >= 40 ? 'At Risk' : 'Behind';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        bottomSheetCenter
        showCloseButton={false}
        className="max-h-[min(92dvh,100%)] w-full rounded-t-2xl border-x border-t border-white/10 bg-[#040406]/95 p-0 shadow-[0_-28px_90px_rgba(0,0,0,0.72)] backdrop-blur-3xl overflow-hidden"
      >
        <SheetTitle className="sr-only">
          {person?.fullName} Objectives
        </SheetTitle>

        {person && (() => {
          const displayScore = person.totalScore ?? person.avgPercent;
          const heroStatus = getStatusData(displayScore);
          const heroTrend = person.trend ?? 'normal';
          const TrendHeroMiniIcon =
            heroTrend === 'up' ? TrendingUp : heroTrend === 'down' ? TrendingDown : Activity;
          const trendHeroIconClass =
            heroTrend === 'up'
              ? 'text-emerald-200 drop-shadow-[0_0_10px_rgba(52,211,153,0.55)]'
              : heroTrend === 'down'
                ? 'text-rose-200 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]'
                : 'text-zinc-100 drop-shadow-[0_0_8px_rgba(228,228,231,0.28)]';
          const ringDash = Math.min(displayScore, 100);
          const ringColorHex = showStatus
            ? (heroStatus.color.includes('violet') ? '#8b5cf6'
              : heroStatus.color.includes('emerald') ? '#34d399'
              : heroStatus.color.includes('amber') ? '#fbbf24'
              : heroStatus.color.includes('rose') ? '#fb7185'
              : '#71717a')
            : '#818cf8';

          const personObjectives: PersonObjective[] = objectives
            .map(o => mapObjectiveForPerson(o, person.fullName))
            .filter((o): o is PersonObjective => o !== null);

          return (
            <div className="relative h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Decorative ambient glow matching status */}
              <div
                className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 mix-blend-screen"
                style={{ backgroundColor: ringColorHex }}
              />

              {/* ─── HERO HEADER ─── */}
              <div className="relative px-8 pt-10 pb-8 shrink-0 z-10">
                <button onClick={closeDrawer} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-50">
                  <XCircle className="w-5 h-5 text-white/70" />
                </button>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left mt-4 sm:mt-0">
                  <div className="relative shrink-0 group/avatar">
                    <div className="absolute inset-0 bg-black rounded-full overflow-hidden">
                      <div className="absolute inset-[-50%] bg-linear-to-r from-transparent via-white/20 to-transparent rotate-45 group-hover/avatar:translate-x-full transition-transform duration-1000" />
                    </div>
                    <svg className="w-[120px] h-[120px] -rotate-90 relative z-10" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                      <circle
                        cx="60" cy="60" r="54"
                        stroke={ringColorHex}
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${(ringDash / 100) * 339.29} 339.29`}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 10px ${ringColorHex}60)` }}
                      />
                    </svg>
                    <div className="absolute inset-2.5 z-20 shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-full">
                      <Avatar className="w-full h-full border-[3px] border-black">
                        <AvatarImage src={person.pictureMediumURL || person.pictureURL} className="object-cover" />
                        <AvatarFallback className="text-2xl font-bold bg-zinc-900 text-zinc-300">
                          {person.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center sm:justify-start">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/10 bg-white/5 shadow-inner">
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Rank</span>
                        <span className="text-xs font-black font-mono text-white">#{person.displayRank || '?'}</span>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-white/70 tracking-tight leading-tight truncate drop-shadow-sm mb-1">
                      {person.fullName}
                    </h2>
                    <p className="text-sm font-medium text-blue-400/80 truncate uppercase tracking-widest">
                      {person.fullName_EN}
                    </p>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto pt-4 sm:pt-2 sm:mr-12 flex flex-col items-center sm:items-end gap-2">
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.22em] self-center sm:self-end">
                      Total Score
                    </p>
                    <div className="flex items-baseline justify-center sm:justify-end gap-3 sm:gap-3.5">
                      <p
                        className={`text-6xl font-black font-mono tabular-nums leading-none tracking-tight ${showStatus ? heroStatus.color : 'text-indigo-300/95'}`}
                      >
                        {displayScore.toFixed(0)}
                      </p>
                      <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          className="group/trmini -translate-y-[0.04em] inline-flex shrink-0 items-center justify-center rounded-sm p-0.5 outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040406]"
                        >
                          <TrendHeroMiniIcon
                            className={`h-6 w-6 sm:h-7 sm:w-7 ${trendHeroIconClass}`}
                            strokeWidth={2}
                            aria-hidden
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="end"
                          className="border-white/10 bg-zinc-950/95 px-3 py-2 text-[11px] font-medium text-zinc-200"
                        >
                          {heroTrend === 'up'
                            ? 'Trajectory is up vs prior period.'
                            : heroTrend === 'down'
                              ? 'Trajectory is down vs prior period.'
                              : 'Flat vs prior period.'}
                        </TooltipContent>
                      </Tooltip>
                      </TooltipProvider>
                    </div>
                    {showStatus && (
                      <div className="flex justify-center sm:justify-end mt-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${heroStatus.bg} ${heroStatus.border} ${heroStatus.color} shadow-inner`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_10px_currentColor]" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{heroStatus.label}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] border-y border-white/10 bg-black/60 relative">
                <div className="p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative min-h-[260px]">
                  <div className="absolute top-4 left-5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Performance Radar</p>
                      <p className="text-white text-xs font-semibold">Multi-dimensional Metrics</p>
                  </div>
                  <div className="absolute inset-0 m-auto w-40 h-40 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
                  
                  <div className="w-full h-full min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart 
                        cx="50%" 
                        cy="55%" 
                        outerRadius="65%" 
                        data={[
                          { subject: 'Goal', A: person.goalAchievementScore ?? 0, fullMark: 100 },
                          { subject: 'Quality', A: person.qualityScore ?? 0, fullMark: 100 },
                          { subject: 'Engagement', A: person.engagementBehaviorScore ?? 0, fullMark: 100 },
                        ]}
                      >
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, textAnchor: "middle" }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                        />
                        <Radar 
                          name="Score" 
                          dataKey="A" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fill="url(#radarGradient)" 
                          fillOpacity={0.6} 
                        />
                        <defs>
                          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center divide-y divide-white/5 bg-black/20">
                  <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Goal Achievement</span>
                      </div>
                      <span className="text-xl font-mono font-black text-emerald-400">{(person.goalAchievementScore ?? 0).toFixed(0)}</span>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Quality of Work</span>
                      </div>
                      <span className="text-xl font-mono font-black text-amber-400">{(person.qualityScore ?? 0).toFixed(0)}</span>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Engagement & Behavior</span>
                      </div>
                      <span className="text-xl font-mono font-black text-purple-400">{(person.engagementBehaviorScore ?? 0).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* ─── AI REASON SECTION ─── */}
              {showAiReason && person.aiScoreReason && (
                <div className="w-full mt-6 border-t border-white/5">
                  <div className="px-8 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between shadow-sm">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">AI Reason</span>
                  </div>
                  <div className="px-8 py-5">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {person.aiScoreReason}
                    </p>
                  </div>
                </div>
              )}

              <div className="w-full pb-10 border-t border-white/5">
                <div className="px-8 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Key Results Details</span>
                </div>
                
                <div className="px-8 py-6">
                  {loading && (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-500">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase">Syncing Database...</span>
                    </div>
                  )}

                  {error && !loading && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit mx-auto mt-10">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  {!loading && !error && personObjectives.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-600">
                      <div className="p-4 rounded-3xl border border-white/5 bg-white/5 shadow-inner">
                        <Target className="w-8 h-8 opacity-40" />
                      </div>
                      <span className="text-sm font-semibold tracking-widest uppercase mt-4">No Objectives Found</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {!loading && personObjectives.map((obj) => {
                      const isExpanded = expandedObjectiveId === obj.objectiveId;
                      const personProgress = obj.personProgress;
                      const objStatus = toStatus(personProgress);
                      const statusColor = showStatus ? (objStatus === 'Beyond' ? 'text-violet-400' : objStatus === 'On Track' ? 'text-emerald-400' : objStatus === 'At Risk' ? 'text-amber-400' : 'text-rose-400') : 'text-indigo-300';
                      const statusBg = showStatus ? (objStatus === 'Beyond' ? 'bg-violet-500/10 border-violet-500/20' : objStatus === 'On Track' ? 'bg-emerald-500/10 border-emerald-500/20' : objStatus === 'At Risk' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20') : 'bg-indigo-500/10 border-indigo-500/20';
                      const stripeColor = showStatus ? (objStatus === 'Beyond' ? 'bg-violet-500' : objStatus === 'On Track' ? 'bg-emerald-500' : objStatus === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500') : 'bg-indigo-400';
                      const krCount = obj.subObjectives.length;

                      return (
                        <div
                          key={obj.objectiveId}
                          className={`relative rounded-3xl border bg-black/40 overflow-hidden transition-all duration-300 ${isExpanded ? 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.05]'}`}
                        >
                          {isExpanded && <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent pointer-events-none" />}
                          
                          <button
                            className="w-full flex items-center gap-5 px-6 py-5 text-left relative z-10"
                            onClick={() => setExpandedObjectiveId(isExpanded ? null : obj.objectiveId)}
                          >
                            <div className="shrink-0 flex flex-col items-center w-12">
                              <span className={`text-3xl font-black font-mono leading-none drop-shadow-md ${statusColor}`}>
                                {Math.floor(personProgress)}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Score</span>
                            </div>

                            <div className="w-px self-stretch bg-white/10" />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1.5">
                                {showStatus && (
                                  <div className={`text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm border ${statusBg} ${statusColor} shadow-inner`}>
                                    {objStatus}
                                  </div>
                                )}
                                {krCount > 0 && (
                                  <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
                                    {krCount} Key Result{krCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <p className="text-base font-bold text-white leading-snug line-clamp-2">
                                {obj.objectiveName || obj.objectiveName_EN}
                              </p>
                              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
                                <div
                                  className={`h-full ${stripeColor} rounded-full transition-all duration-1000 ease-out`}
                                  style={{ width: `${Math.min(personProgress, 100)}%` }}
                                />
                              </div>
                            </div>

                            <div className={`shrink-0 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-blue-500/20 border-blue-500/50 rotate-180 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/50 hover:bg-white/10'}`}>
                              <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-blue-400' : 'text-zinc-400'}`} />
                            </div>
                          </button>

                          {isExpanded && obj.subObjectives.length > 0 && (
                            <div className="border-t border-white/10 bg-black/60 relative z-10 px-6 py-5">
                              <div className="space-y-4">
                                {obj.subObjectives.map((sub, subIdx) => {
                                  const subProg = sub.personProgress;
                                  const subStatus = toStatus(subProg);
                                  const subColor = showStatus ? (subStatus === 'Beyond' ? 'text-violet-400' : subStatus === 'On Track' ? 'text-emerald-400' : subStatus === 'At Risk' ? 'text-amber-400' : 'text-rose-400') : 'text-indigo-300';
                                  const subBar = showStatus ? (subStatus === 'Beyond' ? 'bg-violet-500' : subStatus === 'On Track' ? 'bg-emerald-500' : subStatus === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500') : 'bg-indigo-400';

                                  return (
                                    <div key={sub.objectiveId} className="rounded-2xl border border-white/5 bg-[#0a0a0c] shadow-inner overflow-hidden">
                                      <div className="px-5 py-4 flex items-start gap-4">
                                        <div className="text-[10px] font-mono font-black text-white/50 bg-white/5 px-2 py-1 rounded shadow-inner shrink-0 tracking-wider">
                                          KR{String(subIdx + 1).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-zinc-200 leading-relaxed mb-2">
                                            {sub.title || sub.title_EN}
                                          </p>
                                          <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                              <div className={`h-full ${subBar} rounded-full transition-all duration-700`} style={{ width: `${Math.min(subProg, 100)}%` }} />
                                            </div>
                                            <span className={`text-xs font-black font-mono shrink-0 ${subColor} tabular-nums`}>
                                              {Math.floor(subProg)}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="border-t border-white/5 divide-y divide-white/[0.02]">
                                          {sub.details.map((kr, krIdx) => {
                                            const krColor = showStatus ? (kr.pointOKR >= 80 ? 'text-violet-400' : kr.pointOKR >= 60 ? 'text-emerald-400' : kr.pointOKR >= 40 ? 'text-amber-400' : 'text-rose-400') : 'text-indigo-300';
                                            const krBar = showStatus ? (kr.pointOKR >= 80 ? 'bg-violet-500' : kr.pointOKR >= 60 ? 'bg-emerald-500' : kr.pointOKR >= 40 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-indigo-400';
                                            return (
                                              <div key={krIdx} className="px-5 py-3 flex items-center gap-4 bg-black/40 hover:bg-black/20 transition-colors">
                                                <Avatar className="w-8 h-8 shrink-0 border border-white/10 shadow-lg">
                                                  <AvatarImage src={kr.pictureURL} className="object-cover" />
                                                  <AvatarFallback className="text-[10px] font-bold bg-zinc-800">
                                                    {kr.fullName?.charAt(0)}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-xs text-zinc-400 truncate">
                                                    {kr.krTitle}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-2 w-32 shrink-0">
                                                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                    <div className={`h-full ${krBar} rounded-full`} style={{ width: `${Math.min(kr.pointOKR, 100)}%` }} />
                                                  </div>
                                                  <span className={`text-[10px] font-black font-mono ${krColor} tabular-nums w-8 text-right`}>
                                                    {Math.floor(kr.pointOKR)}%
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </SheetContent>
    </Sheet>
  );
}
