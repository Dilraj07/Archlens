import React, { useEffect, useState, useCallback, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Zap, AlertTriangle, Info, X, CheckCircle2 } from "lucide-react";
import { useArchStore } from "../../store/useArchStore";
import { ARCHITECTURE_TOURS, ArchitectureTourStep } from "./architectureTourData";
import { speechNarrator } from "../../utils/speechNarrator";

interface LevelTourOverlayProps { onClose: () => void; }

export const LevelTourOverlay: React.FC<LevelTourOverlayProps> = ({ onClose }) => {
  const activeBlueprintId = useArchStore((s) => s.activeBlueprintId);
  const tourActiveStep = useArchStore((s) => s.tourActiveStep);
  const setTourStep = useArchStore((s) => s.setTourStep);
  const tour = ARCHITECTURE_TOURS[activeBlueprintId] || ARCHITECTURE_TOURS["simple-app"];
  const steps = tour.steps;
  const currentStepIndex = tourActiveStep !== null && tourActiveStep < steps.length ? tourActiveStep : 0;
  const currentStep: ArchitectureTourStep = steps[currentStepIndex] || steps[0];
  const nextStep = steps[currentStepIndex + 1] || null;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

  // Session guard: bumped on EVERY change (step select OR play/pause).
  // Stale onEnd callbacks check this before auto-advancing => no more skip glitch.
  const sessionRef = useRef(0);
  const autoAdvanceRef = useRef(autoAdvance);
  autoAdvanceRef.current = autoAdvance;
  const currentStepIndexRef = useRef(currentStepIndex);
  currentStepIndexRef.current = currentStepIndex;
  const stepsCountRef = useRef(steps.length);
  stepsCountRef.current = steps.length;

  useEffect(() => {
    setTourStep(currentStepIndex, currentStep.nodeIds);
  }, [currentStepIndex, currentStep.nodeIds, setTourStep]);

  const playNarration = useCallback((step: ArchitectureTourStep, sessionId: number) => {
    if (speechNarrator.getMuted()) { setIsSpeaking(false); return; }
    speechNarrator.speak(step.narrationText, {
      rate: speechRate,
      onStart: () => { if (sessionRef.current !== sessionId) return; setIsSpeaking(true); },
      onEnd: () => {
        if (sessionRef.current !== sessionId) return;
        setIsSpeaking(false);
        if (autoAdvanceRef.current && currentStepIndexRef.current < stepsCountRef.current - 1) {
          setTimeout(() => {
            if (sessionRef.current !== sessionId) return;
            if (!autoAdvanceRef.current) return;
            const next = currentStepIndexRef.current + 1;
            setTourStep(next, steps[next].nodeIds);
          }, 1200);
        }
      },
      onError: () => { if (sessionRef.current !== sessionId) return; setIsSpeaking(false); },
    });
  }, [speechRate, setTourStep, steps]);

  useEffect(() => {
    sessionRef.current += 1;
    const sid = sessionRef.current;
    speechNarrator.stop(); setIsSpeaking(false);
    const t = setTimeout(() => { if (sessionRef.current === sid) playNarration(currentStep, sid); }, 300);
    return () => { clearTimeout(t); speechNarrator.stop(); setIsSpeaking(false); };
  }, [currentStepIndex, activeBlueprintId]); // eslint-disable-line

  // On architecture change: kill any in-flight narration and force step 0 immediately.
  useEffect(() => {
    sessionRef.current += 1;
    speechNarrator.stop();
    setIsSpeaking(false);
    setTourStep(0, steps[0]?.nodeIds ?? null);
  }, [activeBlueprintId]); // eslint-disable-line

  useEffect(() => { return () => { speechNarrator.stop(); setTourStep(null, null); }; }, [setTourStep]);

  const handleStepSelect = (index: number) => {
    sessionRef.current += 1;
    speechNarrator.stop(); setIsSpeaking(false);
    setTourStep(index, steps[index].nodeIds);
  };
  const handlePrev = () => { if (currentStepIndex > 0) handleStepSelect(currentStepIndex - 1); };
  const handleNext = () => { if (currentStepIndex < steps.length - 1) handleStepSelect(currentStepIndex + 1); };

  const togglePlayPause = () => {
    if (isSpeaking) {
      sessionRef.current += 1; // kills any pending onEnd from current utterance
      speechNarrator.stop(); setIsSpeaking(false);
    } else {
      sessionRef.current += 1; // fresh session so resume does not collide with old onEnd
      const sid = sessionRef.current;
      playNarration(currentStep, sid);
    }
  };

  const toggleMute = () => {
    const next = !isMuted; setIsMuted(next); speechNarrator.setMuted(next);
    if (next) { sessionRef.current += 1; speechNarrator.stop(); setIsSpeaking(false); }
    else { sessionRef.current += 1; playNarration(currentStep, sessionRef.current); }
  };
  const handleRateChange = (rate: number) => {
    setSpeechRate(rate); speechNarrator.setRate(rate);
    if (isSpeaking) { sessionRef.current += 1; speechNarrator.stop(); const sid = sessionRef.current; setTimeout(() => playNarration(currentStep, sid), 100); }
  };
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  return (
    <div className="bg-[#141414] border-t border-[#2a2a2a] shadow-2xl select-none flex flex-col">
      {/* Row 1: header + voice controls */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1e1e1e] flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sparkles className="w-3.5 h-3.5 text-[#3cffd0] shrink-0 animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#3cffd0] whitespace-nowrap">Guided Tour</span>
          <span className="text-[11px] text-[#444] mx-1">&middot;</span>
          <span className="text-[11px] font-semibold text-white truncate">{currentStep.levelName}: {currentStep.title}</span>
          <span className="ml-1 text-[10px] font-mono text-[#555] shrink-0">{currentStepIndex + 1}/{steps.length}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isSpeaking && (
            <div className="flex items-center gap-0.5 mr-1">
              <span className="w-0.5 h-2.5 bg-[#3cffd0] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-0.5 h-3.5 bg-[#3cffd0] rounded-full animate-bounce [animation-delay:100ms]" />
              <span className="w-0.5 h-2 bg-[#3cffd0] rounded-full animate-bounce [animation-delay:200ms]" />
              <span className="w-0.5 h-4 bg-[#3cffd0] rounded-full animate-bounce [animation-delay:50ms]" />
            </div>
          )}
          <button onClick={togglePlayPause} title={isSpeaking ? "Pause" : "Play narration"}
            className={"w-7 h-7 rounded-lg flex items-center justify-center border transition-all " + (isSpeaking ? "bg-[#3cffd0] text-black border-[#3cffd0]" : "bg-[#1e1e1e] hover:bg-[#252525] text-white border-[#333]")}>
            {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}
            className={"w-7 h-7 rounded-lg flex items-center justify-center border transition-all " + (isMuted ? "bg-rose-900/40 text-rose-400 border-rose-700/40" : "bg-[#1e1e1e] hover:bg-[#252525] text-[#888] hover:text-white border-[#333]")}>
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => handleRateChange(speechRate === 1.0 ? 1.25 : 1.0)}
            className="px-2 py-1 rounded-lg bg-[#1e1e1e] hover:bg-[#252525] text-white text-[11px] font-mono border border-[#333] transition-all">
            {speechRate}x
          </button>
          <button onClick={() => setAutoAdvance(!autoAdvance)}
            className={"px-2 py-1 rounded-lg text-[11px] font-mono border flex items-center gap-1 transition-all " + (autoAdvance ? "bg-[#3cffd0]/10 text-[#3cffd0] border-[#3cffd0]/30" : "bg-[#1e1e1e] text-[#666] border-[#333]")}>
            <CheckCircle2 className="w-3 h-3" />Auto
          </button>
          <button onClick={onClose} title="Exit tour"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#1e1e1e] hover:bg-rose-950/50 hover:text-rose-400 text-[#666] border border-[#333] hover:border-rose-800/50 transition-all ml-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Step pills */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#1a1a1a] overflow-x-auto scrollbar-none">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;
          return (
            <button key={idx} onClick={() => handleStepSelect(idx)}
              className={"px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 " + (isActive ? "bg-[#3cffd0] text-black font-bold border-[#3cffd0] shadow-[0_0_10px_rgba(60,255,208,0.25)]" : isPassed ? "bg-[#1e1e1e] text-[#3cffd0] border-[#3cffd0]/25 hover:bg-[#252525]" : "bg-[#1a1a1a] text-[#666] border-[#282828] hover:text-white")}>
              <span className={"w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold " + (isActive ? "bg-black text-[#3cffd0]" : "bg-[#222] text-current")}>{idx + 1}</span>
              <span>{step.levelName.replace(/Level \d+: /, "")}</span>
            </button>
          );
        })}
      </div>

      {/* Row 3: Content cards */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-none">
        <div className="flex-1 min-w-[240px] bg-[#0f0f0f] border border-[#242424] rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3cffd0] flex items-center gap-1"><Zap className="w-3 h-3" />How Traffic Flows</span>
            <button onClick={() => setShowDetails(!showDetails)} className="text-[10px] font-mono text-[#555] hover:text-[#3cffd0] flex items-center gap-0.5 transition-colors">
              <Info className="w-3 h-3" />{showDetails ? "less" : "more"}
            </button>
          </div>
          <p className="text-xs font-semibold text-white leading-snug">{currentStep.oneLiner}</p>
          <p className="text-[11px] text-[#999] leading-relaxed">{currentStep.explanation}</p>
          {showDetails && (
            <div className="mt-1 p-2.5 bg-[#181818] rounded-lg border border-[#252525] flex gap-2">
              <Info className="w-3.5 h-3.5 text-[#3cffd0] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#ccc] leading-relaxed"><span className="text-white font-mono font-bold">Under the Hood: </span>{currentStep.underTheHood}</p>
            </div>
          )}
        </div>
        <div className="min-w-[200px] max-w-[260px] bg-[#0e0808] border border-[#ff3366]/20 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff3366] flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Failure Mode</span>
          <p className="text-[11px] text-[#e0e0e0] leading-relaxed flex-1">{currentStep.bottleneckRisk}</p>
          <div className="pt-2 text-[10px] font-mono text-[#555] flex items-center justify-between border-t border-[#1e1e1e]">
            <span>Highlighted:</span>
            <span className="text-[#3cffd0] font-bold">{currentStep.nodeIds.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Row 4: Nav grouped centrally with next-step name preview */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-t border-[#1a1a1a]">
        <button onClick={() => handleStepSelect(0)} title="Restart" className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] text-[#555] hover:text-[#3cffd0] border border-[#252525] transition-all">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={handlePrev} disabled={isFirst} className="px-3.5 py-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#252525] disabled:opacity-25 disabled:pointer-events-none text-white text-[11px] font-mono flex items-center gap-1.5 border border-[#2d2d2d] transition-all">
          <ChevronLeft className="w-3.5 h-3.5" /><span>Prev</span>
        </button>
        <div className="flex flex-col items-center px-3">
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Step</span>
          <span className="text-sm font-bold text-white font-mono leading-tight">{currentStepIndex + 1}<span className="text-[#444]"> / {steps.length}</span></span>
        </div>
        <button onClick={handleNext} disabled={isLast} className="px-3.5 py-1.5 rounded-lg bg-[#3cffd0] hover:bg-[#34dfb6] disabled:opacity-25 disabled:pointer-events-none text-black text-[11px] font-mono flex items-center gap-1.5 font-bold transition-all shadow-[0_0_10px_rgba(60,255,208,0.15)]">
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[9px] font-normal opacity-60 uppercase tracking-wider">Next</span>
            <span className="text-[11px] font-bold truncate max-w-[130px]">{nextStep ? nextStep.levelName.replace(/Level \d+: /, "") : "Done!"}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
