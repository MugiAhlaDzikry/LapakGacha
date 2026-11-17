"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  FulfillmentStatus,
  PaymentStatus,
  Transaction,
} from "@/lib/supabase/database.types";
import { formatRupiah, generateSerialNumber } from "@/lib/utils";

interface AdminTransactionsTabProps {
  transactions: Transaction[];
  isMutating: boolean;
  onUpdateTransaction: (payload: {
    invoice_number: string;
    payment_status?: PaymentStatus;
    fulfillment_status?: FulfillmentStatus;
    serial_number?: string | null;
  }) => Promise<void>;
  onDeleteTransaction: (invoiceNumber: string) => Promise<void>;
}

const PAYMENT_STATUS_FILTERS: Array<"ALL" | PaymentStatus> = [
  "ALL",
  "PAID",
  "UNPAID",
  "EXPIRED",
  "FAILED",
];

const FULFILLMENT_STATUS_FILTERS: Array<"ALL" | FulfillmentStatus> = [
  "ALL",
  "SUCCESS",
  "PROCESSING",
  "PENDING",
  "FAILED",
];

export function AdminTransactionsTab({
  transactions,
  isMutating,
  onUpdateTransaction,
  onDeleteTransaction,
}: AdminTransactionsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | PaymentStatus>(
    "ALL"
  );
  const [fulfillmentFilter, setFulfillmentFilter] = useState<
    "ALL" | FulfillmentStatus
  >("ALL");

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editPaymentStatus, setEditPaymentStatus] =
    useState<PaymentStatus>("UNPAID");
  const [editFulfillmentStatus, setEditFulfillmentStatus] =
    useState<FulfillmentStatus>("PENDING");
  const [editSerialNumber, setEditSerialNumber] = useState("");

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (paymentFilter !== "ALL" && tx.payment_status !== paymentFilter) {
        return false;
      }
      if (
        fulfillmentFilter !== "ALL" &&
        tx.fulfillment_status !== fulfillmentFilter
      ) {
        return false;
      }
      if (!q) return true;

      return (
        tx.invoice_number.toLowerCase().includes(q) ||
        tx.target_user_id.toLowerCase().includes(q) ||
        tx.target_nickname.toLowerCase().includes(q) ||
        tx.whatsapp_number.toLowerCase().includes(q) ||
        (tx.game?.title || "").toLowerCase().includes(q) ||
        (tx.serial_number || "").toLowerCase().includes(q)
      );
    });
  }, [transactions, searchQuery, paymentFilter, fulfillmentFilter]);

  function openEditModal(tx: Transaction) {
    setEditingTx(tx);
    setEditPaymentStatus(tx.payment_status);
    setEditFulfillmentStatus(tx.fulfillment_status);
    setEditSerialNumber(tx.serial_number || "");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTx) return;
    await onUpdateTransaction({
      invoice_number: editingTx.invoice_number,
      payment_status: editPaymentStatus,
      fulfillment_status: editFulfillmentStatus,
      serial_number: editSerialNumber.trim() || null,
    });
    setEditingTx(null);
  }

  return (
    <div className="space-y-5">
      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Invoice, User ID, Nickname, No. WA, atau SN..."
              className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-950 pl-10 pr-4 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Payment Status Filter */}
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-950 p-1">
              {PAYMENT_STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPaymentFilter(st)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                    paymentFilter === st
                      ? "bg-amber-500 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {st === "ALL" ? "BAYAR: SEMUA" : st}
                </button>
              ))}
            </div>

            {/* Fulfillment Status Filter */}
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-950 p-1">
              {FULFILLMENT_STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFulfillmentFilter(st)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                    fulfillmentFilter === st
                      ? "bg-zinc-800 text-amber-400 border border-amber-500/40"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {st === "ALL" ? "KIRIM: SEMUA" : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-50">
              Daftar Transaksi & Audit Log ({filteredTransactions.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Klik pada nomor invoice untuk membuka halaman invoice pelanggan,
              atau gunakan tombol aksi untuk mengubah status secara manual
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="py-3 pr-4">Invoice & Waktu</th>
                <th className="py-3 px-4">Game & Produk SKU</th>
                <th className="py-3 px-4">Akun Tujuan & WA</th>
                <th className="py-3 px-4">Rincian Nominal</th>
                <th className="py-3 px-4">Status Bayar</th>
                <th className="py-3 px-4">Fulfillment / SN</th>
                <th className="py-3 pl-4 text-right">Kontrol Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-left font-mono text-xs text-zinc-500"
                  >
                    Tidak ada transaksi yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCompleted =
                    tx.payment_status === "PAID" &&
                    tx.fulfillment_status === "SUCCESS";

                  return (
                    <tr
                      key={tx.invoice_number}
                      className="transition-colors hover:bg-zinc-900/50"
                    >
                      <td className="py-3.5 pr-4 align-top">
                        <Link
                          href={`/invoice/${tx.invoice_number}`}
                          className="inline-flex items-center gap-1 font-mono font-bold text-zinc-100 tabular-nums hover:text-amber-400"
                        >
                          <span>{tx.invoice_number}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <div className="mt-1 font-mono text-[10px] text-zinc-500 tabular-nums">
                          {new Date(tx.created_at).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-zinc-100">
                          {tx.game?.title || tx.game_id}
                        </div>
                        <div className="text-zinc-300">
                          {tx.denomination?.name || tx.denomination_id}
                        </div>
                        {tx.denomination?.sku_code && (
                          <span className="mt-1 inline-block rounded border border-white/[0.06] bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                            {tx.denomination.sku_code}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-semibold text-zinc-100 tabular-nums">
                          {tx.target_user_id}
                          {tx.target_zone_id ? ` (${tx.target_zone_id})` : ""}
                        </div>
                        <div className="text-xs text-amber-400/90">
                          Nick: {tx.target_nickname}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-zinc-400 tabular-nums">
                          WA: {tx.whatsapp_number}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                          {formatRupiah(tx.total_amount)}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400 tabular-nums">
                          Item: {formatRupiah(tx.amount)} + Fee:{" "}
                          {formatRupiah(tx.fee)}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase text-zinc-500">
                          Via {tx.payment_code}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
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

                      <td className="py-3.5 px-4 align-top">
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
                        {tx.serial_number ? (
                          <div className="mt-1.5 rounded border border-emerald-500/20 bg-emerald-500/[0.06] px-2 py-1 font-mono text-[10px] text-emerald-300 tabular-nums">
                            SN: {tx.serial_number}
                          </div>
                        ) : (
                          <div className="mt-1 font-mono text-[10px] text-zinc-500">
                            Belum ada SN
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 pl-4 text-right align-top">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {!isCompleted && (
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() =>
                                onUpdateTransaction({
                                  invoice_number: tx.invoice_number,
                                  payment_status: "PAID",
                                  fulfillment_status: "SUCCESS",
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 font-mono text-[11px] font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Proses Lunas</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(tx)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-200 transition-colors hover:border-white/20"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                            <span>Kelola</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Kelola Transaksi & Serial Number */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-white/[0.12] bg-[#18181B] p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  KONTROL TRANSAKSI MANUAL
                </span>
                <h3 className="mt-0.5 font-mono text-base font-bold text-zinc-50 tabular-nums">
                  {editingTx.invoice_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-500">Game / Item:</span>
                    <p className="font-semibold text-zinc-100">
                      {editingTx.game?.title} — {editingTx.denomination?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Target Player:</span>
                    <p className="font-mono font-semibold text-zinc-100 tabular-nums">
                      {editingTx.target_user_id} ({editingTx.target_nickname})
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Total Tagihan:</span>
                    <p className="font-mono font-bold text-amber-400 tabular-nums">
                      {formatRupiah(editingTx.total_amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Channel Pembayaran:</span>
                    <p className="font-mono text-zinc-200">
                      {editingTx.payment_code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Status Pembayaran
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) =>
                      setEditPaymentStatus(e.target.value as PaymentStatus)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="UNPAID">UNPAID (Menunggu Bayar)</option>
                    <option value="PAID">PAID (Lunas)</option>
                    <option value="EXPIRED">EXPIRED (Kedaluwarsa)</option>
                    <option value="FAILED">FAILED (Gagal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Status Fulfillment
                  </label>
                  <select
                    value={editFulfillmentStatus}
                    onChange={(e) =>
                      setEditFulfillmentStatus(
                        e.target.value as FulfillmentStatus
                      )
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PENDING">PENDING (Antrean)</option>
                    <option value="PROCESSING">PROCESSING (Diproses)</option>
                    <option value="SUCCESS">SUCCESS (Terkirim)</option>
                    <option value="FAILED">FAILED (Gagal Kirim)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Nomor Bukti / Serial Number (SN)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditSerialNumber(generateSerialNumber("KRN"))
                    }
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Generate SN Baru</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editSerialNumber}
                  onChange={(e) => setEditSerialNumber(e.target.value)}
                  placeholder="Kosongkan untuk auto-generate saat status SUCCESS"
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none tabular-nums"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={async () => {
                    const target = editingTx.invoice_number;
                    setEditingTx(null);
                    await onDeleteTransaction(target);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Invoice</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
