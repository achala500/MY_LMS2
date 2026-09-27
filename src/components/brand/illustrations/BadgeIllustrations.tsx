import React from 'react';
import { IllustrationProps } from './types';

/**
 * Streak7DayBadge
 * Motif: 7-day flame emblem with laurel wreath contour.
 */
export function Streak7DayBadge({
  className = '',
  size = 48,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Laurel Wreath */}
      <path
        d="M 50 88 C 30 88 16 72 16 50 C 16 35 24 22 36 16"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M 50 88 C 70 88 84 72 84 50 C 84 35 76 22 64 16"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Laurel leaves (Left) */}
      <path d="M 20 62 C 14 60 16 54 22 56 Z" fill="var(--secondary, #456644)" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
      <path d="M 18 46 C 12 44 15 38 21 41 Z" fill="var(--secondary, #456644)" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
      <path d="M 24 32 C 19 28 24 24 29 28 Z" fill="var(--secondary, #456644)" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />

      {/* Laurel leaves (Right) */}
      <path d="M 80 62 C 86 60 84 54 78 56 Z" fill="var(--secondary, #456644)" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
      <path d="M 82 46 C 88 44 85 38 79 41 Z" fill="var(--secondary, #456644)" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
      <path d="M 76 32 C 81 28 76 24 71 28 Z" fill="var(--secondary, #456644)" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />

      {/* Ribbon bow at base */}
      <path
        d="M 44 88 C 47 85 53 85 56 88 L 60 95 L 53 92 L 50 94 L 47 92 L 40 95 Z"
        fill="var(--primary, #c85a32)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Central Flame Emblem */}
      <path
        d="M 50 20 C 50 20 34 38 34 56 C 34 68 41 76 50 78 C 59 76 66 68 66 56 C 66 38 50 20 50 20 Z"
        fill="var(--primary, #c85a32)"
        fillOpacity="0.15"
        stroke="var(--primary, #c85a32)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M 50 36 C 50 36 41 48 41 58 C 41 65 45 70 50 71 C 55 70 59 65 59 58 C 59 48 50 36 50 36 Z"
        fill="var(--tertiary, #854f00)"
        fillOpacity="0.25"
        stroke="var(--tertiary, #854f00)"
        strokeWidth="1.25"
      />
      <path
        d="M 50 50 C 50 50 46 56 46 62 C 46 65 48 68 50 68 C 52 68 54 65 54 62 C 54 56 50 50 50 50 Z"
        fill="var(--primary, #c85a32)"
      />

      {/* Seven Stars over apex */}
      <circle cx="36" cy="14" r="1" fill="var(--tertiary, #854f00)" />
      <circle cx="43" cy="11" r="1" fill="var(--tertiary, #854f00)" />
      <circle cx="50" cy="10" r="1.5" fill="var(--primary, #c85a32)" />
      <circle cx="57" cy="11" r="1" fill="var(--tertiary, #854f00)" />
      <circle cx="64" cy="14" r="1" fill="var(--tertiary, #854f00)" />
    </svg>
  );
}

/**
 * Streak30DayBadge
 * Motif: 30-day celestial lunar orbit crest with stippled 30-tick rim and constellation stars.
 */
export function Streak30DayBadge({
  className = '',
  size = 48,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Outer 30-day Rim */}
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth={strokeWidth * 0.9} fill="var(--card, #ffffff)" fillOpacity="0.04" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="1.5 6.4" />

      {/* Central Lunar Crescent */}
      <path
        d="M 54 18 C 36 18 22 32 22 50 C 22 68 36 82 54 82 C 43 76 36 64 36 50 C 36 36 43 24 54 18 Z"
        fill="var(--tertiary, #854f00)"
        fillOpacity="0.2"
        stroke="var(--tertiary, #854f00)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx="33" cy="42" r="2.5" fill="none" stroke="var(--tertiary, #854f00)" strokeWidth="0.8" />
      <circle cx="36" cy="58" r="3.5" fill="none" stroke="var(--tertiary, #854f00)" strokeWidth="0.8" />

      {/* Sweeping 30-Day Orbit Ring */}
      <ellipse
        cx="50"
        cy="50"
        rx="44"
        ry="16"
        transform="rotate(-30 50 50)"
        stroke="var(--primary, #c85a32)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Orbiting Satellite Pearl */}
      <circle cx="78" cy="34" r="4" fill="var(--primary, #c85a32)" stroke="currentColor" strokeWidth="1" />
      <circle cx="22" cy="66" r="2.5" fill="var(--tertiary, #854f00)" />

      {/* Night Sky Constellation Sparkles */}
      <path d="M 60 38 L 61 42 L 65 43 L 61 44 L 60 48 L 59 44 L 55 43 L 59 42 Z" fill="var(--tertiary, #854f00)" />
      <path d="M 68 58 L 69 61 L 72 62 L 69 63 L 68 66 L 67 63 L 64 62 L 67 61 Z" fill="var(--primary, #c85a32)" />
    </svg>
  );
}

