"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

interface ActivityItem {
  id: string;
  maskedPhone: string;
  itemName: string;
  gameTitle: string;
  gameSlug: string;
  price: number;
  secondsAgo: number;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    maskedPhone: "0812****89",
    itemName: "Weekly Diamond Pass (1x)",
    gameTitle: "MLBB",
    gameSlug: "mobile-legends",
    price: 26500,
    secondsAgo: 12,
  },
  {
    id: "act-2",
    maskedPhone: "0857****41",
    itemName: "1000 Valorant Points",
    gameTitle: "Valorant",
    gameSlug: "valorant",
    price: 104000,
    secondsAgo: 28,
  },
  {
    id: "act-3",
    maskedPhone: "0821****63",
    itemName: "Blessing of the Welkin Moon",
    gameTitle: "Genshin Impact",
    gameSlug: "genshin-impact",
    price: 57500,
    secondsAgo: 44,
  },
  {
    id: "act-4",
    maskedPhone: "0813****19",
    itemName: "355 Diamonds",
    gameTitle: "Free Fire",
    gameSlug: "free-fire",
    price: 45500,
    secondsAgo: 65,
  },
  {
    id: "act-5",
    maskedPhone: "0878****05",
    itemName: "Steam Wallet IDR 60.000",
    gameTitle: "Steam",
    gameSlug: "steam-wallet-idr",
    price: 61800,
    secondsAgo: 92,
  },
];

export function LiveActivityTicker() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % INITIAL_ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const visibleItems = [
    INITIAL_ACTIVITIES[activeIndex],
    INITIAL_ACTIVITIES[(activeIndex + 1) % INITIAL_ACTIVITIES.length],
  ];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/70 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
            Live Fulfillment Log
          </h3>
        </div>
        <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
          REALTIME FEED
        </span>
      </div>

      <div className="space-y-2">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={`/topup/${item.gameSlug}`}
            className="block rounded-lg border border-white/[0.06] bg-zinc-950/70 p-2.5 text-left transition-colors hover:border-white/20"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-zinc-200 tabular-nums">
                {item.maskedPhone}
              </span>
              <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                {item.secondsAgo} detik lalu
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-zinc-300">
              Membeli{" "}
              <span className="font-semibold text-amber-400">
                {item.itemName}
              </span>{" "}
              ({item.gameTitle})
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[11px] text-emerald-400">
                STATUS: TERKIRIM
              </span>
              <span className="font-mono text-xs font-bold text-zinc-200 tabular-nums">
                {formatRupiah(item.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
