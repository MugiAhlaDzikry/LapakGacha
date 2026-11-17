"use client";

import React, { useMemo, useState } from "react";
import { Edit3, Plus, Star, Trash2, X } from "lucide-react";
import {
  PaymentCategory,
  PaymentChannel,
} from "@/lib/supabase/database.types";
import { calculateChannelFee, formatRupiah } from "@/lib/utils";

interface AdminPaymentChannelsTabProps {
  paymentChannels: PaymentChannel[];
  isMutating: boolean;
  onUpsertPaymentChannel: (
    payload: Partial<PaymentChannel> & {
      code: string;
      name: string;
      category: PaymentCategory;
    }
  ) => Promise<void>;
  onDeletePaymentChannel: (id: string) => Promise<void>;
}

const CATEGORIES: Array<"ALL" | PaymentCategory> = [
  "ALL",
  "QRIS",
  "E-Wallet",
  "Virtual Account",
  "Convenience Store",
];

export function AdminPaymentChannelsTab({
  paymentChannels,
  isMutating,
  onUpsertPaymentChannel,
  onDeletePaymentChannel,
}: AdminPaymentChannelsTabProps) {
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | PaymentCategory
  >("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PaymentCategory>("QRIS");
  const [feeFlat, setFeeFlat] = useState<number>(0);
  const [feePercent, setFeePercent] = useState<number>(0.7);
  const [instructionText, setInstructionText] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const filteredChannels = useMemo(() => {
    return paymentChannels.filter((c) => {
      if (categoryFilter !== "ALL" && c.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [paymentChannels, categoryFilter]);

  function openCreateModal() {
    setEditingId(null);
    setCode("");
    setName("");
    setCategory("Virtual Account");
    setFeeFlat(3500);
    setFeePercent(0);
    setInstructionText(
      "Salin nomor Virtual Account dan selesaikan pembayaran melalui Mobile Banking atau ATM sebelum waktu kedaluwarsa."
    );
    setSortOrder(paymentChannels.length + 1);
    setIsFeatured(false);
    setIsActive(true);
    setModalOpen(true);
  }

  function openEditModal(channel: PaymentChannel) {
    setEditingId(channel.id);
    setCode(channel.code);
    setName(channel.name);
    setCategory(channel.category);
    setFeeFlat(channel.fee_flat);
    setFeePercent(channel.fee_percent);
    setInstructionText(channel.instruction_text || "");
    setSortOrder(channel.sort_order);
    setIsFeatured(channel.is_featured);
    setIsActive(channel.is_active);
    setModalOpen(true);
  }

  async function handleSaveChannel(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    await onUpsertPaymentChannel({
      id: editingId || undefined,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      fee_flat: Number(feeFlat || 0),
      fee_percent: Number(feePercent || 0),
      instruction_text: instructionText.trim() || null,
      sort_order: Number(sortOrder || 1),
      is_featured: isFeatured,
      is_active: isActive,
    });
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      {/* Filter & Create Header */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-950 p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold uppercase transition-colors ${
                  categoryFilter === cat
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {cat === "ALL" ? "SEMUA CHANNEL" : cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Channel Pembayaran</span>
          </button>
        </div>
      </div>

      {/* Payment Channels Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-50">
              Konfigurasi Gateway & Biaya Layanan ({filteredChannels.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Rumus biaya layanan: <code className="text-amber-400">Fee Flat + (Nominal × Fee %)</code>
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="py-3 pr-4">Kode & Urutan</th>
                <th className="py-3 px-4">Nama Metode & Kategori</th>
                <th className="py-3 px-4">Skema Biaya (Fee)</th>
                <th className="py-3 px-4">Simulasi Fee (Order Rp 100rb)</th>
                <th className="py-3 px-4">Status & Rekomendasi</th>
                <th className="py-3 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredChannels.map((ch) => {
                const sampleFee = calculateChannelFee(
                  100000,
                  ch.fee_flat,
                  ch.fee_percent
                );

                return (
                  <tr
                    key={ch.id}
                    className="transition-colors hover:bg-zinc-900/50"
                  >
                    <td className="py-3.5 pr-4 font-mono font-bold text-zinc-100">
                      {ch.code}
                      <div className="font-mono text-[10px] font-normal text-zinc-500 tabular-nums">
                        Urutan #{ch.sort_order}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-100">
                        {ch.name}
                      </div>
                      <span className="mt-1 inline-block rounded border border-white/[0.08] bg-zinc-900 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
                        {ch.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums text-zinc-200">
                      <div>Flat: {formatRupiah(ch.fee_flat)}</div>
                      <div className="text-[11px] text-amber-400">
                        Persen: {ch.fee_percent}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums">
                      <span className="font-bold text-zinc-100">
                        +{formatRupiah(sampleFee)}
                      </span>
                      <div className="text-[10px] text-zinc-500">
                        Total: {formatRupiah(100000 + sampleFee)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            onUpsertPaymentChannel({
                              ...ch,
                              is_active: !ch.is_active,
                            })
                          }
                          className={`rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase transition-colors ${
                            ch.is_active
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-zinc-700 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {ch.is_active ? "ONLINE" : "MAINTENANCE"}
                        </button>

                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            onUpsertPaymentChannel({
                              ...ch,
                              is_featured: !ch.is_featured,
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-[10px] font-semibold uppercase transition-colors ${
                            ch.is_featured
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                              : "border-white/[0.08] bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Star className="h-3 w-3" />
                          <span>FEATURED</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(ch)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-200 hover:border-amber-500/40 hover:text-amber-400"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Fee</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Payment Channel */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-white/[0.12] bg-[#18181B] p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  {editingId
                    ? "EDIT METODE PEMBAYARAN"
                    : "TAMBAH METODE PEMBAYARAN"}
                </span>
                <h3 className="mt-0.5 font-heading text-lg font-bold text-zinc-50">
                  {editingId ? name : "Konfigurasi Channel Baru"}
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

            <form onSubmit={handleSaveChannel} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Kode Channel *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: BNI_VA / GOPAY"
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Kategori Channel *
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as PaymentCategory)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="QRIS">QRIS</option>
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="Virtual Account">Virtual Account</option>
                    <option value="Convenience Store">Convenience Store</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-zinc-300">
                  Nama Tampilan Metode Pembayaran *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: BNI Virtual Account"
                  className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Biaya Flat (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={feeFlat}
                    onChange={(e) => setFeeFlat(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Biaya Persen (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={feePercent}
                    onChange={(e) => setFeePercent(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-zinc-300">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 font-mono text-xs text-zinc-100 tabular-nums focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-zinc-300">
                  Instruksi Pembayaran di Invoice
                </label>
                <textarea
                  rows={2}
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
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
                  <span>Status Channel Online / Aktif</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span>Rekomendasi Utama (Featured)</span>
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
                      await onDeletePaymentChannel(targetId);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Channel</span>
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
                    Simpan Channel
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
