"use client";

import { useState } from "react";
import { ParticipantDetailRaw } from "@/lib/types/okr";
import { AvatarInfoTooltip } from "@/components/ui/avatar-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { 
  AlertCircle, 
  MousePointerClick,
  CheckCircle2,
  XCircle,
  X,
  Trophy
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
}

export function CheckInEngagement({ participantDetails }: CheckInEngagementProps) {
  const [selectedPerson, setSelectedPerson] = useState<ParticipantDetailRaw | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!participantDetails || participantDetails.length === 0) return null;

  // Top 3 Most Check-ins
  const topCheckIns = [...participantDetails]
    .sort((a, b) => b.totalCheckInAll - a.totalCheckInAll || b.totalCheckIn - a.totalCheckIn)
    .slice(0, 3);

  // Top 3 Most Missed Check-ins
  const mostMissedCheckIns = [...participantDetails]
    .filter(p => p.totalMissCheckIn > 0)
    .sort((a, b) => b.totalMissCheckInAll - a.totalMissCheckInAll || b.totalMissCheckIn - a.totalMissCheckIn)
    .slice(0, 3);

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

  const getRankStyle = (index: number, isPositive: boolean) => {
    if (index === 0) {
      return isPositive 
        ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 scale-[1.02]"
        : "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 scale-[1.02]";
    }
    return "bg-white/5 dark:bg-black/20 border-white/5 hover:bg-white/10 hover:border-white/10";
  };

  return (
    <TooltipProvider delay={150}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full relative z-10 pt-8">
        
        {/* Top 3 Engaged Leaderboard */}
        <div className="relative flex flex-col h-full">
          
          <div className="group bg-background/40 backdrop-blur-2xl border border-white/5 dark:border-white/10 rounded-[24px] p-4 sm:p-5 shadow-2xl flex flex-col h-full relative overflow-hidden transition-all duration-300">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-5 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 rounded-full"></div>
                  <div className="p-2.5 bg-linear-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl border border-emerald-500/30 shadow-inner relative">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/70 tracking-tight">Top 3 Check-ins</h3>
                  <p className="text-[10px] text-emerald-400/80 mt-0.5 font-medium uppercase tracking-widest">Most Engaged</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-white/50 border border-white/10 cursor-help hover:bg-white/10 hover:text-white transition-colors">
                    <MousePointerClick className="w-3 h-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs bg-zinc-900/90 backdrop-blur-md border-white/10 text-white rounded-xl py-1.5 px-3">
                  <p>Click any profile for details</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex-1 flex flex-col gap-2.5 z-10">
              {topCheckIns.map((person, i) => (
                <div 
                  key={person.employeeId} 
                  onClick={() => openDetails(person)}
                  className={`relative flex items-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 cursor-pointer group/card ${getRankStyle(i, true)}`}
                >
                  {/* 1st Place Congrat Asset */}
                  {i === 0 && (
                    <Image src="/congrat.png" alt="Congrats" width={40} height={40} className="absolute -top-3 -left-3 w-10 h-auto z-10 drop-shadow-md -rotate-12 hover:rotate-0 transition-transform duration-300" />
                  )}

                  {/* Rank Number/Icon Indicator (Left) */}
                  <div className="w-8 flex justify-center items-center mr-1.5 z-10">
                    {i === 0 ? (
                      <span className="text-2xl font-black italic text-transparent bg-clip-text bg-linear-to-b from-amber-200 to-amber-500 drop-shadow-md">1</span>
                    ) : i === 1 ? (
                      <span className="text-xl font-black italic text-transparent bg-clip-text bg-linear-to-b from-zinc-300 to-zinc-500">2</span>
                    ) : (
                      <span className="text-xl font-black italic text-transparent bg-clip-text bg-linear-to-b from-amber-700 to-amber-900">3</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-1 z-10">
                    <div className="relative">
                      <AvatarInfoTooltip
                        fullName={person.fullName}
                        pictureURL={person.pictureMediumURL || person.pictureURL}
                        avatarClassName={`border-2 shadow-xl ${i === 0 ? 'w-11 h-11 border-amber-400/50' : 'w-9 h-9 border-white/10'}`}
                        fallbackClassName="text-[10px] font-medium"
                      />
                      {i === 0 && (
                        <div className="absolute -bottom-1.5 -right-1.5 bg-amber-500 p-0.5 rounded-full border border-background shadow-lg">
                          <Trophy className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className={`font-bold truncate ${i === 0 ? 'text-sm text-amber-50' : 'text-xs text-foreground'}`}>
                        {person.fullName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${i === 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {person.avgPercent.toFixed(1)}% Avg
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Indicator (Right) */}
                  <div className="flex flex-col items-end justify-center ml-2 pl-3 border-l border-white/10 z-10">
                    <span className={`text-[8px] uppercase tracking-widest font-bold mb-0.5 ${i === 0 ? 'text-amber-500/70' : 'text-muted-foreground'}`}>Check-ins</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-xl font-black leading-none ${i === 0 ? 'text-amber-400' : 'text-foreground'}`}>{person.totalCheckIn}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">/{person.totalCheckInAll}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Missed Leaderboard */}
        <div className="relative flex flex-col h-full mt-6 lg:mt-0">
          
          <div className="group bg-background/40 backdrop-blur-2xl border border-white/5 dark:border-white/10 rounded-[24px] p-4 sm:p-5 shadow-2xl flex flex-col h-full relative overflow-hidden transition-all duration-300">
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-rose-500/20 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-5 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-500 blur-md opacity-20 rounded-full"></div>
                  <div className="p-2.5 bg-linear-to-br from-rose-500/20 to-rose-500/5 rounded-xl border border-rose-500/30 shadow-inner relative">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/70 tracking-tight">Top 3 Missed</h3>
                  <p className="text-[10px] text-rose-400/80 mt-0.5 font-medium uppercase tracking-widest">Needs Attention</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-white/50 border border-white/10 cursor-help hover:bg-white/10 hover:text-white transition-colors">
                    <MousePointerClick className="w-3 h-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs bg-zinc-900/90 backdrop-blur-md border-white/10 text-white rounded-xl py-1.5 px-3">
                  <p>Click any profile for details</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex-1 flex flex-col gap-2.5 z-10">
              {mostMissedCheckIns.map((person, i) => (
                <div 
                  key={person.employeeId} 
                  onClick={() => openDetails(person)}
                  className={`relative flex items-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 cursor-pointer group/card ${getRankStyle(i, false)}`}
                >
                  {/* Rank Number/Icon Indicator (Left) */}
                  <div className="w-8 flex justify-center items-center mr-1.5">
                    <span className={`text-2xl font-black italic drop-shadow-md ${i === 0 ? 'text-rose-500' : i === 1 ? 'text-rose-400/70' : 'text-rose-300/50'}`}>
                      {i + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <AvatarInfoTooltip
                        fullName={person.fullName}
                        pictureURL={person.pictureMediumURL || person.pictureURL}
                        avatarClassName={`border-2 shadow-xl grayscale-[0.5] ${i === 0 ? 'w-11 h-11 border-rose-500/50' : 'w-9 h-9 border-white/10'}`}
                        fallbackClassName="text-[10px] font-medium"
                      />
                      {i === 0 && (
                        <div className="absolute -bottom-1.5 -right-1.5 bg-rose-500 p-0.5 rounded-full border border-background shadow-lg">
                          <AlertCircle className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className={`font-bold truncate ${i === 0 ? 'text-sm text-rose-50' : 'text-xs text-foreground'}`}>
                        {person.fullName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${i === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-500/10 text-rose-400/80'}`}>
                          {person.avgPercent.toFixed(1)}% Avg
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Indicator (Right) */}
                  <div className="flex flex-col items-end justify-center ml-2 pl-3 border-l border-white/10">
                    <span className={`text-[8px] uppercase tracking-widest font-bold mb-0.5 ${i === 0 ? 'text-rose-500/70' : 'text-muted-foreground'}`}>Missed</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-xl font-black leading-none ${i === 0 ? 'text-rose-500' : 'text-foreground'}`}>{person.totalMissCheckIn}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">/{person.totalMissCheckInAll}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty State using mark-as-complete */}
              {mostMissedCheckIns.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-6 relative z-10">
                  <Image src="/mark-as-complete.png" alt="Perfect Execution" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 mb-3 drop-shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:scale-110 transition-transform duration-500" />
                  <p className="text-sm font-bold text-emerald-400 tracking-tight">Perfect Execution</p>
                  <p className="text-[10px] mt-1 text-center max-w-[180px] text-muted-foreground leading-relaxed">Everyone is keeping up with their OKR check-ins.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Fix: Added explicit close functionality, hide default close button styling if it exists, use smaller padding and Apple-like styling */}
        <DialogContent className="sm:max-w-[300px] bg-background/80 backdrop-blur-3xl border-white/10 p-0 overflow-hidden rounded-[28px] shadow-2xl [&>button]:hidden">
          <DialogTitle className="sr-only">Participant Details</DialogTitle>
          
          {selectedPerson && (
            <div className="relative">
              {/* Asset inside dialog */}
              <Image src="/goal-graphic.png" alt="Goal" width={48} height={48} className="absolute top-3 left-3 w-12 h-auto z-50 opacity-90 drop-shadow-lg" />

              {/* Custom Close Button */}
              <button 
                onClick={closeDialog}
                className="absolute top-3 right-3 z-50 p-1.5 bg-black/20 hover:bg-black/40 dark:bg-black/40 dark:hover:bg-black/60 rounded-full backdrop-blur-md transition-all border border-white/10 text-white shadow-lg cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Header Banner */}
              <div className="relative h-20 w-full overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-background z-10" />
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay z-0 scale-110 blur-md" 
                  style={{ backgroundImage: `url(${selectedPerson.pictureOriginalURL || selectedPerson.pictureMediumURL})` }}
                />
              </div>

              <div className="px-4 pb-5 pt-0 relative z-20">
                {/* Profile Section */}
                <div className="flex flex-col items-center -mt-8 mb-4">
                  <div className="p-1 bg-background/50 backdrop-blur-xl rounded-full shadow-xl mb-2 border border-white/10">
                    <Avatar className="w-16 h-16 border-2 border-background shadow-inner">
                      <AvatarImage src={selectedPerson.pictureOriginalURL || selectedPerson.pictureMediumURL} alt={selectedPerson.fullName} className="object-cover" />
                      <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">{selectedPerson.fullName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <h2 className="text-sm font-semibold text-foreground text-center tracking-tight leading-tight">{selectedPerson.fullName}</h2>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5 text-center">{selectedPerson.fullName_EN}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm backdrop-blur-md transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Check-ins</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-foreground tracking-tight">{selectedPerson.totalCheckIn}</span>
                      <span className="text-[9px] font-medium text-muted-foreground">/ {selectedPerson.totalCheckInAll}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm backdrop-blur-md transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-1 mb-1">
                      <XCircle className="w-3 h-3 text-rose-500" />
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Missed</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-foreground tracking-tight">{selectedPerson.totalMissCheckIn}</span>
                      <span className="text-[9px] font-medium text-muted-foreground">/ {selectedPerson.totalMissCheckInAll}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Chart Section */}
                <div className="bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-inner backdrop-blur-md">
                  <div className="w-14 h-14 shrink-0 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                       <span className="text-xs font-bold tracking-tight" style={{ color: chartData[0]?.fill }}>
                        {selectedPerson.avgPercent.toFixed(0)}%
                      </span>
                    </div>
                    <ChartContainer
                      config={{
                        progress: {
                          label: "Avg Progress",
                          color: selectedPerson.avgPercent >= 75 ? "hsl(var(--chart-2))" : 
                                 selectedPerson.avgPercent >= 50 ? "hsl(var(--chart-4))" : 
                                 "hsl(var(--chart-1))",
                        },
                      }}
                      className="mx-auto aspect-square w-full h-full"
                    >
                      <RadialBarChart
                        data={chartData}
                        startAngle={90}
                        endAngle={-270}
                        innerRadius="75%"
                        outerRadius="100%"
                        barSize={4}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        <RadialBar
                          dataKey="value"
                          cornerRadius={10}
                          background={{ fill: "var(--color-border)", opacity: 0.3 }}
                        />
                      </RadialBarChart>
                    </ChartContainer>
                  </div>
                  
                  <div className="text-left flex-1">
                    <h4 className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Avg Progress</h4>
                    <p className="text-[10px] text-foreground/90 leading-snug font-medium">
                      {selectedPerson.avgPercent >= 80 ? "Outstanding performance." :
                       selectedPerson.avgPercent >= 50 ? "Steady progress." :
                       "Needs attention."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
