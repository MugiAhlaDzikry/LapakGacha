"use client";

import React, { useMemo } from "react";

interface GlyphProps {
  className?: string;
}

export function WhatsAppGlyph({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.49 0 .14 5.34.14 11.91c0 2.1.55 4.15 1.59 5.96L0 24l6.29-1.65a11.88 11.88 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.46-8.42ZM12.06 21.8h-.01a9.87 9.87 0 0 1-5.04-1.38l-.36-.21-3.73.98.99-3.64-.24-.37a9.84 9.84 0 0 1-1.51-5.27c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.9 7c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TelegramGlyph({ className = "h-5 w-5" }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
        fill="currentColor"
      />
    </svg>
  );
}

interface WhatsAppQrSvgProps {
  matrix: boolean[][];
  id?: string;
  className?: string;
  ariaLabel: string;
}

export function WhatsAppQrSvg({
  matrix,
  id,
  className = "h-48 w-48",
  ariaLabel,
}: WhatsAppQrSvgProps) {
  const quietZone = 3;
  const size = matrix.length || 25;
  const totalViewSize = size + quietZone * 2;

  const pathData = useMemo(() => {
    const segments: string[] = [];
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c]) {
          segments.push(`M${c + quietZone} ${r + quietZone}h1v1h-1z`);
        }
      }
    }
    return segments.join("");
  }, [matrix]);

  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalViewSize} ${totalViewSize}`}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <rect width={totalViewSize} height={totalViewSize} fill="#F4F4F5" />
      <path d={pathData} fill="#09090B" />
    </svg>
  );
}
