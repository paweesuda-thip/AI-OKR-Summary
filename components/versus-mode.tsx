import { useState, useEffect } from "react";
import Image from "next/image";
import { ContributorSum, ContributorSumObj, Objective, KrDetail } from "@/lib/types/okr";
import { Swords, Check, Crosshair, Hexagon, Fingerprint, Activity, Terminal, Zap, ChevronRight, Trophy, ChevronDown } from "lucide-react";
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
        let totalPersonalProgress = 0;
        let validObjCount = 0;

        const topObjs = [...c.objectives].map(obj => {
           const actualDetails = objectives.find(o => o.objectiveId === obj.objectiveId)
               ?.subObjectives.flatMap(so => so.details)
               .filter(kr => kr.fullName === c.fullName) || [];
           
           const validKrs = actualDetails.filter(kr => kr.krProgress !== undefined);
           const personalObjProgress = validKrs.length > 0 
               ? validKrs.reduce((acc, kr) => acc + kr.krProgress, 0) / validKrs.length 
               : obj.progress;

           totalPersonalProgress += personalObjProgress;
           validObjCount++;

           return { ...obj, progress: personalObjProgress, actualDetails };
        }).sort((a, b) => b.progress - a.progress);

        const newAvg = validObjCount > 0 ? (totalPersonalProgress / validObjCount) : c.avgObjectiveProgress;

        return { ...c, avgObjectiveProgress: newAvg, topObjectives: topObjs };
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
                STATIO BATTLES
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
                
                <div className="flex-1 max-h-[500px] overflow-y-auto px-4 -mx-4 pb-10 pt-4 -mt-4 scrollbar-hide py-2">
                    <div className="flex flex-col gap-3">
                        {validContributors.map((c, i) => {
                            const isSelected = p1?.fullName === c.fullName;
                            const isPickedByOther = p2?.fullName === c.fullName;
                            return (
                                <motion.button 
                                    whileHover={!isPickedByOther ? { scale: 1.03 } : {}} whileTap={!isPickedByOther ? { scale: 0.98 } : {}}
                                    key={i} onClick={() => !isPickedByOther && setP1(c)} disabled={isPickedByOther}
                                    className={`relative flex items-center gap-5 p-3 group transition-all duration-300 rounded-[20px]
                                        ${isSelected ? 'bg-gradient-to-r from-[#1a050a] to-[#0a0a0c] border border-rose-500/50 shadow-[0_4px_30px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20' : 
                                          isPickedByOther ? 'opacity-15 grayscale pointer-events-none' : 
                                          'bg-[#0a0a0c] hover:bg-[#111115] border border-[#1a1a1a] hover:border-[#333] shadow-lg'}
                                    `}
                                >
                                    <div className={`relative w-16 h-16 rounded-[14px] overflow-hidden shrink-0 bg-zinc-950 ${isSelected ? 'shadow-[0_0_20px_rgba(244,63,94,0.4)] ring-1 ring-rose-500/50' : ''}`}>
                                        {c.pictureURL ? (
                                            <Image src={c.pictureURL} alt={c.fullName} fill className={`object-cover object-center ${isSelected ? 'scale-110 transition-transform duration-500' : 'grayscale group-hover:grayscale-0 transition-all'}`} unoptimized sizes="64px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-600">{c.fullName[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left flex flex-col justify-center">
                                        <div className={`text-base truncate max-w-[200px] font-sans ${isSelected ? 'text-white font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-zinc-300 font-medium tracking-wider group-hover:text-white transition-colors'}`}>{c.fullName}</div>
                                        <div className="text-[10px] font-sans font-bold text-rose-500/80 tracking-widest uppercase mt-1 flex items-center gap-2">
                                            POWER LEVEL <span className="text-white text-xs px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded">{c.avgObjectiveProgress.toFixed(0)}</span>
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
            <div className="flex flex-col justify-center items-center lg:w-48 shrink-0 z-20 py-12 lg:py-0">
                <AnimatePresence mode="popLayout">
                    {p1 && p2 ? (
                        <motion.button 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onClick={startBattle}
                            className="group relative flex items-center justify-center w-40 h-12 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-cyan-500 p-[1px]"
                            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
                        >
                            {/* Inner Dark Background */}
                            <div 
                                className="w-full h-full bg-[#050505] flex items-center justify-center transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-rose-500/20 group-hover:to-cyan-500/20 relative z-10"
                                style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
                            >
                                <span className="text-xs font-black uppercase tracking-[0.3em] font-sans text-white flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
                                    <Swords className="w-4 h-4" /> BATTLE
                                </span>
                            </div>

                            {/* Background Ambient Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-cyan-500 opacity-30 group-hover:opacity-100 blur-lg transition-opacity duration-300 pointer-events-none" />
                        </motion.button>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-12 relative w-full">
                           <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent absolute top-1/2 -translate-y-1/2" />
                           <Hexagon className="w-6 h-6 text-zinc-700 bg-[#0a0a0b] relative z-10 animate-spin-slow" />
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
                
                <div className="flex-1 max-h-[500px] overflow-y-auto px-4 -mx-4 pb-10 pt-4 -mt-4 scrollbar-hide py-2">
                    <div className="flex flex-col gap-3">
                        {validContributors.map((c, i) => {
                            const isSelected = p2?.fullName === c.fullName;
                            const isPickedByOther = p1?.fullName === c.fullName;
                            return (
                                <motion.button 
                                    whileHover={!isPickedByOther ? { scale: 1.03 } : {}} whileTap={!isPickedByOther ? { scale: 0.98 } : {}}
                                    key={i} onClick={() => !isPickedByOther && setP2(c)} disabled={isPickedByOther}
                                    className={`relative flex items-center gap-5 p-3 flex-row-reverse group transition-all duration-300 rounded-[20px]
                                        ${isSelected ? 'bg-gradient-to-l from-[#050910] to-[#0a0a0c] border border-cyan-400/50 shadow-[0_4px_30px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/20' : 
                                          isPickedByOther ? 'opacity-15 grayscale pointer-events-none' : 
                                          'bg-[#0a0a0c] hover:bg-[#111115] border border-[#1a1a1a] hover:border-[#333] shadow-lg'}
                                    `}
                                >
                                    <div className={`relative w-16 h-16 rounded-[14px] overflow-hidden shrink-0 bg-zinc-950 ${isSelected ? 'shadow-[0_0_20px_rgba(34,211,238,0.4)] ring-1 ring-cyan-400/50' : ''}`}>
                                        {c.pictureURL ? (
                                            <Image src={c.pictureURL} alt={c.fullName} fill className={`object-cover object-center ${isSelected ? 'scale-110 transition-transform duration-500' : 'grayscale group-hover:grayscale-0 transition-all'}`} unoptimized sizes="64px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-600">{c.fullName[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-right flex flex-col justify-center">
                                        <div className={`text-base truncate max-w-[200px] inline-block font-sans ${isSelected ? 'text-white font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-zinc-300 font-medium tracking-wider group-hover:text-white transition-colors'}`}>{c.fullName}</div>
                                        <div className="text-[10px] font-sans font-bold text-cyan-500/80 tracking-widest uppercase mt-1 flex items-center justify-end gap-2">
                                            <span className="text-white text-xs px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded">{c.avgObjectiveProgress.toFixed(0)}</span> POWER LEVEL
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
      <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "brightness(3) blur(20px)" }} transition={{ duration: 0.6 }} className="w-full h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-transparent font-mono">
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
      const [expanded, setExpanded] = useState(false);
      const hasDetails = obj && obj.actualDetails && obj.actualDetails.length > 0;

      // Reset expansion map when round changes implicitly
      useEffect(() => {
          if (!isActive) setExpanded(false);
      }, [isActive]);

      if (!obj) return (
          <div className={`w-full h-24 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-105 opacity-80' : 'scale-95 opacity-20'}`}>
             <span className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold">Unarmed Guard</span>
          </div>
      );

      return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: isActive ? 1 : 0.4, y: 0, scale: isActive ? 1 : 0.96 }}
            transition={{ duration: 0.5, type: 'spring' }}
            // Completely redesigned to be structurally pure: dark backgrounds, subtle inner borders, incredibly sleek glass effect.
            // Replaced the thick colored AI-like borders with a stark, brutalist-cyber layout.
            className={`w-full transition-all duration-300 relative group overflow-hidden rounded-xl border
                ${isActive 
                    ? 'bg-[#0a0a0c] border-[#222] shadow-2xl hover:bg-[#111115] cursor-pointer' 
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
                              animate={{ strokeDashoffset: isActive ? 91.1 - (91.1 * Math.min(100, Math.max(0, obj.progress)) / 100) : 91.1 }}
                              transition={{ duration: 1.5, type: "spring", delay: 0.2 }}
                              strokeLinecap="round"
                          />
                      </svg>
                      <span className={`absolute text-[10px] font-bold ${isLeft ? 'text-rose-400' : 'text-cyan-400'}`}>{isActive ? obj.progress.toFixed(0) : '0'}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-6">
                      {badge && isActive && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 mb-2">
                             <div className={`w-1.5 h-1.5 rounded-sm flex items-center justify-center ${isLeft ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'}`}>
                                <div className="w-0.5 h-0.5 bg-black rounded-full animate-ping" />
                             </div>
                             <span className={`text-[9px] font-bold uppercase tracking-widest font-sans ${isLeft ? 'text-rose-400' : 'text-cyan-400'}`}>{badge}</span>
                          </motion.div>
                      )}
                      {/* Enforce font-sans for Thai Readability */}
                      <h4 className={`text-[13px] font-medium font-sans leading-relaxed ${isActive ? 'text-zinc-200 group-hover:text-white transition-colors' : 'text-zinc-600'} line-clamp-3`}>{obj.objectiveName}</h4>
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
                                  {obj.actualDetails!.map((kr, idx) => (
                                     <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0e0e11] border border-[#161616]">
                                         <Crosshair className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${kr.krProgress >= 100 ? (isLeft ? 'text-rose-500' : 'text-cyan-400') : 'text-zinc-700'}`} />
                                         <div className={`text-xs font-sans leading-relaxed flex-1 ${kr.krProgress >= 100 ? 'text-zinc-300' : 'text-zinc-500'}`}>{kr.krTitle}</div>
                                         <span className={`text-[10px] font-bold ${isLeft ? 'text-rose-400' : 'text-cyan-400'} shrink-0 ml-2 bg-black px-2 py-1 rounded-sm border border-[#222]`}>{kr.krProgress}%</span>
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
              <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold mb-2 hidden md:block">{label}</span>
          </div>
      );
  }

  const ShowdownArena = () => {
      const [phase, setPhase] = useState(0); 
      // Phases: 0 = Intro, 1..N = Rounds, N+1 = Final Analysis
      
      if (!result || !p1 || !p2) return null;
      const totalRounds = Math.max(p1.topObjectives.length, p2.topObjectives.length) || 1;
      const isIntro = phase === 0;
      const isRound = phase > 0 && phase <= totalRounds;
      const isFinalResult = phase > totalRounds;

      const currentRoundData = isRound ? (result.rounds?.[phase - 1] || { commentary: `ยกที่ ${phase}: AI อยู่ระหว่างประมวลผลข้อมูล...` }) : null;
      const P1Winner = result.winner === p1.fullName;
      const P2Winner = result.winner === p2.fullName;

      return (
          <div className="w-full h-full min-h-[85vh] relative flex flex-col font-mono" style={{ perspective: "1500px" }}>
              {/* Dynamic Aura Background */}
              <div className={`absolute top-0 right-1/2 bottom-0 left-0 transition-opacity duration-1000 blur-[150px] mix-blend-screen pointer-events-none ${P1Winner && isFinalResult ? 'bg-rose-600/10' : 'bg-rose-900/5'}`} />
              <div className={`absolute top-0 right-0 bottom-0 left-1/2 transition-opacity duration-1000 blur-[150px] mix-blend-screen pointer-events-none ${P2Winner && isFinalResult ? 'bg-cyan-600/10' : 'bg-cyan-900/5'}`} />

              {/* Top Banner Context */}
              <motion.div layout className="w-full relative z-30 pt-6 px-4 shrink-0 flex flex-col items-center">
                   <div className="bg-[#050505] border border-zinc-800/80 px-6 py-2 rounded-full mb-4 shadow-xl">
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
                              {P1Winner && isFinalResult && <div className="text-rose-500 font-bold uppercase tracking-widest text-[10px] mt-2 animate-pulse flex items-center gap-2"><Trophy className="w-3.5 h-3.5" /> Grand Victor</div>}
                              
                              <AnimatePresence>
                                  {isFinalResult && (
                                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-4">
                                          <ResultCounter value={result.scoreA} label="SCORE" isLeft={true} />
                                          <div className="hidden md:flex flex-col border-l border-zinc-800 pl-4 space-y-1">
                                              <span className="text-[9px] text-zinc-500 tracking-widest uppercase font-bold">Total Check-ins</span>
                                              <span className="text-white font-bold font-sans text-lg leading-none">{p1.checkInCount}</span>
                                          </div>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>

                      {/* AI Final Analysis Block */}
                      <AnimatePresence>
                        {isFinalResult && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 overflow-hidden">
                                <div className="p-5 bg-gradient-to-tr from-[#0a0505] to-[#120505] border border-rose-900/30 rounded-xl text-sm font-sans text-zinc-300 leading-relaxed">
                                    <div className="text-[10px] tracking-widest text-rose-500 font-bold mb-3 uppercase flex items-center gap-2"><Crosshair className="w-3 h-3" /> Alpha Analysis</div>
                                    <TypewriterText text={result.playerA_strengths_weaknesses} speed={10} delay={500} />
                                </div>
                            </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Objectives */}
                      <div className="flex-1 space-y-4">
                            <motion.div layout className="space-y-4">
                                {Array.from({ length: totalRounds }).map((_, i) => (
                                    <HologramObjective key={`p1-obj-${i}`} obj={p1.topObjectives[i]} isActive={isFinalResult ? true : phase === i + 1} isLeft={true} badge={result.rounds?.[i]?.p1_badge} />
                                ))}
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
                                  className="relative z-30 w-16 h-16 bg-[#0a0a0c] border border-zinc-700 hover:border-white rounded-full flex items-center justify-center shadow-2xl transition-colors group overflow-hidden"
                              >
                                  {isIntro ? <Swords className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" /> : <ChevronRight className="w-8 h-8 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" /> }
                              </motion.button>
                          ) : (
                              <motion.button 
                                  key="resetBTN" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                  onClick={resetState}
                                  className="relative z-30 w-16 h-16 bg-[#0a0a0c] border border-zinc-800 hover:border-zinc-500 rounded-full flex items-center justify-center shadow-xl group"
                              >
                                  <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-200 transition-colors tracking-[0.2em] uppercase text-center block leading-tight">New<br/>Match</span>
                              </motion.button>
                          )}
                      </AnimatePresence>
                  </div>
                  
                  {/* Mobile Middle Panel Backup */}
                  <div className="w-full flex lg:hidden items-center justify-center relative mt-4">
                      <AnimatePresence mode="popLayout">
                           <motion.button 
                               onClick={!isFinalResult ? () => setPhase(p => p + 1) : resetState}
                               className="px-8 py-3 bg-[#111] border border-zinc-700 rounded-full text-xs font-bold tracking-widest text-white uppercase shadow-xl"
                           >
                               {!isFinalResult ? (isIntro ? 'COMMENCE BATTLE' : 'NEXT ROUND') : 'NEW MATCH'}
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
                              {P2Winner && isFinalResult && <div className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mt-2 animate-pulse flex items-center justify-end gap-2 text-right">Grand Victor <Trophy className="w-3.5 h-3.5" /></div>}
                              
                              <AnimatePresence>
                                  {isFinalResult && (
                                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center flex-row-reverse gap-4">
                                          <ResultCounter value={result.scoreB} label="SCORE" isLeft={false} />
                                          <div className="hidden md:flex flex-col border-r border-zinc-800 pr-4 space-y-1 items-end text-right">
                                              <span className="text-[9px] text-zinc-500 tracking-widest uppercase font-bold">Total Check-ins</span>
                                              <span className="text-white font-bold font-sans text-lg leading-none">{p2.checkInCount}</span>
                                          </div>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>

                      {/* AI Final Analysis Block */}
                      <AnimatePresence>
                        {isFinalResult && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 overflow-hidden">
                                <div className="p-5 bg-gradient-to-tl from-[#050a0a] to-[#050d12] border border-cyan-900/30 rounded-xl text-sm font-sans text-zinc-300 leading-relaxed text-right">
                                    <div className="text-[10px] tracking-widest text-cyan-500 font-bold mb-3 uppercase flex items-center justify-end gap-2">Omega Analysis <Crosshair className="w-3 h-3" /></div>
                                    <TypewriterText text={result.playerB_strengths_weaknesses} speed={10} delay={500} />
                                </div>
                            </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Objectives */}
                      <div className="flex-1 space-y-4">
                            <motion.div layout className="space-y-4">
                                {Array.from({ length: totalRounds }).map((_, i) => (
                                    <HologramObjective key={`p2-obj-${i}`} obj={p2.topObjectives[i]} isActive={isFinalResult ? true : phase === i + 1} isLeft={false} badge={result.rounds?.[i]?.p2_badge} />
                                ))}
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
      <div className="w-full bg-transparent min-h-[85vh] relative overflow-hidden scrollbar-hide">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none fixed" />
          
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
