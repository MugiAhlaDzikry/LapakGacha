# **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

# **PLATFORM TOP-UP GAME & VOUCHER DIGITAL PREMIUM**

**Target Eksekutor:** AI Coding Agent (Antigravity / Gemini Agent)  
**Tech Stack Utama:** Next.js 15+ (App Router, TypeScript), Tailwind CSS, shadcn/ui, Lucide Icons, Supabase (PostgreSQL, Realtime, Auth)  
Mode Pembayaran & Fulfillment: End-to-End Sandbox Simulation (Simulasi Pembayaran & Pengiriman Instan via Supabase Realtime)  
Filosofi Desain: Dark Tactical Luxury (Referensi Visual: Razer Gold, Riot Games Store, Linear, Vercel — STRICTLY ZERO AI SLOP)

---

# **1\. INSTRUKSI SISTEM & ATURAN ANTI-AI SLOP**

AI Agent dilarang menggunakan pola desain generik ("AI Slop"). Seluruh komponen UI wajib mematuhi aturan berikut tanpa terkecuali:

# **1.1. Daftar Larangan Visual (Strict Negative Constraints)**

* **DILARANG** menggunakan gradien warna ungu-ke-biru atau cyan neon (`from-purple-500 to-blue-500`, `from-indigo-500 via-purple-500 to-pink-500`).  
* **DILARANG** membuat kartu fitur 3 kolom dengan ikon bundar atau emoji di tengah atas.  
* **DILARANG** menggunakan `box-shadow` berwarna mencolok atau efek *neon glow* tebal di sekeliling kartu.  
* **DILARANG** menggunakan latar belakang hitam murni (`#000000`) atau putih murni (`#FFFFFF`).  
* **DILARANG** membuat paragraf atau elemen fungsional rata tengah (*center-aligned*). Gunakan *left-aligned* untuk seluruh antarmuka transaksi dan katalog.

# **1.2. Sistem Desain & Palet Warna (Dark Tactical Luxury)**

| Token Desain | Kode Hex / Class Tailwind | Penggunaan |
| :---- | :---- | :---- |
| **Background Utama** | `#09090B` (`bg-zinc-950`) | Canvas utama aplikasi |
| **Background Kartu** | `#121215` (`bg-zinc-900/70`) | Surface kartu dengan `backdrop-blur-md` |
| **Elevated Surface** | `#18181B` (`bg-zinc-900`) | Modal, dropdown, dan state hover |
| **Border Default** | `rgba(255, 255, 255, 0.08)` | `border-white/[0.08]` |
| **Border Hover** | `rgba(255, 255, 255, 0.18)` | `hover:border-white/20` |
| **Primary Brand Accent** | `#F59E0B` (`amber-500`) | CTA utama, active state nominal, badge |
| **State Seleksi** | `ring-2 ring-amber-500 bg-amber-500/[0.07]` | State terpilih pada item / pembayaran |
| **Teks Primary** | `#FAFAFA` (`text-zinc-50`) | Judul dan teks utama |
| **Teks Secondary** | `#A1A1AA` (`text-zinc-400`) | Subtitle dan label pendukung |
| **Teks Muted** | `#71717A` (`text-zinc-500`) | Placeholder dan teks sekunder |
| **Status Success** | `#10B981` (`emerald-500`) | Status Pembayaran Lunas / Terkirim |
| **Status Pending** | `#F59E0B` (`amber-500`) | Status Menunggu Pembayaran |
| **Status Failed** | `#EF4444` (`rose-500`) | Status Kedaluwarsa / Transaksi Gagal |

# **1.3. Tipografi & Aturan Angka (Tabular Numerals)**

* **Font Heading:** `Plus Jakarta Sans` atau `Space Grotesk` (`font-bold tracking-tight`).  
* **Font Body:** `Inter` (`antialiased`).  
* **Font Angka, Harga, ID, & Timer:** `JetBrains Mono` atau wajib menerapkan class `tabular-nums` pada setiap nominal Rupiah (`Rp 21.500`), Nomor Invoice, Countdown Timer, dan Input User ID.

---

# **2\. ARSITEKTUR TEKNIS & ALUR SIMULASI PEMBAYARAN**

Karena sistem pembayaran menggunakan **mode simulasi (sandbox internal)**, aplikasi tidak memerlukan API key Midtrans/Xendit eksternal agar dapat berjalan penuh dari memilih item hingga diamond masuk:

