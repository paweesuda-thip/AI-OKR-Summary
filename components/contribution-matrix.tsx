"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Objective, KrDetail } from "@/lib/types/okr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const statusConfig: Record<string, { color: string; fill: string; stroke: string; glow: string }> = {
  "On Track": { color: "text-emerald-400", fill: "#34D399", stroke: "#059669", glow: "shadow-[2px_0_10px_rgba(52,211,153,0.3)]" },
  "At Risk": { color: "text-[#F7931A]", fill: "#F7931A", stroke: "#EA580C", glow: "shadow-[2px_0_10px_rgba(247,147,26,0.3)]" },
  "Behind": { color: "text-red-500", fill: "#EF4444", stroke: "#B91C1C", glow: "shadow-[2px_0_10px_rgba(239,68,68,0.3)]" },
  "Complete": { color: "text-[#FFD600]", fill: "#FFD600", stroke: "#CA8A04", glow: "shadow-[2px_0_10px_rgba(255,214,0,0.3)]" },
};

type FilterOption = "all" | "On Track" | "At Risk" | "Behind";

interface ContributionMatrixProps {
  objectives: Objective[];
}

export default function ContributionMatrix({ objectives }: ContributionMatrixProps) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredObjectives = useMemo(() => {
    let filtered = (objectives || []).filter(o => {
      if (filter === "all") return true;
      return o.status === filter;
    });
    return filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
  }, [objectives, filter]);

  return (
    <div className="w-full relative z-10 bg-[#030304] border-x border-t border-white/5 p-4 md:p-8 overflow-hidden rounded-t-[1rem]">
      {/* Sharp grid background replacing muddy overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,214,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,214,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-20">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="w-1.5 h-1.5 bg-[#FFD600] rounded-sm animate-pulse" />
             <p className="text-[10px] font-mono font-bold text-[#FFD600] tracking-[0.3em] uppercase">
               SYSTEM MATRIX
             </p>
           </div>
           <h3 className="font-heading text-3xl font-bold text-white tracking-tight leading-none uppercase">
             Contribution Matrix
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
        </div>
      </div>

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
                    <h4 className="text-sm font-heading font-bold text-white uppercase tracking-tight group-hover:text-[#FFD600] truncate transition-colors">
                      {obj.objectiveName}
                    </h4>
                  </div>
                  {obj.ownerTeam && <span className="font-mono text-[9px] font-bold text-[#475569] tracking-widest uppercase ml-[42px]">{obj.ownerTeam}</span>}
                </div>

                {/* Grid Avatars (Removed grayscale completely) */}
                <div className="flex items-center -space-x-1 shrink-0 border border-white/10 p-1 bg-[#030304]">
                  {uniqueContributors.map((d: KrDetail, cIdx: number) => (
                    <div key={cIdx} className="relative group/tooltip w-6 h-6 rounded-sm overflow-hidden border border-[#030304] bg-[#1A1D24]">
                      {d.pictureURL ? (
                        <Image src={d.pictureURL} alt={d.fullName} width={24} height={24} className="object-cover w-full h-full" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-heading font-bold text-white/30 uppercase">{d.fullName?.charAt(0)}</div>
                      )}
                    </div>
                  ))}
                  {details.length > 5 && (
                    <div className="w-6 h-6 rounded-sm bg-[#0F1115] border border-white/10 flex items-center justify-center">
                      <span className="text-[7px] font-mono font-bold text-[#475569]">+{details.length - 5}</span>
                    </div>
                  )}
                </div>

                {/* Progress Visual */}
                <div className="flex items-center gap-3 shrink-0 w-[160px] md:w-[180px] pr-2">
                  <div className="flex-1 h-1.5 bg-[#030304] overflow-hidden border border-white/5">
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

              {/* Expanded Details Matrix & Sub-Objective Chart */}
              {isExpanded && details.length > 0 && (
                <div className="bg-[#030304]/80 border-t border-white/5 p-4 md:p-5 mx-1 mb-1 rounded-sm gap-6 flex flex-col">
                   <div className="flex flex-col md:flex-row gap-8">
                     
                     {/* Horizontal Bar Chart for Key Results (Sub-Objectives) */}
                     <div className="w-full md:w-1/2 flex flex-col pt-2">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 bg-[#F7931A] rounded-sm animate-pulse" />
                          <span className="text-[9px] font-mono font-bold text-[#F7931A] tracking-widest uppercase">
                            KEY RESULTS TELEMETRY
                          </span>
                        </div>
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={details} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.03)" />
                              <YAxis dataKey="krTitle" type="category" hide /> 
                              <XAxis type="number" domain={[0, 100]} hide />
                              <RechartsTooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload as KrDetail;
                                    return (
                                      <div className="bg-[#0F1115] p-3 rounded-sm border border-white/10 shadow-[4px_4px_0_rgba(0,0,0,1)] max-w-[200px]">
                                        <p className="font-heading font-bold text-white mb-2 text-sm leading-tight uppercase">{data.krTitle}</p>
                                        <div className="flex justify-between items-center bg-[#030304] px-2 py-1 mb-1 border border-white/5">
                                           <span className="font-mono text-[9px] text-[#475569] font-bold uppercase">OWNER</span>
                                           <span className="font-mono text-[9px] font-bold text-[#FFD600] truncate max-w-[80px]">{data.fullName}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#030304] px-2 py-1 border border-white/5">
                                           <span className="font-mono text-[9px] text-[#475569] font-bold uppercase">PROGRESS</span>
                                           <span className={`font-mono text-xs font-bold ${data.isDone ? 'text-emerald-400' : 'text-white'}`}>{data.krProgress}%</span>
                                        </div>
                                      </div>
                                    )
                                  }
                                  return null;
                                }}
                              />
                              <Bar dataKey="krProgress" barSize={12} radius={[0, 4, 4, 0]}>
                                {details.map((entry: KrDetail, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.isDone ? "#34D399" : "#F7931A"} opacity={0.8} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                     </div>
                     
                     {/* Detailed Roster List */}
                     <div className="w-full md:w-1/2 flex flex-col">
                       <div className="flex items-center gap-2 mb-4 pt-2">
                          <span className="text-[9px] font-mono font-bold text-[#475569] tracking-widest uppercase">
                            DETAIL GRID
                          </span>
                       </div>
                       <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-2">
                         {details.map((kr: KrDetail, krIdx: number) => (
                           <div key={krIdx} className="bg-[#0F1115] border border-white/5 p-2.5 flex items-center gap-3 hover:border-white/20 hover:bg-[#1A1D24] transition-colors group/kr relative overflow-hidden">
                              <div className={`absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover/kr:opacity-100 transition-opacity ${kr.isDone ? 'bg-emerald-400' : 'bg-[#F7931A]'}`} />
                              <div className="flex-1 min-w-0 pl-1">
                                <span className={`font-heading font-bold text-xs truncate block tracking-tight ${kr.isDone ? 'text-emerald-400' : 'text-white/90'}`}>
                                  {kr.krTitle}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                   <div className="w-4 h-4 rounded-sm overflow-hidden bg-[#030304] border border-white/10 shrink-0">
                                      {kr.pictureURL ? (
                                        <Image src={kr.pictureURL} alt="" width={16} height={16} className="object-cover" unoptimized/>
                                      ) : (
                                        <div className="text-[6px] text-white/50 flex justify-center items-center h-full font-bold">{kr.fullName.charAt(0)}</div>
                                      )}
                                   </div>
                                   <span className="font-mono text-[8px] font-bold text-[#475569] tracking-widest uppercase block truncate">{kr.fullName}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0 w-12 border-l border-white/5 pl-2">
                                 <span className={`font-mono text-xs font-black ${kr.isDone ? 'text-emerald-400' : 'text-white'}`}>{kr.krProgress}%</span>
                                 <span className="font-mono text-[8px] font-bold text-[#475569] uppercase mt-0.5">{kr.pointCurrent}/{kr.pointOKR} PT</span>
                              </div>
                           </div>
                         ))}
                       </div>
                     </div>

                   </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredObjectives.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/10 mt-4 rounded-sm">
          <p className="font-mono text-xs font-bold text-[#475569] uppercase tracking-widest">No Objectives Matched Matrix Filter</p>
        </div>
      )}
    </div>
  );
}
