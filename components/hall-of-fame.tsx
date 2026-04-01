"use client";

import { mockHallOfFame } from "@/lib/mock/hall-of-fame";
import { IconTrophy, IconCrown } from "@/components/icons";
import { useState, Fragment } from "react";
import Image from "next/image";

interface HallOfFameProps {
  teamFilter?: string;
}

const TEAM_COLORS: Record<string, string> = {
  Spartan: "#dc2626",
  Pegasus: "#3b82f6",
  Unicorn: "#a855f7",
  "Product Owner": "#f59e0b",
};

const trendIcon: Record<string, { label: string; color: string }> = {
  rising: { label: "▲", color: "text-emerald-400" },
  stable: { label: "—", color: "text-amber-400" },
  declining: { label: "▼", color: "text-red-400" },
};

const RANK_CONFIG = [
  { accent: "text-amber-400", bg: "from-amber-500/12", border: "border-amber-500/30", glow: "shadow-amber-500/15", ring: "ring-amber-500/40" },
  { accent: "text-zinc-300", bg: "from-zinc-400/8", border: "border-zinc-400/20", glow: "shadow-zinc-400/10", ring: "ring-zinc-400/30" },
  { accent: "text-orange-400", bg: "from-orange-500/8", border: "border-orange-500/20", glow: "shadow-orange-500/10", ring: "ring-orange-400/30" },
];

function PlaceBadge({ place, size = "sm" }: { place: number; size?: "sm" | "lg" }) {
  const lg = size === "lg";
  if (place === 1)
    return (
      <div className={`${lg ? "w-10 h-10" : "w-7 h-7"} rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30`}>
        <IconCrown size={lg ? 20 : 14} className="text-black" />
      </div>
    );
  if (place === 2)
    return (
      <div className={`${lg ? "w-10 h-10" : "w-7 h-7"} rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 flex items-center justify-center shadow-lg shadow-zinc-400/20`}>
        <span className={`${lg ? "text-sm" : "text-[10px]"} font-black text-black`}>2</span>
      </div>
    );
  if (place === 3)
    return (
      <div className={`${lg ? "w-10 h-10" : "w-7 h-7"} rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-700/20`}>
        <span className={`${lg ? "text-sm" : "text-[10px]"} font-black text-amber-100`}>3</span>
      </div>
    );
  return (
    <div className={`${lg ? "w-10 h-10" : "w-7 h-7"} rounded-full bg-secondary flex items-center justify-center border border-border/50`}>
      <span className={`${lg ? "text-sm" : "text-[10px]"} font-bold text-muted-foreground`}>#{place}</span>
    </div>
  );
}

function ScoreBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-16 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function HallOfFame({ teamFilter = "overall" }: HallOfFameProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const entries =
    teamFilter === "overall"
      ? mockHallOfFame
      : mockHallOfFame.filter((e) => e.teamName.toLowerCase().replace(" ", "-") === teamFilter);

  const podium = entries.slice(0, 3);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <IconTrophy size={16} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Hall of Fame</h2>
          <p className="text-xs text-muted-foreground">Weighted composite score — KR difficulty, progress, check-ins, consistency</p>
        </div>
      </div>

      {/* Podium — Top 3 Editorial Portrait Cards */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-4 lg:gap-5 max-w-4xl mx-auto mb-10 px-4">
        {[1, 0, 2].map((origIndex) => {
          const e = podium[origIndex];
          if (!e) return <div key={origIndex} />;
          const isFirst = e.place === 1;
          const config = RANK_CONFIG[origIndex];
          const teamColor = TEAM_COLORS[e.teamName] || "#8b5cf6";

          return (
            <div
              key={e.employeeId}
              className={`group relative flex flex-col w-full md:w-1/3 ${
                isFirst ? "order-1 md:order-2 md:-translate-y-6 z-10" :
                origIndex === 1 ? "order-2 md:order-1" :
                "order-3 md:order-3"
              }`}
            >
              <div className={`relative overflow-hidden rounded-2xl border ${config.border} bg-gradient-to-b ${config.bg} to-card/60 transition-all duration-500 hover:border-opacity-60 ${isFirst ? "shadow-xl" : "shadow-lg"} ${config.glow}`}>
                {/* Portrait Photo */}
                <div className={`relative w-full ${isFirst ? "aspect-3/4" : "aspect-4/5"} overflow-hidden`} style={{ backgroundColor: `${teamColor}15` }}>
                  {e.pictureURL ? (
                    <Image
                      src={e.pictureURL}
                      alt={e.fullName_EN}
                      fill
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-light" style={{ color: `${teamColor}60` }}>{e.fullName_EN.charAt(0)}</span>
                    </div>
                  )}

                  {/* Cinematic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Rank pill — top left */}
                  <div className="absolute top-3 left-3">
                    <PlaceBadge place={e.place} size="lg" />
                  </div>

                  {/* Team badge — top right */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ backgroundColor: `${teamColor}30`, color: teamColor, border: `1px solid ${teamColor}40` }}>
                    {e.teamName}
                  </div>

                  {/* Name overlay — bottom of photo */}
                  <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                    <h4 className={`${isFirst ? "text-xl" : "text-lg"} font-bold text-white tracking-tight leading-tight drop-shadow-sm`}>
                      {e.fullName}
                    </h4>
                    <div className="text-[11px] text-white/60 mt-0.5">{e.fullName_EN}</div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Score</span>
                    <span className={`text-lg font-black tabular-nums ${config.accent}`}>{e.compositeScore.toFixed(1)}</span>
                  </div>
                  <div className="w-px h-8 bg-border/30" />
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-bold tabular-nums text-foreground">{e.avgPercent}%</span>
                  </div>
                  <div className="w-px h-8 bg-border/30" />
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Streak</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${trendIcon[e.trend].color}`}>{trendIcon[e.trend].label}</span>
                      <span className="text-sm font-bold tabular-nums text-foreground">{e.streakWeeks}w</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-xl border border-border/30 bg-card/30 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/20">
              <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">#</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Warrior</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-widest hidden md:table-cell">Team</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-widest">Score</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-widest hidden sm:table-cell">Avg%</th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-widest hidden sm:table-cell">Check-ins</th>
              <th className="text-center py-2.5 px-3 text-muted-foreground font-semibold text-[10px] uppercase tracking-widest hidden lg:table-cell">Trend</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const expanded = expandedId === e.employeeId;
              const teamColor = TEAM_COLORS[e.teamName] || "#8b5cf6";
              return (
                <Fragment key={e.employeeId}>
                  <tr
                    className="border-b border-border/10 hover:bg-secondary/30 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expanded ? null : e.employeeId)}
                  >
                    <td className="py-2 px-3"><PlaceBadge place={e.place} /></td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: `${teamColor}40` }}>
                          {e.pictureURL ? (
                            <Image src={e.pictureURL} alt={e.fullName_EN} width={32} height={32} className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${teamColor}20`, color: teamColor }}>{e.fullName_EN.charAt(0)}</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{e.fullName}</div>
                          <div className="text-[10px] text-muted-foreground">{e.fullName_EN}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
                        <span>{e.teamName}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">{e.compositeScore.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right tabular-nums hidden sm:table-cell">{e.avgPercent}%</td>
                    <td className="py-2 px-3 text-right tabular-nums hidden sm:table-cell">{e.totalCheckIn}</td>
                    <td className="py-2 px-3 text-center hidden lg:table-cell">
                      <span className={trendIcon[e.trend].color}>{trendIcon[e.trend].label}</span>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="bg-secondary/10">
                      <td colSpan={7} className="p-4">
                        <div className="max-w-md space-y-2">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Score Breakdown</div>
                          <ScoreBar label="KR Difficulty" value={e.weights.krDifficulty} color="#ef4444" />
                          <ScoreBar label="Progress" value={e.weights.progressScore} color="#f59e0b" />
                          <ScoreBar label="Check-ins" value={e.weights.checkInScore} color="#3b82f6" />
                          <ScoreBar label="Consistency" value={e.weights.consistencyScore} color="#a855f7" />
                          <div className="pt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                            <span>{e.streakWeeks} week streak</span>
                            <span className={trendIcon[e.trend].color}>{e.trend}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
