"use client";

import { Objective } from "@/lib/types/okr";
import { IconArrowTrend, IconPulse } from "@/components/icons";

interface MomentumSectionProps {
  objectives: Objective[];
}

function categorizeMomentum(objectives: Objective[]) {
  const gaining = objectives
    .filter((o) => o.subObjectives.some((s) => s.progressUpdate > 0))
    .sort((a, b) => {
      const aUpdate = Math.max(...a.subObjectives.map((s) => s.progressUpdate));
      const bUpdate = Math.max(...b.subObjectives.map((s) => s.progressUpdate));
      return bUpdate - aUpdate;
    })
    .slice(0, 5);

  const stalling = objectives
    .filter((o) => o.progress > 0 && o.progress < 100 && o.subObjectives.every((s) => s.progressUpdate === 0))
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 5);

  return { gaining, stalling };
}

function MiniSparkline({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-16 h-4 flex items-end gap-px">
      {[0.3, 0.5, 0.7, 0.85, 1].map((mult, i) => {
        const h = Math.max(4, pct * mult * 0.4);
        return (
          <div
            key={i}
            className="flex-1 rounded-sm bg-current opacity-40 transition-all duration-300"
            style={{ height: `${h}px`, opacity: 0.2 + mult * 0.6 }}
          />
        );
      })}
    </div>
  );
}

export default function MomentumSection({ objectives }: MomentumSectionProps) {
  const { gaining, stalling } = categorizeMomentum(objectives);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <IconPulse size={16} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Momentum</h2>
          <p className="text-xs text-muted-foreground">Objectives gaining speed vs stalling</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gaining Momentum */}
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/3 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconArrowTrend size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Gaining Speed</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{gaining.length} objectives</span>
          </div>
          <div className="space-y-2">
            {gaining.length === 0 && (
              <div className="text-xs text-muted-foreground py-4 text-center">No objectives with recent updates</div>
            )}
            {gaining.map((obj) => {
              const maxUpdate = Math.max(...obj.subObjectives.map((s) => s.progressUpdate));
              return (
                <div key={obj.objectiveId} className="flex items-center gap-3 p-2 rounded-lg bg-card/30 border border-border/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{obj.objectiveName}</div>
                    <div className="text-[10px] text-muted-foreground">{obj.progress.toFixed(0)}% overall</div>
                  </div>
                  <div className="text-emerald-400 shrink-0">
                    <MiniSparkline value={maxUpdate} />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums shrink-0">+{maxUpdate.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stalling */}
        <div className="rounded-xl border border-red-500/15 bg-red-500/3 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconPulse size={14} className="text-red-400" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Stalling</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{stalling.length} objectives</span>
          </div>
          <div className="space-y-2">
            {stalling.length === 0 && (
              <div className="text-xs text-muted-foreground py-4 text-center">All objectives have recent activity</div>
            )}
            {stalling.map((obj) => (
              <div key={obj.objectiveId} className="flex items-center gap-3 p-2 rounded-lg bg-card/30 border border-border/10">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{obj.objectiveName}</div>
                  <div className="text-[10px] text-muted-foreground">{obj.progress.toFixed(0)}% — no recent updates</div>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                  obj.status === "Behind" ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                }`}>
                  {obj.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
