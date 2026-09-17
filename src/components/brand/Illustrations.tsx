import React from 'react';

/**
 * StudySync Authoritative Monolinear Vector Illustration System
 * 
 * Aesthetic: Claude & Notion-inspired editorial monolinear line art.
 * Visual Tokens:
 *  - Primary Ink: currentColor / var(--muted-foreground, #2d2420) (Light) and #a69f98 (Dark)
 *  - Primary Accent (Terracotta / Rust): var(--primary, #c85a32)
 *  - Secondary Accent (Sage Olive): var(--secondary, #456644)
 *  - Tertiary Accent (Muted Amber / Ochre): var(--tertiary, #854f00)
 *  - Monolinear Stroke: 1.5px - 2px uniform stroke with round caps and joins
 *  - Translucent Fills: Delicate 6% - 15% opacity tint washes
 */

export interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  strokeWidth?: number;
}

/* ==========================================================================
   1. FIVE SUBJECT STREAM ILLUSTRATIONS (viewBox: 0 0 200 200)
   ========================================================================== */

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

/* ==========================================================================
   2. FIVE EMPTY STATE ILLUSTRATIONS (viewBox: 0 0 200 160)
   ========================================================================== */

/**
 * EmptyLogsIllustration
 * Motif: Mindful study desk, open journal notebook, steaming ceramic cup, desk succulent.
 */
export function EmptyLogsIllustration({
  className = '',
  size = 180,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? (typeof size === 'number' ? (size * 160) / 200 : size);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Desk Horizon Surface */}
      <line x1="20" y1="130" x2="180" y2="130" stroke="currentColor" strokeOpacity="0.2" strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Open Scholar Notebook */}
      <g>
        {/* Left Open Page */}
        <path
          d="M 100 62 C 84 60 64 62 46 68 C 43 69 42 71 42 74 L 42 122 C 64 116 84 115 100 118 Z"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Right Open Page */}
        <path
          d="M 100 62 C 116 60 136 62 154 68 C 157 69 158 71 158 74 L 158 122 C 136 116 116 115 100 118 Z"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Center Spine Crease */}
        <line x1="100" y1="62" x2="100" y2="118" stroke="currentColor" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />

        {/* Ruled lines on Left Page */}
        <line x1="52" y1="80" x2="88" y2="78" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="52" y1="90" x2="88" y2="88" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="52" y1="100" x2="88" y2="98" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="52" y1="110" x2="76" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />

        {/* Ruled lines on Right Page */}
        <line x1="112" y1="78" x2="148" y2="80" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="112" y1="88" x2="148" y2="90" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="112" y1="98" x2="148" y2="100" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="112" y1="108" x2="136" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />

        {/* Ribbon Bookmark */}
        <path
          d="M 100 118 C 105 127 111 130 118 134 L 122 128 L 116 124 C 109 122 104 118 100 118 Z"
          fill="var(--primary, #c85a32)"
          stroke="var(--primary, #c85a32)"
          strokeWidth="1"
        />

        {/* Resting Fountain Pen */}
        <line x1="72" y1="48" x2="124" y2="48" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <polygon points="124,46 132,48 124,50" fill="var(--tertiary, #854f00)" stroke="currentColor" strokeWidth="1" />
        <line x1="82" y1="46" x2="82" y2="43" stroke="currentColor" strokeWidth="1.2" />
      </g>

      {/* Steaming Ceramic Tea/Coffee Mug (Right) */}
      <g>
        <path
          d="M 160 94 L 162 120 C 162 125 178 125 178 120 L 180 94 Z"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path d="M 179 98 C 186 98 186 114 178 114" stroke="currentColor" strokeWidth={strokeWidth * 0.9} fill="none" />
        <ellipse cx="170" cy="124" rx="14" ry="3" stroke="currentColor" strokeWidth="1.2" />
        {/* Steam Wisps */}
        <path
          d="M 166 88 C 164 82 168 78 166 72"
          stroke="var(--primary, #c85a32)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 174 86 C 176 80 172 76 174 70"
          stroke="var(--primary, #c85a32)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
          fill="none"
        />
      </g>

      {/* Mindful Desk Succulent Plant (Left) */}
      <g>
        <polygon
          points="24,110 38,110 36,128 26,128"
          fill="var(--tertiary, #854f00)"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M 31 110 C 23 100 27 88 31 88 C 35 88 39 100 31 110 Z"
          fill="var(--secondary, #456644)"
          fillOpacity="0.25"
          stroke="var(--secondary, #456644)"
          strokeWidth={strokeWidth}
        />
        <path
          d="M 31 106 C 38 100 46 104 44 110 Z"
          fill="var(--secondary, #456644)"
          stroke="var(--secondary, #456644)"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}

