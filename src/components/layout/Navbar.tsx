"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ReceiptText, ShieldCheck } from "lucide-react";
import { FALLBACK_GAMES } from "@/lib/seed-catalog";
import { CommandSearchModal } from "./CommandSearchModal";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Identity + Live Operational Status */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group flex min-h-[44px] items-center gap-2.5 focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-bold text-amber-400 transition-colors group-hover:border-amber-500">
                KR
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading text-base font-extrabold tracking-tight text-zinc-50">
                  KRONOS<span className="text-amber-500">.GG</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    Operational 24/7
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Command Search Trigger */}
          <div className="flex flex-1 justify-center max-w-md">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari game atau voucher (Ctrl + K)"
              className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-white/[0.08] bg-[#121215] px-3.5 py-2 text-left text-sm text-zinc-400 transition-colors hover:border-white/20 hover:bg-zinc-900 hover:text-zinc-200"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                <span className="truncate text-xs sm:text-sm">
                  Cari game atau voucher...
                </span>
              </span>
              <kbd className="hidden shrink-0 rounded border border-white/[0.1] bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300 sm:inline-block">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right: Track Order & Admin Navigation */}
          <nav className="flex items-center gap-2" aria-label="Navigasi Utama">
            <Link
              href="/track"
              className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
                pathname?.startsWith("/track")
                  ? "border-amber-500 bg-amber-500/[0.08] text-amber-400"
                  : "border-white/[0.08] bg-[#121215] text-zinc-200 hover:border-white/20 hover:bg-zinc-900"
              }`}
            >
              <ReceiptText className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline">Lacak Pesanan</span>
            </Link>

            <Link
              href="/admin"
              className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 font-mono text-xs font-semibold transition-colors ${
                pathname?.startsWith("/admin")
                  ? "border-amber-500 bg-amber-500/[0.12] text-amber-400"
                  : "border-white/[0.08] bg-[#121215] text-zinc-200 hover:border-amber-500/40 hover:bg-zinc-900 hover:text-amber-400"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      <CommandSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        games={FALLBACK_GAMES}
      />
    </>
  );
}
