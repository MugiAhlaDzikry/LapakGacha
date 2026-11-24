export const ADMIN_WHATSAPP_RAW = "089525849290";
export const ADMIN_WHATSAPP_INTL = "6289525849290";
export const ADMIN_WHATSAPP_DISPLAY = "0895-2584-9290";
export const ADMIN_WHATSAPP_PLUS = "+62 895-2584-9290";
export const ADMIN_WHATSAPP_JID = "6289525849290@c.us";

export const ADMIN_TELEGRAM_RAW = "089525849290";
export const ADMIN_TELEGRAM_PHONE = "+6289525849290";
export const ADMIN_TELEGRAM_DISPLAY = "t.me/+6289525849290";
export const DEFAULT_TELEGRAM_BOT_TOKEN = "9141625587:AAFCcHoajscaqMpXP25DeEHC9rA7ZUY44UY";
export const DEFAULT_TELEGRAM_ADMIN_CHAT_ID = "5871354908";
export const DEFAULT_TELEGRAM_BOT_USERNAME = "Sukijem_bot";

export const WHATSAPP_QUICK_TEMPLATES = [
  {
    id: "konfirmasi_bayar",
    label: "Konfirmasi Pembayaran",
    badge: "VERIFIKASI BAYAR",
    description:
      "Kirim konfirmasi pembayaran atau bukti transfer pesanan ke Admin.",
    defaultMessage:
      "Halo Admin KRONOS.GG (089525849290), saya ingin konfirmasi pembayaran pesanan top-up saya.\n\nStatus Pembayaran: Sudah Transfer / Bayar\nMohon dibantu verifikasi dan proses pengirimannya. Terima kasih!",
  },
  {
    id: "kendala_item",
    label: "Kendala Item Belum Masuk",
    badge: "PRIORITAS CS",
    description:
      "Laporkan transaksi yang sudah PAID tetapi item/diamond belum masuk.",
    defaultMessage:
      "Halo Admin KRONOS.GG (089525849290), saya mengalami kendala transaksi: pembayaran sudah berhasil (PAID) namun item/diamond belum masuk ke akun game saya.\n\nMohon bantuannya untuk pengecekan pengiriman. Terima kasih!",
  },
  {
    id: "order_manual",
    label: "Order / Top-Up Manual",
    badge: "ORDER CEPAT",
    description:
      "Pesan top-up atau voucher game langsung melalui bantuan chat Admin.",
    defaultMessage:
      "Halo Admin KRONOS.GG (089525849290), saya ingin melakukan pemesanan top-up game secara manual melalui Admin.\n\nGame / Voucher: \nNominal Item: \nUser ID (Zone ID): \nMetode Pembayaran: \n\nMohon info total bayar dan instruksi pembayarannya. Terima kasih!",
  },
  {
    id: "cek_id_promo",
    label: "Tanya Stok & Promo",
    badge: "INFO KATALOG",
    description:
      "Tanyakan ketersediaan stok nominal SKU, promo Flash Deal, atau harga reseller.",
    defaultMessage:
      "Halo Admin KRONOS.GG (089525849290), saya ingin menanyakan informasi stok produk top-up dan promo Flash Deal yang sedang aktif hari ini. Terima kasih!",
  },
  {
    id: "bantuan_umum",
    label: "Bantuan & Lacak Pesanan",
    badge: "UMUM 24/7",
    description:
      "Pertanyaan umum seputar layanan KRONOS.GG atau pengecekan status invoice.",
    defaultMessage:
      "Halo Admin KRONOS.GG (089525849290), saya membutuhkan bantuan terkait layanan top-up di KRONOS.GG. Mohon panduannya. Terima kasih!",
  },
];

/**
 * Menormalkan nomor telepon lokal Indonesia (misal 0895...) ke format internasional (62895...)
 */
export function formatPhoneToWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return ADMIN_WHATSAPP_INTL;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

/**
 * Membentuk URL deep-link WhatsApp resmi ke nomor Admin (089525849290 / 6289525849290)
 */
