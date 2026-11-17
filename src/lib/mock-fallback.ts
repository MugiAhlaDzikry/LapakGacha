import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import {
  Denomination,
  FulfillmentStatus,
  Game,
  PaymentCategory,
  PaymentChannel,
  PaymentStatus,
  SupabaseIntegrationStatus,
  Transaction,
} from "./supabase/database.types";
import {
  FALLBACK_DENOMINATIONS,
  FALLBACK_GAMES,
  FALLBACK_PAYMENT_CHANNELS,
} from "./seed-catalog";
import {
  createDirectSupabaseClient,
  getSupabaseConfig,
} from "./supabase/client";

export {
  FALLBACK_GAMES,
  FALLBACK_DENOMINATIONS,
  FALLBACK_PAYMENT_CHANNELS,
};

export const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "44444444-4444-4444-8444-444444444101",
    invoice_number: "INV-20261113-KRN001",
    game_id: "11111111-1111-4111-8111-111111111101",
    denomination_id: "22222222-2222-4222-8222-222222222106",
    target_user_id: "124859201",
    target_zone_id: "2614",
    target_nickname: "KaelThas_ID",
    whatsapp_number: "081234567890",
    payment_code: "QRIS_INSTANT",
    payment_name: "QRIS Semua E-Wallet & Mobile Banking",
    amount: 64000,
    fee: 448,
    total_amount: 64448,
    payment_status: "PAID",
    fulfillment_status: "SUCCESS",
    payment_reference:
      "00020101021226610014ID.CO.KRONOS.WWW01189360091400000124855204581253033605405644485802ID5909KRONOS.GG6007JAKARTA6304A91F",
    serial_number: "KRN-SN-MLBB99481-772A",
    expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 180 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 178 * 1000).toISOString(),
    created_at: new Date(Date.now() - 240 * 1000).toISOString(),
  },
  {
    id: "44444444-4444-4444-8444-444444444102",
    invoice_number: "INV-20261113-KRN002",
    game_id: "11111111-1111-4111-8111-111111111102",
    denomination_id: "22222222-2222-4222-8222-222222222203",
    target_user_id: "Valkyrie99#AP",
    target_zone_id: null,
    target_nickname: "Valkyrie99",
    whatsapp_number: "081234567890",
    payment_code: "BCA_VA",
    payment_name: "BCA Virtual Account",
    amount: 208000,
    fee: 4000,
    total_amount: 212000,
    payment_status: "UNPAID",
    fulfillment_status: "PENDING",
    payment_reference: "8801208123456789",
    serial_number: null,
    expired_at: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
    paid_at: null,
    completed_at: null,
    created_at: new Date(Date.now() - 60 * 1000).toISOString(),
  },
  {
    id: "44444444-4444-4444-8444-444444444103",
    invoice_number: "INV-20261113-KRN003",
    game_id: "11111111-1111-4111-8111-111111111103",
    denomination_id: "22222222-2222-4222-8222-222222222304",
    target_user_id: "819204512",
    target_zone_id: "Asia",
    target_nickname: "RaidenShogun_ID",
    whatsapp_number: "085711223344",
    payment_code: "DANA",
    payment_name: "DANA Instant Checkout",
    amount: 57500,
    fee: 863,
    total_amount: 58363,
    payment_status: "PAID",
    fulfillment_status: "PROCESSING",
    payment_reference: "KRN-DANA-223344",
    serial_number: null,
    expired_at: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 120 * 1000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 320 * 1000).toISOString(),
  },
  {
    id: "44444444-4444-4444-8444-444444444104",
    invoice_number: "INV-20261113-KRN004",
    game_id: "11111111-1111-4111-8111-111111111106",
    denomination_id: "22222222-2222-4222-8222-222222222603",
    target_user_id: "081987654321",
    target_zone_id: null,
    target_nickname: "GARUDA_PRO",
    whatsapp_number: "081987654321",
    payment_code: "QRIS_INSTANT",
    payment_name: "QRIS Semua E-Wallet & Mobile Banking",
    amount: 61800,
    fee: 433,
    total_amount: 62233,
    payment_status: "PAID",
    fulfillment_status: "SUCCESS",
    payment_reference:
      "00020101021226610014ID.CO.KRONOS.WWW0118936009140819876543520458125303360540622335802ID5909KRONOS.GG6007JAKARTA6304K004",
    serial_number: "KRN-SN-STEAM-88412-X91B",
    expired_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 900 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 895 * 1000).toISOString(),
    created_at: new Date(Date.now() - 960 * 1000).toISOString(),
  },
  {
    id: "44444444-4444-4444-8444-444444444105",
    invoice_number: "INV-20261113-KRN005",
    game_id: "11111111-1111-4111-8111-111111111104",
    denomination_id: "22222222-2222-4222-8222-222222222405",
    target_user_id: "582910492",
    target_zone_id: null,
    target_nickname: "REX_TACTICAL",
    whatsapp_number: "082199887766",
    payment_code: "MANDIRI_VA",
    payment_name: "Mandiri Virtual Account (Livin)",
    amount: 45500,
    fee: 3000,
    total_amount: 48500,
    payment_status: "EXPIRED",
    fulfillment_status: "FAILED",
    payment_reference: "890220821998877",
    serial_number: null,
    expired_at: new Date(Date.now() - 600 * 1000).toISOString(),
    paid_at: null,
    completed_at: null,
    created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
  },
];

