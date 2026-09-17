'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * 1. EmptyLogsIllustration
 * Zero study history logs: open journal notebook, steaming ceramic cup, and succulent desk plant.
 * ViewBox: 200x160.
 */
export const EmptyLogsIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-auto h-auto',
  size = 180,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size;
  const height = typeof size === 'number' ? (size * 160) / 200 : size;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="No Study Logs Illustration"
      {...props}
    >
      {/* Ground Horizon Base */}
      <line x1="15" y1="135" x2="185" y2="135" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Ambient Floating Stars */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 32 30 L 33.5 34 L 37.5 35 L 33.5 36 L 32 40 L 30.5 36 L 26.5 35 L 30.5 34 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
        <path
          d="M 170 38 L 171 42 L 175 43 L 171 44 L 170 48 L 169 44 L 165 43 L 169 42 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.8}
        />
        <circle cx="100" cy="22" r="1.5" fill={spotOrange} />
      </g>

      {/* Open Journal Notebook (Center) */}
      <g transform="translate(42, 60)">
        {/* Left Page */}
        <path
          d="M 58 10 C 38 7, 18 12, 5 18 L 5 70 C 18 64, 38 59, 58 62 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Right Page */}
        <path
          d="M 58 10 C 78 7, 98 12, 111 18 L 111 70 C 98 64, 78 59, 58 62 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Center Spine Crease */}
        <line x1="58" y1="10" x2="58" y2="62" stroke={contour} strokeWidth={1.2} />

        {/* Ribbon Bookmark */}
        <path
          d="M 58 10 C 62 25, 68 45, 64 68 L 68 64 L 72 69 C 70 54, 64 30, 62 10 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.9}
        />

        {/* Ruled Exercise Lines */}
        <line x1="14" y1="28" x2="48" y2="28" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="14" y1="36" x2="44" y2="36" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="14" y1="44" x2="48" y2="44" stroke={contour} strokeWidth="0.8" opacity="0.4" />

        <line x1="68" y1="28" x2="102" y2="28" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="68" y1="36" x2="98" y2="36" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="68" y1="44" x2="92" y2="44" stroke={contour} strokeWidth="0.8" opacity="0.4" />
      </g>

      {/* Steaming Ceramic Tea/Coffee Mug (Right) */}
      <g transform="translate(150, 95)">
        <ellipse cx="14" cy="40" rx="14" ry="3.5" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <path d="M 4 20 L 4 38 C 4 43, 24 43, 24 38 L 24 20 Z" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <ellipse cx="14" cy="20" rx="10" ry="2.5" fill={spotOrange} fillOpacity="0.5" stroke={contour} strokeWidth={1} />
        {/* Handle */}
        <path d="M 24 23 C 30 23, 30 35, 24 35" stroke={contour} strokeWidth={1.3} fill="none" strokeLinecap="round" />

        {/* Steam Path */}
        <g className={animated ? 'animate-monoline-steam' : ''}>
          <path d="M 12 14 C 9 6, 17 4, 13 -4" stroke={spotOrange} strokeWidth={1} strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      </g>

      {/* Desk Succulent Plant (Left) */}
      <g transform="translate(18, 100)">
        <path d="M 4 20 L 7 35 L 21 35 L 24 20 Z" fill={surface} stroke={contour} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <rect x="2" y="17" width="24" height="3" rx="1" fill={spotYellow} stroke={contour} strokeWidth={0.9} />
        <path d="M 14 17 C 9 8, 4 8, 2 13 C 2 16, 8 17, 14 17 Z" fill={surface} stroke={contour} strokeWidth={1} />
        <path d="M 14 17 C 19 8, 24 8, 26 13 C 26 16, 20 17, 14 17 Z" fill={surface} stroke={contour} strokeWidth={1} />
        <path d="M 14 17 C 12 6, 16 6, 14 2 C 12 6, 16 6, 14 17 Z" fill={spotPink} stroke={contour} strokeWidth={1} />
      </g>
    </svg>
  );
};

/**
 * 2. EmptyDailyBlocksIllustration
 * Zero study blocks today: vintage pocket timer, blank daily planner card, and drafting pencil.
 * ViewBox: 200x160.
 */
