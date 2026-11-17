"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Game } from "@/lib/supabase/database.types";

interface StepAccountInputProps {
  game: Game;
  userId: string;
  zoneId: string;
  nickname: string | null;
  checkError: string | null;
  isChecking: boolean;
  onUserIdChange: (value: string) => void;
  onZoneIdChange: (value: string) => void;
  onVerifyAccount: () => void;
}

const GENSHIN_SERVERS = [
  { value: "Asia", label: "Asia" },
  { value: "America", label: "America" },
  { value: "Europe", label: "Europe" },
  { value: "TW, HK, MO", label: "TW, HK, MO" },
];

export function StepAccountInput({
  game,
  userId,
  zoneId,
  nickname,
  checkError,
  isChecking,
  onUserIdChange,
  onZoneIdChange,
  onVerifyAccount,
}: StepAccountInputProps) {
  const isGenshin = game.slug === "genshin-impact";

  function handleBlur() {
    if (userId.trim().length >= 5) {
      if (!game.requires_zone_id || zoneId.trim().length > 0) {
        onVerifyAccount();
      }
    }
  }

  return (
    <section
      aria-labelledby="step-01-heading"
      className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-5 text-left"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-8 items-center justify-center rounded border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400 tabular-nums">
            01
          </span>
          <h2
            id="step-01-heading"
            className="font-heading text-base font-bold text-zinc-50 sm:text-lg"
          >
            Masukkan Data Akun
          </h2>
        </div>
        {nickname && (
          <span className="font-mono text-xs font-semibold text-emerald-400">
            TERVERIFIKASI
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-12">
        <div
          className={
            game.requires_zone_id ? "sm:col-span-7" : "sm:col-span-9"
          }
        >
          <label
            htmlFor="account-user-id"
            className="block text-xs font-semibold text-zinc-300"
          >
            {game.id_label} <span className="text-amber-500">*</span>
          </label>
          <input
            id="account-user-id"
            type="text"
            value={userId}
            onChange={(e) => onUserIdChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={game.id_placeholder}
            className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2.5 font-mono text-sm text-zinc-50 tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {game.requires_zone_id && (
          <div className="sm:col-span-5">
            <label
              htmlFor="account-zone-id"
              className="block text-xs font-semibold text-zinc-300"
            >
              {game.zone_label} <span className="text-amber-500">*</span>
            </label>
            {isGenshin ? (
              <select
                id="account-zone-id"
                value={zoneId}
                onChange={(e) => {
                  onZoneIdChange(e.target.value);
                }}
                onBlur={handleBlur}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-50 focus:border-amber-500 focus:outline-none"
              >
                <option value="">Pilih Server</option>
                {GENSHIN_SERVERS.map((srv) => (
                  <option key={srv.value} value={srv.value}>
                    {srv.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="account-zone-id"
                type="text"
                value={zoneId}
                onChange={(e) => onZoneIdChange(e.target.value)}
                onBlur={handleBlur}
                placeholder={game.zone_placeholder}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3.5 py-2.5 font-mono text-sm text-zinc-50 tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            )}
          </div>
        )}

        <div
          className={
            game.requires_zone_id ? "sm:col-span-12" : "sm:col-span-3 sm:flex sm:items-end"
          }
        >
          <button
            type="button"
            onClick={onVerifyAccount}
            disabled={isChecking || userId.trim().length < 5}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-amber-400 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memeriksa...</span>
              </>
            ) : (
              <span>Cek ID Akun</span>
            )}
          </button>
        </div>
      </div>

      {/* Verified Account Bar */}
      {nickname && !checkError && (
        <div
          role="status"
          className="mt-3.5 flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-left"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              ✓ Akun Ditemukan:{" "}
              <strong className="font-mono font-bold text-zinc-50">
                {nickname}
              </strong>
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
            ID VALID
          </span>
        </div>
      )}

      {/* Error Bar */}
      {checkError && (
        <div
          role="alert"
          className="mt-3.5 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-left text-xs text-rose-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{checkError}</span>
        </div>
      )}

      {game.helper_text && (
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {game.helper_text}
        </p>
      )}
    </section>
  );
}