const SANDBOX_STORE_FILE = path.join(
  os.tmpdir(),
  "kronos-topup-sandbox-transactions.json"
);
const SANDBOX_GAMES_FILE = path.join(
  os.tmpdir(),
  "kronos-topup-sandbox-games.json"
);
const SANDBOX_DENOMS_FILE = path.join(
  os.tmpdir(),
  "kronos-topup-sandbox-denominations.json"
);
const SANDBOX_CHANNELS_FILE = path.join(
  os.tmpdir(),
  "kronos-topup-sandbox-channels.json"
);

export function readLocalGames(): Game[] {
  try {
    if (fs.existsSync(SANDBOX_GAMES_FILE)) {
      const raw = fs.readFileSync(SANDBOX_GAMES_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Game[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed games
  }
  return [...FALLBACK_GAMES];
}

export function writeLocalGames(games: Game[]): void {
  try {
    fs.writeFileSync(SANDBOX_GAMES_FILE, JSON.stringify(games, null, 2), "utf-8");
  } catch {
    // Ignore file write errors
  }
}

export function readLocalDenominations(): Denomination[] {
  try {
    if (fs.existsSync(SANDBOX_DENOMS_FILE)) {
      const raw = fs.readFileSync(SANDBOX_DENOMS_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Denomination[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed denominations
  }
  return [...FALLBACK_DENOMINATIONS];
}

export function writeLocalDenominations(denoms: Denomination[]): void {
  try {
    fs.writeFileSync(SANDBOX_DENOMS_FILE, JSON.stringify(denoms, null, 2), "utf-8");
  } catch {
    // Ignore file write errors
  }
}

export function readLocalPaymentChannels(): PaymentChannel[] {
  try {
    if (fs.existsSync(SANDBOX_CHANNELS_FILE)) {
      const raw = fs.readFileSync(SANDBOX_CHANNELS_FILE, "utf-8");
      const parsed = JSON.parse(raw) as PaymentChannel[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed channels
  }
  return [...FALLBACK_PAYMENT_CHANNELS];
}

export function writeLocalPaymentChannels(channels: PaymentChannel[]): void {
  try {
    fs.writeFileSync(
      SANDBOX_CHANNELS_FILE,
      JSON.stringify(channels, null, 2),
      "utf-8"
    );
  } catch {
    // Ignore file write errors
  }
}

export function readLocalTransactions(): Transaction[] {
  try {
    if (fs.existsSync(SANDBOX_STORE_FILE)) {
      const raw = fs.readFileSync(SANDBOX_STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Transaction[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial transactions
  }
  return [...INITIAL_SAMPLE_TRANSACTIONS];
}

export function writeLocalTransactions(txs: Transaction[]): void {
  try {
    fs.writeFileSync(SANDBOX_STORE_FILE, JSON.stringify(txs, null, 2), "utf-8");
  } catch {
    // Ignore file write errors
  }
}

export function enrichTransaction(
  tx: Transaction,
  gamesList?: Game[],
  denomsList?: Denomination[]
): Transaction {
  const games = gamesList || readLocalGames();
  const denominations = denomsList || readLocalDenominations();

  const game = games.find(
    (g) => g.id === tx.game_id || g.slug === tx.game_id
  );
  const denomination = denominations.find(
    (d) => d.id === tx.denomination_id || d.sku_code === tx.denomination_id
  );

  return {
    ...tx,
    game:
      tx.game ??
      (game
        ? {
            title: game.title,
            slug: game.slug,
            publisher: game.publisher,
            thumbnail_url: game.thumbnail_url,
            currency_name: game.currency_name,
          }
        : undefined),
    denomination:
      tx.denomination ??
      (denomination
        ? {
            name: denomination.name,
            sku_code: denomination.sku_code,
            category_group: denomination.category_group,
          }
        : undefined),
  };
}

function stripEnrichedTransactionFields(tx: Transaction) {
  return {
    id: tx.id,
    invoice_number: tx.invoice_number,
    game_id: tx.game_id,
    denomination_id: tx.denomination_id,
    target_user_id: tx.target_user_id,
    target_zone_id: tx.target_zone_id,
    target_nickname: tx.target_nickname,
    whatsapp_number: tx.whatsapp_number,
    payment_code: tx.payment_code,
    payment_name: tx.payment_name,
    amount: tx.amount,
    fee: tx.fee,
    total_amount: tx.total_amount,
    payment_status: tx.payment_status,
    fulfillment_status: tx.fulfillment_status,
    payment_reference: tx.payment_reference,
    serial_number: tx.serial_number,
    expired_at: tx.expired_at,
    paid_at: tx.paid_at,
    completed_at: tx.completed_at,
    created_at: tx.created_at,
  };
}

/**
 * Push / Upsert seluruh data katalog & sample transaksi ke Supabase PostgreSQL
 */
export async function syncDataToSupabase(options?: {
  useFactoryDefaults?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  const supabase = createDirectSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: "Kredensial Supabase belum dikonfigurasi.",
    };
  }

  const gamesToPush = options?.useFactoryDefaults
    ? [...FALLBACK_GAMES]
    : readLocalGames();
  const denomsToPush = options?.useFactoryDefaults
    ? [...FALLBACK_DENOMINATIONS]
    : readLocalDenominations();
  const channelsToPush = options?.useFactoryDefaults
    ? [...FALLBACK_PAYMENT_CHANNELS]
    : readLocalPaymentChannels();
  const txsToPush = options?.useFactoryDefaults
    ? [...INITIAL_SAMPLE_TRANSACTIONS]
    : readLocalTransactions();

  // 1. Upsert Games
  const { error: gamesErr } = await supabase
    .from("games")
    .upsert(gamesToPush, { onConflict: "slug" });

  if (gamesErr) {
    return {
      success: false,
      message:
        gamesErr.code === "PGRST205" || gamesErr.code === "42P01"
          ? "Tabel database belum dibuat di Supabase. Silakan jalankan SQL Schema Migration terlebih dahulu di Supabase SQL Editor."
          : `Gagal menyimpan tabel games: ${gamesErr.message}`,
      error: gamesErr.message,
    };
  }

  // 2. Upsert Denominations
  const { error: denomsErr } = await supabase
    .from("denominations")
    .upsert(denomsToPush, { onConflict: "sku_code" });

  if (denomsErr) {
    return {
      success: false,
      message: `Gagal menyimpan tabel denominations: ${denomsErr.message}`,
      error: denomsErr.message,
    };
  }

  // 3. Upsert Payment Channels
  const { error: channelsErr } = await supabase
    .from("payment_channels")
    .upsert(channelsToPush, { onConflict: "code" });

  if (channelsErr) {
    return {
      success: false,
      message: `Gagal menyimpan tabel payment_channels: ${channelsErr.message}`,
      error: channelsErr.message,
    };
  }

  // 4. Upsert Transactions
  const cleanTxs = txsToPush.map(stripEnrichedTransactionFields);
  const { error: txErr } = await supabase
    .from("transactions")
    .upsert(cleanTxs, { onConflict: "invoice_number" });

  if (txErr) {
    return {
      success: false,
      message: `Gagal menyimpan tabel transactions: ${txErr.message}`,
      error: txErr.message,
    };
  }

  return {
    success: true,
    message: `Berhasil menyinkronkan ${gamesToPush.length} Game, ${denomsToPush.length} Produk SKU, ${channelsToPush.length} Channel Pembayaran, dan ${cleanTxs.length} Transaksi ke Supabase Cloud!`,
  };
}

export async function getGames(): Promise<Game[]> {
  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("is_popular", { ascending: false });

      if (!error && data) {
        if (data.length === 0) {
          // Tabel sudah ada tapi masih kosong -> otomatis seed ke Supabase
          await syncDataToSupabase({ useFactoryDefaults: true });
          const { data: seeded } = await supabase
            .from("games")
            .select("*")
            .eq("is_active", true)
            .order("is_popular", { ascending: false });
          if (seeded && seeded.length > 0) {
            return seeded as Game[];
          }
        } else {
          return data as Game[];
        }
      }
    }
  } catch {
    // Use fallback store
  }
  return readLocalGames()
    .filter((g) => g.is_active)
    .sort((a, b) => Number(b.is_popular) - Number(a.is_popular));
}

export async function getGameBySlug(slug: string): Promise<{
  game: Game | null;
  denominations: Denomination[];
  paymentChannels: PaymentChannel[];
}> {
  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data: gameData, error: gameErr } = await supabase
        .from("games")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (!gameErr && gameData) {
        const [{ data: denoms }, { data: channels }] = await Promise.all([
          supabase
            .from("denominations")
            .select("*")
            .eq("game_id", gameData.id)
            .eq("is_available", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("payment_channels")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        ]);

        return {
          game: gameData as Game,
          denominations: (denoms as Denomination[]) || [],
          paymentChannels:
            (channels as PaymentChannel[]) || readLocalPaymentChannels(),
        };
      }
    }
  } catch {
    // Use fallback store
  }

  const allGames = readLocalGames();
  const game = allGames.find((g) => g.slug === slug && g.is_active) || null;
  if (!game) {
    return { game: null, denominations: [], paymentChannels: [] };
  }

  const denominations = readLocalDenominations()
    .filter((d) => d.game_id === game.id && d.is_available)
    .sort((a, b) => a.sort_order - b.sort_order);

  const paymentChannels = readLocalPaymentChannels()
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return { game, denominations, paymentChannels };
}

export async function findCheckoutEntities(
  gameIdOrSlug: string,
  denomIdOrSku: string,
  paymentCodeOrId: string
): Promise<{
  game: Game | null;
  denomination: Denomination | null;
  channel: PaymentChannel | null;
}> {
  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const [{ data: games }, { data: denoms }, { data: channels }] =
        await Promise.all([
          supabase.from("games").select("*"),
          supabase.from("denominations").select("*"),
          supabase.from("payment_channels").select("*"),
        ]);

      if (games && games.length > 0 && denoms && channels) {
        const game =
          (games as Game[]).find(
            (g) => g.id === gameIdOrSlug || g.slug === gameIdOrSlug
          ) || null;
        const denomination =
          (denoms as Denomination[]).find(
            (d) => d.id === denomIdOrSku || d.sku_code === denomIdOrSku
          ) || null;
        const channel =
          (channels as PaymentChannel[]).find(
            (c) => c.code === paymentCodeOrId || c.id === paymentCodeOrId
          ) || null;

        if (game && denomination && channel) {
          return { game, denomination, channel };
        }
      }
    }
  } catch {
    // Fallback to local
  }

  const game =
    readLocalGames().find(
      (g) => g.id === gameIdOrSlug || g.slug === gameIdOrSlug
    ) || null;
  const denomination =
    readLocalDenominations().find(
      (d) => d.id === denomIdOrSku || d.sku_code === denomIdOrSku
    ) || null;
  const channel =
    readLocalPaymentChannels().find(
      (c) => c.code === paymentCodeOrId || c.id === paymentCodeOrId
    ) || null;

  return { game, denomination, channel };
}

export async function saveTransaction(tx: Transaction): Promise<Transaction> {
  const current = readLocalTransactions();
  const updated = [
    tx,
    ...current.filter((item) => item.invoice_number !== tx.invoice_number),
  ];
  writeLocalTransactions(updated);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("transactions")
        .upsert(stripEnrichedTransactionFields(tx), {
          onConflict: "invoice_number",
        })
        .select("*")
        .single();

      if (!error && data) {
        return enrichTransaction(data as Transaction);
      }
    }
  } catch {
    // Continue with local fallback transaction
  }

  return enrichTransaction(tx);
}

export async function getTransactionByInvoice(
  invoiceNumber: string
): Promise<Transaction | null> {
  const normalized = invoiceNumber.trim().toUpperCase();

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "*, game:games(title, slug, publisher, thumbnail_url, currency_name), denomination:denominations(name, sku_code, category_group)"
        )
        .eq("invoice_number", normalized)
        .single();

      if (!error && data) {
        return enrichTransaction(data as unknown as Transaction);
      }
    }
  } catch {
    // Fallback to local sandbox store
  }

  const local = readLocalTransactions().find(
    (item) => item.invoice_number.toUpperCase() === normalized
  );
  return local ? enrichTransaction(local) : null;
}

