import React from "react";
import Link from "next/link";
import { ADMIN_WHATSAPP_RAW } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-[#121215]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-6 space-y-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400">
                KR
              </div>
              <span className="font-heading text-base font-extrabold tracking-tight text-zinc-50">
                KRONOS<span className="text-amber-500">.GG</span>
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-zinc-400">
              Platform top-up game dan kode voucher digital dengan pemrosesan otomatis berkecepatan tinggi. Mendukung pembayaran QRIS, E-Wallet, dan Virtual Account perbankan nasional.
            </p>
            <p className="font-mono text-[11px] text-zinc-400 tabular-nums">
              Status Sistem: Sandbox Simulation Engine v2.4 Aktif
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-left">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Katalog Langsung
            </h2>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>
                <Link
                  href="/topup/mobile-legends"
                  className="inline-block py-1 hover:text-amber-400 transition-colors"
                >
                  Mobile Legends: Bang Bang
                </Link>
              </li>
              <li>
                <Link
                  href="/topup/valorant"
                  className="inline-block py-1 hover:text-amber-400 transition-colors"
                >
                  Valorant Points (Riot ID)
                </Link>
              </li>
              <li>
                <Link
                  href="/topup/genshin-impact"
                  className="inline-block py-1 hover:text-amber-400 transition-colors"
                >
                  Genshin Impact Genesis Crystals
                </Link>
              </li>
              <li>
                <Link
                  href="/topup/steam-wallet-idr"
                  className="inline-block py-1 hover:text-amber-400 transition-colors"
                >
                  Steam Wallet IDR Voucher
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-left">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Layanan Transaksi
            </h2>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>
                <Link
                  href="/track"
                  className="inline-block py-1 hover:text-amber-400 transition-colors"
                >
                  Lacak Status Invoice &amp; WhatsApp
                </Link>
              </li>
              <li>
                <Link
                  href="/invoice/INV-20261113-KRN001"
                  className="inline-block py-1 font-mono hover:text-amber-400 transition-colors tabular-nums"
                >
                  Contoh Invoice Lunas (INV-20261113-KRN001)
                </Link>
              </li>
              <li>
                <Link
                  href="/invoice/INV-20261113-KRN002"
                  className="inline-block py-1 font-mono hover:text-amber-400 transition-colors tabular-nums"
                >
                  Contoh Sandbox Unpaid (INV-20261113-KRN002)
                </Link>
              </li>
              <li>
                <Link
                  href="/whatsapp"
                  className="inline-block py-1 font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors tabular-nums"
                >
                  Barcode WA &amp; Telegram Admin ({ADMIN_WHATSAPP_RAW})
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-block py-1 font-mono font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Command Center Admin Panel →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-white/[0.08] pt-6 text-left text-xs text-zinc-400 sm:flex-row sm:items-center">
          <p className="tabular-nums">
            &copy; 2026 KRONOS.GG Digital Fulfillment. Seluruh hak cipta merek game milik masing-masing penerbit resmi.
          </p>
          <p className="font-mono text-[11px] text-zinc-400 tabular-nums">
            SLA Pengiriman: 1-3 Detik (Realtime Webhook)
          </p>
        </div>
      </div>
    </footer>
  );
}
