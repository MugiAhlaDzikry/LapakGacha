"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CloudUpload,
  Copy,
  CreditCard,
  Database,
  Gamepad2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  Denomination,
  FulfillmentStatus,
  Game,
  PaymentCategory,
  PaymentChannel,
  PaymentStatus,
  SupabaseIntegrationStatus,
  Transaction,
} from "@/lib/supabase/database.types";
import { AdminOverviewTab } from "./AdminOverviewTab";
import { AdminTransactionsTab } from "./AdminTransactionsTab";
import { AdminGamesTab } from "./AdminGamesTab";
import { AdminDenominationsTab } from "./AdminDenominationsTab";
import { AdminPaymentChannelsTab } from "./AdminPaymentChannelsTab";

export type AdminTabKey =
  | "overview"
  | "transactions"
  | "games"
  | "denominations"
  | "channels";

interface AdminDashboardClientProps {
  initialData: {
    games: Game[];
    denominations: Denomination[];
    paymentChannels: PaymentChannel[];
    transactions: Transaction[];
    supabaseStatus: SupabaseIntegrationStatus;
  };
}

const ADMIN_SESSION_STORAGE_KEY = "kronos_admin_authenticated_v1";

const SUPABASE_SCHEMA_SQL = `-- Enable UUID extension
create extension if not exists "pgcrypto";

-- 1. Tabel Katalog Game
create table if not exists public.games (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  publisher text not null,
  category text not null check (category in ('mobile', 'pc', 'voucher')),
  thumbnail_url text not null,
  banner_url text not null,
  currency_name text not null,
  requires_zone_id boolean default false,
  id_label text default 'User ID',
  zone_label text default 'Zone ID',
  id_placeholder text default 'Masukkan User ID',
  zone_placeholder text default 'Zone ID',
  helper_text text,
  is_popular boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Tabel Nominal Top-Up (Denominations)
create table if not exists public.denominations (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  sku_code text unique not null,
  name text not null,
  category_group text default 'Top Up Instant',
  price integer not null,
  original_price integer,
  badge_text text,
  sort_order integer default 0,
  is_available boolean default true
);

-- 3. Tabel Metode Pembayaran (Payment Channels)
create table if not exists public.payment_channels (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  name text not null,
  category text not null check (category in ('QRIS', 'E-Wallet', 'Virtual Account', 'Convenience Store')),
  fee_flat integer default 0,
  fee_percent numeric(5,2) default 0.00,
  instruction_text text,
  is_featured boolean default false,
  is_active boolean default true,
  sort_order integer default 0
);

-- 4. Tabel Transaksi
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  invoice_number text unique not null,
  game_id uuid references public.games(id) on delete cascade not null,
  denomination_id uuid references public.denominations(id) on delete cascade not null,
  target_user_id text not null,
  target_zone_id text,
  target_nickname text not null,
  whatsapp_number text not null,
  payment_code text not null,
  payment_name text not null,
  amount integer not null,
  fee integer not null,
  total_amount integer not null,
  payment_status text default 'UNPAID' check (payment_status in ('UNPAID', 'PAID', 'EXPIRED', 'FAILED')),
  fulfillment_status text default 'PENDING' check (fulfillment_status in ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
  payment_reference text,
  serial_number text,
  expired_at timestamptz not null,
  paid_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Aktifkan Row Level Security (RLS)
alter table public.games enable row level security;
alter table public.denominations enable row level security;
alter table public.payment_channels enable row level security;
alter table public.transactions enable row level security;

-- Kebijakan RLS Lengkap untuk Storefront & Panel Admin (Full CRUD)
drop policy if exists "Allow full access to games" on public.games;
create policy "Allow full access to games" on public.games for all using (true) with check (true);

drop policy if exists "Allow full access to denominations" on public.denominations;
create policy "Allow full access to denominations" on public.denominations for all using (true) with check (true);

drop policy if exists "Allow full access to payment_channels" on public.payment_channels;
create policy "Allow full access to payment_channels" on public.payment_channels for all using (true) with check (true);

drop policy if exists "Allow full access to transactions" on public.transactions;
create policy "Allow full access to transactions" on public.transactions for all using (true) with check (true);

-- Aktifkan Supabase Realtime pada tabel transactions
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transactions'
  ) then
    alter publication supabase_realtime add table public.transactions;
  end if;
end $$;`;

