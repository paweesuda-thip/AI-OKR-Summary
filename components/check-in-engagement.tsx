"use client";

import { useMemo, useState } from "react";
import { ParticipantDetailRaw } from "@/lib/types/okr";
import { AvatarInfoTooltip } from "@/components/ui/avatar-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { 
  MousePointerClick,
  CheckCircle2,
  XCircle,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  ActivitySquare,
  ArrowDownUp,
  ArrowUp,
  ArrowDown
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
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface CheckInEngagementProps {
  participantDetails: ParticipantDetailRaw[];
  showStatus?: boolean;
}

export function CheckInEngagement({ participantDetails, showStatus = true }: CheckInEngagementProps) {
  const [selectedPerson, setSelectedPerson] = useState<ParticipantDetailRaw | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  if (!participantDetails || participantDetails.length === 0) return null;

  const openDetails = (person: ParticipantDetailRaw) => {
    setSelectedPerson(person);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedPerson(null), 300); // delay to allow animation
  };

  const chartData = selectedPerson ? [
    {
      name: "Progress",
      value: selectedPerson.avgPercent,
      fill: selectedPerson.avgPercent >= 75 ? "var(--color-emerald-500)" : 
            selectedPerson.avgPercent >= 50 ? "var(--color-amber-500)" : 
            "var(--color-rose-500)",
    }
  ] : [];

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
                        <div className={`p-1.5 rounded-lg border ${status.bg} ${status.border} shadow-inner bg-background`}>
                          <StatusIcon className={`w-4 h-4 ${status.color}`} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </TooltipProvider>
  );
}
