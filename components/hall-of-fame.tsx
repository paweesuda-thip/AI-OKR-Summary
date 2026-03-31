"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ParticipantDetailRaw } from "@/lib/types/okr";
import { generateHallOfFameEntries, WEIGHT_CONFIG, type HallOfFameEntry } from "@/lib/mock-data";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ZAxis,
  Cell
} from "recharts";

const FlameIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 23c-3.866 0-7-3.582-7-8 0-4.728 4.5-9.5 7-12 2.5 2.5 7 7.272 7 12 0 4.418-3.134 8-7 8zm0-17.196C10.168 8.333 7 12.104 7 15c0 2.757 2.243 6 5 6s5-3.243 5-6c0-2.896-3.168-6.667-5-9.196z" />
    <path d="M12 20c-1.657 0-3-1.567-3-3.5S10.5 12 12 10c1.5 2 3 4.933 3 6.5S13.657 20 12 20z" opacity="0.6" />
  </svg>
);

const CrownIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 19h20v2H2zM2 17l3.5-9L12 12l6.5-4L22 17H2zm3.7-1.5h12.6l-1.5-3.9L12 14.5l-4.8-2.9-1.5 3.9z" />
  </svg>
);

const paceGroupConfig: Record<string, { color: string; border: string; bg: string; label: string }> = {
  Elite: { color: "text-[#FFD600]", border: "border-[#FFD600]/30", bg: "bg-[#FFD600]/5", label: "ELITE PACE" },
  Strong: { color: "text-[#F7931A]", border: "border-[#F7931A]/30", bg: "bg-[#F7931A]/5", label: "STRONG PACE" },
  Growing: { color: "text-[#3B82F6]", border: "border-[#3B82F6]/30", bg: "bg-[#3B82F6]/5", label: "GROWING" },
  Building: { color: "text-[#94A3B8]", border: "border-white/10", bg: "bg-white/[0.02]", label: "BUILDING" },
};

const trendIcons: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

interface HallOfFameProps {
  participantDetails: ParticipantDetailRaw[];
}

