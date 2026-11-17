-- Seed Data untuk KRONOS.GG Top-Up Platform

-- 1. Seed Games (6 Game & Voucher Utama)
insert into public.games (
  id, slug, title, publisher, category, thumbnail_url, banner_url, currency_name,
  requires_zone_id, id_label, zone_label, id_placeholder, zone_placeholder, helper_text, is_popular, is_active
) values
  (
    '11111111-1111-4111-8111-111111111101',
    'mobile-legends',
    'Mobile Legends: Bang Bang',
    'Moonton',
    'mobile',
    '/posters/mobile-legends.svg',
    '/banners/hero-mlbb.svg',
    'Diamonds',
    true,
    'User ID',
    'Zone ID',
    'Contoh: 124859201',
    'Contoh: 2614',
    'Buka profil akun di pojok kiri atas layar utama game untuk melihat User ID dan Zone ID (4-5 digit di dalam tanda kurung).',
    true,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'valorant',
    'Valorant',
    'Riot Games',
    'pc',
    '/posters/valorant.svg',
    '/banners/hero-valorant.svg',
    'Valorant Points',
    false,
    'Riot ID',
    'Tagline',
    'Username#TAG (Contoh: Kael#IDN)',
    '',
    'Masukkan Riot ID lengkap beserta Tagline setelah tanda pagar (#). Pastikan akun terdaftar di region Asia Pacific (AP/ID).',
    true,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'genshin-impact',
    'Genshin Impact',
    'HoYoverse',
    'mobile',
    '/posters/genshin-impact.svg',
    '/banners/hero-genshin.svg',
    'Genesis Crystals',
    true,
    'UID (User ID)',
    'Server',
    'Contoh: 819204512',
    'Pilih Server (Asia / America / Europe / TW,HK,MO)',
    'UID terdiri dari 9 digit angka yang tertera di pojok kanan bawah layar saat bermain atau di menu Paimon.',
    true,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111104',
    'free-fire',
    'Free Fire',
    'Garena',
    'mobile',
    '/posters/free-fire.svg',
    '/banners/hero-freefire.svg',
    'Diamonds',
    false,
    'Player ID',
    '',
    'Contoh: 582910492',
    '',
    'Player ID dapat disalin langsung dari menu profil karakter di pojok kiri atas lobby Free Fire.',
    true,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'pubg-mobile',
    'PUBG Mobile',
    'Tencent Games',
    'mobile',
    '/posters/pubg-mobile.svg',
    '/banners/hero-pubgm.svg',
    'Unknown Cash (UC)',
    false,
    'Character ID',
    '',
    'Contoh: 5192048192',
    '',
    'Masukkan Character ID numerik akun PUBG Mobile Region Indonesia/Global.',
    false,
    true
  ),
  (
    '11111111-1111-4111-8111-111111111106',
    'steam-wallet-idr',
    'Steam Wallet IDR',
    'Valve Corporation',
    'voucher',
    '/posters/steam-wallet.svg',
    '/banners/hero-steam.svg',
    'Kode Voucher IDR',
    false,
    'Email / No. WhatsApp Tujuan',
    '',
    'Contoh: 081234567890',
    '',
    'Kode voucher Steam Wallet Regional Indonesia (IDR) akan ditampilkan langsung pada halaman Invoice di bagian Serial Number (SN) setelah pembayaran lunas.',
    true,
    true
  );