1. **Simulasi Cek Nickname Game (`/api/check-id`):**  
   * Menerima `game_slug`, `user_id`, dan `zone_id`.  
   * Melakukan validasi format (minimal 5 digit angka) dan mengembalikan *deterministic mock nickname* (contoh: `KaelThas_ID`, `Valkyrie99`, `GARUDA_PRO`) setelah jeda realistis `600ms`.  
2. **Pembuatan Transaksi & QRIS/VA Simulasi (`/api/checkout`):**  
   * Menghitung `amount` (harga produk) \+ `fee` (biaya layanan metode pembayaran) \= `total_amount`.  
   * Menyimpan transaksi ke tabel `transactions` di Supabase dengan `payment_status = 'UNPAID'`, `fulfillment_status = 'PENDING'`, dan waktu kedaluwarsa `15 menit` dari waktu dibuat.  
   * Menghasilkan *Mock QRIS Payload* atau *Mock Virtual Account Number* (contoh: `88012` \+ nomor HP/acak) dan mengarahkan pengguna ke `/invoice/[invoice_number]`.  
3. **Panel Simulasi Pembayaran (Dev/Sandbox Simulator di Halaman Invoice):**  
   * Di halaman `/invoice/[invoice_number]`, sediakan komponen khusus bertema taktis **"Sandbox Payment Simulator"** dengan tombol:  
     * `[Simulasikan Pembayaran Berhasil]`  
     * `[Simulasikan Pembayaran Kedaluwarsa/Gagal]`  
4. **Eksekusi Webhook Simulasi & Supabase Realtime (`/api/simulate-payment`):**  
   * Saat tombol `[Simulasikan Pembayaran Berhasil]` diklik:  
     1. Endpoint mengubah `payment_status` menjadi `'PAID'` dan `fulfillment_status` menjadi `'PROCESSING'`.  
     2. Setelah jeda simulasi pengiriman `2000ms` (2 detik), status `fulfillment_status` otomatis diperbarui menjadi `'SUCCESS'` beserta kode SN (*Serial Number*) pengiriman.  
   * Halaman Invoice mendengarkan perubahan tabel `transactions` menggunakan **Supabase Realtime (`postgres_changes`)**, sehingga *Progress Stepper* dan status halaman langsung bertransisi secara *live* tanpa *refresh* browser.

---

# **3\. SKEMA DATABASE SUPABASE**

AI Agent wajib mengeksekusi atau menyiapkan file migrasi `supabase/migrations/001_initial_schema.sql` berikut:

```
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- 1. Tabel Katalog Game
create table public.games (
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
create table public.denominations (
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
create table public.payment_channels (
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
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  invoice_number text unique not null,
  game_id uuid references public.games(id) not null,
  denomination_id uuid references public.denominations(id) not null,
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

-- Aktifkan Row Level Security (RLS) untuk akses publik yang aman (Guest Checkout)
alter table public.games enable row level security;
alter table public.denominations enable row level security;
alter table public.payment_channels enable row level security;
alter table public.transactions enable row level security;

create policy "Public can read active games" on public.games for select using (is_active = true);
create policy "Public can read available denominations" on public.denominations for select using (is_available = true);
create policy "Public can read active payment channels" on public.payment_channels for select using (is_active = true);
create policy "Anyone can create transaction" on public.transactions for insert with check (true);
create policy "Anyone can view transaction by invoice" on public.transactions for select using (true);
create policy "Allow sandbox status update" on public.transactions for update using (true);

-- Aktifkan Supabase Realtime pada tabel transactions
alter publication supabase_realtime add table public.transactions;
```

# **3.1. Persyaratan Seed Data (`supabase/seed.sql`)**

AI Agent wajib membuat *seed data* realistis minimal untuk **6 Game/Voucher**:

* **Mobile Legends: Bang Bang** (Moonton \- Mobile, `requires_zone_id: true`, grup: *Weekly Diamond Pass* & *Diamonds*).  
* **Valorant** (Riot Games \- PC, `requires_zone_id: false`, `id_label: 'Riot ID'`, `id_placeholder: 'Username#TAG'`, grup: *Valorant Points*).  
* **Genshin Impact** (HoYoverse \- Mobile/PC, `requires_zone_id: true`, `zone_label: 'Server'`, grup: *Blessing of the Welkin Moon* & *Genesis Crystals*).  
* **Free Fire** (Garena \- Mobile, `requires_zone_id: false`, grup: *Membership* & *Diamonds*).  
* **PUBG Mobile** (Tencent Games \- Mobile, `requires_zone_id: false`, grup: *Unknown Cash (UC)*).  
* **Steam Wallet IDR** (Valve \- Voucher, `requires_zone_id: false`, `id_label: 'Email / No. WhatsApp Tujuan'`, grup: *Kode Voucher*).

