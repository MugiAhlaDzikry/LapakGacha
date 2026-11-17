"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Gamepad2,
  Package,
  Zap,
} from "lucide-react";
import {
  Denomination,
  Game,
  PaymentChannel,
  Transaction,
} from "@/lib/supabase/database.types";
import { formatRupiah } from "@/lib/utils";

interface AdminOverviewTabProps {
  games: Game[];
  denominations: Denomination[];
  paymentChannels: PaymentChannel[];
  transactions: Transaction[];
  isMutating: boolean;
  onQuickCompleteTransaction: (invoiceNumber: string) => void;
  onNavigateTab: (
    tab: "overview" | "transactions" | "games" | "denominations" | "channels",
    gameIdFilter?: string
  ) => void;
}

export function AdminOverviewTab({
  games,
  denominations,
  paymentChannels,
  transactions,
  isMutating,
  onQuickCompleteTransaction,
  onNavigateTab,
}: AdminOverviewTabProps) {
  const paidTransactions = transactions.filter(
    (tx) => tx.payment_status === "PAID"
  );
  const totalRevenue = paidTransactions.reduce(
    (sum, tx) => sum + tx.total_amount,
    0
  );
  const totalFeeCollected = paidTransactions.reduce(
    (sum, tx) => sum + tx.fee,
    0
  );
  const netProductVolume = paidTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const pendingOrProcessingCount = transactions.filter(
    (tx) =>
      tx.payment_status === "UNPAID" ||
      tx.fulfillment_status === "PENDING" ||
      tx.fulfillment_status === "PROCESSING"
  ).length;

  const successCount = transactions.filter(
    (tx) => tx.fulfillment_status === "SUCCESS"
  ).length;

  const conversionRate =
    transactions.length > 0
      ? Math.round((paidTransactions.length / transactions.length) * 100)
      : 0;

  const activeGamesCount = games.filter((g) => g.is_active).length;
  const availableDenomsCount = denominations.filter(
    (d) => d.is_available
  ).length;
  const activeChannelsCount = paymentChannels.filter((c) => c.is_active).length;

  // Revenue by game
  const revenueByGame = games
    .map((game) => {
      const gameTxs = paidTransactions.filter(
        (tx) => tx.game_id === game.id || tx.game?.slug === game.slug
      );
      const revenue = gameTxs.reduce((sum, tx) => sum + tx.total_amount, 0);
      return {
        game,
        txCount: gameTxs.length,
        revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const maxGameRevenue = Math.max(...revenueByGame.map((r) => r.revenue), 1);

  // Payment channel usage
  const channelUsageMap = new Map<
    string,
    { code: string; name: string; count: number; volume: number }
  >();
  for (const tx of transactions) {
    const existing = channelUsageMap.get(tx.payment_code) || {
      code: tx.payment_code,
      name: tx.payment_name,
      count: 0,
      volume: 0,
    };
    existing.count += 1;
    if (tx.payment_status === "PAID") {
      existing.volume += tx.total_amount;
    }
    channelUsageMap.set(tx.payment_code, existing);
  }
  const channelStats = Array.from(channelUsageMap.values()).sort(
    (a, b) => b.count - a.count
  );

  return (
    <div className="space-y-6">
      {/* KPI Tactical Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Gross Revenue */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              01 // GROSS REVENUE (PAID)
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
              LIVE
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold tabular-nums tracking-tight text-zinc-50">
            {formatRupiah(totalRevenue)}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-xs text-zinc-400">
            <span>Pokok: {formatRupiah(netProductVolume)}</span>
            <span className="font-mono tabular-nums text-amber-400">
              Fee: {formatRupiah(totalFeeCollected)}
            </span>
          </div>
        </div>

        {/* Card 2: Total Transactions & Conversion */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              02 // VOLUME TRANSAKSI
            </span>
            <span className="font-mono text-xs font-semibold tabular-nums text-amber-400">
              {conversionRate}% PAID
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold tabular-nums tracking-tight text-zinc-50">
            {transactions.length}{" "}
            <span className="text-sm font-normal text-zinc-400">Invoice</span>
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-xs text-zinc-400">
            <span>Lunas: {paidTransactions.length} trx</span>
            <button
              type="button"
              onClick={() => onNavigateTab("transactions")}
              className="font-medium text-amber-400 hover:text-amber-300"
            >
              Kelola Semua →
            </button>
          </div>
        </div>

        {/* Card 3: Fulfillment Status */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              03 // ANTREAN PENGIRIMAN
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 font-mono text-2xl font-bold tabular-nums tracking-tight text-zinc-50">
            {pendingOrProcessingCount}{" "}
            <span className="text-sm font-normal text-zinc-400">
              Menunggu / Proses
            </span>
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-xs text-zinc-400">
            <span className="text-emerald-400">
              Terkirim (SN): {successCount}
            </span>
            <span>SLA Target: &lt; 3 dtk</span>
          </div>
        </div>

        {/* Card 4: Active Catalog Health */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              04 // STATUS KATALOG
            </span>
            <Gamepad2 className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-3 font-mono text-2xl font-bold tabular-nums tracking-tight text-zinc-50">
            {activeGamesCount}/{games.length}{" "}
            <span className="text-sm font-normal text-zinc-400">
              Game Aktif
            </span>
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-xs text-zinc-400">
            <span>
              SKU Ready: {availableDenomsCount}/{denominations.length}
            </span>
            <span>Channel: {activeChannelsCount}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Revenue Breakdown & Payment Channel Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Performa Katalog Game */}
        <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left lg:col-span-7">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
            <div>
              <h2 className="font-heading text-base font-bold text-zinc-50">
                Performa Pendapatan per Game
              </h2>
              <p className="text-xs text-zinc-400">
                Akumulasi nilai transaksi berstatus PAID berdasarkan katalog
                game
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("games")}
              className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20"
            >
              Atur Katalog
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {revenueByGame.map(({ game, txCount, revenue }) => {
              const widthPercent =
                revenue > 0
                  ? Math.max(6, Math.round((revenue / maxGameRevenue) * 100))
                  : 0;
              const skuCount = denominations.filter(
                (d) => d.game_id === game.id
              ).length;

              return (
                <div
                  key={game.id}
                  className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          game.is_active ? "bg-emerald-500" : "bg-zinc-600"
                        }`}
                      />
                      <span className="truncate text-sm font-semibold text-zinc-100">
                        {game.title}
                      </span>
                      <span className="rounded border border-white/[0.08] bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
                        {game.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => onNavigateTab("denominations", game.id)}
                        className="font-mono text-xs text-zinc-400 hover:text-amber-400"
                      >
                        {skuCount} SKU
                      </button>
                      <span className="font-mono text-xs text-zinc-400 tabular-nums">
                        {txCount} trx
                      </span>
                      <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                        {formatRupiah(revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribusi Metode Pembayaran & Pintasan Operasional */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div>
                <h2 className="font-heading text-base font-bold text-zinc-50">
                  Distribusi Channel Pembayaran
                </h2>
                <p className="text-xs text-zinc-400">
                  Frekuensi metode pembayaran yang dipilih pengguna
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("channels")}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20"
              >
                Kelola Fee
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {channelStats.length === 0 ? (
                <p className="py-4 text-xs text-zinc-500">
                  Belum ada data penggunaan channel pembayaran.
                </p>
              ) : (
                channelStats.map((ch) => {
                  const share =
                    transactions.length > 0
                      ? Math.round((ch.count / transactions.length) * 100)
                      : 0;
                  return (
                    <div
                      key={ch.code}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-950/60 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-zinc-200">
                            {ch.code}
                          </span>
                          <span className="font-mono text-[11px] text-amber-400 tabular-nums">
                            ({share}%)
                          </span>
                        </div>
                        <p className="truncate text-xs text-zinc-400">
                          {ch.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-xs font-semibold text-zinc-100 tabular-nums">
                          {formatRupiah(ch.volume)}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-400 tabular-nums">
                          {ch.count} transaksi
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Operational Actions */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
              PINTASAN KONTROL CEPAT
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onNavigateTab("games")}
                className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-900/80 px-3.5 py-3 text-left text-xs font-medium text-zinc-200 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                <span className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-amber-500" />
                  <span>Tambah / Edit Game</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("denominations")}
                className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-900/80 px-3.5 py-3 text-left text-xs font-medium text-zinc-200 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-500" />
                  <span>Atur Harga & SKU</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("channels")}
                className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-900/80 px-3.5 py-3 text-left text-xs font-medium text-zinc-200 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  <span>Biaya Admin Channel</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("transactions")}
                className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-900/80 px-3.5 py-3 text-left text-xs font-medium text-zinc-200 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Audit Semua Invoice</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Actionable Queue */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-50">
              Monitor Transaksi & Antrean Fulfillment Terbaru
            </h2>
            <p className="text-xs text-zinc-400">
              Eksekusi pengiriman instan (Generate SN) langsung untuk pesanan
              yang masih berstatus UNPAID atau PROCESSING
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("transactions")}
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            Buka Tabel Transaksi Lengkap ({transactions.length})
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="py-3 pr-4">No. Invoice</th>
                <th className="py-3 px-4">Game & Produk</th>
                <th className="py-3 px-4">Target Akun</th>
                <th className="py-3 px-4">Total Bayar</th>
                <th className="py-3 px-4">Status Bayar</th>
                <th className="py-3 px-4">Fulfillment / SN</th>
                <th className="py-3 pl-4 text-right">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {transactions.slice(0, 6).map((tx) => {
                const needsAction =
                  tx.payment_status !== "PAID" ||
                  tx.fulfillment_status !== "SUCCESS";

                return (
                  <tr
                    key={tx.invoice_number}
                    className="transition-colors hover:bg-zinc-900/60"
                  >
                    <td className="py-3.5 pr-4 font-mono font-semibold text-zinc-100 tabular-nums">
                      <Link
                        href={`/invoice/${tx.invoice_number}`}
                        className="hover:text-amber-400 hover:underline"
                      >
                        {tx.invoice_number}
                      </Link>
                      <div className="mt-0.5 font-mono text-[10px] font-normal text-zinc-500">
                        {tx.payment_code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-100">
                        {tx.game?.title || "Game Top-Up"}
                      </div>
                      <div className="text-zinc-400">
                        {tx.denomination?.name || tx.denomination_id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-zinc-200 tabular-nums">
                        {tx.target_user_id}
                        {tx.target_zone_id ? ` (${tx.target_zone_id})` : ""}
                      </div>
                      <div className="text-zinc-400">{tx.target_nickname}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 tabular-nums">
                      {formatRupiah(tx.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                          tx.payment_status === "PAID"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : tx.payment_status === "UNPAID"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {tx.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                          tx.fulfillment_status === "SUCCESS"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : tx.fulfillment_status === "PROCESSING"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : tx.fulfillment_status === "PENDING"
                            ? "border-zinc-700 bg-zinc-800/80 text-zinc-300"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {tx.fulfillment_status}
                      </span>
                      {tx.serial_number && (
                        <div className="mt-1 font-mono text-[10px] text-zinc-400 tabular-nums">
                          {tx.serial_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      {needsAction ? (
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            onQuickCompleteTransaction(tx.invoice_number)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-[11px] font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Set Lunas & Kirim SN</span>
                        </button>
                      ) : (
                        <Link
                          href={`/invoice/${tx.invoice_number}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 hover:border-white/20"
                        >
                          <span>Lihat Invoice</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
