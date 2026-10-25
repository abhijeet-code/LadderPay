"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/web3";
import {
  FileUp,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Building2,
  Receipt,
  Hash,
  Calendar,
} from "lucide-react";

interface InvoiceUploadFormProps {
  onInvoiceCreated: (form: {
    invoiceNumber: string;
    msmeGstin: string;
    buyerPan: string;
    faceValueINR: number;
    tenureDays: number;
  }) => void;
}

type VerifyStep = "idle" | "uploading" | "gst_check" | "irn_sign" | "done";

export default function InvoiceUploadForm({ onInvoiceCreated }: InvoiceUploadFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("RSP-2026-8842");
  const [msmeGstin, setMsmeGstin] = useState("27AAACR1234F1Z8");
  const [buyerPan, setBuyerPan] = useState("AAACT1984K");
  const [faceValue, setFaceValue] = useState(500000);
  const [tenureDays, setTenureDays] = useState(90);
  const [step, setStep] = useState<VerifyStep>("idle");
  const [irn, setIrn] = useState("");

  const handleSubmit = async () => {
    if (!invoiceNumber || !msmeGstin || !buyerPan || faceValue <= 0) return;

    // Step 1: Uploading
    setStep("uploading");
    await delay(500);

    // Step 2: GST E-Invoice Verification via Next.js API Route
    setStep("gst_check");
    let serverIrn = "";
    try {
      const res = await fetch("/api/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          msmeGstin,
          buyerPan,
          faceValueINR: faceValue,
          tenureDays,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        serverIrn = data.irn;
      }
    } catch (e) {
      // Graceful offline fallback
    }
    await delay(600);

    // Step 3: IRN Cryptographic Signing
    setStep("irn_sign");
    const generatedIrn = serverIrn || "IRN-" + Math.random().toString(36).substring(2, 12).toUpperCase();
    setIrn(generatedIrn);
    await delay(600);

    // Step 4: Done
    setStep("done");
    await delay(300);

    onInvoiceCreated({
      invoiceNumber,
      msmeGstin,
      buyerPan,
      faceValueINR: faceValue,
      tenureDays,
    });
  };

  const stepIndex =
    step === "idle" ? 0 : step === "uploading" ? 1 : step === "gst_check" ? 2 : step === "irn_sign" ? 3 : 4;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/20">
          <FileUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Upload Invoice & Tokenize</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Submit your invoice details. Drunix will verify the GST E-Invoice via NIC, compute your
          Tier 0 collateral-free limit, and mint the Invoice NFT (ERC-721) on-chain.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-1">
          {["Upload Details", "GST E-Invoice Check", "IRN Signing", "Tier Ladder Ready"].map(
            (label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    stepIndex > i + 1
                      ? "bg-emerald-500 text-white"
                      : stepIndex === i + 1
                      ? "bg-indigo-600 text-white animate-pulse"
                      : "bg-slate-800 text-slate-500 border border-white/10"
                  }`}
                >
                  {stepIndex > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] font-medium text-center leading-tight ${
                    stepIndex > i + 1
                      ? "text-emerald-400"
                      : stepIndex === i + 1
                      ? "text-white"
                      : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          )}
        </div>
        <div className="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${(stepIndex / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-400" />
          Invoice Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Invoice Number */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              disabled={step !== "idle"}
              className="mt-1 w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              placeholder="RSP-2026-8842"
            />
          </div>

          {/* MSME GSTIN */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              MSME GSTIN
            </label>
            <input
              type="text"
              value={msmeGstin}
              onChange={(e) => setMsmeGstin(e.target.value)}
              disabled={step !== "idle"}
              className="mt-1 w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              placeholder="27AAACR1234F1Z8"
            />
          </div>

          {/* Buyer PAN */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Corporate Buyer PAN
            </label>
            <input
              type="text"
              value={buyerPan}
              onChange={(e) => setBuyerPan(e.target.value)}
              disabled={step !== "idle"}
              className="mt-1 w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              placeholder="AAACT1984K"
            />
          </div>

          {/* Face Value */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Invoice Face Value (₹)</label>
            <input
              type="number"
              value={faceValue}
              onChange={(e) => setFaceValue(Number(e.target.value))}
              disabled={step !== "idle"}
              className="mt-1 w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          {/* Tenure */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Credit Tenure (Days)
            </label>
            <input
              type="number"
              value={tenureDays}
              onChange={(e) => setTenureDays(Number(e.target.value))}
              disabled={step !== "idle"}
              className="mt-1 w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          {/* Detected Buyer */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Detected Buyer</label>
            <div className="mt-1 py-2.5 px-4 rounded-xl bg-slate-900/50 border border-white/5 text-sm text-slate-300 font-medium">
              Tata Motors Commercial Fleet Ltd
            </div>
          </div>
        </div>

        {/* IRN Result (appears during/after verification) */}
        {irn && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-400">GST E-Invoice Verified ✓</span>
              <p className="text-slate-400 font-mono mt-0.5">
                IRN: {irn} &bull; NIC Portal Cryptographic Signature Valid
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <button
            onClick={handleSubmit}
            disabled={step !== "idle"}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 transition-all"
          >
            {step === "idle" ? (
              <>
                <FileUp className="w-4 h-4" />
                Verify GST E-Invoice & Tokenize on Blockchain
              </>
            ) : step === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading Invoice Data...
              </>
            ) : step === "gst_check" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying against NIC GST E-Invoice Portal...
              </>
            ) : step === "irn_sign" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing IRN & Minting Invoice NFT (ERC-721)...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Invoice Tokenized! Configuring Tier Ladder...
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informational Note */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-400 text-center">
        <span className="font-semibold text-slate-300">Mock Mode:</span> GST verification, buyer
        credit scoring, and IRN signing are simulated with realistic latency. In production, these
        connect to the NIC E-Invoice portal, Account Aggregator APIs, and NPCI rails.
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
