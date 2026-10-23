"use client";

import React, { useState } from "react";
import { InvoiceRecord } from "@/lib/types";
import { formatINR } from "@/lib/web3";
import {
  FileText,
  CheckCircle2,
  Lock,
  Unlock,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Sparkles,
  QrCode
} from "lucide-react";

interface MSMEDashboardProps {
  invoice: InvoiceRecord;
  onUpdateInvoice: (invoice: InvoiceRecord) => void;
  onTriggerDisbursal: () => void;
  setActiveTab: (tab: "msme" | "investor" | "buyer" | "drunix") => void;
}

export default function MSMEDashboard({
  invoice,
  onUpdateInvoice,
  onTriggerDisbursal,
  setActiveTab
}: MSMEDashboardProps) {
  const [selectedTiers, setSelectedTiers] = useState<number[]>([0, 1, 2]); // Ramesh selected T0, T1, T2
  const [isDepositing, setIsDepositing] = useState(false);

  // Dynamic calculations based on selected tiers
  const activeTiers = invoice.tranches.filter((t) => selectedTiers.includes(t.tierIndex));
  const totalAdvance = activeTiers.reduce((sum, t) => sum + t.principalINR, 0);
  const totalCollateral = activeTiers.reduce((sum, t) => sum + t.collateralRequiredINR, 0);
  const totalDiscount = activeTiers.reduce((sum, t) => sum + t.cost90DaysINR, 0);
  const netDisbursal = totalAdvance - totalDiscount;

  const handleToggleTier = (tierIndex: number) => {
    if (tierIndex === 0) return; // Tier 0 is always enabled for eligible MSME
    let updated: number[];
    if (selectedTiers.includes(tierIndex)) {
      updated = selectedTiers.filter((t) => t !== tierIndex);
    } else {
      updated = [...selectedTiers, tierIndex].sort();
    }
    setSelectedTiers(updated);
  };

  const handlePostCollateral = () => {
    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      onUpdateInvoice({
        ...invoice,
        collateralDepositedINR: totalCollateral,
        totalAdvanceINR: totalAdvance,
        totalDiscountINR: totalDiscount,
        netDisbursalINR: netDisbursal,
        status: "COLLATERAL_POSTED",
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & MSME Reputation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  GST Verified Supplier
                </span>
                <span className="text-xs text-slate-400">GSTIN: {invoice.msmeGstin}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">{invoice.msmeName}</h2>
              <p className="text-sm text-slate-400 mt-1">
                Connected UPI VPA: <span className="font-mono text-indigo-300">{invoice.msmeVpa}</span>
              </p>
            </div>

            {/* Reputation Ladder Level Pill */}
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3 text-right">
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold justify-end">
                <Sparkles className="w-3.5 h-3.5" />
                Reputation Ladder: Level {invoice.reputationLevel}
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {formatINR(invoice.tier0CapINR)}
              </div>
              <p className="text-[10px] text-slate-400">Current Collateral-Free Limit</p>
            </div>
          </div>

          {/* Quick Invoice Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
            <div>
              <span className="text-xs text-slate-400">Invoice No.</span>
              <p className="text-sm font-semibold text-white mt-0.5">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Corporate Debtor</span>
              <p className="text-sm font-semibold text-white mt-0.5">{invoice.buyerName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Face Value</span>
              <p className="text-sm font-bold text-white mt-0.5">{formatINR(invoice.faceValueINR)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Credit Tenure</span>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">{invoice.tenureDays} Days (Net 90)</p>
            </div>
          </div>
        </div>

        {/* Live Disbursal / Settlement Tracker Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disbursal Status</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {invoice.status}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white">{formatINR(netDisbursal)}</div>
              <p className="text-xs text-slate-400 mt-1">
                Net Instant Cash Advance (after ₹{totalDiscount.toLocaleString("en-IN")} discount)
              </p>
            </div>

            {invoice.payoutUtr && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Instant UPI Payout Credited
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  UTR: {invoice.payoutUtr}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
            <button
              onClick={() => setActiveTab("investor")}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              View Investor Marketplace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* The Core Innovation: The Tier Ladder Selector */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Interactive Tier Ladder: Unlock Cheaper Capital with Margin
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select which slices of your ₹5,00,000 invoice to fund. Tier 0 is always uncollateralized. Each higher tier unlocks cheaper interest rates as you post margin.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Margin Required:</span>
            <div className="text-base font-bold text-amber-400">{formatINR(totalCollateral)}</div>
          </div>
        </div>

        {/* The 4 Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {invoice.tranches.map((tier) => {
            const isSelected = selectedTiers.includes(tier.tierIndex);
            return (
              <div
                key={tier.tierIndex}
                onClick={() => handleToggleTier(tier.tierIndex)}
                className={`relative rounded-xl p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                    : "bg-slate-900/40 border-white/5 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {tier.name}
                  </span>
                  {isSelected ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      <Unlock className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-slate-800 text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Advance Amount */}
                <div className="mt-4">
                  <span className="text-[11px] text-slate-400">Advance Slice</span>
                  <div className="text-xl font-extrabold text-white">{formatINR(tier.principalINR)}</div>
                </div>

                {/* Collateral & Interest Metrics */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Collateral Required:</span>
                    <span className={`font-semibold ${tier.collateralRequiredINR === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      {tier.collateralRequiredINR === 0 ? "None (Free)" : formatINR(tier.collateralRequiredINR)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Discount Rate:</span>
                    <span className="font-bold text-indigo-300">{tier.annualRatePercent}% APY</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">90-Day Cost:</span>
                    <span className="text-slate-300 font-mono">₹{tier.cost90DaysINR.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Risk Tag */}
                <div className="mt-3 text-[10px] text-slate-400 leading-tight">
                  {tier.riskDescription}
                </div>
              </div>
            );
          })}
        </div>

        {/* 10% Reserve Explainer Box */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white">10% Statutory Reserve: ₹50,000</span>
              <p className="text-xs text-slate-400">
                Retained in smart contract until Tata Motors pays on Day 90, then instantly transferred to Ramesh.
              </p>
            </div>
          </div>

          {/* Action Button: Post Collateral to Vault */}
          <button
            onClick={handlePostCollateral}
            disabled={isDepositing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Wallet className="w-4 h-4" />
            {isDepositing
              ? "Locking Margin in Smart Vault..."
              : `Post Margin (${formatINR(totalCollateral)}) & Lock Slices`}
          </button>
        </div>
      </div>
    </div>
  );
}
