"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/web3";
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";

interface DefaultSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerDefault: (shortfallAmount: number) => void;
}

export default function DefaultSimulatorModal({
  isOpen,
  onClose,
  onTriggerDefault,
}: DefaultSimulatorModalProps) {
  const [shortfallAmount, setShortfallAmount] = useState<number>(150000); // Tata Motors pays only ₹3.5L (₹1.5L shortfall)
  const [gracePeriodExpired, setGracePeriodExpired] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setHasRun(true);
      onTriggerDefault(shortfallAmount);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full p-6 border border-rose-500/30 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Default &amp; Liquidation Engine</h3>
              <p className="text-[11px] text-slate-400">Risk Mitigation &amp; Statutory Grace Period Showcase</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Grace Period Notice per Hackathon PDF §3 */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Statutory Grace Period Protocol (NPCI / Factoring Act)</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Per the hackathon specification, when a buyer payment is delayed on Day 90 maturity, a <strong>72-hour grace period</strong> applies. If no settlement is received by Day 93, Drunix fires the smart contract liquidation saga.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[10px] text-amber-400 font-mono">
            <span>Maturity: Day 90 (Unpaid)</span>
            <span>&rarr;</span>
            <span>Grace: T+72h (Expired)</span>
            <span>&rarr;</span>
            <span className="text-rose-400 font-bold">Liquidation Triggered</span>
          </div>
        </div>

        {/* Shortfall Amount Config */}
        <div>
          <label className="text-xs font-semibold text-slate-300">Simulated Buyer Shortfall Amount</label>
          <div className="mt-1 relative">
            <input
              type="number"
              step={10000}
              value={shortfallAmount}
              onChange={(e) => setShortfallAmount(Number(e.target.value))}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Buyer pays ₹3,50,000 instead of ₹5,00,000 (Shortfall: {formatINR(shortfallAmount)})
          </p>
        </div>

        {/* Liquidation Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Ramesh&apos;s Margin in Vault:</span>
            <span className="text-amber-400 font-bold">₹1,12,500</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Senior Tranches (T3 &amp; T2):</span>
            <span className="text-emerald-400 font-bold">100% Repaid from Seized Margin</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Junior Tier 0 (18% Yield):</span>
            <span className="text-rose-400 font-bold">First-Loss Haircut (As Expected)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>MSME Reputation Impact:</span>
            <span className="text-rose-400 font-bold">Tier 0 Cap Slashed to ₹25,000</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            disabled={isExecuting}
            className="w-2/3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-600/30"
          >
            {isExecuting ? (
              "Executing Grace Expiry & Liquidation..."
            ) : hasRun ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Liquidation Complete
              </>
            ) : (
              "Simulate Grace Expiry & Liquidate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
