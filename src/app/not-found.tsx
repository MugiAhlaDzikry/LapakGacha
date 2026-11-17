import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-8 text-left">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400 tabular-nums">
          ERROR 404 · RESOURCE NOT FOUND
        </span>
        <h1 className="mt-2 font-heading text-2xl font-extrabold text-zinc-50">
          Halaman atau Invoice Tidak Ditemukan
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          URL yang Anda tuju tidak tersedia atau nomor invoice belum terdaftar di sistem.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-amber-500 px-5 py-2.5 font-heading text-xs font-bold text-zinc-950 hover:bg-amber-400"
          >
            Kembali ke Katalog Utama
          </Link>
          <Link
            href="/track"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-white/[0.12] bg-zinc-950 px-5 py-2.5 font-mono text-xs font-semibold text-zinc-200 hover:border-white/25"
          >
            Cari di Lacak Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}