export const EmptyDailyBlocksIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-auto h-auto',
  size = 160,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size;
  const height = typeof size === 'number' ? (size * 160) / 200 : size;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="No Daily Study Blocks Illustration"
      {...props}
    >
      <line x1="20" y1="135" x2="180" y2="135" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 38 32 L 39.5 36 L 43.5 37 L 39.5 38 L 38 42 L 36.5 38 L 32.5 37 L 36.5 36 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
        <circle cx="165" cy="35" r="1.5" fill={spotPink} />
      </g>

      {/* Blank Agenda Card (Center Left) */}
      <g transform="translate(35, 50)">
        <rect x="0" y="0" width="75" height="85" rx="6" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        {/* Card Header Strip */}
        <rect x="0" y="0" width="75" height="18" rx="6" fill="#faf6f0" stroke={contour} strokeWidth={1} />
        <text x="10" y="12" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="7" fontWeight="700">
          TODAY
        </text>
        {/* Checkbox Placeholder Rows */}
        <rect x="8" y="28" width="8" height="8" rx="2" fill="none" stroke={contour} strokeWidth="1" strokeDasharray="1 1" />
        <line x1="22" y1="32" x2="65" y2="32" stroke={contour} strokeWidth="0.8" opacity="0.35" />

        <rect x="8" y="44" width="8" height="8" rx="2" fill="none" stroke={contour} strokeWidth="1" strokeDasharray="1 1" />
        <line x1="22" y1="48" x2="58" y2="48" stroke={contour} strokeWidth="0.8" opacity="0.35" />

        <rect x="8" y="60" width="8" height="8" rx="2" fill="none" stroke={contour} strokeWidth="1" strokeDasharray="1 1" />
        <line x1="22" y1="64" x2="62" y2="64" stroke={contour} strokeWidth="0.8" opacity="0.35" />
      </g>

      {/* Focus Timer Dial (Right) */}
      <g transform="translate(130, 80)">
        {/* Crown & Ring */}
        <path d="M 0 -38 C -6 -38, -6 -46, 0 -46 C 6 -46, 6 -38, 0 -38" stroke={contour} strokeWidth={1.2} fill="none" />
        <rect x="-4" y="-38" width="8" height="6" fill={surface} stroke={contour} strokeWidth={1.2} />

        {/* Stopwatch Body */}
        <circle cx="0" cy="0" r="34" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <circle cx="0" cy="0" r="30" fill="none" stroke={contour} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5" />

        {/* Active Arc Highlight */}
        <path d="M 0 -30 A 30 30 0 0 1 21 -21" stroke={spotOrange} strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Clock Hands */}
        <line x1="0" y1="0" x2="0" y2="-18" stroke={contour} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="0" x2="12" y2="0" stroke={spotPink} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2.5" fill={contour} />
      </g>

      {/* Resting Drafting Pencil */}
      <g transform="translate(85, 126) rotate(-8)">
        <rect x="0" y="0" width="55" height="6" rx="1.5" fill={spotYellow} stroke={contour} strokeWidth="1.1" />
        <path d="M 55 0 L 63 3 L 55 6 Z" fill="#fbeada" stroke={contour} strokeWidth="1.1" />
        <path d="M 60 2 L 63 3 L 60 4 Z" fill={contour} />
      </g>
    </svg>
  );
};

/**
 * 3. EmptyTestScoresIllustration
 * Zero test scores recorded: unrolled exam scroll with ribbon seal, drafting ruler, and ink well.
 * ViewBox: 200x160.
 */
