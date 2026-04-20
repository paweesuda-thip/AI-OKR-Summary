"use client";

import { useMemo, useState, useCallback } from "react";
import { ParticipantDetailRaw, OkrDataRaw } from "@/lib/types/okr";
import { AvatarInfoTooltip } from "@/components/ui/avatar-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchEmployeeObjectiveSummary, type DashboardQueryParams } from "@/lib/api/okr-api";
import { mapObjective, mapObjectiveForPerson } from "@/lib/transformers/okr-transformer";
import type { Objective, PersonObjective } from "@/lib/types/okr";

interface CheckInEngagementProps {
  participantDetails: ParticipantDetailRaw[];
  showStatus?: boolean;
  queryParams?: DashboardQueryParams;
}

export function CheckInEngagement({ participantDetails, showStatus = true, queryParams }: CheckInEngagementProps) {
  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
  const [objectiveModalPerson, setObjectiveModalPerson] = useState<ParticipantDetailRaw | null>(null);
  const [employeeObjectives, setEmployeeObjectives] = useState<Objective[]>([]);
  const [objectivesLoading, setObjectivesLoading] = useState(false);
  const [objectivesError, setObjectivesError] = useState<string | null>(null);
  const [expandedObjectiveId, setExpandedObjectiveId] = useState<number | null>(null);

  type SortColumn = 'rank' | 'name' | 'checkins' | 'missed' | 'progress';
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

  // Sort by selected column
  const sortedParticipants = useMemo(
    () =>
      [...participantDetails].sort((a, b) => {
        let valA: string | number = 0;
        let valB: string | number = 0;

        switch (sortColumn) {
          case 'rank':
            valA = a.seq; valB = b.seq; break;
          case 'name':
            valA = (a.fullName || '').toLowerCase(); valB = (b.fullName || '').toLowerCase(); break;
          case 'checkins':
            valA = a.totalCheckInAll > 0 ? a.totalCheckIn / a.totalCheckInAll : 0;
            valB = b.totalCheckInAll > 0 ? b.totalCheckIn / b.totalCheckInAll : 0;
            break;
          case 'missed':
            valA = a.totalMissCheckIn; valB = b.totalMissCheckIn; break;
          case 'progress':
            valA = a.avgPercent; valB = b.avgPercent; break;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0; // fallback to sequence
      }),
    [participantDetails, sortColumn, sortDirection],
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

  const openDetails = (person: ParticipantDetailRaw) => {
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
        <div className="relative flex flex-col h-full">
          <div className="group bg-background/40 backdrop-blur-2xl border border-white/5 dark:border-white/10 rounded-[28px] p-4 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-6 z-10 w-full flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 rounded-full"></div>
                  <div className="p-2.5 bg-linear-to-br from-blue-500/20 to-blue-500/5 rounded-xl border border-blue-500/30 shadow-inner relative">
                    <ActivitySquare className="w-5 h-5 text-blue-400" />
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
            <div className="hidden lg:grid grid-cols-[60px_2.5fr_1fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-2 border-b border-white/5 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider z-10">
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
              <div 
                className="text-center flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('progress')}
              >
                Status {getSortIcon('progress')}
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
                className="flex items-center justify-end gap-1 flex-1 pr-2 cursor-pointer hover:text-white transition-colors group select-none"
                onClick={() => handleSort('progress')}
              >
                Progress {getSortIcon('progress')}
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 flex flex-col gap-3 z-10">
              {sortedParticipants.map((person) => {
                const status = getStatusData(person.avgPercent);
                const StatusIcon = status.icon;

                return (
                  <div 
                    key={person.employeeId} 
                    onClick={() => openDetails(person)}
                    className="relative grid grid-cols-1 lg:grid-cols-[60px_2.5fr_1fr_1.5fr_1.5fr_1fr] gap-4 lg:gap-4 items-center p-5 lg:p-3 rounded-2xl border bg-white/5 dark:bg-black/20 border-white/5 hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all duration-300 cursor-pointer overflow-hidden group/row"
                  >
                    {/* Seq (Desktop) */}
                    <div className="hidden lg:flex justify-center items-center h-full">
                      <span className="font-mono text-xl italic font-black text-transparent bg-clip-text bg-linear-to-b from-zinc-300 to-zinc-600 group-hover/row:from-white group-hover/row:to-zinc-400 transition-colors">
                        #{person.seq}
                      </span>
                    </div>

                    {/* Participant */}
                    <div className="flex items-center gap-3">
                      <div className="lg:hidden flex shrink-0 items-center justify-center w-7 h-7 rounded-sm border border-white/10 bg-black/40 shadow-inner">
                        <span className="font-mono text-xs italic font-black text-zinc-400">
                          #{person.seq}
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

                    {/* Mobile Stats Wrapping container */}
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

                    {/* Progress with Icon */}
                    <div className="flex items-center justify-between lg:justify-end mt-3 lg:mt-0 pt-3 lg:pt-0 border-t border-white/5 lg:border-0 grow lg:grow-0">
                      {/* Mobile Status placed alongside progress */}
                      <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-black/30 border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text', 'bg')} ${!status.isPending && person.avgPercent >= 75 ? 'animate-pulse' : ''}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${status.color}`}>{status.label}</span>
                      </div>

                      <div className="flex items-center gap-2.5 bg-black/20 lg:bg-transparent px-3 py-1.5 lg:p-0 rounded-lg lg:rounded-none">
                        <span className={`text-xl font-black font-mono ${status.color}`}>
                          {person.avgPercent.toFixed(0)}%
                        </span>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`p-1.5 rounded-lg border ${status.bg} ${status.border} shadow-inner bg-background cursor-pointer hover:opacity-80 transition-opacity`}>
                              <StatusIcon className={`w-4 h-4 ${status.color}`} strokeWidth={2.5} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs font-semibold">
                            {status.label} — {person.avgPercent.toFixed(0)}% average progress
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

      {/* ── Employee Objective Modal ── */}
      <Dialog open={objectiveModalOpen} onOpenChange={(open) => { if (!open) closeObjectiveModal(); }}>
        <DialogContent className="max-w-3xl w-full bg-[#08080a] border border-white/10 rounded-3xl p-0 overflow-hidden shadow-[0_30px_80px_-10px_rgba(0,0,0,0.8)]">
          <DialogTitle className="sr-only">
            {objectiveModalPerson?.fullName} Objectives
          </DialogTitle>

          {objectiveModalPerson && (() => {
            const heroStatus = getStatusData(objectiveModalPerson.avgPercent);
            const ringDash = Math.min(objectiveModalPerson.avgPercent, 100);
            const ringColorHex = heroStatus.color.includes('emerald') ? '#34d399'
              : heroStatus.color.includes('amber') ? '#fbbf24'
              : heroStatus.color.includes('rose') ? '#fb7185'
              : '#71717a';

            // Build per-person objectives via shared helper (single source of truth
            // aligned with versus-mode). Objectives where the person owns zero KRs
            // are dropped entirely — we don't render or count them.
            const personObjectives: PersonObjective[] = employeeObjectives
              .map(o => mapObjectiveForPerson(o, objectiveModalPerson.fullName))
              .filter((o): o is PersonObjective => o !== null);

            const toStatus = (p: number): 'On Track' | 'At Risk' | 'Behind' =>
              p >= 70 ? 'On Track' : p >= 40 ? 'At Risk' : 'Behind';

            const onTrackCount = personObjectives.filter(o => toStatus(o.personProgress) === 'On Track').length;
            const atRiskCount = personObjectives.filter(o => toStatus(o.personProgress) === 'At Risk').length;
            const behindCount = personObjectives.filter(o => toStatus(o.personProgress) === 'Behind').length;

            return (
              <div className="relative">
                {/* Decorative ambient glow matching status */}
                <div
                  className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[120px] opacity-20"
                  style={{ backgroundColor: ringColorHex }}
                />

                {/* ─── HERO HEADER ─── */}
                <div className="relative px-8 pt-8 pb-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar with status ring */}
                    <div className="relative shrink-0">
                      <svg className="w-[88px] h-[88px] -rotate-90" viewBox="0 0 88 88">
                        <circle cx="44" cy="44" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
                        <circle
                          cx="44" cy="44" r="40"
                          stroke={ringColorHex}
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={`${(ringDash / 100) * 251.3} 251.3`}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-1.5">
                        <Avatar className="w-full h-full border-2 border-black">
                          <AvatarImage src={objectiveModalPerson.pictureMediumURL || objectiveModalPerson.pictureURL} />
                          <AvatarFallback className="text-lg font-bold bg-zinc-800">
                            {objectiveModalPerson.fullName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0 pt-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Rank #{objectiveModalPerson.seq}</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight leading-tight truncate">
                        {objectiveModalPerson.fullName}
                      </h2>
                      <p className="text-sm text-zinc-500 truncate">{objectiveModalPerson.fullName_EN}</p>
                    </div>

                    {/* Big progress number */}
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Avg Progress</p>
                      <p className={`text-5xl font-black font-mono leading-none ${heroStatus.color}`}>
                        {objectiveModalPerson.avgPercent.toFixed(0)}
                        <span className="text-xl align-top">%</span>
                      </p>
                      <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${heroStatus.bg} ${heroStatus.border} ${heroStatus.color}`}>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{heroStatus.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── STATS STRIP ─── */}
                <div className="grid grid-cols-4 border-y border-white/5 bg-black/40">
                  <div className="px-5 py-4 border-r border-white/5">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Check-ins</p>
                    <p className="text-lg font-black font-mono text-white mt-1">
                      <span className="text-emerald-400">{objectiveModalPerson.totalCheckIn}</span>
                      <span className="text-zinc-600 text-sm">/{objectiveModalPerson.totalCheckInAll}</span>
                    </p>
                  </div>
                  <div className="px-5 py-4 border-r border-white/5">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Missed</p>
                    <p className="text-lg font-black font-mono mt-1">
                      <span className={objectiveModalPerson.totalMissCheckIn > 0 ? 'text-rose-400' : 'text-zinc-600'}>
                        {objectiveModalPerson.totalMissCheckIn}
                      </span>
                      <span className="text-zinc-600 text-sm">/{objectiveModalPerson.totalMissCheckInAll}</span>
                    </p>
                  </div>
                  <div className="px-5 py-4 border-r border-white/5">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Objectives</p>
                    <p className="text-lg font-black font-mono text-white mt-1">{employeeObjectives.length}</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Breakdown</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono font-bold">
                      <span className="text-emerald-400">{onTrackCount}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-amber-400">{atRiskCount}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-rose-400">{behindCount}</span>
                    </div>
                  </div>
                </div>

                {/* ─── BODY ─── */}
                <div className="px-6 py-5 max-h-[55vh] overflow-y-auto scrollbar-hide">
                  {objectivesLoading && (
                    <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm tracking-wide">Loading objectives…</span>
                    </div>
                  )}

                  {objectivesError && !objectivesLoading && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{objectivesError}</span>
                    </div>
                  )}

                  {!objectivesLoading && !objectivesError && personObjectives.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
                      <div className="p-3 rounded-2xl border border-white/5 bg-white/5">
                        <Target className="w-6 h-6 opacity-50" />
                      </div>
                      <span className="text-sm">No objectives found</span>
                    </div>
                  )}

                  {!objectivesLoading && personObjectives.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-6 bg-white/20" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Objectives</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600">
                        {personObjectives.length} total
                      </span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {!objectivesLoading && personObjectives.map((obj, idx) => {
                      const isExpanded = expandedObjectiveId === obj.objectiveId;
                      const personProgress = obj.personProgress;
                      const objStatus = toStatus(personProgress);
                      const statusColor = objStatus === 'On Track' ? 'text-emerald-400' : objStatus === 'At Risk' ? 'text-amber-400' : 'text-rose-400';
                      const statusBg = objStatus === 'On Track' ? 'bg-emerald-500/10 border-emerald-500/20' : objStatus === 'At Risk' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';
                      const stripeColor = objStatus === 'On Track' ? 'bg-emerald-500' : objStatus === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500';
                      const krCount = obj.subObjectives.length;

                      return (
                        <div
                          key={obj.objectiveId}
                          className={`relative rounded-2xl border bg-white/[0.02] overflow-hidden transition-all ${isExpanded ? 'border-white/15 bg-white/[0.04]' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}`}
                        >
                          {/* Objective Header */}
                          <button
                            className="w-full flex items-center gap-4 px-4 py-4 text-left"
                            onClick={() => setExpandedObjectiveId(isExpanded ? null : obj.objectiveId)}
                          >
                            {/* Number badge */}
                            <div className="shrink-0 flex flex-col items-center w-10">
                              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">O{String(idx + 1).padStart(2, '0')}</span>
                              <span className={`text-2xl font-black font-mono leading-none mt-0.5 ${statusColor}`}>
                                {Math.floor(personProgress)}
                              </span>
                              <span className="text-[8px] text-zinc-600 font-bold mt-0.5">%</span>
                            </div>

                            {/* Vertical divider */}
                            <div className="w-px self-stretch bg-white/5" />

                            {/* Title + progress bar */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded border ${statusBg} ${statusColor}`}>
                                  {objStatus}
                                </div>
                                {krCount > 0 && (
                                  <span className="text-[10px] text-zinc-600 font-mono">
                                    {krCount} Sub-OKR{krCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                                {obj.objectiveName || obj.objectiveName_EN}
                              </p>
                              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                <div
                                  className={`h-full ${stripeColor} rounded-full transition-all duration-500`}
                                  style={{ width: `${Math.min(personProgress, 100)}%` }}
                                />
                                {/* tick marks */}
                                <div className="absolute inset-0 flex justify-between px-0">
                                  {[25, 50, 75].map((tick) => (
                                    <span key={tick} className="w-px h-full bg-black/40" style={{ marginLeft: `${tick}%` }} />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Expand indicator */}
                            <div className={`shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-all ${isExpanded ? 'bg-white/10 rotate-180' : 'hover:bg-white/5'}`}>
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                          </button>

                          {/* Expanded: Sub-OKRs with Key Results */}
                          {isExpanded && obj.subObjectives.length > 0 && (
                            <div className="border-t border-white/5 bg-black/30">
                              <div className="px-5 pt-3 pb-2 flex items-center gap-2">
                                <div className="h-px w-4 bg-white/10" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Key Results</span>
                              </div>
                              <div className="px-3 pb-3 space-y-2">
                                {obj.subObjectives.map((sub, subIdx) => {
                                  const subProg = sub.personProgress;
                                  const subStatus = toStatus(subProg);
                                  const subColor = subStatus === 'On Track' ? 'text-emerald-400' : subStatus === 'At Risk' ? 'text-amber-400' : 'text-rose-400';
                                  const subBar = subStatus === 'On Track' ? 'bg-emerald-500' : subStatus === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500';

                                  return (
                                    <div key={sub.objectiveId} className="rounded-xl border border-white/5 bg-black/40 overflow-hidden">
                                      {/* Sub-OKR header */}
                                      <div className="px-3.5 py-2.5 flex items-start gap-3">
                                        <span className="text-[9px] font-mono font-bold text-zinc-500 shrink-0 pt-0.5 tracking-wider">
                                          KR{String(subIdx + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs text-zinc-200 leading-relaxed line-clamp-2">
                                            {sub.title || sub.title_EN}
                                          </p>
                                          <div className="flex items-center gap-2.5 mt-1.5">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                              <div className={`h-full ${subBar} rounded-full`} style={{ width: `${Math.min(subProg, 100)}%` }} />
                                            </div>
                                            <span className={`text-[11px] font-bold font-mono shrink-0 ${subColor} tabular-nums`}>
                                              {Math.floor(subProg)}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Individual KRs */}
                                      <div className="border-t border-white/5 divide-y divide-white/[0.03]">
                                          {sub.details.map((kr, krIdx) => {
                                            const krColor = kr.pointOKR >= 70 ? 'text-emerald-400' : kr.pointOKR >= 40 ? 'text-amber-400' : 'text-rose-400';
                                            const krBar = kr.pointOKR >= 70 ? 'bg-emerald-500' : kr.pointOKR >= 40 ? 'bg-amber-500' : 'bg-rose-500';
                                            return (
                                              <div key={krIdx} className="px-3.5 py-2.5 flex items-start gap-3 bg-black/20">
                                                <Avatar className="w-6 h-6 mt-0.5 shrink-0 border border-white/10">
                                                  <AvatarImage src={kr.pictureURL} />
                                                  <AvatarFallback className="text-[9px] bg-zinc-800">
                                                    {kr.fullName?.charAt(0)}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                                                    {kr.krTitle}
                                                  </p>
                                                  <div className="flex items-center gap-2.5 mt-1.5">
                                                    <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                                                      <div className={`h-full ${krBar} rounded-full`} style={{ width: `${Math.min(kr.pointOKR, 100)}%` }} />
                                                    </div>
                                                    <span className={`text-[10px] font-bold font-mono shrink-0 ${krColor} tabular-nums`}>
                                                      {Math.floor(kr.pointOKR)}%
                                                    </span>
                                                  </div>
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
            );
          })()}
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  );
}
