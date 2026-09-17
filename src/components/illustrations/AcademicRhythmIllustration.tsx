'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * AcademicRhythmIllustration
 * Study rhythm & momentum visual vector with books, geometric charts, sinusoidal pace curve, and stars.
 * ViewBox: 400x300.
 */
export const AcademicRhythmIllustration: React.FC<MonolineIllustrationProps> = ({
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
      aria-label="Academic Rhythm and Study Momentum Illustration"
      {...props}
    >
      <defs>
        <linearGradient id="rhythm-curve-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spotPink} stopOpacity="0.3" />
          <stop offset="100%" stopColor={spotPink} stopOpacity="0.0" />
        </linearGradient>
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

      {/* Ground Horizon Base */}
      <line
        x1="30"
        y1="250"
        x2="370"
        y2="250"
        stroke={contour}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* --- AMBIENT FLOATING STARS --- */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        {/* Star 1 */}
        <path
          d="M 330 45 L 332 52 L 339 54 L 332 56 L 330 63 L 328 56 L 321 54 L 328 52 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={1}
        />
        {/* Star 2 */}
        <path
          d="M 60 70 L 61.5 75 L 66.5 76.5 L 61.5 78 L 60 83 L 58.5 78 L 53.5 76.5 L 58.5 75 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.9}
        />
        <circle cx="210" cy="40" r="1.5" fill={spotOrange} />
        <circle cx="360" cy="90" r="1.2" fill={contour} opacity="0.4" />
      </g>

      {/* --- HARMONIC SINUSOIDAL STUDY MOMENTUM WAVE --- */}
      <g>
        {/* Coordinate Grid Lines */}
        <line x1="160" y1="180" x2="360" y2="180" stroke={contour} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
        <line x1="160" y1="120" x2="360" y2="120" stroke={contour} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
        <line x1="160" y1="60" x2="360" y2="60" stroke={contour} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />

        {/* Shaded Area Under Rhythm Wave */}
        <path
          d="M 170 200 C 200 160, 220 70, 255 70 C 290 70, 310 150, 340 130 C 352 122, 358 110, 365 95 L 365 240 L 170 240 Z"
          fill="url(#rhythm-curve-gradient)"
        />

        {/* Momentum Sinusoidal Stroke */}
        <path
          d="M 170 200 C 200 160, 220 70, 255 70 C 290 70, 310 150, 340 130 C 352 122, 358 110, 365 95"
          stroke={spotPink}
          strokeWidth={2.2}
          strokeLinecap="round"
        />

        {/* Data Markers along the curve */}
        <g className={animated ? 'animate-monoline-breath' : ''}>
          {/* Peak Momentum Crest */}
          <circle cx="255" cy="70" r="7" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
          <circle cx="255" cy="70" r="3.5" fill={spotPink} />
        </g>
        <circle cx="205" cy="140" r="4.5" fill={surface} stroke={contour} strokeWidth={1.5} />
        <circle cx="205" cy="140" r="2" fill={spotOrange} />
        <circle cx="340" cy="130" r="4.5" fill={surface} stroke={contour} strokeWidth={1.5} />
        <circle cx="340" cy="130" r="2" fill={spotYellow} />

        {/* Peak Label Tag */}
        <g transform="translate(225, 34)">
          <rect x="0" y="0" width="60" height="18" rx="9" fill={surface} stroke={contour} strokeWidth={1} />
          <text x="30" y="12" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="8" fontWeight="600">
            Flow Peak
          </text>
        </g>
      </g>

      {/* --- WEEKLY STUDY EQUILIBRIUM BARS --- */}
      <g opacity="0.9">
        {/* Mon */}
        <rect x="180" y="195" width="16" height="45" rx="3" fill={surface} stroke={contour} strokeWidth={1.4} />
        <rect x="180" y="210" width="16" height="30" rx="2" fill={spotYellow} fillOpacity="0.4" />

        {/* Tue */}
        <rect x="210" y="170" width="16" height="70" rx="3" fill={surface} stroke={contour} strokeWidth={1.4} />
        <rect x="210" y="195" width="16" height="45" rx="2" fill={spotOrange} fillOpacity="0.5" />

        {/* Wed */}
        <rect x="240" y="145" width="16" height="95" rx="3" fill={surface} stroke={contour} strokeWidth={1.4} />
        <rect x="240" y="165" width="16" height="75" rx="2" fill={spotPink} fillOpacity="0.5" />

        {/* Thu */}
        <rect x="270" y="160" width="16" height="80" rx="3" fill={surface} stroke={contour} strokeWidth={1.4} />
        <rect x="270" y="185" width="16" height="55" rx="2" fill={spotYellow} fillOpacity="0.4" />

        {/* Fri */}
        <rect x="300" y="175" width="16" height="65" rx="3" fill={surface} stroke={contour} strokeWidth={1.4} />
        <rect x="300" y="195" width="16" height="45" rx="2" fill={spotOrange} fillOpacity="0.5" />

        {/* Sat */}
        <rect x="330" y="150" width="16" height="90" rx="3" fill={surface} stroke={contour} strokeWidth={1.4} />
        <rect x="330" y="170" width="16" height="70" rx="2" fill={spotPink} fillOpacity="0.5" />
      </g>

      {/* --- STACK OF STUDY TEXTBOOKS (Left Foreground) --- */}
      <g transform="translate(45, 120)">
        {/* Book 1 (Bottom - Heavy Syllabus Tome) */}
        <g transform="translate(0, 95)">
          <rect x="0" y="0" width="95" height="28" rx="4" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
          {/* Spine Band */}
          <rect x="0" y="0" width="14" height="28" rx="2" fill={spotOrange} stroke={contour} strokeWidth={1} />
          <line x1="22" y1="9" x2="80" y2="9" stroke={contour} strokeWidth="1" />
          <line x1="22" y1="17" x2="65" y2="17" stroke={contour} strokeWidth="0.8" opacity="0.5" />
          {/* Page Edge Lines */}
          <line x1="90" y1="4" x2="90" y2="24" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        </g>

        {/* Book 2 (Middle - Combined Maths) */}
        <g transform="translate(6, 62)">
          <rect x="0" y="0" width="85" height="26" rx="4" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
          <rect x="0" y="0" width="12" height="26" rx="2" fill={spotPink} stroke={contour} strokeWidth={1} />
          <line x1="20" y1="8" x2="72" y2="8" stroke={contour} strokeWidth="1" />
          <line x1="20" y1="16" x2="55" y2="16" stroke={contour} strokeWidth="0.8" opacity="0.5" />
        </g>

        {/* Book 3 (Top - Physics / Chemistry) */}
        <g transform="translate(14, 32)">
          <rect x="0" y="0" width="75" height="24" rx="4" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
          <rect x="0" y="0" width="10" height="24" rx="2" fill={spotYellow} stroke={contour} strokeWidth={1} />
          <line x1="18" y1="7" x2="62" y2="7" stroke={contour} strokeWidth="1" />
          <line x1="18" y1="15" x2="48" y2="15" stroke={contour} strokeWidth="0.8" opacity="0.5" />
          {/* Protruding Ribbon Bookmark */}
          <path
            d="M 60 24 C 62 34, 65 42, 60 48 L 65 46 L 70 49 C 68 42, 64 32, 64 24 Z"
            fill={spotPink}
            stroke={contour}
            strokeWidth={0.9}
          />
        </g>
      </g>

      {/* --- STUDY CLOCK ICON / FOCUS COMPASS (Resting by books) --- */}
      <g transform="translate(130, 218)">
        <circle cx="16" cy="16" r="14" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <path d="M 16 6 L 16 16 L 22 16" stroke={spotOrange} strokeWidth={1.5} strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill={contour} />
      </g>
    </svg>
  );
};

export default AcademicRhythmIllustration;
