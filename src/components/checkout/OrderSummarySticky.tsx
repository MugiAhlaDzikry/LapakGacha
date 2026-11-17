"use client";

import React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import {
  Denomination,
  Game,
  PaymentChannel,
} from "@/lib/supabase/database.types";
import { calculateChannelFee, formatRupiah } from "@/lib/utils";

interface OrderSummaryStickyProps {
  game: Game;
  userId: string;
  zoneId: string;
  nickname: string | null;
  selectedDenomination: Denomination | null;
  selectedChannel: PaymentChannel | null;
  whatsappNumber: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmitCheckout: () => void;
}

export function OrderSummarySticky({
  game,
  userId,
  zoneId,
  nickname,
  selectedDenomination,
  selectedChannel,
  whatsappNumber,
  isSubmitting,
  canSubmit,
  onSubmitCheckout,
}: OrderSummaryStickyProps) {
  const amount = selectedDenomination ? selectedDenomination.price : 0;
  const fee =
    selectedDenomination && selectedChannel
      ? calculateChannelFee(
          selectedDenomination.price,
          selectedChannel.fee_flat,
          selectedChannel.fee_percent
        )
      : 0;
  const totalAmount = amount + fee;

  return (
    <div className="space-y-4 text-left">
      {/* 1. Game Header Card */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-5 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <img
            src={game.thumbnail_url}
            alt={game.title}
            className="aspect-[3/4] w-20 shrink-0 rounded-lg border border-white/[0.1] object-cover"
          />
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {game.publisher}
            </span>
            <h1 className="mt-0.5 font-heading text-lg font-extrabold tracking-tight text-zinc-50">
              {game.title}
            </h1>
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Proses Otomatis 1-3 Detik</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-white/[0.08] pt-3.5 text-xs text-zinc-400 space-y-1.5">
          <p className="font-semibold text-zinc-200">
            Panduan Transaksi Cepat:
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Masukkan {game.id_label} dan verifikasi Nickname akun Anda.</li>
            <li>Pilih nominal {game.currency_name} yang diinginkan.</li>
            <li>Pilih metode pembayaran QRIS, E-Wallet, atau Virtual Account.</li>
            <li>Masukkan nomor WhatsApp aktif dan klik Beli Sekarang.</li>
          </ol>
        </div>
      </div>

      {/* 2. Live Order Summary Card (Desktop) */}
      <div className="hidden rounded-xl border border-white/[0.08] bg-zinc-900/70 p-5 backdrop-blur-md lg:block">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-zinc-200">
            Ringkasan Pesanan Live
          </h2>
          <span className="font-mono text-[11px] text-amber-400">
            REALTIME CALC
          </span>
        </div>

        <dl className="mt-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-zinc-400">Target ID</dt>
            <dd className="font-mono font-semibold text-zinc-200 tabular-nums">
              {userId
                ? `${userId}${zoneId ? ` (${zoneId})` : ""}`
                : "Belum diisi"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-zinc-400">Nickname Akun</dt>
            <dd
              className={`font-mono font-semibold ${
                nickname ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {nickname || "Menunggu Cek ID"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-zinc-400">Item Dipilih</dt>
            <dd className="font-semibold text-zinc-100 text-right">
              {selectedDenomination ? selectedDenomination.name : "Belum dipilih"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-zinc-400">Metode Bayar</dt>
            <dd className="font-mono text-zinc-200">
              {selectedChannel ? selectedChannel.code : "Belum dipilih"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-zinc-400">No. WhatsApp</dt>
            <dd className="font-mono text-zinc-200 tabular-nums">
              {whatsappNumber || "Belum diisi"}
            </dd>
          </div>

          <div className="my-3 border-t border-white/[0.08] pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <dt className="text-zinc-400">Harga Produk</dt>
              <dd className="font-mono text-zinc-200 tabular-nums">
                {formatRupiah(amount)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-400">Biaya Layanan</dt>
              <dd className="font-mono text-zinc-200 tabular-nums">
                {formatRupiah(fee)}
              </dd>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-white/[0.08] pt-3">
            <dt className="font-heading text-sm font-bold text-zinc-100">
              Total Pembayaran
            </dt>
            <dd className="font-mono text-xl font-bold text-amber-400 tabular-nums">
              {formatRupiah(totalAmount)}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onSubmitCheckout}
          disabled={!canSubmit || isSubmitting}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-heading text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Membuat Invoice...</span>
            </>
          ) : (
            <span>Beli Sekarang</span>
          )}
        </button>

        {!canSubmit && (
          <p className="mt-2.5 text-left text-[11px] text-zinc-400">
            Lengkapi Langkah 01 hingga 04 di sebelah kanan untuk mengaktifkan tombol pembelian.
          </p>
        )}
      </div>
    </div>
  );
}
