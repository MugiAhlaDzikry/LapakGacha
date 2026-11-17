"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Denomination, PaymentChannel } from "@/lib/supabase/database.types";
import { calculateChannelFee, formatRupiah } from "@/lib/utils";

interface StepPaymentChannelsProps {
  channels: PaymentChannel[];
  selectedDenomination: Denomination | null;
  selectedChannelCode: string | null;
  onSelectChannel: (channel: PaymentChannel) => void;
}

const CATEGORY_ORDER: { key: string; title: string }[] = [
  { key: "QRIS", title: "QRIS (Rekomendasi)" },
  { key: "E-Wallet", title: "E-Wallet Instan" },
  { key: "Virtual Account", title: "Virtual Account Bank" },
  { key: "Convenience Store", title: "Gerai Retail" },
];

export function StepPaymentChannels({
  channels,
  selectedDenomination,
  selectedChannelCode,
  onSelectChannel,
}: StepPaymentChannelsProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    QRIS: true,
    "E-Wallet": true,
    "Virtual Account": true,
    "Convenience Store": true,
  });

  function toggleCategory(key: string) {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <section
      aria-labelledby="step-03-heading"
      className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-5 text-left"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-8 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400 tabular-nums">
            03
          </span>
          <h2
            id="step-03-heading"
            className="font-heading text-base font-bold text-zinc-50 sm:text-lg"
          >
            Pilih Metode Pembayaran
          </h2>
        </div>
        {!selectedDenomination && (
          <span className="font-mono text-xs text-zinc-400">
            Pilih nominal di Langkah 02 untuk melihat total
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3.5">
        {CATEGORY_ORDER.map((cat) => {
          const categoryChannels = channels.filter(
            (c) => c.category === cat.key
          );
          if (categoryChannels.length === 0) return null;

          const isOpen = Boolean(openCategories[cat.key]);

          return (
            <div
              key={cat.key}
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/70"
            >
              <button
                type="button"
                onClick={() => toggleCategory(cat.key)}
                aria-expanded={isOpen}
                className="flex min-h-[48px] w-full items-center justify-between bg-zinc-900/80 px-4 py-3 text-left transition-colors hover:bg-zinc-900"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                    {cat.title}
                  </span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 tabular-nums">
                    {categoryChannels.length}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2">
                  {categoryChannels.map((channel) => {
                    const isSelected = selectedChannelCode === channel.code;
                    const fee = selectedDenomination
                      ? calculateChannelFee(
                          selectedDenomination.price,
                          channel.fee_flat,
                          channel.fee_percent
                        )
                      : 0;
                    const finalTotal = selectedDenomination
                      ? selectedDenomination.price + fee
                      : null;

                    const feeLabel =
                      channel.fee_flat > 0
                        ? `Biaya Admin ${formatRupiah(channel.fee_flat)}`
                        : `Biaya Layanan ${channel.fee_percent}%`;

                    return (
                      <button
                        key={channel.code}
                        type="button"
                        onClick={() => onSelectChannel(channel)}
                        aria-pressed={isSelected}
                        className={`relative flex min-h-[78px] flex-col justify-between rounded-lg border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/[0.07] ring-2 ring-amber-500"
                            : "border-white/[0.08] bg-[#121215] hover:border-white/20 hover:bg-zinc-900"
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-zinc-950"
                            aria-hidden="true"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}

                        <div className="pr-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold uppercase text-amber-400">
                              {channel.code.replace("_INSTANT", "").replace("_VA", " VA")}
                            </span>
                            {channel.is_featured && (
                              <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                                INSTAN
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium text-zinc-200">
                            {channel.name}
                          </p>
                        </div>

                        <div className="mt-3 flex items-baseline justify-between border-t border-white/[0.06] pt-2">
                          <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                            {feeLabel}
                          </span>
                          {finalTotal !== null ? (
                            <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                              {formatRupiah(finalTotal)}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-zinc-500">
                              Pilih item dahulu
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
