"use client";

import React from "react";
import { Terminal, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { FulfillmentStatus, PaymentStatus } from "@/lib/supabase/database.types";

interface SandboxSimulatorPanelProps {
  invoiceNumber: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  isSimulating: boolean;
  onSimulateSuccess: () => void;
  onSimulateExpire: () => void;
}

export function SandboxSimulatorPanel({
  invoiceNumber,
  paymentStatus,
  fulfillmentStatus,
  isSimulating,
  onSimulateSuccess,
  onSimulateExpire,
}: SandboxSimulatorPanelProps) {
  const isCompleted =
    paymentStatus === "PAID" && fulfillmentStatus === "SUCCESS";
  const isExpired = paymentStatus === "EXPIRED" || paymentStatus === "FAILED";

  return (
    <aside
      aria-label="Sandbox Payment Simulator"
      className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/[0.04] p-4 text-left"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            Sandbox Payment Simulator
          </span>
        </div>
        <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 tabular-nums">
          DEV WEBHOOK
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-zinc-300">
        Mode Simulasi Aktif: Gunakan kontrol di bawah ini untuk memicu webhook pembayaran secara instan pada invoice{" "}
        <span className="font-mono font-semibold text-zinc-100 tabular-nums">
          {invoiceNumber}
        </span>
        .
      </p>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onSimulateSuccess}
          disabled={isSimulating || isCompleted}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSimulating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memicu Webhook Realtime...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Simulasikan Bayar Sukses (Auto-Fulfill)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSimulateExpire}
          disabled={isSimulating || isCompleted || isExpired}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 font-heading text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-zinc-900 disabled:text-zinc-500"
        >
          <XCircle className="h-4 w-4" />
          <span>Simulasikan Kedaluwarsa (Expired)</span>
        </button>
      </div>
    </aside>
  );
}
