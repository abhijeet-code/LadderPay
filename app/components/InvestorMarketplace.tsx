"use client";

import React, { useState } from "react";
import { InvoiceRecord, TrancheTier } from "@/lib/types";
import { formatINR } from "@/lib/web3";
import { DollarSign, CheckCircle2, ArrowRight, Lock, AlertTriangle, ShieldCheck } from "lucide-react";

interface InvestorMarketplaceProps {
  invoice: InvoiceRecord;
  onFundTranche: (tierIndex: number, amount: number) => void;
  setActiveTab: (tab: "msme" | "investor" | "buyer" | "drunix") => void;
  buyerAccepted?: boolean;
}

export default function InvestorMarketplace({
  invoice,
  onFundTranche,
  setActiveTab,
  buyerAccepted = true,
}: InvestorMarketplaceProps) {
  const [investingTier, setInvestingTier] = useState<TrancheTier | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(25000);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenInvestModal = (tier: TrancheTier) => {
    setErrorMsg(null);
    setInvestingTier(tier);
    // default to min(25000, remaining)
    const remaining = tier.principalINR - tier.fundedAmountINR;
    setInvestAmount(Math.max(10000, Math.min(25000, remaining)));
  };

  const handleConfirmInvestment = () => {
    if (!investingTier) return;
    if (investAmount < 10000) {
      setErrorMsg("Minimum investment per tranche is ₹10,000 (per hackathon specification)");
      return;
    }
    const remaining = investingTier.principalINR - investingTier.fundedAmountINR;
    if (investAmount > remaining) {
      setErrorMsg(`Amount exceeds remaining slice capacity (${formatINR(remaining)})`);
      return;
    }

    onFundTranche(investingTier.tierIndex, investAmount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setInvestingTier(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Institutional & Retail Fractional Pool
              </span>
              <span className="text-xs text-slate-400 font-mono">Standard: ERC-1155 Multi-Token</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-2">
              Tranche Marketplace: Fractional Real Asset Risk Menu
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Invest in tokenized fractional slices of {invoice.msmeName || "MSME"}&apos;s verified invoice to {invoice.buyerName || "Corporate Buyer"}.
              Fund as low as ₹10,000 per tranche. Choose high-yield first-loss tranches or senior collateral-protected tranches.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("buyer")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 border border-white/10"
          >
            Go to Corporate Buyer View <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Buyer Acceptance Notice Banner */}
      {!buyerAccepted && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Buyer Acceptance Pending:</strong> {invoice.buyerName} has not signed off on goods delivery yet. You can still preview tranches; funding activates upon buyer confirmation.
            </span>
          </div>
          <button
            onClick={() => setActiveTab("buyer")}
            className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold"
          >
            Review as Buyer &rarr;
          </button>
        </div>
      )}

      {/* Tranches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {invoice.tranches.map((tier) => {
          const fillRatio = Math.min(100, Math.round((tier.fundedAmountINR / tier.principalINR) * 100));
          const isFullyFunded = tier.fundedAmountINR >= tier.principalINR;
          const isLocked = !tier.isUnlocked;

          return (
            <div
              key={tier.tierIndex}
              className={`glass-card rounded-2xl p-6 flex flex-col justify-between glass-card-hover border ${
                isLocked ? "border-white/5 opacity-70" : "border-white/10"
              }`}
            >
              <div>
                {/* Tier Name & Yield Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{tier.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {tier.annualRatePercent}% APY
                  </span>
                </div>

                {/* Principal Target */}
                <div className="mt-4">
                  <span className="text-xs text-slate-400">Total Slice Size</span>
                  <div className="text-2xl font-bold text-white mt-0.5">{formatINR(tier.principalINR)}</div>
                </div>

                {/* Collateral Protection */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Collateral Backing:</span>
                    <span className="font-semibold text-emerald-400">
                      {tier.collateralRatioPercent}% Margin
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Locked Vault Margin:</span>
                    <span className="font-mono text-slate-300">{formatINR(tier.collateralRequiredINR)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Waterfall Priority:</span>
                    <span className="font-semibold text-indigo-300">
                      {tier.tierIndex === 3 ? "#1 (Repaid First)" : tier.tierIndex === 0 ? "Last (First-Loss)" : `#${4 - tier.tierIndex}`}
                    </span>
                  </div>
                </div>

                {/* Funding Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Subscription</span>
                    <span className="font-mono font-semibold text-white">{fillRatio}% Funded</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${fillRatio}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Funded: {formatINR(tier.fundedAmountINR)}</span>
                    <span>Target: {formatINR(tier.principalINR)}</span>
                  </div>
                </div>
              </div>

              {/* Invest Button */}
              <div className="mt-6 pt-4 border-t border-white/5">
                {isLocked ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-slate-800/40 text-slate-500 border border-white/5 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Locked: Awaiting MSME Margin
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenInvestModal(tier)}
                    disabled={isFullyFunded}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isFullyFunded
                        ? "bg-slate-800 text-slate-400 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    {isFullyFunded ? "100% Fully Subscribed" : `Invest in ${tier.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Investment Modal */}
      {investingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Invest in {investingTier.name}</h3>
                <span className="text-[11px] text-indigo-400 font-mono">Min Ticket: ₹10,000 (ERC-1155 Fractional Units)</span>
              </div>
              <button
                onClick={() => setInvestingTier(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Purchasing fractional ERC-1155 tranche tokens on Polygon Amoy testnet. Earns{" "}
              <span className="font-bold text-indigo-400">{investingTier.annualRatePercent}% APY</span> over {invoice.tenureDays} days.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300">Investment Amount (INR)</label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={investAmount}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setInvestAmount(Number(e.target.value));
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-base focus:outline-none focus:border-indigo-500"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </p>
              )}

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setErrorMsg(null);
                      setInvestAmount(amt);
                    }}
                    className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-mono"
                  >
                    +{formatINR(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Returns Box */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Tenure:</span>
                <span className="text-white font-medium">{invoice.tenureDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Yield ({invoice.tenureDays} Days):</span>
                <span className="text-emerald-400 font-bold font-mono">
                  +{formatINR(Math.round((investAmount * investingTier.annualRatePercent * invoice.tenureDays) / (365 * 100)))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Collateral Protection:</span>
                <span className="text-emerald-400 font-medium">
                  {investingTier.collateralRatioPercent}% Margin in Smart Vault
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setInvestingTier(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInvestment}
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirmed!
                  </>
                ) : (
                  "Confirm Investment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
