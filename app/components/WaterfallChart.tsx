"use client";

import React from "react";
import { WaterfallResult } from "@/lib/types";
import { formatINR } from "@/lib/web3";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface WaterfallChartProps {
  result: WaterfallResult;
}

export default function WaterfallChart({ result }: WaterfallChartProps) {
  const data = [
    {
      name: "Tier 3 (9%)",
      amount: result.tier3PaidINR,
      color: "#10b981",
      order: "#1 Senior",
    },
    {
      name: "Tier 2 (11%)",
      amount: result.tier2PaidINR,
      color: "#06b6d4",
      order: "#2",
    },
    {
      name: "Tier 1 (14%)",
      amount: result.tier1PaidINR,
      color: "#6366f1",
      order: "#3",
    },
    {
      name: "Tier 0 (18%)",
      amount: result.tier0PaidINR,
      color: result.isDefault ? "#ef4444" : "#f59e0b",
      order: "#4 Junior",
    },
    {
      name: "Reserve",
      amount: result.reservePaidINR,
      color: "#8b5cf6",
      order: "MSME",
    },
    {
      name: "Collateral",
      amount: result.isDefault ? result.collateralLiquidatedINR : result.collateralReturnedINR,
      color: result.isDefault ? "#ef4444" : "#34d399",
      order: result.isDefault ? "Seized" : "Released",
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-xl text-xs backdrop-blur">
        <p className="font-bold text-white mb-1">{d.name}</p>
        <p className="text-slate-300">
          Amount: <span className="font-mono text-white">{formatINR(d.amount)}</span>
        </p>
        <p className="text-slate-400 mt-0.5">
          Priority: <span className="text-indigo-300">{d.order}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Reverse Waterfall Distribution
            {result.isDefault && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                DEFAULT — Collateral Liquidated
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Buyer paid {formatINR(result.buyerPaidINR)} of {formatINR(500000)} face value.
            {!result.isDefault && " All tranches repaid in full. Collateral and reserve released to MSME."}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Settlement Direction</span>
          <div className="text-sm font-bold text-indigo-300 font-mono">
            T3 → T2 → T1 → T0 → MSME
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
              <LabelList
                dataKey="amount"
                position="top"
                fill="#e2e8f0"
                fontSize={10}
                formatter={(v: number) => formatINR(v)}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Strip */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5 text-[10px] flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-slate-400">Senior (Repaid First)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
          <span className="text-slate-400">Mezzanine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
          <span className="text-slate-400">Subordinate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-slate-400">Junior (First-Loss)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
          <span className="text-slate-400">MSME Reserve</span>
        </div>
      </div>
    </div>
  );
}