export default function HallOfFame({ participantDetails }: HallOfFameProps) {
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");
  const entries = useMemo(() => {
    return generateHallOfFameEntries(
      participantDetails.map(p => ({
        employeeId: p.employeeId,
        fullName: p.fullName,
        pictureURL: p.pictureURL,
        pictureMediumURL: p.pictureMediumURL,
        avgPercent: p.avgPercent,
        totalCheckIn: p.totalCheckIn,
        totalCheckInAll: p.totalCheckInAll,
      }))
    );
  }, [participantDetails]);

  if (entries.length === 0) return null;

  const top3 = entries.slice(0, 3);
  const paceGroups = entries.reduce<Record<string, HallOfFameEntry[]>>((acc, entry) => {
    if (!acc[entry.paceGroup]) acc[entry.paceGroup] = [];
    acc[entry.paceGroup].push(entry);
    return acc;
  }, {});
  const podiumOrder = [1, 0, 2];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Structural Backdrop lines replacing mud blurs */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#FFD600]/20 to-transparent -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono font-bold text-[#FFD600] tracking-[0.3em] uppercase mb-1">
            HALL OF FAME
          </p>
          <h3 className="font-heading text-2xl font-bold text-white tracking-tight">
            Race Mode
          </h3>
          <p className="text-sm text-[#94A3B8] mt-1 font-mono uppercase tracking-widest text-[10px]">
             Telemetry Weight: Not Just Check-ins
          </p>
        </div>

        {/* Weight legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(WEIGHT_CONFIG).map(([key, weight]) => (
            <span
              key={key}
              className="text-[9px] font-mono text-[#475569] font-bold bg-[#0F1115] border border-white/10 rounded px-2 py-1 shadow-[2px_2px_0px_rgba(255,255,255,0.05)] uppercase"
            >
              {key}: {Math.round(weight * 100)}%
            </span>
          ))}
        </div>
      </div>

      {/* ── Podium — Top 3 ── */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-0 md:gap-4 lg:gap-5 max-w-4xl mx-auto">
        {podiumOrder.map((origIndex) => {
          const entry = top3[origIndex];
          if (!entry) return null;
          const isFirst = origIndex === 0;

          return (
            <div
              key={entry.employeeId}
              className={`group relative flex flex-col w-full md:w-1/3 mb-4 md:mb-0 transition-all duration-300 hover:-translate-y-2 ${
                isFirst ? "order-1 md:order-2 md:-translate-y-6 z-20" :
                origIndex === 1 ? "order-2 md:order-1 z-10" : "order-3 z-10"
              }`}
            >
              <div className={`relative overflow-hidden rounded-sm border transition-all duration-500 bg-[#0F1115] ${
                isFirst ? "border-[#FFD600]/60 shadow-[4px_4px_0_rgba(255,214,0,0.3)]" : "border-white/10 hover:border-white/30 hover:shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
              }`}>
                {/* Photo Strip */}
                <div className={`relative w-full ${isFirst ? "aspect-[3/4]" : "aspect-[4/5]"} overflow-hidden bg-[#0A0C10] border-b border-white/5`}>
                  {(entry.pictureMediumURL || entry.pictureURL) ? (
                    <Image
                      src={entry.pictureMediumURL || entry.pictureURL}
                      alt={entry.fullName}
                      fill
                      className="object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                      <span className="text-4xl font-heading font-black text-white/5 uppercase">{entry.fullName?.charAt(0)}</span>
                    </div>
                  )}

                  {/* Tech Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,0,0,0.25)_1px,transparent_1px)] bg-[size:100%_4px,4px_100%] opacity-20 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030304] via-[#030304]/60 to-transparent" />

                  {/* Rank badge */}
                  <div className={`absolute top-0 left-0 flex items-center gap-1.5 px-3 py-1.5 rounded-br-lg ${
                    origIndex === 0 ? "bg-[#FFD600] text-[#030304]" :
                    origIndex === 1 ? "bg-white/20 text-white backdrop-blur-md" :
                    "bg-[#F7931A] text-[#030304]"
                  }`}>
                    {origIndex === 0 && <CrownIcon className="text-[#030304] w-3 h-3" />}
                    <span className="text-[11px] font-mono font-black tracking-widest uppercase">
                      #{origIndex + 1}
                    </span>
                  </div>

                  {/* Name overlay */}
                  <div className="absolute inset-x-0 bottom-0 px-5 pb-5 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h4 className={`${isFirst ? "text-xl" : "text-lg"} font-heading font-black text-white uppercase tracking-tight leading-none mb-1 shadow-black drop-shadow-md`}>
                      {entry.fullName}
                    </h4>
                    <span className={`text-[9px] font-mono tracking-[0.2em] font-bold uppercase ${paceGroupConfig[entry.paceGroup]?.color || "text-[#94A3B8]"}`}>
                      {entry.paceGroup} NODE
                    </span>
                  </div>
                </div>

                {/* Cyber Stats row */}
                <div className="px-5 py-4 flex flex-wrap items-center justify-between bg-[#0F1115]">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono font-bold text-[#475569] tracking-widest uppercase">SCORE</span>
                    <span className="text-base font-mono font-black tabular-nums text-[#FFD600]">{entry.weightedScore}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono font-bold text-[#475569] tracking-widest uppercase">PROG</span>
                    <span className="text-base font-mono font-bold tabular-nums text-white">{entry.avgPercent.toFixed(0)}%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-mono font-bold text-[#475569] tracking-widest uppercase">STREAK</span>
                    <div className="flex items-center gap-1">
                      {entry.streak > 0 && <FlameIcon className="text-[#F7931A] w-3 h-3" />}
                      <span className="text-base font-mono font-bold tabular-nums text-[#F7931A]">{entry.streak}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Telemetry View Toggles ── */}
      <div className="pt-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-4 w-1 bg-gradient-to-b from-[#3B82F6] to-[#FFD600] rounded-none" />
          <h4 className="font-heading text-xl font-bold text-white tracking-tight uppercase">Group Performance</h4>
          <div className="h-px flex-1 bg-white/10" />
          
          <div className="inline-flex bg-[#0F1115] p-1 rounded border border-white/10 relative">
            <button onClick={() => setViewMode("list")} className={`relative z-10 px-4 py-1.5 text-[9px] font-mono font-bold tracking-widest uppercase transition-colors rounded ${viewMode === "list" ? "text-white bg-white/10 border border-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]" : "text-[#475569] hover:text-white"}`}>Grid</button>
            <button onClick={() => setViewMode("chart")} className={`relative z-10 px-4 py-1.5 text-[9px] font-mono font-bold tracking-widest uppercase transition-colors rounded ${viewMode === "chart" ? "text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "text-[#475569] hover:text-[#3B82F6]"}`}>Scatter</button>
          </div>
        </div>

        {/* Dynamic Display */}
        {viewMode === "chart" ? (
          <div className="w-full bg-[#030304] border border-white/10 p-4 md:p-6 shadow-[4px_4px_0_rgba(255,255,255,0.05)] animate-fade-in">
            <div className="w-full h-[250px] relative z-20">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="weightedScore" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis type="number" dataKey="avgPercent" domain={[0, 105]} tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} dx={-10} />
                  <ZAxis type="number" dataKey="consistencyRate" range={[40, 300]} name="Consistency" />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255, 255, 255, 0.2)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const config = paceGroupConfig[data.paceGroup] || paceGroupConfig.Building;
                        return (
                          <div className={`bg-[#0F1115] p-3 rounded-sm border-l-2 border-y border-r border-y-white/10 border-r-white/10 shadow-[4px_4px_0px_rgba(0,0,0,1)] min-w-[180px] ${config.border.replace('border-', 'border-l-')}`}>
                             <div className="flex items-center gap-3 mb-2">
                               <div className="w-6 h-6 rounded-sm bg-white/5 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                                 {data.pictureURL ? <Image src={data.pictureURL} width={24} height={24} alt="" className="object-cover" unoptimized/> : <span className="text-white text-[10px] font-bold">{data.fullName.charAt(0)}</span>}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="text-white font-heading font-bold text-sm leading-none truncate">{data.fullName}</p>
                                 <span className={`text-[8px] font-mono tracking-widest uppercase ${config.color}`}>{data.paceGroup}</span>
                               </div>
                             </div>
                             <div className="flex justify-between items-center bg-[#030304] px-2 py-1 border border-white/5">
                               <span className="font-mono text-[9px] text-[#475569] font-bold uppercase">SCORE</span>
                               <span className="font-mono text-xs font-bold text-[#FFD600]">{data.weightedScore}</span>
                             </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Runners" data={entries}>
                    {entries.map((entry, index) => {
                      let fillCol = "#94A3B8";
                      if (entry.paceGroup === "Elite") fillCol = "#FFD600";
                      if (entry.paceGroup === "Strong") fillCol = "#F7931A";
                      if (entry.paceGroup === "Growing") fillCol = "#3B82F6";
                      return <Cell key={`cell-${index}`} fill={fillCol} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {Object.entries(paceGroups).map(([groupName, members]) => {
              const config = paceGroupConfig[groupName] || paceGroupConfig.Building;

              return (
                <div key={groupName} className="bg-[#0F1115] border border-white/10 shadow-[2px_2px_0px_rgba(255,255,255,0.02)] flex flex-col">
                  {/* Group header */}
                  <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-black/40">
                    <span className={`text-[9px] font-mono font-black tracking-widest uppercase ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-[9px] font-mono text-[#475569] font-bold">
                      {members.length} MBRS
                    </span>
                  </div>

                  {/* Members */}
                  <div className="divide-y divide-white/[0.03] max-h-[300px] overflow-y-auto">
                    {members.map((entry, idx) => (
                      <div
                        key={entry.employeeId}
                        className="group px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.03] transition-colors cursor-default relative overflow-hidden"
                      >
                         <div className={`absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${config.bg.replace('bg-', 'bg-').replace('/5', '')}`} style={{ backgroundColor: config.color.replace('text-', '') }} />
                        {/* Rank */}
                        <span className="font-mono text-[10px] font-bold text-[#475569] w-4 text-right tabular-nums group-hover:text-white transition-colors">
                          {entries.indexOf(entry) + 1}
                        </span>

                        {/* Avatar */}
                        <div className="w-6 h-6 rounded-sm bg-[#1A1D24] border border-white/10 shrink-0 overflow-hidden mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-300">
                          {(entry.pictureMediumURL || entry.pictureURL) ? (
                            <Image
                              src={entry.pictureMediumURL || entry.pictureURL}
                              alt={entry.fullName}
                              width={24}
                              height={24}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-heading font-black text-white/30 uppercase">
                              {entry.fullName.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0 pr-2">
                           <span className="text-xs font-heading font-bold text-white/80 truncate block uppercase tracking-tight group-hover:text-white transition-colors">
                             {entry.fullName}
                           </span>
                           {entry.streak >= 3 && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <FlameIcon className="text-[#F7931A] w-2 h-2" />
                                <span className="text-[8px] font-mono font-bold text-[#F7931A]">{entry.streak}</span>
                              </div>
                           )}
                        </div>

                        {/* Stats mini */}
                        <div className="flex flex-col items-end shrink-0">
                           <span className="font-mono text-[11px] font-black tabular-nums text-white group-hover:text-[#FFD600] transition-colors leading-none">
                             {entry.weightedScore}
                           </span>
                           <span className={`text-[8px] font-mono font-bold mt-1 ${
                             entry.trend === "up" ? "text-emerald-400" :
                             entry.trend === "down" ? "text-red-400" : "text-[#475569]"
                           }`}>
                             {entry.trend.toUpperCase()}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
