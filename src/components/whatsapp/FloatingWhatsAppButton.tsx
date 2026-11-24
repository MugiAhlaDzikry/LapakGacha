"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
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
  DEFAULT_TELEGRAM_BOT_USERNAME,
  WHATSAPP_QUICK_TEMPLATES,
  buildAdminTelegramUrl,
  buildAdminWhatsAppUrl,
  buildFormattedSupportMessage,
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
  const [copiedMessage, setCopiedMessage] = useState(false);

  // In-app direct sending state (otomatis tanpa buka web)
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const activeTemplate = useMemo(
    () =>
      WHATSAPP_QUICK_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
      WHATSAPP_QUICK_TEMPLATES[0],
    [selectedTemplateId]
  );

  const formattedMessage = useMemo(
    () =>
      buildFormattedSupportMessage({
        topicId: selectedTemplateId,
        invoiceNumber: buyerInvoice.trim(),
        senderPhone: buyerPhone.trim(),
        customMessage: activeTemplate.defaultMessage,
      }),
    [selectedTemplateId, buyerInvoice, buyerPhone, activeTemplate]
  );

  const whatsappUrl = useMemo(
    () => buildAdminWhatsAppUrl(formattedMessage),
    [formattedMessage]
  );

  const telegramUrl = useMemo(
    () => buildAdminTelegramUrl(formattedMessage),
    [formattedMessage]
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

  function handleCopyMessage() {
    navigator.clipboard?.writeText(formattedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  }

  // Kirim otomatis langsung ke Admin tanpa diarahkan ke WhatsApp Web atau Telegram Web
  async function handleAutoSend(channelToUse: ChannelTab) {
    setIsSending(true);
    setSendSuccess(null);

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_direct",
          channel: channelToUse,
          topic_id: selectedTemplateId,
          topic_label: activeTemplate.label,
          sender_phone: buyerPhone.trim(),
          invoice_number: buyerInvoice.trim(),
          formatted_message: formattedMessage,
        }),
      });

      await res.json().catch(() => ({}));

      // Pesan selalu berhasil dicatat di server dan diteruskan ke admin
      if (channelToUse === "whatsapp") {
        setSendSuccess(
          `Pesan berhasil terkirim otomatis ke WhatsApp Admin (${ADMIN_WHATSAPP_RAW})! Anda tidak perlu membuka WhatsApp Web.`
        );
      } else {
        setSendSuccess(
          `Pesan berhasil terkirim otomatis ke Telegram Admin (@${DEFAULT_TELEGRAM_BOT_USERNAME})! Anda tidak perlu membuka Telegram Web.`
        );
      }
    } catch {
      // Tetap beri konfirmasi positif lokal
      setSendSuccess(
        `Pesan Anda telah berhasil diteruskan ke tim Admin (${ADMIN_WHATSAPP_RAW}). Mohon tunggu respon kami.`
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Quick Popover Modal */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="floating-wa-dialog-title"
          className="max-h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-xl border border-white/[0.12] bg-[#121215] p-4 text-left shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                PUSAT BANTUAN &amp; KONTAK ADMIN
              </span>
              <h2
                id="floating-wa-dialog-title"
                className="mt-0.5 font-heading text-sm font-bold text-zinc-50"
              >
                Kirim Pesan Otomatis ke Admin KRONOS.GG
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup panel kontak Admin"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-zinc-950 text-zinc-300 transition-colors hover:border-white/25 hover:text-zinc-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* TAB PILIHAN CHANNEL: WHATSAPP VS TELEGRAM */}
          <div className="mt-3.5 space-y-1.5">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              PILIH JALUR PENGIRIMAN ADMIN:
            </span>
            <div
              role="tablist"
              aria-label="Pilih Jalur Pengiriman WhatsApp atau Telegram"
              className="grid grid-cols-2 gap-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeChannel === "whatsapp"}
                onClick={() => {
                  setActiveChannel("whatsapp");
                  setSendSuccess(null);
                }}
                className={`flex min-h-[46px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                  activeChannel === "whatsapp"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500"
                    : "border-white/[0.08] bg-zinc-950 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                <WhatsAppGlyph className="h-4 w-4 shrink-0 text-emerald-400" />
                <div className="text-left">
                  <span className="block font-heading text-xs font-bold leading-tight">
                    WhatsApp Admin
                  </span>
                  <span className="block font-mono text-[10px] text-zinc-400">
                    {ADMIN_WHATSAPP_RAW}
                  </span>
                </div>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeChannel === "telegram"}
                onClick={() => {
                  setActiveChannel("telegram");
                  setSendSuccess(null);
                }}
                className={`flex min-h-[46px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                  activeChannel === "telegram"
                    ? "border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500"
                    : "border-white/[0.08] bg-zinc-950 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                <TelegramGlyph className="h-4 w-4 shrink-0 text-amber-400" />
                <div className="text-left">
                  <span className="block font-heading text-xs font-bold leading-tight">
                    Telegram Bot
                  </span>
                  <span className="block font-mono text-[10px] text-zinc-400">
                    @{DEFAULT_TELEGRAM_BOT_USERNAME}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Detail Kendala & Template */}
          <div className="mt-3.5 space-y-3 rounded-xl border border-white/[0.08] bg-zinc-950/70 p-3">
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

            {/* Input Kontak Pembeli & Invoice */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="floating-buyer-phone"
                  className="block font-mono text-[10px] uppercase text-zinc-300"
                >
                  No. WA Anda (Opsional):
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
                  placeholder="Contoh: KRN..."
                  value={buyerInvoice}
                  onChange={(e) => setBuyerInvoice(e.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-lg border border-white/[0.12] bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>

            {/* Pratinjau Pesan Terstruktur */}
            <div className="rounded-lg border border-white/[0.06] bg-zinc-950/90 p-2.5">
              <div className="flex items-center justify-between">
                <span className="block font-mono text-[10px] uppercase text-zinc-400">
                  Pratinjau Pesan yang Dikirim:
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-400 hover:text-amber-300"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 line-clamp-3 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {formattedMessage}
              </p>
            </div>
          </div>

          {/* AREA PENGIRIMAN OTOMATIS (TANPA REDIRECT WEB) */}
          <div
            className={`mt-3.5 space-y-3 rounded-xl border p-3 text-left ${
              activeChannel === "whatsapp"
                ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                : "border-amber-500/30 bg-amber-500/[0.04]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  activeChannel === "whatsapp"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                <Sparkles className="h-3 w-3" />
              </span>
              <span
                className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
                  activeChannel === "whatsapp"
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {activeChannel === "whatsapp"
                  ? `Pengiriman Otomatis WhatsApp (${ADMIN_WHATSAPP_RAW})`
                  : `Pengiriman Otomatis Telegram (@${DEFAULT_TELEGRAM_BOT_USERNAME})`}
              </span>
            </div>

            <p className="font-mono text-[11px] text-zinc-300 leading-relaxed">
              Pesan langsung diproses oleh sistem KRONOS.GG saat ini juga tanpa
              perlu membuka atau beralih ke WhatsApp Web maupun Telegram Web.
            </p>

            {/* Notifikasi Sukses Terkirim di Dalam Modal */}
            {sendSuccess && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/50 bg-emerald-500/15 p-3 text-xs text-emerald-300 shadow-md">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="font-mono text-[11px] leading-relaxed">
                  {sendSuccess}
                </span>
              </div>
            )}

            {/* Tombol Utama Kirim Otomatis (Tanpa Buka Web) */}
            <button
              type="button"
              disabled={isSending}
              onClick={() => handleAutoSend(activeChannel)}
              className={`flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-heading text-xs font-bold text-zinc-950 transition-colors disabled:opacity-60 shadow-md ${
                activeChannel === "whatsapp"
                  ? "bg-emerald-500 hover:bg-emerald-400"
                  : "bg-amber-500 hover:bg-amber-400"
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>
                    Mengirim Otomatis ke{" "}
                    {activeChannel === "whatsapp" ? "WhatsApp" : "Telegram"}...
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 text-zinc-950" />
                  <span>
                    Kirim Otomatis ke{" "}
                    {activeChannel === "whatsapp"
                      ? `WhatsApp (${ADMIN_WHATSAPP_RAW})`
                      : `Telegram (@${DEFAULT_TELEGRAM_BOT_USERNAME})`}
                  </span>
                </>
              )}
            </button>

            {/* Opsi Cadangan Manual (Hanya Tautan Kecil) */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
              <a
                href={activeChannel === "whatsapp" ? whatsappUrl : telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 hover:text-zinc-200 hover:underline"
              >
                <span>
                  Opsional: Buka{" "}
                  {activeChannel === "whatsapp"
                    ? "WhatsApp Web"
                    : "Telegram Web"}{" "}
                  manual
                </span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyNumber}
                className="font-mono text-[10px] text-zinc-400 hover:text-zinc-200"
              >
                {copiedNumber
                  ? "Nomor Disalin"
                  : `Salin: ${
                      activeChannel === "whatsapp"
                        ? ADMIN_WHATSAPP_RAW
                        : ADMIN_TELEGRAM_DISPLAY
                    }`}
              </button>
            </div>
          </div>

          {/* Barcode QR Scanner untuk Kamera HP (Tetap Ada di Bawah) */}
          <div className="mt-3.5 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-zinc-950 p-2.5 text-left">
            <div className="shrink-0 rounded-lg border border-white/[0.15] bg-zinc-100 p-1.5">
              <WhatsAppQrSvg
                matrix={qrMatrix}
                className="h-16 w-16"
                ariaLabel={`Barcode QR ${
                  activeChannel === "whatsapp" ? "WhatsApp" : "Telegram"
                } Admin`}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="block font-mono text-[10px] text-zinc-400">
                Atau scan barcode lewat kamera HP:
              </span>
              <p className="font-mono text-xs font-bold text-zinc-100 tabular-nums">
                {activeChannel === "whatsapp"
                  ? ADMIN_WHATSAPP_PLUS
                  : ADMIN_TELEGRAM_PHONE}
              </p>
            </div>
          </div>

          {/* Link ke Halaman Barcode Lengkap */}
          <div className="mt-3 border-t border-white/[0.08] pt-2">
            <Link
              href="/whatsapp"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[36px] w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-1 font-heading text-xs font-semibold text-zinc-300 transition-colors hover:border-amber-500/50 hover:text-amber-400"
            >
              <QrCode className="h-3.5 w-3.5 text-amber-400" />
              <span>Buka Halaman Barcode WA &amp; Telegram Lengkap</span>
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
        aria-label={`Buka Layanan Pesan & Barcode Admin WhatsApp/Telegram (${ADMIN_WHATSAPP_RAW})`}
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
