import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `Rp ${formatted}`;
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INV-${y}${m}${d}-${suffix}`;
}

export function calculateChannelFee(
  amount: number,
  feeFlat: number,
  feePercent: number
): number {
  const percentFee = Math.ceil((amount * Number(feePercent || 0)) / 100);
  return Math.round(Number(feeFlat || 0) + percentFee);
}

export function generateSerialNumber(prefix = "KRN"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-SN-${timestamp}-${randomPart}`;
}
