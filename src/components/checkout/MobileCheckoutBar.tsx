"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Denomination, PaymentChannel } from "@/lib/supabase/database.types";
import { calculateChannelFee, formatRupiah } from "@/lib/utils";

interface MobileCheckoutBarProps {
  selectedDenomination: Denomination | null;
  selectedChannel: PaymentChannel | null;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmitCheckout: () => void;
}

export function MobileCheckoutBar({
  selectedDenomination,
  selectedChannel,
  canSubmit,
  isSubmitting,
  onSubmitCheckout,
}: MobileCheckoutBarProps) {
  const amount = selectedDenomination ? selectedDenomination.price : 0;
  const fee =
    selectedDenomination && selectedChannel
      ? calculateChannelFee(
          selectedDenomination.price,
          selectedChannel.fee_flat,
          selectedChannel.fee_percent
        )
      : 0;
  const totalAmount = amount + fee;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.12] bg-zinc-950/95 p-3.5 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-xs text-zinc-400">
            {selectedDenomination
              ? selectedDenomination.name
              : "Pilih nominal top-up"}
          </p>
          <p className="font-mono text-lg font-bold text-amber-400 tabular-nums">
            {formatRupiah(totalAmount)}
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmitCheckout}
          disabled={!canSubmit || isSubmitting}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 font-heading text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Bayar Sekarang</span>
          )}
        </button>
      </div>
    </div>
  );
}
