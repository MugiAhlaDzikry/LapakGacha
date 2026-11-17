import { NextRequest, NextResponse } from "next/server";

const DETERMINISTIC_NICKNAMES = [
  "KaelThas_ID",
  "Valkyrie99",
  "GARUDA_PRO",
  "NoxVanguard",
  "Aether_IDN",
  "ZephyrStrike",
  "Ragnarok_X",
  "KryosTactical",
  "Shadowblade_07",
  "Astraea_AP",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gameSlug = String(body.game_slug || "").trim();
    const userId = String(body.user_id || "").trim();
    const zoneId = String(body.zone_id || "").trim();

    // Realistic 600ms network lookup simulation
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!userId || userId.length < 5) {
      return NextResponse.json(
        {
          valid: false,
          message: "Format ID tidak valid. Masukkan minimal 5 karakter/digit.",
        },
        { status: 400 }
      );
    }

    if (gameSlug === "mobile-legends" && (!zoneId || zoneId.length < 3)) {
      return NextResponse.json(
        {
          valid: false,
          message: "Zone ID Mobile Legends wajib diisi (minimal 3-5 digit).",
        },
        { status: 400 }
      );
    }

    if (gameSlug === "genshin-impact" && !zoneId) {
      return NextResponse.json(
        {
          valid: false,
          message: "Silakan pilih Server Genshin Impact terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    // If Valorant ID has Username#TAG format, extract username or use deterministic list
    if (gameSlug === "valorant" && userId.includes("#")) {
      const [riotName, riotTag] = userId.split("#");
      if (riotName && riotTag) {
        return NextResponse.json({
          valid: true,
          nickname: `${riotName}#${riotTag.toUpperCase()}`,
          region: "AP / IDN",
        });
      }
    }

    // Deterministic hash from userId + zoneId + gameSlug
    const seedInput = `${gameSlug}:${userId}:${zoneId}`;
    let hash = 0;
    for (let i = 0; i < seedInput.length; i++) {
      hash = (hash * 31 + seedInput.charCodeAt(i)) >>> 0;
    }

    const baseNickname =
      DETERMINISTIC_NICKNAMES[hash % DETERMINISTIC_NICKNAMES.length];
    const suffix = userId.slice(-2).replace(/\D/g, "") || "99";

    return NextResponse.json({
      valid: true,
      nickname: `${baseNickname}_${suffix}`,
      region: zoneId ? `Zone ${zoneId}` : "IDN Server",
    });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        message: "Gagal memverifikasi ID akun. Periksa kembali koneksi Anda.",
      },
      { status: 500 }
    );
  }
}
