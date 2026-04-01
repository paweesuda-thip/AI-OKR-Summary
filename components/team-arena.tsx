"use client";

import { TeamFilterMode, TeamComparisonData } from "@/lib/types/okr";
import { mockTeamComparisons } from "@/lib/mock/teams";
import { IconUsers } from "@/components/icons";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import { useState } from "react";

interface TeamArenaProps {
  teamFilter: TeamFilterMode;
}

const TEAM_COLORS: Record<string, string> = {
  spartan: "#dc2626",
  pegasus: "#3b82f6",
  unicorn: "#a855f7",
  "product-owner": "#f59e0b",
};

function radarData(teams: TeamComparisonData[]) {
  const axes = [
    { key: "avgProgress", label: "Progress" },
    { key: "krCompletionRate", label: "KR Done" },
    { key: "checkInRate", label: "Check-in" },
    { key: "consistencyScore", label: "Consistency" },
    { key: "onTrackPercent", label: "On Track" },
  ] as const;

  return axes.map((a) => {
    const row: Record<string, string | number> = { axis: a.label };
    teams.forEach((t) => {
      row[t.teamId] = t[a.key];
    });
    return row;
  });
}

function barData(teams: TeamComparisonData[]) {
  return teams.map((t) => ({
    name: t.teamName,
    progress: t.avgProgress,
    krDone: t.krCompletionRate,
    checkIn: t.checkInRate,
    teamId: t.teamId,
  }));
}

export default function TeamArena({ teamFilter }: TeamArenaProps) {
  const [chartType, setChartType] = useState<"radar" | "bar">("radar");
  const teams = teamFilter === "overall"
    ? mockTeamComparisons
    : mockTeamComparisons.filter((t) => t.teamId === teamFilter);

  const singleTeam = teamFilter !== "overall" ? teams[0] : null;

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <IconUsers size={16} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Team Arena</h2>
            <p className="text-xs text-muted-foreground">
              {teamFilter === "overall" ? "All teams comparison" : `${singleTeam?.teamName} detail`}
            </p>
          </div>
        </div>
        <div className="flex gap-1 p-0.5 rounded-md bg-secondary/50 border border-border/30">
          <button onClick={() => setChartType("radar")} className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-all ${chartType === "radar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Radar</button>
          <button onClick={() => setChartType("bar")} className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-all ${chartType === "bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Bar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-border/30 bg-card/40 min-h-[320px]">
          {teamFilter === "overall" || chartType === "radar" ? (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "radar" ? (
                <RadarChart data={radarData(teamFilter === "overall" ? mockTeamComparisons : [teams[0] || mockTeamComparisons[0]])}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  {(teamFilter === "overall" ? mockTeamComparisons : [teams[0] || mockTeamComparisons[0]]).map((t) => (
                    <Radar key={t.teamId} name={t.teamName} dataKey={t.teamId} stroke={TEAM_COLORS[t.teamId]} fill={TEAM_COLORS[t.teamId]} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              ) : (
                <BarChart data={barData(teamFilter === "overall" ? mockTeamComparisons : teams)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="progress" name="Progress" radius={[4, 4, 0, 0]}>
                    {(teamFilter === "overall" ? mockTeamComparisons : teams).map((t) => (
                      <Cell key={t.teamId} fill={TEAM_COLORS[t.teamId]} />
                    ))}
                  </Bar>
                  <Bar dataKey="krDone" name="KR Done" radius={[4, 4, 0, 0]} fillOpacity={0.6}>
                    {(teamFilter === "overall" ? mockTeamComparisons : teams).map((t) => (
                      <Cell key={t.teamId} fill={TEAM_COLORS[t.teamId]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData(teams)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="progress" name="Progress" fill={TEAM_COLORS[teamFilter] || "#dc2626"} radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkIn" name="Check-in" fill={TEAM_COLORS[teamFilter] || "#dc2626"} fillOpacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Team Stats Cards */}
        <div className="flex flex-col gap-3">
          {(teamFilter === "overall" ? mockTeamComparisons : teams).map((t) => (
            <div key={t.teamId} className="p-3 rounded-lg border border-border/30 bg-card/40 hover:bg-card/60 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAM_COLORS[t.teamId] }} />
                <span className="text-sm font-semibold">{t.teamName}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{t.memberCount} members</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">Progress</span>
                  <div className="font-bold text-sm">{t.avgProgress}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">KR Done</span>
                  <div className="font-bold text-sm">{t.krCompletionRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Check-in</span>
                  <div className="font-bold text-sm">{t.checkInRate}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Consistency</span>
                  <div className="font-bold text-sm">{t.consistencyScore}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
