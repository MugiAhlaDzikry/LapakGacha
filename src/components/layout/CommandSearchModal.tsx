"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowUpRight } from "lucide-react";
import { Game } from "@/lib/supabase/database.types";

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
}

export function CommandSearchModal({
  isOpen,
  onClose,
  games,
}: CommandSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredGames = games.filter((game) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      game.title.toLowerCase().includes(q) ||
      game.publisher.toLowerCase().includes(q) ||
      game.currency_name.toLowerCase().includes(q) ||
      game.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredGames.length > 0 ? (prev + 1) % filteredGames.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredGames.length > 0
            ? (prev - 1 + filteredGames.length) % filteredGames.length
            : 0
        );
      } else if (e.key === "Enter" && filteredGames[selectedIndex]) {
        e.preventDefault();
        const target = filteredGames[selectedIndex];
        onClose();
        router.push(`/topup/${target.slug}`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredGames, selectedIndex, onClose, router]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/85 px-4 pt-20 sm:pt-28"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Katalog Game"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.12] bg-[#18181B]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul game, publisher, atau mata uang (misal: Valorant, Moonton, UC)..."
            className="h-9 w-full bg-transparent text-sm text-zinc-50 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pencarian"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {filteredGames.length === 0 ? (
            <div className="px-4 py-8 text-left">
              <p className="text-sm font-semibold text-zinc-200">
                Tidak ditemukan produk untuk kata kunci &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Coba gunakan kata kunci seperti Mobile Legends, Valorant, Genshin Impact, Free Fire, PUBG, atau Steam.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Katalog Tersedia ({filteredGames.length})
              </div>
              {filteredGames.map((game, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      onClose();
                      router.push(`/topup/${game.slug}`);
                    }}
                    className={`flex min-h-[56px] w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-amber-500/[0.09] ring-1 ring-amber-500/60"
                        : "hover:bg-zinc-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={game.thumbnail_url}
                        alt={game.title}
                        className="h-11 w-9 shrink-0 rounded border border-white/[0.08] object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-sm font-bold text-zinc-50">
                            {game.title}
                          </span>
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase text-zinc-300">
                            {game.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {game.publisher} · {game.currency_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
                      <span>Pilih</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.08] bg-zinc-950/60 px-4 py-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-white/[0.12] bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
                ↑↓
              </kbd>{" "}
              Navigasi
            </span>
            <span>
              <kbd className="rounded border border-white/[0.12] bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
                Enter
              </kbd>{" "}
              Buka Checkout
            </span>
          </div>
          <span>
            <kbd className="rounded border border-white/[0.12] bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
              Esc
            </kbd>{" "}
            Tutup
          </span>
        </div>
      </div>
    </div>
  );
}
