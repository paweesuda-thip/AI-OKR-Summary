"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Objective, KrDetail } from "@/lib/types/okr";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

const statusConfig: Record<string, { color: string; fill: string; stroke: string; glow: string }> = {
  "On Track": { color: "text-emerald-400", fill: "#34D399", stroke: "#059669", glow: "shadow-[2px_0_10px_rgba(52,211,153,0.3)]" },
  "At Risk": { color: "text-[#F7931A]", fill: "#F7931A", stroke: "#EA580C", glow: "shadow-[2px_0_10px_rgba(247,147,26,0.3)]" },
  "Behind": { color: "text-red-500", fill: "#EF4444", stroke: "#B91C1C", glow: "shadow-[2px_0_10px_rgba(239,68,68,0.3)]" },
  "Complete": { color: "text-[#FFD600]", fill: "#FFD600", stroke: "#CA8A04", glow: "shadow-[2px_0_10px_rgba(255,214,0,0.3)]" },
};

type FilterOption = "all" | "On Track" | "At Risk" | "Behind";
type ViewMode = "matrix" | "chart";

interface ContributionMatrixProps {
  objectives: Objective[];
}

export default function ContributionMatrix({ objectives }: ContributionMatrixProps) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredObjectives = useMemo(() => {
    let filtered = (objectives || []).filter(o => {
      if (filter === "all") return true;
      return o.status === filter;
    });
    return filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
  }, [objectives, filter]);

  const chartData = useMemo(() => {
    return filteredObjectives.map((obj, i) => ({
      name: `OBJ-${i + 1}`,
      realName: obj.objectiveName,
      progress: obj.progress || 0,
      krs: obj.details?.length || 0,
      status: obj.status,
      color: statusConfig[obj.status]?.fill || statusConfig["On Track"].fill,
    }));
  }, [filteredObjectives]);

  return (
    <div className="w-full relative z-10 bg-[#030304] border-x border-t border-white/5 p-4 md:p-8 overflow-hidden rounded-t-[1rem]">
      {/* Sharp grid background replacing muddy overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,214,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,214,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-20">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="w-1.5 h-1.5 bg-[#FFD600] rounded-sm" />
             <p className="text-[10px] font-mono font-bold text-[#FFD600] tracking-[0.3em] uppercase">
               SYSTEM MATRIX
             </p>
           </div>
           <h3 className="font-heading text-3xl font-bold text-white tracking-tight leading-none uppercase">
             Contribution Tree
           </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {/* Filters */}
           <div className="flex items-center gap-1 p-1 bg-[#0F1115] rounded border border-white/10">
            {(["all", "On Track", "At Risk", "Behind"] as FilterOption[]).map(f => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[9px] font-mono font-bold px-3 py-1.5 rounded-sm transition-all tracking-widest uppercase ${
                    isActive 
                      ? "bg-white/10 text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
                      : "text-[#475569] hover:text-white border border-transparent"
                  }`}
                >
                  {f}
                </button>
              )
            })}
           </div>

           {/* View Toggle */}
           <div className="flex items-center bg-[#0F1115] p-1 rounded border border-white/10">
              <button onClick={() => setViewMode("matrix")} className={`px-4 py-1.5 text-[9px] font-mono tracking-widest uppercase font-bold rounded-sm transition-colors ${viewMode === "matrix" ? "bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30 shadow-[0_0_10px_rgba(255,214,0,0.2)]" : "text-[#475569] hover:text-white"}`}>GRID</button>
              <button onClick={() => setViewMode("chart")} className={`px-4 py-1.5 text-[9px] font-mono tracking-widest uppercase font-bold rounded-sm transition-colors ${viewMode === "chart" ? "bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30 shadow-[0_0_10px_rgba(255,214,0,0.2)]" : "text-[#475569] hover:text-white"}`}>CHART</button>
           </div>
        </div>
      </div>

      {viewMode === "chart" && chartData.length > 0 && (
        <div className="w-full h-[240px] relative z-20 animate-fade-in bg-[#0F1115] border border-white/5 p-4 rounded shadow-[4px_4px_0_rgba(255,255,255,0.05)]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD600" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F7931A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} domain={[0, 100]} dx={-10} />
              <YAxis yAxisId="right" orientation="right" hide />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0F1115] p-3 rounded-sm border-l-2 border-[#FFD600] border-y border-r border-y-white/10 border-r-white/10 shadow-[4px_4px_0_rgba(0,0,0,1)]">
                        <p className="font-heading font-black text-white mb-2 max-w-[200px] truncate uppercase">{data.realName}</p>
                        <div className="flex justify-between items-center bg-[#030304] px-2 py-1 border border-white/5 gap-4">
                           <span className="font-mono text-[9px] text-[#475569] font-bold uppercase">PROG</span>
                           <span className="font-mono text-xs font-bold text-[#FFD600]">{data.progress}%</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#030304] px-2 py-1 border border-white/5 mt-1 gap-4">
                           <span className="font-mono text-[9px] text-[#475569] font-bold uppercase">KRS</span>
                           <span className="font-mono text-xs font-bold text-white">{data.krs}</span>
                        </div>
                      </div>
                    )
                  }
                  return null;
                }}
              />
              <Area yAxisId="left" type="stepAfter" dataKey="progress" stroke="#FFD600" strokeWidth={2} fill="url(#areaProgress)" animationDuration={1000} />
              <Bar yAxisId="right" dataKey="krs" barSize={2} fill="#F7931A" opacity={0.6} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === "matrix" && (
        <div className="space-y-3 relative z-20 animate-fade-in">
          {filteredObjectives.map((obj, i) => {
            const status = statusConfig[obj.status] || statusConfig["On Track"];
            const isExpanded = expandedId === obj.objectiveId;
            const details = obj.details || [];
            const uniqueContributors = [...new Map(details.map(d => [d.fullName, d])).values()].slice(0, 5);

            return (
              <div 
                key={obj.objectiveId} 
                className={`bg-[#0F1115] border ${isExpanded ? 'border-white/30 shadow-[4px_4px_0px_rgba(255,255,255,0.05)]' : 'border-white/5 hover:border-white/20 hover:bg-[#1A1D24]/50 hover:-translate-y-px'} rounded-sm transition-all duration-300 overflow-hidden flex flex-col group`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : obj.objectiveId)}
                  className="w-full flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 text-left relative overflow-hidden"
                >
                  {/* Status glint on hover */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${status.glow}`} style={{ backgroundColor: status.fill }} />
                  {isExpanded && <div className={`absolute left-0 top-0 bottom-0 w-1`} style={{ backgroundColor: status.fill }} />}
                  
                  {/* Ident section */}
                  <div className="flex-1 min-w-0 md:pl-2 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] font-bold text-[#475569] tracking-widest uppercase bg-black px-1.5 py-0.5 border border-white/5">O-{i + 1}</span>
                      <h4 className="text-sm font-heading font-bold text-white uppercase tracking-tight group-hover:text-white truncate">
                        {obj.objectiveName}
                      </h4>
                    </div>
                    {obj.ownerTeam && <span className="font-mono text-[9px] font-bold text-[#475569] tracking-widest uppercase ml-[42px]">{obj.ownerTeam}</span>}
                  </div>

                  {/* Grid Avatars (monochrome unless hovered) */}
                  <div className="flex items-center -space-x-1 shrink-0 border border-white/10 p-1 bg-[#030304]">
                    {uniqueContributors.map((d: KrDetail, cIdx: number) => (
                      <div key={cIdx} className="w-5 h-5 rounded-sm overflow-hidden border border-[#030304] bg-[#1A1D24] grayscale group-hover:grayscale-0 transition-all duration-300">
                        {d.pictureURL ? (
                          <Image src={d.pictureURL} alt={d.fullName} width={20} height={20} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-heading font-bold text-white/30 uppercase">{d.fullName?.charAt(0)}</div>
                        )}
                      </div>
                    ))}
                    {details.length > 5 && (
                      <div className="w-5 h-5 rounded-sm bg-[#0F1115] border border-white/10 flex items-center justify-center">
                        <span className="text-[7px] font-mono font-bold text-[#475569]">+{details.length - 5}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Visual */}
                  <div className="flex items-center gap-3 shrink-0 w-[160px] md:w-[180px] pr-2">
                    <div className="flex-1 h-1 bg-[#030304] overflow-hidden border border-white/5">
                       <div 
                         className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                         style={{ width: `${Math.min(obj.progress || 0, 100)}%`, backgroundColor: status.fill }}
                       />
                    </div>
                    <span className={`font-mono text-sm font-black tabular-nums w-10 text-right`} style={{ color: status.fill }}>
                       {Math.floor(obj.progress || 0)}%
                    </span>
                  </div>
                </button>

                {/* Expanded Details Matrix */}
                {isExpanded && details.length > 0 && (
                  <div className="bg-[#030304]/80 border-t border-white/5 p-4 md:p-5 mx-1 mb-1 rounded-sm gap-4 flex flex-col">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#FFD600] rounded-sm animate-pulse" />
                        <span className="text-[9px] font-mono font-bold text-[#FFD600] tracking-widest uppercase">
                          KR DATA GRID
                        </span>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                       {details.map((kr: KrDetail, krIdx: number) => (
                         <div key={krIdx} className="bg-[#0F1115] border border-white/10 p-3 flex items-center gap-3 hover:border-white/30 transition-colors group/kr relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover/kr:opacity-100 transition-opacity bg-white/30`} />
                            
                            <div className="w-6 h-6 shrink-0 bg-[#030304] flex items-center justify-center border border-white/5 font-mono text-[9px] font-bold text-[#475569]">
                              K{krIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-heading font-bold text-xs text-white/90 truncate block uppercase tracking-tight">{kr.krTitle}</span>
                              <span className="font-mono text-[8px] font-bold text-[#475569] tracking-widest uppercase block mt-0.5 truncate">{kr.fullName}</span>
                            </div>
                            <div className="flex flex-col items-end shrink-0 w-12 border-l border-white/5 pl-3">
                               <span className={`font-mono text-xs font-black ${kr.isDone ? 'text-emerald-400' : 'text-white'}`}>{kr.krProgress}%</span>
                               <span className="font-mono text-[8px] font-bold text-[#475569] uppercase mt-0.5">{kr.pointCurrent}/{kr.pointOKR} PTS</span>
                            </div>
                         </div>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {filteredObjectives.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/10 mt-4 rounded-sm">
          <p className="font-mono text-xs font-bold text-[#475569] uppercase tracking-widest">No Objectives Matched Matrix Filter</p>
        </div>
      )}
    </div>
  );
}