-- 2. Seed Denominations
insert into public.denominations (
  game_id, sku_code, name, category_group, price, original_price, badge_text, sort_order, is_available
) values
  -- Mobile Legends: Bang Bang
  ('11111111-1111-4111-8111-111111111101', 'MLBB-WDP-1', 'Weekly Diamond Pass (1x)', 'Weekly Diamond Pass', 26500, 29000, 'TERLARIS', 1, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-WDP-2', 'Weekly Diamond Pass (2x Stack)', 'Weekly Diamond Pass', 52500, 58000, 'HEMAT', 2, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-TWILIGHT', 'Twilight Pass', 'Weekly Diamond Pass', 142000, 159000, null, 3, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-86', '86 Diamonds (78 + 8 Bonus)', 'Diamonds', 21500, 24000, null, 4, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-172', '172 Diamonds (156 + 16 Bonus)', 'Diamonds', 42800, 47500, null, 5, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-257', '257 Diamonds (234 + 23 Bonus)', 'Diamonds', 64000, 71000, 'POPULER', 6, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-344', '344 Diamonds (312 + 32 Bonus)', 'Diamonds', 85500, 95000, null, 7, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-706', '706 Diamonds (625 + 81 Bonus)', 'Diamonds', 171000, 189000, 'NILAI TERBAIK', 8, true),
  ('11111111-1111-4111-8111-111111111101', 'MLBB-2195', '2195 Diamonds (1860 + 335 Bonus)', 'Diamonds', 512000, 565000, null, 9, true),

  -- Valorant
  ('11111111-1111-4111-8111-111111111102', 'VAL-475', '475 Valorant Points', 'Valorant Points', 52000, 56000, null, 1, true),
  ('11111111-1111-4111-8111-111111111102', 'VAL-1000', '1000 Valorant Points', 'Valorant Points', 104000, 112000, 'BATTLEPASS', 2, true),
  ('11111111-1111-4111-8111-111111111102', 'VAL-2050', '2050 Valorant Points', 'Valorant Points', 208000, 225000, 'TERLARIS', 3, true),
  ('11111111-1111-4111-8111-111111111102', 'VAL-3650', '3650 Valorant Points', 'Valorant Points', 359000, 389000, null, 4, true),
  ('11111111-1111-4111-8111-111111111102', 'VAL-5350', '5350 Valorant Points', 'Valorant Points', 519000, 559000, 'SKIN BUNDLE', 5, true),
  ('11111111-1111-4111-8111-111111111102', 'VAL-11000', '11000 Valorant Points', 'Valorant Points', 1025000, 1099000, null, 6, true),

  -- Genshin Impact
  ('11111111-1111-4111-8111-111111111103', 'GI-WELKIN', 'Blessing of the Welkin Moon (30 Hari)', 'Blessing of the Welkin Moon', 57500, 79000, 'FAVORIT', 1, true),
  ('11111111-1111-4111-8111-111111111103', 'GI-WELKIN-2', '2x Blessing of the Welkin Moon (60 Hari)', 'Blessing of the Welkin Moon', 114000, 158000, 'HEMAT', 2, true),
  ('11111111-1111-4111-8111-111111111103', 'GI-60', '60 Genesis Crystals', 'Genesis Crystals', 12000, 16000, null, 3, true),
  ('11111111-1111-4111-8111-111111111103', 'GI-330', '330 Genesis Crystals (300 + 30)', 'Genesis Crystals', 57500, 79000, null, 4, true),
  ('11111111-1111-4111-8111-111111111103', 'GI-1090', '1090 Genesis Crystals (980 + 110)', 'Genesis Crystals', 174000, 249000, 'POPULER', 5, true),
  ('11111111-1111-4111-8111-111111111103', 'GI-2240', '2240 Genesis Crystals (1980 + 260)', 'Genesis Crystals', 376000, 479000, null, 6, true),
  ('11111111-1111-4111-8111-111111111103', 'GI-3880', '3880 Genesis Crystals (3280 + 600)', 'Genesis Crystals', 579000, 799000, null, 7, true),
  ('11111111-1111-4111-8111-111111111103', 'GI-8080', '8080 Genesis Crystals (6480 + 1600)', 'Genesis Crystals', 1159000, 1599000, 'ARCHON PACK', 8, true),

  -- Free Fire
  ('11111111-1111-4111-8111-111111111104', 'FF-MW', 'Membership Mingguan (450 Diamonds Total)', 'Membership', 27500, 31000, 'TERLARIS', 1, true),
  ('11111111-1111-4111-8111-111111111104', 'FF-MB', 'Membership Bulanan (2600 Diamonds Total)', 'Membership', 83500, 95000, null, 2, true),
  ('11111111-1111-4111-8111-111111111104', 'FF-70', '70 Diamonds', 'Diamonds', 9200, 10500, null, 3, true),
  ('11111111-1111-4111-8111-111111111104', 'FF-140', '140 Diamonds', 'Diamonds', 18400, 21000, null, 4, true),
  ('11111111-1111-4111-8111-111111111104', 'FF-355', '355 Diamonds', 'Diamonds', 45500, 51000, 'POPULER', 5, true),
  ('11111111-1111-4111-8111-111111111104', 'FF-720', '720 Diamonds', 'Diamonds', 91000, 102000, null, 6, true),
  ('11111111-1111-4111-8111-111111111104', 'FF-1450', '1450 Diamonds', 'Diamonds', 182000, 204000, null, 7, true),

  -- PUBG Mobile
  ('11111111-1111-4111-8111-111111111105', 'PUBG-60', '60 Unknown Cash (UC)', 'Unknown Cash (UC)', 14200, 16000, null, 1, true),
  ('11111111-1111-4111-8111-111111111105', 'PUBG-325', '325 Unknown Cash (300 + 25 UC)', 'Unknown Cash (UC)', 71500, 79000, 'ROYALE PASS', 2, true),
  ('11111111-1111-4111-8111-111111111105', 'PUBG-660', '660 Unknown Cash (600 + 60 UC)', 'Unknown Cash (UC)', 142500, 158000, 'TERLARIS', 3, true),
  ('11111111-1111-4111-8111-111111111105', 'PUBG-1800', '1800 Unknown Cash (1500 + 300 UC)', 'Unknown Cash (UC)', 355000, 395000, null, 4, true),
  ('11111111-1111-4111-8111-111111111105', 'PUBG-3850', '3850 Unknown Cash (3000 + 850 UC)', 'Unknown Cash (UC)', 709000, 790000, null, 5, true),

  -- Steam Wallet IDR
  ('11111111-1111-4111-8111-111111111106', 'STEAM-12K', 'Steam Wallet IDR 12.000', 'Kode Voucher', 12800, 14000, null, 1, true),
  ('11111111-1111-4111-8111-111111111106', 'STEAM-45K', 'Steam Wallet IDR 45.000', 'Kode Voucher', 46500, 50000, null, 2, true),
  ('11111111-1111-4111-8111-111111111106', 'STEAM-60K', 'Steam Wallet IDR 60.000', 'Kode Voucher', 61800, 66000, 'TERLARIS', 3, true),
  ('11111111-1111-4111-8111-111111111106', 'STEAM-90K', 'Steam Wallet IDR 90.000', 'Kode Voucher', 92500, 99000, null, 4, true),
  ('11111111-1111-4111-8111-111111111106', 'STEAM-120K', 'Steam Wallet IDR 120.000', 'Kode Voucher', 123000, 132000, null, 5, true),
  ('11111111-1111-4111-8111-111111111106', 'STEAM-250K', 'Steam Wallet IDR 250.000', 'Kode Voucher', 255000, 275000, 'POPULER', 6, true),
  ('11111111-1111-4111-8111-111111111106', 'STEAM-400K', 'Steam Wallet IDR 400.000', 'Kode Voucher', 407000, 435000, null, 7, true);

-- 3. Seed Payment Channels (7 Metode Pembayaran)
insert into public.payment_channels (
  code, name, category, fee_flat, fee_percent, instruction_text, is_featured, is_active, sort_order
) values
  (
    'QRIS_INSTANT',
    'QRIS Semua E-Wallet & Mobile Banking',
    'QRIS',
    0,
    0.70,
    'Buka aplikasi E-Wallet atau Mobile Banking pilihan Anda, pilih menu Scan QRIS, pindai kode QR di layar, dan konfirmasi nominal pembayaran.',
    true,
    true,
    1
  ),
  (
    'DANA',
    'DANA Instant Checkout',
    'E-Wallet',
    0,
    1.50,
    'Salin kode referensi pembayaran DANA atau gunakan nomor akun virtual tujuan pada menu Kirim/Bayar di aplikasi DANA.',
    false,
    true,
    2
  ),
  (
    'GOPAY',
    'GoPay / GoPay Tabungan',
    'E-Wallet',
    0,
    1.80,
    'Gunakan aplikasi Gojek atau GoPay, pilih menu Bayar dan masukkan kode referensi pembayaran yang tertera.',
    false,
    true,
    3
  ),
  (
    'SHOPEEPAY',
    'ShopeePay Instant',
    'E-Wallet',
    0,
    2.00,
    'Buka aplikasi Shopee atau ShopeePay, pilih menu Transfer/Bayar menggunakan nomor referensi pembayaran.',
    false,
    true,
    4
  ),
  (
    'BCA_VA',
    'BCA Virtual Account',
    'Virtual Account',
    4000,
    0.00,
    'Masuk ke BCA Mobile (m-BCA) atau KlikBCA, pilih m-Transfer > BCA Virtual Account, lalu tempel nomor Virtual Account 16 digit di atas.',
    false,
    true,
    5
  ),
  (
    'BRI_VA',
    'BRI Virtual Account (BRIVA)',
    'Virtual Account',
    2500,
    0.00,
    'Buka aplikasi BRImo, pilih menu BRIVA, masukkan nomor Virtual Account yang tertera, dan konfirmasi menggunakan PIN BRImo Anda.',
    false,
    true,
    6
  ),
  (
    'MANDIRI_VA',
    'Mandiri Virtual Account (Livin)',
    'Virtual Account',
    3000,
    0.00,
    'Buka aplikasi Livin by Mandiri, pilih menu Bayar > Multipayment, dan masukkan nomor Virtual Account Mandiri.',
    false,
    true,
    7
  );