Sertakan juga **7 Metode Pembayaran**:

* `QRIS_INSTANT` (Kategori: QRIS, Fee: 0.7%, Featured: `true`)  
* `DANA`, `GOPAY`, `SHOPEEPAY` (Kategori: E-Wallet, Fee: 1.5% \- 2%)  
* `BCA_VA`, `BRI_VA`, `MANDIRI_VA` (Kategori: Virtual Account, Fee Flat: `Rp 2.500` \- `Rp 4.000`)

---

# **4\. SPESIFIKASI HALAMAN & KOMPONEN UI**

# **4.1. Global Navbar & Command Search**

* **Tinggi & Gaya:** `h-16 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.08]`.  
* **Elemen Kiri:** Brand Logo berdesain tajam (misal: **VORTEX.GG** atau **KRONOS TOPUP**) dengan indikator titik hijau kecil (`Operational 24/7`).  
* **Elemen Tengah:** *Command Search Bar* (`Ctrl + K`) yang membuka modal pencarian instan untuk mencari judul game secara *real-time*.  
* **Elemen Kanan:** Navigasi ke `/track` (`Lacak Pesanan`) dengan ikon *receipt*.

# **4.2. Halaman Utama (`/`)**

1. **Asymmetric Bento Hero Grid (`grid-cols-1 lg:grid-cols-12 gap-4`):**  
   * **Kolom Kiri (8 Kolom):** Banner utama rasio 16:7 dengan *dark vignette gradient*, *pill badge* `PROMO MUSIM INI`, judul kontras tinggi, dan CTA `Top Up Sekarang`.  
   * **Kolom Kanan (4 Kolom):** Kartu *Live Flash Deal* (menampilkan 2 penawaran spesial seperti *Weekly Diamond Pass Rp 26.500* dengan *countdown timer* `tabular-nums`) dan kartu *Live Activity Ticker* yang menampilkan transaksi terbaru yang disamarkan (misal: `0812****89 baru saja membeli 355 Diamonds MLBB — 12 detik lalu`).  
2. **Filter & Katalog Game:**  
   * Filter kategori berbentuk *segmented control* (`Semua`, `Populer`, `Mobile`, `PC`, `Voucher`).  
   * **Game Card (3:4 Vertical Poster):**  
     * Menggunakan rasio `aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.08] bg-zinc-900 group relative`.  
     * Efek *hover*: Gambar membesar halus (`group-hover:scale-105 transition-transform duration-500`), border berubah menjadi `group-hover:border-amber-500/50`.  
     * Bagian bawah gambar dilapisi `bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-4` berisi *Publisher Label* (`text-xs text-zinc-400 uppercase tracking-wider`) dan *Judul Game* (`text-base font-bold text-zinc-50`).

# **4.3. Halaman Checkout Game (`/topup/[slug]`)**

Menggunakan **2-Column Split Layout** pada layar Desktop (`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8`):

* **Kolom Kiri — Sticky Game Info & Live Summary (`lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-4`):**  
  1. **Game Header Card:** Menampilkan thumbnail 3:4 kecil, nama game, publisher, serta badge `Proses Otomatis 1-3 Detik`.  
  2. **Live Order Summary Card (Desktop):**  
     * Menampilkan ringkasan dinamis: Nickname Akun, Item yang dipilih, Metode Pembayaran, Harga Produk, Biaya Layanan, dan **Total Pembayaran** (`text-xl font-bold text-amber-400 tabular-nums`).  
     * Tombol utama `Beli Sekarang` (nonaktif jika langkah 1–4 belum lengkap).  
