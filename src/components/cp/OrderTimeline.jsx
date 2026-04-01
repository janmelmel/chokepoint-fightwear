import React from 'react';
import {
  CheckCircle, Clock, Star, Hammer, ShieldCheck, Package, Truck,
  AlertTriangle, RotateCcw, CheckCircle2
} from 'lucide-react';

const STEP_CONFIG = [
  { step: 1, label: 'Order Confirmed',          icon: CheckCircle,  color: '#22c55e' },
  { step: 2, label: 'Pending Customer Approval', icon: Clock,        color: '#facc15' },
  { step: 3, label: 'Digitizing Order',          icon: Star,         color: '#60a5fa' },
  { step: 4, label: 'In Production',             icon: Hammer,       color: '#ff8c00' },
  { step: 5, label: 'Quality Control',           icon: ShieldCheck,  color: '#a78bfa' },
  { step: 6, label: 'Packing',                   icon: Package,      color: '#22d3ee' },
  { step: 7, label: 'Ready for Delivery',        icon: Truck,        color: '#86efac' },
];

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderTimeline({ history, currentStep, isCancelled, isCompleted, loadingTrello }) {
  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 py-4 px-1">
        <AlertTriangle className="w-5 h-5 text-[#ff0000]" />
        <div>
          <p className="font-mono-ui text-xs text-[#ff0000] uppercase tracking-widest">Order Cancelled</p>
          <p className="font-mono-ui text-[10px] text-[#555]">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  if (loadingTrello) {
    return (
      <div className="flex items-center gap-2 py-4 px-1">
        <div className="w-4 h-4 border-2 border-[#333] border-t-[#ff8c00] rounded-full animate-spin" />
        <p className="font-mono-ui text-[10px] text-[#555]">Fetching live production status...</p>
      </div>
    );
  }

  // Build a merged view: completed steps with timestamps + pending steps
  // Start from the history records we have, fill in remaining steps as pending
  const historyByStep = {};
  const historyItems = []; // ordered events including reverts

  // All history events in order
  if (history && history.length > 0) {
    for (const h of history) {
      historyItems.push(h);
      // Track the latest date per step (for the step node display)
      if (!historyByStep[h.step] || new Date(h.changed_at) > new Date(historyByStep[h.step].changed_at)) {
        historyByStep[h.step] = h;
      }
    }
  }

  const hasHistory = historyItems.length > 0;

  return (
    <div className="space-y-0">
      {STEP_CONFIG.map((stepCfg, idx) => {
        const Icon = stepCfg.icon;
        const isDone = stepCfg.step < currentStep || (isCompleted && stepCfg.step <= 7);
        const isCurrent = stepCfg.step === currentStep && !isCompleted;
        const isPending = stepCfg.step > currentStep && !isCompleted;
        const histEntry = historyByStep[stepCfg.step];

        // Find reverts that happened AT this step (a revert back to a lower step, showing as a detour)
        const revertsAtThisStep = hasHistory
          ? historyItems.filter(h => h.event_type === 'revert' && h.step === stepCfg.step)
          : [];

        const color = isPending ? '#333' : stepCfg.color;
        const isLast = idx === STEP_CONFIG.length - 1;

        return (
          <div key={stepCfg.step} className="flex gap-4">
            {/* Left: icon + connector line */}
            <div className="flex flex-col items-center" style={{ minWidth: 32 }}>
              <div
                className="w-8 h-8 flex items-center justify-center border-2 flex-shrink-0 z-10 transition-all"
                style={{
                  borderColor: isCurrent ? stepCfg.color : isPending ? '#2a2a2a' : stepCfg.color,
                  background: isCurrent ? `${stepCfg.color}18` : isPending ? '#111' : `${stepCfg.color}25`,
                  boxShadow: isCurrent ? `0 0 12px ${stepCfg.color}55` : 'none',
                }}
              >
                {isDone || (isCompleted && stepCfg.step <= 7)
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: stepCfg.color }} />
                  : <Icon className="w-4 h-4" style={{ color: isPending ? '#333' : stepCfg.color }} />
                }
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 my-1"
                  style={{
                    minHeight: 28,
                    background: isDone ? stepCfg.color : '#1e1e1e',
                    opacity: isDone ? 0.5 : 1,
                  }}
                />
              )}
            </div>

            {/* Right: content */}
            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p
                    className="font-mono-ui text-xs uppercase tracking-widest font-bold"
                    style={{ color: isPending ? '#333' : stepCfg.color }}
                  >
                    {stepCfg.label}
                  </p>
                  {isCurrent && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <p className="font-mono-ui text-[9px] text-green-400 uppercase tracking-widest">Current Stage</p>
                    </div>
                  )}
                  {isPending && (
                    <p className="font-mono-ui text-[9px] text-[#333] uppercase tracking-widest mt-0.5">Pending</p>
                  )}
                </div>
                {histEntry?.changed_at && (
                  <p className="font-mono-ui text-[9px] text-[#555] flex-shrink-0">
                    {formatDate(histEntry.changed_at)}
                  </p>
                )}
              </div>

              {/* Revert events at this step */}
              {revertsAtThisStep.map((r, i) => (
                <div key={i} className="mt-2 flex items-start gap-2 border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                  <RotateCcw className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono-ui text-[9px] text-yellow-400 uppercase tracking-widest">Reverted to this stage</p>
                    <p className="font-mono-ui text-[9px] text-[#555]">{formatDate(r.changed_at)}</p>
                    {r.notes && <p className="font-mono-ui text-[9px] text-[#666] mt-0.5">{r.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}