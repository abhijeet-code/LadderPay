"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/web3";
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

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
              <p className="text-[11px] text-slate-400">Risk Awareness Simulation (Judge Evaluation Showcase)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200">
          <span className="font-bold">What happens if a buyer fails to pay on maturity?</span>
          <p className="mt-1 text-slate-300">
            LadderPay does not pass losses to senior investors blindly. The smart contract automatically liquidates Ramesh&apos;s posted margin in `CollateralVault.sol` to cover senior tranches, and downgrades the MSME&apos;s reputation tier.
          </p>
        </div>

        {/* Shortfall Amount Config */}
        <div>
          <label className="text-xs font-semibold text-slate-300">Simulated Buyer Shortfall</label>
          <div className="mt-1 relative">
            <input
              type="number"
              value={shortfallAmount}
              onChange={(e) => setShortfallAmount(Number(e.target.value))}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Buyer pays ₹3,50,000 instead of ₹5,00,000 (Shortfall: {formatINR(shortfallAmount)})
          </p>
        </div>

        {/* Liquidation Plan */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Ramesh&apos;s Margin Locked:</span>
            <span className="text-amber-400 font-bold">₹1,12,500</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Senior Tranches Protected:</span>
            <span className="text-emerald-400 font-bold">Tier 3 &amp; Tier 2 (100% Whole)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Junior Tier 0 Impact:</span>
            <span className="text-rose-400 font-bold">Absorbs First-Loss Haircut</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Reputation Penalty:</span>
            <span className="text-rose-400 font-bold">Tier 0 Cap Dropped to ₹25,000</span>
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
              "Executing On-Chain Liquidation..."
            ) : hasRun ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Liquidation Complete
              </>
            ) : (
              "Execute Default & Liquidate Vault"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
