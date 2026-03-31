"use client";

import { useState } from "react";
import { mockTeams, type TeamStats } from "@/lib/mock-data";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Line,
  ComposedChart
} from "recharts";

// SVG Icons from thesvg.org style
const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);
const StableIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const trendConfig = {
  up: { icon: TrendUpIcon, color: "text-emerald-400", label: "Trending Up" },
  down: { icon: TrendDownIcon, color: "text-red-400", label: "Trending Down" },
  stable: { icon: StableIcon, color: "text-[#94A3B8]", label: "Stable" },
};

const chartData = mockTeams.map(team => ({
  name: team.teamName,
  progress: team.avgProgress,
  checkIns: team.checkInRate,
  color: team.teamName === "Spartan" ? "#F7931A" : team.color,
  isSpartan: team.teamName === "Spartan"
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isSpartan = data.isSpartan;
    return (
      <div className={`bg-[#0F1115] p-4 rounded-md border ${isSpartan ? 'border-[#F7931A] shadow-[4px_4px_0px_rgba(247,147,26,0.3)]' : 'border-white/10'}`}>
        <p className="font-heading font-bold text-lg text-white mb-2">{label} {isSpartan && <span className="text-[#F7931A] text-[10px] ml-2 border border-[#F7931A]/30 px-1 rounded">NODE</span>}</p>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-4">
            <span className="font-mono text-xs text-[#94A3B8]">HASH POWER:</span>
            <span className="font-mono text-sm font-bold text-[#F7931A]">{data.progress}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-mono text-xs text-[#94A3B8]">SYNC RATE:</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{data.checkIns}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

type ViewMode = "data" | "chart";

export default function TeamComparison() {
  const [viewMode, setViewMode] = useState<ViewMode>("data");
  const maxProgress = Math.max(...mockTeams.map(t => t.avgProgress));

  return (
    <div className="w-full relative bg-[#030304] border border-white/5 rounded-none md:rounded-xl p-4 md:p-8 overflow-hidden z-10">
      {/* Cool Wireframe Background instead of blurry blob */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#F7931A] animate-pulse rounded-full" />
          <div>
            <h3 className="font-heading text-2xl font-bold text-white tracking-tight uppercase">
              Network Topology
            </h3>
            <p className="text-[10px] text-[#94A3B8] font-mono mt-1 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-emerald-400 bg-emerald-400/20" />
              Cross-Node Performance Link
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div className="inline-flex bg-[#0F1115] p-1 rounded border border-white/10 relative">
          <button
            onClick={() => setViewMode("data")}
            className={`relative z-10 px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors rounded ${
              viewMode === "data" ? "text-white bg-white/10 border border-white/5 shadow-[0_0_10px_rgba(255,255,255,0.1)]" : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Data List
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`relative z-10 px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors rounded ${
              viewMode === "chart" ? "text-[#F7931A] bg-[#F7931A]/10 border border-[#F7931A]/20 shadow-[0_0_10px_rgba(247,147,26,0.2)]" : "text-[#94A3B8] hover:text-[#F7931A]"
            }`}
          >
            Chart View
          </button>
        </div>
      </div>

      <div className="relative z-20 border-t border-white/5 pt-6">
        {viewMode === "chart" ? (
          /* Chart Layout (sleeker height, sharp tooltips) */
          <div className="w-full h-[250px] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpartan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F7931A" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }} dx={-10} />
                <YAxis yAxisId="right" orientation="right" hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar yAxisId="left" dataKey="progress" radius={[2, 2, 0, 0]} barSize={24} animationDuration={1000}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isSpartan ? "url(#colorSpartan)" : "url(#colorOther)"} 
                      stroke={entry.isSpartan ? "#F7931A" : "rgba(255,255,255,0.2)"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
                <Line yAxisId="right" type="stepAfter" dataKey="checkIns" stroke="#34D399" strokeWidth={2} dot={{ r: 3, fill: "#0F1115", stroke: "#34D399", strokeWidth: 1 }} activeDot={{ r: 5, fill: "#34D399" }} animationDuration={1500} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Restored and Enhanced Data List (Hover Gimmicks, Crisp Borders) */
          <div className="flex flex-col gap-3 animate-fade-in">
            {mockTeams.map((team: TeamStats) => {
              const isSpartan = team.teamName === "Spartan";
              const TrendIcon = trendConfig[team.trend].icon;
              const trendColor = trendConfig[team.trend].color;

              return (
                <div
                  key={team.teamName}
                  className={`group relative w-full p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-6 transition-all duration-300 bg-[#0F1115]/50 border rounded-sm overflow-hidden hover:pr-8 hover:pl-6 ${
                    isSpartan
                      ? "border-[#F7931A]/60 z-20 shadow-[4px_4px_0px_rgba(247,147,26,0.3)] bg-[#F7931A]/[0.02]"
                      : "border-white/5 hover:border-white/20 hover:bg-white/[0.02] hover:-translate-y-px z-10"
                  }`}
                >
                  {/* Glitch left border on hover */}
                  <div className={`absolute top-0 bottom-0 left-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isSpartan ? 'bg-[#FFD600]' : 'bg-white'}`} />

                  {/* Team Identity */}
                  <div className="flex items-center gap-4 md:w-[180px] shrink-0">
                    <div
                      className={`w-10 h-10 rounded-sm flex items-center justify-center font-heading font-black text-sm text-white border transition-colors ${
                        isSpartan ? 'border-[#F7931A] bg-[#F7931A]/20 shadow-[0_0_10px_rgba(247,147,26,0.3)]' : 'border-white/10 bg-[#1A1D24]'
                      }`}
                    >
                      {team.teamName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-heading font-bold text-base tracking-tight ${isSpartan ? "text-[#F7931A]" : "text-white"}`}>
                          {team.teamName}
                        </span>
                        {isSpartan && (
                          <span className="text-[8px] font-mono font-bold text-[#030304] bg-[#F7931A] px-1 py-0.5 uppercase">
                            Node
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#94A3B8] tracking-widest uppercase">
                        {team.memberCount} MBRS
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (The Ledger Stream) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${isSpartan ? 'text-[#F7931A]' : 'text-[#94A3B8]'}`}>
                        Hash Power
                      </span>
                      <span className="font-mono text-sm font-bold tabular-nums" style={{ color: isSpartan ? '#F7931A' : team.color }}>
                        {team.avgProgress}%
                      </span>
                    </div>
                    <div className={`h-1.5 w-full bg-[#1A1D24] rounded-none overflow-hidden border ${isSpartan ? 'border-[#F7931A]/20' : 'border-transparent'}`}>
                      <div
                        className="h-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_currentColor]"
                        style={{
                          width: `${(team.avgProgress / maxProgress) * 100}%`,
                          backgroundColor: isSpartan ? '#F7931A' : team.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Block */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 bg-black/40 px-5 py-2.5 rounded-sm border border-white/5 group-hover:bg-[#030304] transition-colors">
                    <div className="text-right flex flex-col items-center">
                      <span className="text-[8px] font-mono text-[#475569] tracking-[0.2em] uppercase block mb-1 font-bold">
                        SYNCS
                      </span>
                      <span className="font-mono text-sm font-bold text-white tabular-nums drop-shadow-sm">
                        {team.checkInRate}%
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/10 hidden sm:block" />
                    <div className="text-right flex flex-col items-center">
                      <span className="text-[8px] font-mono text-[#475569] tracking-[0.2em] uppercase block mb-1 font-bold">
                        MINED
                      </span>
                      <span className="font-mono text-sm font-bold text-white tabular-nums drop-shadow-sm">
                        {team.objectiveCompletion}%
                      </span>
                    </div>
                    <div className="w-px h-6 bg-white/10 hidden sm:block" />
                    <div className={`flex flex-col items-center justify-center min-w-[50px] ${trendColor}`}>
                      <TrendIcon />
                      <span className="text-[8px] font-mono font-bold tracking-widest uppercase mt-1 opacity-80">
                        {trendConfig[team.trend].label.split(' ')[1] || trendConfig[team.trend].label}
                      </span>
                    </div>
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
