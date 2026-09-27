import React from 'react';
import { IllustrationProps } from './types';

/**
 * MathsStreamIllustration
 * Motif: Drafting compass, sinusoidal calculus curve with shaded integral area, clean coordinate grid.
 */
export function MathsStreamIllustration({
  className = '',
  size = 200,
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
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Subtle geometric perimeter */}
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="var(--primary, #c85a32)"
        fillOpacity="0.03"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Grid coordinate lines */}
      <g stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.75">
        <line x1="45" y1="45" x2="45" y2="155" />
        <line x1="75" y1="45" x2="75" y2="155" />
        <line x1="105" y1="45" x2="105" y2="155" />
        <line x1="135" y1="45" x2="135" y2="155" />
        <line x1="165" y1="45" x2="165" y2="155" />

        <line x1="35" y1="65" x2="165" y2="65" />
        <line x1="35" y1="95" x2="165" y2="95" />
        <line x1="35" y1="125" x2="165" y2="125" />
      </g>

      {/* Primary Axes */}
      <line x1="35" y1="140" x2="172" y2="140" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 166 137 L 173 140 L 166 143" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="45" y1="155" x2="45" y2="35" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 42 42 L 45 35 L 48 42" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />

      {/* Shaded Integral Area under Gaussian curve */}
      <path
        d="M 45 140 C 70 140 82 68 105 68 C 128 68 140 140 165 140 L 45 140 Z"
        fill="var(--primary, #c85a32)"
        fillOpacity="0.08"
      />

      {/* Calculus Bell Curve */}
      <path
        d="M 45 140 C 70 140 82 68 105 68 C 128 68 140 140 165 140"
        stroke="var(--primary, #c85a32)"
        strokeWidth={strokeWidth + 0.5}
        strokeLinecap="round"
      />

      {/* Extrema point */}
      <circle cx="105" cy="68" r="3.5" fill="var(--primary, #c85a32)" />
      <circle cx="105" cy="68" r="6" stroke="var(--primary, #c85a32)" strokeOpacity="0.3" strokeWidth="1" />

      {/* Drafting Compass */}
      <g>
        {/* Compass Hinge Head */}
        <line x1="145" y1="36" x2="145" y2="44" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <circle cx="145" cy="48" r="4.5" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
        {/* Left Pivot Needle Leg */}
        <line x1="143" y1="52" x2="120" y2="108" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="120" y1="108" x2="119" y2="112" stroke="currentColor" strokeWidth={strokeWidth + 0.25} />
        {/* Right Lead/Pencil Leg */}
        <line x1="147" y1="52" x2="162" y2="92" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M 162 92 L 168 108 L 164 110 L 158 94 Z" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth * 0.8} />
        <polygon points="166,108 170,114 163,110" fill="var(--primary, #c85a32)" />
        {/* Compass Distance Bar & Thumbscrew */}
        <path d="M 132 78 C 142 82 150 81 155 76" stroke="currentColor" strokeWidth="1.2" />
        <rect x="140" y="78" width="4" height="4" rx="1" fill="var(--tertiary, #854f00)" stroke="currentColor" strokeWidth="1" />
      </g>

      {/* Compass Construction Arc */}
      <path
        d="M 102 112 A 28 28 0 0 1 142 112"
        stroke="var(--tertiary, #854f00)"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />

      {/* Mathematical Micro-Annotations */}
      <path
        d="M 38 74 C 41 68 45 69 43 75 L 41 87 C 39 93 43 94 46 88"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      <polygon
        points="155,54 163,68 147,68"
        fill="none"
        stroke="var(--tertiary, #854f00)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * BioStreamIllustration
 * Motif: DNA double helix, botanic leaf silhouette, monolinear laboratory microscope outline.
 */
