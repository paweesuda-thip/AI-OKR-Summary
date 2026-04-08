import { useState, useEffect } from "react";
import Image from "next/image";
import { ContributorSum, ContributorSumObj, Objective, KrDetail } from "@/lib/types/okr";
import { Swords, Check, Crosshair, Hexagon, Fingerprint, Activity, Terminal, Zap, ChevronRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VersusModeProps {
  contributors: ContributorSum[];
  objectives: Objective[];
}

type Step = "select" | "animating" | "result";

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

type TopObjectiveEnhanced = ContributorSumObj & {
  actualDetails?: KrDetail[];
};

type PlayerEnhanced = ContributorSum & {
  topObjectives: TopObjectiveEnhanced[];
};

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

export default function VersusMode({ contributors, objectives }: VersusModeProps) {
  const [step, setStep] = useState<Step>("select");
  const [p1, setP1] = useState<PlayerEnhanced | null>(null);
  const [p2, setP2] = useState<PlayerEnhanced | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  
  const validContributors: PlayerEnhanced[] = contributors
    .filter(c => c.fullName && c.objectives && c.objectives.length > 0)
    .map(c => {
        const topObjs = [...c.objectives].sort((a, b) => b.progress - a.progress).slice(0, 3).map(obj => {
           const actualDetails = objectives.find(o => o.objectiveId === obj.objectiveId)
               ?.subObjectives.flatMap(so => so.details)
               .filter(kr => kr.fullName === c.fullName) || [];
           return { ...obj, actualDetails };
        });
        return { ...c, topObjectives: topObjs };
    });

  const resetState = () => {
    setStep("select");
    setP1(null);
    setP2(null);
    setResult(null);
  };

  const startBattle = async () => {
    if (!p1 || !p2) return;
    setStep("animating");

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerA: p1, playerB: p2 })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data);
      setTimeout(() => setStep("result"), 2500); 

    } catch (error) {
      console.error(error);
      setResult({
        winner: "Tie",
        scoreA: 50, scoreB: 50,
        intro_hype: "CRITICAL FAILURE // PROTOCOL OVERRIDE",
        rounds: [
            { roundNumber: 1, p1_badge: "ERR", p2_badge: "ERR", commentary: "System corrupted." }
        ],
        playerA_strengths_weaknesses: "DATA_CORRUPTED",
        playerB_strengths_weaknesses: "DATA_CORRUPTED",
        conclusion: "Simultaneous system failure detected."
      });
      setTimeout(() => setStep("result"), 1500);
    }
  };

  // -------------------------------------------------------------
  // SELECT SCREEN
  // -------------------------------------------------------------
  const SelectScreen = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
      className="w-full min-h-[70vh] flex flex-col items-center pt-8 pb-16 px-4 font-mono relative"
    >
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-red-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="mb-16 text-center relative z-10 w-full flex flex-col items-center">
            <motion.div animate={{ scale: [1, 1.2, 1], filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"] }} transition={{ duration: 4, repeat: Infinity }}>
                <Fingerprint className="w-12 h-12 text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
                ENGAGE TARGETS
            </h2>
            <div className="w-[2px] h-16 bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-transparent mt-6 mb-2" />
        </div>

        <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-8 items-stretch justify-center relative z-10">
            {/* P1 Roster */}
            <div className="flex-1 flex flex-col bg-transparent relative">
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-sm tracking-widest text-rose-500 font-bold uppercase flex items-center gap-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                        <Crosshair className="w-4 h-4" /> ALPHA_SQUAD
                    </span>
                    <span className="text-[10px] text-white/50 bg-black/50 border border-zinc-800 px-3 py-1 rounded-full backdrop-blur-md">{validContributors.length} AVAILABLE</span>
                </div>
                
                <div className="flex-1 max-h-[500px] overflow-y-auto px-2 pb-10 scrollbar-hide">
                    <div className="flex flex-col gap-3">
                        {validContributors.map((c, i) => {
                            const isSelected = p1?.fullName === c.fullName;
                            const isPickedByOther = p2?.fullName === c.fullName;
                            return (
                                <motion.button 
                                    whileHover={!isPickedByOther ? { scale: 1.02, x: 10 } : {}} whileTap={!isPickedByOther ? { scale: 0.98 } : {}}
                                    key={i} onClick={() => !isPickedByOther && setP1(c)} disabled={isPickedByOther}
                                    className={`relative flex items-center gap-5 p-3 overflow-hidden group transition-all duration-300 rounded-[20px]
                                        ${isSelected ? 'bg-gradient-to-r from-rose-950/80 to-zinc-950 border-[2px] border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]' : 
                                          isPickedByOther ? 'opacity-15 grayscale pointer-events-none' : 
                                          'bg-black/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700 backdrop-blur-md'}
                                    `}
                                >
                                    <div className={`relative w-16 h-16 rounded-[14px] overflow-hidden shrink-0 bg-zinc-950 ${isSelected ? 'shadow-[0_0_20px_rgba(244,63,94,0.6)] ring-2 ring-rose-500' : ''}`}>
                                        {c.pictureURL ? (
                                            <Image src={c.pictureURL} alt={c.fullName} fill className={`object-cover object-center ${isSelected ? 'scale-110 transition-transform duration-500' : 'grayscale group-hover:grayscale-0 transition-all'}`} unoptimized sizes="64px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-600">{c.fullName[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left flex flex-col justify-center">
                                        <div className={`text-base truncate max-w-[200px] font-sans ${isSelected ? 'text-white font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-zinc-300 font-medium tracking-wider group-hover:text-white transition-colors'}`}>{c.fullName}</div>
                                        <div className="text-[10px] font-sans font-bold text-rose-500/80 tracking-widest uppercase mt-1 flex items-center gap-2">
                                            POWER LEVEL <span className="text-white text-xs px-1.5 py-0.5 bg-rose-500/20 rounded">{c.avgObjectiveProgress.toFixed(0)}</span>
                                        </div>
                                    </div>
                                    {isSelected && <Zap className="w-6 h-6 text-rose-400 absolute right-4 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Execute Button */}
            <div className="flex flex-col justify-center items-center lg:w-40 shrink-0 z-20 py-8 lg:py-0">
                <AnimatePresence mode="popLayout">
                    {p1 && p2 ? (
                        <motion.button 
                            initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.15, textShadow: "0px 0px 15px rgba(255,255,255,1)" }} whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            onClick={startBattle}
                            className="w-32 h-32 rounded-full border-2 border-white flex flex-col items-center justify-center bg-gradient-to-tr from-rose-600 via-purple-600 to-cyan-500 text-white shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:shadow-[0_0_100px_rgba(168,85,247,1)] transition-all duration-300 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
                            <Terminal className="w-8 h-8 mb-1 group-hover:-translate-y-1 transition-transform relative z-10" />
                            <span className="text-xs tracking-widest font-bold relative z-10">BATTLE</span>
                        </motion.button>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                           <Hexagon className="w-20 h-20 text-zinc-800 stroke-[0.5] animate-spin-slow drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* P2 Roster */}
             <div className="flex-1 flex flex-col bg-transparent relative">
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] text-white/50 bg-black/50 border border-zinc-800 px-3 py-1 rounded-full backdrop-blur-md">{validContributors.length} AVAILABLE</span>
                    <span className="text-sm tracking-widest text-cyan-400 font-bold uppercase flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                        OMEGA_SQUAD <Crosshair className="w-4 h-4" />
                    </span>
                </div>
                
                <div className="flex-1 max-h-[500px] overflow-y-auto px-2 pb-10 scrollbar-hide">
                    <div className="flex flex-col gap-3">
                        {validContributors.map((c, i) => {
                            const isSelected = p2?.fullName === c.fullName;
                            const isPickedByOther = p1?.fullName === c.fullName;
                            return (
                                <motion.button 
                                    whileHover={!isPickedByOther ? { scale: 1.02, x: -10 } : {}} whileTap={!isPickedByOther ? { scale: 0.98 } : {}}
                                    key={i} onClick={() => !isPickedByOther && setP2(c)} disabled={isPickedByOther}
                                    className={`relative flex items-center gap-5 p-3 overflow-hidden group transition-all duration-300 flex-row-reverse rounded-[20px]
                                        ${isSelected ? 'bg-gradient-to-l from-cyan-950/80 to-zinc-950 border-[2px] border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.3)]' : 
                                          isPickedByOther ? 'opacity-15 grayscale pointer-events-none' : 
                                          'bg-black/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700 backdrop-blur-md'}
                                    `}
                                >
                                    <div className={`relative w-16 h-16 rounded-[14px] overflow-hidden shrink-0 bg-zinc-950 ${isSelected ? 'shadow-[0_0_20px_rgba(34,211,238,0.6)] ring-2 ring-cyan-400' : ''}`}>
                                        {c.pictureURL ? (
                                            <Image src={c.pictureURL} alt={c.fullName} fill className={`object-cover object-center ${isSelected ? 'scale-110 transition-transform duration-500' : 'grayscale group-hover:grayscale-0 transition-all'}`} unoptimized sizes="64px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-600">{c.fullName[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-right flex flex-col justify-center">
                                        <div className={`text-base truncate max-w-[200px] inline-block font-sans ${isSelected ? 'text-white font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-zinc-300 font-medium tracking-wider group-hover:text-white transition-colors'}`}>{c.fullName}</div>
                                        <div className="text-[10px] font-sans font-bold text-cyan-500/80 tracking-widest uppercase mt-1 flex items-center justify-end gap-2">
                                            <span className="text-white text-xs px-1.5 py-0.5 bg-cyan-500/20 rounded">{c.avgObjectiveProgress.toFixed(0)}</span> POWER LEVEL
                                        </div>
                                    </div>
                                    {isSelected && <Zap className="w-6 h-6 text-cyan-400 absolute left-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );

  // -------------------------------------------------------------
  // LOADING SCREEN
  // -------------------------------------------------------------
  const LoadingBattleScreen = () => (
      <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "brightness(3) blur(20px)" }} transition={{ duration: 0.6 }} className="w-full h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-black font-mono">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,128,0.2)_0%,transparent_50%),radial-gradient(ellipse_at_center,rgba(0,255,255,0.2)_0%,transparent_50%)] animate-pulse" />
         <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
             <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 1.5, ease: "anticipate" }} className="relative w-56 h-56 border-2 border-dashed border-white rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                 <div className="absolute inset-4 border-[4px] border-t-rose-500 border-b-cyan-500 border-l-transparent border-r-transparent rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
                 <Swords className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)]" />
             </motion.div>
             <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                 <div className="text-2xl font-bold font-sans tracking-widest text-white drop-shadow-md flex items-center gap-6">
                     <span className="text-rose-500">{p1?.fullName}</span>
                     <span className="text-white font-mono text-sm">V.S.</span>
                     <span className="text-cyan-400">{p2?.fullName}</span>
                 </div>
                 <div className="text-xs text-white/50 tracking-[1em] uppercase animate-pulse">Running Combat Simulation</div>
             </motion.div>
         </div>
      </motion.div>
  );

  // -------------------------------------------------------------
  // 3D SHOWDOWN ARENA
  // -------------------------------------------------------------
  const HologramObjective = ({ obj, isActive, isLeft, badge }: { obj?: TopObjectiveEnhanced, isActive: boolean, isLeft: boolean, badge?: string }) => {
      if (!obj) return (
          <div className={`w-full h-32 border border-zinc-800 border-dashed rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-105 shadow-xl opacity-80' : 'scale-95 opacity-20'}`}>
             <span className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Unarmed Guard</span>
          </div>
      );

      return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: isActive ? 1 : 0.4, y: 0, scale: isActive ? 1.05 : 0.95 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className={`w-full p-4 md:p-6 bg-black/60 backdrop-blur-md rounded-2xl border transition-all duration-500 shadow-2xl relative overflow-hidden group
                ${isLeft 
                    ? isActive ? 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.2)]' : 'border-rose-900/40'
                    : isActive ? 'border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.2)]' : 'border-cyan-900/40'
                }`}
          >
              {isActive && <div className={`absolute top-0 left-0 w-full h-1 ${isLeft ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)]' : 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]'} animate-pulse`} />}
              
              <div className="flex gap-4 items-start relative z-10">
                  <div className="relative shrink-0 w-12 h-12 flex items-center justify-center bg-black rounded-full shadow-inner shadow-black/80 ring-1 ring-zinc-800">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-zinc-800/50" strokeWidth="3" />
                          <motion.circle 
                              cx="18" cy="18" r="15.5" fill="none" 
                              className={isLeft ? "stroke-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,1)]" : "stroke-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,1)]"} 
                              strokeWidth="3" strokeDasharray="100" 
                              initial={{ strokeDashoffset: 100 }}
                              animate={{ strokeDashoffset: isActive ? 100 - Math.min(100, Math.max(0, obj.progress)) : 100 }}
                              transition={{ duration: 1.5, type: "spring", delay: 0.2 }}
                              strokeLinecap="round"
                          />
                      </svg>
                      <span className={`absolute text-[10px] font-bold ${isLeft ? 'text-rose-400' : 'text-cyan-400'}`}>{isActive ? obj.progress.toFixed(0) : '0'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                      {badge && isActive && (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-2 border ${isLeft ? 'bg-rose-500/10 border-rose-500/30' : 'bg-cyan-400/10 border-cyan-400/30'}`}>
                             <span className={`w-1 h-1 rounded-full ${isLeft ? 'bg-rose-500' : 'bg-cyan-400'} animate-ping`} />
                             <span className={`text-[9px] font-bold uppercase tracking-widest font-sans ${isLeft ? 'text-rose-400' : 'text-cyan-400'}`}>{badge}</span>
                          </motion.div>
                      )}
                      {/* Enforce font-sans for Thai Readability */}
                      <h4 className={`text-xs font-bold font-sans ${isActive ? 'text-white' : 'text-zinc-500'} leading-snug line-clamp-2`}>{obj.objectiveName}</h4>
                      
                      {isActive && obj.actualDetails && obj.actualDetails.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 flex flex-col gap-1.5 border-t border-zinc-900/50 pt-3">
                              {obj.actualDetails.map((kr, idx) => (
                                 <div key={idx} className="flex items-start gap-2">
                                     <Crosshair className={`w-3 h-3 shrink-0 mt-0.5 ${kr.krProgress >= 100 ? (isLeft ? 'text-rose-500' : 'text-cyan-400') : 'text-zinc-600'}`} />
                                     {/* Enforce font-sans for Thai Readability inside specific KR */}
                                     <div className={`text-[10px] font-sans leading-tight ${kr.krProgress >= 100 ? 'text-zinc-300' : 'text-zinc-500'}`}>{kr.krTitle}</div>
                                 </div>
                              ))}
                          </motion.div>
                      )}
                  </div>
              </div>
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
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-4xl lg:text-6xl font-bold font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${isLeft ? 'text-rose-500' : 'text-cyan-400'}`}>
                  {count}
              </motion.div>
              <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold mb-2 hidden md:block">{label}</span>
          </div>
      );
  }

  const ShowdownArena = () => {
      const [phase, setPhase] = useState(0); 
      // Phases: 0 = Intro, 1..N = Rounds, N+1 = Final Analysis
      
      if (!result || !p1 || !p2) return null;
      const totalRounds = result.rounds?.length || 0;
      const isIntro = phase === 0;
      const isRound = phase > 0 && phase <= totalRounds;
      const isFinalResult = phase > totalRounds;

      const currentRoundData = isRound ? result.rounds[phase - 1] : null;
      const P1Winner = result.winner === p1.fullName;
      const P2Winner = result.winner === p2.fullName;

      return (
          <div className="w-full h-full min-h-[85vh] relative flex flex-col font-mono" style={{ perspective: "1500px" }}>
              {/* Dynamic Aura Background */}
              <div className={`absolute top-0 right-1/2 bottom-0 left-0 transition-opacity duration-1000 blur-[150px] mix-blend-screen pointer-events-none ${P1Winner && isFinalResult ? 'bg-rose-600/20' : 'bg-rose-900/5'}`} />
              <div className={`absolute top-0 right-0 bottom-0 left-1/2 transition-opacity duration-1000 blur-[150px] mix-blend-screen pointer-events-none ${P2Winner && isFinalResult ? 'bg-cyan-600/20' : 'bg-cyan-900/5'}`} />

              {/* Top Banner Context */}
              <motion.div layout className="w-full relative z-30 pt-6 px-4 shrink-0 flex flex-col items-center">
                   <div className="bg-black/50 border border-zinc-800/50 backdrop-blur-lg px-6 py-2 rounded-full mb-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                       {isIntro && <span className="text-xs uppercase tracking-[0.3em] font-bold text-white"><span className="animate-pulse mr-2 text-rose-500">🔴</span> COMBAT SEQUENCE INITIATED</span>}
                       {isRound && <span className="text-xs uppercase tracking-[0.3em] font-bold text-yellow-500"><span className="animate-ping mr-2 text-yellow-500">⚡</span> ROUND {phase} OF {totalRounds}</span>}
                       {isFinalResult && <span className="text-xs uppercase tracking-[0.3em] font-bold text-white"><span className="mr-2 text-cyan-400"><Activity className="w-4 h-4 inline" /></span> SEQUENCE CONCLUDED</span>}
                   </div>
                   
                   <AnimatePresence mode="wait">
                       <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center max-w-4xl mx-auto min-h-[5rem] flex items-center justify-center">
                           {isIntro && <h2 className="text-xl md:text-3xl font-sans text-white font-medium drop-shadow-xl"><TypewriterText text={result.intro_hype} speed={15} /></h2>}
                           {isRound && <p className="text-sm md:text-lg font-sans text-zinc-300 leading-relaxed font-bold pl-4 text-center"><TypewriterText text={currentRoundData!.commentary} speed={15} delay={100} /></p>}
                           {isFinalResult && <h2 className="text-xl md:text-2xl font-sans text-white font-medium drop-shadow-xl px-4"><TypewriterText text={result.conclusion} speed={15} delay={100} /></h2>}
                       </motion.div>
                   </AnimatePresence>
              </motion.div>

              {/* The 3D Grid Arena */}
              <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center px-2 md:px-12 pb-24 relative z-20 mt-8 gap-4 lg:gap-0">
                  {/* P1 Hologram Side */}
                  <motion.div 
                     layout
                     initial={{ opacity: 0, rotateY: 30, x: -100 }} animate={{ opacity: 1, rotateY: isFinalResult ? 0 : 15, x: 0, scale: (P1Winner && isFinalResult) ? 1.05 : (isFinalResult ? 0.95 : 1) }} transition={{ type: "spring", damping: 20 }}
                     className={`w-full lg:flex-1 flex flex-col bg-zinc-950/40 backdrop-blur-md border ${P1Winner && isFinalResult ? 'border-rose-500 shadow-[0_0_100px_rgba(244,63,94,0.3)]' : 'border-zinc-800/50'} rounded-[32px] p-6`}
                  >
                      {/* Info / Portrait Row */}
                      <div className="flex items-center gap-6 mb-8 relative border-b border-zinc-800/50 pb-6">
                          <div className={`w-24 h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-black border-2 ${(P1Winner && isFinalResult) ? 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)]' : 'border-zinc-800'} relative z-10 shrink-0 transition-all duration-700`}>
                              {p1.pictureURL && <Image src={p1.pictureURL} alt={p1.fullName} fill className={`object-cover ${(!P1Winner && isFinalResult) ? 'grayscale opacity-70' : ''}`} unoptimized />}
                          </div>
                          <div className="flex flex-col flex-1">
                              <h3 className="text-xl md:text-3xl font-bold font-sans text-white tracking-tight drop-shadow-md">{p1.fullName}</h3>
                              {P1Winner && isFinalResult && <div className="text-rose-500 font-bold uppercase tracking-widest text-xs mt-2 animate-pulse flex items-center gap-2"><Trophy className="w-4 h-4" /> Grand Victor</div>}
                              
                              {/* Re-designed Final Score Block (Doesn't cover face) */}
                              <AnimatePresence>
                                  {isFinalResult && (
                                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 flex items-center gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50">
                                          <ResultCounter value={result.scoreA} label="SCORE" isLeft={true} />
                                          <div className="hidden md:flex flex-col border-l border-zinc-800 pl-4 space-y-1">
                                              <span className="text-[10px] text-zinc-500 tracking-widest uppercase font-bold">Total Check-ins</span>
                                              <span className="text-white font-bold font-sans">{p1.checkInCount}</span>
                                          </div>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>

                      {/* AI Final Analysis Block */}
                      <AnimatePresence>
                        {isFinalResult && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-sm font-sans text-white/90 leading-relaxed shadow-inner">
                                <div className="text-[10px] tracking-widest text-rose-500 font-bold mb-2 uppercase flex items-center gap-2"><Crosshair className="w-3 h-3" /> Alpha Strength Analysis</div>
                                <TypewriterText text={result.playerA_strengths_weaknesses} speed={10} delay={500} />
                            </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Display Objectives sequentially or ALL if final */}
                      <div className="flex-1 space-y-4">
                            <motion.div layout className="space-y-4">
                                {Array.from({ length: totalRounds }).map((_, i) => (
                                    <HologramObjective key={`p1-obj-${i}`} obj={p1.topObjectives[i]} isActive={isFinalResult ? true : phase === i + 1} isLeft={true} badge={result.rounds?.[i]?.p1_badge} />
                                ))}
                            </motion.div>
                      </div>
                  </motion.div>

                  {/* Middle Control Panel */}
                  <div className="w-full lg:w-24 shrink-0 flex flex-col items-center justify-center relative translate-z-20 my-4 lg:my-0 lg:py-20 h-24 lg:h-auto">
                      <div className="hidden lg:block absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                      
                      <AnimatePresence mode="popLayout">
                          {!isFinalResult ? (
                              <motion.button 
                                  key="nextBTN" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} whileHover={{ scale: 1.1, textShadow: "0 0 8px white" }} whileTap={{ scale: 0.95 }}
                                  onClick={() => setPhase(p => p + 1)}
                                  className="relative z-30 w-16 h-16 md:w-20 md:h-20 bg-black border-2 border-white rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)] group overflow-hidden"
                              >
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {isIntro ? <Swords className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" /> : <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md group-hover:translate-x-1 lg:group-hover:translate-x-2 transition-transform" /> }
                              </motion.button>
                          ) : (
                              <motion.button 
                                  key="resetBTN" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                  onClick={resetState}
                                  className="relative z-30 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-zinc-800 to-black border-2 border-zinc-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] group"
                              >
                                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors tracking-widest uppercase text-center block leading-tight">New<br/>Match</span>
                              </motion.button>
                          )}
                      </AnimatePresence>
                  </div>

                  {/* P2 Hologram Side */}
                  <motion.div 
                     layout
                     initial={{ opacity: 0, rotateY: -30, x: 100 }} animate={{ opacity: 1, rotateY: isFinalResult ? 0 : -15, x: 0, scale: (P2Winner && isFinalResult) ? 1.05 : (isFinalResult ? 0.95 : 1) }} transition={{ type: "spring", damping: 20 }}
                     className={`w-full lg:flex-1 flex flex-col bg-zinc-950/40 backdrop-blur-md border ${P2Winner && isFinalResult ? 'border-cyan-400 shadow-[0_0_100px_rgba(34,211,238,0.3)]' : 'border-zinc-800/50'} rounded-[32px] p-6`}
                  >
                      {/* Info / Portrait Row */}
                      <div className="flex items-center gap-6 mb-8 relative border-b border-zinc-800/50 pb-6 flex-row-reverse">
                          <div className={`w-24 h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-black border-2 ${(P2Winner && isFinalResult) ? 'border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.5)]' : 'border-zinc-800'} relative z-10 shrink-0 transition-all duration-700`}>
                              {p2.pictureURL && <Image src={p2.pictureURL} alt={p2.fullName} fill className={`object-cover ${(!P2Winner && isFinalResult) ? 'grayscale opacity-70' : ''}`} unoptimized />}
                          </div>
                          <div className="flex flex-col flex-1 items-end text-right">
                              <h3 className="text-xl md:text-3xl font-bold font-sans text-white tracking-tight drop-shadow-md">{p2.fullName}</h3>
                              {P2Winner && isFinalResult && <div className="text-cyan-400 font-bold uppercase tracking-widest text-xs mt-2 animate-pulse flex items-center justify-end gap-2 text-right">Grand Victor <Trophy className="w-4 h-4" /></div>}
                              
                              {/* Re-designed Final Score Block (Doesn't cover face) */}
                              <AnimatePresence>
                                  {isFinalResult && (
                                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 flex items-center flex-row-reverse gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50">
                                          <ResultCounter value={result.scoreB} label="SCORE" isLeft={false} />
                                          <div className="hidden md:flex flex-col border-r border-zinc-800 pr-4 space-y-1 items-end text-right">
                                              <span className="text-[10px] text-zinc-500 tracking-widest uppercase font-bold">Total Check-ins</span>
                                              <span className="text-white font-bold font-sans">{p2.checkInCount}</span>
                                          </div>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>

                      {/* AI Final Analysis Block */}
                      <AnimatePresence>
                        {isFinalResult && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-2xl text-sm font-sans text-white/90 leading-relaxed shadow-inner text-right">
                                <div className="text-[10px] tracking-widest text-cyan-400 font-bold mb-2 uppercase flex items-center justify-end gap-2">Omega Strength Analysis <Crosshair className="w-3 h-3" /></div>
                                <TypewriterText text={result.playerB_strengths_weaknesses} speed={10} delay={500} />
                            </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Display Objectives sequentially or ALL if final */}
                      <div className="flex-1 space-y-4">
                            <motion.div layout className="space-y-4">
                                {Array.from({ length: totalRounds }).map((_, i) => (
                                    <HologramObjective key={`p2-obj-${i}`} obj={p2.topObjectives[i]} isActive={isFinalResult ? true : phase === i + 1} isLeft={false} badge={result.rounds?.[i]?.p2_badge} />
                                ))}
                            </motion.div>
                      </div>
                  </motion.div>

              </div>
              
              {/* Context Action Overlay */}
              <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-50">
                  {!isFinalResult && <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] animate-pulse">Awaiting Evaluator Input...</p>}
              </div>
          </div>
      );
  }

  // -------------------------------------------------------------
  // RENDER MAIN TAB SHELL
  // -------------------------------------------------------------
  return (
      <div className="w-full bg-[#0a0a0b] min-h-[85vh] rounded-[40px] relative overflow-hidden scrollbar-hide border border-zinc-900 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none fixed" />
          
          <div className="w-full h-full pt-8 pb-10 flex flex-col">
             <AnimatePresence mode="wait">
                 {step === "select" && <SelectScreen key="select" />}
                 {step === "animating" && <LoadingBattleScreen key="loading" />}
                 {step === "result" && <ShowdownArena key="showdown" />}
             </AnimatePresence>
          </div>
      </div>
  );
}
