"use client";

import React from "react";
import { Layers, ShieldCheck, Zap, Activity } from "lucide-react";

interface NavbarProps {
  activeTab: "msme" | "investor" | "buyer" | "drunix";
  setActiveTab: (tab: "msme" | "investor" | "buyer" | "drunix") => void;
  onOpenDefaultModal: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenDefaultModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Ladder<span className="text-indigo-400">Pay</span></span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Hackathon Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Tiered, Collateral-Aware Invoice Financing</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("msme")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "msme"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            MSME Portal (Ramesh)
          </button>
          <button
            onClick={() => setActiveTab("investor")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "investor"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Investor Marketplace
          </button>
          <button
            onClick={() => setActiveTab("buyer")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "buyer"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Buyer Portal (Tata Motors)
          </button>
          <button
            onClick={() => setActiveTab("drunix")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "drunix"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Drunix Live Visualizer
          </button>
        </nav>

        {/* Live Status Indicators & Default Demo Button */}
        <div className="flex items-center gap-2">
          {/* Default Risk Demo Button */}
          <button
            onClick={onOpenDefaultModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            title="Demonstrate risk mitigation: collateral liquidation on buyer default"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            Simulate Default
          </button>

          {/* NPCI UPI Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
            <Zap className="w-3 h-3 text-emerald-400" />
            NPCI UPI: Active
          </div>

          {/* Testnet Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Polygon Amoy (Free EVM)
          </div>
        </div>
      </div>
    </header>
  );
}
