"use client";

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import MSMEDashboard from "./components/MSMEDashboard";
import InvestorMarketplace from "./components/InvestorMarketplace";
import BuyerPortal from "./components/BuyerPortal";
import DrunixVisualizer from "./components/DrunixVisualizer";
import DefaultSimulatorModal from "./components/DefaultSimulatorModal";
import { INITIAL_INVOICE, INITIAL_DRUNIX_EVENTS } from "@/lib/store";
import { InvoiceRecord, DrunixEvent, WaterfallResult } from "@/lib/types";
import { formatINR } from "@/lib/web3";
import { ArrowUpRight, Zap, Shield, TrendingUp, Clock } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"msme" | "investor" | "buyer" | "drunix">("msme");
  const [invoice, setInvoice] = useState<InvoiceRecord>(INITIAL_INVOICE);
  const [drunixEvents, setDrunixEvents] = useState<DrunixEvent[]>(INITIAL_DRUNIX_EVENTS);
  const [waterfallResult, setWaterfallResult] = useState<WaterfallResult | null>(null);
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false);

  // Trigger simulated instant disbursal
  const handleTriggerDisbursal = () => {
    const updated: InvoiceRecord = {
      ...invoice,
      status: "DISBURSED",
      payoutUtr: `NPCI/UPI/20261023/${Math.floor(100000000 + Math.random() * 900000000)}`,
    };
    setInvoice(updated);

    const newEvt: DrunixEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sagaName: "DisbursalSaga",
      step: "INSTANT_UPI_DISBURSE",
      status: "SUCCESS",
      idempotencyKey: `idemp-payout-${Date.now()}`,
      details: `Instant NPCI UPI transfer of ${formatINR(invoice.netDisbursalINR)} credited to ${invoice.msmeVpa}`,
    };
    setDrunixEvents((prev) => [newEvt, ...prev]);
  };

  // Fund tranche fractional share
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

    setInvoice({
      ...invoice,
      tranches: updatedTranches,
    });

    const newEvt: DrunixEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sagaName: "TrancheFundingSaga",
      step: "FRACTIONAL_INVESTMENT",
      status: "SUCCESS",
      idempotencyKey: `idemp-invest-${Date.now()}`,
      details: `Investor subscribed ${formatINR(amount)} into Tier ${tierIndex}. New ERC-1155 tokens minted.`,
      txHash: "0x" + Math.random().toString(16).substring(2, 42),
    };
    setDrunixEvents((prev) => [newEvt, ...prev]);
  };

  // Execute reverse waterfall settlement
  const handleExecuteSettlement = (paidAmount: number) => {
    // Reverse Waterfall: Tier 3 -> Tier 2 -> Tier 1 -> Tier 0
    const result: WaterfallResult = {
      invoiceId: invoice.id,
      buyerPaidINR: paidAmount,
      tier3PaidINR: 51125, // Principal + 90d yield @ 9%
      tier2PaidINR: 154125, // Principal + 90d yield @ 11%
      tier1PaidINR: 155250, // Principal + 90d yield @ 14%
      tier0PaidINR: 104500, // Principal + 90d yield @ 18%
      reservePaidINR: 50000, // 10% reserve released to Ramesh
      collateralReturnedINR: invoice.collateralDepositedINR, // ₹1,12,500 released
      collateralLiquidatedINR: 0,
      isDefault: false,
      newReputationLevel: 2,
    };

    setWaterfallResult(result);
    setInvoice({
      ...invoice,
      status: "SETTLED",
      reputationLevel: 2,
      tier0CapINR: 250000, // Upgraded from ₹1,00,000 to ₹2,50,000!
    });

    const newEvt: DrunixEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sagaName: "WaterfallSettlementSaga",
      step: "WATERFALL_EXECUTION_COMPLETE",
      status: "SUCCESS",
      idempotencyKey: `idemp-waterfall-${Date.now()}`,
      details: `Full repayment of ₹5,00,000 distributed via reverse waterfall. Collateral & 10% reserve released. MSME upgraded to Reputation Level 2!`,
      txHash: "0x77f98a2bc491024bc019284102948192841bce8a",
    };
    setDrunixEvents((prev) => [newEvt, ...prev]);
  };

  // Trigger default & liquidation scenario
  const handleTriggerDefault = (shortfallAmount: number) => {
    const paidAmount = invoice.faceValueINR - shortfallAmount;
    const result: WaterfallResult = {
      invoiceId: invoice.id,
      buyerPaidINR: paidAmount,
      tier3PaidINR: 51125, // Tier 3 made 100% whole
      tier2PaidINR: 154125, // Tier 2 made 100% whole
      tier1PaidINR: 144750, // Tier 1 partially recovered
      tier0PaidINR: 0, // Junior tier absorbs first-loss
      reservePaidINR: 0,
      collateralReturnedINR: 0,
      collateralLiquidatedINR: 112500, // All collateral liquidated
      isDefault: true,
      newReputationLevel: 1,
    };

    setWaterfallResult(result);
    setInvoice({
      ...invoice,
      status: "DEFAULTED",
      tier0CapINR: 25000, // Slashed as penalty
    });

    const newEvt: DrunixEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sagaName: "DefaultLiquidationSaga",
      step: "COLLATERAL_VAULT_LIQUIDATED",
      status: "SUCCESS",
      idempotencyKey: `idemp-liquidate-${Date.now()}`,
      details: `Buyer shortfall of ${formatINR(shortfallAmount)}. Liquidated ₹1,12,500 from CollateralVault to protect Senior Tier 3 & 2 investors.`,
      txHash: "0xee4102948192841bce8a77f98a2bc491024bc019",
    };
    setDrunixEvents((prev) => [newEvt, ...prev]);
    setIsDefaultModalOpen(false);
    setActiveTab("buyer");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDefaultModal={() => setIsDefaultModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hackathon Hero Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <Zap className="w-4 h-4 text-cyan-400" />
              Time from Upload to Cash
            </div>
            <div className="text-2xl font-black text-white mt-2">&lt; 10 Minutes</div>
            <span className="text-[11px] text-emerald-400 font-medium">Instant UPI 2.0 Payout</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Weighted Cost of Funds
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
            <span className="text-[11px] text-emerald-400 font-medium">₹1.12L unlocks ₹4.5L advance</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <Clock className="w-4 h-4 text-amber-400" />
              Reputation Growth
            </div>
            <div className="text-2xl font-black text-white mt-2">+150% Cap</div>
            <span className="text-[11px] text-amber-400 font-medium">Clean settlement raises Tier 0</span>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === "msme" && (
          <MSMEDashboard
            invoice={invoice}
            onUpdateInvoice={setInvoice}
            onTriggerDisbursal={handleTriggerDisbursal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "investor" && (
          <InvestorMarketplace
            invoice={invoice}
            onFundTranche={handleFundTranche}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "buyer" && (
          <BuyerPortal
            invoice={invoice}
            onExecuteSettlement={handleExecuteSettlement}
            waterfallResult={waterfallResult}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "drunix" && (
          <DrunixVisualizer events={drunixEvents} />
        )}
      </main>

      {/* Bonus Risk Awareness Simulation Modal */}
      <DefaultSimulatorModal
        isOpen={isDefaultModalOpen}
        onClose={() => setIsDefaultModalOpen(false)}
        onTriggerDefault={handleTriggerDefault}
      />
    </div>
  );
}