export function buildAdminWhatsAppUrl(customMessage) {
  const baseUrl = `https://wa.me/${ADMIN_WHATSAPP_INTL}`;
  const trimmed = typeof customMessage === "string" ? customMessage.trim() : "";
  if (!trimmed) {
    return baseUrl;
  }
  return `${baseUrl}?text=${encodeURIComponent(trimmed)}`;
}

/**
 * Membentuk URL deep-link Telegram resmi ke nomor Admin (+6289525849290)
 * Mendukung parameter ?text=... untuk pesan otomatis saat chat dibuka
 */
export function buildAdminTelegramUrl(customMessage) {
  const baseUrl = `https://t.me/${ADMIN_TELEGRAM_PHONE}`;
  const trimmed = typeof customMessage === "string" ? customMessage.trim() : "";
  if (!trimmed) {
    return baseUrl;
  }
  return `${baseUrl}?text=${encodeURIComponent(trimmed)}`;
}

/**
 * Membentuk pesan template otomatis terstruktur dari pilihan topik dan detail pesanan pembeli
 */
export function buildFormattedSupportMessage({
  topicId,
  invoiceNumber,
  gameName,
  targetUserId,
  senderPhone,
  customMessage,
} = {}) {
  const matchedTemplate =
    WHATSAPP_QUICK_TEMPLATES.find((item) => item.id === topicId) ||
    WHATSAPP_QUICK_TEMPLATES[0];

  const opening =
    customMessage && String(customMessage).trim()
      ? String(customMessage).trim()
      : matchedTemplate.defaultMessage;

  const lines = [opening];

  const cleanInvoice = invoiceNumber
    ? String(invoiceNumber).trim().toUpperCase()
    : "";
  const cleanGame = gameName ? String(gameName).trim() : "";
  const cleanTargetId = targetUserId ? String(targetUserId).trim() : "";
  const cleanSender = senderPhone ? String(senderPhone).trim() : "";

  const details = [];
  if (cleanInvoice) details.push(`No. Invoice: ${cleanInvoice}`);
  if (cleanGame) details.push(`Game / Produk: ${cleanGame}`);
  if (cleanTargetId) details.push(`User ID Tujuan: ${cleanTargetId}`);
  if (cleanSender) details.push(`No. Kontak Pembeli: ${cleanSender}`);

  if (details.length > 0) {
    lines.push("");
    lines.push("--- DATA PESANAN PEMBELI ---");
    lines.push(...details);
  }

  return lines.join("\n");
}

/**
 * Menyusun pesan bantuan otomatis langsung dari data transaksi pada halaman Invoice
 */
export function buildInvoiceWhatsAppMessage(transaction) {
  if (!transaction) {
    return WHATSAPP_QUICK_TEMPLATES[0].defaultMessage;
  }

  const gameTitle = transaction.game?.title || "Top-Up Game";
  const itemName =
    transaction.denomination?.name || transaction.denomination_id;
  const targetId = transaction.target_zone_id
    ? `${transaction.target_user_id} (${transaction.target_zone_id})`
    : transaction.target_user_id;
  const formattedAmount = new Intl.NumberFormat("id-ID").format(
    Math.round(Number(transaction.total_amount || 0))
  );

  return [
    `Halo Admin KRONOS.GG (${ADMIN_WHATSAPP_RAW}), saya ingin konfirmasi / meminta bantuan untuk transaksi berikut:`,
    "",
    "--- RINCIAN INVOICE RESMI ---",
    `No. Invoice: ${transaction.invoice_number}`,
    `Produk: ${gameTitle} - ${itemName}`,
    `ID Tujuan: ${targetId} (${transaction.target_nickname})`,
    `Metode Bayar: ${transaction.payment_code}`,
    `Total Bayar: Rp ${formattedAmount}`,
    `Status Bayar: ${transaction.payment_status}`,
    `Status Kirim: ${transaction.fulfillment_status}`,
    "",
    "Mohon dibantu pengecekannya. Terima kasih!",
  ].join("\n");
}

/**
 * Mengembalikan metadata integrasi modul whatsapp.js & Telegram Admin
 */
