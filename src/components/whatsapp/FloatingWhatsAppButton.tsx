"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  QrCode,
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
  const [copiedNumber, setCopiedNumber] = useState(false);

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

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Quick Barcode Popover / Modal */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="floating-wa-dialog-title"
          className="w-[calc(100vw-2rem)] max-w-md rounded-xl border border-white/[0.12] bg-[#121215] p-4 text-left shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                BARCODE &amp; PESAN TEMPLATE OTOMATIS
              </span>
              <h2
                id="floating-wa-dialog-title"
                className="mt-0.5 font-heading text-sm font-bold text-zinc-50"
              >
                Hubungi Admin via WhatsApp / Telegram
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

          {/* Channel Switcher: WhatsApp vs Telegram */}
          <div
            role="tablist"
            aria-label="Pilih Channel Barcode Admin"
            className="mt-3 grid grid-cols-2 gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-950 p-1"
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
          <div className="mt-3 flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-zinc-950 p-3">
            <div className="shrink-0 rounded-lg border border-white/[0.15] bg-zinc-100 p-2">
              <WhatsAppQrSvg
                matrix={qrMatrix}
                className="h-28 w-28"
                ariaLabel={`Barcode QR ${
                  activeChannel === "whatsapp" ? "WhatsApp" : "Telegram"
                } Admin ${ADMIN_WHATSAPP_RAW}`}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-2 text-left">
              <div>
                <span
                  className={`block font-mono text-[10px] font-bold uppercase tracking-wider ${
                    activeChannel === "whatsapp"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {activeChannel === "whatsapp"
                    ? "WHATSAPP ADMIN RESMI"
                    : "TELEGRAM ADMIN RESMI"}
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
                className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-zinc-800"
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

          {/* Automatic Message Template Selector */}
          <div className="mt-3">
            <label
              htmlFor="floating-template-select"
              className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300"
            >
              Pilih Pesan Template Otomatis Pembeli:
            </label>
            <select
              id="floating-template-select"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="mt-1 min-h-[40px] w-full rounded-lg border border-white/[0.12] bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-100 focus:border-amber-500"
            >
              {WHATSAPP_QUICK_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.label} ({tpl.badge})
                </option>
              ))}
            </select>

            <div className="mt-2 rounded-lg border border-white/[0.06] bg-zinc-950/90 p-2.5">
              <span className="block font-mono text-[10px] uppercase text-zinc-400">
                Pesan Otomatis Saat Chat Dibuka:
              </span>
              <p className="mt-1 line-clamp-2 font-mono text-[11px] leading-relaxed text-zinc-300">
                {activeTemplate.defaultMessage}
              </p>
            </div>
          </div>

          {/* Navigation & Direct Chat Actions */}
          <div className="mt-3.5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-emerald-400"
              >
                <WhatsAppGlyph className="h-4 w-4 shrink-0" />
                <span>Chat WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 font-heading text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500/25"
              >
                <TelegramGlyph className="h-4 w-4 shrink-0" />
                <span>Chat Telegram</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>

            <Link
              href="/whatsapp"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-zinc-900 px-3.5 py-2 font-heading text-xs font-bold text-zinc-100 transition-colors hover:border-amber-500/50 hover:text-amber-400"
            >
              <QrCode className="h-4 w-4 text-amber-400" />
              <span>Buka Halaman Barcode WA &amp; Telegram</span>
              <ArrowUpRight className="h-4 w-4" />
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
        aria-label={`Buka Barcode WhatsApp & Telegram Admin (${ADMIN_WHATSAPP_RAW})`}
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
            Barcode WA &amp; Telegram
          </span>
          <span className="block font-mono text-[11px] font-semibold text-emerald-400 tabular-nums">
            Admin: {ADMIN_WHATSAPP_RAW}
          </span>
        </span>
      </button>
    </div>
  );
}
