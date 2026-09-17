/**
 * Adversarial Empirical Stress Test Suite for Milestone 1
 * challenger_m1_2
 * 
 * Verifies:
 * 1. globals.css token completeness (20 standard vars + 3 extensions in :root and .dark)
 * 2. WCAG Contrast ratios across all color token pairs in light and dark modes
 * 3. 6 Animation keyframes (aurora-1 through 4, pulseGlow, shimmer)
 * 4. prefers-reduced-motion accessibility query coverage
 * 5. Typography font loading & fallback chains in globals.css, layout.tsx, and tailwind.config.ts
 * 6. Static export configuration and build contract
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve('.');

// Helper: parse hex color to [r, g, b] (0..1)
function parseHex(hex) {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

// Helper: sRGB to linear luminance component
function toLinear(c) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Relative luminance per WCAG 2.1
function getLuminance([r, g, b]) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// WCAG Contrast Ratio
function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(parseHex(hex1));
  const l2 = getLuminance(parseHex(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Challenger M1 Adversarial Stress Test Suite', () => {

  const globalsPath = path.join(PROJECT_ROOT, 'src', 'app', 'globals.css');
  const globalsContent = fs.readFileSync(globalsPath, 'utf-8');

  // Extract :root block and .dark block
  const rootMatch = globalsContent.match(/:root\s*\{([^}]+)\}/);
  assert.ok(rootMatch, ':root block must exist in globals.css');
  const rootBlock = rootMatch[1];

  const darkMatch = globalsContent.match(/\.dark\s*\{([^}]+)\}/);
  assert.ok(darkMatch, '.dark block must exist in globals.css');
  const darkBlock = darkMatch[1];

  function extractVars(block) {
    const vars = {};
    const regex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
    let m;
    while ((m = regex.exec(block)) !== null) {
      vars[m[1].trim()] = m[2].trim();
    }
    return vars;
  }

  const rootVars = extractVars(rootBlock);
  const darkVars = extractVars(darkBlock);

  // =========================================================================
  // 1. CSS Variables Completeness & Value Integrity
  // =========================================================================
  describe('1. CSS Tokens Invariants in :root and .dark', () => {
    const required20Vars = [
      '--background',
      '--foreground',
      '--card',
      '--card-foreground',
      '--popover',
      '--popover-foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--tertiary',
      '--tertiary-foreground',
      '--muted',
      '--muted-foreground',
      '--accent',
      '--accent-foreground',
      '--destructive',
      '--destructive-foreground',
      '--border',
      '--input',
    ];

    const extendedVars = ['--ring', '--radius', '--success'];

    it('should define all 20 standard CSS variables in :root', () => {
      for (const v of required20Vars) {
        assert.ok(rootVars[v] !== undefined, `:root missing standard variable: ${v}`);
        assert.ok(rootVars[v].length > 0, `:root variable ${v} must have a non-empty value`);
      }
    });

    it('should define all 20 standard CSS variables in .dark', () => {
      for (const v of required20Vars) {
        assert.ok(darkVars[v] !== undefined, `.dark missing standard variable: ${v}`);
        assert.ok(darkVars[v].length > 0, `.dark variable ${v} must have a non-empty value`);
      }
    });

    it('should define extended variables (--ring, --radius, --success) in both scopes', () => {
      for (const v of extendedVars) {
        assert.ok(rootVars[v] !== undefined, `:root missing extended variable: ${v}`);
        assert.ok(darkVars[v] !== undefined, `.dark missing extended variable: ${v}`);
      }
      assert.strictEqual(rootVars['--radius'], '0.75rem', ':root --radius must be 0.75rem');
      assert.strictEqual(darkVars['--radius'], '0.75rem', '.dark --radius must be 0.75rem');
    });

    it('should match authoritative Kinfolk Academic token values in :root', () => {
      assert.strictEqual(rootVars['--background'], '#fef8f4', 'Light canvas must be #fef8f4');
      assert.strictEqual(rootVars['--foreground'], '#1d1b19', 'Light text must be #1d1b19');
      assert.strictEqual(rootVars['--card'], '#ffffff', 'Light card must be #ffffff');
      assert.strictEqual(rootVars['--card-foreground'], '#1d1b19', 'Light card text must be #1d1b19');
      assert.strictEqual(rootVars['--primary'], '#c85a32', 'Light primary must be #c85a32 (terracotta)');
      assert.strictEqual(rootVars['--primary-foreground'], '#ffffff', 'Light primary-foreground must be #ffffff');
      assert.strictEqual(rootVars['--secondary'], '#456644', 'Light secondary must be #456644 (sage olive)');
      assert.strictEqual(rootVars['--tertiary'], '#854f00', 'Light tertiary must be #854f00 (amber ochre)');
      assert.strictEqual(rootVars['--border'], '#e6e4dd', 'Light border must be #e6e4dd');
    });

    it('should match authoritative Kinfolk Academic token values in .dark', () => {
      assert.strictEqual(darkVars['--background'], '#0F1114', 'Dark canvas must be #0F1114');
      assert.strictEqual(darkVars['--foreground'], '#f6f0ec', 'Dark text must be #f6f0ec');
      assert.strictEqual(darkVars['--card'], '#17191D', 'Dark card must be #17191D');
      assert.strictEqual(darkVars['--card-foreground'], '#f6f0ec', 'Dark card text must be #f6f0ec');
      assert.strictEqual(darkVars['--primary'], '#c85a32', 'Dark primary must be #c85a32');
      assert.strictEqual(darkVars['--primary-foreground'], '#ffffff', 'Dark primary-foreground must be #ffffff');
      assert.strictEqual(darkVars['--secondary'], '#6b8e68', 'Dark secondary must be #6b8e68');
      assert.strictEqual(darkVars['--tertiary'], '#d98e32', 'Dark tertiary must be #d98e32');
      assert.strictEqual(darkVars['--border'], 'rgba(255, 255, 255, 0.08)', 'Dark border must be rgba(255,255,255,0.08)');
    });
  });

  // =========================================================================
  // 2. WCAG Accessibility Contrast Verification
  // =========================================================================
  describe('2. WCAG Contrast Stress Verification', () => {
    it('Light mode: foreground (#1d1b19) on background (#fef8f4) must exceed WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#1d1b19', '#fef8f4');
      assert.ok(ratio >= 7.0, `Light mode text contrast ratio ${ratio.toFixed(2)} must be >= 7.0 (AAA)`);
    });

    it('Light mode: card-foreground (#1d1b19) on card (#ffffff) must exceed WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#1d1b19', '#ffffff');
      assert.ok(ratio >= 7.0, `Light mode card contrast ratio ${ratio.toFixed(2)} must be >= 7.0 (AAA)`);
    });

    it('Light mode: secondary-foreground (#ffffff) on secondary (#456644) must exceed WCAG AA (4.5:1)', () => {
      const ratio = getContrastRatio('#ffffff', '#456644');
      assert.ok(ratio >= 4.5, `Light mode secondary contrast ratio ${ratio.toFixed(2)} must be >= 4.5 (AA)`);
    });

    it('Dark mode: foreground (#f6f0ec) on background (#0F1114) must exceed WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#f6f0ec', '#0F1114');
      assert.ok(ratio >= 7.0, `Dark mode text contrast ratio ${ratio.toFixed(2)} must be >= 7.0 (AAA)`);
    });

    it('Dark mode: card-foreground (#f6f0ec) on card (#17191D) must exceed WCAG AAA (7:1)', () => {
      const ratio = getContrastRatio('#f6f0ec', '#17191D');
      assert.ok(ratio >= 7.0, `Dark mode card contrast ratio ${ratio.toFixed(2)} must be >= 7.0 (AAA)`);
    });

    it('Destructive tokens: destructive-foreground (#ffffff) on destructive (#ba1a1a) must exceed WCAG AA (4.5:1)', () => {
      const ratio = getContrastRatio('#ffffff', '#ba1a1a');
      assert.ok(ratio >= 4.5, `Destructive button contrast ratio ${ratio.toFixed(2)} must be >= 4.5 (AA)`);
    });
  });

  // =========================================================================
  // 3. Animation Keyframes & Motion Verification
  // =========================================================================
  describe('3. Animation Keyframes & Reduced Motion Stress Test', () => {
    const requiredKeyframes = [
      'aurora-1',
      'aurora-2',
      'aurora-3',
      'aurora-4',
      'pulseGlow',
      'shimmer',
    ];

    it('should define all 6 required animation keyframes in globals.css', () => {
      for (const kf of requiredKeyframes) {
        const regex = new RegExp(`@keyframes\\s+${kf}\\s*\\{`);
        assert.ok(regex.test(globalsContent), `Missing @keyframes ${kf} in globals.css`);
      }
    });

    it('aurora keyframes should utilize GPU-accelerated translate3d transforms', () => {
      for (let i = 1; i <= 4; i++) {
        const regex = new RegExp(`@keyframes\\s+aurora-${i}\\s*\\{([^}]+(?:\\{[^}]+\\}[^}]*)*)\\}`);
        const m = globalsContent.match(regex);
        assert.ok(m, `aurora-${i} keyframe block not found`);
        assert.ok(m[1].includes('translate3d'), `aurora-${i} must use translate3d for GPU acceleration`);
      }
    });

    it('pulseGlow keyframe should modulate opacity and scale', () => {
      const m = globalsContent.match(/@keyframes\s+pulseGlow\s*\{([^}]+(?:\([^)]*\)[^}]*)*)\}/);
      assert.ok(m, 'pulseGlow keyframe block not found');
      assert.ok(m[1].includes('opacity'), 'pulseGlow must animate opacity');
      assert.ok(m[1].includes('scale'), 'pulseGlow must animate scale');
    });

    it('shimmer keyframe should translate on X-axis from -100% to 100%', () => {
      const m = globalsContent.match(/@keyframes\s+shimmer\s*\{([\s\S]*?)\n\}/);
      assert.ok(m, 'shimmer keyframe block not found');
      assert.ok(m[1].includes('translateX(-100%)'), 'shimmer must start at translateX(-100%)');
      assert.ok(m[1].includes('translateX(100%)'), 'shimmer must end at translateX(100%)');
    });

    it('prefers-reduced-motion media query should disable all 4 aurora floating animations', () => {
      const reducedMotionMatch = globalsContent.match(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([^}]+(?:\{[^}]+\}[^}]*)*)\}/);
      assert.ok(reducedMotionMatch, 'prefers-reduced-motion media query block missing');
      const inner = reducedMotionMatch[1];
      assert.ok(inner.includes('.animate-aurora-1'), 'Reduced motion must include .animate-aurora-1');
      assert.ok(inner.includes('.animate-aurora-2'), 'Reduced motion must include .animate-aurora-2');
      assert.ok(inner.includes('.animate-aurora-3'), 'Reduced motion must include .animate-aurora-3');
      assert.ok(inner.includes('.animate-aurora-4'), 'Reduced motion must include .animate-aurora-4');
      assert.ok(inner.includes('animation: none !important;'), 'Reduced motion must specify animation: none !important');
    });
  });

  // =========================================================================
  // 4. Typography Hierarchy & Font Imports
  // =========================================================================
  describe('4. Typography Hierarchy & Font Loading Integrity', () => {
    it('globals.css must import Newsreader with variable optical size 6..72 and weights 400..600', () => {
      assert.ok(globalsContent.includes('family=Newsreader:ital,opsz,wght@'), 'Missing Newsreader optical size font import');
      assert.ok(globalsContent.includes('6..72'), 'Newsreader font import must specify optical sizes 6..72');
    });

    it('globals.css must import Plus Jakarta Sans, Inter, and JetBrains Mono from Google Fonts', () => {
      assert.ok(globalsContent.includes('family=Plus+Jakarta+Sans:wght@'), 'Missing Plus Jakarta Sans import');
      assert.ok(globalsContent.includes('family=Inter:wght@'), 'Missing Inter import');
      assert.ok(globalsContent.includes('family=JetBrains+Mono:wght@'), 'Missing JetBrains Mono import');
    });

    it('globals.css must import SF Pro Display and Product Sans from cdnfonts', () => {
      assert.ok(globalsContent.includes('https://fonts.cdnfonts.com/css/sf-pro-display'), 'Missing SF Pro Display import');
      assert.ok(globalsContent.includes('https://fonts.cdnfonts.com/css/product-sans'), 'Missing Product Sans import');
    });

    it('tailwind.config.ts must map display and serif font families to Newsreader', () => {
      const tailwindPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
      const tailwindContent = fs.readFileSync(tailwindPath, 'utf-8');
      assert.ok(tailwindContent.includes('"Newsreader"'), 'tailwind.config.ts must configure Newsreader font');
      assert.ok(tailwindContent.includes('display: [\'"Newsreader"\''), 'tailwind.config.ts display family must start with Newsreader');
      assert.ok(tailwindContent.includes('serif: [\'"Newsreader"\''), 'tailwind.config.ts serif family must start with Newsreader');
    });

    it('src/app/layout.tsx must configure preconnect links and font stylesheets', () => {
      const layoutPath = path.join(PROJECT_ROOT, 'src', 'app', 'layout.tsx');
      const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
      assert.ok(layoutContent.includes('rel="preconnect" href="https://fonts.googleapis.com"'), 'layout.tsx must preconnect to fonts.googleapis.com');
      assert.ok(layoutContent.includes('rel="preconnect" href="https://fonts.gstatic.com"'), 'layout.tsx must preconnect to fonts.gstatic.com');
      assert.ok(layoutContent.includes('family=Newsreader:ital,opsz,wght@'), 'layout.tsx must include Newsreader stylesheet link');
      assert.ok(layoutContent.includes('family=Plus+Jakarta+Sans:wght@'), 'layout.tsx must include Plus Jakarta Sans stylesheet link');
    });
  });

  // =========================================================================
  // 5. Static Export Build & Deployment Constraints
  // =========================================================================
  describe('5. Static Export Configuration & Integrity', () => {
    it('next.config.mjs must set output: export and images.unoptimized: true', () => {
      const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.mjs');
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
      assert.ok(nextConfig.includes("output: 'export'"), 'next.config.mjs must specify output: "export"');
      assert.ok(nextConfig.includes("unoptimized: true"), 'next.config.mjs must specify unoptimized: true for static export');
    });

    it('firebase.json must designate out as hosting public directory', () => {
      const firebasePath = path.join(PROJECT_ROOT, 'firebase.json');
      const firebase = JSON.parse(fs.readFileSync(firebasePath, 'utf-8'));
      assert.strictEqual(firebase.hosting.public, 'out', 'firebase.json hosting.public must equal "out"');
    });
  });

});
