"use client";

import { useMemo, useState, useCallback } from "react";
import { ParticipantDetailRaw, OkrDataRaw } from "@/src/Domain/Entities/Okr";
import { AvatarInfoTooltip } from "@/src/Interface/Ui/Primitives/avatar-tooltip";
import { 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  ActivitySquare,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  Target,
  Star,
  Flame,
  Award,
  Sparkles
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/Interface/Ui/Primitives/tooltip";
import { fetchEmployeeObjectiveSummary, type DashboardQueryParams } from "@/src/Infrastructure/Persistence/OkrHttpRepository";
import { mapObjective } from "@/src/Infrastructure/Persistence/Mappers/OkrMapper";
import type { Objective } from "@/src/Domain/Entities/Okr";

import { ParticipantObjectiveDrawer } from "./ParticipantObjectiveDrawer";

interface CheckInEngagementProps {
  participantDetails: ParticipantDetailRaw[];
  showStatus?: boolean;
  queryParams?: DashboardQueryParams;
}

/** Client table row: API shape + 1-based rank by total score (not from backend). */
type ParticipantWithDisplayRank = ParticipantDetailRaw & { displayRank: number };

export function CheckInEngagement({ participantDetails, showStatus = true, queryParams }: CheckInEngagementProps) {
  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
  const [objectiveModalPerson, setObjectiveModalPerson] = useState<ParticipantWithDisplayRank | null>(null);
  const [employeeObjectives, setEmployeeObjectives] = useState<Objective[]>([]);
  const [objectivesLoading, setObjectivesLoading] = useState(false);
  const [objectivesError, setObjectivesError] = useState<string | null>(null);

  type SortColumn = 'rank' | 'name' | 'checkins' | 'missed' | 'goal' | 'quality' | 'engagement' | 'score';
  type SortDirection = 'asc' | 'desc';

  const [sortColumn, setSortColumn] = useState<SortColumn>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'rank' || column === 'name' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowDownUp className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-400" /> 
      : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  const rankedParticipants = useMemo(() => {
    return [...participantDetails].sort((a, b) => {
        const scoreA = a.totalScore ?? a.avgPercent;
        const scoreB = b.totalScore ?? b.avgPercent;
        return scoreB - scoreA;
    }).map((p, idx) => ({ ...p, displayRank: idx + 1 }));
  }, [participantDetails]);

  // Sort by selected column
  const sortedParticipants = useMemo(
    () =>
      [...rankedParticipants].sort((a, b) => {
        let valA: string | number = 0;
        let valB: string | number = 0;

        switch (sortColumn) {
          case 'rank':
            valA = a.displayRank; valB = b.displayRank; break;
          case 'name':
            valA = (a.fullName || '').toLowerCase(); valB = (b.fullName || '').toLowerCase(); break;
          case 'checkins':
            valA = a.totalCheckInAll > 0 ? a.totalCheckIn / a.totalCheckInAll : 0;
            valB = b.totalCheckInAll > 0 ? b.totalCheckIn / b.totalCheckInAll : 0;
            break;
          case 'missed':
            valA = a.totalMissCheckIn; valB = b.totalMissCheckIn; break;
          case 'goal':
            valA = a.goalAchievementScore ?? 0; valB = b.goalAchievementScore ?? 0; break;
          case 'quality':
            valA = a.qualityScore ?? 0; valB = b.qualityScore ?? 0; break;
          case 'engagement':
            valA = a.engagementBehaviorScore ?? 0; valB = b.engagementBehaviorScore ?? 0; break;
          case 'score':
            valA = a.totalScore ?? a.avgPercent; valB = b.totalScore ?? b.avgPercent; break;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }),
    [rankedParticipants, sortColumn, sortDirection],
  );

  const closeObjectiveModal = useCallback(() => {
    setObjectiveModalOpen(false);
    setTimeout(() => {
      setObjectiveModalPerson(null);
      setEmployeeObjectives([]);
      setObjectivesError(null);
    }, 300);
  }, []);

  if (!participantDetails || participantDetails.length === 0) return null;

  const openDetails = (person: ParticipantWithDisplayRank) => {
    if (!queryParams) return;
    setObjectiveModalPerson(person);
    setObjectiveModalOpen(true);
    setEmployeeObjectives([]);
    setObjectivesError(null);
    setObjectivesLoading(true);
    fetchEmployeeObjectiveSummary({ ...queryParams, employeeId: person.employeeId })
      .then((raw: OkrDataRaw[]) => {
        setEmployeeObjectives(raw.map(mapObjective));
      })
      .catch((err: unknown) => {
        setObjectivesError(err instanceof Error ? err.message : 'Failed to load objectives');
      })
      .finally(() => setObjectivesLoading(false));
  };

  const getStatusData = (percent: number) => {
    if (!showStatus) return {
      label: 'TBD',
      color: 'text-zinc-500',
      bg: 'bg-zinc-500/10',
      border: 'border-zinc-500/20',
      icon: ActivitySquare,
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

  return (
    <TooltipProvider delay={220}>
      <div className="w-full relative z-10 pt-8">
        
        {/* Full Table/List View */}
        <div className="relative flex flex-col h-full perspective-1000">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none z-0 animate-pulse" />
          
          <div className="group bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 sm:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden transition-all duration-300 z-10">
            {/* Ambient grid texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjI0IiB5Mj0iMCIvPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIyNCIvPjwvZz48L3N2Zz4=')] pointer-events-none opacity-50" />
            
            <div className="flex items-center justify-between mb-8 z-10 w-full flex-wrap gap-4 border-b border-white/10 pb-6 relative">
              <div className="absolute -bottom-px left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 rounded-full animate-pulse"></div>
                  <div className="p-3 bg-linear-to-br from-blue-500/30 to-blue-500/10 rounded-2xl border border-blue-400/50 shadow-inner relative backdrop-blur-md">
                    <ActivitySquare className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/70 tracking-tight">Engagement Overview</h3>
                  <p className="text-[11px] text-blue-400/80 mt-0.5 font-medium uppercase tracking-widest">Participant Performance List</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-auto">
                {/* Mobile Sort Dropdown */}
                <div className="lg:hidden relative">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors cursor-pointer shadow-inner">
                    <ArrowDownUp className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sort</span>
                  </div>
                  <select 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={`${sortColumn}-${sortDirection}`}
                    onChange={(e) => {
                      const [col, dir] = e.target.value.split('-');
                      setSortColumn(col as SortColumn);
                      setSortDirection(dir as SortDirection);
                    }}
                  >
                    <option value="rank-asc">Rank (Asc)</option>
                    <option value="rank-desc">Rank (Desc)</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="score-desc">Total score (High)</option>
                    <option value="score-asc">Total score (Low)</option>
                    <option value="checkins-desc">Check-in rate (High)</option>
                    <option value="checkins-asc">Check-in rate (Low)</option>
                    <option value="missed-desc">Missed (High)</option>
                    <option value="missed-asc">Missed (Low)</option>
                    <option value="engagement-desc">Engagement behavior (High)</option>
                    <option value="engagement-asc">Engagement behavior (Low)</option>
                    <option value="goal-desc">Goal (High)</option>
                    <option value="goal-asc">Goal (Low)</option>
                    <option value="quality-desc">Quality (High)</option>
                    <option value="quality-asc">Quality (Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Header row — Engage column header is behavior score only (subset metrics stay in cells) */}
            <div className="hidden lg:grid grid-cols-[60px_minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1fr)] gap-3 lg:gap-4 px-4 py-2 border-b border-white/5 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider z-10 [&>*]:min-w-0">
              <div 
                className="text-center flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('rank')}
              >
                Rank {getSortIcon('rank')}
              </div>
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('name')}
              >
                Participant {getSortIcon('name')}
              </div>
              <div className="text-center flex items-center justify-center gap-1 select-none">
                Status
              </div>
              <div className="flex items-center justify-center min-w-0 text-center">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none text-muted-foreground"
                  onClick={(e) => { e.stopPropagation(); handleSort('engagement'); }}
                >
                  Engage {getSortIcon('engagement')}
                </button>
              </div>
              <div 
                className="flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('goal')}
              >
                Goal {getSortIcon('goal')}
              </div>
              <div 
                className="flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('quality')}
              >
                Quality {getSortIcon('quality')}
              </div>
              <div 
                className="flex items-center justify-end gap-1 flex-1 pr-2 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('score')}
              >
                Score {getSortIcon('score')}
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 flex flex-col gap-3 z-10">
              {sortedParticipants.map((person) => {
                const status = getStatusData(person.totalScore ?? person.avgPercent);

                return (
                  <div 
                    key={person.employeeId} 
                    onClick={() => openDetails(person)}
                    className="relative grid grid-cols-1 lg:grid-cols-[60px_minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1fr)] gap-3 lg:gap-4 items-center p-5 lg:p-3 rounded-2xl border bg-black/40 border-white/10 hover:bg-black/60 hover:border-white/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 cursor-pointer overflow-hidden group/row [&>*]:min-w-0"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    {/* Seq (Desktop) */}
                    <div className="hidden lg:flex justify-center items-center h-full relative">
                      {person.displayRank === 1 && <div className="absolute inset-0 m-auto w-10 h-10 rounded-full blur-md bg-amber-500/40 animate-pulse" />}
                      {person.displayRank === 2 && <div className="absolute inset-0 m-auto w-10 h-10 rounded-full blur-md bg-slate-300/40 animate-pulse" />}
                      {person.displayRank === 3 && <div className="absolute inset-0 m-auto w-10 h-10 rounded-full blur-md bg-orange-600/40 animate-pulse" />}
                      <span className={`font-mono text-2xl italic font-black relative z-10 drop-shadow-xl ${
                        person.displayRank === 1 ? 'text-transparent bg-clip-text bg-linear-to-b from-yellow-200 to-amber-600' :
                        person.displayRank === 2 ? 'text-transparent bg-clip-text bg-linear-to-b from-slate-200 to-slate-500' :
                        person.displayRank === 3 ? 'text-transparent bg-clip-text bg-linear-to-b from-orange-300 to-orange-700' :
                        'text-transparent bg-clip-text bg-linear-to-b from-zinc-400 to-zinc-700 group-hover/row:from-white group-hover/row:to-zinc-300'
                      }`}>
                        #{person.displayRank}
                      </span>
                    </div>

                    {/* Participant */}
                    <div className="flex items-center gap-3">
                      <div className="lg:hidden flex shrink-0 items-center justify-center w-7 h-7 rounded-sm border border-white/10 bg-black/40 shadow-inner">
                        <span className="font-mono text-xs italic font-black text-zinc-400">
                          #{person.displayRank}
                        </span>
                      </div>
                      
                      <AvatarInfoTooltip
                        fullName={person.fullName}
                        pictureURL={person.pictureMediumURL || person.pictureURL}
                        avatarClassName="w-10 h-10 border-2 border-white/10 shadow-lg group-hover/row:border-white/30 transition-colors"
                        fallbackClassName="text-xs font-medium"
                      />
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate group-hover/row:text-white transition-colors">
                          {person.fullName}
                        </h4>
                        <span className="text-[10px] text-muted-foreground truncate">{person.fullName_EN}</span>
                      </div>
                    </div>

                    {/* Status Pill (Desktop) */}
                    <div className="hidden lg:flex justify-center">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${status.bg} ${status.border} ${status.color} shadow-inner`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${!status.isPending && person.avgPercent >= 75 ? 'animate-pulse' : ''}`} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{status.label}</span>
                      </div>
                    </div>

                    {/* Engage: score + two stacked rows (Check-ins / Missed) — avoids awkward mid-line wraps */}
                    <div className="w-full min-w-0 mt-2 lg:mt-0 pt-2 lg:pt-0 border-t border-white/5 lg:border-0 flex flex-col items-center justify-center gap-1">
                      <span className="lg:hidden text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Engage</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex w-full min-w-0 max-w-[13.5rem] lg:max-w-none flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 sm:px-2 cursor-pointer outline-none hover:bg-white/[0.06] transition-colors">
                            <div className="flex items-baseline gap-1 justify-center shrink-0">
                              <Flame className="w-4 h-4 text-purple-500 shrink-0 opacity-90" aria-hidden />
                              <span className="text-xl lg:text-lg font-black text-purple-400 font-mono tabular-nums leading-none">
                                {(person.engagementBehaviorScore ?? 0).toFixed(0)}
                              </span>
                            </div>
                            {/* <div className="w-full min-w-0 flex flex-col gap-1 text-[11px] sm:text-[12px] leading-tight tabular-nums">
                              <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                                <span className="font-medium text-emerald-400/95 shrink-0">Check-ins</span>
                                <span className="text-foreground/80 text-right tabular-nums truncate">
                                  {person.totalCheckIn}
                                </span>
                              </div>
                              {person.totalMissCheckIn > 0 && (
                                <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                                  <span className="font-medium text-rose-400/95 shrink-0">Missed</span>
                                  <span className="text-right tabular-nums truncate text-rose-300">
                                    {person.totalMissCheckIn}
                                  </span>
                                </div>
                              )}
                            </div> */}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          arrowClassName="!bg-zinc-950 !fill-zinc-950"
                          className="!max-w-[min(92vw,18rem)] !rounded-xl !border !border-white/12 !bg-zinc-950/96 !p-0 !text-zinc-100 !shadow-[0_22px_56px_-14px_rgba(0,0,0,0.72)] !backdrop-blur-xl !inline-flex !flex-col !items-stretch !gap-0 text-[13px] leading-snug"
                        >
                          <div className="border-b border-white/10 px-3.5 pb-2.5 pt-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/12 ring-1 ring-purple-400/20">
                                <Flame className="h-4 w-4 text-purple-300" aria-hidden />
                              </span>
                              <p className="text-sm font-semibold leading-tight tracking-tight text-zinc-50">
                                Engagement detail
                              </p>
                            </div>
                          </div>
                          <dl className="space-y-2 px-3 pb-3 pt-2.5">
                            <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-2">
                              <dt className="text-[10px] font-semibold uppercase tracking-wide text-purple-200/95">
                                Behavior score
                              </dt>
                              <dd className="mt-1 flex items-end justify-between gap-3">
                                <span className="text-[11px] leading-relaxed text-zinc-400">
                                  Participation signal in the composite.
                                </span>
                                <span className="shrink-0 font-mono text-lg font-bold tabular-nums text-purple-100">
                                  {(person.engagementBehaviorScore ?? 0).toFixed(0)}
                                </span>
                              </dd>
                            </div>
                            <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-2">
                              <dt className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300/95">
                                Check-ins
                              </dt>
                              <dd className="mt-1 flex items-end justify-between gap-3">
                                <span className="text-[11px] leading-relaxed text-zinc-400">
                                  Completed vs expected (period).
                                </span>
                                <span className="shrink-0 font-mono text-base font-semibold tabular-nums text-emerald-100">
                                  {person.totalCheckIn}
                                  <span className="text-zinc-500">/</span>
                                  {person.totalCheckInAll}
                                </span>
                              </dd>
                            </div>
                            {person.totalMissCheckIn > 0 && (
                              <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-2">
                                <dt className="text-[10px] font-semibold uppercase tracking-wide text-rose-300/95">
                                  Missed
                                </dt>
                                <dd className="mt-1 flex items-end justify-between gap-3">
                                  <span className="text-[11px] leading-relaxed text-zinc-400">
                                    Instances vs tracked slots.
                                  </span>
                                  <span className="shrink-0 font-mono text-base font-semibold tabular-nums text-rose-200">
                                    {person.totalMissCheckIn}
                                    <span className="text-zinc-500">/</span>
                                    {person.totalMissCheckInAll}
                                  </span>
                                </dd>
                              </div>
                            )}
                          </dl>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Goal + Quality */}
                    <div className="grid grid-cols-2 lg:contents w-full mt-2 lg:mt-0 pt-2 lg:pt-0 border-t border-white/5 lg:border-0 gap-2">
                       <div className="flex flex-col items-center justify-center bg-black/20 lg:bg-transparent rounded-lg p-2 lg:p-0">
                         <div className="flex items-center gap-1.5 mb-1 lg:hidden">
                           <Target className="w-3 h-3 text-emerald-500" />
                           <span className="text-[9px] text-muted-foreground font-semibold uppercase">Goal</span>
                         </div>
                         <div className="flex items-baseline gap-1">
                           <Target className="w-3.5 h-3.5 text-emerald-500 hidden lg:block mr-1 opacity-70" />
                           <span className="text-lg font-black text-emerald-400 font-mono">
                             {(person.goalAchievementScore ?? 0).toFixed(0)}
                           </span>
                         </div>
                       </div>
                       
                       <div className="flex flex-col items-center justify-center bg-black/20 lg:bg-transparent rounded-lg p-2 lg:p-0">
                         <div className="flex items-center gap-1.5 mb-1 lg:hidden">
                           <Star className="w-3 h-3 text-amber-500" />
                           <span className="text-[9px] text-muted-foreground font-semibold uppercase">Quality</span>
                         </div>
                         <div className="flex items-baseline gap-1">
                           <Star className="w-3.5 h-3.5 text-amber-500 hidden lg:block mr-1 opacity-70" />
                           <span className="text-lg font-black text-amber-400 font-mono">
                             {(person.qualityScore ?? 0).toFixed(0)}
                           </span>
                         </div>
                       </div>
                    </div>

                    {/* Total Score with Icon */}
                    <div className="flex items-center justify-between lg:justify-end mt-3 lg:mt-0 pt-3 lg:pt-0 border-t border-white/5 lg:border-0 grow lg:grow-0">
                      <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30">
                        <Award className={`w-3.5 h-3.5 text-blue-400`} />
                        <span className={`text-[9px] font-bold uppercase tracking-widest text-blue-400`}>Total Score</span>
                      </div>

                      <div className="flex items-center gap-2.5 bg-black/20 lg:bg-transparent px-3 py-1.5 lg:p-0 rounded-lg lg:rounded-none">
                        <span className={`text-xl font-black font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`}>
                          {(person.totalScore ?? 0).toFixed(0)}
                        </span>
                        
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`p-1.5 rounded-lg border shadow-inner bg-background cursor-pointer hover:opacity-80 transition-opacity ${
                              person.trend === 'up' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                              person.trend === 'down' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                              'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                            }`}>
                              {person.trend === 'up' ? <TrendingUp className="w-4 h-4" strokeWidth={2.5} /> :
                               person.trend === 'down' ? <TrendingDown className="w-4 h-4" strokeWidth={2.5} /> :
                               <Activity className="w-4 h-4" strokeWidth={2.5} />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="!bg-zinc-950 !border-zinc-800 !text-zinc-100 max-w-[320px] p-0 overflow-hidden shadow-2xl">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${person.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : person.trend === 'down' ? 'bg-rose-500/15 text-rose-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                                  {person.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : person.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                                    {person.trend === 'up' ? 'Improving' : person.trend === 'down' ? 'Declining' : 'Stable'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* AI Reason */}
                              {(!queryParams?.dateStart && !queryParams?.dateEnd) && person.aiScoreReason && (
                                <div className="text-zinc-300 font-normal leading-relaxed text-xs">
                                  <div className="flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <p>{person.aiScoreReason}</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Score Breakdown */}
                              <div className="mt-3 pt-3 border-t border-zinc-800">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-center">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Goal</div>
                                    <div className="text-sm font-bold text-emerald-400">{Math.round(person.goalAchievementScore ?? 0)}</div>
                                  </div>
                                  <div className="text-center border-x border-zinc-800">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Quality</div>
                                    <div className="text-sm font-bold text-amber-400">{Math.round(person.qualityScore ?? 0)}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Engage</div>
                                    <div className="text-sm font-bold text-purple-400">{Math.round(person.engagementBehaviorScore ?? 0)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── Employee Objective Drawer ── */}
      <ParticipantObjectiveDrawer
        open={objectiveModalOpen}
        onOpenChange={(open) => { if (!open) closeObjectiveModal(); else setObjectiveModalOpen(true); }}
        person={objectiveModalPerson}
        objectives={employeeObjectives}
        loading={objectivesLoading}
        error={objectivesError}
        showStatus={showStatus}
        showAiReason={!queryParams?.dateStart && !queryParams?.dateEnd}
      />
    </TooltipProvider>
  );
}