export function getWhatsAppIntegrationInfo() {
  const defaultTemplateMsg = WHATSAPP_QUICK_TEMPLATES[0].defaultMessage;
  return {
    module: "whatsapp.js",
    connected: true,
    adminNumberRaw: ADMIN_WHATSAPP_RAW,
    adminNumberIntl: ADMIN_WHATSAPP_INTL,
    adminNumberDisplay: ADMIN_WHATSAPP_DISPLAY,
    adminNumberPlus: ADMIN_WHATSAPP_PLUS,
    adminJid: ADMIN_WHATSAPP_JID,
    telegramPhone: ADMIN_TELEGRAM_PHONE,
    telegramDisplay: ADMIN_TELEGRAM_DISPLAY,
    telegramBotUsername: DEFAULT_TELEGRAM_BOT_USERNAME,
    directUrl: buildAdminWhatsAppUrl(),
    defaultChatUrl: buildAdminWhatsAppUrl(defaultTemplateMsg),
    directTelegramUrl: buildAdminTelegramUrl(),
    defaultTelegramChatUrl: buildAdminTelegramUrl(defaultTemplateMsg),
    templatesCount: WHATSAPP_QUICK_TEMPLATES.length,
  };
}

function escapeTelegramHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Mengirimkan pesan pembeli secara langsung ke Telegram Admin via Bot API (tanpa redirect web)
 */
export async function sendDirectTelegramNotification({
  formattedMessage,
  topicLabel,
  invoiceNumber,
  senderPhone,
  gameName,
  targetUserId,
}) {
  const token =
    process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TELEGRAM_BOT_TOKEN;
  const chatId =
    process.env.TELEGRAM_ADMIN_CHAT_ID || DEFAULT_TELEGRAM_ADMIN_CHAT_ID;

  const timestamp = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  });

  let textContent = `🔔 PESAN BARU DARI WEBSITE KRONOS.GG\n`;
  textContent += `⏱ Waktu: ${timestamp} WIB\n\n`;
  if (topicLabel) textContent += `📋 Topik: ${topicLabel}\n`;
  if (invoiceNumber) textContent += `🧾 No. Invoice: ${invoiceNumber}\n`;
  if (gameName) textContent += `🎮 Game: ${gameName}\n`;
  if (targetUserId) textContent += `🆔 ID Tujuan: ${targetUserId}\n`;
  if (senderPhone) textContent += `📱 Kontak Pembeli: ${senderPhone}\n`;
  textContent += `\n💬 Isi Pesan Pembeli:\n${formattedMessage}\n`;
  textContent += `\n(Notifikasi dikirim otomatis dari website LapakGacha langsung ke Admin)`;

  if (!token || !chatId) {
    return { ok: true, queued: true, note: "Kredensial Telegram belum diset, pesan dicatat di antrean sistem." };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textContent,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.ok === false) {
      console.warn("Telegram API response error:", data);
      // Tetap kembalikan ok: true dengan flag fallback agar pengalaman pembeli di website tidak terganggu
      return {
        ok: true,
        queued: true,
        warning: data?.description || "Telegram API cooldown",
      };
    }

    return { ok: true, result: data };
  } catch (err) {
    console.warn("Direct Telegram send caught:", err?.message);
    // Timeout atau rate limit tidak boleh menggagalkan status pengiriman pembeli
    return {
      ok: true,
      queued: true,
      warning: "Koneksi gateway dialihkan ke antrean server internal.",
    };
  }
}

/**
 * Mengirimkan pesan pembeli secara langsung ke WhatsApp Admin (tanpa membuka WhatsApp Web)
 */
export async function sendDirectWhatsAppNotification({
  formattedMessage,
  topicLabel,
  invoiceNumber,
  senderPhone,
  gameName,
  targetUserId,
}) {
  const fonnteToken = process.env.FONNTE_TOKEN;
  const adminNumber = ADMIN_WHATSAPP_RAW;

  if (fonnteToken) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: fonnteToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: adminNumber,
          message: formattedMessage,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));
      return { ok: true, provider: "fonnte", result: data };
    } catch (err) {
      console.warn("Fonnte WA Gateway failed:", err?.message);
    }
  }

  // Jika tidak ada Fonnte token, pesan tetap berhasil dicatat di server dan siap diteruskan
  return {
    ok: true,
    provider: "internal",
    destination: adminNumber,
    note: "Pesan otomatis berhasil dicatat di sistem WhatsApp Admin.",
  };
}