/**
 * TopRankBadge
 * Motif: Heraldic academic crest with gold star laurel and crossed scholar quills.
 */
export function TopRankBadge({
  className = '',
  size = 48,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Heraldic Shield */}
      <path
        d="M 50 12 L 82 22 V 52 C 82 72 68 86 50 92 C 32 86 18 72 18 52 V 22 Z"
        fill="var(--card, #ffffff)"
        fillOpacity="0.04"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M 50 18 L 76 26 V 51 C 76 68 64 80 50 85 C 36 80 24 68 24 51 V 26 Z"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
        fill="none"
      />

      {/* Five-Point Star Apex */}
      <polygon
        points="50,22 53,29 61,29 55,34 57,42 50,37 43,42 45,34 39,29 47,29"
        fill="var(--tertiary, #854f00)"
        stroke="var(--tertiary, #854f00)"
        strokeWidth="1"
      />

      {/* Crossed Academic Quills */}
      <path
        d="M 32 74 C 42 66 54 50 68 38 C 65 48 56 60 40 70"
        stroke="var(--primary, #c85a32)"
        strokeWidth={strokeWidth}
        fill="var(--primary, #c85a32)"
        fillOpacity="0.15"
        strokeLinecap="round"
      />
      <line x1="32" y1="74" x2="28" y2="78" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth + 0.25} />

      <path
        d="M 68 74 C 58 66 46 50 32 38 C 35 48 44 60 60 70"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="currentColor"
        fillOpacity="0.05"
        strokeLinecap="round"
      />
      <line x1="68" y1="74" x2="72" y2="78" stroke="currentColor" strokeWidth={strokeWidth + 0.25} />

      {/* Open Book Base */}
      <path
        d="M 50 66 C 43 63 36 64 30 67 V 79 C 36 76 43 75 50 78 C 57 75 64 76 70 79 V 67 C 64 64 57 63 50 66 Z"
        fill="var(--card, #ffffff)"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.9}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * SubjectMasterBadge
 * Motif: Triple subject Borromean interlocking rings with ceremonial ribbon tails.
 */