export function BioStreamIllustration({
  className = '',
  size = 200,
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
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="var(--secondary, #456644)"
        fillOpacity="0.03"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Botanical Leaf Silhouette (Left) */}
      <path
        d="M 46 155 C 46 115 62 82 88 64 C 92 84 82 120 62 144 Z"
        fill="var(--secondary, #456644)"
        fillOpacity="0.1"
        stroke="var(--secondary, #456644)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 50 148 C 64 122 76 96 88 64"
        stroke="var(--secondary, #456644)"
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path d="M 58 126 C 68 124 74 128 78 132" stroke="var(--secondary, #456644)" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M 66 108 C 74 104 80 106 84 110" stroke="var(--secondary, #456644)" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Central DNA Double Helix */}
      <g>
        {/* Base pair cross rungs */}
        <line x1="88" y1="46" x2="108" y2="46" stroke="var(--primary, #c85a32)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="62" x2="102" y2="62" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
        <line x1="84" y1="80" x2="112" y2="80" stroke="var(--tertiary, #854f00)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="98" x2="116" y2="98" stroke="var(--secondary, #456644)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="84" y1="116" x2="112" y2="116" stroke="var(--primary, #c85a32)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="134" x2="102" y2="134" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
        <line x1="88" y1="152" x2="108" y2="152" stroke="var(--secondary, #456644)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Strand Alpha (Sage) */}
        <path
          d="M 98 34 C 114 46 114 66 98 80 C 82 94 82 114 98 128 C 114 142 114 162 98 174"
          stroke="var(--secondary, #456644)"
          strokeWidth={strokeWidth + 0.3}
          strokeLinecap="round"
        />

        {/* Strand Beta (Ink) */}
        <path
          d="M 108 34 C 92 46 92 66 108 80 C 124 94 124 114 108 128 C 92 142 92 162 108 174"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </g>

      {/* Monolinear Microscope Outline (Right) */}
      <g>
        {/* Eyepiece tube */}
        <rect
          x="142"
          y="56"
          width="11"
          height="24"
          rx="2"
          transform="rotate(-28 142 56)"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Body tube and turret */}
        <path d="M 148 76 L 138 95 L 145 98" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {/* Objective lens */}
        <rect
          x="134"
          y="98"
          width="8"
          height="12"
          rx="1.5"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.15"
          stroke="var(--primary, #c85a32)"
          strokeWidth={strokeWidth * 0.8}
        />
        {/* Specimen Stage with Slide */}
        <line x1="124" y1="116" x2="164" y2="116" stroke="currentColor" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
        <rect x="136" y="113" width="14" height="2" fill="var(--secondary, #456644)" />
        {/* Curved Stand Arm */}
        <path
          d="M 156 86 C 172 96 172 126 156 142"
          stroke="currentColor"
          strokeWidth={strokeWidth + 0.5}
          strokeLinecap="round"
        />
        {/* Coarse adjustment knob */}
        <circle cx="163" cy="112" r="4.5" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
        {/* Base plate */}
        <path
          d="M 128 152 L 168 152 C 170 152 172 155 170 157 L 166 164 L 130 164 L 126 157 C 124 155 126 152 128 152 Z"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>

      {/* Floating Micro-organism Petals */}
      <circle cx="145" cy="38" r="6" stroke="var(--secondary, #456644)" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="145" cy="38" r="2" fill="var(--secondary, #456644)" />
      <circle cx="160" cy="46" r="1.5" fill="var(--tertiary, #854f00)" />
    </svg>
  );
}

/**
 * PhysicalScienceIllustration
 * Motif: Electron orbital tracks, optical dispersion prism with emerging spectrum, laboratory Erlenmeyer flask.
 */
