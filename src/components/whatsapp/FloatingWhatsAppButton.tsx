"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  ADMIN_TELEGRAM_DISPLAY,
  ADMIN_TELEGRAM_PHONE,
  ADMIN_WHATSAPP_PLUS,
  ADMIN_WHATSAPP_RAW,
  WHATSAPP_QUICK_TEMPLATES,
  buildAdminTelegramUrl,
  buildAdminWhatsAppUrl,
  generateWhatsAppQrMatrix,
} from "@/lib/whatsapp";
import {
  TelegramGlyph,
  WhatsAppGlyph,
  WhatsAppQrSvg,
} from "./WhatsAppQrCode";

type ChannelTab = "whatsapp" | "telegram";

export function FloatingWhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<ChannelTab>("whatsapp");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    WHATSAPP_QUICK_TEMPLATES[0].id
  );
  const [buyerPhone, setBuyerPhone] = useState<string>("");
  const [buyerInvoice, setBuyerInvoice] = useState<string>("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Direct sending state (tanpa redirect/tanpa buka web)
  const [isDirectSending, setIsDirectSending] = useState(false);
  const [directSendSuccess, setDirectSendSuccess] = useState<string | null>(
    null
  );
  const [directSendError, setDirectSendError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const activeTemplate = useMemo(
    () =>
      WHATSAPP_QUICK_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
      WHATSAPP_QUICK_TEMPLATES[0],
    [selectedTemplateId]
  );

  const whatsappUrl = useMemo(
    () => buildAdminWhatsAppUrl(activeTemplate.defaultMessage),
    [activeTemplate]
  );

  const telegramUrl = useMemo(
    () => buildAdminTelegramUrl(activeTemplate.defaultMessage),
    [activeTemplate]
  );

  const activeQrUrl = activeChannel === "whatsapp" ? whatsappUrl : telegramUrl;

  const qrMatrix = useMemo(
    () => generateWhatsAppQrMatrix(activeQrUrl),
    [activeQrUrl]
  );

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleCopyNumber() {
    const valueToCopy =
      activeChannel === "whatsapp" ? ADMIN_WHATSAPP_RAW : ADMIN_TELEGRAM_PHONE;
    navigator.clipboard?.writeText(valueToCopy);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  }

  // Kirim pesan otomatis langsung tanpa buka WhatsApp Web / Telegram Web
  async function handleDirectSend(e: React.FormEvent) {
    e.preventDefault();
    setIsDirectSending(true);
    setDirectSendError(null);
    setDirectSendSuccess(null);

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_direct",
          topic_id: selectedTemplateId,
          topic_label: activeTemplate.label,
          sender_phone: buyerPhone.trim(),
          invoice_number: buyerInvoice.trim(),
          custom_message: activeTemplate.defaultMessage,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success) {
        setDirectSendSuccess(
          "Pesan otomatis berhasil terkirim langsung ke Admin! Admin akan segera memproses bantuan Anda."
        );
      } else {
        setDirectSendError(
          data?.error ||
            "Gagal mengirim pesan langsung. Pastikan Admin sudah klik START di bot Telegram."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
      setDirectSendError(`Gagal mengirim: ${message}`);
    } finally {
      setIsDirectSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Quick Barcode & Direct Message Popover / Modal */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="floating-wa-dialog-title"
          className="max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-xl border border-white/[0.12] bg-[#121215] p-4 text-left shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                LAYANAN PESAN LANGSUNG &amp; BARCODE
              </span>
              <h2
                id="floating-wa-dialog-title"
                className="mt-0.5 font-heading text-sm font-bold text-zinc-50"
              >
                Hubungi Admin Resmi KRONOS.GG
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup panel Barcode Admin"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-zinc-950 text-zinc-300 transition-colors hover:border-white/25 hover:text-zinc-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Kirim Pesan Langsung Otomatis (Tanpa Redirect Web) */}
          <form
            onSubmit={handleDirectSend}
            className="mt-3.5 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Sparkles className="h-3 w-3" />
              </span>
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Kirim Pesan Otomatis (Tanpa Buka Web)
              </h3>
            </div>
            <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
              Pesan langsung sampai ke Admin saat ini juga tanpa perlu beralih ke
              WhatsApp Web atau Telegram Web.
            </p>

            {/* Template Selector */}
            <div>
              <label
                htmlFor="floating-template-select"
                className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300"
              >
                Pilih Kendala / Topik:
              </label>
              <select
                id="floating-template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="mt-1 min-h-[40px] w-full rounded-lg border border-white/[0.12] bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                {WHATSAPP_QUICK_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.label} ({tpl.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Input Kontak Pembeli & Invoice (Opsional) */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="floating-buyer-phone"
                  className="block font-mono text-[10px] uppercase text-zinc-300"
                >
                  No. WA / Kontak (Opsional):
                </label>
                <input
                  id="floating-buyer-phone"
                  type="text"
                  placeholder="081234567890"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-lg border border-white/[0.12] bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="floating-buyer-invoice"
                  className="block font-mono text-[10px] uppercase text-zinc-300"
                >
                  No. Invoice (Jika Ada):
                </label>
                <input
                  id="floating-buyer-invoice"
                  type="text"
                  placeholder="KRN..."
                  value={buyerInvoice}
                  onChange={(e) => setBuyerInvoice(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-lg border border-white/[0.12] bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>

            {/* Pratinjau Pesan yang Dikirim */}
            <div className="rounded-lg border border-white/[0.06] bg-zinc-950/90 p-2.5">
              <span className="block font-mono text-[10px] uppercase text-zinc-400">
                Pesan yang Dikirimkan:
              </span>
              <p className="mt-1 line-clamp-3 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {activeTemplate.defaultMessage}
              </p>
            </div>

            {/* Status Notifikasi Terkirim / Error */}
            {directSendSuccess && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="font-mono text-[11px] leading-tight">
                  {directSendSuccess}
                </span>
              </div>
            )}

            {directSendError && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="font-mono text-[11px] leading-tight">
                  {directSendError}
                </span>
              </div>
            )}

            {/* Tombol Utama Kirim Langsung */}
            <button
              type="submit"
              disabled={isDirectSending}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {isDirectSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim Pesan Langsung ke Admin...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Pesan Langsung ke Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Bagian Barcode Scan Kamera (Alternatif / Manual) */}
          <div className="mt-4 border-t border-white/[0.08] pt-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Atau Pindai Barcode Admin:
              </span>
            </div>

            {/* Channel Switcher: WhatsApp vs Telegram */}
            <div
              role="tablist"
              aria-label="Pilih Channel Barcode Admin"
              className="mt-2 grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-950 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeChannel === "whatsapp"}
                onClick={() => setActiveChannel("whatsapp")}
                className={`flex min-h-[38px] items-center justify-center gap-2 rounded-md px-3 py-1.5 font-heading text-xs font-bold transition-colors ${
                  activeChannel === "whatsapp"
                    ? "bg-emerald-500 text-zinc-950"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <WhatsAppGlyph className="h-3.5 w-3.5" />
                <span>Barcode WhatsApp</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeChannel === "telegram"}
                onClick={() => setActiveChannel("telegram")}
                className={`flex min-h-[38px] items-center justify-center gap-2 rounded-md px-3 py-1.5 font-heading text-xs font-bold transition-colors ${
                  activeChannel === "telegram"
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <TelegramGlyph className="h-3.5 w-3.5" />
                <span>Barcode Telegram</span>
              </button>
            </div>

            {/* QR Code + Admin Number Block */}
            <div className="mt-2.5 flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-zinc-950 p-3">
              <div className="shrink-0 rounded-lg border border-white/[0.15] bg-zinc-100 p-2">
                <WhatsAppQrSvg
                  matrix={qrMatrix}
                  className="h-24 w-24"
                  ariaLabel={`Barcode QR ${
                    activeChannel === "whatsapp" ? "WhatsApp" : "Telegram"
                  } Admin ${ADMIN_WHATSAPP_RAW}`}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5 text-left">
                <div>
                  <span
                    className={`block font-mono text-[10px] font-bold uppercase tracking-wider ${
                      activeChannel === "whatsapp"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {activeChannel === "whatsapp"
                      ? "WHATSAPP ADMIN"
                      : "TELEGRAM ADMIN"}
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-extrabold text-zinc-50 tabular-nums">
                    {ADMIN_WHATSAPP_RAW}
                  </p>
                  <p className="truncate font-mono text-[11px] text-zinc-400 tabular-nums">
                    {activeChannel === "whatsapp"
                      ? ADMIN_WHATSAPP_PLUS
                      : ADMIN_TELEGRAM_DISPLAY}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-zinc-900 px-2 py-1 font-mono text-[11px] font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-zinc-800"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Nomor Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Salin Nomor Admin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Fallback Manual Link & Navigasi Halaman */}
          <div className="mt-3.5 space-y-2 border-t border-white/[0.08] pt-3">
            <span className="block font-mono text-[10px] text-zinc-400">
              Opsi Manual (Buka Web / App Eksternal):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 font-heading text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                <WhatsAppGlyph className="h-3.5 w-3.5 shrink-0" />
                <span>Buka WhatsApp Web</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 font-heading text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
              >
                <TelegramGlyph className="h-3.5 w-3.5 shrink-0" />
                <span>Buka Telegram Web</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>

            <Link
              href="/whatsapp"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-zinc-900 px-3 py-1.5 font-heading text-xs font-semibold text-zinc-100 transition-colors hover:border-amber-500/50 hover:text-amber-400"
            >
              <QrCode className="h-3.5 w-3.5 text-amber-400" />
              <span>Buka Halaman Barcode WA &amp; Telegram</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Buka Pesan Langsung & Barcode Admin (${ADMIN_WHATSAPP_RAW})`}
        className="group flex min-h-[52px] items-center gap-2.5 rounded-xl border border-emerald-500/50 bg-[#121215] px-3.5 py-2.5 text-left shadow-xl transition-colors hover:border-amber-400 hover:bg-zinc-900"
      >
        <div className="flex items-center -space-x-1.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 transition-colors group-hover:bg-emerald-400">
            <WhatsAppGlyph className="h-4 w-4" />
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-950 bg-amber-500 text-zinc-950">
            <TelegramGlyph className="h-4 w-4" />
          </span>
        </div>

        <span className="hidden pr-1 sm:block">
          <span className="block font-heading text-xs font-bold text-zinc-50">
            Hubungi Admin Langsung
          </span>
          <span className="block font-mono text-[11px] font-semibold text-emerald-400 tabular-nums">
            WA: {ADMIN_WHATSAPP_RAW}
          </span>
        </span>
      </button>
    </div>
  );
}
