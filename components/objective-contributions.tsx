"use client";

import { Objective } from "@/lib/types/okr";
import { IconFlag } from "@/components/icons";
import { useState } from "react";

interface ObjectiveContributionsProps {
  objectives: Objective[];
}

function statusColor(status: string) {
  if (status === "On Track") return "bg-emerald-500";
  if (status === "At Risk") return "bg-amber-500";
  return "bg-red-500";
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    "On Track": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "At Risk": "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Behind: "text-red-400 bg-red-500/10 border-red-500/20",
  };
  return colors[status] || colors["Behind"];
}

export default function ObjectiveContributions({ objectives }: ObjectiveContributionsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <IconFlag size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Objectives</h2>
          <p className="text-xs text-muted-foreground">{objectives.length} objectives with contributor breakdown</p>
        </div>
      </div>

      {/* Objective Cards */}
      <div className="space-y-3">
        {objectives.map((obj) => {
          const expanded = expandedId === obj.objectiveId;
          const uniqueContributors = new Map<string, { name: string; pic: string; krCount: number; avgProgress: number }>();

          obj.details.forEach((kr) => {
            const existing = uniqueContributors.get(kr.fullName);
            if (existing) {
              existing.krCount += 1;
              existing.avgProgress = (existing.avgProgress * (existing.krCount - 1) + kr.krProgress) / existing.krCount;
            } else {
              uniqueContributors.set(kr.fullName, {
                name: kr.fullName,
                pic: kr.pictureURL,
                krCount: 1,
                avgProgress: kr.krProgress,
              });
            }
          });

          const contributors = Array.from(uniqueContributors.values());

          return (
            <div
              key={obj.objectiveId}
              className="rounded-xl border border-border/30 bg-card/40 overflow-hidden transition-all duration-200 hover:border-border/50"
            >
              {/* Compact row */}
              <button
                onClick={() => setExpandedId(expanded ? null : obj.objectiveId)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                {/* Status dot */}
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor(obj.status)}`} />

                {/* Name + progress */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{obj.objectiveName}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary max-w-[200px] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${statusColor(obj.status)}`}
                        style={{ width: `${Math.min(obj.progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums font-semibold">{obj.progress.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(obj.status)}`}>
                  {obj.status}
                </span>

                {/* Contributor avatars */}
                <div className="flex -space-x-2 shrink-0">
                  {contributors.slice(0, 4).map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-bold overflow-hidden"
                    >
                      {c.pic ? (
                        <img src={c.pic} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        c.name.charAt(0)
                      )}
                    </div>
                  ))}
                  {contributors.length > 4 && (
                    <div className="w-7 h-7 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                      +{contributors.length - 4}
                    </div>
                  )}
                </div>

                {/* Expand chevron */}
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </button>

              {/* Expanded detail */}
              {expanded && (
                <div className="border-t border-border/20 p-4 bg-secondary/5">
                  {/* Contributors grid */}
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Contributors</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                    {contributors.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-card/40 border border-border/20">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                          {c.pic ? (
                            <img src={c.pic} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.krCount} KR · {c.avgProgress.toFixed(0)}% avg</div>
                        </div>
                        <div className="text-xs font-bold tabular-nums">{c.avgProgress.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>

                  {/* KR Details */}
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Key Results</div>
                  <div className="space-y-1.5">
                    {obj.details.map((kr, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${kr.isDone ? "bg-emerald-500" : "bg-secondary"}`} />
                        <span className="flex-1 truncate text-muted-foreground">{kr.krTitle}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{kr.fullName}</span>
                        <span className="font-semibold tabular-nums w-12 text-right">{kr.pointCurrent}/{kr.pointOKR}</span>
                        <span className={`font-semibold tabular-nums w-10 text-right ${kr.krProgress >= 70 ? "text-emerald-400" : kr.krProgress >= 40 ? "text-amber-400" : "text-red-400"}`}>
                          {kr.krProgress.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