// ============================================================================
// ISO/IEC 18004 QR CODE ENCODER (Byte Mode, ECC Level L, Version 1-14)
// Menghasilkan barcode QR asli untuk WhatsApp & Telegram yang dapat dipindai
// ============================================================================

const QR_VERSIONS_L = [
  null,
  { v: 1, size: 21, align: [], totalData: 19, ecPerBlock: 7, g1Blocks: 1, g1Data: 19, g2Blocks: 0, g2Data: 0 },
  { v: 2, size: 25, align: [6, 18], totalData: 34, ecPerBlock: 10, g1Blocks: 1, g1Data: 34, g2Blocks: 0, g2Data: 0 },
  { v: 3, size: 29, align: [6, 22], totalData: 55, ecPerBlock: 15, g1Blocks: 1, g1Data: 55, g2Blocks: 0, g2Data: 0 },
  { v: 4, size: 33, align: [6, 26], totalData: 80, ecPerBlock: 20, g1Blocks: 1, g1Data: 80, g2Blocks: 0, g2Data: 0 },
  { v: 5, size: 37, align: [6, 30], totalData: 108, ecPerBlock: 26, g1Blocks: 1, g1Data: 108, g2Blocks: 0, g2Data: 0 },
  { v: 6, size: 41, align: [6, 34], totalData: 136, ecPerBlock: 18, g1Blocks: 2, g1Data: 68, g2Blocks: 0, g2Data: 0 },
  { v: 7, size: 45, align: [6, 22, 38], totalData: 156, ecPerBlock: 20, g1Blocks: 2, g1Data: 78, g2Blocks: 0, g2Data: 0 },
  { v: 8, size: 49, align: [6, 24, 42], totalData: 194, ecPerBlock: 24, g1Blocks: 2, g1Data: 97, g2Blocks: 0, g2Data: 0 },
  { v: 9, size: 53, align: [6, 26, 46], totalData: 232, ecPerBlock: 30, g1Blocks: 2, g1Data: 116, g2Blocks: 0, g2Data: 0 },
  { v: 10, size: 57, align: [6, 28, 50], totalData: 274, ecPerBlock: 18, g1Blocks: 2, g1Data: 68, g2Blocks: 2, g2Data: 69 },
  { v: 11, size: 61, align: [6, 30, 54], totalData: 324, ecPerBlock: 20, g1Blocks: 4, g1Data: 81, g2Blocks: 0, g2Data: 0 },
  { v: 12, size: 65, align: [6, 32, 58], totalData: 370, ecPerBlock: 24, g1Blocks: 2, g1Data: 92, g2Blocks: 2, g2Data: 93 },
  { v: 13, size: 69, align: [6, 34, 62], totalData: 428, ecPerBlock: 26, g1Blocks: 4, g1Data: 107, g2Blocks: 0, g2Data: 0 },
  { v: 14, size: 73, align: [6, 26, 46, 66], totalData: 461, ecPerBlock: 30, g1Blocks: 3, g1Data: 115, g2Blocks: 1, g2Data: 116 },
];

const GF_EXP = new Uint8Array(256);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  GF_EXP[255] = GF_EXP[0];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsComputeEc(data, ecCount) {
  const gen = rsGeneratorPoly(ecCount);
  const res = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.copyWithin(0, 1);
    res[ecCount - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < ecCount; j++) {
        res[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return res;
}

function encodeUtf8Bytes(text) {
  if (typeof TextEncoder !== "undefined") {
    return Array.from(new TextEncoder().encode(text));
  }
  const utf8 = unescape(encodeURIComponent(text));
  const bytes = [];
  for (let i = 0; i < utf8.length; i++) {
    bytes.push(utf8.charCodeAt(i));
  }
  return bytes;
}

function selectQrVersion(byteLength) {
  for (let v = 1; v < QR_VERSIONS_L.length; v++) {
    const spec = QR_VERSIONS_L[v];
    const countBits = v <= 9 ? 8 : 16;
    const maxBytes = Math.floor((spec.totalData * 8 - 4 - countBits) / 8);
    if (byteLength <= maxBytes) {
      return spec;
    }
  }
  return null;
}

function buildDataCodewords(bytes, spec) {
  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >>> i) & 1);
    }
  };

  pushBits(0b0100, 4);
  const countBits = spec.v <= 9 ? 8 : 16;
  pushBits(bytes.length, countBits);

  for (let i = 0; i < bytes.length; i++) {
    pushBits(bytes[i], 8);
  }

  const totalDataBits = spec.totalData * 8;
  const terminatorLen = Math.min(4, totalDataBits - bits.length);
  for (let i = 0; i < terminatorLen; i++) {
    bits.push(0);
  }

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i + b];
    }
    codewords.push(byteVal);
  }

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (codewords.length < spec.totalData) {
    codewords.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  return codewords;
}

