'use client';

import React from 'react';
import { MONOLINE_COLORS, MONOLINE_STROKE, type MonolineIllustrationProps } from './tokens';

/**
 * LandingHeroIllustration
 * Apple HIG & Kinfolk Monoline Atelier Study Space.
 * Features a minimalist architectural study table, angle-poise lamp, open revision notebook,
 * ceramic tea mug, and study clock.
 * ViewBox: 600x450.
 */
export const LandingHeroIllustration: React.FC<MonolineIllustrationProps> = ({
  className = 'w-full h-auto',
  size,
  animated = true,
  strokeWidth = MONOLINE_STROKE.width,
  ...props
}) => {
  const width = size ?? props.width ?? 600;
  const height = size ? (typeof size === 'number' ? (size * 450) / 600 : size) : props.height ?? 450;

  const contour = MONOLINE_COLORS.contour;
  const surface = MONOLINE_COLORS.surface;
  const spotPink = MONOLINE_COLORS.spotPink;
  const spotYellow = MONOLINE_COLORS.spotYellow;
  const spotOrange = MONOLINE_COLORS.spotOrange;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 450"
      fill="none"
      width={width}
      height={height}
      className={`select-none overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="StudySync Monoline Atelier Study Desk Illustration"
      {...props}
    >
      {/* Outer Backdrop Plate */}
      <rect
        x="16"
        y="16"
        width="568"
        height="418"
        rx="24"
        fill="#fbf8f2"
        stroke={contour}
        strokeWidth={1}
        opacity="0.3"
      />

      {/* Subtle Background Horizon Line */}
      <line x1="16" y1="310" x2="584" y2="310" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="16" y1="318" x2="584" y2="318" stroke={contour} strokeWidth="0.8" opacity="0.25" />

      {/* --- 1. ARCHED MONASTERY STUDY WINDOW (Background Right) --- */}
      <g opacity="0.9">
        <path
          d="M 410 70 C 410 40, 520 40, 520 70 L 520 240 L 410 240 Z"
          fill="#faf6f0"
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Window Mullions */}
        <line x1="465" y1="50" x2="465" y2="240" stroke={contour} strokeWidth="1" opacity="0.3" />
        <line x1="410" y1="140" x2="520" y2="140" stroke={contour} strokeWidth="1" opacity="0.3" />

        {/* Dawn Sun in Window */}
        <circle cx="490" cy="95" r="14" fill={spotYellow} opacity="0.35" />
        <circle cx="490" cy="95" r="14" stroke={contour} strokeWidth="1" />
      </g>

      {/* Decorative Star Accent */}
      <g className={animated ? 'animate-monoline-star' : ''}>
        <path
          d="M 370 70 L 373 78 L 381 81 L 373 84 L 370 92 L 367 84 L 359 81 L 367 78 Z"
          fill={spotYellow}
          stroke={contour}
          strokeWidth={1}
        />
      </g>

      {/* --- 2. ANGLE-POISE DESK LAMP (Left) --- */}
      <g className={animated ? 'animate-monoline-lamp' : ''}>
        {/* Weighted Base */}
        <rect x="75" y="300" width="60" height="10" rx="4" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <circle cx="105" cy="300" r="4" fill={spotOrange} stroke={contour} strokeWidth="1" />

        {/* Articulated Lamp Arms */}
        <line x1="105" y1="300" x2="145" y2="200" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />
        <circle cx="145" cy="200" r="4.5" fill={spotOrange} stroke={contour} strokeWidth="1.2" />
        <line x1="145" y1="200" x2="205" y2="145" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />
        <circle cx="205" cy="145" r="4" fill={surface} stroke={contour} strokeWidth="1.2" />

        {/* Conical Shade */}
        <path
          d="M 192 133 L 230 115 L 245 152 L 202 162 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Soft Warm Bulb */}
        <circle cx="215" cy="148" r="5" fill={spotYellow} stroke={contour} strokeWidth="1" />
      </g>

      {/* --- 3. HARDCOVER STUDY BOOKSTACK (Far Left) --- */}
      <g>
        {/* Book 1 (Bottom) */}
        <rect x="70" y="340" width="70" height="15" rx="2" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        <line x1="82" y1="340" x2="82" y2="355" stroke={contour} strokeWidth="1" />

        {/* Book 2 (Middle) */}
        <rect x="73" y="325" width="64" height="15" rx="2" fill="#faf6f0" stroke={contour} strokeWidth={strokeWidth} />
        <line x1="85" y1="325" x2="85" y2="340" stroke={contour} strokeWidth="1" />

        {/* Book 3 (Top) */}
        <rect x="77" y="312" width="56" height="13" rx="2" fill={spotOrange} opacity="0.3" stroke={contour} strokeWidth={strokeWidth} />
        <rect x="77" y="312" width="56" height="13" rx="2" stroke={contour} strokeWidth={strokeWidth} fill="none" />
      </g>

      {/* --- 4. OPEN HARDCOVER REVISION NOTEBOOK (Center) --- */}
      <g>
        {/* Left Page Shadow / Base */}
        <path
          d="M 230 355 C 275 352, 305 348, 310 345 L 310 265 C 305 268, 275 272, 230 275 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Right Page Shadow / Base */}
        <path
          d="M 390 355 C 345 352, 315 348, 310 345 L 310 265 C 315 268, 345 272, 390 275 Z"
          fill={surface}
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Notebook Spine Crease */}
        <line x1="310" y1="265" x2="310" y2="345" stroke={contour} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />

        {/* Subtle Ruled Lines (Left Page) */}
        <line x1="245" y1="285" x2="295" y2="282" stroke={contour} strokeWidth="0.9" opacity="0.4" />
        <line x1="245" y1="298" x2="298" y2="295" stroke={contour} strokeWidth="0.9" opacity="0.4" />
        <line x1="245" y1="311" x2="292" y2="308" stroke={contour} strokeWidth="0.9" opacity="0.4" />
        <line x1="245" y1="324" x2="296" y2="321" stroke={contour} strokeWidth="0.9" opacity="0.4" />

        {/* Subtle Derivation Graph / Lines (Right Page) */}
        <line x1="325" y1="282" x2="375" y2="285" stroke={contour} strokeWidth="0.9" opacity="0.4" />
        <line x1="325" y1="295" x2="375" y2="298" stroke={contour} strokeWidth="0.9" opacity="0.4" />
        {/* Mini bell curve sketch */}
        <path
          d="M 328 325 Q 350 305 372 325"
          fill="none"
          stroke={spotPink}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Brass Bookmark Ribbon */}
        <path
          d="M 310 345 L 310 365 L 315 360 L 320 365 L 320 344"
          fill={spotOrange}
          stroke={contour}
          strokeWidth="1"
        />
      </g>

      {/* --- 5. HOT TEA MUG & RISING STEAM (Center-Right) --- */}
      <g>
        {/* Mug Body */}
        <rect x="415" y="320" width="30" height="34" rx="4" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        {/* Mug Handle */}
        <path
          d="M 445 326 C 454 326, 454 344, 445 344"
          fill="none"
          stroke={contour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Hot Liquid Surface */}
        <ellipse cx="430" cy="320" rx="15" ry="4" fill={spotOrange} opacity="0.25" stroke={contour} strokeWidth="1" />

        {/* Rising Steam Whorls */}
        <g className={animated ? 'animate-monoline-steam' : ''}>
          <path
            d="M 425 312 C 423 306, 427 302, 425 296"
            fill="none"
            stroke={contour}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 434 310 C 432 304, 436 300, 434 294"
            fill="none"
            stroke={contour}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      </g>

      {/* --- 6. MINIMALIST DUAL-BELL STUDY CLOCK (Far Right) --- */}
      <g>
        {/* Clock Feet */}
        <line x1="488" y1="346" x2="483" y2="354" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="512" y1="346" x2="517" y2="354" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Twin Bells & Hammer */}
        <path d="M 483 312 A 7 7 0 0 1 493 306" fill="none" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M 507 306 A 7 7 0 0 1 517 312" fill="none" stroke={contour} strokeWidth={strokeWidth} strokeLinecap="round" />
        <circle cx="500" cy="304" r="2" fill={contour} />

        {/* Clock Main Face */}
        <circle cx="500" cy="328" r="20" fill={surface} stroke={contour} strokeWidth={strokeWidth} />
        {/* Hour & Minute Hands */}
        <line x1="500" y1="328" x2="500" y2="316" stroke={contour} strokeWidth={1.7} strokeLinecap="round" />
        <line x1="500" y1="328" x2="509" y2="328" stroke={spotPink} strokeWidth={1.5} strokeLinecap="round" />
        <circle cx="500" cy="328" r="2.2" fill={contour} />
      </g>
    </svg>
  );
};