* **Kolom Kanan — Step-by-Step Interactive Containers (`lg:col-span-8 space-y-6`):**  
  Setiap langkah dibungkus dalam kontainer `rounded-xl bg-zinc-900/60 border border-white/[0.08] p-5` dengan header bernomor monospasi (`01`, `02`, `03`, `04`):  
  1. **Langkah `01` — Masukkan Data Akun:**  
     * Input `User ID` dan (jika `requires_zone_id == true`) input `Zone ID` atau dropdown Server.  
     * Fitur otomatis: Saat input selesai diketik (*onBlur* atau tombol `Cek ID`), panggil `/api/check-id` dan tampilkan bar terverifikasi: `✓ Akun Ditemukan: [Nickname]` dengan warna emerald.  
  2. **Langkah `02` — Pilih Nominal Top-Up:**  
     * Dipisahkan berdasarkan `category_group` (misal: *Special Pass* di atas, *Top Up Instant* di bawah).  
     * Grid kartu (`grid-cols-2 sm:grid-cols-3 gap-3`).  
     * Isi kartu: Nama item (`font-semibold text-sm`), harga coret (`line-through text-xs text-zinc-500 tabular-nums`), dan harga jual (`text-sm font-bold text-amber-400 font-mono tabular-nums`).  
     * Indikator aktif: `ring-2 ring-amber-500 bg-amber-500/[0.08]` dengan tanda centang di sudut kanan atas.  
  3. **Langkah `03` — Pilih Metode Pembayaran:**  
     * *Accordion* atau grup kartu per kategori (`QRIS (Rekomendasi)`, `E-Wallet`, `Virtual Account`).  
     * Ketika pengguna sudah memilih nominal di Langkah 02, setiap kartu pembayaran **wajib langsung menampilkan total harga akhir** (Harga Nominal \+ Biaya Admin masing-masing channel) dalam format `tabular-nums`.  
  4. **Langkah `04` — Kontak WhatsApp:**  
     * Input nomor WhatsApp (`08xxxxxxxxxx`) untuk notifikasi invoice dan pencarian riwayat pesanan.  
* **Sticky Bottom Checkout Bar (Khusus Mobile \- `lg:hidden fixed bottom-0 inset-x-0 z-40`):**  
  * Menampilkan item terpilih \+ Total Harga di sebelah kiri, dan tombol `Bayar Sekarang` di sebelah kanan.

# **4.4. Halaman Invoice & Simulasi Realtime (`/invoice/[invoice_number]`)**

1. **Status Header & Countdown Timer:**  
   * Menampilkan Nomor Invoice (dengan tombol *Copy*), Waktu Transaksi, dan *Countdown Timer* mundur 15 menit (`tabular-nums`) jika status masih `UNPAID`.  
2. **Realtime 4-Step Progress Tracker:**  
   * `01. Transaksi Dibuat` ➔ `02. Menunggu Pembayaran` ➔ `03. Memproses Top-Up` ➔ `04. Diamond Terkirim`.  
3. **Kotak Instruksi Pembayaran:**  
   * Jika **QRIS**: Tampilkan visual kode QR interaktif (gunakan generator SVG QR dari string `payment_reference`), nominal tepat yang harus dibayar, dan tombol `Unduh QRIS`.  
   * Jika **Virtual Account / E-Wallet**: Tampilkan Nomor VA dengan font monospasi besar dan tombol `Salin Nomor VA`.  
4. **Komponen "Sandbox Payment Simulator" (Khusus Pengujian):**  
   * Kotak berbingkai garis putus-putus (`border-dashed border-amber-500/40 bg-amber-500/[0.04] p-4 rounded-xl`) yang bertuliskan:  
     * *"Mode Simulasi Aktif: Gunakan kontrol di bawah ini untuk memicu webhook pembayaran secara instan."*  
     * Tombol 1: `Simulasikan Bayar Sukses (Auto-Fulfill)` — Mengubah status ke `PAID` ➔ `PROCESSING` ➔ `SUCCESS` dan menampilkan *Serial Number (SN)* transaksi.  
     * Tombol 2: `Simulasikan Kedaluwarsa (Expired)` — Mengubah status ke `EXPIRED`.

# **4.5. Halaman Lacak Pesanan (`/track`)**

* Input pencarian berdasarkan **Nomor Invoice** (`INV-...`) atau **Nomor WhatsApp**.  
* Menampilkan daftar transaksi beserta badge status warna semantik (`PAID`, `UNPAID`, `SUCCESS`) dan tautan langsung menuju detail invoice.

---

# **5\. STRUKTUR DIREKTORI PROYEK (NEXT.JS APP ROUTER)**