export function PhysicalScienceIllustration({
  className = '',
  size = 200,
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
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="var(--primary, #c85a32)"
        fillOpacity="0.02"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Central Atomic Model (Top Left) */}
      <g>
        {/* Dense Nucleus */}
        <circle cx="72" cy="78" r="4.5" fill="var(--primary, #c85a32)" />
        <circle cx="74" cy="76" r="2" fill="var(--tertiary, #854f00)" />
        {/* Orbital Track 1 (horizontal) */}
        <ellipse cx="72" cy="78" rx="36" ry="14" stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeOpacity="0.4" />
        {/* Orbital Track 2 (+60 deg) */}
        <ellipse
          cx="72"
          cy="78"
          rx="36"
          ry="14"
          transform="rotate(60 72 78)"
          stroke="var(--secondary, #456644)"
          strokeWidth={strokeWidth * 0.8}
        />
        {/* Orbital Track 3 (-60 deg) */}
        <ellipse
          cx="72"
          cy="78"
          rx="36"
          ry="14"
          transform="rotate(-60 72 78)"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.8}
        />
        {/* Orbiting Quantum Electrons */}
        <circle cx="108" cy="78" r="2.5" fill="var(--tertiary, #854f00)" />
        <circle cx="54" cy="48" r="2.5" fill="var(--primary, #c85a32)" />
        <circle cx="90" cy="108" r="2.5" fill="var(--secondary, #456644)" />
      </g>

      {/* Optical Dispersion Prism & Spectrum */}
      <g>
        {/* Incident Ray */}
        <line x1="42" y1="106" x2="98" y2="88" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="4 2" strokeLinecap="round" />
        {/* Refraction Prism Triangle */}
        <polygon
          points="120,54 156,116 84,116"
          fill="var(--card, #ffffff)"
          fillOpacity="0.6"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Internal ray path */}
        <line x1="98" y1="88" x2="132" y2="94" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
        {/* Dispersed Spectral Rays */}
        <line x1="132" y1="94" x2="178" y2="82" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="132" y1="94" x2="182" y2="94" stroke="var(--tertiary, #854f00)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="132" y1="94" x2="178" y2="106" stroke="var(--secondary, #456644)" strokeWidth={strokeWidth} strokeLinecap="round" />
      </g>

      {/* Laboratory Flask (Erlenmeyer) */}
      <g>
        {/* Flask Rim & Neck */}
        <line x1="94" y1="116" x2="110" y2="116" stroke="currentColor" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
        <rect x="96" y="116" width="12" height="18" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
        {/* Conical Flask Walls */}
        <path
          d="M 96 134 L 72 170 C 70 173 72 176 76 176 L 128 176 C 132 176 134 173 132 170 L 108 134 Z"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Solution Liquid Wash */}
        <path
          d="M 78 160 C 88 158 112 162 124 160 L 129 174 C 130 175 129 176 127 176 L 75 176 C 73 176 72 175 73 174 Z"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.12"
        />
        {/* Graduated Marks */}
        <line x1="88" y1="150" x2="94" y2="150" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="85" y1="158" x2="92" y2="158" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="81" y1="166" x2="90" y2="166" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        {/* Effervescent reaction bubbles */}
        <circle cx="102" cy="154" r="2" fill="none" stroke="var(--primary, #c85a32)" strokeWidth="1" />
        <circle cx="106" cy="144" r="1.5" fill="none" stroke="var(--tertiary, #854f00)" strokeWidth="1" />
        <circle cx="98" cy="138" r="1" fill="var(--primary, #c85a32)" />
      </g>
    </svg>
  );
}

/**
 * CommerceStreamIllustration
 * Motif: Balanced ledger scales, upward momentum trend curve, architectural column podium.
 */
