"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Game } from "@/lib/supabase/database.types";

type FilterCategory = "all" | "popular" | "mobile" | "pc" | "voucher";

interface GameCatalogGridProps {
  games: Game[];
}

const FILTER_OPTIONS: { id: FilterCategory; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "popular", label: "Populer" },
  { id: "mobile", label: "Mobile" },
  { id: "pc", label: "PC" },
  { id: "voucher", label: "Voucher" },
];

export function GameCatalogGrid({ games }: GameCatalogGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");

  const filteredGames = games.filter((game) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "popular") return game.is_popular;
    return game.category === selectedFilter;
  });

  return (
    <section
      id="katalog-game"
      aria-label="Katalog Game dan Voucher"
      className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8"
    >
      {/* Header & Segmented Filter Control */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end">
        <div className="text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-500">
            DIRECT TOP-UP CATALOG
          </span>
          <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl">
            Pilih Game atau Voucher Digital
          </h2>
        </div>

        {/* Segmented Control */}
        <div
          role="tablist"
          aria-label="Filter Kategori Game"
          className="flex flex-wrap items-center gap-1 rounded-xl border border-white/[0.08] bg-[#121215] p-1"
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = selectedFilter === option.id;
            return (
              <button
                key={option.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setSelectedFilter(option.id)}
                className={`min-h-[40px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State if no game matches */}
      {filteredGames.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#121215] p-8 text-left">
          <p className="font-heading text-base font-bold text-zinc-100">
            Tidak ada judul pada kategori ini
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Silakan pilih tab kategori Semua untuk menampilkan seluruh katalog yang tersedia.
          </p>
          <button
            type="button"
            onClick={() => setSelectedFilter("all")}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
          >
            Tampilkan Semua Katalog
          </button>
        </div>
      ) : (
        /* 3:4 Vertical Poster Grid */
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/topup/${game.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 text-left transition-colors hover:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <img
                src={game.thumbnail_url}
                alt={game.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top Right Popular / Instant Tag */}
              {game.is_popular && (
                <div className="absolute right-2.5 top-2.5 rounded border border-amber-500/40 bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  POPULER
                </div>
              )}

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-4 pt-12 text-left">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  {game.publisher}
                </span>
                <h3 className="mt-0.5 font-heading text-base font-bold leading-snug text-zinc-50 group-hover:text-amber-400 transition-colors">
                  {game.title}
                </h3>
                <span className="mt-1.5 font-mono text-[11px] text-zinc-300">
                  {game.currency_name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
