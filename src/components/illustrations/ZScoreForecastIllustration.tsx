'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * ZScoreForecastIllustration
 * Examination forecast curve vector with milestone target flags and stars.
 * ViewBox: 420x280.
 */
export const ZScoreForecastIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-full h-auto',
  size,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size ?? props.width ?? 420;
  const height = size ? (typeof size === 'number' ? (size * 280) / 420 : size) : props.height ?? 280;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 280"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Examination Z-Score Forecast Curve Illustration"
      {...props}
    >
      <defs>
        {/* Shaded area under the top achievement bell curve */}
        <linearGradient id="zscore-top-cutoff-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spotPink} stopOpacity="0.4" />
          <stop offset="100%" stopColor={spotPink} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Frame Plate */}
      <rect
        x="10"
        y="10"
        width="400"
        height="260"
        rx="20"
        fill={surface}
        stroke={contour}
        strokeWidth={1}
        opacity="0.2"
      />

      {/* Baseline / X-Axis */}
      <line
        x1="30"
        y1="230"
        x2="390"
        y2="230"
        stroke={contour}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* --- AMBIENT STARS & CALIBRATION NODES --- */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        {/* Star 1 - Top Left */}
        <path
          d="M 65 52 L 67 58 L 73 60 L 67 62 L 65 68 L 63 62 L 57 60 L 63 58 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.9}
        />
        {/* Star 2 - Top Right Apex */}
        <path
          d="M 365 45 L 367 51 L 373 53 L 367 55 L 365 61 L 363 55 L 357 53 L 363 51 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.9}
        />
        <circle cx="340" cy="95" r="2.5" fill={spotOrange} />
        <circle cx="95" cy="85" r="2" fill={spotYellow} />
      </g>

      {/* --- STANDARD DEVIATION GRID LINES (-2, -1, 0, +1, +2, +3) --- */}
      <g opacity="0.35">
        {/* Mean Center 0 (x=210) */}
        <line x1="210" y1="70" x2="210" y2="230" stroke={contour} strokeWidth="1" strokeDasharray="3 3" />
        {/* -1 SD (x=150) */}
        <line x1="150" y1="130" x2="150" y2="230" stroke={contour} strokeWidth="0.8" strokeDasharray="2 2" />
        {/* -2 SD (x=90) */}
        <line x1="90" y1="195" x2="90" y2="230" stroke={contour} strokeWidth="0.8" strokeDasharray="2 2" />
        {/* +1 SD (x=270) */}
        <line x1="270" y1="130" x2="270" y2="230" stroke={contour} strokeWidth="0.8" strokeDasharray="2 2" />
        {/* +2 SD (x=330) */}
        <line x1="330" y1="195" x2="330" y2="230" stroke={contour} strokeWidth="0.8" strokeDasharray="2 2" />

        {/* Labels below baseline */}
        <text x="90" y="244" textAnchor="middle" fill={contour} fontFamily="JetBrains Mono, monospace" fontSize="8">-2σ</text>
        <text x="150" y="244" textAnchor="middle" fill={contour} fontFamily="JetBrains Mono, monospace" fontSize="8">-1σ</text>
        <text x="210" y="244" textAnchor="middle" fill={contour} fontFamily="JetBrains Mono, monospace" fontSize="8">μ (0)</text>
        <text x="270" y="244" textAnchor="middle" fill={contour} fontFamily="JetBrains Mono, monospace" fontSize="8">+1σ</text>
        <text x="330" y="244" textAnchor="middle" fill={contour} fontFamily="JetBrains Mono, monospace" fontSize="8">+2σ</text>
      </g>

      {/* --- SHADED HIGH-ACHIEVEMENT PERCENTILE REGION (Cutoff >= +1.5σ) --- */}
      <path
        d="M 285 155 C 310 185, 335 210, 370 226 L 370 230 L 285 230 Z"
        fill="url(#zscore-top-cutoff-gradient)"
      />

      {/* --- GAUSSIAN BELL DISTRIBUTION CURVE --- */}
      <path
        d="M 50 226 C 90 222, 130 205, 160 160 C 185 120, 195 72, 210 72 C 225 72, 235 120, 260 160 C 290 205, 330 222, 370 226"
        stroke={contour}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />

      {/* Secondary Target Projection Line */}
      <path
        d="M 210 72 C 240 72, 280 90, 315 110"
        stroke={spotOrange}
        strokeWidth={1.5}
        strokeDasharray="3 3"
        fill="none"
      />

      {/* --- PRECISION DRAFTING COMPASS (Measuring Apex) --- */}
      <g transform="translate(180, 25)">
        {/* Top Hinge Assembly */}
        <circle cx="30" cy="15" r="5" fill={surface} stroke={contour} strokeWidth={1.5} />
        <circle cx="30" cy="15" r="2" fill={spotOrange} />
        {/* Left Compass Leg */}
        <line x1="27" y1="18" x2="6" y2="75" stroke={contour} strokeWidth={1.5} strokeLinecap="round" />
        <line x1="6" y1="75" x2="3" y2="84" stroke={contour} strokeWidth={1} strokeLinecap="round" />
        {/* Right Compass Leg */}
        <line x1="33" y1="18" x2="54" y2="75" stroke={contour} strokeWidth={1.5} strokeLinecap="round" />
        <line x1="54" y1="75" x2="57" y2="84" stroke={spotPink} strokeWidth={1.2} strokeLinecap="round" />
        {/* Adjustment Arc */}
        <path d="M 16 48 C 24 52, 36 52, 44 48" stroke={contour} strokeWidth={1} fill="none" />
      </g>

      {/* --- TARGET MILESTONE FLAG (Planted at Target Z-Score = +2.18) --- */}
      <g transform="translate(305, 110)">
        {/* Flag Pole */}
        <line x1="10" y1="10" x2="10" y2="120" stroke={contour} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="10" cy="10" r="3" fill={spotPink} stroke={contour} strokeWidth={1} />

        {/* Pennant Flag */}
        <path
          d="M 10 14 L 68 28 L 10 44 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <text
          x="24"
          y="32"
          fill="#ffffff"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="8"
          fontWeight="700"
        >
          A/L TARGET
        </text>

        {/* Milestone Readout Badge */}
        <g transform="translate(18, 56)">
          <rect x="0" y="0" width="56" height="20" rx="10" fill={surface} stroke={contour} strokeWidth={1.2} />
          <text x="28" y="14" textAnchor="middle" fill={contour} fontFamily="Newsreader, serif" fontSize="12" fontStyle="italic" fontWeight="600">
            +2.18
          </text>
        </g>
      </g>

      {/* --- TARGET MARKER PULSE (Point on curve at x=315) --- */}
      <g className={animated ? 'animate-monoline-breath' : ''} transform="translate(315, 175)">
        <circle cx="0" cy="0" r="8" fill={surface} stroke={contour} strokeWidth={1.5} />
        <circle cx="0" cy="0" r="4" fill={spotOrange} />
      </g>

      {/* --- FORECAST CALCULATION CARD (Bottom Left) --- */}
      <g transform="translate(35, 170)">
        <rect x="0" y="0" width="85" height="42" rx="6" fill={surface} stroke={contour} strokeWidth={1.2} />
        <text x="10" y="16" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="8" fontWeight="600">
          District Rank
        </text>
        <text x="10" y="32" fill={spotOrange} fontFamily="Newsreader, serif" fontSize="14" fontStyle="italic" fontWeight="700">
          Top 3.2%
        </text>
      </g>
    </svg>
  );
};

export default ZScoreForecastIllustration;