export async function updateTransactionStatus(
  invoiceNumber: string,
  updates: {
    payment_status?: PaymentStatus;
    fulfillment_status?: FulfillmentStatus;
    serial_number?: string | null;
    paid_at?: string | null;
    completed_at?: string | null;
  }
): Promise<Transaction | null> {
  const normalized = invoiceNumber.trim().toUpperCase();

  const current = readLocalTransactions();
  let updatedTx: Transaction | null = null;
  const nextList = current.map((item) => {
    if (item.invoice_number.toUpperCase() === normalized) {
      updatedTx = {
        ...item,
        ...updates,
      };
      return updatedTx;
    }
    return item;
  });

  if (updatedTx) {
    writeLocalTransactions(nextList);
  }

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("invoice_number", normalized)
        .select("*")
        .single();

      if (!error && data) {
        return enrichTransaction(data as Transaction);
      }
    }
  } catch {
    // Ignore Supabase error and return local updated transaction
  }

  return updatedTx ? enrichTransaction(updatedTx) : null;
}

export async function searchTransactions(query: string): Promise<Transaction[]> {
  const clean = query.trim();
  if (!clean) return [];

  const resultsMap = new Map<string, Transaction>();

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const isInvoice = clean.toUpperCase().startsWith("INV-");
      const builder = supabase
        .from("transactions")
        .select(
          "*, game:games(title, slug, publisher, thumbnail_url, currency_name), denomination:denominations(name, sku_code, category_group)"
        )
        .order("created_at", { ascending: false })
        .limit(20);

      const { data } = isInvoice
        ? await builder.ilike("invoice_number", `%${clean}%`)
        : await builder.ilike("whatsapp_number", `%${clean}%`);

      if (data) {
        for (const row of data as unknown as Transaction[]) {
          resultsMap.set(row.invoice_number, enrichTransaction(row));
        }
      }
    }
  } catch {
    // Continue to local store
  }

  const normalizedUpper = clean.toUpperCase();
  const digitsOnly = clean.replace(/\D/g, "");

  for (const item of readLocalTransactions()) {
    const matchInvoice = item.invoice_number
      .toUpperCase()
      .includes(normalizedUpper);
    const itemDigits = item.whatsapp_number.replace(/\D/g, "");
    const matchPhone =
      digitsOnly.length >= 4 && itemDigits.includes(digitsOnly);

    if (matchInvoice || matchPhone) {
      if (!resultsMap.has(item.invoice_number)) {
        resultsMap.set(item.invoice_number, enrichTransaction(item));
      }
    }
  }

  return Array.from(resultsMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// ==========================================
// ADMIN PANEL CRUD & SUPABASE CLOUD SYNC
// ==========================================

export async function getAllAdminData(): Promise<{
  games: Game[];
  denominations: Denomination[];
  paymentChannels: PaymentChannel[];
  transactions: Transaction[];
  supabaseStatus: SupabaseIntegrationStatus;
}> {
  const { url } = getSupabaseConfig();
  const projectRef =
    url.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || "eyizuvrucdjpxfyygynw";

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const [gamesRes, denomsRes, channelsRes, txRes] = await Promise.all([
        supabase
          .from("games")
          .select("*")
          .order("is_popular", { ascending: false }),
        supabase
          .from("denominations")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("payment_channels")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      const firstError =
        gamesRes.error || denomsRes.error || channelsRes.error || txRes.error;

      if (!firstError) {
        let games = (gamesRes.data as Game[]) || [];
        let denominations = (denomsRes.data as Denomination[]) || [];
        let paymentChannels = (channelsRes.data as PaymentChannel[]) || [];
        let rawTransactions = (txRes.data as Transaction[]) || [];

        // Jika tabel di Supabase baru saja dibuat dan masih kosong (0 baris), langsung auto-seed!
        if (
          games.length === 0 &&
          denominations.length === 0 &&
          paymentChannels.length === 0
        ) {
          await syncDataToSupabase({ useFactoryDefaults: false });
          const [g2, d2, c2, t2] = await Promise.all([
            supabase
              .from("games")
              .select("*")
              .order("is_popular", { ascending: false }),
            supabase
              .from("denominations")
              .select("*")
              .order("sort_order", { ascending: true }),
            supabase
              .from("payment_channels")
              .select("*")
              .order("sort_order", { ascending: true }),
            supabase
              .from("transactions")
              .select("*")
              .order("created_at", { ascending: false }),
          ]);
          games = (g2.data as Game[]) || games;
          denominations = (d2.data as Denomination[]) || denominations;
          paymentChannels = (c2.data as PaymentChannel[]) || paymentChannels;
          rawTransactions = (t2.data as Transaction[]) || rawTransactions;
        }

        // Update local cache with cloud data
        if (games.length > 0) writeLocalGames(games);
        if (denominations.length > 0) writeLocalDenominations(denominations);
        if (paymentChannels.length > 0)
          writeLocalPaymentChannels(paymentChannels);

        const enrichedTxs = rawTransactions.map((tx) =>
          enrichTransaction(tx, games, denominations)
        );
        if (enrichedTxs.length > 0) writeLocalTransactions(enrichedTxs);

        return {
          games,
          denominations,
          paymentChannels,
          transactions: enrichedTxs,
          supabaseStatus: {
            connected: true,
            schemaReady: true,
            projectUrl: url,
            projectRef,
            mode: "SUPABASE_CLOUD",
            message: `Terhubung penuh ke Supabase Cloud (${projectRef}). Seluruh data dibaca & ditulis langsung ke PostgreSQL.`,
            counts: {
              games: games.length,
              denominations: denominations.length,
              paymentChannels: paymentChannels.length,
              transactions: enrichedTxs.length,
            },
          },
        };
      }

      // Koneksi ke proyek Supabase berhasil, namun tabel belum dibuat (PGRST205 / 42P01)
      const localGames = readLocalGames();
      const localDenoms = readLocalDenominations().sort(
        (a, b) => a.sort_order - b.sort_order
      );
      const localChannels = readLocalPaymentChannels().sort(
        (a, b) => a.sort_order - b.sort_order
      );
      const localTxs = readLocalTransactions()
        .map((tx) => enrichTransaction(tx, localGames, localDenoms))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      return {
        games: localGames,
        denominations: localDenoms,
        paymentChannels: localChannels,
        transactions: localTxs,
        supabaseStatus: {
          connected: true,
          schemaReady: false,
          projectUrl: url,
          projectRef,
          mode: "SCHEMA_REQUIRED",
          message: `Terhubung ke Supabase (${projectRef}), namun tabel belum diinisialisasi (${firstError.code}: ${firstError.message}). Jalankan SQL Setup untuk mengaktifkan penyimpanan Cloud.`,
          counts: {
            games: localGames.length,
            denominations: localDenoms.length,
            paymentChannels: localChannels.length,
            transactions: localTxs.length,
          },
        },
      };
    }
  } catch {
    // Fallback
  }

  const games = readLocalGames();
  const denominations = readLocalDenominations().sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const paymentChannels = readLocalPaymentChannels().sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const transactions = readLocalTransactions()
    .map((tx) => enrichTransaction(tx, games, denominations))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return {
    games,
    denominations,
    paymentChannels,
    transactions,
    supabaseStatus: {
      connected: false,
      schemaReady: false,
      projectUrl: url,
      projectRef,
      mode: "LOCAL_FALLBACK",
      message: "Berjalan menggunakan penyimpanan Sandbox Lokal.",
      counts: {
        games: games.length,
        denominations: denominations.length,
        paymentChannels: paymentChannels.length,
        transactions: transactions.length,
      },
    },
  };
}

export async function upsertGame(
  payload: Partial<Game> & { title: string; slug: string }
): Promise<Game> {
  const current = readLocalGames();
  const cleanSlug = payload.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");

  const existingIndex = current.findIndex(
    (g) => (payload.id && g.id === payload.id) || g.slug === cleanSlug
  );

  let savedGame: Game;
  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    savedGame = {
      ...existing,
      ...payload,
      slug: cleanSlug,
    };
    current[existingIndex] = savedGame;
  } else {
    savedGame = {
      id: payload.id || crypto.randomUUID(),
      slug: cleanSlug,
      title: payload.title.trim(),
      publisher: payload.publisher?.trim() || "Official Publisher",
      category: payload.category || "mobile",
      thumbnail_url: payload.thumbnail_url || "/posters/mobile-legends.svg",
      banner_url: payload.banner_url || "/banners/hero-mlbb.svg",
      currency_name: payload.currency_name?.trim() || "Diamonds",
      requires_zone_id: Boolean(payload.requires_zone_id),
      id_label: payload.id_label?.trim() || "User ID",
      zone_label: payload.zone_label?.trim() || "Zone ID",
      id_placeholder: payload.id_placeholder?.trim() || "Masukkan User ID",
      zone_placeholder: payload.zone_placeholder?.trim() || "Zone ID",
      helper_text:
        payload.helper_text ??
        "Pastikan User ID yang dimasukkan sudah benar sebelum melanjutkan transaksi.",
      is_popular: Boolean(payload.is_popular),
      is_active:
        payload.is_active !== undefined ? Boolean(payload.is_active) : true,
      created_at: new Date().toISOString(),
    };
    current.push(savedGame);
  }

  writeLocalGames(current);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("games")
        .upsert(savedGame, { onConflict: "slug" })
        .select("*")
        .single();
      if (!error && data) {
        return data as Game;
      }
    }
  } catch {
    // Fallback to local
  }

  return savedGame;
}

