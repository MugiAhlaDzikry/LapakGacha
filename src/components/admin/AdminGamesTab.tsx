"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Edit3,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  Denomination,
  Game,
  GameCategory,
} from "@/lib/supabase/database.types";

interface AdminGamesTabProps {
  games: Game[];
  denominations: Denomination[];
  isMutating: boolean;
  onUpsertGame: (
    payload: Partial<Game> & { title: string; slug: string }
  ) => Promise<void>;
  onDeleteGame: (id: string) => Promise<void>;
  onOpenGameDenominations: (gameId: string) => void;
}

const POSTER_PRESETS = [
  { label: "Mobile Legends", url: "/posters/mobile-legends.svg" },
  { label: "Valorant", url: "/posters/valorant.svg" },
  { label: "Genshin Impact", url: "/posters/genshin-impact.svg" },
  { label: "Free Fire", url: "/posters/free-fire.svg" },
  { label: "PUBG Mobile", url: "/posters/pubg-mobile.svg" },
  { label: "Steam Wallet", url: "/posters/steam-wallet.svg" },
];

const BANNER_PRESETS = [
  { label: "Banner MLBB", url: "/banners/hero-mlbb.svg" },
  { label: "Banner Valorant", url: "/banners/hero-valorant.svg" },
  { label: "Banner Genshin", url: "/banners/hero-genshin.svg" },
  { label: "Banner Free Fire", url: "/banners/hero-freefire.svg" },
  { label: "Banner PUBGM", url: "/banners/hero-pubgm.svg" },
  { label: "Banner Steam", url: "/banners/hero-steam.svg" },
];

