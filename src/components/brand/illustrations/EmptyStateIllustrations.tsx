import React from 'react';
import { IllustrationProps } from './types';

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