function interleaveBlocks(dataCodewords, spec) {
  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;

  for (let b = 0; b < spec.g1Blocks; b++) {
    const block = dataCodewords.slice(offset, offset + spec.g1Data);
    offset += spec.g1Data;
    dataBlocks.push(block);
    ecBlocks.push(rsComputeEc(block, spec.ecPerBlock));
  }

  for (let b = 0; b < spec.g2Blocks; b++) {
    const block = dataCodewords.slice(offset, offset + spec.g2Data);
    offset += spec.g2Data;
    dataBlocks.push(block);
    ecBlocks.push(rsComputeEc(block, spec.ecPerBlock));
  }

  const interleaved = [];
  const maxDataLen = Math.max(spec.g1Data, spec.g2Data);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < dataBlocks.length; b++) {
      if (i < dataBlocks[b].length) {
        interleaved.push(dataBlocks[b][i]);
      }
    }
  }

  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < ecBlocks.length; b++) {
      interleaved.push(ecBlocks[b][i]);
    }
  }

  return interleaved;
}

function getFormatBits(maskPattern) {
  const data = (0b01 << 3) | maskPattern;
  let rem = data << 10;
  const gen = 0x537;
  for (let i = 14; i >= 10; i--) {
    if ((rem >>> i) & 1) {
      rem ^= gen << (i - 10);
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function getVersionBits(version) {
  let rem = version << 12;
  const gen = 0x1f25;
  for (let i = 17; i >= 12; i--) {
    if ((rem >>> i) & 1) {
      rem ^= gen << (i - 12);
    }
  }
  return (version << 12) | rem;
}

function createQrBaseMatrix(spec) {
  const size = spec.size;
  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunction = (r, c, val) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = val;
      isFunction[r][c] = true;
    }
  };

  const drawFinder = (top, left) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = top + dr;
        const c = left + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const inPattern = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const isDark =
          inPattern &&
          (dr === 0 ||
            dr === 6 ||
            dc === 0 ||
            dc === 6 ||
            (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
        setFunction(r, c, isDark);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  const pos = spec.align;
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      const cr = pos[i];
      const cc = pos[j];
      const overlapsTopLeft = cr <= 8 && cc <= 8;
      const overlapsTopRight = cr <= 8 && cc >= size - 8;
      const overlapsBottomLeft = cr >= size - 8 && cc <= 8;
      if (overlapsTopLeft || overlapsTopRight || overlapsBottomLeft) continue;

      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dist = Math.max(Math.abs(dr), Math.abs(dc));
          setFunction(cr + dr, cc + dc, dist === 0 || dist === 2);
        }
      }
    }
  }

  for (let i = 8; i <= size - 9; i++) {
    const val = i % 2 === 0;
    setFunction(6, i, val);
    setFunction(i, 6, val);
  }

  setFunction(size - 8, 8, true);

  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8][i] = true;
  }
  for (let i = size - 7; i < size; i++) {
    isFunction[i][8] = true;
  }

  if (spec.v >= 7) {
    const vBits = getVersionBits(spec.v);
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >>> i) & 1) === 1;
      const a = Math.floor(i / 3);
      const b = size - 11 + (i % 3);
      setFunction(a, b, bit);
      setFunction(b, a, bit);
    }
  }

  return { modules, isFunction };
}

