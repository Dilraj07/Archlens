import React, { useState } from 'react';
import {
  AlertOctagon,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react';
import { useArchStore } from '../../store/useArchStore';
import { VergeButton } from '../../components/ui/VergePrimitives';
import confetti from 'canvas-confetti';

const CAUSE_TYPES = [
  { id: 'cache_miss_storm', label: 'Cache Miss Storm' },
  { id: 'capacity_exhaustion', label: 'Compute Capacity Exhaustion' },
  { id: 'dependency_failure', label: 'Downstream Sync Dependency Failure' },
  { id: 'traffic_spike', label: 'Unmitigated Ingress Traffic Spike' },
  { id: 'slow_external_service', label: 'Slow External API Gateway' },
];

export const IncidentPlayer: React.FC = () => {
  const activeIncident = useArchStore((s) => s.activeIncident);
  const activeBlueprint = useArchStore((s) => s.activeBlueprint);
  const inspectBudget = useArchStore((s) => s.inspectBudgetRemaining);
  const revealedNodeIds = useArchStore((s) => s.revealedNodeIds);
  const hintsUsed = useArchStore((s) => s.hintsUsed);
  const requestIncidentHint = useArchStore((s) => s.requestIncidentHint);
  const submitDiagnosis = useArchStore((s) => s.submitDiagnosis);
  const isDiagnosed = useArchStore((s) => s.isDiagnosed);
  const incidentGrade = useArchStore((s) => s.incidentGrade);
  const isIncidentResolved = useArchStore((s) => s.isIncidentResolved);
  const appliedFixIds = useArchStore((s) => s.appliedFixIds);
  const applyFixAction = useArchStore((s) => s.applyFixAction);
  const revertFixAction = useArchStore((s) => s.revertFixAction);
  const setView = useArchStore((s) => s.setView);

  const [selectedRootNode, setSelectedRootNode] = useState('seat_cache');
  const [selectedCauseType, setSelectedCauseType] = useState('cache_miss_storm');

  if (!activeIncident) return null;

  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();
    submitDiagnosis({
      rootCauseNode: selectedRootNode,
      causeType: selectedCauseType,
    });
  };

  const handleFixToggle = (actionId: string) => {
    if (appliedFixIds.includes(actionId)) {
      revertFixAction(actionId);
    } else {
      applyFixAction(actionId);
      setTimeout(() => {
        const passed = useArchStore.getState().goalResult?.pass;
        if (passed) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }, 50);
    }
  };

  return (
    <div className="w-80 md:w-96 bg-[#181818] border-r border-[#313131] h-full flex flex-col p-5 overflow-y-auto text-white select-none">
      {/* Pager Duty Urgent Header */}
      <div className="p-3 bg-red-950/40 border border-[#ff3366] rounded-20px mb-4">
        <div className="flex items-center gap-2 text-[#ff3366] text-xs font-mono font-bold uppercase tracking-verge-nano mb-1">
          <AlertOctagon className="w-4 h-4 animate-pulse" />
          <span>URGENT ON-CALL PAGE</span>
        </div>
        <p className="text-xs text-white leading-relaxed font-sans">{activeIncident.pageAlert}</p>
      </div>

      {/* Inspection Budget Tracker */}
      <div className="bg-[#131313] border border-[#313131] rounded-20px p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-[#949494] uppercase tracking-verge-nano">
            Investigation Budget
          </span>
          <span className="font-mono text-xs font-bold text-[#3cffd0]">
            {inspectBudget} of {activeIncident.inspectBudget} CHECKS LEFT
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#2d2d2d] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#3cffd0] h-full transition-all duration-300"
            style={{ width: `${(inspectBudget / activeIncident.inspectBudget) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#313131]/60 text-[11px] font-mono">
          <span className="text-[#949494]">Revealed Nodes:</span>
          <span className="text-white font-bold">{revealedNodeIds.length}</span>
        </div>

        {/* Hint Ladder Button */}
        {!isDiagnosed && (
          <button
            onClick={requestIncidentHint}
            disabled={hintsUsed >= 3}
            className="w-full mt-3 py-1.5 px-3 bg-[#2d2d2d] hover:bg-[#313131] text-[#ffb703] text-[11px] font-mono rounded-12px border border-[#ffb703]/40 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Request Mentor Hint ({hintsUsed}/3 used, -5 pts)</span>
          </button>
        )}
      </div>

      {/* STAGE 1: DIAGNOSIS FORM */}
      {!isDiagnosed ? (
        <form onSubmit={handleDiagnose} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano block">
              Submit Incident Diagnosis
            </span>

            {/* Root Cause Node Selection */}
            <div>
              <label className="text-xs font-mono text-[#949494] block mb-1.5">
                IDENTIFIED ROOT CAUSE NODE:
              </label>
              <select
                value={selectedRootNode}
                onChange={(e) => setSelectedRootNode(e.target.value)}
                className="w-full bg-[#131313] border border-[#313131] rounded-12px p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#3cffd0]"
              >
                {activeBlueprint.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Cause Type Selection */}
            <div>
              <label className="text-xs font-mono text-[#949494] block mb-1.5">
                PRIMARY FAILURE MECHANISM:
              </label>
              <div className="space-y-1.5">
                {CAUSE_TYPES.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelectedCauseType(c.id)}
                    className={`w-full text-left p-2.5 rounded-12px border text-xs font-mono transition-all ${
                      selectedCauseType === c.id
                        ? 'bg-[#3cffd0] text-black font-bold border-[#3cffd0]'
                        : 'bg-[#131313] text-[#e9e9e9] border-[#313131] hover:border-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <VergeButton type="submit" variant="primary" className="w-full mt-4">
            Verify & Diagnose Incident
          </VergeButton>
        </form>
      ) : (
        /* STAGE 2: POST-MORTEM & REMEDIATION */
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Score Banner */}
            <div
              className={`p-3.5 rounded-20px border ${
                incidentGrade?.isRootCauseCorrect
                  ? 'bg-[#3cffd0]/15 border-[#3cffd0] text-[#3cffd0]'
                  : 'bg-[#ff3366]/15 border-[#ff3366] text-[#ff3366]'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="flex items-center gap-1.5">
                  {incidentGrade?.isRootCauseCorrect ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {incidentGrade?.isRootCauseCorrect ? 'Diagnosis Confirmed' : 'Diagnosis Rejected'}
                </span>
                <span className="font-mono text-base">{incidentGrade?.totalScore}/100 PTS</span>
              </div>
              <p className="text-xs text-white mt-1.5 leading-relaxed">
                {incidentGrade?.postMortemLesson}
              </p>
            </div>

            {/* Failure Cascade Replay */}
            <div className="bg-[#131313] border border-[#313131] rounded-20px p-3.5">
              <span className="text-[10px] font-mono text-[#949494] uppercase tracking-verge-nano block mb-2">
                Cascade Path Replay
              </span>
              <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto py-1 text-white">
                <span className="px-2 py-1 bg-[#ff3366]/20 border border-[#ff3366] text-[#ff3366] rounded-8px font-bold">
                  seat_cache (10% hit)
                </span>
                <span>→</span>
                <span className="px-2 py-1 bg-[#ff3366]/20 border border-[#ff3366] text-[#ff3366] rounded-8px font-bold">
                  seat_db (saturated)
                </span>
                <span>→</span>
                <span className="px-2 py-1 bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] rounded-8px font-bold">
                  app (blocked wait)
                </span>
              </div>
            </div>

            {/* Remediation Palette */}
            <div>
              <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano block mb-2">
                Emergency Remediation Palette
              </span>
              <div className="space-y-2">
                {activeIncident.fix.palette.map((fix) => {
                  const isApplied = appliedFixIds.includes(fix.id);
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
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono">{fix.label}</span>
                        {isApplied ? (
                          <span className="text-xs font-mono font-bold text-[#3cffd0] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> APPLIED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#949494]">APPLY</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#949494] mt-1 leading-snug">{fix.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Incident Resolution Status */}
          {isIncidentResolved ? (
            <div className="space-y-2">
              <div className="p-3 bg-[#3cffd0] text-black font-bold rounded-20px text-center text-xs">
                ✅ INCIDENT RESOLVED · SYSTEM RECOVERED
              </div>
              <VergeButton
                variant="primary"
                onClick={() => setView('mastery')}
                className="w-full"
              >
                View Mastery Profile & Streaks
              </VergeButton>
            </div>
          ) : (
            <div className="text-[11px] text-[#949494] font-mono text-center">
              Apply remediation steps above to bring error rates below 2% and recover the service.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