export async function deleteGame(gameId: string): Promise<boolean> {
  const currentGames = readLocalGames();
  const nextGames = currentGames.filter((g) => g.id !== gameId);
  writeLocalGames(nextGames);

  const currentDenoms = readLocalDenominations();
  const nextDenoms = currentDenoms.filter((d) => d.game_id !== gameId);
  writeLocalDenominations(nextDenoms);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      await supabase.from("denominations").delete().eq("game_id", gameId);
      await supabase.from("games").delete().eq("id", gameId);
    }
  } catch {
    // Ignore
  }

  return true;
}

export async function upsertDenomination(
  payload: Partial<Denomination> & {
    game_id: string;
    sku_code: string;
    name: string;
    price: number;
  }
): Promise<Denomination> {
  const current = readLocalDenominations();
  const cleanSku = payload.sku_code.trim().toUpperCase();

  const existingIndex = current.findIndex(
    (d) => (payload.id && d.id === payload.id) || d.sku_code === cleanSku
  );

  let savedDenom: Denomination;
  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    savedDenom = {
      ...existing,
      ...payload,
      sku_code: cleanSku,
      price: Math.max(0, Math.round(Number(payload.price))),
      original_price: payload.original_price
        ? Math.max(0, Math.round(Number(payload.original_price)))
        : null,
    };
    current[existingIndex] = savedDenom;
  } else {
    savedDenom = {
      id: payload.id || crypto.randomUUID(),
      game_id: payload.game_id,
      sku_code: cleanSku,
      name: payload.name.trim(),
      category_group: payload.category_group?.trim() || "Top Up Instant",
      price: Math.max(0, Math.round(Number(payload.price))),
      original_price: payload.original_price
        ? Math.max(0, Math.round(Number(payload.original_price)))
        : null,
      badge_text: payload.badge_text?.trim() || null,
      sort_order: Number(payload.sort_order ?? current.length + 1),
      is_available:
        payload.is_available !== undefined
          ? Boolean(payload.is_available)
          : true,
    };
    current.push(savedDenom);
  }

  writeLocalDenominations(current);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("denominations")
        .upsert(savedDenom, { onConflict: "sku_code" })
        .select("*")
        .single();
      if (!error && data) {
        return data as Denomination;
      }
    }
  } catch {
    // Fallback to local
  }

  return savedDenom;
}

