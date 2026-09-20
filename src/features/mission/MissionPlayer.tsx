import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Check,
  Flame,
  Lightbulb,
  BookOpen,
  Target,
  Zap as ZapIcon,
  ShieldCheck,
  GitBranch,
  Server as ServerIcon,
} from 'lucide-react';
import { useArchStore } from '../../store/useArchStore';
import { VergeBadge, VergeButton, VergeCard } from '../../components/ui/VergePrimitives';

export const MissionPlayer: React.FC = () => {
  const activeMission = useArchStore((s) => s.activeMission);
  const missionStep = useArchStore((s) => s.missionStep);
  const userPrediction = useArchStore((s) => s.userPrediction);
  const setPrediction = useArchStore((s) => s.setPrediction);
  const submitPrediction = useArchStore((s) => s.submitPrediction);
  const proceedToObserve = useArchStore((s) => s.proceedToObserve);
  const proceedToExplain = useArchStore((s) => s.proceedToExplain);
  const proceedToFix = useArchStore((s) => s.proceedToFix);
  const predictionGrade = useArchStore((s) => s.predictionGrade);
  const appliedFixIds = useArchStore((s) => s.appliedFixIds);
  const applyFixAction = useArchStore((s) => s.applyFixAction);
  const revertFixAction = useArchStore((s) => s.revertFixAction);
  const goalResult = useArchStore((s) => s.goalResult);
  const currentResult = useArchStore((s) => s.currentResult);
  const startIncident = useArchStore((s) => s.startIncident);

  const [sliderVal, setSliderVal] = useState(50);
  const [hintLevel, setHintLevel] = useState(0); // 0 = hidden, 1 = warm, 2 = strong

  // Reset hint when the mission changes
  React.useEffect(() => { setHintLevel(0); }, [activeMission?.id]);

  const activeBlueprint = useArchStore((s) => s.activeBlueprint);

  const bottleneckId = currentResult.system.bottleneckNodeId;
  const bottleneckNode = useMemo(
    () => (bottleneckId ? activeBlueprint.nodes.find((n) => n.id === bottleneckId) : null),
    [bottleneckId, activeBlueprint]
  );
  const bottleneckMetrics = bottleneckId ? currentResult.nodes[bottleneckId] : null;

  const fixTypeMeta: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
    enable:         { label: 'Re-enable',     color: '#3cffd0', Icon: ShieldCheck },
    add_replica:    { label: 'Scale out',     color: '#5200ff', Icon: ServerIcon },
    restore_param:  { label: 'Tune param',    color: '#ffb703', Icon: Sliders },
    route_traffic:  { label: 'Reroute',       color: '#3cffd0', Icon: GitBranch },
  };

  if (!activeMission) return null;

  // Progressive hint text derived from the mission's prediction kind
  const hintText = (() => {
    if (activeMission.prediction.kind === 'select_node') {
      if (hintLevel === 1) return 'Think about which component sits on the critical path AND has the lowest capacity headroom relative to peak traffic.';
      if (hintLevel === 2) {
        const opts = activeMission.prediction.options ?? [];
        const layerHint = opts.find((id) => /db|database|cache|queue/i.test(id))
          ? 'It is a stateful component (database / cache / queue), not a stateless one — those tend to become the primary bottleneck under sustained load.'
          : 'Focus on the component that receives fan-in from many upstream nodes — the funnel point.';
        return layerHint;
      }
    } else if (activeMission.prediction.kind === 'slider') {
      if (hintLevel === 1) return 'Ratio-reason: peak / baseline is roughly the load multiplier. What percentage would you expect a saturated queue to reflect?';
      if (hintLevel === 2) return 'When utilization exceeds 100%, the queue backs up until requests time out — the error rate curves sharply, not linearly.';
    } else {
      if (hintLevel === 1) return 'Ask: does an async buffer (queue) sit between the slow component and the caller? If yes, the caller is decoupled.';
      if (hintLevel === 2) return 'Kafka / queues absorb write bursts. A synchronous DB write path does not — the caller waits until the DB responds.';
    }
    return '';
  })();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderVal(val);
    setPrediction(val);
  };

  const handleFixToggle = (actionId: string) => {
    if (appliedFixIds.includes(actionId)) {
      revertFixAction(actionId);
    } else {
      applyFixAction(actionId);
      // Trigger confetti if this fix fulfilled all SLO goals
      setTimeout(() => {
        const passed = useArchStore.getState().goalResult?.pass;
        if (passed) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      }, 50);
    }
  };

  return (
    <div className="w-80 md:w-96 bg-[#181818] border-r border-[#313131] h-full flex flex-col p-5 overflow-y-auto text-white select-none">
      {/* Kicker & Mission Title */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0]">
            Guided Mission
          </span>
          <VergeBadge variant="slate">
            Step {missionStep === 'brief' ? '1/5' : missionStep === 'predict' ? '2/5' : missionStep === 'observe' ? '3/5' : missionStep === 'explain' ? '4/5' : '5/5'}
          </VergeBadge>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">{activeMission.title}</h2>
        {/* Concept chips — always visible so learners know what topic this teaches */}
        {activeMission.concepts?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activeMission.concepts.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-verge-nano bg-[#5200ff]/15 text-[#c3b0ff] border border-[#5200ff]/40 flex items-center gap-1"
              >
                <BookOpen className="w-2.5 h-2.5" />
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: CONTEXT BRIEF */}
      {missionStep === 'brief' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <VergeCard variant="dark">
              <span className="text-[10px] font-mono text-[#949494] uppercase tracking-verge-nano block mb-1">
                The Scenario
              </span>
              <p className="text-xs text-[#e9e9e9] leading-relaxed">{activeMission.brief}</p>
            </VergeCard>

            <div className="bg-[#131313] border border-[#313131] rounded-20px p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#949494]">BASELINE TRAFFIC:</span>
                <span className="text-white font-bold">{activeMission.baseline.usersConcurrent} req/s</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#ffb703]">PEAK EVENT TRAFFIC:</span>
                <span className="text-[#ffb703] font-bold">{activeMission.event.usersConcurrent} req/s</span>
              </div>
            </div>
          </div>

          <VergeButton
            variant="primary"
            onClick={() => useArchStore.setState({ missionStep: 'predict' })}
            className="w-full mt-4"
          >
            Start Prediction <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </VergeButton>
        </div>
      )}

      {/* STEP 2: PREDICT (Active Commitment) */}
      {missionStep === 'predict' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-[#5200ff]/10 border border-[#5200ff]/50 rounded-20px text-xs text-[#e9e9e9]">
              <span className="font-bold text-[#3cffd0] block mb-1">PREDICT BEFORE OBSERVING</span>
              Commit to an answer first. Being wrong builds sharper distributed systems intuition than passive clicking.
            </div>

            <VergeCard variant="dark">
              <h4 className="font-bold text-sm text-white mb-3">{activeMission.prediction.prompt}</h4>

              {/* Kind: Select Node */}
              {activeMission.prediction.kind === 'select_node' && activeMission.prediction.options && (
                <div className="grid grid-cols-1 gap-2">
                  {activeMission.prediction.options.map((nodeId) => (
                    <button
                      key={nodeId}
                      onClick={() => setPrediction(nodeId)}
                      className={`p-2.5 text-left text-xs font-mono rounded-12px border transition-all ${
                        userPrediction === nodeId
                          ? 'bg-[#3cffd0] text-black font-bold border-[#3cffd0]'
                          : 'bg-[#131313] text-[#e9e9e9] border-[#313131] hover:border-white'
                      }`}
                    >
                      {nodeId.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {/* Kind: Slider */}
              {activeMission.prediction.kind === 'slider' && (
                <div className="space-y-3 py-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#949494] font-mono">YOUR ESTIMATE:</span>
                    <span className="text-2xl font-bold font-mono text-[#3cffd0]">{sliderVal}%</span>
                  </div>
                  <input
                    type="range"
                    min={activeMission.prediction.sliderMin || 0}
                    max={activeMission.prediction.sliderMax || 100}
                    value={sliderVal}
                    onChange={handleSliderChange}
                    className="w-full accent-[#3cffd0] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#949494] font-mono">
                    <span>{activeMission.prediction.sliderMin || 0}%</span>
                    <span>{activeMission.prediction.sliderMax || 100}%</span>
                  </div>
                </div>
              )}

              {/* Kind: Boolean */}
              {activeMission.prediction.kind === 'boolean' && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {['Yes', 'No'].map((opt) => {
                    const boolVal = opt === 'Yes';
                    const isSelected = userPrediction === boolVal;
                    return (
                      <button
                        key={opt}
                        onClick={() => setPrediction(boolVal)}
                        className={`py-3 text-center text-xs font-mono uppercase font-bold rounded-12px border transition-all ${
                          isSelected
                            ? 'bg-[#3cffd0] text-black border-[#3cffd0]'
                            : 'bg-[#131313] text-white border-[#313131] hover:border-white'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </VergeCard>

            {/* Progressive Hint — 2 tiers before revealing the answer */}
            <div className="bg-[#131313] border border-[#313131] rounded-16px p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#ffb703] font-bold flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Stuck? {hintLevel > 0 && `Tier ${hintLevel}/2`}
                </span>
                {hintLevel < 2 && (
                  <button
                    onClick={() => setHintLevel((l) => Math.min(2, l + 1))}
                    className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] hover:text-white"
                  >
                    {hintLevel === 0 ? 'Show hint' : 'Bigger hint →'}
                  </button>
                )}
              </div>
              {hintLevel > 0 && (
                <p className="text-[11px] text-[#e9e9e9] leading-relaxed mt-2">{hintText}</p>
              )}
              {hintLevel === 0 && (
                <p className="text-[10px] text-[#666] mt-1">
                  Committing without hints teaches faster — but tap for a nudge if you need one.
                </p>
              )}
            </div>
          </div>

          <VergeButton
            variant="primary"
            disabled={userPrediction === null}
            onClick={() => {
              submitPrediction();
              proceedToObserve();
            }}
            className="w-full"
          >
            Trigger Event & Observe <Flame className="w-3.5 h-3.5 ml-2" />
          </VergeButton>
        </div>
      )}

      {/* STEP 3: OBSERVE */}
      {missionStep === 'observe' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-red-950/30 border border-[#ff3366]/40 rounded-20px text-xs text-white">
              <span className="font-bold text-[#ff3366] block mb-1">EVENT ACTIVE</span>
              Traffic surged to {activeMission.event.usersConcurrent} req/s. Notice particle flows and red bottleneck indicators on the canvas.
            </div>

            {/* Live System Telemetry */}
            <div className="bg-[#131313] border border-[#313131] rounded-20px p-4 space-y-3">
              <span className="text-[10px] font-mono text-[#949494] uppercase tracking-verge-nano block">
                System Telemetry
              </span>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#949494]">Arrival Rate:</span>
                <span className="font-bold text-white">{currentResult.system.totalArrivalRate} req/s</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#949494]">p95 User Latency:</span>
                <span className="font-bold text-white">{currentResult.system.userLatencyMs}ms</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#949494]">System Error Rate:</span>
                <span className={`font-bold ${currentResult.system.errorRate > 0.02 ? 'text-[#ff3366]' : 'text-[#3cffd0]'}`}>
                  {(currentResult.system.errorRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#949494]">Throughput:</span>
                <span className="font-bold text-white">{currentResult.system.throughput} req/s</span>
              </div>
            </div>
          </div>

          <VergeButton variant="primary" onClick={proceedToExplain} className="w-full">
            Analyze Explanation <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </VergeButton>
        </div>
      )}

      {/* STEP 4: EXPLAIN */}
      {missionStep === 'explain' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Grade banner */}
            <div
              className={`p-3.5 rounded-20px border ${
                predictionGrade?.correct
                  ? 'bg-[#3cffd0]/15 border-[#3cffd0] text-[#3cffd0]'
                  : 'bg-[#ff3366]/15 border-[#ff3366] text-[#ff3366]'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {predictionGrade?.correct ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{predictionGrade?.correct ? 'Prediction Correct' : 'Prediction Mismatch'}</span>
              </div>
              <p className="text-xs text-white mt-1 leading-relaxed">{predictionGrade?.explanation}</p>
            </div>

            {/* Dynamic Bottleneck Analysis — actual sim numbers, plain-English */}
            <div className="bg-[#131313] border border-[#313131] rounded-20px p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano flex items-center gap-1">
                  <Target className="w-3 h-3" /> Bottleneck Analysis
                </span>
                <VergeBadge variant="verified">✓ from simulation</VergeBadge>
              </div>

              {bottleneckNode && bottleneckMetrics ? (
                <>
                  <div className="p-2.5 bg-[#181818] rounded-12px border border-[#ff3366]/30">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#949494]">Failing component:</span>
                      <span className="text-[#ff3366] font-bold">{bottleneckNode.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono mt-1">
                      <span className="text-[#949494]">Utilization ρ:</span>
                      <span className="text-white font-bold">{(bottleneckMetrics.utilization * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono mt-1">
                      <span className="text-[#949494]">Node latency:</span>
                      <span className="text-white font-bold">{bottleneckMetrics.latencyMs.toFixed(0)} ms</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#e9e9e9] leading-relaxed">
                    At <span className="font-bold text-white">{Math.round(currentResult.system.totalArrivalRate)} req/s</span>,
                    the <span className="font-bold text-[#ff3366]">{bottleneckNode.name}</span> is running at
                    {' '}{(bottleneckMetrics.utilization * 100).toFixed(0)}% utilization. As ρ approaches 1, average wait time
                    grows as <span className="font-mono">1 / (1 − ρ)</span> — so a jump from 80% → 95% multiplies latency by ~4×.
                    That is why the pipe into it turned red on the canvas.
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-[#e9e9e9] leading-relaxed">
                  System is holding — no single node is saturated. The critical path is the tour highlight.
                </p>
              )}

              {/* Contrast the user's guess vs actual (select_node only) */}
              {activeMission.prediction.kind === 'select_node' && typeof userPrediction === 'string' && bottleneckNode && (
                <div className={`p-2.5 rounded-12px border text-[11px] leading-relaxed ${
                  userPrediction === bottleneckNode.id
                    ? 'bg-[#3cffd0]/10 border-[#3cffd0]/40 text-[#e9e9e9]'
                    : 'bg-[#ffb703]/10 border-[#ffb703]/40 text-[#e9e9e9]'
                }`}>
                  {userPrediction === bottleneckNode.id ? (
                    <span>You picked <span className="font-bold text-[#3cffd0]">{userPrediction}</span> — and that is exactly where the queue overflowed. Nice pattern-matching.</span>
                  ) : (
                    <span>You picked <span className="font-bold">{userPrediction}</span> but the simulator showed <span className="font-bold text-[#ff3366]">{bottleneckNode.id}</span> failed first. The tell: it had the lowest capacity headroom on the critical path.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <VergeButton variant="primary" onClick={proceedToFix} className="w-full">
            Apply Fixes <Sliders className="w-3.5 h-3.5 ml-2" />
          </VergeButton>
        </div>
      )}

      {/* STEP 5: FIX */}
      {missionStep === 'fix' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* SLO Target Card */}
            <div className="bg-[#131313] border border-[#313131] rounded-20px p-4">
              <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano block mb-2">
                Target SLO Goals
              </span>

              <div className="space-y-2 text-xs font-mono">
                {activeMission.fix.goal.p95LatencyMsMax && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#949494]">p95 Latency &lt; {activeMission.fix.goal.p95LatencyMsMax}ms:</span>
                    <span className={`font-bold ${currentResult.system.userLatencyMs <= activeMission.fix.goal.p95LatencyMsMax ? 'text-[#3cffd0]' : 'text-[#ff3366]'}`}>
                      {currentResult.system.userLatencyMs}ms {currentResult.system.userLatencyMs <= activeMission.fix.goal.p95LatencyMsMax ? '✓' : '✕'}
                    </span>
                  </div>
                )}
                {activeMission.fix.goal.errorRateMax !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#949494]">Error Rate &lt; {(activeMission.fix.goal.errorRateMax * 100).toFixed(0)}%:</span>
                    <span className={`font-bold ${currentResult.system.errorRate <= activeMission.fix.goal.errorRateMax ? 'text-[#3cffd0]' : 'text-[#ff3366]'}`}>
                      {(currentResult.system.errorRate * 100).toFixed(1)}% {currentResult.system.errorRate <= activeMission.fix.goal.errorRateMax ? '✓' : '✕'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fix Palette */}
            <div>
              <span className="text-[10px] font-mono text-[#949494] uppercase tracking-verge-nano block mb-2">
                Available Mitigations
              </span>
              <div className="space-y-2">
                {activeMission.fix.palette.map((fix) => {
                  const isApplied = appliedFixIds.includes(fix.id);
                  const meta = fixTypeMeta[fix.type] ?? fixTypeMeta.enable;
                  const MetaIcon = meta.Icon;
                  const targetsBottleneck = bottleneckNode && fix.targetNodeId === bottleneckNode.id;
                  return (
                    <div
                      key={fix.id}
                      onClick={() => handleFixToggle(fix.id)}
                      className={`p-3 rounded-12px border transition-all cursor-pointer ${
                        isApplied
                          ? 'bg-[#3cffd0]/15 border-[#3cffd0] text-white'
                          : 'bg-[#131313] border-[#313131] hover:border-white text-[#e9e9e9]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="text-[9px] font-mono font-bold uppercase tracking-verge-nano px-1.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0"
                            style={{ color: meta.color, borderColor: `${meta.color}66`, background: '#181818' }}
                          >
                            <MetaIcon className="w-2.5 h-2.5" />
                            {meta.label}
                          </span>
                          <span className="text-xs font-bold font-mono truncate">{fix.label}</span>
                        </div>
                        {isApplied ? (
                          <span className="text-xs font-mono font-bold text-[#3cffd0] flex items-center gap-1 shrink-0">
                            <Check className="w-3.5 h-3.5" /> APPLIED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#949494] shrink-0">APPLY</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#949494] mt-1 leading-snug">{fix.description}</p>
                      {targetsBottleneck && !isApplied && (
                        <p className="text-[10px] font-mono text-[#ffb703] mt-1.5 flex items-center gap-1">
                          <ZapIcon className="w-2.5 h-2.5" /> Targets the current bottleneck
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Goal Passed Banner */}
          {goalResult?.pass ? (
            <div className="space-y-2">
              <div className="p-3 bg-[#3cffd0] text-black font-bold rounded-20px text-center text-xs">
                🎉 SLO TARGETS MET! CONCEPT MASTERED.
              </div>
              <VergeButton
                variant="primary"
                onClick={() => startIncident('i1-tatkal-down')}
                className="w-full"
              >
                Enter Incident Mode Climax <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </VergeButton>
            </div>
          ) : (
            <div className="text-[11px] text-[#949494] font-mono text-center">
              Apply components from the palette above until all target SLO criteria turn green.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