export function AdminGamesTab({
  games,
  denominations,
  isMutating,
  onUpsertGame,
  onDeleteGame,
  onOpenGameDenominations,
}: AdminGamesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | GameCategory>(
    "all"
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [publisher, setPublisher] = useState("");
  const [category, setCategory] = useState<GameCategory>("mobile");
  const [currencyName, setCurrencyName] = useState("Diamonds");
  const [requiresZoneId, setRequiresZoneId] = useState(false);
  const [idLabel, setIdLabel] = useState("User ID");
  const [zoneLabel, setZoneLabel] = useState("Zone ID");
  const [idPlaceholder, setIdPlaceholder] = useState("Masukkan User ID");
  const [zonePlaceholder, setZonePlaceholder] = useState("Zone ID");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "/posters/mobile-legends.svg"
  );
  const [bannerUrl, setBannerUrl] = useState("/banners/hero-mlbb.svg");
  const [helperText, setHelperText] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return games.filter((g) => {
      if (categoryFilter !== "all" && g.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.publisher.toLowerCase().includes(q) ||
        g.currency_name.toLowerCase().includes(q)
      );
    });
  }, [games, searchQuery, categoryFilter]);

  function openCreateModal() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setPublisher("");
    setCategory("mobile");
    setCurrencyName("Diamonds");
    setRequiresZoneId(false);
    setIdLabel("User ID");
    setZoneLabel("Zone ID");
    setIdPlaceholder("Contoh: 124859201");
    setZonePlaceholder("Contoh: 2614");
    setThumbnailUrl("/posters/mobile-legends.svg");
    setBannerUrl("/banners/hero-mlbb.svg");
    setHelperText(
      "Pastikan User ID yang dimasukkan sudah benar sebelum melakukan pembayaran."
    );
    setIsPopular(false);
    setIsActive(true);
    setModalOpen(true);
  }

  function openEditModal(game: Game) {
    setEditingId(game.id);
    setTitle(game.title);
    setSlug(game.slug);
    setPublisher(game.publisher);
    setCategory(game.category);
    setCurrencyName(game.currency_name);
    setRequiresZoneId(game.requires_zone_id);
    setIdLabel(game.id_label);
    setZoneLabel(game.zone_label);
    setIdPlaceholder(game.id_placeholder);
    setZonePlaceholder(game.zone_placeholder);
    setThumbnailUrl(game.thumbnail_url);
    setBannerUrl(game.banner_url);
    setHelperText(game.helper_text || "");
    setIsPopular(game.is_popular);
    setIsActive(game.is_active);
    setModalOpen(true);
  }

  async function handleSaveGame(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    await onUpsertGame({
      id: editingId || undefined,
      title: title.trim(),
      slug: slug.trim(),
      publisher: publisher.trim() || "Official Publisher",
      category,
      currency_name: currencyName.trim() || "Diamonds",
      requires_zone_id: requiresZoneId,
      id_label: idLabel.trim() || "User ID",
      zone_label: zoneLabel.trim() || "Zone ID",
      id_placeholder: idPlaceholder.trim() || "Masukkan User ID",
      zone_placeholder: zonePlaceholder.trim() || "Zone ID",
      thumbnail_url: thumbnailUrl.trim() || "/posters/mobile-legends.svg",
      banner_url: bannerUrl.trim() || "/banners/hero-mlbb.svg",
      helper_text: helperText.trim() || null,
      is_popular: isPopular,
      is_active: isActive,
    });
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      {/* Header & Filter Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama game, publisher, atau slug..."
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-950 pl-10 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-950 p-1">
              {(["all", "mobile", "pc", "voucher"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-md px-3 py-1 font-mono text-[11px] font-semibold uppercase transition-colors ${
                    categoryFilter === cat
                      ? "bg-amber-500 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat === "all" ? "SEMUA" : cat}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Game Baru</span>
          </button>
        </div>
      </div>

      {/* Games Table / Tactical List */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-50">
              Manajemen Katalog Game & Voucher ({filteredGames.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Perubahan status aktif, populer, atau konfigurasi form ID akan
              langsung diterapkan ke halaman katalog depan
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="py-3 pr-4">Game & Publisher</th>
                <th className="py-3 px-4">Kategori & Slug</th>
                <th className="py-3 px-4">Mata Uang & Format ID</th>
                <th className="py-3 px-4">Produk SKU</th>
                <th className="py-3 px-4">Status & Populer</th>
                <th className="py-3 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredGames.map((game) => {
                const gameDenoms = denominations.filter(
                  (d) => d.game_id === game.id
                );
                const availableCount = gameDenoms.filter(
                  (d) => d.is_available
                ).length;

                return (
                  <tr
                    key={game.id}
                    className="transition-colors hover:bg-zinc-900/50"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={game.thumbnail_url}
                          alt={game.title}
                          className="h-12 w-10 shrink-0 rounded-md border border-white/[0.1] bg-zinc-900 object-cover"
                        />
                        <div>
                          <div className="font-heading text-sm font-bold text-zinc-100">
                            {game.title}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {game.publisher}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded border border-white/[0.1] bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-zinc-300">
                        {game.category}
                      </span>
                      <div className="mt-1 font-mono text-[11px] text-zinc-400">
                        /{game.slug}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-amber-400">
                        {game.currency_name}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-zinc-400">
                        Input: {game.id_label}
                        {game.requires_zone_id ? ` + ${game.zone_label}` : ""}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onOpenGameDenominations(game.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-400 tabular-nums"
                      >
                        <Package className="h-3.5 w-3.5 text-amber-500" />
                        <span>
                          {availableCount}/{gameDenoms.length} SKU Aktif
                        </span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            onUpsertGame({
                              ...game,
                              is_active: !game.is_active,
                            })
                          }
                          className={`rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase transition-colors ${
                            game.is_active
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-zinc-700 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {game.is_active ? "AKTIF" : "NONAKTIF"}
                        </button>

                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            onUpsertGame({
                              ...game,
                              is_popular: !game.is_popular,
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-[10px] font-semibold uppercase transition-colors ${
                            game.is_popular
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                              : "border-white/[0.08] bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Star className="h-3 w-3" />
                          <span>POPULER</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/topup/${game.slug}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 hover:border-white/20"
                          title="Buka halaman top-up"
                        >
                          <span>Lihat</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(game)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-200 hover:border-amber-500/40 hover:text-amber-400"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Game */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/[0.12] bg-[#18181B] p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  {editingId ? "EDIT KATALOG GAME" : "TAMBAH GAME BARU"}
                </span>
                <h3 className="mt-0.5 font-heading text-lg font-bold text-zinc-50">
                  {editingId ? title : "Konfigurasi Game / Voucher Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Nama Game / Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTitle(val);
                      if (!editingId) {
                        setSlug(
                          val
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        );
                      }
                    }}
                    placeholder="Contoh: Honor of Kings"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Contoh: honor-of-kings"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Contoh: Tencent / TiMi Studio"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Kategori Katalog
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as GameCategory)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="mobile">MOBILE GAME</option>
                    <option value="pc">PC GAME</option>
                    <option value="voucher">VOUCHER DIGITAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Nama Mata Uang Game
                  </label>
                  <input
                    type="text"
                    value={currencyName}
                    onChange={(e) => setCurrencyName(e.target.value)}
                    placeholder="Contoh: Tokens / Diamonds / VP"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Label Input ID Utama
                  </label>
                  <input
                    type="text"
                    value={idLabel}
                    onChange={(e) => setIdLabel(e.target.value)}
                    placeholder="Contoh: User ID / Riot ID / UID"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Zone ID Toggle & Fields */}
              <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-3.5">
                <label className="flex cursor-pointer items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-100">
                      Wajib Input Zone ID / Server ID Kedua
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      Aktifkan untuk game seperti Mobile Legends atau Genshin
                      Impact
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requiresZoneId}
                    onChange={(e) => setRequiresZoneId(e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                </label>

                {requiresZoneId && (
                  <div className="mt-3 grid grid-cols-1 gap-3 border-t border-white/[0.06] pt-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-zinc-400">
                        Label Zone / Server
                      </label>
                      <input
                        type="text"
                        value={zoneLabel}
                        onChange={(e) => setZoneLabel(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 text-xs text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-zinc-400">
                        Placeholder Zone ID
                      </label>
                      <input
                        type="text"
                        value={zonePlaceholder}
                        onChange={(e) => setZonePlaceholder(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-white/[0.1] bg-zinc-900 px-3 text-xs text-zinc-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Poster & Banner Presets */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Thumbnail Poster URL
                  </label>
                  <select
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    {POSTER_PRESETS.map((p) => (
                      <option key={p.url} value={p.url}>
                        {p.label} ({p.url})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Banner Hero URL
                  </label>
                  <select
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    {BANNER_PRESETS.map((b) => (
                      <option key={b.url} value={b.url}>
                        {b.label} ({b.url})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-zinc-300">
                  Panduan / Helper Text Cek ID
                </label>
                <textarea
                  rows={2}
                  value={helperText}
                  onChange={(e) => setHelperText(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-zinc-950 p-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 rounded-lg border border-white/[0.08] bg-zinc-950 p-3.5">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span>Tampilkan di Katalog Aktif</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span>Sematkan Badge Populer (Prioritas Urutan)</span>
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                {editingId ? (
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={async () => {
                      const targetId = editingId;
                      setModalOpen(false);
                      await onDeleteGame(targetId);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Game</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-white/[0.08] bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                  >
                    Simpan Katalog Game
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
