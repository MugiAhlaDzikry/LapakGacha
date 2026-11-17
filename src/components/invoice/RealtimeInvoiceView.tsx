"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { Transaction } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";
import {
  ADMIN_WHATSAPP_RAW,
  buildAdminTelegramUrl,
  buildAdminWhatsAppUrl,
  buildInvoiceWhatsAppMessage,
} from "@/lib/whatsapp";
import {
  TelegramGlyph,
  WhatsAppGlyph,
} from "@/components/whatsapp/WhatsAppQrCode";
import { PaymentInstructionCard } from "./PaymentInstructionCard";
import { SandboxSimulatorPanel } from "./SandboxSimulatorPanel";

interface RealtimeInvoiceViewProps {
  initialTransaction: Transaction;
}

export function RealtimeInvoiceView({
  initialTransaction,
}: RealtimeInvoiceViewProps) {
  const [transaction, setTransaction] =
    useState<Transaction>(initialTransaction);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedSn, setCopiedSn] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const diff = Math.floor(
      (new Date(initialTransaction.expired_at).getTime() - Date.now()) / 1000
    );
    return Math.max(0, diff);
  });

  // Countdown timer when UNPAID
  useEffect(() => {
    if (transaction.payment_status !== "UNPAID") return;

    const interval = setInterval(() => {
      const diff = Math.floor(
        (new Date(transaction.expired_at).getTime() - Date.now()) / 1000
      );
      setRemainingSeconds(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [transaction.expired_at, transaction.payment_status]);

  // Supabase Realtime postgres_changes listener + fallback synchronization
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`invoice-${transaction.invoice_number}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `invoice_number=eq.${transaction.invoice_number}`,
        },
        (payload) => {
          if (payload.new) {
            setTransaction((prev) => ({
              ...prev,
              ...(payload.new as Partial<Transaction>),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transaction.invoice_number]);

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  function handleCopyInvoice() {
    navigator.clipboard?.writeText(transaction.invoice_number);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  }

  function handleCopySn() {
    if (!transaction.serial_number) return;
    navigator.clipboard?.writeText(transaction.serial_number);
    setCopiedSn(true);
    setTimeout(() => setCopiedSn(false), 2000);
  }

  async function handleSimulateSuccess() {
    setIsSimulating(true);
    try {
      // Step 1: Trigger PAID + PROCESSING
      const res1 = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: transaction.invoice_number,
          action: "SUCCESS",
        }),
      });
      const data1 = await res1.json();
      if (data1.transaction) {
        setTransaction(data1.transaction);
      }

      // Step 2: Wait 2000ms for fulfillment simulation and confirm SUCCESS + SN
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const res2 = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: transaction.invoice_number,
          action: "SUCCESS",
          stage: "COMPLETE_FULFILLMENT",
        }),
      });
      const data2 = await res2.json();
      if (data2.transaction) {
        setTransaction(data2.transaction);
      }
    } finally {
      setIsSimulating(false);
    }
  }

  async function handleSimulateExpire() {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: transaction.invoice_number,
          action: "EXPIRE",
        }),
      });
      const data = await res.json();
      if (data.transaction) {
        setTransaction(data.transaction);
      }
    } finally {
      setIsSimulating(false);
    }
  }

  // Compute current active progress step (1..4)
  const isExpiredOrFailed =
    transaction.payment_status === "EXPIRED" ||
    transaction.payment_status === "FAILED";

  const currentStep =
    transaction.fulfillment_status === "SUCCESS"
      ? 4
      : transaction.fulfillment_status === "PROCESSING" ||
        transaction.payment_status === "PAID"
      ? 3
      : 2;

  const steps = [
    {
      num: "01",
      title: "Transaksi Dibuat",
      desc: "Order tercatat di sistem",
    },
    {
      num: "02",
      title: "Menunggu Pembayaran",
      desc:
        transaction.payment_status === "PAID"
          ? "Pembayaran telah diterima"
          : isExpiredOrFailed
          ? "Waktu pembayaran habis"
          : "Selesaikan sebelum timer habis",
    },
    {
      num: "03",
      title: "Memproses Top-Up",
      desc:
        transaction.fulfillment_status === "PROCESSING"
          ? "Mengirim item ke server game..."
          : transaction.fulfillment_status === "SUCCESS"
          ? "Distribusi API selesai"
          : "Menunggu konfirmasi bayar",
    },
    {
      num: "04",
      title: "Diamond Terkirim",
      desc:
        transaction.fulfillment_status === "SUCCESS"
          ? "Item telah masuk ke akun"
          : "Menunggu proses pengiriman",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Status Header & Countdown Timer */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-5 text-left backdrop-blur-md sm:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
              NOMOR INVOICE RESMI
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <h1 className="font-mono text-xl font-extrabold tracking-tight text-zinc-50 sm:text-2xl tabular-nums">
                {transaction.invoice_number}
              </h1>
              <button
                type="button"
                onClick={handleCopyInvoice}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-zinc-950 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25"
              >
                {copiedInvoice ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 font-mono text-xs text-zinc-400 tabular-nums">
              Waktu Transaksi:{" "}
              {new Date(transaction.created_at).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "medium",
              })}
            </p>
          </div>

          {/* Right Status Badge + Countdown */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              {transaction.payment_status === "PAID" &&
                transaction.fulfillment_status === "SUCCESS" && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    LUNAS &amp; TERKIRIM
                  </span>
                )}

              {transaction.payment_status === "PAID" &&
                transaction.fulfillment_status === "PROCESSING" && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    MEMPROSES PENGIRIMAN
                  </span>
                )}

              {transaction.payment_status === "UNPAID" && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-amber-400">
                  MENUNGGU PEMBAYARAN
                </span>
              )}

              {isExpiredOrFailed && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/15 px-3 py-1 font-mono text-xs font-bold uppercase text-rose-400">
                  <XCircle className="h-4 w-4" />
                  KEDALUWARSA / GAGAL
                </span>
              )}
            </div>

            {transaction.payment_status === "UNPAID" && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-amber-400 tabular-nums">
                <Clock className="h-3.5 w-3.5" />
                <span>Batas Bayar:</span>
                <strong className="text-sm font-bold">
                  {minutes}:{seconds}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* 2. Realtime 4-Step Progress Tracker */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isDone =
              !isExpiredOrFailed &&
              (stepNumber < currentStep ||
                (stepNumber === 4 &&
                  transaction.fulfillment_status === "SUCCESS"));
            const isCurrent =
              !isExpiredOrFailed &&
              stepNumber === currentStep &&
              transaction.fulfillment_status !== "SUCCESS";

            return (
              <div
                key={step.num}
                className={`rounded-xl border p-3.5 text-left transition-colors ${
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                    : isCurrent
                    ? "border-amber-500 bg-amber-500/[0.08] ring-1 ring-amber-500/50"
                    : isExpiredOrFailed && stepNumber === 2
                    ? "border-rose-500/40 bg-rose-500/[0.07]"
                    : "border-white/[0.06] bg-zinc-950/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold tabular-nums ${
                      isDone
                        ? "text-emerald-400"
                        : isCurrent
                        ? "text-amber-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.num}
                  </span>
                  {isDone && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  {isCurrent && (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  )}
                </div>
                <p className="mt-2 font-heading text-xs font-bold text-zinc-100 sm:text-sm">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Serial Number (SN) Proof Box when SUCCESS */}
      {transaction.fulfillment_status === "SUCCESS" &&
        transaction.serial_number && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08] p-5 text-left">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    PENGIRIMAN SELESAI · SERIAL NUMBER (SN) RESMI
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-lg font-extrabold tracking-wide text-zinc-50 sm:text-xl tabular-nums">
                  {transaction.serial_number}
                </p>
                <p className="mt-1 text-xs text-zinc-300">
                  Item{" "}
                  <strong className="text-zinc-100">
                    {transaction.denomination?.name}
                  </strong>{" "}
                  telah berhasil dikirimkan ke akun{" "}
                  <strong className="font-mono text-zinc-100">
                    {transaction.target_nickname} ({transaction.target_user_id})
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySn}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                {copiedSn ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Kode SN Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Salin Kode SN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      {/* 4. Sandbox Payment Simulator Panel */}
      <SandboxSimulatorPanel
        invoiceNumber={transaction.invoice_number}
        paymentStatus={transaction.payment_status}
        fulfillmentStatus={transaction.fulfillment_status}
        isSimulating={isSimulating}
        onSimulateSuccess={handleSimulateSuccess}
        onSimulateExpire={handleSimulateExpire}
      />

      {/* Main Details Grid: Payment Instructions + Order Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PaymentInstructionCard transaction={transaction} />
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-5 text-left backdrop-blur-md">
            <h2 className="border-b border-white/[0.08] pb-3.5 font-heading text-base font-bold text-zinc-50">
              Rincian Pesanan &amp; Akun Tujuan
            </h2>

            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">Kategori Game</dt>
                <dd className="font-semibold text-zinc-100">
                  {transaction.game?.title || "Digital Game Top-Up"}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">Item Nominal</dt>
                <dd className="font-semibold text-amber-400">
                  {transaction.denomination?.name || transaction.denomination_id}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">User ID Tujuan</dt>
                <dd className="font-mono font-semibold text-zinc-100 tabular-nums">
                  {transaction.target_user_id}
                  {transaction.target_zone_id
                    ? ` (${transaction.target_zone_id})`
                    : ""}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">Nickname Terverifikasi</dt>
                <dd className="font-mono font-semibold text-emerald-400">
                  {transaction.target_nickname}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-400">Kontak WhatsApp</dt>
                <dd className="font-mono text-zinc-200 tabular-nums">
                  {transaction.whatsapp_number}
                </dd>
              </div>

              <div className="border-t border-white/[0.08] pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Harga Produk</dt>
                  <dd className="font-mono text-zinc-200 tabular-nums">
                    {formatRupiah(transaction.amount)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Biaya Layanan ({transaction.payment_code})</dt>
                  <dd className="font-mono text-zinc-200 tabular-nums">
                    {formatRupiah(transaction.fee)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-white/[0.08] pt-2.5">
                  <dt className="font-heading text-sm font-bold text-zinc-50">
                    Total Bayar
                  </dt>
                  <dd className="font-mono text-lg font-extrabold text-amber-400 tabular-nums">
                    {formatRupiah(transaction.total_amount)}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-4">
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href={`/topup/${transaction.game?.slug || "mobile-legends"}`}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-white/[0.12] bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-zinc-800"
                >
                  Transaksi Baru
                </Link>
                <Link
                  href="/track"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                  Riwayat Pesanan
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a
                  href={buildAdminWhatsAppUrl(
                    buildInvoiceWhatsAppMessage(transaction)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 font-mono text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/25 tabular-nums"
                >
                  <WhatsAppGlyph className="h-4 w-4 shrink-0" />
                  <span>WA Admin ({ADMIN_WHATSAPP_RAW})</span>
                </a>

                <a
                  href={buildAdminTelegramUrl(
                    buildInvoiceWhatsAppMessage(transaction)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 font-mono text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/25 tabular-nums"
                >
                  <TelegramGlyph className="h-4 w-4 shrink-0" />
                  <span>Telegram Admin</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
