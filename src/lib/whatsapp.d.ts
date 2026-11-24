import type { Transaction } from "./supabase/database.types";

export const ADMIN_WHATSAPP_RAW: string;
export const ADMIN_WHATSAPP_INTL: string;
export const ADMIN_WHATSAPP_DISPLAY: string;
export const ADMIN_WHATSAPP_PLUS: string;
export const ADMIN_WHATSAPP_JID: string;

export const ADMIN_TELEGRAM_RAW: string;
export const ADMIN_TELEGRAM_PHONE: string;
export const ADMIN_TELEGRAM_DISPLAY: string;
export const DEFAULT_TELEGRAM_BOT_TOKEN: string;
export const DEFAULT_TELEGRAM_ADMIN_CHAT_ID: string;
export const DEFAULT_TELEGRAM_BOT_USERNAME: string;

export interface WhatsAppQuickTemplate {
  id: string;
  label: string;
  badge: string;
  description: string;
  defaultMessage: string;
}

export const WHATSAPP_QUICK_TEMPLATES: WhatsAppQuickTemplate[];

export interface FormattedSupportMessageParams {
  topicId?: string;
  invoiceNumber?: string;
  gameName?: string;
  targetUserId?: string;
  senderPhone?: string;
  customMessage?: string;
}

export interface WhatsAppIntegrationInfo {
  module: string;
  connected: boolean;
  adminNumberRaw: string;
  adminNumberIntl: string;
  adminNumberDisplay: string;
  adminNumberPlus: string;
  adminJid: string;
  telegramPhone: string;
  telegramDisplay: string;
  directUrl: string;
  defaultChatUrl: string;
  directTelegramUrl: string;
  defaultTelegramChatUrl: string;
  templatesCount: number;
}

export function formatPhoneToWhatsApp(phone: string): string;
export function buildAdminWhatsAppUrl(customMessage?: string): string;
export function buildAdminTelegramUrl(customMessage?: string): string;
export function buildFormattedSupportMessage(
  params?: FormattedSupportMessageParams
): string;
export function buildInvoiceWhatsAppMessage(transaction: Transaction): string;
export function getWhatsAppIntegrationInfo(): WhatsAppIntegrationInfo;
export function generateWhatsAppQrMatrix(payload?: string): boolean[][];
export function sendDirectTelegramNotification(params: {
  formattedMessage: string;
  topicLabel?: string;
  invoiceNumber?: string;
  senderPhone?: string;
  gameName?: string;
  targetUserId?: string;
}): Promise<{ ok: boolean; description?: string; error?: string; result?: any; queued?: boolean; warning?: string }>;

export function sendDirectWhatsAppNotification(params: {
  formattedMessage: string;
  topicLabel?: string;
  invoiceNumber?: string;
  senderPhone?: string;
  gameName?: string;
  targetUserId?: string;
}): Promise<{ ok: boolean; provider?: string; destination?: string; note?: string; error?: string; result?: any }>;
