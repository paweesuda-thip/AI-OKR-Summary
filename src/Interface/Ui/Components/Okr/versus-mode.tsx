import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ContributorSum,
  Objective,
  PersonObjective,
  type ParticipantDetailRaw,
} from "@/src/Domain/Entities/Okr";
import { mapObjectiveForPerson } from "@/src/Infrastructure/Persistence/Mappers/OkrMapper";
import { Crosshair, Activity, Terminal, Zap, ChevronRight, Trophy, ChevronDown, Users, CalendarDays, Loader2, Cpu, ArrowLeft, Swords, Dot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectSeparator,
} from "@/src/Interface/Ui/Primitives/select";
import type { CycleOption, GroupedOrgOption } from "@/src/Interface/Ui/utils/org-leaf";
import { useDashboardQuery } from "@/src/Interface/Ui/Hooks/use-dashboard-query";
import { useParticipantQuery } from "@/src/Interface/Ui/Hooks/use-participant-query";
import BorderGlow from "@/src/Interface/Ui/Components/Shared/react-bits/BorderGlow";

type Step = "select" | "preview" | "result";

interface RoundAction {
  roundNumber: number;
  p1_badge: string;
  p2_badge: string;
  commentary: string;
}

interface ComparisonResult {
  winner: string;
  scoreA: number;
  scoreB: number;
  intro_hype: string;
  rounds: RoundAction[];
  playerA_strengths_weaknesses: string;
  playerB_strengths_weaknesses: string;
  conclusion: string;
}

/**
 * Alias kept for readability at call sites. Comes from shared
 * `mapObjectiveForPerson()` so versus-mode and check-in-engagement stay in sync.
 */
type TopObjectiveEnhanced = PersonObjective;

interface VersusModeProps {
  cycleOptions: CycleOption[];
  orgGroupedOptions: GroupedOrgOption[];
  ddlLoading?: boolean;
}

type PlayerEnhanced = ContributorSum & {
  topObjectives: TopObjectiveEnhanced[];
  /** From participant-details API (`ParticipantDetailRaw.avgPercent`), keyed by contributor name. */
  avgParticipantPercent?: number;
  totalScore: number;
  goalAchievementScore: number;
  qualityScore: number;
  engagementBehaviorScore: number;
};

function participantDetailsByContributorName(
  participants: ParticipantDetailRaw[] | undefined,
): Map<string, ParticipantDetailRaw> {
  const map = new Map<string, ParticipantDetailRaw>();
  for (const p of participants ?? []) {
    for (const key of [p.fullName, p.fullName_EN]) {
      const t = key?.trim();
      if (t) map.set(t, p);
    }
  }
  return map;
}

function mergeParticipantDetails(
  pool: PlayerEnhanced[],
  participants: ParticipantDetailRaw[] | undefined,
): PlayerEnhanced[] {
  const map = participantDetailsByContributorName(participants);
  return pool.map((c) => {
    const p = map.get(c.fullName.trim());
    const fallbackScore = Math.floor(Math.random() * 30) + 70; // 70-100 Mock
    return {
      ...c,
      avgParticipantPercent: p?.avgPercent ?? 0,
      totalScore: p?.totalScore ?? fallbackScore,
      goalAchievementScore: p?.goalAchievementScore ?? fallbackScore,
      qualityScore: p?.qualityScore ?? fallbackScore,
      engagementBehaviorScore: p?.engagementBehaviorScore ?? fallbackScore,
    };
  });
}