export function AdminDashboardClient({
  initialData,
}: AdminDashboardClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState("admin@kronos.gg");
  const [passwordInput, setPasswordInput] = useState("kronos2026");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTabKey>("overview");
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");

  const [games, setGames] = useState<Game[]>(initialData.games);
  const [denominations, setDenominations] = useState<Denomination[]>(
    initialData.denominations
  );
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>(
    initialData.paymentChannels
  );
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialData.transactions
  );
  const [supabaseStatus, setSupabaseStatus] =
    useState<SupabaseIntegrationStatus>(initialData.supabaseStatus);

  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [isMutating, setIsMutating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (saved === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // Ignore storage error
    } finally {
      setAuthChecked(true);
    }
  }, []);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (
      emailInput.trim().toLowerCase() === "admin@kronos.gg" &&
      passwordInput === "kronos2026"
    ) {
      try {
        window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "true");
      } catch {
        // Ignore
      }
      setIsAuthenticated(true);
      showToast("Otorisasi Command Center berhasil diaktifkan.");
    } else {
      setAuthError(
        "Kredensial tidak valid. Gunakan admin@kronos.gg / kronos2026."
      );
    }
  }

  function handleQuickSandboxLogin() {
    try {
      window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
    setIsAuthenticated(true);
    showToast("Mode Admin Command Center diaktifkan.");
  }

  function handleLogout() {
    try {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
  }

  function syncAdminState(data: {
    games: Game[];
    denominations: Denomination[];
    paymentChannels: PaymentChannel[];
    transactions: Transaction[];
    supabaseStatus?: SupabaseIntegrationStatus;
  }) {
    setGames(data.games);
    setDenominations(data.denominations);
    setPaymentChannels(data.paymentChannels);
    setTransactions(data.transactions);
    if (data.supabaseStatus) {
      setSupabaseStatus(data.supabaseStatus);
    }
  }

  async function refreshAdminData() {
    setIsMutating(true);
    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal menyegarkan data");
      const data = await res.json();
      syncAdminState(data);
      showToast("Data Command Center & status Supabase berhasil disinkronkan.");
    } catch {
      showToast("Gagal menyegarkan data dari server.", "error");
    } finally {
      setIsMutating(false);
    }
  }

  async function executeAdminAction(
    action: string,
    payload?: Record<string, unknown>
  ) {
    setIsMutating(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (json.data) {
        syncAdminState(json.data);
      }
      if (!res.ok) {
        throw new Error(json.error || "Operasi admin gagal.");
      }
      if (json.message) {
        showToast(json.message, "success");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
        "error"
      );
    } finally {
      setIsMutating(false);
    }
  }

  function handleNavigateTab(tab: AdminTabKey, gameIdFilter?: string) {
    if (gameIdFilter) {
      setSelectedGameFilter(gameIdFilter);
    }
    setActiveTab(tab);
  }

  async function handleCopySql() {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
      showToast("Script SQL Schema berhasil disalin ke clipboard!");
    } catch {
      showToast("Gagal menyalin SQL secara otomatis.", "error");
    }
  }

  if (!authChecked) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-48 animate-pulse rounded-xl border border-white/[0.08] bg-[#121215]" />
      </div>
    );
  }

  // ==========================================
  // TACTICAL LOGIN GATE
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-xl border border-white/[0.1] bg-[#121215] p-6 text-left shadow-2xl sm:p-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-bold text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                  RESTRICTED CONSOLE
                </span>
                <h1 className="font-heading text-base font-extrabold tracking-tight text-zinc-50">
                  KRONOS.GG ADMIN PANEL
                </h1>
              </div>
            </div>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
              SUPABASE LINKED
            </span>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase text-zinc-300">
                ID Operator / Email Admin
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-zinc-300">
                Kode Otorisasi (Passkey)
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 font-mono text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {authError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
            >
              <KeyRound className="h-4 w-4" />
              <span>Masuk ke Command Center</span>
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-white/[0.06] bg-zinc-950 p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase text-zinc-400">
                KREDENSIAL ADMIN DEFAULT
              </span>
              <button
                type="button"
                onClick={handleQuickSandboxLogin}
                className="font-mono text-[11px] font-bold text-amber-400 hover:underline"
              >
                Login Instan 1-Klik →
              </button>
            </div>
            <div className="mt-2 space-y-1 font-mono text-xs text-zinc-300">
              <div>
                Email: <span className="text-zinc-100">admin@kronos.gg</span>
              </div>
              <div>
                Passkey: <span className="text-zinc-100">kronos2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingActionCount = transactions.filter(
    (tx) =>
      tx.payment_status === "UNPAID" ||
      tx.fulfillment_status === "PENDING" ||
      tx.fulfillment_status === "PROCESSING"
  ).length;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Tactical Command Bar */}
      <div className="border-b border-white/[0.08] bg-[#121215]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    KRONOS COMMAND CENTER // ROOT CONSOLE
                  </span>
                  {supabaseStatus.schemaReady ? (
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                      <Activity className="h-3 w-3" />
                      <span>
                        SUPABASE CLOUD ONLINE ({supabaseStatus.projectRef})
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSqlModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-400 hover:bg-amber-500/20"
                    >
                      <Database className="h-3 w-3" />
                      <span>
                        SUPABASE TERHUBUNG — KLIK UNTUK SETUP TABEL SQL
                      </span>
                    </button>
                  )}
                </div>
                <h1 className="mt-0.5 font-heading text-lg font-extrabold tracking-tight text-zinc-50 sm:text-xl">
                  Panel Administrasi & Manajemen Database Supabase
                </h1>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-zinc-400" />
                <span>Ke Storefront</span>
              </Link>

              <button
                type="button"
                disabled={isMutating}
                onClick={() => executeAdminAction("sync_supabase")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                title="Sinkronkan & Push seluruh data ke Supabase PostgreSQL"
              >
                <CloudUpload className="h-3.5 w-3.5" />
                <span>Push ke Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => setSqlModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 font-mono text-xs font-medium text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-400"
              >
                <Database className="h-3.5 w-3.5 text-amber-400" />
                <span>Status & SQL</span>
              </button>

              <button
                type="button"
                disabled={isMutating}
                onClick={refreshAdminData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 font-mono text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-amber-400 ${
                    isMutating ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                disabled={isMutating}
                onClick={() => executeAdminAction("reset_sandbox")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 font-mono text-xs font-medium text-zinc-300 transition-colors hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-50"
                title="Kembalikan seluruh katalog & transaksi ke data awal"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Default</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Navigation Module Tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "overview"
                  ? "border-amber-500 bg-amber-500/[0.1] text-amber-400"
                  : "border-white/[0.08] bg-zinc-950 text-zinc-300 hover:border-white/20"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Ringkasan & Analitik</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("transactions")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "transactions"
                  ? "border-amber-500 bg-amber-500/[0.1] text-amber-400"
                  : "border-white/[0.08] bg-zinc-950 text-zinc-300 hover:border-white/20"
              }`}
            >
              <ReceiptText className="h-4 w-4" />
              <span>Manajemen Transaksi</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-amber-400 tabular-nums">
                {transactions.length}
              </span>
              {pendingActionCount > 0 && (
                <span className="rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-950 tabular-nums">
                  {pendingActionCount} Antrean
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("games")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "games"
                  ? "border-amber-500 bg-amber-500/[0.1] text-amber-400"
                  : "border-white/[0.08] bg-zinc-950 text-zinc-300 hover:border-white/20"
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Katalog Game</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 tabular-nums">
                {games.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("denominations")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "denominations"
                  ? "border-amber-500 bg-amber-500/[0.1] text-amber-400"
                  : "border-white/[0.08] bg-zinc-950 text-zinc-300 hover:border-white/20"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Produk & Nominal SKU</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 tabular-nums">
                {denominations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("channels")}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === "channels"
                  ? "border-amber-500 bg-amber-500/[0.1] text-amber-400"
                  : "border-white/[0.08] bg-zinc-950 text-zinc-300 hover:border-white/20"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Metode Pembayaran</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 tabular-nums">
                {paymentChannels.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Banner jika tabel SQL di Supabase belum dibuat */}
        {!supabaseStatus.schemaReady && (
          <div className="mb-5 flex flex-col justify-between gap-4 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] p-4 text-left sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-xs font-bold uppercase text-amber-400">
                  LANGKAH AKHIR AKTIVASI TABEL SUPABASE ({supabaseStatus.projectRef})
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-300">
                Aplikasi sudah terhubung ke{" "}
                <code className="font-mono text-amber-300">
                  {supabaseStatus.projectUrl}
                </code>
                , namun tabel database (<code className="font-mono">games</code>,{" "}
                <code className="font-mono">denominations</code>,{" "}
                <code className="font-mono">payment_channels</code>,{" "}
                <code className="font-mono">transactions</code>) belum dibuat di
                proyek Supabase Anda.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setSqlModalOpen(true)}
                className="rounded-lg bg-amber-500 px-3.5 py-2 font-mono text-xs font-bold text-zinc-950 hover:bg-amber-400"
              >
                Buka Panduan & Salin SQL (1 Menit)
              </button>
            </div>
          </div>
        )}

        {/* Feedback Toast Banner */}
        {toastMessage && (
          <div
            className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-left text-xs font-medium ${
              toastMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="font-mono text-[11px] uppercase opacity-75 hover:opacity-100"
            >
              Tutup
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <AdminOverviewTab
            games={games}
            denominations={denominations}
            paymentChannels={paymentChannels}
            transactions={transactions}
            isMutating={isMutating}
            onQuickCompleteTransaction={(invoiceNumber) =>
              executeAdminAction("update_transaction", {
                invoice_number: invoiceNumber,
                payment_status: "PAID",
                fulfillment_status: "SUCCESS",
              })
            }
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === "transactions" && (
          <AdminTransactionsTab
            transactions={transactions}
            isMutating={isMutating}
            onUpdateTransaction={(payload: {
              invoice_number: string;
              payment_status?: PaymentStatus;
              fulfillment_status?: FulfillmentStatus;
              serial_number?: string | null;
            }) => executeAdminAction("update_transaction", payload)}
            onDeleteTransaction={(invoiceNumber) =>
              executeAdminAction("delete_transaction", {
                invoice_number: invoiceNumber,
              })
            }
          />
        )}

        {activeTab === "games" && (
          <AdminGamesTab
            games={games}
            denominations={denominations}
            isMutating={isMutating}
            onUpsertGame={(payload) =>
              executeAdminAction("upsert_game", payload)
            }
            onDeleteGame={(id) => executeAdminAction("delete_game", { id })}
            onOpenGameDenominations={(gameId) => {
              setSelectedGameFilter(gameId);
              setActiveTab("denominations");
            }}
          />
        )}

        {activeTab === "denominations" && (
          <AdminDenominationsTab
            games={games}
            denominations={denominations}
            selectedGameFilter={selectedGameFilter}
            onChangeGameFilter={setSelectedGameFilter}
            isMutating={isMutating}
            onUpsertDenomination={(payload) =>
              executeAdminAction("upsert_denomination", payload)
            }
            onDeleteDenomination={(id) =>
              executeAdminAction("delete_denomination", { id })
            }
          />
        )}

        {activeTab === "channels" && (
          <AdminPaymentChannelsTab
            paymentChannels={paymentChannels}
            isMutating={isMutating}
            onUpsertPaymentChannel={(
              payload: Partial<PaymentChannel> & {
                code: string;
                name: string;
                category: PaymentCategory;
              }
            ) => executeAdminAction("upsert_payment_channel", payload)}
            onDeletePaymentChannel={(id) =>
              executeAdminAction("delete_payment_channel", { id })
            }
          />
        )}
      </div>

      {/* Modal Status & Setup SQL Supabase */}
      {sqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-white/[0.12] bg-[#18181B] p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  INTEGRASI SUPABASE POSTGRESQL & REALTIME
                </span>
                <h3 className="mt-0.5 font-heading text-lg font-bold text-zinc-50">
                  Status Database:{" "}
                  {supabaseStatus.schemaReady
                    ? "TERHUBUNG PENUH (CLOUD READY)"
                    : "MENUNGGU EKSEKUSI TABEL SQL"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSqlModalOpen(false)}
                className="rounded-lg border border-white/[0.08] bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-zinc-500">Project URL:</span>
                    <p className="font-mono font-semibold text-zinc-100">
                      {supabaseStatus.projectUrl}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Mode Penyimpanan:</span>
                    <p className="font-mono font-bold text-amber-400">
                      {supabaseStatus.mode}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-zinc-400">{supabaseStatus.message}</p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold uppercase text-zinc-200">
                    Langkah 1: Salin & Jalankan Script Ini di Supabase SQL Editor
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-xs font-bold text-zinc-950 hover:bg-amber-400"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>
                        {copiedSql ? "Berhasil Disalin!" : "Salin Script SQL"}
                      </span>
                    </button>
                    <a
                      href={`https://supabase.com/dashboard/project/${supabaseStatus.projectRef}/sql/new`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.12] bg-zinc-900 px-3 py-1.5 font-mono text-xs font-medium text-zinc-100 hover:border-amber-500/50 hover:text-amber-400"
                    >
                      <span>Buka Supabase SQL Editor</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <pre className="max-h-64 overflow-y-auto rounded-lg border border-white/[0.08] bg-zinc-950 p-3.5 font-mono text-[11px] leading-relaxed text-zinc-300">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] p-4">
                <div>
                  <span className="font-mono text-xs font-bold uppercase text-emerald-400">
                    Langkah 2: Push Seluruh Data Awal ke Supabase
                  </span>
                  <p className="mt-0.5 text-zinc-300">
                    Setelah klik <strong>Run</strong> di Supabase SQL Editor,
                    klik tombol di samping untuk mengisi otomatis 6 Game, 39
                    Produk SKU, 7 Metode Pembayaran, dan 5 Transaksi ke
                    Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => executeAdminAction("sync_supabase")}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  <CloudUpload className="h-4 w-4" />
                  <span>Push & Seed Data ke Supabase Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