/**
 * EmptyTestsIllustration
 * Motif: Unrolled exam paper scroll with ribbon bookmark, vintage sand hourglass, inkwell quill.
 */
export function EmptyTestsIllustration({
  className = '',
  size = 180,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? (typeof size === 'number' ? (size * 160) / 200 : size);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <line x1="25" y1="132" x2="175" y2="132" stroke="currentColor" strokeOpacity="0.15" strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Unrolled Examination Scroll */}
      <g>
        {/* Top Scroll Curl */}
        <ellipse cx="68" cy="40" rx="22" ry="7" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
        {/* Parchment Body */}
        <path
          d="M 46 40 L 46 116 C 46 122 90 122 90 116 L 90 40"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Bottom Scroll Roll */}
        <path
          d="M 46 116 C 46 124 90 124 90 116 C 90 110 50 110 46 116 Z"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Exam Heading */}
        <line x1="56" y1="56" x2="80" y2="56" stroke="var(--primary, #c85a32)" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
        {/* Questions Lines */}
        <line x1="56" y1="68" x2="82" y2="68" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="56" y1="78" x2="78" y2="78" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.25" strokeLinecap="round" />
        {/* Assessment Checkmark */}
        <rect x="56" y="88" width="7" height="7" rx="1.5" stroke="var(--secondary, #456644)" strokeWidth="1.25" fill="none" />
        <path d="M 57 91 L 60 93 L 64 89" stroke="var(--secondary, #456644)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Corner Bookmark Ribbon */}
        <path d="M 74 34 L 86 34 L 86 52 L 80 48 L 74 52 Z" fill="var(--primary, #c85a32)" />
      </g>

      {/* Precision Sand Hourglass */}
      <g>
        {/* Wooden Plates */}
        <rect x="122" y="44" width="40" height="6" rx="2" fill="var(--tertiary, #854f00)" fillOpacity="0.2" stroke="currentColor" strokeWidth={strokeWidth} />
        <rect x="122" y="122" width="40" height="6" rx="2" fill="var(--tertiary, #854f00)" fillOpacity="0.2" stroke="currentColor" strokeWidth={strokeWidth} />
        {/* Structural Rails */}
        <line x1="126" y1="50" x2="126" y2="122" stroke="currentColor" strokeWidth="1.25" />
        <line x1="158" y1="50" x2="158" y2="122" stroke="currentColor" strokeWidth="1.25" />
        {/* Glass Vessel */}
        <path
          d="M 128 50 C 128 78 138 84 142 86 C 138 88 128 94 128 122 L 156 122 C 156 94 146 88 142 86 C 146 84 156 78 156 50 Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Upper Sand Reservoir */}
        <path d="M 132 64 C 134 76 140 82 142 84 C 144 82 150 76 152 64 Z" fill="var(--tertiary, #854f00)" fillOpacity="0.4" />
        {/* Flowing Grains */}
        <line x1="142" y1="86" x2="142" y2="108" stroke="var(--tertiary, #854f00)" strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Lower Sand Mound */}
        <path d="M 134 122 C 136 114 148 114 150 122 Z" fill="var(--tertiary, #854f00)" fillOpacity="0.5" />
      </g>

      {/* Inkwell and Academic Quill */}
      <g>
        <rect x="98" y="112" width="14" height="18" rx="2.5" fill="var(--card, #ffffff)" stroke="currentColor" strokeWidth={strokeWidth} />
        <line x1="98" y1="117" x2="112" y2="117" stroke="currentColor" strokeWidth="1" />
        {/* Quill */}
        <path
          d="M 105 112 C 102 94 108 72 118 56 C 114 70 111 84 105 104"
          stroke="var(--primary, #c85a32)"
          strokeWidth={strokeWidth}
          fill="var(--primary, #c85a32)"
          fillOpacity="0.12"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * EmptyCalendarIllustration
 * Motif: Desk planner calendar with monthly grid, gentle drifting foliage leaf, clean time markers.
 */
