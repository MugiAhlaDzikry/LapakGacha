import { NextRequest, NextResponse } from "next/server";
import { searchTransactions } from "@/lib/mock-fallback";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") || "";
    if (!query.trim()) {
      return NextResponse.json(
        { error: "Masukkan Nomor Invoice atau Nomor WhatsApp terlebih dahulu." },
        { status: 400 }
      );
    }

    const results = await searchTransactions(query);
    return NextResponse.json({ transactions: results });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat data transaksi." },
      { status: 500 }
    );
  }
}
