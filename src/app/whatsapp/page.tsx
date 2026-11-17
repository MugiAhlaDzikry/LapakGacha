import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_WHATSAPP_RAW } from "@/lib/whatsapp";
import { WhatsAppAdminHub } from "@/components/whatsapp/WhatsAppAdminHub";

export const metadata: Metadata = {
  title: `Barcode WhatsApp & Telegram Admin (${ADMIN_WHATSAPP_RAW}) | KRONOS.GG`,
  description: `Pindai barcode QR WhatsApp atau Telegram Admin resmi KRONOS.GG (${ADMIN_WHATSAPP_RAW}) lengkap dengan pesan template otomatis untuk pembeli.`,
};

interface WhatsAppPageProps {
  searchParams: Promise<{ invoice?: string }>;
}

export default async function WhatsAppAdminPage({
  searchParams,
}: WhatsAppPageProps) {
  const params = await searchParams;
  const initialInvoice =
    typeof params?.invoice === "string" ? params.invoice.trim() : "";

  return (
    <div>
      {/* Breadcrumb Bar */}
      <div className="border-b border-white/[0.08] bg-[#121215]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 text-xs text-zinc-400 sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-zinc-100 transition-colors">
            Katalog Utama
          </Link>
          <span>/</span>
          <span className="font-semibold text-amber-400 tabular-nums">
            Barcode WhatsApp &amp; Telegram Admin ({ADMIN_WHATSAPP_RAW})
          </span>
        </div>
      </div>

      <WhatsAppAdminHub initialInvoice={initialInvoice} />
    </div>
  );
}