export async function deleteDenomination(denomId: string): Promise<boolean> {
  const current = readLocalDenominations();
  const next = current.filter((d) => d.id !== denomId);
  writeLocalDenominations(next);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      await supabase.from("denominations").delete().eq("id", denomId);
    }
  } catch {
    // Ignore
  }

  return true;
}

export async function upsertPaymentChannel(
  payload: Partial<PaymentChannel> & {
    code: string;
    name: string;
    category: PaymentCategory;
  }
): Promise<PaymentChannel> {
  const current = readLocalPaymentChannels();
  const cleanCode = payload.code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, "_");

  const existingIndex = current.findIndex(
    (c) => (payload.id && c.id === payload.id) || c.code === cleanCode
  );

  let savedChannel: PaymentChannel;
  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    savedChannel = {
      ...existing,
      ...payload,
      code: cleanCode,
      fee_flat: Math.max(
        0,
        Math.round(Number(payload.fee_flat ?? existing.fee_flat))
      ),
      fee_percent: Math.max(
        0,
        Number(payload.fee_percent ?? existing.fee_percent)
      ),
    };
    current[existingIndex] = savedChannel;
  } else {
    savedChannel = {
      id: payload.id || crypto.randomUUID(),
      code: cleanCode,
      name: payload.name.trim(),
      category: payload.category,
      fee_flat: Math.max(0, Math.round(Number(payload.fee_flat ?? 0))),
      fee_percent: Math.max(0, Number(payload.fee_percent ?? 0)),
      instruction_text:
        payload.instruction_text?.trim() ||
        "Selesaikan pembayaran sebelum batas waktu kedaluwarsa berakhir.",
      is_featured: Boolean(payload.is_featured),
      is_active:
        payload.is_active !== undefined ? Boolean(payload.is_active) : true,
      sort_order: Number(payload.sort_order ?? current.length + 1),
    };
    current.push(savedChannel);
  }

  writeLocalPaymentChannels(current);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("payment_channels")
        .upsert(savedChannel, { onConflict: "code" })
        .select("*")
        .single();
      if (!error && data) {
        return data as PaymentChannel;
      }
    }
  } catch {
    // Fallback
  }

  return savedChannel;
}

