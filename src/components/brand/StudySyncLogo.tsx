'use client';

import React from 'react';

interface StudySyncLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'monogram' | 'full' | 'raw';
}

/**
 * StudySyncLogo
 * The authoritative vector mark for StudySync.
 * Renders the authentic monogram with archival watermark, serif 'S' glyph,
 * and terracotta seal dot matching public/favicon.svg.
 */
export function StudySyncLogo({
  size = 36,
  className = '',
}: StudySyncLogoProps) {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="StudySync Brand Logo"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background rounded base */}
        <rect
          width="64"
          height="64"
          rx="14"
          className="fill-zinc-900 dark:fill-[#121418] transition-colors"
        />
        {/* Outer hairline border */}
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="13"
          className="stroke-white/15 dark:stroke-white/20"
          strokeWidth="1.5"
        />

        {/* Archival watermark circle */}
        <circle
          cx="32"
          cy="32"
          r="22"
          className="stroke-white/20 dark:stroke-white/25"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />

        {/* Stylized Serif 'S' Monogram in Pure White Ink */}
        <path
          d="M38 18 C33 18 25 20.5 25 26.5 C25 34 39 31 39 38 C39 43 32 44.5 27 43.5 M25 42 L25 46 C30 47.5 41 46.5 41 38 C41 29 27 32 27 25.5 C27 21 34 20 37.5 20.5 L38 18 Z"
          fill="#FFFFFF"
        />

        {/* Terracotta Crimson Seal dot */}
        <circle cx="43" cy="22" r="3.5" fill="#C24942" />

        {/* Horizon Baseline */}
        <line
          x1="16"
          y1="52"
          x2="48"
          y2="52"
          stroke="#C24942"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default StudySyncLogo;
