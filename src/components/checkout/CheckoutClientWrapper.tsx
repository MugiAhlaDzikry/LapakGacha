"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import {
  Denomination,
  Game,
  PaymentChannel,
} from "@/lib/supabase/database.types";
import { OrderSummarySticky } from "./OrderSummarySticky";
import { StepAccountInput } from "./StepAccountInput";
import { StepDenominationGrid } from "./StepDenominationGrid";
import { StepPaymentChannels } from "./StepPaymentChannels";
import { MobileCheckoutBar } from "./MobileCheckoutBar";

interface CheckoutClientWrapperProps {
  game: Game;
  denominations: Denomination[];
  paymentChannels: PaymentChannel[];
}

export function CheckoutClientWrapper({
  game,
  denominations,
  paymentChannels,
}: CheckoutClientWrapperProps) {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [nickname, setNickname] = useState<string | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [selectedDenomination, setSelectedDenomination] =
    useState<Denomination | null>(denominations[0] || null);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(
    paymentChannels.find((c) => c.is_featured) || paymentChannels[0] || null
  );
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerifyAccount() {
    if (userId.trim().length < 5) {
      setCheckError("Masukkan minimal 5 digit/karakter pada kolom ID.");
      setNickname(null);
      return;
    }

    if (game.requires_zone_id && !zoneId.trim()) {
      setCheckError(`Kolom ${game.zone_label} wajib diisi.`);
      setNickname(null);
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    try {
      const response = await fetch("/api/check-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_slug: game.slug,
          user_id: userId.trim(),
          zone_id: zoneId.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        setNickname(null);
        setCheckError(data.message || "ID Akun tidak ditemukan.");
      } else {
        setNickname(data.nickname);
        setCheckError(null);
      }
    } catch {
      setCheckError("Gagal memverifikasi ID. Silakan coba kembali.");
    } finally {
      setIsChecking(false);
    }
  }

  const isPhoneValid = whatsappNumber.replace(/\D/g, "").length >= 9;
  const isAccountReady =
    userId.trim().length >= 5 &&
    (!game.requires_zone_id || zoneId.trim().length > 0);

  const canSubmit = Boolean(
    isAccountReady && selectedDenomination && selectedChannel && isPhoneValid
  );

  async function handleSubmitCheckout() {
    if (!canSubmit || !selectedDenomination || !selectedChannel) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let resolvedNickname = nickname;
      if (!resolvedNickname) {
        const checkRes = await fetch("/api/check-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game_slug: game.slug,
            user_id: userId.trim(),
            zone_id: zoneId.trim(),
          }),
        });
        const checkData = await checkRes.json();
        if (!checkRes.ok || !checkData.valid) {
          setCheckError(
            checkData.message || "Mohon periksa kembali ID akun game Anda."
          );
          setIsSubmitting(false);
          return;
        }
        resolvedNickname = checkData.nickname;
        setNickname(resolvedNickname);
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: game.id,
          denomination_id: selectedDenomination.id,
          target_user_id: userId.trim(),
          target_zone_id: game.requires_zone_id ? zoneId.trim() : null,
          target_nickname: resolvedNickname,
          whatsapp_number: whatsappNumber.trim(),
          payment_code: selectedChannel.code,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.invoice_number) {
        setSubmitError(
          result.error || "Gagal membuat transaksi. Silakan coba lagi."
        );
        setIsSubmitting(false);
        return;
      }

      router.push(`/invoice/${result.invoice_number}`);
    } catch {
      setSubmitError("Terjadi gangguan jaringan saat membuat invoice.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Sticky Game Info & Live Summary */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-24 lg:col-span-4">
          <OrderSummarySticky
            game={game}
            userId={userId}
            zoneId={zoneId}
            nickname={nickname}
            selectedDenomination={selectedDenomination}
            selectedChannel={selectedChannel}
            whatsappNumber={whatsappNumber}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            onSubmitCheckout={handleSubmitCheckout}
          />
        </aside>

        {/* Right Column: Step-by-Step Interactive Containers */}
        <div className="space-y-6 lg:col-span-8">
          <StepAccountInput
            game={game}
            userId={userId}
            zoneId={zoneId}
            nickname={nickname}
            checkError={checkError}
            isChecking={isChecking}
            onUserIdChange={(val) => {
              setUserId(val);
              if (nickname) setNickname(null);
            }}
            onZoneIdChange={(val) => {
              setZoneId(val);
              if (nickname) setNickname(null);
            }}
            onVerifyAccount={handleVerifyAccount}
          />

          <StepDenominationGrid
            denominations={denominations}
            selectedDenominationId={selectedDenomination?.id || null}
            onSelectDenomination={setSelectedDenomination}
          />

          <StepPaymentChannels
            channels={paymentChannels}
            selectedDenomination={selectedDenomination}
            selectedChannelCode={selectedChannel?.code || null}
            onSelectChannel={setSelectedChannel}
          />

          {/* Step 04: Kontak WhatsApp */}
          <section
            aria-labelledby="step-04-heading"
            className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-5 text-left"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-8 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400 tabular-nums">
                  04
                </span>
                <h2
                  id="step-04-heading"
                  className="font-heading text-base font-bold text-zinc-50 sm:text-lg"
                >
                  Kontak WhatsApp
                </h2>
              </div>
              <span className="font-mono text-xs text-zinc-400">
                BUKTI &amp; RIWAYAT
              </span>
            </div>

            <div className="mt-4">
              <label
                htmlFor="checkout-whatsapp"
                className="block text-xs font-semibold text-zinc-300"
              >
                Nomor WhatsApp Aktif <span className="text-amber-500">*</span>
              </label>
              <input
                id="checkout-whatsapp"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="081234567890"
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2.5 font-mono text-sm text-zinc-50 tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-zinc-400">
                Nomor ini digunakan untuk melacak riwayat transaksi pada halaman Lacak Pesanan.
              </p>
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{submitError}</span>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      <MobileCheckoutBar
        selectedDenomination={selectedDenomination}
        selectedChannel={selectedChannel}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onSubmitCheckout={handleSubmitCheckout}
      />
    </div>
  );
}
