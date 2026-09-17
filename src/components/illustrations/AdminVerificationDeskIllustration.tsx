'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * AdminVerificationDeskIllustration
 * Administrative oversight & homework verification desk vector.
 * ViewBox: 400x300.
 */
export const AdminVerificationDeskIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-full h-auto',
  size,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size ?? props.width ?? 400;
  const height = size ? (typeof size === 'number' ? (size * 300) / 400 : size) : props.height ?? 300;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 300"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Administrative Oversight and Homework Verification Desk Illustration"
      {...props}
    >
      <defs>
        <radialGradient id="admin-lamp-glow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={spotYellow} stopOpacity="0.45" />
          <stop offset="60%" stopColor={spotYellow} stopOpacity="0.1" />
          <stop offset="100%" stopColor={spotYellow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Frame Plate */}
      <rect
        x="10"
        y="10"
        width="380"
        height="280"
        rx="20"
        fill={surface}
        stroke={contour}
        strokeWidth={1}
        opacity="0.2"
      />

      {/* Table Surface Horizon Base */}
      <line
        x1="25"
        y1="240"
        x2="375"
        y2="240"
        stroke={contour}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1="25"
        y1="248"
        x2="375"
        y2="248"
        stroke={contour}
        strokeWidth={1}
        opacity="0.35"
      />

      {/* --- AMBIENT VERIFICATION STARS & PARTICLES --- */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 55 45 L 57 51 L 63 53 L 57 55 L 55 61 L 53 55 L 47 53 L 53 51 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.9}
        />
        <path
          d="M 345 55 L 346.5 60 L 351.5 61.5 L 346.5 63 L 345 68 L 343.5 63 L 338.5 61.5 L 343.5 60 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.9}
        />
        <circle cx="160" cy="35" r="1.5" fill={spotOrange} />
        <circle cx="365" cy="110" r="1.5" fill={spotYellow} />
      </g>

      {/* --- BANKER'S DESK LAMP (Left Side with Warm Ambient Glow) --- */}
      <g>
        {/* Lamp Light Beam */}
        <g className={animated ? 'animate-monoline-lamp' : ''}>
          <polygon
            points="105,95 30,240 210,240"
            fill="url(#admin-lamp-glow)"
            opacity="0.8"
          />
        </g>

        {/* Lamp Hardware */}
        {/* Base */}
        <ellipse cx="85" cy="240" rx="22" ry="6" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        {/* Stem */}
        <path d="M 85 235 C 85 160, 95 100, 105 95" stroke={contour} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        {/* Shade Bracket */}
        <line x1="95" y1="95" x2="115" y2="95" stroke={contour} strokeWidth={strokeWidth} />
        {/* Green / Yellow Banker's Shade */}
        <ellipse cx="105" cy="94" rx="28" ry="11" fill={spotYellow} stroke={contour} strokeWidth={strokeWidth} />
        <line x1="80" y1="94" x2="130" y2="94" stroke={contour} strokeWidth={1} opacity="0.4" />
        {/* Pull Chain */}
        <line x1="118" y1="105" x2="118" y2="130" stroke={contour} strokeWidth={0.9} strokeDasharray="2 2" />
        <circle cx="118" cy="132" r="2.5" fill={spotOrange} stroke={contour} strokeWidth={0.8} />
      </g>

      {/* --- INBOX REVIEW QUEUE PAPER TRAY (Center-Left) --- */}
      <g transform="translate(130, 175)">
        {/* Tray Body */}
        <path
          d="M 0 45 L 85 45 L 80 62 L 5 62 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Front Cutout Notch */}
        <path d="M 28 45 C 28 52, 57 52, 57 45" stroke={contour} strokeWidth={1.2} fill="none" />

        {/* Stacked Paper Sheets */}
        <g transform="translate(8, -25)">
          {/* Bottom Sheet */}
          <rect x="0" y="45" width="68" height="20" rx="2" fill="#f8f4ee" stroke={contour} strokeWidth={1} />
          {/* Middle Sheet */}
          <rect x="2" y="32" width="68" height="20" rx="2" fill={surface} stroke={contour} strokeWidth={1.2} />
          <line x1="12" y1="40" x2="55" y2="40" stroke={contour} strokeWidth="0.8" opacity="0.4" />
          {/* Top Review Sheet */}
          <rect x="-2" y="16" width="70" height="24" rx="2" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
          {/* Header Tag */}
          <rect x="4" y="20" width="22" height="6" rx="3" fill={spotPink} fillOpacity="0.4" stroke={spotPink} strokeWidth={0.8} />
          <line x1="30" y1="24" x2="62" y2="24" stroke={contour} strokeWidth="0.8" />
          <line x1="8" y1="32" x2="58" y2="32" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        </g>
      </g>

      {/* --- ACTIVE STUDENT HOMEWORK SUBMISSION BEING VERIFIED --- */}
      <g transform="translate(210, 140)">
        {/* Document Body */}
        <rect
          x="0"
          y="0"
          width="95"
          height="98"
          rx="4"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        {/* Paper Header / ID Strip */}
        <rect x="10" y="10" width="45" height="8" rx="2" fill="#f4ede6" stroke={contour} strokeWidth={0.8} />
        <text x="14" y="17" fill={contour} fontFamily="JetBrains Mono, monospace" fontSize="6">
          STU-2026-841
        </text>
        {/* Verification Status Badge */}
        <rect x="62" y="10" width="24" height="8" rx="4" fill={spotPink} fillOpacity="0.25" stroke={spotPink} strokeWidth={0.8} />
        <text x="74" y="16.5" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="5.5" fontWeight="700">
          AUDIT
        </text>

        {/* Student Derivation Lines */}
        <line x1="10" y1="26" x2="85" y2="26" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="10" y1="34" x2="78" y2="34" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="10" y1="42" x2="82" y2="42" stroke={contour} strokeWidth="0.8" opacity="0.4" />

        {/* Math Derivation in Student Notes */}
        <path d="M 12 56 Q 25 48 35 56 T 58 56" stroke={spotOrange} strokeWidth="1.2" fill="none" />
        <line x1="10" y1="68" x2="65" y2="68" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="10" y1="76" x2="55" y2="76" stroke={contour} strokeWidth="0.8" opacity="0.4" />
      </g>

      {/* --- OFFICIAL VERIFICATION RUBBER STAMP (Approved Mark) --- */}
      <g transform="translate(262, 175) rotate(-14)">
        {/* Stamp Impression Border */}
        <rect
          x="0"
          y="0"
          width="46"
          height="24"
          rx="4"
          fill="none"
          stroke={spotPink}
          strokeWidth="1.8"
          strokeDasharray="4 2"
        />
        {/* Inner Stamp Seal */}
        <text
          x="23"
          y="15"
          textAnchor="middle"
          fill={spotPink}
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="9"
          fontWeight="800"
          letterSpacing="1"
        >
          VERIFIED
        </text>
      </g>

      {/* --- INSPECTION MAGNIFYING GLASS --- */}
      <g transform="translate(230, 115) rotate(32)">
        {/* Outer Lens Frame */}
        <circle cx="25" cy="25" r="24" fill={surface} stroke={contour} strokeWidth={strokeWidth} fillOpacity="0.3" />
        {/* Inner Lens Glass Highlight */}
        <path d="M 10 20 C 14 10, 24 6, 35 10" stroke={spotYellow} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Handle Mount */}
        <rect x="22" y="49" width="6" height="5" fill={contour} />
        {/* Ergonomic Handle */}
        <rect
          x="21"
          y="54"
          width="8"
          height="42"
          rx="4"
          fill={spotOrange}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        <line x1="25" y1="62" x2="25" y2="88" stroke={contour} strokeWidth="0.8" opacity="0.4" />
      </g>

      {/* --- INK BOTTLE & CALLIGRAPHY QUILL (Right Foreground) --- */}
      <g transform="translate(325, 205)">
        {/* Ink Well Glass Base */}
        <path
          d="M 6 22 L 2 34 L 32 34 L 28 22 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Ink Liquid */}
        <path d="M 5 28 L 3 34 L 31 34 L 29 28 Z" fill={spotPink} fillOpacity="0.4" />
        {/* Bottle Neck & Cap */}
        <rect x="10" y="16" width="14" height="6" rx="1" fill={surface} stroke={contour} strokeWidth={1.2} />
        <line x1="8" y1="16" x2="26" y2="16" stroke={contour} strokeWidth={1} />

        {/* Resting Feather Quill Pen */}
        <g transform="translate(17, 16) rotate(-35)">
          <path
            d="M 0 0 C 4 -25, 12 -45, 16 -65 C 10 -40, 2 -25, 0 0 Z"
            fill={surface}
            stroke={contour}
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
          <line x1="0" y1="0" x2="16" y2="-65" stroke={contour} strokeWidth="1" />
          <path d="M 0 0 L -1 8 L 1 8 Z" fill={contour} />
        </g>
      </g>
    </svg>
  );
};

export default AdminVerificationDeskIllustration;
