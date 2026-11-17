"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { LiveActivityTicker } from "./LiveActivityTicker";

export function BentoHero() {
  const [remainingSeconds, setRemainingSeconds] = useState(4 * 3600 + 27 * 60 + 49);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 4 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  return (
    <section
      aria-label="Penawaran Utama dan Aktivitas Langsung"
      className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column (8 Cols): Main 16:7 Tactical Hero Banner */}
        <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] bg-[#121215] p-6 sm:p-8 lg:col-span-8 lg:aspect-[16/7]">
          <img
            src="/banners/hero-mlbb.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/25" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
              PROMO MUSIM INI
            </span>
            <span className="hidden items-center gap-1.5 rounded-md border border-white/[0.08] bg-zinc-900/90 px-2.5 py-1 font-mono text-xs text-zinc-300 sm:inline-flex tabular-nums">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              SLA 1-3 Detik Otomatis
            </span>
          </div>

          <div className="relative z-10 mt-6 max-w-xl text-left">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-4xl lg:text-[40px] lg:leading-[1.12]">
              Eksekusi Top-Up Instan Tanpa Antrean Verifikasi.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              Distribusi langsung ke akun Mobile Legends, Valorant, Genshin Impact, dan Steam Wallet melalui jalir API resmi. Harga transparan dengan kalkulasi biaya pembayaran real-time.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/topup/mobile-legends"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 font-heading text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400"
              >
                Top Up Sekarang
              </Link>
              <a
                href="#katalog-game"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/[0.12] bg-zinc-900/90 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-zinc-800"
              >
                Lihat Semua Katalog
              </a>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Flash Deal + Live Activity Ticker */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-4">
          {/* Card 1: Live Flash Deal */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="text-left">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                  LIVE FLASH DEAL
                </span>
                <p className="text-[11px] text-zinc-400">
                  Kuota harga khusus pemrosesan instan
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-400 tabular-nums">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {hours}:{minutes}:{seconds}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              <Link
                href="/topup/mobile-legends"
                className="group flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/80 p-3 text-left transition-colors hover:border-amber-500/50"
              >
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Mobile Legends
                  </span>
                  <p className="font-heading text-sm font-bold text-zinc-50 group-hover:text-amber-400 transition-colors">
                    Weekly Diamond Pass (1x)
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-xs text-zinc-500 line-through tabular-nums">
                    {formatRupiah(29000)}
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                    {formatRupiah(26500)}
                  </span>
                </div>
              </Link>

              <Link
                href="/topup/genshin-impact"
                className="group flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/80 p-3 text-left transition-colors hover:border-amber-500/50"
              >
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Genshin Impact
                  </span>
                  <p className="font-heading text-sm font-bold text-zinc-50 group-hover:text-amber-400 transition-colors">
                    Blessing of the Welkin Moon
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-xs text-zinc-500 line-through tabular-nums">
                    {formatRupiah(79000)}
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                    {formatRupiah(57500)}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Card 2: Live Activity Ticker */}
          <LiveActivityTicker />
        </div>
      </div>
    </section>
  );
}
