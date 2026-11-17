import { NextRequest, NextResponse } from "next/server";
import {
  deleteDenomination,
  deleteGame,
  deletePaymentChannel,
  deleteTransactionByInvoice,
  getAllAdminData,
  resetSandboxData,
  syncDataToSupabase,
  updateTransactionStatus,
  upsertDenomination,
  upsertGame,
  upsertPaymentChannel,
} from "@/lib/mock-fallback";
import { generateSerialNumber } from "@/lib/utils";
import {
  FulfillmentStatus,
  PaymentCategory,
  PaymentStatus,
} from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAllAdminData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sistem admin." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case "update_transaction": {
        const {
          invoice_number,
          payment_status,
          fulfillment_status,
          serial_number,
        } = payload as {
          invoice_number: string;
          payment_status?: PaymentStatus;
          fulfillment_status?: FulfillmentStatus;
          serial_number?: string | null;
        };

        if (!invoice_number) {
          return NextResponse.json(
            { error: "Nomor invoice wajib diisi." },
            { status: 400 }
          );
        }

        const nowIso = new Date().toISOString();
        const updates: {
          payment_status?: PaymentStatus;
          fulfillment_status?: FulfillmentStatus;
          serial_number?: string | null;
          paid_at?: string | null;
          completed_at?: string | null;
        } = {};

        if (payment_status) {
          updates.payment_status = payment_status;
          if (payment_status === "PAID") {
            updates.paid_at = nowIso;
          }
        }

        if (fulfillment_status) {
          updates.fulfillment_status = fulfillment_status;
          if (fulfillment_status === "SUCCESS") {
            updates.completed_at = nowIso;
            updates.serial_number =
              serial_number && serial_number.trim()
                ? serial_number.trim()
                : generateSerialNumber("KRN");
          } else if (serial_number !== undefined) {
            updates.serial_number = serial_number
              ? serial_number.trim()
              : null;
          }
        } else if (serial_number !== undefined) {
          updates.serial_number = serial_number ? serial_number.trim() : null;
        }

        const updated = await updateTransactionStatus(invoice_number, updates);
        if (!updated) {
          return NextResponse.json(
            { error: "Transaksi tidak ditemukan." },
            { status: 404 }
          );
        }

        const allData = await getAllAdminData();
        return NextResponse.json({
          message: `Transaksi ${invoice_number} berhasil diperbarui.`,
          transaction: updated,
          data: allData,
        });
      }

      case "delete_transaction": {
        const { invoice_number } = payload as { invoice_number: string };
        if (!invoice_number) {
          return NextResponse.json(
            { error: "Nomor invoice wajib diisi." },
            { status: 400 }
          );
        }
        await deleteTransactionByInvoice(invoice_number);
        const allData = await getAllAdminData();
        return NextResponse.json({
          message: `Transaksi ${invoice_number} berhasil dihapus.`,
          data: allData,
        });
      }

      case "upsert_game": {
        if (!payload?.title || !payload?.slug) {
          return NextResponse.json(
            { error: "Nama game dan slug wajib diisi." },
            { status: 400 }
          );
        }
        const savedGame = await upsertGame(payload);
        const allData = await getAllAdminData();
        return NextResponse.json({
          message: `Katalog game "${savedGame.title}" berhasil disimpan.`,
          game: savedGame,
          data: allData,
        });
      }

      case "delete_game": {
        const { id } = payload as { id: string };
        if (!id) {
          return NextResponse.json(
            { error: "ID game wajib diisi." },
            { status: 400 }
          );
        }
        await deleteGame(id);
        const allData = await getAllAdminData();
        return NextResponse.json({
          message: "Game beserta daftar nominalnya berhasil dihapus.",
          data: allData,
        });
      }

      case "upsert_denomination": {
        if (
          !payload?.game_id ||
          !payload?.sku_code ||
          !payload?.name ||
          payload?.price === undefined
        ) {
          return NextResponse.json(
            { error: "Game, kode SKU, nama produk, dan harga wajib diisi." },
            { status: 400 }
          );
        }
        const savedDenom = await upsertDenomination(payload);
        const allData = await getAllAdminData();
        return NextResponse.json({
          message: `Produk SKU "${savedDenom.sku_code}" berhasil disimpan.`,
          denomination: savedDenom,
          data: allData,
        });
      }

      case "delete_denomination": {
        const { id } = payload as { id: string };
        if (!id) {
          return NextResponse.json(
            { error: "ID produk wajib diisi." },
            { status: 400 }
          );
        }
        await deleteDenomination(id);
        const allData = await getAllAdminData();
        return NextResponse.json({
          message: "Produk nominal berhasil dihapus.",
          data: allData,
        });
      }

      case "upsert_payment_channel": {
        if (!payload?.code || !payload?.name || !payload?.category) {
          return NextResponse.json(
            { error: "Kode, nama channel, dan kategori wajib diisi." },
            { status: 400 }
          );
        }
        const savedChannel = await upsertPaymentChannel({
          ...payload,
          category: payload.category as PaymentCategory,
        });
        const allData = await getAllAdminData();
        return NextResponse.json({
          message: `Metode pembayaran "${savedChannel.name}" berhasil disimpan.`,
          paymentChannel: savedChannel,
          data: allData,
        });
      }

      case "delete_payment_channel": {
        const { id } = payload as { id: string };
        if (!id) {
          return NextResponse.json(
            { error: "ID metode pembayaran wajib diisi." },
            { status: 400 }
          );
        }
        await deletePaymentChannel(id);
        const allData = await getAllAdminData();
        return NextResponse.json({
          message: "Metode pembayaran berhasil dihapus.",
          data: allData,
        });
      }

      case "reset_sandbox": {
        await resetSandboxData();
        const allData = await getAllAdminData();
        return NextResponse.json({
          message:
            "Seluruh data berhasil direset ke pengaturan awal & disinkronkan.",
          data: allData,
        });
      }

      case "sync_supabase": {
        const syncRes = await syncDataToSupabase({
          useFactoryDefaults: Boolean(payload?.useFactoryDefaults),
        });
        const allData = await getAllAdminData();
        if (!syncRes.success) {
          return NextResponse.json(
            { error: syncRes.message, data: allData },
            { status: 400 }
          );
        }
        return NextResponse.json({
          message: syncRes.message,
          data: allData,
        });
      }

      default:
        return NextResponse.json(
          { error: `Aksi admin tidak dikenali: ${String(action)}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan admin." },
      { status: 500 }
    );
  }
}
