"use client";

import React from "react";
import { Check } from "lucide-react";
import { Denomination } from "@/lib/supabase/database.types";
import { formatRupiah } from "@/lib/utils";

interface StepDenominationGridProps {
  denominations: Denomination[];
  selectedDenominationId: string | null;
  onSelectDenomination: (denom: Denomination) => void;
}

export function StepDenominationGrid({
  denominations,
  selectedDenominationId,
  onSelectDenomination,
}: StepDenominationGridProps) {
  // Group denominations by category_group preserving sort order
  const groups: { name: string; items: Denomination[] }[] = [];
  for (const denom of denominations) {
    const groupName = denom.category_group || "Top Up Instant";
    const existing = groups.find((g) => g.name === groupName);
    if (existing) {
      existing.items.push(denom);
    } else {
      groups.push({ name: groupName, items: [denom] });
    }
  }

  return (
    <section
      aria-labelledby="step-02-heading"
      className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-5 text-left"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-8 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400 tabular-nums">
            02
          </span>
          <h2
            id="step-02-heading"
            className="font-heading text-base font-bold text-zinc-50 sm:text-lg"
          >
            Pilih Nominal Top-Up
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-400 tabular-nums">
          {denominations.length} Pilihan
        </span>
      </div>

      {denominations.length === 0 ? (
        <div className="mt-4 rounded-lg border border-white/[0.08] bg-zinc-950 p-6 text-left">
          <p className="text-sm font-semibold text-zinc-200">
            Nominal belum tersedia untuk produk ini.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Silakan pilih judul game lain pada katalog utama.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <div key={group.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {group.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.items.map((item) => {
                  const isSelected = selectedDenominationId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectDenomination(item)}
                      aria-pressed={isSelected}
                      className={`relative flex min-h-[100px] flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/[0.08] ring-2 ring-amber-500"
                          : "border-white/[0.08] bg-zinc-950/80 hover:border-white/20 hover:bg-zinc-900"
                      }`}
                    >
                      {/* Active Checkmark */}
                      {isSelected && (
                        <span
                          className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-zinc-950"
                          aria-hidden="true"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      )}

                      <div className="pr-6">
                        {item.badge_text && (
                          <span className="mb-1.5 inline-block rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            {item.badge_text}
                          </span>
                        )}
                        <p className="text-sm font-semibold leading-snug text-zinc-50">
                          {item.name}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/[0.06]">
                        {item.original_price && item.original_price > item.price && (
                          <span className="block font-mono text-xs text-zinc-500 line-through tabular-nums">
                            {formatRupiah(item.original_price)}
                          </span>
                        )}
                        <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
