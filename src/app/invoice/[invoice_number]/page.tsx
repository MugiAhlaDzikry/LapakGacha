import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransactionByInvoice } from "@/lib/mock-fallback";
import { RealtimeInvoiceView } from "@/components/invoice/RealtimeInvoiceView";

interface InvoicePageProps {
  params: Promise<{ invoice_number: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { invoice_number } = await params;
  const decodedInvoice = decodeURIComponent(invoice_number);
  const transaction = await getTransactionByInvoice(decodedInvoice);

  if (!transaction) {
    notFound();
  }

  return (
    <div>
      <div className="border-b border-white/[0.08] bg-[#121215]">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5 text-xs text-zinc-400 sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-zinc-100 transition-colors">
            Katalog Utama
          </Link>
          <span>/</span>
          <Link href="/track" className="hover:text-zinc-100 transition-colors">
            Lacak Pesanan
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-amber-400 tabular-nums">
            {transaction.invoice_number}
          </span>
        </div>
      </div>

      <RealtimeInvoiceView initialTransaction={transaction} />
    </div>
  );
}
