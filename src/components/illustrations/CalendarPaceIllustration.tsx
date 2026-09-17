'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * CalendarPaceIllustration
 * Study rhythms & weekly calendar schedule pace vector.
 * ViewBox: 360x280.
 */
export const CalendarPaceIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-full h-auto',
  size,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size ?? props.width ?? 360;
  const height = size ? (typeof size === 'number' ? (size * 280) / 360 : size) : props.height ?? 280;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 360 280"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Study Calendar Schedule and Weekly Pace Illustration"
      {...props}
    >
      {/* Frame Plate */}
      <rect
        x="10"
        y="10"
        width="340"
        height="260"
        rx="20"
        fill={surface}
        stroke={contour}
        strokeWidth={1}
        opacity="0.2"
      />

      {/* --- AMBIENT CLOUDS & CELESTIAL ELEMENTS (Top Sky) --- */}
      <g className={animated ? 'animate-monoline-cloud' : ''}>
        {/* Soft Planner Cloud */}
        <path
          d="M 60 48 C 60 42, 68 36, 78 38 C 82 30, 94 30, 99 36 C 106 34, 114 40, 112 48 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Second Cloud Right */}
        <path
          d="M 245 42 C 245 36, 252 32, 260 34 C 264 28, 274 28, 278 33 C 284 31, 292 36, 290 42 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </g>

      {/* --- AMBIENT STARS & RHYTHM NODES --- */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 40 70 L 42 75 L 47 76.5 L 42 78 L 40 83 L 38 78 L 33 76.5 L 38 75 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
        <path
          d="M 315 65 L 316.5 70 L 321.5 71.5 L 316.5 73 L 315 78 L 313.5 73 L 308.5 71.5 L 313.5 70 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.8}
        />
        {/* Dawn Sun Symbol */}
        <circle cx="180" cy="40" r="10" fill={spotYellow} stroke={contour} strokeWidth={1.2} />
        <line x1="180" y1="24" x2="180" y2="20" stroke={contour} strokeWidth="1" strokeLinecap="round" />
        <line x1="196" y1="40" x2="200" y2="40" stroke={contour} strokeWidth="1" strokeLinecap="round" />
        <line x1="180" y1="56" x2="180" y2="60" stroke={contour} strokeWidth="1" strokeLinecap="round" />
        <line x1="164" y1="40" x2="160" y2="40" stroke={contour} strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* --- WEEKLY CALENDAR PLANNER DESK LEAF --- */}
      <g transform="translate(45, 65)">
        {/* Back Binder Leaf / Drop Shadow */}
        <rect
          x="6"
          y="6"
          width="260"
          height="175"
          rx="12"
          fill="#f6f2ec"
          stroke={contour}
          strokeWidth={1}
          opacity="0.5"
        />
        {/* Main Calendar Leaf Body */}
        <rect
          x="0"
          y="0"
          width="260"
          height="175"
          rx="12"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />

        {/* Top Header Strip */}
        <path
          d="M 0 12 C 0 5.4, 5.4 0, 12 0 L 248 0 C 254.6 0, 260 5.4, 260 12 L 260 38 L 0 38 Z"
          fill="#fbf7f1"
          stroke={contour}
          strokeWidth={1.2}
        />

        {/* Spiral Binder Rings (5 rings along top edge) */}
        {[35, 85, 130, 175, 225].map((rx) => (
          <g key={rx}>
            <rect x={rx - 4} y="-6" width="8" height="12" rx="4" fill={surface} stroke={contour} strokeWidth={1.3} />
            <line x1={rx} y1="-4" x2={rx} y2="4" stroke={contour} strokeWidth="1" opacity="0.4" />
          </g>
        ))}

        {/* Calendar Month & Pace Header */}
        <text
          x="20"
          y="24"
          fill={contour}
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="11"
          fontWeight="700"
        >
          SEPTEMBER Â· WEEK 37
        </text>
        {/* Weekly hours pill */}
        <rect x="180" y="14" width="65" height="16" rx="8" fill={spotOrange} fillOpacity="0.2" stroke={spotOrange} strokeWidth="1" />
        <text x="212" y="25" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="8" fontWeight="600">
          32h Planned
        </text>

        {/* Day Column Headers (Mon - Sun) */}
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <g key={`head-${i}`} transform={`translate(${16 + i * 33}, 54)`}>
            <text x="14" y="0" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="9" fontWeight="600">
              {day}
            </text>
            <text x="14" y="10" textAnchor="middle" fill={contour} opacity="0.5" fontFamily="JetBrains Mono, monospace" fontSize="7">
              {14 + i}
            </text>
            <line x1="0" y1="16" x2="28" y2="16" stroke={contour} strokeWidth="0.8" opacity="0.2" />
          </g>
        ))}

        {/* Scheduled Study Blocks Across Days */}
        {/* Mon: Combined Maths (morning block) */}
        <rect x="18" y="74" width="26" height="36" rx="3" fill={spotOrange} fillOpacity="0.5" stroke={contour} strokeWidth={1} />
        <line x1="22" y1="82" x2="38" y2="82" stroke={contour} strokeWidth="0.8" />
        <line x1="22" y1="88" x2="34" y2="88" stroke={contour} strokeWidth="0.8" opacity="0.6" />

        {/* Tue: Physics & Chemistry (split blocks) */}
        <rect x="51" y="74" width="26" height="24" rx="3" fill={spotYellow} fillOpacity="0.6" stroke={contour} strokeWidth={1} />
        <rect x="51" y="104" width="26" height="30" rx="3" fill={spotPink} fillOpacity="0.5" stroke={contour} strokeWidth={1} />

        {/* Wed: Deep Focus Marathon (long block) */}
        <rect x="84" y="74" width="26" height="58" rx="3" fill={spotPink} fillOpacity="0.65" stroke={contour} strokeWidth={1} />
        <circle cx="97" cy="85" r="2" fill={surface} />

        {/* Thu: Revision & Past Papers */}
        <rect x="117" y="84" width="26" height="34" rx="3" fill={spotYellow} fillOpacity="0.6" stroke={contour} strokeWidth={1} />
        <rect x="117" y="124" width="26" height="22" rx="3" fill={spotOrange} fillOpacity="0.5" stroke={contour} strokeWidth={1} />

        {/* Fri: Balanced Study */}
        <rect x="150" y="74" width="26" height="42" rx="3" fill={spotOrange} fillOpacity="0.5" stroke={contour} strokeWidth={1} />

        {/* Sat: Model Paper Simulation */}
        <rect x="183" y="74" width="26" height="64" rx="3" fill={spotPink} fillOpacity="0.6" stroke={contour} strokeWidth={1} />
        <line x1="187" y1="82" x2="203" y2="82" stroke={contour} strokeWidth="0.8" />

        {/* Sun: Rest & Cognitive Review */}
        <rect x="216" y="88" width="26" height="28" rx="3" fill={surface} stroke={contour} strokeWidth={1} strokeDasharray="2 2" />
        <text x="229" y="105" textAnchor="middle" fill={contour} opacity="0.7" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="7">
          Rest
        </text>

        {/* Bookmark Silk Ribbon Draped Across Calendar */}
        <path
          d="M 172 0 C 172 40, 165 90, 175 140 C 178 155, 185 170, 188 185 L 194 180 L 200 186 C 196 170, 186 155, 184 140 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </g>

      {/* --- SMALL DESK CHRONOMETER WIDGET (Bottom Right) --- */}
      <g transform="translate(265, 215)">
        <circle cx="16" cy="16" r="14" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <line x1="16" y1="6" x2="16" y2="16" stroke={contour} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="16" x2="23" y2="16" stroke={spotOrange} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill={contour} />
      </g>
    </svg>
  );
};

export default CalendarPaceIllustration;
