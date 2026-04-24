"use client";

import { useMemo, useState, useCallback } from "react";
import { ParticipantDetailRaw, OkrDataRaw } from "@/src/Domain/Entities/Okr";
import { AvatarInfoTooltip } from "@/src/Interface/Ui/Primitives/avatar-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/Interface/Ui/Primitives/avatar";
import { 
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  ActivitySquare,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  Target,
  ChevronDown,
  Loader2,
  AlertCircle,
  Star,
  Flame,
  Award
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
import { fetchEmployeeObjectiveSummary, type DashboardQueryParams } from "@/src/Infrastructure/Persistence/OkrHttpRepository";
import { mapObjective, mapObjectiveForPerson } from "@/src/Infrastructure/Persistence/Mappers/OkrMapper";
import type { Objective, PersonObjective } from "@/src/Domain/Entities/Okr";

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
  const [expandedObjectiveId, setExpandedObjectiveId] = useState<number | null>(null);

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
    setExpandedObjectiveId(null);
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
    if (percent >= 75) return { 
      label: 'On Track', 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20', 
      icon: TrendingUp,
      chartColor: 'emerald'
    };
    if (percent >= 50) return { 
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
    <TooltipProvider delay={150}>
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
                    <option value="progress-desc">Progress (Highest)</option>
                    <option value="progress-asc">Progress (Lowest)</option>
                    <option value="checkins-desc">Check-ins (Highest)</option>
                    <option value="missed-desc">Missed (Highest)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Header row for Desktop */}
            <div className="hidden lg:grid grid-cols-[60px_2.5fr_1fr_1fr_1fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 px-4 py-2 border-b border-white/5 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider z-10">
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
              <div 
                className="text-center flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('checkins')}
              >
                Check-in {getSortIcon('checkins')}
              </div>
              <div 
                className="text-center flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('missed')}
              >
                Missed {getSortIcon('missed')}
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
                className="flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('engagement')}
              >
                Engage {getSortIcon('engagement')}
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
                const StatusIcon = status.icon;

                return (
                  <div 
                    key={person.employeeId} 
                    onClick={() => openDetails(person)}
                    className="relative grid grid-cols-1 lg:grid-cols-[60px_2.5fr_1fr_1fr_1fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 lg:gap-4 items-center p-5 lg:p-3 rounded-2xl border bg-black/40 border-white/10 hover:bg-black/60 hover:border-white/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 cursor-pointer overflow-hidden group/row"
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

                    {/* Check-ins Desktop+Mobile */}
                    <div className="grid grid-cols-2 gap-4 lg:contents w-full mt-2 lg:mt-0 pt-2 lg:pt-0 border-t border-white/5 lg:border-0">
                      {/* Check-ins */}
                      <div className="flex flex-col lg:items-center justify-center">
                        <span className="lg:hidden text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Check-ins</span>
                        <div className="flex items-baseline gap-1 bg-black/20 lg:bg-transparent px-3 py-1.5 lg:p-0 rounded-lg lg:rounded-none">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 lg:hidden mr-1" />
                          <span className="text-xl font-black text-emerald-400 font-mono">{person.totalCheckIn}</span>
                          <span className="text-xs text-muted-foreground font-semibold">/{person.totalCheckInAll}</span>
                        </div>
                      </div>

                      {/* Missed Check-ins */}
                      <div className="flex flex-col lg:items-center justify-center border-l border-white/5 pl-4 lg:border-0 lg:pl-0">
                        <span className="lg:hidden text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Missed</span>
                        <div className="flex items-baseline gap-1 bg-black/20 lg:bg-transparent px-3 py-1.5 lg:p-0 rounded-lg lg:rounded-none">
                          <XCircle className={`w-3 h-3 lg:hidden mr-1 ${person.totalMissCheckIn > 0 ? 'text-rose-500' : 'text-zinc-500'}`} />
                          <span className={`text-xl font-black font-mono ${person.totalMissCheckIn > 0 ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-zinc-500'}`}>
                            {person.totalMissCheckIn}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">/{person.totalMissCheckInAll}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Container Desktop & Mobile */}
                    <div className="grid grid-cols-3 lg:contents w-full mt-2 lg:mt-0 pt-2 lg:pt-0 border-t border-white/5 lg:border-0 gap-2">
                       {/* Goal */}
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
                       
                       {/* Quality */}
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

                       {/* Engagement */}
                       <div className="flex flex-col items-center justify-center bg-black/20 lg:bg-transparent rounded-lg p-2 lg:p-0">
                         <div className="flex items-center gap-1.5 mb-1 lg:hidden">
                           <Flame className="w-3 h-3 text-purple-500" />
                           <span className="text-[9px] text-muted-foreground font-semibold uppercase">Engage</span>
                         </div>
                         <div className="flex items-baseline gap-1">
                           <Flame className="w-3.5 h-3.5 text-purple-500 hidden lg:block mr-1 opacity-70" />
                           <span className="text-lg font-black text-purple-400 font-mono">
                             {(person.engagementBehaviorScore ?? 0).toFixed(0)}
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
                          <TooltipContent side="left" className="text-xs font-semibold">
                            Trend: {person.trend === 'up' ? 'Improving' : person.trend === 'down' ? 'Declining' : 'Stable'}
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
      <Sheet open={objectiveModalOpen} onOpenChange={(open) => { if (!open) closeObjectiveModal(); }}>
        <SheetContent side="right" showCloseButton={false} className="w-full !max-w-full sm:!max-w-xl lg:!max-w-[1000px] xl:!max-w-[1200px] bg-[#040406]/95 backdrop-blur-3xl border-l border-white/10 p-0 overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.8)]">
          <SheetTitle className="sr-only">
            {objectiveModalPerson?.fullName} Objectives
          </SheetTitle>

          {objectiveModalPerson && (() => {
            const displayScore = objectiveModalPerson.totalScore ?? objectiveModalPerson.avgPercent;
            const heroStatus = getStatusData(displayScore);
            const ringDash = Math.min(displayScore, 100);
            const ringColorHex = showStatus
              ? (heroStatus.color.includes('emerald') ? '#34d399'
                : heroStatus.color.includes('amber') ? '#fbbf24'
                : heroStatus.color.includes('rose') ? '#fb7185'
                : '#71717a')
              : '#818cf8';

            const personObjectives: PersonObjective[] = employeeObjectives
              .map(o => mapObjectiveForPerson(o, objectiveModalPerson.fullName))
              .filter((o): o is PersonObjective => o !== null);

            const toStatus = (p: number): 'On Track' | 'At Risk' | 'Behind' =>
              p >= 70 ? 'On Track' : p >= 40 ? 'At Risk' : 'Behind';

            const onTrackCount = personObjectives.filter(o => toStatus(o.personProgress) === 'On Track').length;
            const atRiskCount = personObjectives.filter(o => toStatus(o.personProgress) === 'At Risk').length;
            const behindCount = personObjectives.filter(o => toStatus(o.personProgress) === 'Behind').length;

            return (
              <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* Decorative ambient glow matching status */}
                <div
                  className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 mix-blend-screen"
                  style={{ backgroundColor: ringColorHex }}
                />

                {/* ─── HERO HEADER ─── */}
                <div className="relative px-8 pt-10 pb-8 shrink-0 z-10">
                  {/* Close Button Inside Drawer */}
                  <button onClick={closeObjectiveModal} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-50">
                    <XCircle className="w-5 h-5 text-white/70" />
                  </button>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
                    {/* Avatar with dynamic status ring */}
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
                          <AvatarImage src={objectiveModalPerson.pictureMediumURL || objectiveModalPerson.pictureURL} className="object-cover" />
                          <AvatarFallback className="text-2xl font-bold bg-zinc-900 text-zinc-300">
                            {objectiveModalPerson.fullName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0 pt-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center sm:justify-start">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/10 bg-white/5 shadow-inner">
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Rank</span>
                          <span className="text-xs font-black font-mono text-white">#{objectiveModalPerson.displayRank}</span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-white/70 tracking-tight leading-tight truncate drop-shadow-sm mb-1">
                        {objectiveModalPerson.fullName}
                      </h2>
                      <p className="text-sm font-medium text-blue-400/80 truncate uppercase tracking-widest">
                        {objectiveModalPerson.fullName_EN}
                      </p>
                    </div>

                    {/* Big progress number */}
                    <div className="shrink-0 w-full sm:w-auto pt-4 sm:pt-2 sm:mr-12 flex flex-col items-center sm:items-end">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">Total Score</p>
                      <p className={`text-6xl font-black font-mono leading-none ${showStatus ? heroStatus.color : 'text-indigo-300'} drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]`}>
                        {displayScore.toFixed(0)}
                      </p>
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

                {/* ─── RADAR CHART & STATS STRIP ─── */}
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] border-y border-white/10 bg-black/60 relative">
                  {/* Radar Chart */}
                  <div className="p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative min-h-[260px]">
                    <div className="absolute top-4 left-5">
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Performance Radar</p>
                       <p className="text-white text-xs font-semibold">Multi-dimensional Metrics</p>
                    </div>
                    {/* Glowing background behind radar */}
                    <div className="absolute inset-0 m-auto w-40 h-40 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="w-full h-full min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart 
                          cx="50%" 
                          cy="55%" 
                          outerRadius="65%" 
                          data={[
                            { subject: 'Goal', A: objectiveModalPerson.goalAchievementScore ?? 0, fullMark: 100 },
                            { subject: 'Quality', A: objectiveModalPerson.qualityScore ?? 0, fullMark: 100 },
                            { subject: 'Engagement', A: objectiveModalPerson.engagementBehaviorScore ?? 0, fullMark: 100 },
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
                  
                  {/* Detailed Scores */}
                  <div className="flex flex-col justify-center divide-y divide-white/5 bg-black/20">
                    <div className="px-6 py-4 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Target className="w-4 h-4 text-emerald-500" />
                         <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Goal Achievement</span>
                       </div>
                       <span className="text-xl font-mono font-black text-emerald-400">{(objectiveModalPerson.goalAchievementScore ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Star className="w-4 h-4 text-amber-500" />
                         <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Quality of Work</span>
                       </div>
                       <span className="text-xl font-mono font-black text-amber-400">{(objectiveModalPerson.qualityScore ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Flame className="w-4 h-4 text-purple-500" />
                         <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Engagement & Behavior</span>
                       </div>
                       <span className="text-xl font-mono font-black text-purple-400">{(objectiveModalPerson.engagementBehaviorScore ?? 0).toFixed(0)}</span>
                    </div>
                  </div>
                {/* ─── BODY (Objectives) ─── */}
                <div className="md:col-span-2 w-full pb-10 border-t border-white/5 md:border-t-0">
                  {/* Additional Tabs / Sub-header could go here */}
                  <div className="px-8 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between shadow-sm">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Key Results Details</span>
                  </div>
                  
                  <div className="px-8 py-6">
                    {objectivesLoading && (
                      <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-500">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-sm font-semibold tracking-widest uppercase">Syncing Database...</span>
                      </div>
                    )}

                    {objectivesError && !objectivesLoading && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit mx-auto mt-10">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">{objectivesError}</span>
                      </div>
                    )}

                    {!objectivesLoading && !objectivesError && personObjectives.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-600">
                        <div className="p-4 rounded-3xl border border-white/5 bg-white/5 shadow-inner">
                          <Target className="w-8 h-8 opacity-40" />
                        </div>
                        <span className="text-sm font-semibold tracking-widest uppercase mt-4">No Objectives Found</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {!objectivesLoading && personObjectives.map((obj) => {
                        const isExpanded = expandedObjectiveId === obj.objectiveId;
                        const personProgress = obj.personProgress;
                        const objStatus = toStatus(personProgress);
                        const statusColor = showStatus ? (objStatus === 'On Track' ? 'text-emerald-400' : objStatus === 'At Risk' ? 'text-amber-400' : 'text-rose-400') : 'text-indigo-300';
                        const statusBg = showStatus ? (objStatus === 'On Track' ? 'bg-emerald-500/10 border-emerald-500/20' : objStatus === 'At Risk' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20') : 'bg-indigo-500/10 border-indigo-500/20';
                        const stripeColor = showStatus ? (objStatus === 'On Track' ? 'bg-emerald-500' : objStatus === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500') : 'bg-indigo-400';
                        const krCount = obj.subObjectives.length;

                        return (
                          <div
                            key={obj.objectiveId}
                            className={`relative rounded-3xl border bg-black/40 overflow-hidden transition-all duration-300 ${isExpanded ? 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.05]'}`}
                          >
                            {isExpanded && <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent pointer-events-none" />}
                            
                            {/* Objective Header */}
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

                            {/* Expanded: Sub-OKRs with Key Results */}
                            {isExpanded && obj.subObjectives.length > 0 && (
                              <div className="border-t border-white/10 bg-black/60 relative z-10 px-6 py-5">
                                <div className="space-y-4">
                                  {obj.subObjectives.map((sub, subIdx) => {
                                    const subProg = sub.personProgress;
                                    const subStatus = toStatus(subProg);
                                    const subColor = showStatus ? (subStatus === 'On Track' ? 'text-emerald-400' : subStatus === 'At Risk' ? 'text-amber-400' : 'text-rose-400') : 'text-indigo-300';
                                    const subBar = showStatus ? (subStatus === 'On Track' ? 'bg-emerald-500' : subStatus === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500') : 'bg-indigo-400';

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
                                              const krColor = showStatus ? (kr.pointOKR >= 70 ? 'text-emerald-400' : kr.pointOKR >= 40 ? 'text-amber-400' : 'text-rose-400') : 'text-indigo-300';
                                              const krBar = showStatus ? (kr.pointOKR >= 70 ? 'bg-emerald-500' : kr.pointOKR >= 40 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-indigo-400';
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
            </div>
            );
          })()}
        </SheetContent>
      </Sheet>

    </TooltipProvider>
  );
}
