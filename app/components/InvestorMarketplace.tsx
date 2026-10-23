"use client";

import React, { useState } from "react";
import { InvoiceRecord, TrancheTier } from "@/lib/types";
import { formatINR } from "@/lib/web3";
import { ShieldCheck, TrendingUp, DollarSign, CheckCircle2, ArrowRight } from "lucide-react";

interface InvestorMarketplaceProps {
  invoice: InvoiceRecord;
  onFundTranche: (tierIndex: number, amount: number) => void;
  setActiveTab: (tab: "msme" | "investor" | "buyer" | "drunix") => void;
}

export default function InvestorMarketplace({ invoice, onFundTranche, setActiveTab }: InvestorMarketplaceProps) {
  const [investingTier, setInvestingTier] = useState<TrancheTier | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(25000);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmInvestment = () => {
    if (!investingTier) return;
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
              <span className="text-xs text-slate-400 font-mono">Token Standard: ERC-1155</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-2">
              Tranche Marketplace: Pick Your Risk Appetite
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Invest in tokenized fractional slices of Ramesh Steel&apos;s invoice to Tata Motors. Choose high-yield first-loss tranches or low-risk collateralized tranches with reverse waterfall priority repayment.
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

      {/* Tranches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {invoice.tranches.map((tier) => {
          const fillRatio = Math.min(100, Math.round((tier.fundedAmountINR / tier.principalINR) * 100));
          const isFullyFunded = tier.fundedAmountINR >= tier.principalINR;

          return (
            <div
              key={tier.tierIndex}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between glass-card-hover border border-white/5"
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
                <button
                  onClick={() => setInvestingTier(tier)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isFullyFunded
                      ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {isFullyFunded ? "Top Up / Reinvest" : `Invest in ${tier.name}`}
                </button>
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
              <h3 className="text-lg font-bold text-white">Invest in {investingTier.name}</h3>
              <button
                onClick={() => setInvestingTier(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Purchasing fractional ERC-1155 tokens on testnet. Earns{" "}
              <span className="font-bold text-indigo-400">{investingTier.annualRatePercent}% APY</span> over 90 days.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300">Investment Amount (INR)</label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-base focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setInvestAmount(amt)}
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
                <span className="text-white font-medium">90 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Yield (90 Days):</span>
                <span className="text-emerald-400 font-bold font-mono">
                  +{formatINR(Math.round((investAmount * investingTier.annualRatePercent * 90) / (365 * 100)))}
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
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
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
