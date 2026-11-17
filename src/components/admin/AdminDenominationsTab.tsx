"use client";

import React, { useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { Denomination, Game } from "@/lib/supabase/database.types";
import { formatRupiah } from "@/lib/utils";

interface AdminDenominationsTabProps {
  games: Game[];
  denominations: Denomination[];
  selectedGameFilter: string;
  onChangeGameFilter: (gameId: string) => void;
  isMutating: boolean;
  onUpsertDenomination: (
    payload: Partial<Denomination> & {
      game_id: string;
      sku_code: string;
      name: string;
      price: number;
    }
  ) => Promise<void>;
  onDeleteDenomination: (id: string) => Promise<void>;
}

export function AdminDenominationsTab({
  games,
  denominations,
  selectedGameFilter,
  onChangeGameFilter,
  isMutating,
  onUpsertDenomination,
  onDeleteDenomination,
}: AdminDenominationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string>(games[0]?.id || "");
  const [skuCode, setSkuCode] = useState("");
  const [name, setName] = useState("");
  const [categoryGroup, setCategoryGroup] = useState("Top Up Instant");
  const [price, setPrice] = useState<number>(20000);
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [badgeText, setBadgeText] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState(true);

  const gameMap = useMemo(() => {
    const map = new Map<string, Game>();
    for (const g of games) {
      map.set(g.id, g);
    }
    return map;
  }, [games]);

  const filteredDenominations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return denominations.filter((d) => {
      if (selectedGameFilter !== "ALL" && d.game_id !== selectedGameFilter) {
        return false;
      }
      if (!q) return true;
      const g = gameMap.get(d.game_id);
      return (
        d.sku_code.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.category_group.toLowerCase().includes(q) ||
        (g?.title || "").toLowerCase().includes(q)
      );
    });
  }, [denominations, selectedGameFilter, searchQuery, gameMap]);

  function openCreateModal() {
    const defaultGameId =
      selectedGameFilter !== "ALL" ? selectedGameFilter : games[0]?.id || "";
    const gameObj = gameMap.get(defaultGameId);
    const prefix = gameObj
      ? gameObj.slug.slice(0, 4).toUpperCase()
      : "KRN";

    setEditingId(null);
    setGameId(defaultGameId);
    setSkuCode(`${prefix}-${Math.floor(100 + Math.random() * 900)}`);
    setName("");
    setCategoryGroup("Top Up Instant");
    setPrice(25000);
    setOriginalPrice("");
    setBadgeText("");
    setSortOrder(denominations.length + 1);
    setIsAvailable(true);
    setModalOpen(true);
  }

  function openEditModal(denom: Denomination) {
    setEditingId(denom.id);
    setGameId(denom.game_id);
    setSkuCode(denom.sku_code);
    setName(denom.name);
    setCategoryGroup(denom.category_group);
    setPrice(denom.price);
    setOriginalPrice(
      denom.original_price ? String(denom.original_price) : ""
    );
    setBadgeText(denom.badge_text || "");
    setSortOrder(denom.sort_order);
    setIsAvailable(denom.is_available);
    setModalOpen(true);
  }

  async function handleSaveDenom(e: React.FormEvent) {
    e.preventDefault();
    if (!gameId || !skuCode.trim() || !name.trim()) return;

    await onUpsertDenomination({
      id: editingId || undefined,
      game_id: gameId,
      sku_code: skuCode.trim().toUpperCase(),
      name: name.trim(),
      category_group: categoryGroup.trim() || "Top Up Instant",
      price: Number(price),
      original_price: originalPrice.trim()
        ? Number(originalPrice)
        : null,
      badge_text: badgeText.trim() || null,
      sort_order: Number(sortOrder || 1),
      is_available: isAvailable,
    });
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      {/* Filter by Game & Search */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode SKU, nama item nominal, atau kategori..."
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-950 pl-10 pr-4 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedGameFilter}
              onChange={(e) => onChangeGameFilter(e.target.value)}
              className="h-10 rounded-lg border border-white/[0.08] bg-zinc-950 px-3.5 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">SEMUA GAME ({denominations.length} SKU)</option>
              {games.map((g) => {
                const count = denominations.filter(
                  (d) => d.game_id === g.id
                ).length;
                return (
                  <option key={g.id} value={g.id}>
                    {g.title} ({count} SKU)
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Produk / SKU</span>
          </button>
        </div>
      </div>

      {/* Denominations Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-50">
              Manajemen Harga & Ketersediaan SKU ({filteredDenominations.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Atur harga jual Rupiah, harga coret promo, badge penawaran, dan
              ketersediaan stok secara instan
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="py-3 pr-4">Kode SKU</th>
                <th className="py-3 px-4">Game</th>
                <th className="py-3 px-4">Nama Nominal & Grup</th>
                <th className="py-3 px-4">Harga Jual & Coret</th>
                <th className="py-3 px-4">Badge Promo</th>
                <th className="py-3 px-4">Status Stok</th>
                <th className="py-3 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredDenominations.map((denom) => {
                const game = gameMap.get(denom.game_id);

                return (
                  <tr
                    key={denom.id}
                    className="transition-colors hover:bg-zinc-900/50"
                  >
                    <td className="py-3.5 pr-4 font-mono font-bold text-zinc-100 tabular-nums">
                      {denom.sku_code}
                      <div className="font-mono text-[10px] font-normal text-zinc-500">
                        Urutan #{denom.sort_order}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-200">
                        {game?.title || denom.game_id}
                      </div>
                      <div className="font-mono text-[10px] uppercase text-zinc-500">
                        {game?.currency_name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-100">
                        {denom.name}
                      </div>
                      <div className="text-zinc-400">{denom.category_group}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                        {formatRupiah(denom.price)}
                      </div>
                      {denom.original_price && (
                        <div className="font-mono text-[11px] text-zinc-500 line-through tabular-nums">
                          {formatRupiah(denom.original_price)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {denom.badge_text ? (
                        <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-400">
                          {denom.badge_text}
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-zinc-600">
                          —
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() =>
                          onUpsertDenomination({
                            ...denom,
                            is_available: !denom.is_available,
                          })
                        }
                        className={`rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase transition-colors ${
                          denom.is_available
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        }`}
                      >
                        {denom.is_available ? "TERSEDIA" : "STOK HABIS"}
                      </button>
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(denom)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-200 hover:border-amber-500/40 hover:text-amber-400"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit SKU</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit SKU Denomination */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-white/[0.12] bg-[#18181B] p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  {editingId ? "EDIT NOMINAL SKU" : "TAMBAH PRODUK SKU BARU"}
                </span>
                <h3 className="mt-0.5 font-heading text-lg font-bold text-zinc-50">
                  {editingId ? skuCode : "Konfigurasi Item Top-Up"}
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

            <form onSubmit={handleSaveDenom} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-zinc-300">
                  Pilih Game Katalog *
                </label>
                <select
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.currency_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Kode SKU Unik *
                  </label>
                  <input
                    type="text"
                    required
                    value={skuCode}
                    onChange={(e) => setSkuCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: MLBB-500D"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Grup Kategori
                  </label>
                  <input
                    type="text"
                    value={categoryGroup}
                    onChange={(e) => setCategoryGroup(e.target.value)}
                    placeholder="Contoh: Top Up Instant / Membership"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-zinc-300">
                  Nama Item Nominal *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: 514 Diamonds (468 + 46 Bonus)"
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Harga Coret / Normal (Opsional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Kosongkan jika tanpa diskon"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Badge Promo (Opsional)
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Contoh: TERLARIS / HEMAT 15%"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Urutan Tampil (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-3.5">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span>Stok Tersedia untuk Dibeli Pelanggan</span>
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
                      await onDeleteDenomination(targetId);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus SKU</span>
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
                    Simpan Produk SKU
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