export function EmptyCalendarIllustration({
  className = '',
  size = 180,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? (typeof size === 'number' ? (size * 160) / 200 : size);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <line x1="20" y1="134" x2="180" y2="134" stroke="currentColor" strokeOpacity="0.15" strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Standing Desk Calendar */}
      <g>
        {/* Calendar Plinth Backstand */}
        <path d="M 42 128 L 34 134 L 166 134 L 158 128" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Main Calendar Page Face */}
        <path
          d="M 48 48 L 152 48 L 158 128 L 42 128 Z"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Spiral Binder Coils */}
        {[56, 72, 88, 104, 120, 136, 144].map((x) => (
          <path
            key={x}
            d={`M ${x} 42 C ${x} 38 ${x + 4} 38 ${x + 4} 48`}
            stroke="var(--primary, #c85a32)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {/* Header Ribbon Band */}
        <path d="M 48 58 L 152 58" stroke="var(--primary, #c85a32)" strokeWidth="3" strokeLinecap="round" />
        <line x1="75" y1="53" x2="125" y2="53" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />

        {/* Month Day Cells */}
        <g stroke="currentColor" strokeOpacity="0.2" strokeWidth="1">
          <rect x="56" y="68" width="18" height="14" rx="2" fill="none" />
          <rect x="80" y="68" width="18" height="14" rx="2" fill="none" />
          <rect x="104" y="68" width="18" height="14" rx="2" fill="none" />
          <rect x="128" y="68" width="18" height="14" rx="2" fill="none" />

          <rect x="56" y="88" width="18" height="14" rx="2" fill="none" />
          {/* Highlighted Today Cell */}
          <rect x="80" y="88" width="18" height="14" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.12" stroke="var(--primary, #c85a32)" strokeWidth="1.5" />
          <path d="M 85 95 L 88 97 L 94 91" stroke="var(--primary, #c85a32)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          <rect x="104" y="88" width="18" height="14" rx="2" fill="none" />
          <rect x="128" y="88" width="18" height="14" rx="2" fill="none" />

          <rect x="56" y="108" width="18" height="14" rx="2" fill="none" />
          <rect x="80" y="108" width="18" height="14" rx="2" fill="none" />
          <rect x="104" y="108" width="18" height="14" rx="2" fill="none" />
          <rect x="128" y="108" width="18" height="14" rx="2" fill="none" />
        </g>
      </g>

      {/* Gentle Floating Foliage / Ginkgo Leaf */}
      <g>
        {/* Soft Breeze Gust */}
        <path
          d="M 25 76 C 45 62 70 86 100 72 C 130 58 156 72 176 62"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.25"
          fill="none"
        />
        {/* Floating Sage Leaf */}
        <path
          d="M 154 62 C 164 54 176 60 170 72 C 162 76 154 70 154 62 Z"
          fill="var(--secondary, #456644)"
          fillOpacity="0.2"
          stroke="var(--secondary, #456644)"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <line x1="170" y1="72" x2="176" y2="78" stroke="var(--secondary, #456644)" strokeWidth="1.25" strokeLinecap="round" />
        {/* Tiny Falling Amber Leaf */}
        <path
          d="M 126 108 C 130 102 138 106 135 113 C 130 115 126 112 126 108 Z"
          fill="var(--tertiary, #854f00)"
          fillOpacity="0.2"
          stroke="var(--tertiary, #854f00)"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}

/**
 * EmptySearchIllustration
 * Motif: Sleek magnifying glass focusing on an ancient scholarly manuscript with discovery starburst.
 */
export function EmptySearchIllustration({
  className = '',
  size = 180,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? (typeof size === 'number' ? (size * 160) / 200 : size);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Background Ancient Codex Folio */}
      <g>
        <rect
          x="36"
          y="32"
          width="128"
          height="96"
          rx="4"
          fill="var(--card, #ffffff)"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Folded Dog-ear Corner */}
        <polygon
          points="144,32 164,52 144,52"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.8}
        />
        <line x1="60" y1="40" x2="60" y2="120" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

        {/* Text Lines */}
        <rect x="42" y="44" width="14" height="14" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.18" stroke="var(--primary, #c85a32)" strokeWidth="1.2" />
        <line x1="68" y1="48" x2="132" y2="48" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="68" y1="56" x2="122" y2="56" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="42" y1="68" x2="136" y2="68" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="42" y1="78" x2="128" y2="78" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="42" y1="88" x2="134" y2="88" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="42" y1="98" x2="108" y2="98" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="42" y1="108" x2="122" y2="108" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" strokeLinecap="round" />
      </g>

      {/* Sleek Monolinear Magnifying Glass */}
      <g>
        {/* Lens Rim */}
        <circle
          cx="108"
          cy="82"
          r="34"
          fill="var(--card, #ffffff)"
          fillOpacity="0.8"
          stroke="var(--tertiary, #854f00)"
          strokeWidth={strokeWidth + 0.75}
        />
        {/* Optical Glass Glint */}
        <path
          d="M 88 64 C 95 58 108 58 116 62"
          stroke="var(--tertiary, #854f00)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Handle Joint */}
        <rect
          x="132"
          y="106"
          width="8"
          height="6"
          rx="1"
          transform="rotate(45 132 106)"
          fill="var(--tertiary, #854f00)"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.8}
        />
        {/* Wooden Handle */}
        <line x1="136" y1="110" x2="168" y2="142" stroke="currentColor" strokeWidth={strokeWidth + 1.25} strokeLinecap="round" />

        {/* Magnified Academic Glyph */}
        <path
          d="M 96 92 L 108 68 L 120 92 M 100 85 L 116 85"
          stroke="var(--primary, #c85a32)"
          strokeWidth={strokeWidth + 0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Discovery Starburst Sparkles */}
      <path
        d="M 78 62 L 80 56 L 82 62 L 88 64 L 82 66 L 80 72 L 78 66 L 72 64 Z"
        fill="var(--tertiary, #854f00)"
      />
      <circle cx="142" cy="68" r="2.5" fill="var(--primary, #c85a32)" />
    </svg>
  );
}