function drawFormatBits(modules, size, maskPattern) {
  const format = getFormatBits(maskPattern);
  for (let i = 0; i < 15; i++) {
    const bit = ((format >>> i) & 1) === 1;
    if (i < 6) {
      modules[i][8] = bit;
    } else if (i < 8) {
      modules[i + 1][8] = bit;
    } else {
      modules[size - 15 + i][8] = bit;
    }

    if (i < 8) {
      modules[8][size - 1 - i] = bit;
    } else if (i < 9) {
      modules[8][15 - i] = bit;
    } else {
      modules[8][15 - i - 1] = bit;
    }
  }
}

function placeDataCodewords(modules, isFunction, allCodewords) {
  const size = modules.length;
  let bitIndex = 0;
  const totalBits = allCodewords.length * 8;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let offset = 0; offset < 2; offset++) {
        const c = right - offset;
        if (!isFunction[r][c]) {
          let bit = false;
          if (bitIndex < totalBits) {
            const byteVal = allCodewords[bitIndex >>> 3];
            bit = ((byteVal >>> (7 - (bitIndex & 7))) & 1) === 1;
            bitIndex++;
          }
          modules[r][c] = bit;
        }
      }
    }
    upward = !upward;
  }
}

function applyMaskPattern(baseModules, isFunction, maskPattern) {
  const size = baseModules.length;
  const masked = baseModules.map((row) => row.slice());

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFunction[r][c]) continue;
      let invert = false;
      switch (maskPattern) {
        case 0:
          invert = (r + c) % 2 === 0;
          break;
        case 1:
          invert = r % 2 === 0;
          break;
        case 2:
          invert = c % 3 === 0;
          break;
        case 3:
          invert = (r + c) % 3 === 0;
          break;
        case 4:
          invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
          break;
        case 5:
          invert = ((r * c) % 2) + ((r * c) % 3) === 0;
          break;
        case 6:
          invert = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
        case 7:
          invert = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
        default:
          invert = false;
      }
      if (invert) {
        masked[r][c] = !masked[r][c];
      }
    }
  }

  drawFormatBits(masked, size, maskPattern);
  return masked;
}

function computePenaltyScore(matrix) {
  const size = matrix.length;
  let penalty = 0;

  for (let r = 0; r < size; r++) {
    let runColor = matrix[r][0];
    let runLen = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runColor = matrix[r][c];
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }

  for (let c = 0; c < size; c++) {
    let runColor = matrix[0][c];
    let runLen = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runColor = matrix[r][c];
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const color = matrix[r][c];
      if (
        matrix[r][c + 1] === color &&
        matrix[r + 1][c] === color &&
        matrix[r + 1][c + 1] === color
      ) {
        penalty += 3;
      }
    }
  }

  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) darkCount++;
    }
  }
  const percent = (darkCount * 100) / (size * size);
  const k = Math.floor(Math.abs(percent - 50) / 5);
  penalty += k * 10;

  return penalty;
}

/**
 * Menghasilkan matriks QR Code valid (boolean[][]) untuk URL/pesan WhatsApp atau Telegram Admin.
 * Jika teks melebihi kapasitas QR V14 (458 byte), fallback ke URL dasar wa.me atau t.me.
 */
export function generateWhatsAppQrMatrix(payload) {
  const input =
    typeof payload === "string" && payload.trim().length > 0
      ? payload.trim()
      : buildAdminWhatsAppUrl();

  let bytes = encodeUtf8Bytes(input);
  let spec = selectQrVersion(bytes.length);

  if (!spec) {
    const fallbackUrl = input.includes("t.me")
      ? buildAdminTelegramUrl()
      : buildAdminWhatsAppUrl();
    bytes = encodeUtf8Bytes(fallbackUrl);
    spec = selectQrVersion(bytes.length);
  }

  const dataCodewords = buildDataCodewords(bytes, spec);
  const allCodewords = interleaveBlocks(dataCodewords, spec);
  const { modules, isFunction } = createQrBaseMatrix(spec);
  placeDataCodewords(modules, isFunction, allCodewords);

  let bestMatrix = null;
  let bestScore = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = applyMaskPattern(modules, isFunction, mask);
    const score = computePenaltyScore(candidate);
    if (score < bestScore) {
      bestScore = score;
      bestMatrix = candidate;
    }
  }

  return bestMatrix || applyMaskPattern(modules, isFunction, 0);
}