t  
src/  
├── app/  
│   ├── layout.tsx                    \# Root layout (Font Plus Jakarta Sans & JetBrains Mono, Dark theme)  
│   ├── globals.css                   \# Variabel warna Zinc-950 & utility classes  
│   ├── page.tsx                      \# Homepage (Bento Hero \+ Filter \+ 3:4 Game Catalog)  
│   ├── topup/  
│   │   └── \[slug\]/  
│   │       └── page.tsx              \# Halaman Checkout 2 Kolom  
│   ├── invoice/  
│   │   └── \[invoice\_number\]/  
│   │       └── page.tsx              \# Halaman Invoice Realtime \+ Sandbox Simulator  
│   ├── track/  
│   │   └── page.tsx                  \# Halaman Lacak Pesanan  
│   └── api/  
│       ├── check-id/route.ts         \# Endpoint simulasi validasi User ID & Nickname  
│       ├── checkout/route.ts         \# Endpoint pembuatan invoice baru ke Supabase  
│       └── simulate-payment/route.ts \# Endpoint simulasi webhook PAID \-\> PROCESSING \-\> SUCCESS  
├── components/  
│   ├── layout/  
│   │   ├── Navbar.tsx  
│   │   ├── CommandSearchModal.tsx  
│   │   └── Footer.tsx  
│   ├── home/  
│   │   ├── BentoHero.tsx  
│   │   ├── LiveActivityTicker.tsx  
│   │   └── GameCatalogGrid.tsx  
│   ├── checkout/  
│   │   ├── CheckoutClientWrapper.tsx  
│   │   ├── StepAccountInput.tsx  
│   │   ├── StepDenominationGrid.tsx  
│   │   ├── StepPaymentChannels.tsx  
│   │   ├── OrderSummarySticky.tsx  
│   │   └── MobileCheckoutBar.tsx  
│   └── invoice/  
│       ├── RealtimeInvoiceView.tsx  
│       ├── PaymentInstructionCard.tsx  
│       └── SandboxSimulatorPanel.tsx  
└── lib/  
├── supabase/  
│   ├── client.ts  
│   ├── server.ts  
│   └── database.types.ts  
├── mock-fallback.ts              \# Fallback data otomatis jika env Supabase belum diisi  
└── utils.ts                      \# formatRupiah(), generateInvoiceNumber(), cn()

```

---

# 6. URUTAN EKSEKUSI UNTUK AI AGENT

AI Agent wajib mengeksekusi proyek ini secara berurutan agar tidak terjadi error kompilasi:

1. **Langkah 1 — Inisialisasi & Konfigurasi Desain:**
   * Siapkan font `Plus Jakarta Sans`, `Inter`, dan `JetBrains Mono` di `src/app/layout.tsx`.
   * Konfigurasikan `globals.css` dengan tema gelap permanen (`#09090B`), custom scrollbar tipis, dan helper `formatRupiah()` di `src/lib/utils.ts`.
2. **Langkah 2 — Setup Supabase & Fallback Layer:**
   * Buat file migrasi SQL (`supabase/migrations/001_initial_schema.sql`) dan seed data (`supabase/seed.sql`).
   * Buat `src/lib/supabase/client.ts` dan `server.ts`, serta sediakan *automatic local fallback store* di `src/lib/mock-fallback.ts` agar aplikasi tetap langsung berjalan 100% meskipun variabel `.env.local` Supabase belum dikonfigurasi oleh pengguna.
3. **Langkah 3 — Bangun Global Layout & Homepage (`/`):**
   * Buat `Navbar.tsx` lengkap dengan modal pencarian instan (`Ctrl+K`).
   * Bangun `BentoHero.tsx`, `LiveActivityTicker.tsx`, dan `GameCatalogGrid.tsx` dengan poster rasio 3:4.
4. **Langkah 4 — Bangun Alur Checkout (`/topup/[slug]`) & API:**
   * Buat route `/api/check-id` dan `/api/checkout`.
   * Bangun halaman `/topup/[slug]` dengan layout 2 kolom, validasi ID game interaktif, kalkulasi fee otomatis di setiap metode pembayaran, dan *sticky bottom bar* untuk mobile.
5. **Langkah 5 — Bangun Halaman Invoice Realtime & Simulator (`/invoice/[invoice_number]`):**
   * Buat route `/api/simulate-payment`.
   * Bangun halaman `/invoice/[invoice_number]` dengan tampilan QRIS/VA, *progress stepper* 4 tahap, listener Supabase Realtime, dan panel **Sandbox Payment Simulator**.
6. **Langkah 6 — Bangun Halaman Lacak Pesanan (`/track`) & Finalisasi UI:**
   * Buat fitur pencarian invoice berdasarkan Nomor Invoice atau Nomor WhatsApp, lalu periksa kembali seluruh halaman agar mematuhi aturan *Anti-AI Slop* dan `tabular-nums`.
```