/**
 * GeneralEmptyIllustration
 * Motif: Minimalist archive shelf with stacked scholarly folios, folded document, ceramic dry bud vase.
 */
export function GeneralEmptyIllustration({
  className = '',
  size = 180,
  width,
  height,
  strokeWidth = 1.75,
  ...props
}: IllustrationProps) {
  const w = width ?? size;
  const h = height ?? (typeof size === 'number' ? (size * 160) / 200 : size);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Wall Shelf */}
      <rect
        x="24"
        y="112"
        width="152"
        height="8"
        rx="2"
        fill="var(--card, #ffffff)"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* Shelf Wall Brackets */}
      <path d="M 44 120 L 44 136 L 56 120" stroke="currentColor" strokeWidth={strokeWidth * 0.9} fill="none" strokeLinejoin="round" />
      <path d="M 156 120 L 156 136 L 144 120" stroke="currentColor" strokeWidth={strokeWidth * 0.9} fill="none" strokeLinejoin="round" />

      {/* Stacked Archival Books (Left) */}
      <g>
        {/* Book 1 */}
        <rect
          x="42"
          y="62"
          width="12"
          height="50"
          rx="2"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <line x1="48" y1="74" x2="48" y2="98" stroke="var(--primary, #c85a32)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Book 2 */}
        <rect
          x="56"
          y="70"
          width="10"
          height="42"
          rx="2"
          fill="var(--secondary, #456644)"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />

        {/* Tilted Book 3 */}
        <rect
          x="68"
          y="76"
          width="10"
          height="40"
          rx="2"
          transform="rotate(14 68 76)"
          fill="var(--tertiary, #854f00)"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Open Folded Parchment Document (Center) */}
      <path
        d="M 88 112 L 96 82 L 112 88 L 120 78 L 128 112 Z"
        fill="var(--card, #ffffff)"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <line x1="102" y1="92" x2="114" y2="96" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.25" strokeLinecap="round" />

      {/* Artisanal Bud Vase with Dried Botanical Branch (Right) */}
      <g>
        <path
          d="M 148 112 L 144 98 C 142 94 145 90 148 90 L 150 90 C 153 90 156 94 154 98 L 150 112 Z"
          fill="var(--primary, #c85a32)"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Botanical stem */}
        <path
          d="M 149 90 C 150 76 158 66 154 50"
          stroke="var(--secondary, #456644)"
          strokeWidth={strokeWidth * 0.9}
          fill="none"
          strokeLinecap="round"
        />
        {/* Dried seed buds */}
        <circle cx="154" cy="50" r="3" fill="var(--secondary, #456644)" />
        <circle cx="151" cy="62" r="2.5" fill="var(--tertiary, #854f00)" />
        <circle cx="156" cy="72" r="2" fill="var(--secondary, #456644)" />
      </g>
    </svg>
  );
}

/* ==========================================================================
   3. SIX ACHIEVEMENT / MILESTONE BADGES (viewBox: 0 0 100 100)
   ========================================================================== */

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

/* ==========================================================================
   4. BACKWARD COMPATIBILITY EXPORTS (Upgraded to Kinfolk Tokens)
   ========================================================================== */