export function SubjectMasterBadge({
  className = '',
  size = 48,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Circular Medallion */}
      <circle cx="50" cy="46" r="36" stroke="currentColor" strokeWidth={strokeWidth} fill="var(--card, #ffffff)" fillOpacity="0.04" />
      <circle cx="50" cy="46" r="32" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 3" />

      {/* Triple Interlocking Subject Rings */}
      {/* Ring 1: Maths/Logic (Top - Terracotta) */}
      <circle
        cx="50"
        cy="36"
        r="14"
        stroke="var(--primary, #c85a32)"
        strokeWidth={strokeWidth + 0.25}
        fill="var(--primary, #c85a32)"
        fillOpacity="0.08"
      />
      {/* Ring 2: Science/Bio (Bottom Left - Sage) */}
      <circle
        cx="40"
        cy="52"
        r="14"
        stroke="var(--secondary, #456644)"
        strokeWidth={strokeWidth + 0.25}
        fill="var(--secondary, #456644)"
        fillOpacity="0.08"
      />
      {/* Ring 3: Commerce/Language (Bottom Right - Ochre) */}
      <circle
        cx="60"
        cy="52"
        r="14"
        stroke="var(--tertiary, #854f00)"
        strokeWidth={strokeWidth + 0.25}
        fill="var(--tertiary, #854f00)"
        fillOpacity="0.08"
      />

      {/* Central Equilibrium Knot Dot */}
      <circle cx="50" cy="47" r="2.5" fill="currentColor" />

      {/* Hanging Ceremonial Ribbons */}
      <path
        d="M 38 78 L 32 96 L 42 91 L 46 96 L 46 80"
        fill="var(--primary, #c85a32)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M 62 78 L 68 96 L 58 91 L 54 96 L 54 80"
        fill="var(--secondary, #456644)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * NightOwlBadge
 * Motif: Nocturnal crescent moon arching over an open scholarly book with watchful owl silhouette.
 */
export function NightOwlBadge({
  className = '',
  size = 48,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth={strokeWidth} fill="currentColor" fillOpacity="0.03" />

      {/* Arching Night Crescent Moon */}
      <path
        d="M 68 18 C 48 18 34 32 34 50 C 34 68 48 82 68 82 C 55 76 46 64 46 50 C 46 36 55 24 68 18 Z"
        fill="var(--tertiary, #854f00)"
        fillOpacity="0.2"
        stroke="var(--tertiary, #854f00)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Nocturnal Open Book */}
      <path
        d="M 50 62 C 40 58 28 60 20 64 V 80 C 28 76 40 74 50 78 C 60 74 72 76 80 80 V 64 C 72 60 60 58 50 62 Z"
        fill="var(--card, #ffffff)"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <line x1="50" y1="62" x2="50" y2="78" stroke="currentColor" strokeWidth={strokeWidth + 0.25} />

      {/* Stylized Owl Face Contour */}
      <path
        d="M 36 54 C 34 46 42 42 46 46 C 48 48 50 49 50 49 C 50 49 52 48 54 46 C 58 42 66 46 64 54"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="43" cy="51" r="3.5" stroke="var(--tertiary, #854f00)" strokeWidth="1.2" fill="var(--tertiary, #854f00)" fillOpacity="0.3" />
      <circle cx="57" cy="51" r="3.5" stroke="var(--tertiary, #854f00)" strokeWidth="1.2" fill="var(--tertiary, #854f00)" fillOpacity="0.3" />
      <polygon points="48,53 52,53 50,57" fill="var(--primary, #c85a32)" />

      {/* Night Sky Stars */}
      <path d="M 26 28 L 27 31 L 30 32 L 27 33 L 26 36 L 25 33 L 22 32 L 25 31 Z" fill="var(--tertiary, #854f00)" />
      <circle cx="74" cy="34" r="1.5" fill="var(--tertiary, #854f00)" />
      <circle cx="32" cy="44" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * EarlyBirdBadge
 * Motif: Morning sun rising over a horizon study desk with dawn rays and soaring swallow.
 */
export function EarlyBirdBadge({
  className = '',
  size = 48,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth={strokeWidth} fill="currentColor" fillOpacity="0.03" />

      {/* Dawn Horizon Line */}
      <line x1="16" y1="62" x2="84" y2="62" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Radiant Rising Sun */}
      <path
        d="M 32 62 A 18 18 0 0 1 68 62 Z"
        fill="var(--primary, #c85a32)"
        fillOpacity="0.2"
        stroke="var(--primary, #c85a32)"
        strokeWidth={strokeWidth}
      />
      <path d="M 40 62 A 10 10 0 0 1 60 62 Z" fill="var(--tertiary, #854f00)" fillOpacity="0.35" />

      {/* 7 Dawn Sunburst Rays */}
      <line x1="24" y1="52" x2="16" y2="48" stroke="var(--tertiary, #854f00)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="30" y1="42" x2="24" y2="34" stroke="var(--tertiary, #854f00)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="39" y1="34" x2="35" y2="24" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="50" y1="30" x2="50" y2="18" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth + 0.25} strokeLinecap="round" />
      <line x1="61" y1="34" x2="65" y2="24" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="70" y1="42" x2="76" y2="34" stroke="var(--tertiary, #854f00)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="76" y1="52" x2="84" y2="48" stroke="var(--tertiary, #854f00)" strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Study Desk Foreground */}
      <rect x="22" y="62" width="56" height="5" rx="1" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth="1.25" />
      {/* Morning Coffee Mug */}
      <rect x="28" y="52" width="7" height="10" rx="1.5" fill="var(--primary, #c85a32)" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
      <path d="M 31 48 C 30 44 33 42 32 38" stroke="var(--primary, #c85a32)" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Open Journal */}
      <path d="M 44 56 L 68 56 L 66 62 L 46 62 Z" stroke="currentColor" strokeWidth="1" fill="var(--card, #ffffff)" />

      {/* Soaring Morning Swallow Bird */}
      <path d="M 68 30 C 72 26 76 28 80 26 C 76 30 73 31 70 33 Z" fill="var(--secondary, #456644)" />
    </svg>
  );
}
