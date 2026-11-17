"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  ADMIN_TELEGRAM_DISPLAY,
  ADMIN_TELEGRAM_PHONE,
  ADMIN_WHATSAPP_DISPLAY,
  ADMIN_WHATSAPP_JID,
  ADMIN_WHATSAPP_PLUS,
  ADMIN_WHATSAPP_RAW,
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

interface WhatsAppAdminHubProps {
  initialInvoice?: string;
}

export function WhatsAppAdminHub({
  initialInvoice = "",
}: WhatsAppAdminHubProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    WHATSAPP_QUICK_TEMPLATES[0].id
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(initialInvoice);
  const [gameName, setGameName] = useState<string>("");
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [senderPhone, setSenderPhone] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>(
    WHATSAPP_QUICK_TEMPLATES[0].defaultMessage
  );
  const [includeMessageInQr, setIncludeMessageInQr] = useState<boolean>(true);
  const [syncedWaMatrix, setSyncedWaMatrix] = useState<boolean[][] | null>(
    null
  );
  const [syncedTgMatrix, setSyncedTgMatrix] = useState<boolean[][] | null>(
    null
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  const formattedMessage = useMemo(
    () =>
      buildFormattedSupportMessage({
        topicId: selectedTopicId,
        invoiceNumber,
        gameName,
        targetUserId,
        senderPhone,
        customMessage,
      }),
    [
      selectedTopicId,
      invoiceNumber,
      gameName,
      targetUserId,
      senderPhone,
      customMessage,
    ]
  );

  const whatsappChatUrl = useMemo(
    () => buildAdminWhatsAppUrl(formattedMessage),
    [formattedMessage]
  );

  const telegramChatUrl = useMemo(
    () => buildAdminTelegramUrl(formattedMessage),
    [formattedMessage]
  );

  const directWaUrl = useMemo(() => buildAdminWhatsAppUrl(), []);
  const directTgUrl = useMemo(() => buildAdminTelegramUrl(), []);

  const activeWaQrPayload = includeMessageInQr ? whatsappChatUrl : directWaUrl;
  const activeTgQrPayload = includeMessageInQr ? telegramChatUrl : directTgUrl;

  const computedWaMatrix = useMemo(
    () => generateWhatsAppQrMatrix(activeWaQrPayload),
    [activeWaQrPayload]
  );

  const computedTgMatrix = useMemo(
    () => generateWhatsAppQrMatrix(activeTgQrPayload),
    [activeTgQrPayload]
  );

  const displayedWaMatrix = syncedWaMatrix || computedWaMatrix;
  const displayedTgMatrix = syncedTgMatrix || computedTgMatrix;

  function clearSyncedCache() {
    setSyncedWaMatrix(null);
    setSyncedTgMatrix(null);
    setSyncNotice(null);
    setSyncError(null);
  }

  function handleSelectTopic(topicId: string) {
    setSelectedTopicId(topicId);
    const tpl = WHATSAPP_QUICK_TEMPLATES.find((item) => item.id === topicId);
    if (tpl) {
      setCustomMessage(tpl.defaultMessage);
    }
    clearSyncedCache();
  }

  function handleResetTemplateText() {
    const tpl =
      WHATSAPP_QUICK_TEMPLATES.find((item) => item.id === selectedTopicId) ||
      WHATSAPP_QUICK_TEMPLATES[0];
    setCustomMessage(tpl.defaultMessage);
    setInvoiceNumber("");
    setGameName("");
    setTargetUserId("");
    setSenderPhone("");
    clearSyncedCache();
  }

  function handleCopyAdminNumber() {
    navigator.clipboard?.writeText(ADMIN_WHATSAPP_RAW);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  }

  function handleCopyPreviewMessage() {
    navigator.clipboard?.writeText(formattedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  }

  function handleDownloadQrSvg(elementId: string, filename: string) {
    const svgEl = document.getElementById(elementId);
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function handleRefreshQrFromServer() {
    setIsSyncing(true);
    setSyncError(null);
    setSyncNotice(null);

    try {
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: selectedTopicId,
          invoice_number: invoiceNumber,
          game_name: gameName,
          target_user_id: targetUserId,
          sender_phone: senderPhone,
          custom_message: includeMessageInQr ? customMessage : "",
        }),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.qr_matrix)) {
        setSyncError(
          data.error ||
            "Gagal memperbarui barcode QR WhatsApp & Telegram dari server."
        );
        return;
      }

      if (includeMessageInQr) {
        setSyncedWaMatrix(data.qr_matrix as boolean[][]);
        if (Array.isArray(data.telegram_qr_matrix)) {
          setSyncedTgMatrix(data.telegram_qr_matrix as boolean[][]);
        }
      } else {
        setSyncedWaMatrix(generateWhatsAppQrMatrix(directWaUrl));
        setSyncedTgMatrix(generateWhatsAppQrMatrix(directTgUrl));
      }
      setSyncNotice(
        `Barcode QR WhatsApp & Telegram beserta pesan otomatis berhasil disinkronkan untuk nomor Admin ${ADMIN_WHATSAPP_RAW}.`
      );
    } catch {
      setSyncError(
        "Koneksi ke endpoint /api/whatsapp gagal. Barcode lokal tetap aktif dan dapat dipindai."
      );
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 text-left sm:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              WHATSAPP.JS &amp; TELEGRAM GATEWAY · AUTO-TEMPLATE MESSAGE
            </span>
            <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-3xl">
              Barcode WhatsApp &amp; Telegram Admin
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-300 sm:text-sm">
              Pindai barcode QR WhatsApp atau Telegram di bawah, atau pilih template pesan otomatis agar saat Anda menghubungi Admin ({ADMIN_WHATSAPP_RAW}), format pesan langsung terisi siap kirim.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3 text-left sm:items-end sm:text-right">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              NOMOR ADMIN RESMI (WA &amp; TELEGRAM)
            </span>
            <span className="font-mono text-xl font-extrabold text-zinc-50 tabular-nums">
              {ADMIN_WHATSAPP_RAW}
            </span>
            <span className="font-mono text-xs text-zinc-300 tabular-nums">
              {ADMIN_WHATSAPP_PLUS} · {ADMIN_TELEGRAM_DISPLAY}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Layout */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (5 Cols): Dual Barcode Card (WhatsApp + Telegram) */}
        <section
          aria-labelledby="wa-barcode-heading"
          className="h-fit space-y-5 rounded-xl border border-white/[0.08] bg-zinc-900/70 p-5 text-left lg:sticky lg:top-24 lg:col-span-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  DUAL CHANNEL BARCODE
                </span>
                <h2
                  id="wa-barcode-heading"
                  className="font-heading text-base font-bold text-zinc-50"
                >
                  QR WhatsApp &amp; Telegram ({ADMIN_WHATSAPP_DISPLAY})
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIncludeMessageInQr((prev) => !prev);
                clearSyncedCache();
              }}
              className="min-h-[36px] rounded-lg border border-white/[0.12] bg-zinc-950 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-400 transition-colors hover:border-amber-500/50"
            >
              {includeMessageInQr
                ? "Mode QR: + Pesan Otomatis"
                : "Mode QR: Nomor Saja"}
            </button>
          </div>

          {/* Card 1: Barcode WhatsApp Admin */}
          <div className="rounded-xl border border-emerald-500/30 bg-zinc-950 p-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-zinc-950">
                  <WhatsAppGlyph className="h-4 w-4" />
                </span>
                <div>
                  <span className="block font-heading text-xs font-bold text-zinc-50">
                    1. Barcode WhatsApp Admin
                  </span>
                  <span className="block font-mono text-[11px] text-emerald-400 tabular-nums">
                    {ADMIN_WHATSAPP_RAW} ({ADMIN_WHATSAPP_JID})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleDownloadQrSvg(
                    "kronos-wa-admin-qr-svg",
                    `Barcode-WhatsApp-Admin-${ADMIN_WHATSAPP_RAW}.svg`
                  )
                }
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh SVG</span>
              </button>
            </div>

            <div className="mt-3.5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="shrink-0 rounded-xl border border-white/[0.15] bg-zinc-100 p-2.5">
                <WhatsAppQrSvg
                  id="kronos-wa-admin-qr-svg"
                  matrix={displayedWaMatrix}
                  className="h-36 w-36"
                  ariaLabel={`Barcode QR WhatsApp Admin KRONOS.GG nomor ${ADMIN_WHATSAPP_RAW}`}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2.5">
                <p className="text-xs leading-relaxed text-zinc-300">
                  Pindai dengan kamera HP atau aplikasi WhatsApp untuk membuka chat Admin beserta pesan template otomatis.
                </p>
                <a
                  href={whatsappChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-emerald-400"
                >
                  <WhatsAppGlyph className="h-4 w-4" />
                  <span>Chat WhatsApp (Pesan Otomatis)</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Barcode Telegram Admin */}
          <div className="rounded-xl border border-amber-500/30 bg-zinc-950 p-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-zinc-950">
                  <TelegramGlyph className="h-4 w-4" />
                </span>
                <div>
                  <span className="block font-heading text-xs font-bold text-zinc-50">
                    2. Barcode Telegram Admin
                  </span>
                  <span className="block font-mono text-[11px] text-amber-400 tabular-nums">
                    {ADMIN_TELEGRAM_PHONE} ({ADMIN_TELEGRAM_DISPLAY})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleDownloadQrSvg(
                    "kronos-tg-admin-qr-svg",
                    `Barcode-Telegram-Admin-${ADMIN_WHATSAPP_RAW}.svg`
                  )
                }
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh SVG</span>
              </button>
            </div>

            <div className="mt-3.5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="shrink-0 rounded-xl border border-white/[0.15] bg-zinc-100 p-2.5">
                <WhatsAppQrSvg
                  id="kronos-tg-admin-qr-svg"
                  matrix={displayedTgMatrix}
                  className="h-36 w-36"
                  ariaLabel={`Barcode QR Telegram Admin KRONOS.GG nomor ${ADMIN_TELEGRAM_PHONE}`}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2.5">
                <p className="text-xs leading-relaxed text-zinc-300">
                  Pindai untuk terhubung ke akun Telegram Admin ({ADMIN_TELEGRAM_PHONE}) dengan draf pesan otomatis.
                </p>
                <a
                  href={telegramChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400"
                >
                  <TelegramGlyph className="h-4 w-4" />
                  <span>Chat Telegram (Pesan Otomatis)</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copy Admin Phone Number */}
          <button
            type="button"
            onClick={handleCopyAdminNumber}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-zinc-950 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:border-white/25 hover:bg-zinc-800"
          >
            {copiedNumber ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">
                  Nomor Admin ({ADMIN_WHATSAPP_RAW}) Tersalin
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-zinc-400" />
                <span className="tabular-nums">
                  Salin Nomor Admin ({ADMIN_WHATSAPP_RAW})
                </span>
              </>
            )}
          </button>
        </section>

        {/* Right Column (7 Cols): Automatic Message Templates & Composer */}
        <section
          aria-labelledby="wa-composer-heading"
          className="space-y-6 lg:col-span-7"
        >
          {/* Step 01: Quick Topic Templates */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-5 text-left sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-8 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400 tabular-nums">
                  01
                </span>
                <h2
                  id="wa-composer-heading"
                  className="font-heading text-base font-bold text-zinc-50 sm:text-lg"
                >
                  Pilih Template Pesan Otomatis Pembeli
                </h2>
              </div>
              <span className="font-mono text-xs text-zinc-400">
                AUTO-FILL TEMPLATE
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-zinc-300">
              Pilih salah satu keperluan di bawah. Teks pesan otomatis akan langsung disiapkan untuk dikirim ke WhatsApp maupun Telegram Admin.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {WHATSAPP_QUICK_TEMPLATES.map((template) => {
                const isSelected = selectedTopicId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelectTopic(template.id)}
                    className={`min-h-[76px] rounded-xl border p-3.5 text-left transition-colors ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/[0.08] ring-2 ring-amber-500"
                        : "border-white/[0.08] bg-zinc-950/80 hover:border-white/20 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded border border-white/[0.1] bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-400">
                        {template.badge}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-amber-400" />
                      )}
                    </div>
                    <p className="mt-2 font-heading text-sm font-bold text-zinc-50">
                      {template.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 02: Order Context & Custom Message */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-5 text-left sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-8 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400 tabular-nums">
                  02
                </span>
                <h2 className="font-heading text-base font-bold text-zinc-50 sm:text-lg">
                  Lengkapi Data Pesanan &amp; Teks Otomatis
                </h2>
              </div>

              <button
                type="button"
                onClick={handleResetTemplateText}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-300 hover:border-white/25 hover:text-zinc-100"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                <span>Reset Template</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wa-invoice-input"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Nomor Invoice (Opsional)
                </label>
                <input
                  id="wa-invoice-input"
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => {
                    setInvoiceNumber(e.target.value);
                    clearSyncedCache();
                  }}
                  placeholder="Contoh: INV-20261113-KRN001"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2 font-mono text-xs text-zinc-50 tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="wa-game-input"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Nama Game / Produk (Opsional)
                </label>
                <input
                  id="wa-game-input"
                  type="text"
                  value={gameName}
                  onChange={(e) => {
                    setGameName(e.target.value);
                    clearSyncedCache();
                  }}
                  placeholder="Contoh: Mobile Legends - 355 Diamonds"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2 text-xs text-zinc-50 placeholder:text-zinc-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="wa-userid-input"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  User ID / Zone ID Game (Opsional)
                </label>
                <input
                  id="wa-userid-input"
                  type="text"
                  value={targetUserId}
                  onChange={(e) => {
                    setTargetUserId(e.target.value);
                    clearSyncedCache();
                  }}
                  placeholder="Contoh: 124859201 (2614)"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2 font-mono text-xs text-zinc-50 tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="wa-sender-input"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Nomor Kontak Anda (Opsional)
                </label>
                <input
                  id="wa-sender-input"
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => {
                    setSenderPhone(e.target.value);
                    clearSyncedCache();
                  }}
                  placeholder="081234567890"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2 font-mono text-xs text-zinc-50 tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="wa-message-textarea"
                className="block text-xs font-semibold text-zinc-300"
              >
                Pesan Template Otomatis (Dapat Diedit)
              </label>
              <textarea
                id="wa-message-textarea"
                rows={4}
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  clearSyncedCache();
                }}
                placeholder="Tulis pesan atau kendala pesanan Anda di sini..."
                className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-amber-500"
              />
            </div>

            {/* Automatic Message Preview */}
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-zinc-950 p-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  PRATINJAU PESAN OTOMATIS (SIAP KIRIM KE ADMIN)
                </span>
                <button
                  type="button"
                  onClick={handleCopyPreviewMessage}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded border border-white/[0.1] bg-zinc-900 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-200 hover:border-white/25"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Teks Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Salin Pesan</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-200 tabular-nums">
                {formattedMessage}
              </pre>
            </div>

            {syncError && (
              <div
                role="alert"
                className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{syncError}</span>
              </div>
            )}

            {syncNotice && !syncError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{syncNotice}</span>
              </div>
            )}

            {/* Action Buttons: Send to WhatsApp, Send to Telegram, Refresh QR */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-emerald-400 sm:text-sm"
              >
                <WhatsAppGlyph className="h-4 w-4 shrink-0" />
                <span className="tabular-nums">
                  Kirim ke WhatsApp ({ADMIN_WHATSAPP_RAW})
                </span>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>

              <a
                href={telegramChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-heading text-xs font-bold text-zinc-950 transition-colors hover:bg-amber-400 sm:text-sm"
              >
                <TelegramGlyph className="h-4 w-4 shrink-0" />
                <span className="tabular-nums">
                  Kirim ke Telegram ({ADMIN_TELEGRAM_PHONE})
                </span>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            </div>

            <div className="mt-3">
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleRefreshQrFromServer}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-zinc-950 px-4 py-2 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    <span>Menyinkronkan Barcode WA &amp; Telegram...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 text-amber-400" />
                    <span>
                      Sinkronkan Barcode QR WA &amp; Telegram via Server
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