export function CommerceStreamIllustration({
  className = '',
  size = 200,
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
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="var(--tertiary, #854f00)"
        fillOpacity="0.03"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Architectural Column Podium (Base) */}
      <g>
        <rect x="74" y="162" width="52" height="8" rx="2" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
        <rect x="82" y="126" width="36" height="36" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
        {/* Fluting lines */}
        <line x1="91" y1="129" x2="91" y2="159" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="100" y1="129" x2="100" y2="159" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="109" y1="129" x2="109" y2="159" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <rect x="78" y="118" width="44" height="8" rx="1.5" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
      </g>

      {/* Upward Growth Economic Trend Line (Background) */}
      <path
        d="M 32 136 Q 75 124 110 84 T 172 42"
        stroke="var(--primary, #c85a32)"
        strokeWidth={strokeWidth + 0.25}
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 162 42 L 172 42 L 172 52" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="75" cy="118" r="3" fill="var(--tertiary, #854f00)" />
      <circle cx="110" cy="84" r="3" fill="var(--tertiary, #854f00)" />
      <circle cx="172" cy="42" r="4" fill="var(--primary, #c85a32)" />

      {/* Classical Ledger Scales */}
      <g>
        {/* Central Fulcrum Pillar */}
        <line x1="100" y1="50" x2="100" y2="118" stroke="currentColor" strokeWidth={strokeWidth + 0.75} strokeLinecap="round" />
        {/* Fulcrum Pointer */}
        <polygon points="97,50 103,50 100,42" fill="var(--tertiary, #854f00)" stroke="currentColor" strokeWidth="1" />
        {/* Balance Crossbeam */}
        <path d="M 46 58 L 100 50 L 154 58" stroke="currentColor" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />

        {/* Left Scale Pan (Weights/Coins) */}
        <line x1="46" y1="58" x2="34" y2="92" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="46" y1="58" x2="58" y2="92" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path
          d="M 30 92 C 30 102 62 102 62 92 Z"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Gold Coin Stack */}
        <ellipse cx="46" cy="88" rx="8" ry="3" fill="var(--tertiary, #854f00)" fillOpacity="0.2" stroke="var(--tertiary, #854f00)" strokeWidth="1.2" />
        <ellipse cx="46" cy="84" rx="8" ry="3" fill="var(--tertiary, #854f00)" fillOpacity="0.3" stroke="var(--tertiary, #854f00)" strokeWidth="1.2" />

        {/* Right Scale Pan (Ledger Parchment) */}
        <line x1="154" y1="58" x2="142" y2="92" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="154" y1="58" x2="166" y2="92" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path
          d="M 138 92 C 138 102 170 102 170 92 Z"
          fill="var(--secondary, #456644)"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <rect x="146" y="84" width="16" height="8" rx="1" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/**
 * TechStreamIllustration
 * Motif: Silicon microchip, radiating PCB circuit traces, binary brackets, code syntax tags.
 */
export function TechStreamIllustration({
  className = '',
  size = 200,
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
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="var(--secondary, #456644)"
        fillOpacity="0.03"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Central Silicon Microchip */}
      <g>
        {/* Chip Body */}
        <rect
          x="74"
          y="74"
          width="52"
          height="52"
          rx="6"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth + 0.5}
        />
        {/* Die Core */}
        <rect
          x="84"
          y="84"
          width="32"
          height="32"
          rx="3"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.08"
          stroke="var(--primary, #c85a32)"
          strokeWidth={strokeWidth * 0.9}
        />
        <circle cx="100" cy="100" r="6" stroke="var(--secondary, #456644)" strokeWidth={strokeWidth * 0.9} fill="none" />
        <circle cx="100" cy="100" r="2" fill="var(--primary, #c85a32)" />

        {/* Pin Leads (Uniform Monolinear) */}
        {/* Top pins */}
        <line x1="82" y1="74" x2="82" y2="66" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="91" y1="74" x2="91" y2="66" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="100" y1="74" x2="100" y2="66" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="109" y1="74" x2="109" y2="66" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="118" y1="74" x2="118" y2="66" stroke="currentColor" strokeWidth={strokeWidth} />

        {/* Bottom pins */}
        <line x1="82" y1="126" x2="82" y2="134" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="91" y1="126" x2="91" y2="134" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="100" y1="126" x2="100" y2="134" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="109" y1="126" x2="109" y2="134" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="118" y1="126" x2="118" y2="134" stroke="currentColor" strokeWidth={strokeWidth} />

        {/* Left pins */}
        <line x1="74" y1="82" x2="66" y2="82" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="74" y1="91" x2="66" y2="91" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="74" y1="100" x2="66" y2="100" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="74" y1="109" x2="66" y2="109" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="74" y1="118" x2="66" y2="118" stroke="currentColor" strokeWidth={strokeWidth} />

        {/* Right pins */}
        <line x1="126" y1="82" x2="134" y2="82" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="126" y1="91" x2="134" y2="91" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="126" y1="100" x2="134" y2="100" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="126" y1="109" x2="134" y2="109" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="126" y1="118" x2="134" y2="118" stroke="currentColor" strokeWidth={strokeWidth} />
      </g>

      {/* Radiating PCB Circuit Traces */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Top-Left Bus */}
        <path d="M 82 66 L 82 48 L 54 48" stroke="var(--secondary, #456644)" strokeWidth={strokeWidth} />
        <circle cx="50" cy="48" r="3.5" stroke="var(--secondary, #456644)" strokeWidth={strokeWidth} fill="none" />

        {/* Top-Right Bus */}
        <path d="M 118 66 L 118 52 L 146 52 L 158 40" stroke="currentColor" strokeWidth={strokeWidth * 0.9} />
        <circle cx="158" cy="40" r="2.5" fill="var(--tertiary, #854f00)" />

        {/* Bottom-Right Bus */}
        <path d="M 126 118 L 146 118 L 160 132 L 160 156" stroke="var(--secondary, #456644)" strokeWidth={strokeWidth} />
        <circle cx="160" cy="156" r="3.5" stroke="var(--secondary, #456644)" strokeWidth={strokeWidth} fill="none" />

        {/* Bottom-Left Bus */}
        <path d="M 66 118 L 48 118 L 38 128 L 38 152" stroke="currentColor" strokeWidth={strokeWidth * 0.9} />
        <circle cx="38" cy="152" r="2.5" fill="var(--primary, #c85a32)" />
      </g>

      {/* Code Syntax Tags & Terminal Motifs */}
      <path d="M 36 90 L 26 100 L 36 110" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 164 90 L 174 100 L 164 110" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Terminal prompt cursor */}
      <path d="M 88 154 L 94 158 L 88 162" stroke="var(--tertiary, #854f00)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="98" y1="162" x2="108" y2="162" stroke="var(--tertiary, #854f00)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