export const EmptyTestScoresIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-auto h-auto',
  size = 160,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size;
  const height = typeof size === 'number' ? (size * 160) / 200 : size;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="No Test Scores Recorded Illustration"
      {...props}
    >
      <line x1="20" y1="135" x2="180" y2="135" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Ambient Drifting Star */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 162 34 L 163.5 38 L 167.5 39 L 163.5 40 L 162 44 L 160.5 40 L 156.5 39 L 160.5 38 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
        <circle cx="35" cy="40" r="1.5" fill={spotOrange} />
      </g>

      {/* Examination Scroll / Paper Ledger (Center) */}
      <g transform="translate(60, 40)">
        {/* Paper Sheet */}
        <path
          d="M 10 5 L 75 5 C 80 5, 80 15, 75 15 L 5 15 C 0 15, 0 5, 5 5 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />
        <rect x="5" y="15" width="70" height="75" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <path
          d="M 5 90 C 5 95, 15 95, 75 95 C 80 95, 80 85, 75 85 L 5 85"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />

        {/* Scroll Header */}
        <line x1="15" y1="28" x2="55" y2="28" stroke={contour} strokeWidth="1.2" />
        <rect x="58" y="24" width="12" height="6" rx="2" fill={spotPink} fillOpacity="0.4" stroke={spotPink} strokeWidth="0.8" />

        {/* Ledger Rows */}
        <line x1="15" y1="40" x2="65" y2="40" stroke={contour} strokeWidth="0.8" opacity="0.35" />
        <line x1="15" y1="50" x2="60" y2="50" stroke={contour} strokeWidth="0.8" opacity="0.35" />
        <line x1="15" y1="60" x2="65" y2="60" stroke={contour} strokeWidth="0.8" opacity="0.35" />
        <line x1="15" y1="70" x2="50" y2="70" stroke={contour} strokeWidth="0.8" opacity="0.35" />

        {/* Red Ribbon Seal */}
        <circle cx="40" cy="90" r="9" fill={spotPink} stroke={contour} strokeWidth={1.2} />
        <path d="M 37 98 L 33 108 L 40 104 L 47 108 L 43 98 Z" fill={spotPink} stroke={contour} strokeWidth={1} />
      </g>

      {/* Vintage Hourglass (Left) */}
      <g transform="translate(22, 75)">
        <rect x="0" y="0" width="28" height="4" rx="1" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <rect x="0" y="56" width="28" height="4" rx="1" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <path d="M 4 4 C 4 25, 24 35, 14 30 C 4 35, 24 25, 24 4 Z" fill={surface} stroke={contour} strokeWidth={1.2} />
        <path d="M 4 56 C 4 35, 24 25, 14 30 C 4 25, 24 35, 24 56 Z" fill={surface} stroke={contour} strokeWidth={1.2} />
        {/* Sand in base */}
        <path d="M 6 56 C 6 46, 22 46, 22 56 Z" fill={spotYellow} stroke={contour} strokeWidth={0.8} />
      </g>

      {/* Ink Well & Quill (Right) */}
      <g transform="translate(150, 102)">
        <path d="M 4 16 L 2 32 L 26 32 L 24 16 Z" fill={surface} stroke={contour} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <rect x="8" y="12" width="12" height="4" fill={surface} stroke={contour} strokeWidth={1} />
        {/* Feather Quill */}
        <path d="M 14 12 C 18 -8, 28 -22, 34 -36 C 28 -18, 20 -8, 14 12 Z" fill={surface} stroke={contour} strokeWidth={1.2} />
        <line x1="14" y1="12" x2="34" y2="-36" stroke={contour} strokeWidth={0.9} />
      </g>
    </svg>
  );
};

/**
 * 4. EmptyCalendarScheduleIllustration
 * Zero calendar events: blank weekly desk calendar leaf, peaceful cloud, and resting pocket watch.
 * ViewBox: 200x160.
 */
export const EmptyCalendarScheduleIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-auto h-auto',
  size = 160,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size;
  const height = typeof size === 'number' ? (size * 160) / 200 : size;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="No Calendar Events Scheduled Illustration"
      {...props}
    >
      <line x1="20" y1="135" x2="180" y2="135" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Floating Gentle Cloud */}
      <g className={animated ? 'animate-monoline-cloud' : ''}>
        <path
          d="M 30 35 C 30 29, 38 24, 46 26 C 50 18, 62 18, 67 24 C 74 22, 82 28, 80 35 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Star Drift */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 165 30 L 166.5 34 L 170.5 35 L 166.5 36 L 165 40 L 163.5 36 L 159.5 35 L 163.5 34 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
      </g>

      {/* Calendar Desk Leaf (Center) */}
      <g transform="translate(60, 48)">
        <rect x="0" y="0" width="80" height="78" rx="8" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        {/* Header Strip */}
        <path d="M 0 8 C 0 3.6, 3.6 0, 8 0 L 72 0 C 76.4 0, 80 3.6, 80 8 L 80 20 L 0 20 Z" fill="#fcf8f2" stroke={contour} strokeWidth={1} />
        {/* Spiral loops */}
        {[18, 38, 58].map((lx) => (
          <rect key={lx} x={lx - 3} y="-4" width="6" height="8" rx="3" fill={surface} stroke={contour} strokeWidth={1.1} />
        ))}

        {/* Schedule grid dots */}
        {[0, 1, 2, 3].map((row) => (
          <g key={`r-${row}`} transform={`translate(14, ${32 + row * 11})`}>
            <circle cx="0" cy="0" r="1.5" fill={contour} opacity="0.3" />
            <line x1="8" y1="0" x2="52" y2="0" stroke={contour} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.3" />
          </g>
        ))}

        {/* Peaceful Sunday Rest Stamp */}
        <g transform="translate(42, 52) rotate(-8)">
          <rect x="0" y="0" width="32" height="16" rx="3" fill={spotOrange} fillOpacity="0.2" stroke={spotOrange} strokeWidth={0.9} />
          <text x="16" y="11" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="6.5" fontWeight="700">
            OPEN
          </text>
        </g>
      </g>

      {/* Pocket Watch (Left Foreground) */}
      <g transform="translate(35, 105)">
        <circle cx="14" cy="14" r="12" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <circle cx="14" cy="14" r="9.5" fill="none" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="14" y1="14" x2="14" y2="7" stroke={contour} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="14" y1="14" x2="19" y2="14" stroke={spotPink} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="14" cy="14" r="1.5" fill={contour} />
      </g>
    </svg>
  );
};

