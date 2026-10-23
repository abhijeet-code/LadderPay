"use client";

import React from "react";
import { DrunixEvent } from "@/lib/types";
import { Activity, ShieldCheck, Cpu, ArrowUpRight, Terminal } from "lucide-react";

interface DrunixVisualizerProps {
  events: DrunixEvent[];
}

export default function DrunixVisualizer({ events }: DrunixVisualizerProps) {
  return (
    <div className="space-y-6">
      {/* Drunix Engine Architecture Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Core Hackathon Track Orchestrator
              </span>
              <span className="text-xs text-slate-400 font-mono">Drunix State Machine v2.4</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">Drunix Workflow &amp; Event Stream</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Drunix bridges off-chain banking rails (NPCI UPI) with on-chain EVM smart contracts. It guarantees strict idempotency, prevents duplicate invoice factoring, and triggers automated waterfall settlements with zero manual intervention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Event Stream: CONNECTED
            </div>
          </div>
        </div>

        {/* 4 Core Drunix Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">1. Idempotency</span>
            <p className="text-xs text-white mt-1">UUIDv4 idempotency keys block duplicate UPI payouts.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">2. Dual-State Sync</span>
            <p className="text-xs text-white mt-1">Real-time sync between bank UTRs and EVM block events.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">3. Saga Compensation</span>
            <p className="text-xs text-white mt-1">Automated rollback &amp; margin unlocking if funding fails.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">4. Anti-Fraud Registry</span>
            <p className="text-xs text-white mt-1">Global hash lock prevents multi-platform invoice pledge.</p>
          </div>
        </div>
      </div>

      {/* Live Event Stream Timeline */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Live Drunix Saga Log
          </h3>
          <span className="text-xs font-mono text-slate-400">{events.length} Events Logged</span>
        </div>

        <div className="space-y-3 font-mono">
          {events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-white/5 hover:border-cyan-500/30 transition-all flex items-start justify-between flex-wrap gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-slate-500 font-semibold mt-0.5">{evt.timestamp}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{evt.sagaName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {evt.step}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      {evt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans mt-1.5">{evt.details}</p>
                </div>
              </div>

              <div className="text-right text-[11px] space-y-1">
                <div className="text-slate-400">
                  Idempotency: <span className="text-slate-200">{evt.idempotencyKey}</span>
                </div>
                {evt.txHash && (
                  <div className="text-cyan-400 flex items-center justify-end gap-1">
                    <span>tx: {evt.txHash.slice(0, 10)}...</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
