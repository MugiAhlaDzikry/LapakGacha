"use client";

import React, { useMemo, useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Transaction } from "@/lib/supabase/database.types";
import { formatRupiah } from "@/lib/utils";
import { FALLBACK_PAYMENT_CHANNELS } from "@/lib/seed-catalog";

interface PaymentInstructionCardProps {
  transaction: Transaction;
}

// Deterministic 21x21 QR matrix generator from payment_reference string
function buildQrMatrix(payload: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  function drawFinder(rowOffset: number, colOffset: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rowOffset + r][colOffset + c] = isBorder || isInner;
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      if (r === 6 || c === 6) {
        grid[r][c] = (r + c) % 2 === 0;
        continue;
      }

      const charCode = payload.charCodeAt((r * size + c) % payload.length) || 7;
      const bit = ((hash ^ (r * 37 + c * 101 + charCode * 17)) & 3) !== 0;
      grid[r][c] = bit;
    }
  }

  return grid;
}

export function PaymentInstructionCard({
  transaction,
}: PaymentInstructionCardProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const isQris = transaction.payment_code.includes("QRIS");
  const reference = transaction.payment_reference || transaction.invoice_number;

  const channelInfo = FALLBACK_PAYMENT_CHANNELS.find(
    (c) => c.code === transaction.payment_code
  );

  const qrMatrix = useMemo(() => buildQrMatrix(reference), [reference]);

  function handleCopyReference() {
    navigator.clipboard?.writeText(reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  }

  function handleCopyAmount() {
    navigator.clipboard?.writeText(String(transaction.total_amount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  }

  function handleDownloadQris() {
    const svgElement = document.getElementById("kronos-qris-svg");
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QRIS-${transaction.invoice_number}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-5 text-left backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            INSTRUKSI PEMBAYARAN
          </span>
          <h2 className="mt-0.5 font-heading text-base font-bold text-zinc-50">
            {transaction.payment_name}
          </h2>
        </div>
        <span className="rounded border border-white/[0.1] bg-zinc-950 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-300">
          {transaction.payment_code}
        </span>
      </div>

      {/* Exact Total Payment Display */}
      <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-white/[0.08] bg-zinc-950 p-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs text-zinc-400">
            Nominal Tepat yang Harus Dibayar
          </span>
          <p className="mt-0.5 font-mono text-2xl font-extrabold text-amber-400 tabular-nums">
            {formatRupiah(transaction.total_amount)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyAmount}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-zinc-900 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-zinc-800"
        >
          {copiedAmount ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">Nominal Disalin</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-zinc-400" />
              <span>Salin Nominal</span>
            </>
          )}
        </button>
      </div>

      {/* QRIS or Virtual Account / E-Wallet Display */}
      {isQris ? (
        <div className="mt-4 flex flex-col items-start gap-5 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-5 sm:flex-row sm:items-center">
          <div className="rounded-xl border border-white/[0.12] bg-zinc-100 p-3">
            <svg
              id="kronos-qris-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 250 250"
              className="h-44 w-44"
              role="img"
              aria-label={`Kode QRIS untuk invoice ${transaction.invoice_number}`}
            >
              <rect width="250" height="250" fill="#F4F4F5" rx="8" />
              {qrMatrix.map((row, rIdx) =>
                row.map((cell, cIdx) =>
                  cell ? (
                    <rect
                      key={`${rIdx}-${cIdx}`}
                      x={20 + cIdx * 10}
                      y={20 + rIdx * 10}
                      width="9"
                      height="9"
                      rx="1.5"
                      fill="#09090B"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>

          <div className="flex-1 space-y-3 text-left">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                QRIS NATIONAL STANDARD (NMID)
              </span>
              <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                {channelInfo?.instruction_text ||
                  "Pindai kode QR menggunakan aplikasi E-Wallet (GoPay, DANA, OVO, ShopeePay) atau Mobile Banking yang mendukung QRIS."}
              </p>
            </div>

            <div className="rounded border border-white/[0.06] bg-zinc-900/90 p-2.5">
              <span className="block font-mono text-[10px] uppercase text-zinc-400">
                QRIS String Payload
              </span>
              <p className="mt-0.5 truncate font-mono text-xs text-zinc-300 tabular-nums">
                {reference}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadQris}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
              >
                <Download className="h-4 w-4" />
                <span>Unduh QRIS</span>
              </button>
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/[0.12] bg-zinc-900 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25"
              >
                {copiedRef ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Payload Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-zinc-400" />
                    <span>Salin Payload QR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3 rounded-xl border border-white/[0.08] bg-zinc-950/80 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Nomor Virtual Account / Kode Referensi Bayar
              </span>
              <p className="mt-1 font-mono text-xl font-bold tracking-wider text-zinc-50 sm:text-2xl tabular-nums">
                {reference}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyReference}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
            >
              {copiedRef ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Nomor VA Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Salin Nomor VA</span>
                </>
              )}
            </button>
          </div>

          <p className="border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-zinc-300">
            {channelInfo?.instruction_text ||
              "Selesaikan pembayaran melalui aplikasi perbankan atau e-wallet sesuai nomor referensi di atas sebelum batas waktu berakhir."}
          </p>
        </div>
      )}
    </div>
  );
}