/**
 * 5. EmptyPastPapersIllustration
 * Zero papers found in vault: open revision archive binder/folder with document tags and paperclip.
 * ViewBox: 200x160.
 */
export const EmptyPastPapersIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-auto h-auto',
  size = 160,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size;
  const height = typeof size === 'number' ? (size * 160) / 200 : size;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="No Past Papers in Vault Illustration"
      {...props}
    >
      <line x1="20" y1="135" x2="180" y2="135" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 160 35 L 161.5 39 L 165.5 40 L 161.5 41 L 160 45 L 158.5 41 L 154.5 40 L 158.5 39 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
        <circle cx="36" cy="48" r="1.5" fill={spotPink} />
      </g>

      {/* Revision Archive Folder / Binder (Center) */}
      <g transform="translate(52, 50)">
        {/* Back Folder Flap */}
        <path
          d="M 0 10 L 32 10 L 40 18 L 96 18 L 96 78 L 0 78 Z"
          fill="#fbf5ee"
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Inner Document Sheets */}
        <rect x="8" y="22" width="76" height="50" rx="3" fill={surface} stroke={contour} strokeWidth={1} />
        <line x1="16" y1="32" x2="52" y2="32" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="16" y1="40" x2="68" y2="40" stroke={contour} strokeWidth="0.8" opacity="0.4" />
        <line x1="16" y1="48" x2="48" y2="48" stroke={contour} strokeWidth="0.8" opacity="0.4" />

        {/* Front Folder Pocket */}
        <path
          d="M 0 34 L 96 34 L 96 82 L 0 82 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
        />

        {/* Index Tag */}
        <rect x="10" y="44" width="28" height="8" rx="4" fill={spotOrange} fillOpacity="0.3" stroke={spotOrange} strokeWidth={0.9} />
        <text x="24" y="50" textAnchor="middle" fill={contour} fontFamily="Plus Jakarta Sans, sans-serif" fontSize="6" fontWeight="700">
          VAULT
        </text>

        {/* Brass Paperclip */}
        <path
          d="M 72 26 L 72 48 C 72 52, 80 52, 80 48 L 80 30 C 80 24, 68 24, 68 30 L 68 44"
          stroke={spotPink}
          strokeWidth={1.3}
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Small Resting Ruler & Pencil */}
      <g transform="translate(135, 126)">
        <rect x="0" y="0" width="42" height="6" rx="1.5" fill={spotYellow} stroke={contour} strokeWidth={1} />
      </g>
    </svg>
  );
};

/**
 * 6. EmptySubmissionsIllustration
 * Zero pending verification submissions: neatly filed tray, certified approval stamp, clean desk.
 * ViewBox: 200x160.
 */
