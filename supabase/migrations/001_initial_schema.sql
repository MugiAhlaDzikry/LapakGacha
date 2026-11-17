-- Enable UUID extension
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
drop policy if exists "Public can read active games" on public.games;
drop policy if exists "Allow full access to games" on public.games;
create policy "Allow full access to games" on public.games for all using (true) with check (true);

drop policy if exists "Public can read available denominations" on public.denominations;
drop policy if exists "Allow full access to denominations" on public.denominations;
create policy "Allow full access to denominations" on public.denominations for all using (true) with check (true);

drop policy if exists "Public can read active payment channels" on public.payment_channels;
drop policy if exists "Allow full access to payment_channels" on public.payment_channels;
create policy "Allow full access to payment_channels" on public.payment_channels for all using (true) with check (true);

drop policy if exists "Anyone can create transaction" on public.transactions;
drop policy if exists "Anyone can view transaction by invoice" on public.transactions;
drop policy if exists "Allow sandbox status update" on public.transactions;
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
end $$;
