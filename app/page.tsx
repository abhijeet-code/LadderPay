"use client";

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import InvoiceUploadForm from "./components/InvoiceUploadForm";
import MSMEDashboard from "./components/MSMEDashboard";
import InvestorMarketplace from "./components/InvestorMarketplace";
import BuyerPortal from "./components/BuyerPortal";
import DrunixVisualizer from "./components/DrunixVisualizer";
import DefaultSimulatorModal from "./components/DefaultSimulatorModal";
import { INITIAL_INVOICE, INITIAL_DRUNIX_EVENTS, createVerifiedInvoice } from "@/lib/store";
import { InvoiceRecord, DrunixEvent, WaterfallResult } from "@/lib/types";
import { formatINR } from "@/lib/web3";
import {
  useDrunixSaga,
  INVOICE_VERIFY_STEPS,
  COLLATERAL_LOCK_STEPS,
  DISBURSAL_STEPS,
  WATERFALL_STEPS,
  DEFAULT_STEPS,
} from "@/lib/useDrunixSaga";
import { Zap, Shield, TrendingUp, Clock } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"msme" | "investor" | "buyer" | "drunix">("msme");
  const [invoice, setInvoice] = useState<InvoiceRecord>(INITIAL_INVOICE);
  const [drunixEvents, setDrunixEvents] = useState<DrunixEvent[]>(INITIAL_DRUNIX_EVENTS);
  const [waterfallResult, setWaterfallResult] = useState<WaterfallResult | null>(null);
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false);
  const [buyerAccepted, setBuyerAccepted] = useState(false);

  // Live Drunix Saga Hook
  const { runSaga, isRunning: isSagaRunning } = useDrunixSaga(setDrunixEvents);

  // Whether an invoice has been uploaded yet
  const hasInvoice = invoice.status !== "DRAFT" && invoice.id !== "";

  // ─── Phase 1: Invoice Upload & GST Verification ───
  const handleInvoiceCreated = async (form: {
    invoiceNumber: string;
    msmeGstin: string;
    buyerPan: string;
    faceValueINR: number;
    tenureDays: number;
  }) => {
    const verified = createVerifiedInvoice(form);
    setInvoice(verified);

    // Fire Drunix saga events for the verification pipeline
    await runSaga(INVOICE_VERIFY_STEPS);
  };

  // ─── Phase 2: MSME Posts Collateral ───
  const handleUpdateInvoice = (updated: InvoiceRecord) => {
    setInvoice(updated);

    // If collateral was posted, unlock higher tiers and fire Drunix events
    if (updated.status === "COLLATERAL_POSTED") {
      const withUnlocked: InvoiceRecord = {
        ...updated,
        status: "FUNDING_OPEN",
        tranches: updated.tranches.map((t) => ({
          ...t,
          isUnlocked: t.collateralRequiredINR <= updated.collateralDepositedINR || t.tierIndex === 0,
        })),
      };
      setInvoice(withUnlocked);
      runSaga(COLLATERAL_LOCK_STEPS);
    }
  };

  // ─── Phase 3: Buyer Acceptance ───
  const handleBuyerAccept = () => {
    setBuyerAccepted(true);
    const newEvt: DrunixEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sagaName: "BuyerAcceptanceSaga",
      step: "BUYER_SIGN_CONFIRMED",
      status: "SUCCESS",
      idempotencyKey: `idemp-buyer-${Date.now().toString(36)}`,
      details: `${invoice.buyerName} has cryptographically signed acceptance for invoice ${invoice.invoiceNumber}.`,
    };
    setDrunixEvents((prev) => [newEvt, ...prev]);
  };

  // ─── Phase 4: Disbursal ───
  const handleTriggerDisbursal = async () => {
    await runSaga(DISBURSAL_STEPS);

    const updated: InvoiceRecord = {
      ...invoice,
      status: "DISBURSED",
      payoutUtr: `NPCI/UPI/${new Date().toISOString().slice(0, 10).replace(/-/g, "")}/${Math.floor(
        100000000 + Math.random() * 900000000
      )}`,
    };
    setInvoice(updated);
  };

  // ─── Phase 5: Investor Funding ───
  const handleFundTranche = (tierIndex: number, amount: number) => {
    const updatedTranches = invoice.tranches.map((t) => {
      if (t.tierIndex === tierIndex) {
        return {
          ...t,
          fundedAmountINR: Math.min(t.principalINR, t.fundedAmountINR + amount),
        };
      }
      return t;
    });

    const updatedInvoice = {
      ...invoice,
      tranches: updatedTranches,
    };

    // Check if all unlocked tranches are fully funded
    const allFunded = updatedTranches
      .filter((t) => t.isUnlocked)
      .every((t) => t.fundedAmountINR >= t.principalINR);

    if (allFunded && invoice.status === "FUNDING_OPEN") {
      updatedInvoice.status = "FULLY_FUNDED";
    }

    setInvoice(updatedInvoice);

    const newEvt: DrunixEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sagaName: "TrancheFundingSaga",
      step: "FRACTIONAL_INVESTMENT",
      status: "SUCCESS",
      idempotencyKey: `idemp-invest-${Date.now().toString(36)}`,
      details: `Investor subscribed ${formatINR(amount)} into Tier ${tierIndex}. ERC-1155 tokens minted.`,
      txHash: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    };
    setDrunixEvents((prev) => [newEvt, ...prev]);
  };

  // ─── Phase 6: Buyer UPI Settlement & Reverse Waterfall ───
  const handleExecuteSettlement = async (paidAmount: number) => {
    await runSaga(WATERFALL_STEPS);

    const result: WaterfallResult = {
      invoiceId: invoice.id,
      buyerPaidINR: paidAmount,
      tier3PaidINR: 51125,
      tier2PaidINR: 154125,
      tier1PaidINR: 155250,
      tier0PaidINR: 104500,
      reservePaidINR: 50000,
      collateralReturnedINR: invoice.collateralDepositedINR,
      collateralLiquidatedINR: 0,
      isDefault: false,
      newReputationLevel: 2,
    };

    setWaterfallResult(result);
    setInvoice({
      ...invoice,
      status: "SETTLED",
      reputationLevel: 2,
      tier0CapINR: 250000,
    });
  };

  // ─── Bonus: Default & Liquidation ───
  const handleTriggerDefault = async (shortfallAmount: number) => {
    setIsDefaultModalOpen(false);
    setActiveTab("drunix");

    await runSaga(DEFAULT_STEPS);

    const paidAmount = invoice.faceValueINR - shortfallAmount;
    const result: WaterfallResult = {
      invoiceId: invoice.id,
      buyerPaidINR: paidAmount,
      tier3PaidINR: 51125,
      tier2PaidINR: 154125,
      tier1PaidINR: 144750,
      tier0PaidINR: 0,
      reservePaidINR: 0,
      collateralReturnedINR: 0,
      collateralLiquidatedINR: 112500,
      isDefault: true,
      newReputationLevel: 1,
    };

    setWaterfallResult(result);
    setInvoice({
      ...invoice,
      status: "DEFAULTED",
      tier0CapINR: 25000,
    });

    setActiveTab("buyer");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDefaultModal={() => setIsDefaultModalOpen(true)}
        hasInvoice={hasInvoice}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Show Upload Form if no invoice yet */}
        {!hasInvoice ? (
          <InvoiceUploadForm onInvoiceCreated={handleInvoiceCreated} />
        ) : (
          <>
            {/* Hackathon Hero Stats Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Upload to Cash
                </div>
                <div className="text-2xl font-black text-white mt-2">&lt; 10 Min</div>
                <span className="text-[11px] text-emerald-400 font-medium">Instant UPI 2.0 Payout</span>
              </div>

              <div className="glass-card rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Weighted Cost
                </div>
                <div className="text-2xl font-black text-white mt-2">13.3% APY</div>
                <span className="text-[11px] text-slate-400">vs 24-36% Informal Credit</span>
              </div>

              <div className="glass-card rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Collateral Efficiency
                </div>
                <div className="text-2xl font-black text-white mt-2">4:1 Ratio</div>
                <span className="text-[11px] text-emerald-400 font-medium">₹1.12L unlocks ₹4.5L</span>
              </div>

              <div className="glass-card rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Reputation Growth
                </div>
                <div className="text-2xl font-black text-white mt-2">+150% Cap</div>
                <span className="text-[11px] text-amber-400 font-medium">Clean settlement upgrades</span>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "msme" && (
              <MSMEDashboard
                invoice={invoice}
                onUpdateInvoice={handleUpdateInvoice}
                onTriggerDisbursal={handleTriggerDisbursal}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "investor" && (
              <InvestorMarketplace
                invoice={invoice}
                onFundTranche={handleFundTranche}
                setActiveTab={setActiveTab}
                buyerAccepted={buyerAccepted}
              />
            )}

            {activeTab === "buyer" && (
              <BuyerPortal
                invoice={invoice}
                onBuyerAccept={handleBuyerAccept}
                buyerAccepted={buyerAccepted}
                onExecuteSettlement={handleExecuteSettlement}
                waterfallResult={waterfallResult}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "drunix" && (
              <DrunixVisualizer events={drunixEvents} />
            )}
          </>
        )}
      </main>

      {/* Default Simulator Modal */}
      <DefaultSimulatorModal
        isOpen={isDefaultModalOpen}
        onClose={() => setIsDefaultModalOpen(false)}
        onTriggerDefault={handleTriggerDefault}
      />
    </div>
  );
}