export const EmptySubmissionsIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-auto h-auto',
  size = 160,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size;
  const height = typeof size === 'number' ? (size * 160) / 200 : size;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="All Submissions Reviewed Illustration"
      {...props}
    >
      <line x1="20" y1="135" x2="180" y2="135" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Ambient Drifting Star */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 40 40 L 41.5 44 L 45.5 45 L 41.5 46 L 40 50 L 38.5 46 L 34.5 45 L 38.5 44 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
        <path
          d="M 165 42 L 166.5 46 L 170.5 47 L 166.5 48 L 165 52 L 163.5 48 L 159.5 47 L 163.5 46 Z"
          fill={spotPink}
          stroke={contour}
          strokeWidth={0.8}
        />
      </g>

      {/* Clean Administrative Tray (Center) */}
      <g transform="translate(55, 68)">
        {/* Tray Back */}
        <path d="M 5 0 L 85 0 L 80 18 L 10 18 Z" fill="#f8f4ee" stroke={contour} strokeWidth={1} />
        {/* Single Verified Checklist Sheet */}
        <rect x="14" y="8" width="62" height="42" rx="3" fill={surface} stroke={contour} strokeWidth={1.1} />

        {/* Three Verified Check Items */}
        {[18, 28, 38].map((y, i) => (
          <g key={y}>
            <path d={`M 20 ${y} L 23 ${y + 3} L 28 ${y - 2}`} stroke={spotOrange} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="32" y1={y + 1} x2="68" y2={y + 1} stroke={contour} strokeWidth="0.8" opacity="0.4" />
          </g>
        ))}

        {/* Tray Front Body */}
        <path d="M 0 35 L 90 35 L 85 58 L 5 58 Z" fill={surface} stroke={contour} strokeWidth={strokeWidth} strokeLinejoin="round" />
        <path d="M 30 35 C 30 42, 60 42, 60 35" stroke={contour} strokeWidth={1.2} fill="none" />
      </g>

      {/* Official Approved Rubber Stamp Impression (Right) */}
      <g transform="translate(130, 85) rotate(-12)">
        <circle cx="16" cy="16" r="16" fill="none" stroke={spotPink} strokeWidth="1.8" strokeDasharray="3 2" />
        <path d="M 10 16 L 14 20 L 22 12" stroke={spotPink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Ink Bottle (Left) */}
      <g transform="translate(30, 110)">
        <rect x="0" y="8" width="16" height="16" rx="2" fill={surface} stroke={contour} strokeWidth={1.2} />
        <rect x="4" y="4" width="8" height="4" fill={surface} stroke={contour} strokeWidth={1} />
      </g>
    </svg>
  );
};

/**
 * 7. EmptySearchResultsIllustration
 * Zero search results: magnifying lens over empty ruled index sheet, dashed circular focus ring.
 * ViewBox: 200x160.
 */
export const EmptySearchResultsIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-auto h-auto',
  size = 160,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size;
  const height = typeof size === 'number' ? (size * 160) / 200 : size;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="No Search Results Found Illustration"
      {...props}
    >
      <line x1="20" y1="135" x2="180" y2="135" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 38 35 L 39.5 39 L 43.5 40 L 39.5 41 L 38 45 L 36.5 41 L 32.5 40 L 36.5 39 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={0.8}
        />
        <circle cx="168" cy="40" r="1.5" fill={spotOrange} />
      </g>

      {/* Index Card (Center) */}
      <g transform="translate(50, 45)">
        <rect x="0" y="0" width="100" height="72" rx="6" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        {/* Index Tab */}
        <rect x="0" y="0" width="34" height="12" rx="4" fill="#faf5ee" stroke={contour} strokeWidth={1} />
        <line x1="12" y1="24" x2="88" y2="24" stroke={contour} strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="36" x2="80" y2="36" stroke={contour} strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="48" x2="72" y2="48" stroke={contour} strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="60" x2="84" y2="60" stroke={contour} strokeWidth="0.8" opacity="0.3" />
      </g>

      {/* Inspection Magnifying Glass & Scanning Ring */}
      <g transform="translate(100, 75) rotate(18)">
        {/* Outer Pulsing Target Ring */}
        <circle
          cx="0"
          cy="0"
          r="30"
          fill="none"
          stroke={spotOrange}
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className={animated ? 'animate-monoline-breath' : ''}
        />
        {/* Magnifying Glass Frame */}
        <circle cx="0" cy="0" r="22" fill={surface} fillOpacity="0.4" stroke={contour} strokeWidth={strokeWidth} />
        {/* Lens Glare Curve */}
        <path d="M -12 -8 C -8 -16, 2 -18, 12 -12" stroke={spotYellow} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Question Spark inside glass */}
        <text x="0" y="6" textAnchor="middle" fill={spotPink} fontFamily="Newsreader, serif" fontSize="18" fontStyle="italic" fontWeight="700">
          ?
        </text>

        {/* Handle */}
        <rect x="-3.5" y="22" width="7" height="4" fill={contour} />
        <rect x="-4" y="26" width="8" height="34" rx="4" fill={spotOrange} stroke={contour} strokeWidth={strokeWidth} />
      </g>
    </svg>
  );
};

/**
 * Universal Reusable EmptyState Component
 * Standardizes empty states across StudySync with dedicated monoline illustrations,
 * clear editorial titles, supportive descriptions, and ergonomic action buttons.
 */
export interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  children,
}) => {
  return (
    <div
      className={`py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Illustration Slot */}
      {illustration && (
        <div className="mb-4 flex items-center justify-center hover-monoline-lift transition-transform duration-300">
          {illustration}
        </div>
      )}

      {/* Title */}
      <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Children Slot (custom buttons or inputs) */}
      {children}

      {/* Default Action Button */}
      {actionLabel && onAction && !children && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white font-sans text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