export async function deletePaymentChannel(channelId: string): Promise<boolean> {
  const current = readLocalPaymentChannels();
  const next = current.filter((c) => c.id !== channelId);
  writeLocalPaymentChannels(next);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      await supabase.from("payment_channels").delete().eq("id", channelId);
    }
  } catch {
    // Ignore
  }

  return true;
}

export async function deleteTransactionByInvoice(
  invoiceNumber: string
): Promise<boolean> {
  const normalized = invoiceNumber.trim().toUpperCase();
  const current = readLocalTransactions();
  const next = current.filter(
    (tx) => tx.invoice_number.toUpperCase() !== normalized
  );
  writeLocalTransactions(next);

  try {
    const supabase = createDirectSupabaseClient();
    if (supabase) {
      await supabase
        .from("transactions")
        .delete()
        .eq("invoice_number", normalized);
    }
  } catch {
    // Ignore
  }

  return true;
}

export async function resetSandboxData(): Promise<void> {
  writeLocalGames([...FALLBACK_GAMES]);
  writeLocalDenominations([...FALLBACK_DENOMINATIONS]);
  writeLocalPaymentChannels([...FALLBACK_PAYMENT_CHANNELS]);
  writeLocalTransactions([...INITIAL_SAMPLE_TRANSACTIONS]);

  try {
    await syncDataToSupabase({ useFactoryDefaults: true });
  } catch {
    // Ignore if schema not ready
  }
}
