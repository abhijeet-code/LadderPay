"use client";

import React, { useState } from "react";
import { InvoiceRecord, WaterfallResult } from "@/lib/types";
import { formatINR } from "@/lib/web3";
import { CheckCircle, ShieldCheck, QrCode, ArrowRight, Zap, RefreshCw } from "lucide-react";

interface BuyerPortalProps {
  invoice: InvoiceRecord;
  onExecuteSettlement: (paidAmount: number) => void;
  waterfallResult: WaterfallResult | null;
  setActiveTab: (tab: "msme" | "investor" | "buyer" | "drunix") => void;
}

export default function BuyerPortal({
  invoice,
  onExecuteSettlement,
  waterfallResult,
  setActiveTab,
}: BuyerPortalProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handlePayUPI = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setShowQR(false);
      onExecuteSettlement(invoice.faceValueINR); // Full payment ₹5,00,000
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Buyer Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Corporate Debtor Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">PAN: {invoice.buyerPan}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">{invoice.buyerName}</h2>
            <p className="text-sm text-slate-400 mt-1">
              Supplier Payable Settlement Console &bull; Registered Corporate UPI: <span className="font-mono text-cyan-300">{invoice.buyerVpa}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Goods Accepted & E-Invoice Signed
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Payable Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Pending Maturity Obligations</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono text-slate-400">Invoice Reference</span>
                <p className="text-base font-bold text-white">{invoice.invoiceNumber}</p>
                <span className="text-xs text-slate-400">Issued by: {invoice.msmeName}</span>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-400">Due Date</span>
                <p className="text-sm font-semibold text-emerald-400">Day 90 (Matured Today)</p>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-400">Total Payable Face Value</span>
                <div className="text-2xl font-black text-white">{formatINR(invoice.faceValueINR)}</div>
              </div>

              <div>
                {waterfallResult ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Settled via UPI
                  </span>
                ) : (
                  <button
                    onClick={() => setShowQR(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                  >
                    <QrCode className="w-4 h-4" /> Pay via NPCI UPI
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NPCI UPI Rail Specs */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              NPCI Settlement Rail
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Buyer settlement is processed through NPCI UPI 2.0 / AutoPay e-Mandate. Instant webhooks notify the Drunix state machine to trigger the Solidity reverse waterfall.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Rail:</span>
                <span className="text-white">UPI 2.0 / P2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Escrow:</span>
                <span className="text-white">Drunix Smart Escrow</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Time:</span>
                <span className="text-emerald-400">&lt; 3 Seconds</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("drunix")}
            className="w-full mt-6 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-white/10"
          >
            Monitor Drunix State Stream <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated UPI QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-sm w-full p-6 border border-white/10 shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-bold text-white">NPCI UPI Pay Order</h3>
            <p className="text-xs text-slate-400">
              Scan or tap to authorize invoice payment of <span className="font-bold text-white">{formatINR(invoice.faceValueINR)}</span> to LadderPay Escrow VPA.
            </p>

            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl flex items-center justify-center shadow-inner">
              <div className="w-full h-full border-4 border-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-900 font-bold text-xs p-2">
                <QrCode className="w-20 h-20 text-slate-900 mb-2" />
                <span className="font-mono text-[10px]">UPI://pay?pa=escrow@ladderpay</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowQR(false)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePayUPI}
                disabled={isPaying}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                {isPaying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying UPI Webhook...
                  </>
                ) : (
                  "Simulate 1-Click UPI Pay"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waterfall Settlement Result (When Paid) */}
      {waterfallResult && (
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Reverse Waterfall Execution Completed
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">
                Settlement Distributed: ₹5,00,000
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">MSME Reputation Upgraded:</span>
              <div className="text-sm font-bold text-indigo-400">
                Level 1 &rarr; Level {waterfallResult.newReputationLevel} (New Tier 0 Cap: ₹2,50,000)
              </div>
            </div>
          </div>

          {/* Reverse Waterfall Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-slate-400 text-[10px]">1. Tier 3 (100% Margin)</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">{formatINR(waterfallResult.tier3PaidINR)}</div>
              <span className="text-[10px] text-slate-400">Repaid First</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-slate-400 text-[10px]">2. Tier 2 (50% Margin)</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">{formatINR(waterfallResult.tier2PaidINR)}</div>
              <span className="text-[10px] text-slate-400">Repaid Second</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-slate-400 text-[10px]">3. Tier 1 (25% Margin)</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">{formatINR(waterfallResult.tier1PaidINR)}</div>
              <span className="text-[10px] text-slate-400">Repaid Third</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <div className="text-slate-400 text-[10px]">4. Tier 0 (0% Margin)</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">{formatINR(waterfallResult.tier0PaidINR)}</div>
              <span className="text-[10px] text-slate-400">Repaid Last (18% Yield)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30">
              <div className="text-indigo-400 text-[10px]">5. 10% Reserve + Collateral</div>
              <div className="text-sm font-bold text-indigo-300 mt-1">
                {formatINR(waterfallResult.reservePaidINR + waterfallResult.collateralReturnedINR)}
              </div>
              <span className="text-[10px] text-indigo-400">Released to Ramesh</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
