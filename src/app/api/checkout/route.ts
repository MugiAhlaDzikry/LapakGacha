import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  findCheckoutEntities,
  saveTransaction,
} from "@/lib/mock-fallback";
import {
  calculateChannelFee,
  generateInvoiceNumber,
} from "@/lib/utils";
import { Transaction } from "@/lib/supabase/database.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      game_id,
      denomination_id,
      target_user_id,
      target_zone_id,
      target_nickname,
      whatsapp_number,
      payment_code,
    } = body;

    if (
      !game_id ||
      !denomination_id ||
      !target_user_id ||
      !whatsapp_number ||
      !payment_code
    ) {
      return NextResponse.json(
        { error: "Data transaksi belum lengkap. Mohon lengkapi langkah 01 hingga 04." },
        { status: 400 }
      );
    }

    const { game, denomination, channel } = await findCheckoutEntities(
      game_id,
      denomination_id,
      payment_code
    );

    if (!game || !denomination || !channel) {
      return NextResponse.json(
        { error: "Produk atau metode pembayaran tidak ditemukan." },
        { status: 404 }
      );
    }

    const amount = denomination.price;
    const fee = calculateChannelFee(amount, channel.fee_flat, channel.fee_percent);
    const totalAmount = amount + fee;
    const invoiceNumber = generateInvoiceNumber();

    const phoneDigits = String(whatsapp_number)
      .replace(/\D/g, "")
      .slice(-10)
      .padStart(10, "8");

    const paymentReference =
      channel.category === "QRIS"
        ? `00020101021226610014ID.CO.KRONOS.WWW011893600914${phoneDigits}520458125303360540${totalAmount}5802ID5909KRONOS.GG6007JAKARTA6304${invoiceNumber.slice(-4)}`
        : channel.code === "BCA_VA"
        ? `88012${phoneDigits}`
        : channel.code === "BRI_VA"
        ? `77801${phoneDigits}`
        : channel.code === "MANDIRI_VA"
        ? `89022${phoneDigits}`
        : `KRN-${channel.code}-${phoneDigits.slice(-6)}`;

    const now = new Date();
    const expiredAt = new Date(now.getTime() + 15 * 60 * 1000);

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      invoice_number: invoiceNumber,
      game_id: game.id,
      denomination_id: denomination.id,
      target_user_id: String(target_user_id).trim(),
      target_zone_id: target_zone_id ? String(target_zone_id).trim() : null,
      target_nickname: String(target_nickname || "Verified_Player").trim(),
      whatsapp_number: String(whatsapp_number).trim(),
      payment_code: channel.code,
      payment_name: channel.name,
      amount,
      fee,
      total_amount: totalAmount,
      payment_status: "UNPAID",
      fulfillment_status: "PENDING",
      payment_reference: paymentReference,
      serial_number: null,
      expired_at: expiredAt.toISOString(),
      paid_at: null,
      completed_at: null,
      created_at: now.toISOString(),
      game: {
        title: game.title,
        slug: game.slug,
        publisher: game.publisher,
        thumbnail_url: game.thumbnail_url,
        currency_name: game.currency_name,
      },
      denomination: {
        name: denomination.name,
        sku_code: denomination.sku_code,
        category_group: denomination.category_group,
      },
    };

    const saved = await saveTransaction(newTransaction);

    return NextResponse.json({
      invoice_number: saved.invoice_number,
      transaction: saved,
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesanan." },
      { status: 500 }
    );
  }
}
