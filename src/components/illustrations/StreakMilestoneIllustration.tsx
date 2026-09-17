'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * StreakMilestoneIllustration
 * Milestone streak celebration flame & trophy vector.
 * ViewBox: 320x280.
 */
export const StreakMilestoneIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-full h-auto',
  size,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size ?? props.width ?? 320;
  const height = size ? (typeof size === 'number' ? (size * 280) / 320 : size) : props.height ?? 280;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Streak Milestone Celebration Flame Illustration"
      {...props}
    >
      <defs>
        <radialGradient id="streak-glow-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={spotYellow} stopOpacity="0.35" />
          <stop offset="70%" stopColor={spotOrange} stopOpacity="0.1" />
          <stop offset="100%" stopColor={spotOrange} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Frame Plate */}
      <rect
        x="10"
        y="10"
        width="300"
        height="260"
        rx="20"
        fill={surface}
        stroke={contour}
        strokeWidth={1}
        opacity="0.2"
      />

      {/* Ambient Background Glow behind the flame */}
      <ellipse
        cx="160"
        cy="120"
        rx="80"
        ry="80"
        fill="url(#streak-glow-radial)"
        className={animated ? 'animate-monoline-lamp' : ''}
      />

      {/* --- AMBIENT RISING EMBERS & CELEBRATORY STARS --- */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        {/* Star Top Left */}
        <path
          d="M 68 45 L 70 51 L 76 53 L 70 55 L 68 61 L 66 55 L 60 53 L 66 51 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.9}
        />
        {/* Star Top Right */}
        <path
          d="M 252 50 L 254 56 L 260 58 L 254 60 L 252 66 L 250 60 L 244 58 L 250 56 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.9}
        />
        {/* Ember Spark 1 */}
        <circle cx="110" cy="75" r="2.5" fill={spotOrange} stroke={contour} strokeWidth={0.8} />
        {/* Ember Spark 2 */}
        <circle cx="215" cy="80" r="3" fill={spotYellow} stroke={contour} strokeWidth={0.8} />
        {/* Ember Spark 3 */}
        <circle cx="160" cy="30" r="2" fill={spotPink} />
      </g>

      {/* --- LAUREL WREATH BRANCHES (Embracing Trophy & Flame) --- */}
      <g>
        {/* Left Laurel Branch */}
        <path
          d="M 120 220 C 70 190, 70 110, 110 70"
          stroke={contour}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Left Leaves */}
        {[
          { cx: 80, cy: 175, rot: -25 },
          { cx: 72, cy: 145, rot: -10 },
          { cx: 76, cy: 115, rot: 15 },
          { cx: 92, cy: 90, rot: 35 },
          { cx: 110, cy: 70, rot: 50 },
        ].map((leaf, i) => (
          <ellipse
            key={`l-${i}`}
            cx={leaf.cx}
            cy={leaf.cy}
            rx="9"
            ry="4.5"
            fill={i % 2 === 0 ? spotYellow : surface}
            stroke={contour}
            strokeWidth={1.2}
            transform={`rotate(${leaf.rot}, ${leaf.cx}, ${leaf.cy})`}
          />
        ))}

        {/* Right Laurel Branch */}
        <path
          d="M 200 220 C 250 190, 250 110, 210 70"
          stroke={contour}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Right Leaves */}
        {[
          { cx: 240, cy: 175, rot: 25 },
          { cx: 248, cy: 145, rot: 10 },
          { cx: 244, cy: 115, rot: -15 },
          { cx: 228, cy: 90, rot: -35 },
          { cx: 210, cy: 70, rot: -50 },
        ].map((leaf, i) => (
          <ellipse
            key={`r-${i}`}
            cx={leaf.cx}
            cy={leaf.cy}
            rx="9"
            ry="4.5"
            fill={i % 2 === 0 ? spotPink : surface}
            stroke={contour}
            strokeWidth={1.2}
            transform={`rotate(${leaf.rot}, ${leaf.cx}, ${leaf.cy})`}
          />
        ))}
      </g>

      {/* --- STYLIZED GEOMETRIC MONOLINE FLAME --- */}
      <g>
        {/* Outer Flame Contour */}
        <path
          d="M 160 48 C 175 75, 205 105, 205 140 C 205 168, 185 188, 160 188 C 135 188, 115 168, 115 140 C 115 118, 130 95, 140 85 C 142 102, 150 112, 162 108 C 158 92, 155 70, 160 48 Z"
          fill={spotOrange}
          fillOpacity="0.45"
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Middle Flame Crest */}
        <path
          d="M 160 76 C 172 96, 192 118, 192 142 C 192 162, 178 178, 160 178 C 142 178, 128 162, 128 142 C 128 126, 138 110, 148 102 C 148 114, 155 120, 164 116 C 160 105, 158 90, 160 76 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={1.5}
        />

        {/* Inner Pulsing Core */}
        <g className={animated ? 'animate-monoline-breath' : ''}>
          <path
            d="M 160 108 C 168 122, 180 134, 180 150 C 180 162, 171 170, 160 170 C 149 170, 140 162, 140 150 C 140 138, 148 128, 152 122 C 153 128, 158 132, 164 130 C 162 122, 159 114, 160 108 Z"
            fill={spotPink}
            stroke={contour}
            strokeWidth={1.4}
          />
        </g>
      </g>

      {/* --- ACHIEVEMENT PEDESTAL / BASE --- */}
      <g>
        {/* Tier 1 - Top Base Plate */}
        <rect
          x="125"
          y="188"
          width="70"
          height="12"
          rx="3"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        {/* Accent Bar */}
        <rect x="135" y="192" width="50" height="4" rx="2" fill={spotYellow} />

        {/* Tier 2 - Stem */}
        <path
          d="M 140 200 L 135 224 L 185 224 L 180 200 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <line x1="160" y1="202" x2="160" y2="222" stroke={contour} strokeWidth="1" opacity="0.4" />

        {/* Tier 3 - Ground Plinth */}
        <rect
          x="100"
          y="224"
          width="120"
          height="18"
          rx="4"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        <line x1="110" y1="230" x2="210" y2="230" stroke={contour} strokeWidth="1" opacity="0.3" />
      </g>

      {/* --- CELEBRATION RIBBON / BANNER --- */}
      <g transform="translate(0, 10)">
        {/* Left Ribbon Tail */}
        <path
          d="M 75 244 L 95 234 L 95 258 L 75 264 L 83 254 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
        {/* Right Ribbon Tail */}
        <path
          d="M 245 244 L 225 234 L 225 258 L 245 264 L 237 254 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
        {/* Central Ribbon Banner */}
        <rect
          x="90"
          y="232"
          width="140"
          height="24"
          rx="6"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        <text
          x="160"
          y="248"
          textAnchor="middle"
          fill={contour}
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1"
        >
          ACTIVE STREAK
        </text>
      </g>
    </svg>
  );
};

export default StreakMilestoneIllustration;
