export type GameCategory = "mobile" | "pc" | "voucher";

export type PaymentCategory =
  | "QRIS"
  | "E-Wallet"
  | "Virtual Account"
  | "Convenience Store";

export type PaymentStatus = "UNPAID" | "PAID" | "EXPIRED" | "FAILED";
export type FulfillmentStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface Game {
  id: string;
  slug: string;
  title: string;
  publisher: string;
  category: GameCategory;
  thumbnail_url: string;
  banner_url: string;
  currency_name: string;
  requires_zone_id: boolean;
  id_label: string;
  zone_label: string;
  id_placeholder: string;
  zone_placeholder: string;
  helper_text: string | null;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Denomination {
  id: string;
  game_id: string;
  sku_code: string;
  name: string;
  category_group: string;
  price: number;
  original_price: number | null;
  badge_text: string | null;
  sort_order: number;
  is_available: boolean;
}

export interface PaymentChannel {
  id: string;
  code: string;
  name: string;
  category: PaymentCategory;
  fee_flat: number;
  fee_percent: number;
  instruction_text: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  game_id: string;
  denomination_id: string;
  target_user_id: string;
  target_zone_id: string | null;
  target_nickname: string;
  whatsapp_number: string;
  payment_code: string;
  payment_name: string;
  amount: number;
  fee: number;
  total_amount: number;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  payment_reference: string | null;
  serial_number: string | null;
  expired_at: string;
  paid_at: string | null;
  completed_at: string | null;
  created_at: string;
  // Enriched joined fields for UI convenience
  game?: Pick<Game, "title" | "slug" | "publisher" | "thumbnail_url" | "currency_name">;
  denomination?: Pick<Denomination, "name" | "sku_code" | "category_group">;
}

export interface SupabaseIntegrationStatus {
  connected: boolean;
  schemaReady: boolean;
  projectUrl: string;
  projectRef: string;
  mode: "SUPABASE_CLOUD" | "SCHEMA_REQUIRED" | "LOCAL_FALLBACK";
  message: string;
  counts: {
    games: number;
    denominations: number;
    paymentChannels: number;
    transactions: number;
  };
}

