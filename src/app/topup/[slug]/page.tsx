import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/lib/mock-fallback";
import { CheckoutClientWrapper } from "@/components/checkout/CheckoutClientWrapper";

interface TopupPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopupGamePage({ params }: TopupPageProps) {
  const { slug } = await params;
  const { game, denominations, paymentChannels } = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <div>
      {/* Breadcrumb Bar */}
      <div className="border-b border-white/[0.08] bg-[#121215]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 text-xs text-zinc-400 sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-zinc-100 transition-colors">
            Katalog Utama
          </Link>
          <span>/</span>
          <span className="font-mono uppercase text-zinc-400">
            {game.category}
          </span>
          <span>/</span>
          <span className="font-semibold text-amber-400">{game.title}</span>
        </div>
      </div>

      <CheckoutClientWrapper
        game={game}
        denominations={denominations}
        paymentChannels={paymentChannels}
      />
    </div>
  );
}