/** Abstract book/knowledge icon — layered pages with a warm accent */
export function IllustrationStudy({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="24" y="20" width="72" height="88" rx="4" fill="currentColor" opacity="0.06" />
      <rect x="28" y="16" width="72" height="88" rx="4" fill="currentColor" opacity="0.1" />
      <rect x="32" y="12" width="72" height="88" rx="4" fill="currentColor" opacity="0.05" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
      <line x1="44" y1="32" x2="88" y2="32" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
      <line x1="44" y1="42" x2="80" y2="42" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" strokeLinecap="round" />
      <line x1="44" y1="52" x2="84" y2="52" stroke="currentColor" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" />
      <line x1="44" y1="62" x2="72" y2="62" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1" strokeLinecap="round" />
      <path d="M82 12V36L88 30L94 36V12" fill="var(--primary, #c85a32)" fillOpacity="0.8" />
    </svg>
  );
}

/** Abstract clock/countdown — concentric rings with a sweeping hand */
export function IllustrationCountdown({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" />
      <circle cx="60" cy="60" r="28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" />
      <circle cx="60" cy="60" r="38" stroke="var(--primary, #c85a32)" strokeWidth="2.5" strokeOpacity="0.6"
        strokeLinecap="round" strokeDasharray="180 239" transform="rotate(-90 60 60)" />
      <line x1="60" y1="60" x2="60" y2="30" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="60" y1="60" x2="78" y2="46" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
      <circle cx="60" cy="60" r="3" fill="var(--primary, #c85a32)" fillOpacity="0.8" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <circle key={angle} cx={60 + 44 * Math.cos((angle - 90) * Math.PI / 180)} cy={60 + 44 * Math.sin((angle - 90) * Math.PI / 180)} r="1.5" fill="currentColor" fillOpacity="0.15" />
      ))}
    </svg>
  );
}

/** Abstract shield/security — layered shield with a checkmark */
export function IllustrationSecurity({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M60 14L96 32V60C96 80 80 98 60 106C40 98 24 80 24 60V32L60 14Z"
        fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <path d="M60 24L86 38V60C86 76 74 90 60 96C46 90 34 76 34 60V38L60 24Z"
        fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" />
      <path d="M44 60L54 72L76 48" stroke="var(--primary, #c85a32)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
    </svg>
  );
}

/** Abstract ID card — minimalist card with chip and lines */
export function IllustrationIdCard({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="14" y="28" width="92" height="64" rx="6" fill="currentColor" fillOpacity="0.05"
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" />
      <rect x="24" y="40" width="16" height="12" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.5" />
      <line x1="28" y1="40" x2="28" y2="52" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="32" y1="40" x2="32" y2="52" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="36" y1="40" x2="36" y2="52" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="24" y1="46" x2="40" y2="46" stroke="var(--primary, #c85a32)" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="24" y1="64" x2="64" y2="64" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
      <line x1="24" y1="74" x2="52" y2="74" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.12" strokeLinecap="round" />
      <rect x="76" y="44" width="22" height="22" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <rect x="80" y="48" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="88" y="48" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="80" y="56" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="88" y="56" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}

/** Abstract chart/analytics — rising bars with trend line */
export function IllustrationAnalytics({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <line x1="20" y1="96" x2="100" y2="96" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      <line x1="20" y1="76" x2="100" y2="76" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.06" />
      <line x1="20" y1="56" x2="100" y2="56" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.06" />
      <line x1="20" y1="36" x2="100" y2="36" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.06" />
      <rect x="26" y="72" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.08" />
      <rect x="42" y="58" width="10" height="38" rx="2" fill="currentColor" fillOpacity="0.1" />
      <rect x="58" y="48" width="10" height="48" rx="2" fill="currentColor" fillOpacity="0.12" />
      <rect x="74" y="38" width="10" height="58" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.25" />
      <rect x="90" y="28" width="10" height="68" rx="2" fill="var(--primary, #c85a32)" fillOpacity="0.4" />
      <path d="M31 70 L47 56 L63 46 L79 36 L95 26" stroke="var(--primary, #c85a32)" strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="95" cy="26" r="3" fill="var(--primary, #c85a32)" fillOpacity="0.8" />
    </svg>
  );
}

/** Abstract flame/streak — stylized fire icon */
export function IllustrationStreak({ className = '', size = 120 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M60 16C60 16 40 44 40 68C40 82 48 96 60 100C72 96 80 82 80 68C80 44 60 16 60 16Z"
        fill="var(--primary, #c85a32)" fillOpacity="0.12" stroke="var(--primary, #c85a32)" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M60 40C60 40 50 56 50 70C50 78 54 86 60 90C66 86 70 78 70 70C70 56 60 40 60 40Z"
        fill="var(--primary, #c85a32)" fillOpacity="0.25" />
      <path d="M60 58C60 58 56 66 56 74C56 78 58 82 60 84C62 82 64 78 64 74C64 66 60 58 60 58Z"
        fill="var(--primary, #c85a32)" fillOpacity="0.6" />
    </svg>
  );
}
