'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * StudyClockIllustration
 * Daily stopwatch / focus clock vector with breath pulse and minute ring.
 * ViewBox: 320x320.
 */
export const StudyClockIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-full h-auto',
  size,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size ?? props.width ?? 320;
  const height = size ? (typeof size === 'number' ? size : size) : props.height ?? 320;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 320"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Daily Study Focus Stopwatch Illustration"
      {...props}
    >
      <defs>
        <radialGradient id="clock-face-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={spotYellow} stopOpacity="0.3" />
          <stop offset="80%" stopColor={spotYellow} stopOpacity="0.05" />
          <stop offset="100%" stopColor={spotYellow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Frame Plate */}
      <rect
        x="10"
        y="10"
        width="300"
        height="300"
        rx="24"
        fill={surface}
        stroke={contour}
        strokeWidth={1}
        opacity="0.2"
      />

      {/* --- AMBIENT STARS & TIME RAYS --- */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 52 50 L 54 56 L 60 58 L 54 60 L 52 66 L 50 60 L 44 58 L 50 56 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.9}
        />
        <path
          d="M 270 65 L 271.5 70 L 276.5 71.5 L 271.5 73 L 270 78 L 268.5 73 L 263.5 71.5 L 268.5 70 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.9}
        />
        <circle cx="45" cy="245" r="2" fill={spotOrange} />
        <circle cx="280" cy="240" r="2" fill={spotYellow} />
      </g>

      {/* --- STOPWATCH CROWN & HARDWARE (Top) --- */}
      <g>
        {/* Top Loop / Lanyard Ring */}
        <path
          d="M 140 38 C 140 22, 180 22, 180 38"
          stroke={contour}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Crown Pusher Stem */}
        <rect
          x="152"
          y="34"
          width="16"
          height="14"
          rx="2"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        {/* Crown Knurling Lines */}
        <line x1="156" y1="36" x2="156" y2="46" stroke={contour} strokeWidth="1" />
        <line x1="160" y1="36" x2="160" y2="46" stroke={contour} strokeWidth="1" />
        <line x1="164" y1="36" x2="164" y2="46" stroke={contour} strokeWidth="1" />

        {/* Top-Right Lap Button (45 deg angle) */}
        <g transform="translate(225, 62) rotate(45)">
          <rect x="-6" y="-6" width="12" height="8" rx="2" fill={spotPink} stroke={contour} strokeWidth={1.2} />
        </g>
        {/* Top-Left Reset Button (315 deg angle) */}
        <g transform="translate(95, 62) rotate(-45)">
          <rect x="-6" y="-6" width="12" height="8" rx="2" fill={spotOrange} stroke={contour} strokeWidth={1.2} />
        </g>
      </g>

      {/* --- STOPWATCH CASING & BEZEL --- */}
      <g>
        {/* Outer Heavy Steel Casing */}
        <circle
          cx="160"
          cy="175"
          r="105"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        {/* Bezel Ring Step */}
        <circle
          cx="160"
          cy="175"
          r="98"
          fill="none"
          stroke={contour}
          strokeWidth={1}
          opacity="0.35"
        />
        {/* Inner Dial Face */}
        <circle
          cx="160"
          cy="175"
          r="92"
          fill={surface}
          stroke={contour}
          strokeWidth={1.2}
        />

        {/* Ambient Face Glow */}
        <circle
          cx="160"
          cy="175"
          r="92"
          fill="url(#clock-face-glow)"
          opacity="0.8"
        />
      </g>

      {/* --- MINUTE TRACK & TICK MARKS --- */}
      <g>
        {/* 12 Major Hour/5-Min Ticks around 360 degrees */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="160"
            y1="87"
            x2="160"
            y2="97"
            stroke={contour}
            strokeWidth={deg % 90 === 0 ? 2 : 1.2}
            strokeLinecap="round"
            transform={`rotate(${deg}, 160, 175)`}
          />
        ))}

        {/* Major Dial Numerals (12, 3, 6, 9) */}
        <text x="160" y="112" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12" fontWeight="700">
          60
        </text>
        <text x="238" y="179" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700">
          15
        </text>
        <text x="160" y="252" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700">
          30
        </text>
        <text x="82" y="179" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700">
          45
        </text>

        {/* Active Study Session Progress Arc (from 12 to 5 o'clock = 25 mins) */}
        <path
          d="M 160 102 A 73 73 0 0 1 230 195"
          fill="none"
          stroke={spotOrange}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1 3"
        />
      </g>

      {/* --- SUB-DIAL (30-Minute Focus Register) --- */}
      <g transform="translate(160, 138)">
        <circle cx="0" cy="0" r="22" fill={surface} stroke={contour} strokeWidth="1.2" />
        {[0, 90, 180, 270].map((deg) => (
          <line key={deg} x1="0" y1="-20" x2="0" y2="-16" stroke={contour} strokeWidth="1" transform={`rotate(${deg})`} />
        ))}
        {/* Small sub-dial hand */}
        <line x1="0" y1="0" x2="10" y2="-8" stroke={spotPink} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2" fill={contour} />
      </g>

      {/* --- MAIN CHRONOMETER HANDS --- */}
      <g>
        {/* Minute Hand (pointing towards 25 min mark ~150 deg) */}
        <path
          d="M 160 175 L 195 215"
          stroke={contour}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Hour Hand (pointing towards 10 o'clock ~300 deg) */}
        <path
          d="M 160 175 L 128 152"
          stroke={contour}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Slender Second Hand with Counterweight */}
        <line
          x1="160"
          y1="195"
          x2="160"
          y2="92"
          stroke={spotPink}
          strokeWidth="1.4"
          strokeLinecap="round"
          transform="rotate(35, 160, 175)"
        />
        <circle cx="160" cy="189" r="3" fill={spotPink} transform="rotate(35, 160, 175)" />

        {/* Central Core with Breath Pulse */}
        <g className={animated ? 'animate-monoline-breath' : ''}>
          <circle cx="160" cy="175" r="8" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
          <circle cx="160" cy="175" r="4.5" fill={spotYellow} stroke={contour} strokeWidth={1} />
        </g>
      </g>

      {/* --- RESTING PENCIL & FOCUS NOTE ACCENTS (Bottom Left) --- */}
      <g transform="translate(35, 270) rotate(-15)">
        <rect x="0" y="0" width="70" height="8" rx="2" fill={spotYellow} stroke={contour} strokeWidth="1.2" />
        <path d="M 70 0 L 82 4 L 70 8 Z" fill="#fbeada" stroke={contour} strokeWidth="1.2" />
        <path d="M 78 2.5 L 82 4 L 78 5.5 Z" fill={contour} />
      </g>
    </svg>
  );
};

export default StudyClockIllustration;
