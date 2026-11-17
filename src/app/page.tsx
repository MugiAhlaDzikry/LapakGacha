import React from "react";
import { getGames } from "@/lib/mock-fallback";
import { BentoHero } from "@/components/home/BentoHero";
import { GameCatalogGrid } from "@/components/home/GameCatalogGrid";
import { FloatingWhatsAppButton } from "@/components/whatsapp/FloatingWhatsAppButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const games = await getGames();

  return (
    <div className="pb-12">
      <BentoHero />
      <GameCatalogGrid games={games} />
      <FloatingWhatsAppButton />
    </div>
  );
}
