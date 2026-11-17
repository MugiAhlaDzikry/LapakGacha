import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionByInvoice,
  updateTransactionStatus,
} from "@/lib/mock-fallback";
import { generateSerialNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const invoiceNumber = request.nextUrl.searchParams.get("invoice_number");
  if (!invoiceNumber) {
    return NextResponse.json(
      { error: "Parameter invoice_number diperlukan." },
      { status: 400 }
    );
  }

  const tx = await getTransactionByInvoice(invoiceNumber);
  if (!tx) {
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({ transaction: tx });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice_number, action, stage } = body;

    if (!invoice_number) {
      return NextResponse.json(
        { error: "Nomor invoice wajib disertakan." },
        { status: 400 }
      );
    }

    const existing = await getTransactionByInvoice(invoice_number);
    if (!existing) {
      return NextResponse.json(
        { error: "Invoice tidak ditemukan." },
        { status: 404 }
      );
    }

    if (action === "EXPIRE") {
      const updated = await updateTransactionStatus(invoice_number, {
        payment_status: "EXPIRED",
        fulfillment_status: "FAILED",
      });
      return NextResponse.json({ transaction: updated });
    }

    // Stage 2: Complete fulfillment after 2000ms
    if (stage === "COMPLETE_FULFILLMENT") {
      const prefix =
        existing.game?.slug?.slice(0, 4).toUpperCase() || "KRN";
      const sn = existing.serial_number || generateSerialNumber(prefix);
      const updated = await updateTransactionStatus(invoice_number, {
        payment_status: "PAID",
        fulfillment_status: "SUCCESS",
        serial_number: sn,
        completed_at: new Date().toISOString(),
      });
      return NextResponse.json({ transaction: updated });
    }

    // Default Action = SUCCESS (Stage 1: PAID + PROCESSING, then schedule Stage 2 after 2000ms)
    const nowIso = new Date().toISOString();
    const processingTx = await updateTransactionStatus(invoice_number, {
      payment_status: "PAID",
      fulfillment_status: "PROCESSING",
      paid_at: nowIso,
    });

    const prefix =
      existing.game?.slug?.slice(0, 4).toUpperCase() || "KRN";
    const generatedSn = generateSerialNumber(prefix);

    // Background 2000ms transition to SUCCESS for Supabase Realtime & polling listeners
    setTimeout(async () => {
      try {
        await updateTransactionStatus(invoice_number, {
          payment_status: "PAID",
          fulfillment_status: "SUCCESS",
          serial_number: generatedSn,
          completed_at: new Date().toISOString(),
        });
      } catch {
        // Ignore background update error
      }
    }, 2000);

    return NextResponse.json({
      transaction: processingTx,
      next_stage_delay_ms: 2000,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menjalankan simulasi pembayaran." },
      { status: 500 }
    );
  }
}