/** Shared A/Q/E bars — matches Check-in Engagement “multi-dimensional” UI (see docs/engagement-ranking-concept.md). */
const EngagementMetricBar = ({
  label,
  value,
  color,
  isRight,
}: {
  label: string;
  value: number;
  color: "rose" | "cyan";
  isRight?: boolean;
}) => (
  <div className="space-y-1.5 w-full">
    <div className={`flex justify-between items-end ${isRight ? "flex-row-reverse" : ""}`}>
      <span className="text-[9px] text-white/50 uppercase tracking-widest font-semibold">{label}</span>
      <span
        className={`text-[10px] font-mono font-bold ${
          color === "rose" ? "text-rose-400" : "text-cyan-400"
        }`}
      >
        {Math.floor(value)}
      </span>
    </div>
    <div
      className={`w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex ${
        isRight ? "justify-end" : "justify-start"
      }`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${
          color === "rose"
            ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
            : "bg-gradient-to-l from-cyan-400 to-cyan-600 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        }`}
      />
    </div>
  </div>
);

// -------------------------------------------------------------
// HELPER COMPONENT: Typewriter Text Effect (FIXED FOR THAI GLYPHS / STRICT MODE)
// -------------------------------------------------------------
const TypewriterText = ({ text, delay = 0, speed = 20 }: { text: string, delay?: number, speed?: number }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let timeout: NodeJS.Timeout;
    let index = 0;

    // Use Array.from to correctly break Unicode characters without breaking emojis
    const chars = Array.from(text || "");

    const startTyping = () => {
      const interval = setInterval(() => {
        index++;
        // Slice from exact array prevents double-append bugs in React Strict Mode
        setDisplayed(chars.slice(0, index).join(''));
        if (index >= chars.length) {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    };

    if (delay > 0) {
      timeout = setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [text, delay, speed]);

  return <span>{displayed}</span>;
}

// -------------------------------------------------------------
// ROUND DOSSIER — editorial / magazine take on round commentary.
// No card, no left accent bar, no glass. A ghost phase numeral sits
// behind the text, the summary lands as a serif italic pull-quote,
// and each evidence line is indexed with a roman numeral gutter.
// -------------------------------------------------------------
const toRoman = (n: number): string => {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let r = Math.max(1, Math.floor(n));
  for (const [v, s] of map) {
    while (r >= v) {
      out += s;
      r -= v;
    }
  }
  return out || "I";
};

const RoundDossier = ({
  phase,
  totalRounds,
  text,
}: {
  phase: number;
  totalRounds: number;
  text: string;
}) => {
  const lines = (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = lines
    .filter((l) => l.startsWith("-"))
    .map((l) => l.replace(/^-+\s*/, ""));

  const summaryRaw = lines.find((l) => !l.startsWith("-")) ?? "";
  const summary = summaryRaw.replace(/^สรุปรอบ\s*:\s*/i, "").trim();

  const hasStructured = bullets.length > 0;

  return (
    <div className="relative w-full max-w-2xl mx-auto text-left pl-2 pr-4 pt-1 pb-2">
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -top-6 -left-3 md:-top-8 md:-left-5 font-sans font-bold leading-none tracking-[-0.06em] text-zinc-100/[0.05] text-[9rem] md:text-[12rem] tabular-nums"
      >
        {String(phase).padStart(2, "0")}
      </span>

      <div className="relative mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-amber-300/55">
        <span className="font-sans font-semibold">Fragment {String(phase).padStart(2, "0")} / {String(totalRounds).padStart(2, "0")}</span>
        <span className="flex-1 h-px bg-[linear-gradient(to_right,theme(colors.zinc.700)_0,theme(colors.zinc.700)_50%,transparent_50%)] [background-size:6px_1px]" />
      </div>

      {summary && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative font-sans font-light text-xl md:text-[26px] leading-[1.45] text-zinc-50 mb-7 tracking-tight"
        >
          <span className="text-amber-300/70 mr-1 font-normal">“</span>
          {summary}
          <span className="text-amber-300/70 ml-1 font-normal">”</span>
        </motion.p>
      )}

      {hasStructured ? (
        <ol className="relative space-y-3.5 font-sans">
          {bullets.map((b, i) => (
            <motion.li
              key={`${phase}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.42,
                delay: 0.25 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex gap-4 text-[13px] md:text-[14px] leading-[1.85] text-zinc-300"
            >
              <span><Dot/></span>
              <span className="flex-1 whitespace-pre-line">{b}</span>
            </motion.li>
          ))}
        </ol>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-[13px] md:text-sm leading-[1.85] text-zinc-300 whitespace-pre-line"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

const buildPlayerPool = (
  contributors: ContributorSum[],
  objectives: Objective[],
): PlayerEnhanced[] => {
  const objectiveById = new Map(
    objectives.map((objective) => [objective.objectiveId, objective]),
  );

  return contributors
    .filter((c) => c.fullName && c.objectives && c.objectives.length > 0)
    .map((c) => {
      // Route ALL per-person progress math through the shared helper so
      // versus-mode and check-in-engagement can't drift apart.
      const topObjs: TopObjectiveEnhanced[] = c.objectives
        .map((contribObj) => {
          const source = objectiveById.get(contribObj.objectiveId);
          return source ? mapObjectiveForPerson(source, c.fullName) : null;
        })
        .filter((o): o is TopObjectiveEnhanced => o !== null)
        .sort((a, b) => b.personProgress - a.personProgress);

      const avgObjectiveProgress =
        topObjs.length > 0
          ? topObjs.reduce((s, o) => s + o.personProgress, 0) / topObjs.length
          : c.avgObjectiveProgress;

      return {
        ...c,
        avgObjectiveProgress,
        topObjectives: topObjs,
        totalScore: 0,
        goalAchievementScore: 0,
        qualityScore: 0,
        engagementBehaviorScore: 0,
      };
    });
};

/** Client-side load heuristic from KR count + point gap (maps OKR weight vs progress). */
function objectiveLoadHint(obj: TopObjectiveEnhanced): { chip: string; sub: string } {
  const subs = obj.subObjectives;
  const krs = subs.flatMap((s) => s.details ?? []);
  const n = krs.length;
  const gapSum = krs.reduce((acc, kr) => acc + Math.max(0, (kr.pointOKR || 0) - (kr.pointCurrent || 0)), 0);
  const avgGap = n > 0 ? gapSum / n : 0;
  const score = subs.length * 10 + n * 8 + avgGap;
  if (score >= 72) return { chip: "LOAD · HIGH", sub: `${subs.length} detail · ${n} KR · ~${Math.round(avgGap)}% gap avg` };
  if (score >= 32) return { chip: "LOAD · MED", sub: `${subs.length} detail · ${n} KR` };
  return { chip: "LOAD · LOW", sub: n ? `${subs.length} detail · ${n} KR` : "no KR rows" };
}

export default function VersusMode({
  cycleOptions,
  orgGroupedOptions,
  ddlLoading = false,
}: VersusModeProps) {
  const [step, setStep] = useState<Step>("select");
  const [p1, setP1] = useState<PlayerEnhanced | null>(null);
  const [p2, setP2] = useState<PlayerEnhanced | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const sortedCycles = useMemo(() => {
    return [...cycleOptions].sort((a, b) => {
      if (a.isCurrentCycle && !b.isCurrentCycle) return -1;
      if (!a.isCurrentCycle && b.isCurrentCycle) return 1;
      if (a.year !== b.year) return b.year - a.year;
      return new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime();
    });
  }, [cycleOptions]);

  const defaultCycleId = sortedCycles[0]?.setId || 0;
  const hasSpartanDefault = orgGroupedOptions.some((group) =>
    group.options.some((opt) => opt.organizationId === 18477)
  );
  const defaultOrgId = hasSpartanDefault
    ? 18477
    : (orgGroupedOptions[0]?.options[0]?.organizationId || 0);

  const [p1CycleId, setP1CycleId] = useState<number>(defaultCycleId);
  const [p1OrgId, setP1OrgId] = useState<number>(defaultOrgId);

  const [p2CycleId, setP2CycleId] = useState<number>(defaultCycleId);
  const [p2OrgId, setP2OrgId] = useState<number>(defaultOrgId);

  useEffect(() => {
    if (sortedCycles.length === 0) return;
    const validP1 = sortedCycles.some((cycle) => cycle.setId === p1CycleId);
    const validP2 = sortedCycles.some((cycle) => cycle.setId === p2CycleId);
    if (!validP1) setP1CycleId(defaultCycleId);
    if (!validP2) setP2CycleId(defaultCycleId);
  }, [defaultCycleId, p1CycleId, p2CycleId, sortedCycles]);

  useEffect(() => {
    if (orgGroupedOptions.length === 0) return;
    const orgIds = new Set(
      orgGroupedOptions.flatMap((group) => group.options.map((option) => option.organizationId)),
    );
    if (!orgIds.has(p1OrgId)) setP1OrgId(defaultOrgId);
    if (!orgIds.has(p2OrgId)) setP2OrgId(defaultOrgId);
  }, [defaultOrgId, orgGroupedOptions, p1OrgId, p2OrgId]);

  const orgLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const group of orgGroupedOptions) {
      for (const option of group.options) {
        map.set(option.organizationId, option.label);
      }
    }
    return map;
  }, [orgGroupedOptions]);

  const p1SelectedCycleLabel = sortedCycles.find(c => c.setId === p1CycleId)?.label || "Select Cycle";
  const p1SelectedOrgLabel = orgLabelMap.get(p1OrgId) || "Select Team";

  const p2SelectedCycleLabel = sortedCycles.find(c => c.setId === p2CycleId)?.label || "Select Cycle";
  const p2SelectedOrgLabel = orgLabelMap.get(p2OrgId) || "Select Team";

  const p1Params = useMemo(() => ({ assessmentSetId: p1CycleId, organizationId: p1OrgId }), [p1CycleId, p1OrgId]);
  const p2Params = useMemo(() => ({ assessmentSetId: p2CycleId, organizationId: p2OrgId }), [p2CycleId, p2OrgId]);

  const queryEnabled = !ddlLoading && sortedCycles.length > 0 && orgGroupedOptions.length > 0;

  const { data: p1DashboardData, isLoading: p1Loading } = useDashboardQuery(p1Params, { enabled: queryEnabled });
  const { data: p2DashboardData, isLoading: p2Loading } = useDashboardQuery(p2Params, { enabled: queryEnabled });
  const { data: p1Participants } = useParticipantQuery(p1Params, { enabled: queryEnabled });
  const { data: p2Participants } = useParticipantQuery(p2Params, { enabled: queryEnabled });

  const p1Candidates = useMemo(
    () =>
      mergeParticipantDetails(
        buildPlayerPool(p1DashboardData?.contributors ?? [], p1DashboardData?.objectives ?? []),
        p1Participants,
      ),
    [p1DashboardData, p1Participants],
  );

  const p2Candidates = useMemo(
    () =>
      mergeParticipantDetails(
        buildPlayerPool(p2DashboardData?.contributors ?? [], p2DashboardData?.objectives ?? []),
        p2Participants,
      ),
    [p2DashboardData, p2Participants],
  );

  useEffect(() => {
    if (p1 && !p1Candidates.some((c) => c.fullName === p1.fullName)) {
      setP1(null);
    }
  }, [p1, p1Candidates]);

  useEffect(() => {
    if (p2 && !p2Candidates.some((c) => c.fullName === p2.fullName)) {
      setP2(null);
    }
  }, [p2, p2Candidates]);

  // If user flips cycles back to equal while self-selected on both sides, clear P2.
  useEffect(() => {
    if (p1 && p2 && p1.fullName === p2.fullName && p1CycleId === p2CycleId) {
      setP2(null);
    }
  }, [p1, p2, p1CycleId, p2CycleId]);

  const resetState = () => {
    setStep("select");
    setP1(null);
    setP2(null);
    setResult(null);
    setIsComparing(false);
    setCompareError(null);
  };

  const runAiComparison = async () => {
    if (!p1 || !p2) return;
    setIsComparing(true);
    setCompareError(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerA: p1,
          playerB: p2,
          cycleLabelA: p1SelectedCycleLabel,
          cycleLabelB: p2SelectedCycleLabel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg =
          typeof data?.message === 'string'
            ? data.message
            : typeof data?.error === 'string'
              ? data.error
              : `Request failed (${response.status})`;
        throw new Error(msg);
      }

      if (
        !data ||
        typeof data.winner !== 'string' ||
        !Array.isArray(data.rounds) ||
        typeof data.intro_hype !== 'string' ||
        typeof data.conclusion !== 'string'
      ) {
        throw new Error('Invalid response from eval API (missing AI-generated fields).');
      }

      setResult(data);
      setStep('result');
    } catch (error) {
      console.error(error);
      setCompareError(
        error instanceof Error ? error.message : 'Could not load AI eval. Try again.',
      );
    } finally {
      setIsComparing(false);
    }
  };

  // -------------------------------------------------------------
  // SELECT SCREEN
  // -----------------------------------
  const SelectScreen = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="w-full min-h-[85vh] flex flex-col overflow-hidden relative shadow-2xl font-sans"
      >
        {/* Ambient background — subtle, enterprise-feel */}
        <div className="absolute top-0 left-[20%] w-[40vw] h-[40vw] bg-rose-500/[0.04] rounded-full blur-[130px] pointer-events-none mix-blend-screen -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-0 right-[20%] w-[40vw] h-[40vw] bg-cyan-400/[0.04] rounded-full blur-[130px] pointer-events-none mix-blend-screen -translate-y-1/2 translate-x-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_95%)] pointer-events-none" />
        {/* Showcase area */}
        <div className="flex-1 relative flex items-center justify-between px-8 lg:px-14 overflow-hidden py-8">

           {/* P1 Showcase */}
           <div className="w-1/2 h-full flex items-center justify-start relative z-10 pr-3 sm:pr-5 lg:pr-12 xl:pr-16 min-w-0">
              {p1 ? (
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6 lg:gap-8 w-full min-w-0">
                  {/* Portrait */}
                  <div className="relative w-[150px] h-[190px] lg:w-[180px] lg:h-[230px] shrink-0">
                    <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full" />
                    {p1.pictureURL ? (
                      <Image src={p1.pictureURL} alt={p1.fullName} fill className="object-cover rounded-2xl border border-rose-500/25 shadow-[0_0_36px_rgba(244,63,94,0.12)]" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 rounded-2xl border border-rose-500/25 flex items-center justify-center text-5xl text-white/15 font-bold shadow-[0_0_36px_rgba(244,63,94,0.12)]">{p1.fullName[0]}</div>
                    )}
                  </div>
                  {/* Stats */}
                  <div className="flex flex-col gap-5 flex-1 min-w-0">
                    <div>
                      <div className="text-rose-400/80 font-bold tracking-[0.25em] text-[10px] mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> SUBJECT A
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight truncate tracking-tight">{p1.fullName}</h1>
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 w-full max-w-[min(100%,280px)]">
                          <div className="text-[9px] uppercase tracking-[0.2em] text-white/45 font-semibold">Total score</div>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-bold tabular-nums text-rose-400 leading-none">
                              {Math.floor(p1.totalScore)}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-500">/ 100</span>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">{p1.checkInCount} check-ins</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-28 h-28 lg:w-32 lg:h-32 shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                            { subject: 'A', value: p1.goalAchievementScore, fullMark: 100 },
                            { subject: 'Q', value: p1.qualityScore, fullMark: 100 },
                            { subject: 'E', value: p1.engagementBehaviorScore, fullMark: 100 }
                          ]}>
                            <PolarGrid gridType="polygon" radialLines={true} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700 }} />
                            <Radar isAnimationActive={true} animationDuration={800} dataKey="value" stroke="rgba(244,63,94,0.85)" strokeWidth={1.5} fill="url(#colorRoseBg)" fillOpacity={1} />
                            <defs>
                              <linearGradient id="colorRoseBg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/></linearGradient>
                            </defs>
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-3 max-w-[180px]">
                        <EngagementMetricBar label="Achievement" value={p1.goalAchievementScore} color="rose" />
                        <EngagementMetricBar label="Quality" value={p1.qualityScore} color="rose" />
                        <EngagementMetricBar label="Engagement" value={p1.engagementBehaviorScore} color="rose" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full flex items-center gap-6">
                  <div className="relative w-[150px] h-[190px] lg:w-[180px] lg:h-[230px] rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0">
                    <Users className="w-10 h-10 lg:w-12 lg:h-12 text-white/12" strokeWidth={1.2} />
                    <div className="absolute inset-x-2 bottom-2 text-center text-[9px] font-mono text-white/20 uppercase tracking-[0.25em]">subject A</div>
                  </div>
                  <div className="flex-1 space-y-4 max-w-[220px]">
                    <div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-rose-400/60 font-bold mb-1.5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/15" /> Slot Open
                      </div>
                      <div className="text-sm text-white/55 font-medium leading-snug">Pick a contributor from the Alpha roster below.</div>
                    </div>
                    <div className="space-y-3">
                      {['Achievement', 'Quality', 'Engagement'].map(l => (
                        <div key={l} className="space-y-1.5">
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] text-white/25 uppercase tracking-widest font-semibold">{l}</span>
                            <span className="text-[10px] font-mono text-white/15">—</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.03] rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
           </div>

           {/* P2 Showcase */}
           <div className="w-1/2 h-full flex items-center justify-end relative z-10 flex-row-reverse pl-3 sm:pl-5 lg:pl-12 xl:pl-16 min-w-0">
              {p2 ? (
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6 lg:gap-8 w-full flex-row-reverse text-right min-w-0">
                  {/* Portrait */}
                  <div className="relative w-[150px] h-[190px] lg:w-[180px] lg:h-[230px] shrink-0">
                    <div className="absolute inset-0 bg-cyan-400/10 blur-3xl rounded-full" />
                    {p2.pictureURL ? (
                      <Image src={p2.pictureURL} alt={p2.fullName} fill className="object-cover rounded-2xl border border-cyan-400/25 shadow-[0_0_36px_rgba(34,211,238,0.12)]" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 rounded-2xl border border-cyan-400/25 flex items-center justify-center text-5xl text-white/15 font-bold shadow-[0_0_36px_rgba(34,211,238,0.12)]">{p2.fullName[0]}</div>
                    )}
                  </div>
                  {/* Stats */}
                  <div className="flex flex-col gap-5 flex-1 min-w-0">
                    <div className="w-full text-right">
                      <div className="text-cyan-400/80 font-bold tracking-[0.25em] text-[10px] mb-2 flex items-center gap-2 justify-end">
                        SUBJECT B <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight truncate tracking-tight">{p2.fullName}</h1>
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-right w-full max-w-[min(100%,280px)] ml-auto">
                          <div className="text-[9px] uppercase tracking-[0.2em] text-white/45 font-semibold">Total score</div>
                          <div className="flex items-baseline gap-2 mt-0.5 justify-end">
                            <span className="text-2xl font-bold tabular-nums text-cyan-400 leading-none">
                              {Math.floor(p2.totalScore)}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-500">/ 100</span>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 flex justify-end">{p2.checkInCount} check-ins</div>
                      </div>
                    </div>
                    <div className="flex items-center flex-row-reverse gap-5 w-full">
                      <div className="w-28 h-28 lg:w-32 lg:h-32 shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                            { subject: 'A', value: p2.goalAchievementScore, fullMark: 100 },
                            { subject: 'Q', value: p2.qualityScore, fullMark: 100 },
                            { subject: 'E', value: p2.engagementBehaviorScore, fullMark: 100 }
                          ]}>
                            <PolarGrid gridType="polygon" radialLines={true} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700 }} />
                            <Radar isAnimationActive={true} animationDuration={800} dataKey="value" stroke="rgba(34,211,238,0.85)" strokeWidth={1.5} fill="url(#colorCyanBg)" fillOpacity={1} />
                            <defs>
                              <linearGradient id="colorCyanBg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0}/></linearGradient>
                            </defs>
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-3 max-w-[180px]">
                        <EngagementMetricBar label="Achievement" value={p2.goalAchievementScore} color="cyan" isRight />
                        <EngagementMetricBar label="Quality" value={p2.qualityScore} color="cyan" isRight />
                        <EngagementMetricBar label="Engagement" value={p2.engagementBehaviorScore} color="cyan" isRight />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full flex items-center gap-6 flex-row-reverse">
                  <div className="relative w-[150px] h-[190px] lg:w-[180px] lg:h-[230px] rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0">
                    <Users className="w-10 h-10 lg:w-12 lg:h-12 text-white/12" strokeWidth={1.2} />
                    <div className="absolute inset-x-2 bottom-2 text-center text-[9px] font-mono text-white/20 uppercase tracking-[0.25em]">subject B</div>
                  </div>
                  <div className="flex-1 space-y-4 max-w-[220px] text-right">
                    <div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-cyan-400/60 font-bold mb-1.5 flex items-center gap-2 justify-end">
                        Slot Open <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                      </div>
                      <div className="text-sm text-white/55 font-medium leading-snug">Pick a contributor from the Omega roster below.</div>
                    </div>
                    <div className="space-y-3">
                      {['Achievement', 'Quality', 'Engagement'].map(l => (
                        <div key={l} className="space-y-1.5">
                          <div className="flex justify-between items-end flex-row-reverse">
                            <span className="text-[9px] text-white/25 uppercase tracking-widest font-semibold">{l}</span>
                            <span className="text-[10px] font-mono text-white/15">—</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.03] rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* CENTER EXECUTE BUTTON */}
        <div className="absolute left-1/2 bottom-[35%] -translate-x-1/2 translate-y-1/2 z-40">
           <AnimatePresence mode="wait">
             {p1 && p2 ? (
               <motion.div
                 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                 onClick={() => setStep('preview')}
                 className="cursor-pointer"
               >
                 <BorderGlow
                   borderRadius={999}
                   backgroundColor="#07070e"
                   glowColor="200 85 72"
                   colors={['#f43f5e', '#22d3ee', '#c084fc']}
                   glowIntensity={1.4}
                   glowRadius={24}
                   fillOpacity={0.25}
                 >
                   <div className="flex items-center gap-2.5 px-7 py-2.5 font-black italic uppercase tracking-[0.2em] text-white text-sm select-none pointer-events-none">
                     <Swords className="w-4 h-4 shrink-0" />
                     <span>COMPARE</span>
                   </div>
                 </BorderGlow>
               </motion.div>
             ) : null}
           </AnimatePresence>
        </div>

        {/* BOTTOM SELECTION ROSTER */}
        <div className="h-[35%] w-full bg-zinc-950/80 backdrop-blur-2xl border-t border-white/10 flex relative z-30">
           
           {/* P1 Roster */}
           <div className="w-1/2 h-full flex flex-col border-r border-white/10 p-6 relative">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex gap-3 w-3/4">
                    <Select value={p1CycleId.toString()} onValueChange={(val) => setP1CycleId(Number(val))} disabled={ddlLoading}>
                       <SelectTrigger className="h-10 bg-white/5 border-none rounded-xl text-xs font-medium text-white/80 focus:ring-0">
                         <CalendarDays className="w-3.5 h-3.5 text-white/40 mr-2" />
                         <span className="truncate">{p1SelectedCycleLabel}</span>
                       </SelectTrigger>
                       <SelectContent className="bg-zinc-900 border-none rounded-xl shadow-2xl">
                          {sortedCycles.map(c => <SelectItem key={c.setId} value={c.setId.toString()} className="text-xs">{c.label}</SelectItem>)}
                       </SelectContent>
                    </Select>
                    <Select value={p1OrgId.toString()} onValueChange={(val) => setP1OrgId(Number(val))} disabled={ddlLoading}>
                       <SelectTrigger className="h-10 bg-white/5 border-none rounded-xl text-xs font-medium text-white/80 focus:ring-0">
                         <Users className="w-3.5 h-3.5 text-white/40 mr-2" />
                         <span className="truncate">{p1SelectedOrgLabel}</span>
                       </SelectTrigger>
                       <SelectContent className="bg-zinc-900 border-none rounded-xl shadow-2xl">
                          {orgGroupedOptions.map(g => (
                            <SelectGroup key={g.groupLabel}>
                              <SelectLabel className="text-[10px] text-white/40">{g.groupLabel}</SelectLabel>
                              {g.options.map(opt => <SelectItem key={opt.organizationId} value={opt.organizationId.toString()} className="text-xs">{opt.label}</SelectItem>)}
                            </SelectGroup>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{p1Candidates.length} Found</div>
              </div>
              
              <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden pb-2 pt-1 px-1 scrollbar-hide snap-x items-center">
                 {p1Loading ? (
                   Array.from({ length: 6 }).map((_, i) => <div key={i} className="shrink-0 w-24 h-24 rounded-2xl bg-white/5 animate-pulse" />)
                 ) : p1Candidates.map(c => {
                   const isSelected = p1?.fullName === c.fullName;
                   const isPickedByOther = p2?.fullName === c.fullName && p1CycleId === p2CycleId;
                   return (
                     <button key={c.fullName} onClick={() => !isPickedByOther && setP1(c)} disabled={isPickedByOther} 
                        className={`relative shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden snap-start transition-all duration-300 ${isSelected ? 'ring-2 ring-rose-500 scale-105 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : isPickedByOther ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:ring-1 hover:ring-white/20 hover:scale-105 opacity-70 hover:opacity-100'}`}
                     >
                       {c.pictureURL ? (
                         <Image src={c.pictureURL} alt={c.fullName} fill className="object-cover" unoptimized sizes="96px" />
                       ) : (
                         <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xl font-black text-white/50">{c.fullName[0]}</div>
                       )}
                       <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-1.5 pb-1.5 pt-5">
                         <div className="text-[9px] font-mono font-bold text-rose-300/95 tabular-nums text-center leading-none">
                           {Math.floor(c.totalScore)}
                         </div>
                         <div className="text-[9px] font-bold text-white truncate text-center uppercase tracking-wider mt-0.5">
                           {c.fullName.split(" ")[0]}
                         </div>
                       </div>
                     </button>
                   )
                 })}
              </div>
           </div>

           {/* P2 Roster */}
           <div className="w-1/2 h-full flex flex-col p-6 relative">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                 <div className="flex gap-3 w-3/4 flex-row-reverse">
                    <Select value={p2CycleId.toString()} onValueChange={(val) => setP2CycleId(Number(val))} disabled={ddlLoading}>
                       <SelectTrigger className="h-10 bg-white/5 border-none rounded-xl text-xs font-medium text-white/80 focus:ring-0 flex-row-reverse">
                         <CalendarDays className="w-3.5 h-3.5 text-white/40 ml-2" />
                         <span className="truncate">{p2SelectedCycleLabel}</span>
                       </SelectTrigger>
                       <SelectContent className="bg-zinc-900 border-none rounded-xl shadow-2xl">
                          {sortedCycles.map(c => <SelectItem key={c.setId} value={c.setId.toString()} className="text-xs text-right">{c.label}</SelectItem>)}
                       </SelectContent>
                    </Select>
                    <Select value={p2OrgId.toString()} onValueChange={(val) => setP2OrgId(Number(val))} disabled={ddlLoading}>
                       <SelectTrigger className="h-10 bg-white/5 border-none rounded-xl text-xs font-medium text-white/80 focus:ring-0 flex-row-reverse">
                         <Users className="w-3.5 h-3.5 text-white/40 ml-2" />
                         <span className="truncate">{p2SelectedOrgLabel}</span>
                       </SelectTrigger>
                       <SelectContent className="bg-zinc-900 border-none rounded-xl shadow-2xl">
                          {orgGroupedOptions.map(g => (
                            <SelectGroup key={g.groupLabel}>
                              <SelectLabel className="text-[10px] text-white/40 text-right">{g.groupLabel}</SelectLabel>
                              {g.options.map(opt => <SelectItem key={opt.organizationId} value={opt.organizationId.toString()} className="text-xs text-right">{opt.label}</SelectItem>)}
                            </SelectGroup>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{p2Candidates.length} Found</div>
              </div>
              
              <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden pb-2 pt-1 px-1 scrollbar-hide snap-x items-center flex-row-reverse">
                 {p2Loading ? (
                   Array.from({ length: 6 }).map((_, i) => <div key={i} className="shrink-0 w-24 h-24 rounded-2xl bg-white/5 animate-pulse" />)
                 ) : p2Candidates.map(c => {
                   const isSelected = p2?.fullName === c.fullName;
                   const isPickedByOther = p1?.fullName === c.fullName && p1CycleId === p2CycleId;
                   return (
                     <button key={c.fullName} onClick={() => !isPickedByOther && setP2(c)} disabled={isPickedByOther} 
                        className={`relative shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden snap-start transition-all duration-300 ${isSelected ? 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : isPickedByOther ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:ring-1 hover:ring-white/20 hover:scale-105 opacity-70 hover:opacity-100'}`}
                     >
                       {c.pictureURL ? (
                         <Image src={c.pictureURL} alt={c.fullName} fill className="object-cover" unoptimized sizes="96px" />
                       ) : (
                         <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xl font-black text-white/50">{c.fullName[0]}</div>
                       )}
                       <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-1.5 pb-1.5 pt-5">
                         <div className="text-[9px] font-mono font-bold text-cyan-300/95 tabular-nums text-center leading-none">
                           {Math.floor(c.totalScore)}
                         </div>
                         <div className="text-[9px] font-bold text-white truncate text-center uppercase tracking-wider mt-0.5">
                           {c.fullName.split(" ")[0]}
                         </div>
                       </div>
                     </button>
                   )
                 })}
              </div>
           </div>
        </div>
      </motion.div>
    );
  };

  // -------------------------------------------------------------
  // PREVIEW: objectives + KR (grounded) before running AI
  // -------------------------------------------------------------
  const PreviewArena = () => {
    if (!p1 || !p2) return null;

    const PreviewObjectiveCard = ({
      obj,
      isLeft,
      index,
    }: {
      obj?: TopObjectiveEnhanced;
      isLeft: boolean;
      index: number;
    }) => {
      if (!obj) {
        return (
          <div
            className={`w-full min-h-[88px] border border-dashed border-zinc-800 rounded-xl flex items-center justify-center bg-[#050505]/80 ${isLeft ? "" : "text-right"}`}
          >
            <span className="text-[9px] text-zinc-600 font-mono tracking-widest">OKR::{index + 1} · empty slot</span>
          </div>
        );
      }
      const load = objectiveLoadHint(obj);
      const objectiveDetails = obj.subObjectives;

      return (
        <div
          className={`w-full rounded-xl border border-[#1f1f1f] bg-[#0a0a0c] overflow-hidden ${isLeft ? "shadow-[inset_0_1px_0_rgba(244,63,94,0.08)]" : "shadow-[inset_0_1px_0_rgba(34,211,238,0.08)]"}`}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="relative shrink-0 w-11 h-11 flex items-center justify-center bg-[#070707] rounded-full ring-1 ring-[#1b1b1b]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-[#111]" strokeWidth="2.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className={isLeft ? "stroke-rose-500" : "stroke-cyan-400"}
                  strokeWidth="2.5"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * Math.min(100, Math.max(0, obj.personProgress))) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute text-[9px] font-bold font-mono ${isLeft ? "text-rose-400" : "text-cyan-400"}`}>
                {Math.floor(obj.personProgress)}
              </span>
            </div>
            <div className={`flex-1 min-w-0 ${isLeft ? "text-left" : "text-right"}`}>
              <div className={`flex flex-wrap items-center gap-2 mb-1 ${isLeft ? "" : "justify-end"}`}>
                <span className="text-[8px] font-mono text-zinc-500 tracking-wider">obj#{obj.objectiveId}</span>
                <span
                  className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${isLeft ? "border-rose-500/30 text-rose-400/90" : "border-cyan-400/30 text-cyan-400/90"}`}
                >
                  {load.chip}
                </span>
              </div>
              <h4 className={`text-[13px] font-medium font-sans leading-snug text-zinc-200 line-clamp-3 ${isLeft ? "" : "text-right"}`}>{obj.objectiveName}</h4>
              <p className={`text-[9px] font-mono text-zinc-500 mt-1 ${isLeft ? "" : "text-right"}`}>{load.sub}</p>
            </div>
          </div>
          {objectiveDetails.length > 0 && (
            <div className="border-t border-[#161616] bg-[#070709] px-3 py-2 space-y-2">
              {objectiveDetails.map((detail, di) => (
                <div key={detail.objectiveId ?? di} className="rounded-lg bg-[#0e0e11] border border-[#161616] p-2.5">
                  <div className={`flex items-start gap-2 ${isLeft ? "" : "flex-row-reverse text-right"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono text-zinc-500 tracking-wide uppercase">Objective detail</div>
                      <div className={`text-[11px] font-sans leading-relaxed text-zinc-300 mt-0.5 ${isLeft ? "text-left" : "text-right"}`}>
                        {detail.title}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-mono px-2 py-1 rounded border ${isLeft ? "border-rose-500/30 text-rose-400" : "border-cyan-400/30 text-cyan-400"}`}>
                      {Math.floor(detail.personProgress)}%
                    </span>
                  </div>

                  {detail.details.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {detail.details.map((kr, ki) => (
                        <div
                          key={`${detail.objectiveId}-${ki}`}
                          className={`flex flex-wrap items-start gap-2 text-[11px] font-sans rounded-lg bg-[#111116] border border-[#1b1b1b] p-2 ${isLeft ? "" : "flex-row-reverse text-right"}`}
                        >
                          <Crosshair className={`w-3 h-3 shrink-0 mt-0.5 ${isLeft ? "text-rose-500/80" : "text-cyan-400/80"}`} />
                          <div className={`flex-1 min-w-0 leading-relaxed ${isLeft ? "text-left" : "text-right"} text-zinc-400`}>{kr.krTitle}</div>
                          <div className={`flex flex-col items-end shrink-0 gap-0.5 font-mono text-[9px] ${isLeft ? "" : "items-start"}`}>
                            <span className={isLeft ? "text-rose-400" : "text-cyan-400"}>{Math.floor(kr.pointOKR)}%</span>
                            <span className="text-zinc-600">
                              {kr.pointCurrent ?? 0} pt.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {detail.details.length === 0 && (
                    <div className={`mt-2 text-[10px] font-mono text-zinc-600 ${isLeft ? "" : "text-right"}`}>
                      no KR assigned
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const maxObj = Math.max(p1.topObjectives.length, p2.topObjectives.length, 1);

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="w-full min-h-[85vh] flex flex-col overflow-hidden relative font-sans"
      >
        <div className="absolute top-0 left-[20%] w-[40vw] h-[40vw] bg-rose-500/[0.04] rounded-full blur-[130px] pointer-events-none mix-blend-screen -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-0 right-[20%] w-[40vw] h-[40vw] bg-cyan-400/[0.04] rounded-full blur-[130px] pointer-events-none mix-blend-screen -translate-y-1/2 translate-x-1/2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_95%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-1 pt-4 pb-24 sm:pb-20 px-4 sm:px-8">
          <div className="flex items-center gap-4 mb-4 max-w-7xl mx-auto w-full border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="inline-flex items-center gap-2 cursor-pointer text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to roster
            </button>
            <div className="h-4 w-px bg-zinc-700" />
            <div>
              <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Verify objectives · run AI eval</p>
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Objective manifest</h2>
            </div>
          </div>

          {isComparing && (
            <div className="max-w-7xl mx-auto w-full mb-3 text-[10px] font-mono text-emerald-500/90 tracking-wide uppercase flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              POST /api/compare · streaming…
            </div>
          )}

          {compareError && (
            <div
              role="alert"
              className="max-w-7xl mx-auto w-full mb-4 rounded-xl border border-red-500/35 bg-red-950/25 px-4 py-3 text-sm text-red-100/95 leading-relaxed"
            >
              {compareError}
            </div>
          )}

          <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-6 lg:gap-8 xl:gap-12 pb-28">
            <div className="flex flex-col gap-4 min-w-0 lg:pr-2 xl:pr-6">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-sm p-4 sm:p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="relative w-[100px] h-[120px] sm:w-[110px] sm:h-[135px] shrink-0">
                    <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full" />
                    {p1.pictureURL ? (
                      <Image
                        src={p1.pictureURL}
                        alt=""
                        fill
                        className="object-cover rounded-2xl border border-rose-500/25 shadow-[0_0_24px_rgba(244,63,94,0.1)]"
                        unoptimized
                        sizes="120px"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 rounded-2xl border border-rose-500/25 flex items-center justify-center text-3xl text-white/20 font-bold">
                        {p1.fullName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-rose-400/80 font-bold tracking-[0.25em] text-[10px] mb-1.5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      SUBJECT A
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight truncate">{p1.fullName}</h3>
                    <div className="mt-2 space-y-2">
                      <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 w-full max-w-[min(100%,280px)]">
                        <div className="text-[9px] uppercase tracking-[0.2em] text-white/45 font-semibold">Total score</div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-bold tabular-nums text-rose-400 leading-none">
                            {Math.floor(p1.totalScore)}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">/ 100</span>
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500">{p1.checkInCount} check-ins</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        data={[
                          { subject: "A", value: p1.goalAchievementScore, fullMark: 100 },
                          { subject: "Q", value: p1.qualityScore, fullMark: 100 },
                          { subject: "E", value: p1.engagementBehaviorScore, fullMark: 100 },
                        ]}
                      >
                        <PolarGrid
                          gridType="polygon"
                          radialLines
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth={1}
                        />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700 }}
                        />
                        <Radar
                          isAnimationActive
                          animationDuration={800}
                          dataKey="value"
                          stroke="rgba(244,63,94,0.85)"
                          strokeWidth={1.5}
                          fill="url(#colorRosePreview)"
                          fillOpacity={1}
                        />
                        <defs>
                          <linearGradient id="colorRosePreview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3 min-w-0 max-w-[200px]">
                    <EngagementMetricBar label="Achievement" value={p1.goalAchievementScore} color="rose" />
                    <EngagementMetricBar label="Quality" value={p1.qualityScore} color="rose" />
                    <EngagementMetricBar label="Engagement" value={p1.engagementBehaviorScore} color="rose" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: maxObj }).map((_, i) => (
                  <PreviewObjectiveCard key={`pv1-${i}`} obj={p1.topObjectives[i]} isLeft index={i} />
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-start justify-center pt-3 shrink-0 px-1">
              <motion.button
                type="button"
                disabled={isComparing}
                onClick={runAiComparison}
                whileHover={isComparing ? undefined : { scale: 1.04 }}
                whileTap={isComparing ? undefined : { scale: 0.97 }}
                className="p-0 border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none"
              >
                <BorderGlow
                  borderRadius={14}
                  backgroundColor="#07070e"
                  glowColor="160 70 45"
                  colors={["#34d399", "#22d3ee", "#6ee7b7"]}
                  glowIntensity={1.25}
                  glowRadius={22}
                  fillOpacity={0.24}
                >
                  <div className="flex items-center justify-center gap-2 px-5 py-2.5 font-semibold uppercase tracking-[0.18em] text-[10px] text-emerald-200/95 select-none pointer-events-none">
                    {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4 shrink-0" />}
                    {isComparing ? "Evaluating…" : "Run AI eval"}
                  </div>
                </BorderGlow>
              </motion.button>
            </div>

            <div className="flex flex-col gap-4 min-w-0 lg:pl-2 xl:pl-6">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-sm p-4 sm:p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="relative w-[100px] h-[120px] sm:w-[110px] sm:h-[135px] shrink-0">
                    <div className="absolute inset-0 bg-cyan-400/10 blur-3xl rounded-full" />
                    {p2.pictureURL ? (
                      <Image
                        src={p2.pictureURL}
                        alt=""
                        fill
                        className="object-cover rounded-2xl border border-cyan-400/25 shadow-[0_0_24px_rgba(34,211,238,0.1)]"
                        unoptimized
                        sizes="120px"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 rounded-2xl border border-cyan-400/25 flex items-center justify-center text-3xl text-white/20 font-bold">
                        {p2.fullName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-cyan-400/80 font-bold tracking-[0.25em] text-[10px] mb-1.5 flex items-center gap-2 justify-end">
                      SUBJECT B
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight truncate">{p2.fullName}</h3>
                    <div className="mt-2 space-y-2">
                      <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-right w-full max-w-[min(100%,280px)] ml-auto">
                        <div className="text-[9px] uppercase tracking-[0.2em] text-white/45 font-semibold">Total score</div>
                        <div className="flex items-baseline gap-2 mt-0.5 justify-end">
                          <span className="text-2xl font-bold tabular-nums text-cyan-400 leading-none">
                            {Math.floor(p2.totalScore)}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">/ 100</span>
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 flex justify-end">{p2.checkInCount} check-ins</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-white/5 flex-row-reverse">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        data={[
                          { subject: "A", value: p2.goalAchievementScore, fullMark: 100 },
                          { subject: "Q", value: p2.qualityScore, fullMark: 100 },
                          { subject: "E", value: p2.engagementBehaviorScore, fullMark: 100 },
                        ]}
                      >
                        <PolarGrid
                          gridType="polygon"
                          radialLines
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth={1}
                        />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700 }}
                        />
                        <Radar
                          isAnimationActive
                          animationDuration={800}
                          dataKey="value"
                          stroke="rgba(34,211,238,0.85)"
                          strokeWidth={1.5}
                          fill="url(#colorCyanPreview)"
                          fillOpacity={1}
                        />
                        <defs>
                          <linearGradient id="colorCyanPreview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3 min-w-0 max-w-[200px]">
                    <EngagementMetricBar label="Achievement" value={p2.goalAchievementScore} color="cyan" isRight />
                    <EngagementMetricBar label="Quality" value={p2.qualityScore} color="cyan" isRight />
                    <EngagementMetricBar label="Engagement" value={p2.engagementBehaviorScore} color="cyan" isRight />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: maxObj }).map((_, i) => (
                  <PreviewObjectiveCard key={`pv2-${i}`} obj={p2.topObjectives[i]} isLeft={false} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-40 border-t border-white/10 bg-gradient-to-t from-black via-black/95 to-transparent">
          <motion.button
            type="button"
            disabled={isComparing}
            onClick={runAiComparison}
            whileTap={isComparing ? undefined : { scale: 0.98 }}
            className="w-full p-0 border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none"
          >
            <BorderGlow
              className="w-full"
              borderRadius={14}
              backgroundColor="#07070e"
              glowColor="160 70 45"
              colors={["#34d399", "#22d3ee", "#6ee7b7"]}
              glowIntensity={1.15}
              glowRadius={20}
              fillOpacity={0.22}
            >
              <div className="w-full flex items-center justify-center gap-2 py-3 font-semibold uppercase tracking-[0.2em] text-[10px] text-emerald-200/95 pointer-events-none">
                {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4 shrink-0" />}
                {isComparing ? "Evaluating…" : "Run AI eval"}
              </div>
            </BorderGlow>
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // -------------------------------------------------------------
  // EVAL PLAYBACK (post-AI)
  // -------------------------------------------------------------
  const HologramObjective = ({ obj, isActive, isLeft, badge }: { obj?: TopObjectiveEnhanced, isActive: boolean, isLeft: boolean, badge?: string }) => {
    const [expanded, setExpanded] = useState(false);
    const hasDetails = obj && obj.subObjectives && obj.subObjectives.length > 0;

    // Reset expansion map when round changes implicitly
    useEffect(() => {
      if (!isActive) setExpanded(false);
    }, [isActive]);

    if (!obj) return (
      <div className={`w-full h-24 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-105 opacity-80' : 'scale-95 opacity-20'}`}>
        <span className="text-[11px] sm:text-xs text-zinc-500 font-sans tracking-wide text-center px-3">— no objective bound —</span>
      </div>
    );

    const loadHint = objectiveLoadHint(obj);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isActive ? 1 : 0.4, y: 0, scale: isActive ? 1 : 0.96 }}
        transition={{ duration: 0.5, type: 'spring' }}
        // Completely redesigned to be structurally pure: dark backgrounds, subtle inner borders, incredibly sleek glass effect.
        // Replaced the thick colored AI-like borders with a stark, brutalist-cyber layout.
        className={`w-full transition-all duration-300 relative group overflow-hidden rounded-xl border
                ${isActive
            ? `bg-[#0a0a0c] border-[#222] shadow-2xl hover:bg-[#111115] ${hasDetails ? 'cursor-pointer' : ''}`
            : 'bg-[#050505] border-[#161616] pointer-events-none'
          }`}
        onClick={() => isActive && hasDetails && setExpanded(!expanded)}
      >
        {/* Subtle top-light rim effect for depth */}
        {isActive && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-30" />}

        <div className="flex items-start gap-4 p-4 md:p-6 relative z-10">
          <div className="relative shrink-0 w-12 h-12 flex items-center justify-center bg-[#070707] rounded-full shadow-inner ring-1 ring-[#1b1b1b]">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14.5" fill="none" className="stroke-[#111]" strokeWidth="2.5" />
              <motion.circle
                cx="18" cy="18" r="14.5" fill="none"
                className={isLeft ? "stroke-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"}
                strokeWidth="2.5" strokeDasharray="91.1"
                initial={{ strokeDashoffset: 91.1 }}
                animate={{ strokeDashoffset: isActive ? 91.1 - (91.1 * Math.min(100, Math.max(0, obj.personProgress)) / 100) : 91.1 }}
                transition={{ duration: 1.5, type: "spring", delay: 0.2 }}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-[10px] font-bold ${isLeft ? 'text-rose-400' : 'text-cyan-400'}`}>{isActive ? Math.floor(obj.personProgress) : '0'}</span>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            {badge && isActive && (
              <div className={`mb-2.5 space-y-1 ${isLeft ? '' : 'text-right'}`}>
                <div className="text-[11px] font-sans font-semibold text-zinc-500 leading-tight">
                  โน้ตสั้นจาก AI สำหรับรอบนี้
                </div>
                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -12 : 12, rotate: isLeft ? -4 : 4 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className={`inline-flex items-start gap-2 max-w-full px-3 py-2 rounded-lg border border-dashed ${isLeft ? 'border-rose-500/45 bg-rose-500/[0.07]' : 'border-cyan-400/45 bg-cyan-400/[0.07]'} ${isLeft ? '' : 'flex-row-reverse text-right'}`}
                >
                  <Terminal className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLeft ? 'text-rose-400' : 'text-cyan-400'}`} />
                  <span className={`text-[12px] sm:text-[13px] font-medium font-sans leading-snug ${isLeft ? 'text-rose-100' : 'text-cyan-100'}`}>
                    {badge}
                  </span>
                </motion.div>
              </div>
            )}
            <h4 className={`text-[15px] sm:text-base font-medium font-sans leading-relaxed ${isActive ? 'text-zinc-200 group-hover:text-white transition-colors' : 'text-zinc-600'} line-clamp-3`}>{obj.objectiveName}</h4>
            {isActive && (
              <p className="text-[11px] sm:text-xs font-sans text-zinc-500 mt-2 tracking-wide leading-relaxed">
                {loadHint.chip} · {loadHint.sub}
              </p>
            )}
          </div>

          {/* Accordion Arrow Indicator */}
          {isActive && hasDetails && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-transparent group-hover:border-zinc-800 transition-colors">
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: "spring", bounce: 0.3 }}>
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Accordion Expansion Body */}
        <AnimatePresence initial={false}>
          {expanded && isActive && hasDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 md:p-6 pt-0 border-t border-[#1a1a1a] bg-[#070709]">
                <div className="flex flex-col gap-3 mt-4">
                  {obj.subObjectives.map((detail, idx) => (
                    <div key={detail.objectiveId ?? idx} className="rounded-lg bg-[#0e0e11] border border-[#161616] p-3.5 space-y-3">
                      <div className={`flex items-start gap-3 ${isLeft ? "" : "flex-row-reverse text-right"}`}>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-mono tracking-wide uppercase text-zinc-500">Objective detail</div>
                          <div className="text-sm font-sans leading-relaxed text-zinc-300 mt-1">{detail.title}</div>
                        </div>
                        <span className={`text-xs font-bold font-mono ${isLeft ? 'text-rose-400' : 'text-cyan-400'} shrink-0 bg-black px-2.5 py-1 rounded-md border border-[#222]`}>
                          {Math.floor(detail.personProgress)}%
                        </span>
                      </div>

                      {detail.details.length > 0 && (
                        <div className="space-y-2">
                          {detail.details.map((kr, krIdx) => (
                            <div key={`${detail.objectiveId}-${krIdx}`} className="flex items-start gap-3 p-3 rounded-lg bg-[#111116] border border-[#1b1b1b]">
                              <Crosshair className={`w-4 h-4 shrink-0 mt-0.5 ${kr.krProgress >= 100 ? (isLeft ? 'text-rose-500' : 'text-cyan-400') : 'text-zinc-700'}`} />
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-sans leading-relaxed ${kr.krProgress >= 100 ? 'text-zinc-200' : 'text-zinc-400'}`}>{kr.krTitle}</div>
                                <div className="text-[11px] font-mono text-zinc-500 mt-1.5 tabular-nums">
                                  progress {kr.pointCurrent ?? 0}/{kr.pointOKR ?? 0}%
                                </div>
                              </div>
                              <span className={`text-xs font-bold font-mono ${isLeft ? 'text-rose-400' : 'text-cyan-400'} shrink-0 ml-2 bg-black px-2.5 py-1 rounded-md border border-[#222]`}>{Math.floor(kr.krProgress)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  };

  const ResultCounter = ({ value, label, isLeft }: { value: number, label: string, isLeft: boolean }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const duration = 2000;
      const incrementTime = 30;
      const steps = duration / incrementTime;
      const increment = value / steps;
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) { setCount(value); clearInterval(timer); }
        else { setCount(Math.ceil(start)); }
      }, incrementTime);
      return () => clearInterval(timer);
    }, [value]);

    return (
      <div className="flex items-end gap-2 shrink-0">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-4xl lg:text-6xl font-bold font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] ${isLeft ? 'text-rose-500' : 'text-cyan-400'}`}>
          {count}
        </motion.div>
        <span className="text-xs tracking-wide uppercase text-zinc-400 font-bold mb-2 hidden md:block font-sans">{label}</span>
      </div>
    );
  }

  const ShowdownArena = () => {
    const [phase, setPhase] = useState(1);
    // Phases: 0 = Intro, 1..N = Rounds, N+1 = Final Analysis

    if (!result || !p1 || !p2) return null;
    const totalRounds = Math.max(p1.topObjectives.length, p2.topObjectives.length) || 1;
    const isIntro = phase === 0;
    const isRound = phase > 0 && phase <= totalRounds;
    const isFinalResult = phase > totalRounds;

    const roundFromAi = isRound ? result.rounds?.[phase - 1] : undefined;
    const currentRoundData = isRound
      ? {
        commentary:
          typeof roundFromAi?.commentary === 'string' && roundFromAi.commentary.trim()
            ? roundFromAi.commentary
            : 'ไม่มีคำอธิบายรอบนี้ในผลลัพธ์จาก AI',
      }
      : null;
    const P1Winner = result.winner === p1.fullName;
    const P2Winner = result.winner === p2.fullName;

    return (
      <div className="w-full h-full min-h-[85vh] relative flex flex-col font-mono" style={{ perspective: "1500px" }}>
        <div className="relative z-40 w-full max-w-7xl mx-auto px-4 md:px-8 pt-2 flex justify-start shrink-0">
          <button
            type="button"
            onClick={resetState}
            className="inline-flex items-center gap-2.5 cursor-pointer rounded-xl border border-zinc-600/70 bg-zinc-950/90 px-4 py-2.5 font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] text-zinc-200 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            เลือกผู้เล่นใหม่
          </button>
        </div>

        {/* Dynamic Aura Background */}
        <div className={`absolute top-0 right-1/2 bottom-0 left-0 transition-opacity duration-1000 blur-[150px] mix-blend-screen pointer-events-none ${P1Winner && isFinalResult ? 'bg-rose-600/10' : 'bg-rose-900/5'}`} />
        <div className={`absolute top-0 right-0 bottom-0 left-1/2 transition-opacity duration-1000 blur-[150px] mix-blend-screen pointer-events-none ${P2Winner && isFinalResult ? 'bg-cyan-600/10' : 'bg-cyan-900/5'}`} />

        {/* Top Banner Context */}
        <motion.div layout className="w-full relative z-30 pt-6 px-4 shrink-0 flex flex-col items-center">
          <div className="bg-[#050505] border border-zinc-800/80 px-6 py-2.5 rounded-full mb-4 shadow-xl">
            {isIntro && <span className="text-sm uppercase tracking-[0.25em] font-bold text-white"><span className="animate-pulse mr-2 text-emerald-500"><Terminal className="w-4 h-4 inline" /></span> EVAL PASS · STARTED</span>}
            {isRound && <span className="text-sm uppercase tracking-[0.25em] font-bold text-amber-500/90"><span className="animate-ping mr-2 text-amber-400"><Cpu className="w-4 h-4 inline" /></span> OBJECTIVE {phase} / {totalRounds}</span>}
            {isFinalResult && <span className="text-sm uppercase tracking-[0.25em] font-bold text-white"><span className="mr-2 text-cyan-400"><Activity className="w-4 h-4 inline" /></span> EVAL COMPLETE</span>}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto min-h-[5.5rem] w-full flex items-start justify-center px-2">
              {isIntro && (
                <h2 className="text-lg md:text-2xl lg:text-3xl font-sans text-white font-semibold drop-shadow-xl leading-snug whitespace-pre-line text-center w-full max-w-3xl">
                  <TypewriterText text={result.intro_hype} speed={15} />
                </h2>
              )}
              {isRound && (
                <RoundDossier
                  phase={phase}
                  totalRounds={totalRounds}
                  text={currentRoundData!.commentary}
                />
              )}
              {isFinalResult && (
                <h2 className="text-sm md:text-base lg:text-lg font-sans text-white/90 font-medium drop-shadow-xl leading-relaxed px-2 whitespace-pre-line text-center w-full max-w-2xl">
                  <TypewriterText text={result.conclusion} speed={15} delay={100} />
                </h2>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* The STRICT 3D Grid Arena */}
        {/* Changed from flex to a strict 3-column grid to enforce absolute symmetry and prevent "eating center" */}
        <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_100px_minmax(0,1fr)] items-start justify-center px-4 md:px-8 pb-32 relative z-20 mt-8 gap-10 lg:gap-6">

          {/* P1 Hologram Side */}
          <motion.div
            layout
            initial={{ opacity: 0, rotateY: 30, x: -100 }}
            animate={{ opacity: 1, rotateY: isFinalResult ? 0 : 15, x: 0, scale: (P1Winner && isFinalResult) ? 1.02 : (isFinalResult ? 0.98 : 1) }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full flex flex-col bg-transparent"
          >
            {/* Info / Portrait Row */}
            <div className="flex items-center gap-6 mb-8 relative border-b border-zinc-800/50 pb-6 pr-4">
              <div className={`w-28 h-36 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-black border ${(P1Winner && isFinalResult) ? 'border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.2)]' : 'border-[#222]'} relative z-10 shrink-0 transition-all duration-700`}>
                {p1.pictureURL && <Image src={p1.pictureURL} alt={p1.fullName} fill className={`object-cover ${(!P1Winner && isFinalResult) ? 'grayscale opacity-70' : ''}`} unoptimized />}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-bold font-sans text-white tracking-tight truncate">{p1.fullName}</h3>
                <div className="text-rose-500/80 font-mono text-[10px] uppercase tracking-widest mt-1 mb-2">Total Score: {Math.floor(p1.totalScore)}</div>
                {P1Winner && isFinalResult && <div className="text-rose-500 font-bold uppercase tracking-widest text-xs mt-1 animate-pulse flex items-center gap-2"><Trophy className="w-4 h-4 shrink-0" /> Eval lead</div>}

                <AnimatePresence>
                  {isFinalResult && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-4">
                      <ResultCounter value={result.scoreA} label="SCORE" isLeft={true} />
                      <div className="hidden md:flex flex-col border-l border-zinc-800 pl-4 space-y-1.5">
                        <span className="text-[11px] text-zinc-400 tracking-wide uppercase font-bold font-sans">Total Check-ins</span>
                        <span className="text-white font-bold font-sans text-xl leading-none">{p1.checkInCount}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isFinalResult && (
                <div className="absolute right-2 top-2 w-40 h-40 opacity-70 pointer-events-none transition-opacity duration-1000">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="58%" data={[
                      { subject: `Goal ${Math.floor(p1.goalAchievementScore || 0)}`, value: p1.goalAchievementScore, fullMark: 100 },
                      { subject: `Quality ${Math.floor(p1.qualityScore || 0)}`, value: p1.qualityScore, fullMark: 100 },
                      { subject: `Engage ${Math.floor(p1.engagementBehaviorScore || 0)}`, value: p1.engagementBehaviorScore, fullMark: 100 }
                    ]}>
                      <PolarGrid gridType="polygon" radialLines={false} stroke="rgba(244,63,94,0.35)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: 'rgba(251,113,133,0.85)', fontWeight: 700, fontFamily: 'monospace' }} />
                      <Radar dataKey="value" stroke="#fb7185" strokeWidth={1.5} fill="#f43f5e" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* AI Final Analysis Block */}
            <AnimatePresence>
              {isFinalResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 overflow-hidden">
                  <div className="p-5 md:p-6 bg-gradient-to-tr from-[#0a0505] to-[#120505] border border-rose-900/30 rounded-xl text-base md:text-lg font-sans text-zinc-200 leading-relaxed">
                    <div className="text-xs tracking-wide text-rose-400 font-bold mb-3 uppercase flex items-center gap-2 font-sans"><Terminal className="w-3.5 h-3.5 shrink-0" /> สรุปจาก AI · alpha</div>
                    {result.playerA_strengths_weaknesses?.trim() ? (
                      <div className="whitespace-pre-line text-left text-[15px] md:text-base">
                        <TypewriterText text={result.playerA_strengths_weaknesses} speed={10} delay={500} />
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-sm leading-relaxed">โมเดลไม่ได้ส่งข้อความสรุปสำหรับผู้เล่นฝั่งนี้</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Objectives */}
            <div className="flex-1 space-y-4">
              <motion.div layout className="space-y-4">
                {Array.from({ length: totalRounds }).map((_, i) => {
                  const rb = result.rounds?.[i];
                  const p1Badge = typeof rb?.p1_badge === 'string' ? rb.p1_badge : undefined;
                  return (
                    <HologramObjective key={`p1-obj-${i}`} obj={p1.topObjectives[i]} isActive={isFinalResult ? true : phase === i + 1} isLeft={true} badge={p1Badge} />
                  );
                })}
              </motion.div>
            </div>
          </motion.div>

          {/* Middle Control Panel (Grid Item 2) */}
          <div className="w-full flex-col items-center justify-start relative my-4 lg:my-0 lg:pt-32 hidden lg:flex">
            <div className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-800 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
            <AnimatePresence mode="popLayout">
              {!isFinalResult ? (
                <motion.button
                  key="nextBTN" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setPhase(p => p + 1)}
                  className="relative z-30 w-16 h-16 cursor-pointer bg-[#0a0a0c] border border-zinc-700 hover:border-white rounded-full flex items-center justify-center shadow-2xl transition-colors group overflow-hidden"
                >
                  {isIntro ? <Terminal className="w-6 h-6 text-emerald-500/90 group-hover:text-emerald-300 transition-colors" /> : <ChevronRight className="w-8 h-8 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />}
                </motion.button>
              ) : (
                <motion.button
                  key="resetBTN" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={resetState}
                  className="relative z-30 w-16 h-16 cursor-pointer bg-[#0a0a0c] border border-zinc-800 hover:border-zinc-500 rounded-full flex items-center justify-center shadow-xl group"
                >
                  <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-200 transition-colors tracking-[0.15em] uppercase text-center block leading-tight font-sans">New<br />Run</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Middle Panel Backup */}
          <div className="w-full flex lg:hidden items-center justify-center relative mt-4">
            <AnimatePresence mode="popLayout">
              <motion.button
                onClick={!isFinalResult ? () => setPhase(p => p + 1) : resetState}
                className="px-8 py-3 cursor-pointer bg-[#111] border border-zinc-700 rounded-full text-xs font-bold tracking-widest text-white uppercase shadow-xl"
              >
                {!isFinalResult ? (isIntro ? 'START EVAL' : 'NEXT OBJECTIVE') : 'NEW RUN'}
              </motion.button>
            </AnimatePresence>
          </div>

          {/* P2 Hologram Side */}
          <motion.div
            layout
            initial={{ opacity: 0, rotateY: -30, x: 100 }}
            animate={{ opacity: 1, rotateY: isFinalResult ? 0 : -15, x: 0, scale: (P2Winner && isFinalResult) ? 1.02 : (isFinalResult ? 0.98 : 1) }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full flex flex-col bg-transparent"
          >
            {/* Info / Portrait Row */}
            <div className="flex items-center gap-6 mb-8 relative border-b border-zinc-800/50 pb-6 pl-4 flex-row-reverse">
              <div className={`w-28 h-36 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-black border ${(P2Winner && isFinalResult) ? 'border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.2)]' : 'border-[#222]'} relative z-10 shrink-0 transition-all duration-700`}>
                {p2.pictureURL && <Image src={p2.pictureURL} alt={p2.fullName} fill className={`object-cover ${(!P2Winner && isFinalResult) ? 'grayscale opacity-70' : ''}`} unoptimized />}
              </div>
              <div className="flex flex-col flex-1 min-w-0 items-end text-right">
                <h3 className="text-xl md:text-3xl font-bold font-sans text-white tracking-tight truncate">{p2.fullName}</h3>
                <div className="text-cyan-400/80 font-mono text-[10px] uppercase tracking-widest mt-1 mb-2">Total Score: {Math.floor(p2.totalScore)}</div>
                {P2Winner && isFinalResult && <div className="text-cyan-400 font-bold uppercase tracking-widest text-xs mt-1 animate-pulse flex items-center justify-end gap-2 text-right">Eval lead <Trophy className="w-4 h-4 shrink-0" /></div>}

                <AnimatePresence>
                  {isFinalResult && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center flex-row-reverse gap-4">
                      <ResultCounter value={result.scoreB} label="SCORE" isLeft={false} />
                      <div className="hidden md:flex flex-col border-r border-zinc-800 pr-4 space-y-1.5 items-end text-right">
                        <span className="text-[11px] text-zinc-400 tracking-wide uppercase font-bold font-sans">Total Check-ins</span>
                        <span className="text-white font-bold font-sans text-xl leading-none">{p2.checkInCount}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isFinalResult && (
                <div className="absolute left-2 top-2 w-40 h-40 opacity-70 pointer-events-none transition-opacity duration-1000">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="58%" data={[
                      { subject: `Goal ${Math.floor(p2.goalAchievementScore || 0)}`, value: p2.goalAchievementScore, fullMark: 100 },
                      { subject: `Quality ${Math.floor(p2.qualityScore || 0)}`, value: p2.qualityScore, fullMark: 100 },
                      { subject: `Engage ${Math.floor(p2.engagementBehaviorScore || 0)}`, value: p2.engagementBehaviorScore, fullMark: 100 }
                    ]}>
                      <PolarGrid gridType="polygon" radialLines={false} stroke="rgba(34,211,238,0.35)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: 'rgba(34,211,238,0.85)', fontWeight: 700, fontFamily: 'monospace' }} />
                      <Radar dataKey="value" stroke="#22d3ee" strokeWidth={1.5} fill="#06b6d4" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* AI Final Analysis Block */}
            <AnimatePresence>
              {isFinalResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 overflow-hidden">
                  <div className="p-5 md:p-6 bg-gradient-to-tl from-[#050a0a] to-[#050d12] border border-cyan-900/30 rounded-xl text-base md:text-lg font-sans text-zinc-200 leading-relaxed">
                    <div className="text-xs tracking-wide text-cyan-400 font-bold mb-3 uppercase flex items-center justify-end gap-2 font-sans">สรุปจาก AI · omega <Terminal className="w-3.5 h-3.5 shrink-0" /></div>
                    {result.playerB_strengths_weaknesses?.trim() ? (
                      <div className="whitespace-pre-line text-left text-[15px] md:text-base">
                        <TypewriterText text={result.playerB_strengths_weaknesses} speed={10} delay={500} />
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-sm leading-relaxed">โมเดลไม่ได้ส่งข้อความสรุปสำหรับผู้เล่นฝั่งนี้</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Objectives */}
            <div className="flex-1 space-y-4">
              <motion.div layout className="space-y-4">
                {Array.from({ length: totalRounds }).map((_, i) => {
                  const rb = result.rounds?.[i];
                  const p2Badge = typeof rb?.p2_badge === 'string' ? rb.p2_badge : undefined;
                  return (
                    <HologramObjective key={`p2-obj-${i}`} obj={p2.topObjectives[i]} isActive={isFinalResult ? true : phase === i + 1} isLeft={false} badge={p2Badge} />
                  );
                })}
              </motion.div>
            </div>
          </motion.div>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN TAB SHELL
  // -------------------------------------------------------------
  return (
    <div className="w-full bg-transparent min-h-[85vh] relative overflow-hidden scrollbar-hide pb-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_25%,rgba(244,63,94,0.14),transparent_60%),radial-gradient(90%_70%_at_85%_30%,rgba(34,211,238,0.14),transparent_60%),linear-gradient(to_bottom,rgba(8,8,12,0.96),transparent)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-20" />

      <div className="relative z-10 w-full h-full flex flex-col">
        <AnimatePresence mode="wait">
          {step === "select" && <SelectScreen key="select" />}
          {step === "preview" && <PreviewArena key="preview" />}
          {step === "result" && <ShowdownArena key="showdown" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
