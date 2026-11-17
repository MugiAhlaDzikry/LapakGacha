"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Transaction } from "@/lib/supabase/database.types";
import { formatRupiah } from "@/lib/utils";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("081234567890");
  const [results, setResults] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(true);

  async function executeSearch(searchTerm: string) {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setError("Masukkan Nomor Invoice (INV-...) atau Nomor WhatsApp (08...).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/track?q=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mencari pesanan.");
        setResults([]);
      } else {
        setResults(data.transactions || []);
      }
    } catch {
      setError("Terjadi gangguan koneksi saat mencari riwayat pesanan.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    executeSearch("081234567890");
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    executeSearch(query);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Search Form */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-5 text-left backdrop-blur-md sm:p-6">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-500">
          ORDER TRACKING &amp; AUDIT LOG
        </span>
        <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-3xl">
          Lacak Status Pesanan &amp; Invoice
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
          Masukkan Nomor Invoice resmi (contoh:{" "}
          <code className="font-mono text-zinc-200 tabular-nums">
            INV-20261113-KRN001
          </code>
          ) atau Nomor WhatsApp yang digunakan saat checkout untuk melihat status pengiriman item dan kode Serial Number (SN).
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Nomor Invoice atau Nomor WhatsApp"
              placeholder="Ketik Nomor Invoice (INV-...) atau No. WhatsApp (0812...)"
              className="min-h-[48px] w-full rounded-lg border border-white/[0.12] bg-zinc-950 pl-10 pr-4 py-2.5 font-mono text-sm text-zinc-50 tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 font-heading text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              <span>Cari Pesanan</span>
            )}
          </button>
        </form>

        {/* Quick Preset Search Buttons */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>Pencarian Cepat Sandbox:</span>
          <button
            type="button"
            onClick={() => {
              setQuery("081234567890");
              executeSearch("081234567890");
            }}
            className="rounded border border-white/[0.1] bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-200 hover:border-amber-500/50 hover:text-amber-400 tabular-nums"
          >
            081234567890
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("INV-20261113-KRN001");
              executeSearch("INV-20261113-KRN001");
            }}
            className="rounded border border-white/[0.1] bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-200 hover:border-amber-500/50 hover:text-amber-400 tabular-nums"
          >
            INV-20261113-KRN001
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("INV-20261113-KRN002");
              executeSearch("INV-20261113-KRN002");
            }}
            className="rounded border border-white/[0.1] bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-200 hover:border-amber-500/50 hover:text-amber-400 tabular-nums"
          >
            INV-20261113-KRN002
          </button>
        </div>
      </div>

      {/* Results Area with Loading, Error, Empty, and Data States */}
      <div className="mt-6">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-left text-xs text-rose-300 sm:text-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-8 text-left">
            <div className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <span>Memuat data transaksi dari database...</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Memeriksa pencocokan Nomor Invoice dan riwayat kontak WhatsApp.
            </p>
          </div>
        ) : hasSearched && results.length === 0 && !error ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-8 text-left">
            <h2 className="font-heading text-base font-bold text-zinc-100">
              Tidak ditemukan transaksi untuk &ldquo;{query}&rdquo;
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Pastikan penulisan Nomor Invoice (diawali INV-) atau Nomor WhatsApp sudah sesuai dengan yang Anda masukkan saat pembelian.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center rounded-lg bg-amber-500 px-4 py-2 font-heading text-xs font-bold text-zinc-950 hover:bg-amber-400"
              >
                Buat Transaksi Baru
              </Link>
              <button
                type="button"
                onClick={() => {
                  setQuery("081234567890");
                  executeSearch("081234567890");
                }}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-white/[0.12] bg-zinc-900 px-4 py-2 font-mono text-xs font-semibold text-zinc-200 hover:border-white/25"
              >
                Lihat Contoh Transaksi Sandbox
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 tabular-nums">
                Ditemukan {results.length} Transaksi
              </h2>
            </div>

            {results.map((tx) => {
              const isPaid = tx.payment_status === "PAID";
              const isUnpaid = tx.payment_status === "UNPAID";
              const isSuccess = tx.fulfillment_status === "SUCCESS";

              return (
                <Link
                  key={tx.invoice_number}
                  href={`/invoice/${tx.invoice_number}`}
                  className="group block rounded-xl border border-white/[0.08] bg-zinc-900/70 p-4 text-left transition-colors hover:border-amber-500/50 hover:bg-zinc-900 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-zinc-50 group-hover:text-amber-400 transition-colors tabular-nums">
                          {tx.invoice_number}
                        </span>

                        {/* Payment Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            isPaid
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                              : isUnpaid
                              ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                              : "border-rose-500/40 bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : isUnpaid ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {tx.payment_status}
                        </span>

                        {/* Fulfillment Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            isSuccess
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                              : tx.fulfillment_status === "PROCESSING"
                              ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                              : "border-white/[0.1] bg-zinc-950 text-zinc-400"
                          }`}
                        >
                          {tx.fulfillment_status}
                        </span>
                      </div>

                      <p className="font-heading text-base font-bold text-zinc-100">
                        {tx.game?.title || "Game Top-Up"}:{" "}
                        <span className="text-amber-400">
                          {tx.denomination?.name || tx.denomination_id}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-400 tabular-nums">
                        <span>
                          Tujuan: {tx.target_nickname} ({tx.target_user_id}
                          {tx.target_zone_id ? ` / ${tx.target_zone_id}` : ""})
                        </span>
                        <span>WA: {tx.whatsapp_number}</span>
                        <span>Metode: {tx.payment_code}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="block text-[11px] text-zinc-400">
                          Total Pembayaran
                        </span>
                        <span className="font-mono text-lg font-extrabold text-amber-400 tabular-nums">
                          {formatRupiah(tx.total_amount)}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-amber-400">
                        <span>Buka Invoice</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
