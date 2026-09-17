/**
 * Empirical Challenger Verification Suite for Milestone 1
 * challenger_m1_2: Micro-Animations, Accessibility, & Responsive Containment
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve('.');

describe('Challenger M1: Micro-Animations, Accessibility & Responsive Containment', () => {

  const globalsPath = path.join(PROJECT_ROOT, 'src', 'app', 'globals.css');
  const globalsContent = fs.readFileSync(globalsPath, 'utf-8');

  // =========================================================================
  // 1. GPU Transforms & Opacity Verification (No Layout-Triggering Properties)
  // =========================================================================
  describe('1. Micro-Animation Keyframes & GPU Acceleration', () => {
    const monolineKeyframes = [
      'monoline-star-drift',
      'monoline-lamp-glow',
      'monoline-cloud-drift',
      'monoline-breath-pulse',
      'monoline-steam-rise',
    ];

    const forbiddenLayoutProps = [
      /\bwidth\s*:/i,
      /\bheight\s*:/i,
      /\btop\s*:/i,
      /\bleft\s*:/i,
      /\bright\s*:/i,
      /\bbottom\s*:/i,
      /\bmargin\s*:/i,
      /\bmargin-[a-z]+\s*:/i,
      /\bpadding\s*:/i,
      /\bpadding-[a-z]+\s*:/i,
      /\bborder-width\s*:/i,
      /\bfont-size\s*:/i,
    ];

    it('should define all 5 monoline micro-animation keyframes in globals.css', () => {
      for (const kf of monolineKeyframes) {
        const regex = new RegExp(`@keyframes\\s+${kf}\\s*\\{([\\s\\S]*?)\\n\\}`);
        assert.ok(regex.test(globalsContent), `Missing @keyframes ${kf} in globals.css`);
      }
    });

    it('no layout-triggering properties (width, height, top, left, margin, padding) may be animated', () => {
      for (const kf of monolineKeyframes) {
        const regex = new RegExp(`@keyframes\\s+${kf}\\s*\\{([\\s\\S]*?)\\n\\}`);
        const match = globalsContent.match(regex);
        assert.ok(match, `Could not extract body of @keyframes ${kf}`);
        const body = match[1];

        for (const forbidden of forbiddenLayoutProps) {
          assert.ok(
            !forbidden.test(body),
            `Violation in @keyframes ${kf}: layout-triggering property matched by ${forbidden} found in:\n${body}`
          );
        }
      }
    });

    it('all monoline keyframes must only animate GPU transform and/or opacity', () => {
      for (const kf of monolineKeyframes) {
        const regex = new RegExp(`@keyframes\\s+${kf}\\s*\\{([\\s\\S]*?)\\n\\}`);
        const match = globalsContent.match(regex);
        const body = match[1];

        // Split into property declarations (ignoring selectors like 0%, 50%, 100%)
        const lines = body.split('\n')
          .map(l => l.trim())
          .filter(l => l.includes(':') && !l.endsWith('{'));

        for (const line of lines) {
          const propName = line.split(':')[0].trim();
          const isAllowed = propName === 'transform' || propName === 'opacity';
          assert.ok(
            isAllowed,
            `Unexpected property "${propName}" in @keyframes ${kf}. Only "transform" and "opacity" are permitted.`
          );
        }
      }
    });

    it('monoline utility classes must configure transform-box and transform-origin for SVG elements', () => {
      const classes = [
        'animate-monoline-star',
        'animate-monoline-lamp',
        'animate-monoline-cloud',
        'animate-monoline-breath',
        'animate-monoline-steam',
      ];

      for (const cls of classes) {
        const regex = new RegExp(`\\.${cls}\\s*\\{([^}]+)\\}`, 'm');
        const match = globalsContent.match(regex);
        assert.ok(match, `Missing utility class .${cls} in globals.css`);
        const block = match[1];
        assert.ok(block.includes('transform-box: fill-box;'), `.${cls} must declare transform-box: fill-box;`);
        assert.ok(block.includes('transform-origin: center;'), `.${cls} must declare transform-origin: center;`);
        assert.ok(block.includes('will-change:'), `.${cls} must declare will-change`);
      }
    });
  });

  // =========================================================================
  // 2. Prefers-Reduced-Motion Accessibility Verification
  // =========================================================================
  describe('2. Accessibility: prefers-reduced-motion Compliance', () => {
    it('prefers-reduced-motion media query must disable animations for all .animate-monoline-* classes', () => {
      const reducedMotionRegex = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/;
      const match = globalsContent.match(reducedMotionRegex);
      assert.ok(match, 'Missing @media (prefers-reduced-motion: reduce) block in globals.css');
      const mediaBlock = match[1];

      const expectedClasses = [
        '.animate-monoline-star',
        '.animate-monoline-lamp',
        '.animate-monoline-cloud',
        '.animate-monoline-breath',
        '.animate-monoline-steam',
      ];

      for (const cls of expectedClasses) {
        assert.ok(
          mediaBlock.includes(cls),
          `prefers-reduced-motion media query must include class ${cls}`
        );
      }

      assert.ok(
        mediaBlock.includes('animation: none !important;'),
        'prefers-reduced-motion must specify animation: none !important;'
      );
      assert.ok(
        mediaBlock.includes('transition: none !important;'),
        'prefers-reduced-motion must specify transition: none !important;'
      );
    });

    it('prefers-reduced-motion must disable hover-monoline-lift translation transform', () => {
      const reducedMotionRegex = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/;
      const match = globalsContent.match(reducedMotionRegex);
      const mediaBlock = match[1];

      assert.ok(
        mediaBlock.includes('.hover-monoline-lift:hover'),
        'prefers-reduced-motion must target .hover-monoline-lift:hover'
      );
      assert.ok(
        mediaBlock.includes('transform: none !important;'),
        'prefers-reduced-motion must set transform: none !important for hover lifts'
      );
    });
  });

  // =========================================================================
  // 3. Responsive Layout Containment (<380px Viewport Safety)
  // =========================================================================
  describe('3. Responsive Layout Containment (<380px Viewport Safety)', () => {
    const illustrationDir = path.join(PROJECT_ROOT, 'src', 'components', 'illustrations');
    const illustrationFiles = [
      'LandingHeroIllustration.tsx',
      'AcademicRhythmIllustration.tsx',
      'StreakMilestoneIllustration.tsx',
      'StudyClockIllustration.tsx',
      'ZScoreForecastIllustration.tsx',
      'CalendarPaceIllustration.tsx',
      'AdminVerificationDeskIllustration.tsx',
      'EmptyStates.tsx',
    ];

    it('all illustration components must specify explicit viewBox and preserveAspectRatio="xMidYMid meet"', () => {
      for (const file of illustrationFiles) {
        const filePath = path.join(illustrationDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        assert.ok(
          content.includes('viewBox="'),
          `${file} must specify an explicit viewBox for vector scaling`
        );
        assert.ok(
          content.includes('preserveAspectRatio="xMidYMid meet"'),
          `${file} must declare preserveAspectRatio="xMidYMid meet" to prevent distortion`
        );
      }
    });

    it('all primary illustration components must default to responsive classes (w-full h-auto or fluid)', () => {
      const primaryFiles = [
        'LandingHeroIllustration.tsx',
        'AcademicRhythmIllustration.tsx',
        'StreakMilestoneIllustration.tsx',
        'StudyClockIllustration.tsx',
        'ZScoreForecastIllustration.tsx',
        'CalendarPaceIllustration.tsx',
        'AdminVerificationDeskIllustration.tsx',
      ];

      for (const file of primaryFiles) {
        const filePath = path.join(illustrationDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        assert.ok(
          content.includes("className = 'w-full h-auto'") || content.includes('className = "w-full h-auto"'),
          `${file} default className must be 'w-full h-auto' for responsive scaling`
        );
      }
    });

    it('illustration SVG elements must include select-none to prevent selection drag on mobile touch', () => {
      for (const file of illustrationFiles) {
        const filePath = path.join(illustrationDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        assert.ok(
          content.includes('select-none'),
          `${file} must include select-none to avoid mobile touch drag selection`
        );
      }
    });

    it('illustration SVG elements must have accessibility role="img" and aria-label', () => {
      for (const file of illustrationFiles) {
        const filePath = path.join(illustrationDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        assert.ok(
          content.includes('role="img"'),
          `${file} must declare role="img" for screen reader accessibility`
        );
        assert.ok(
          content.includes('aria-label='),
          `${file} must provide an aria-label attribute for accessibility`
        );
      }
    });

    it('all components must support animated prop to suppress motion classes programmatically', () => {
      for (const file of illustrationFiles) {
        const filePath = path.join(illustrationDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        assert.ok(
          content.includes('animated = true'),
          `${file} must accept an animated prop defaulting to true`
        );
        assert.ok(
          content.includes('animated ?'),
          `${file} must conditionally apply animation classes based on the animated prop`
        );
      }
    });

    it('EmptyState wrapper must enforce minimum 44px touch target on action button', () => {
      const emptyStatesPath = path.join(illustrationDir, 'EmptyStates.tsx');
      const content = fs.readFileSync(emptyStatesPath, 'utf-8');

      assert.ok(
        content.includes('min-h-[44px]'),
        'EmptyState action button must enforce min-h-[44px] touch target for mobile ergonomics'
      );
      assert.ok(
        content.includes('max-w-md'),
        'EmptyState container must contain content within max-w-md to prevent layout explosion'
      );
    });
  });

  // =========================================================================
  // 4. Verification that src/js/ Remains Completely Untouched
  // =========================================================================
  describe('4. Legacy src/js/ Protection', () => {
    const legacyFiles = [
      'src/js/api.js',
      'src/js/app.js',
      'src/js/auth.js',
      'src/js/gamification.js',
      'src/js/idcard.js',
      'src/js/qr.js',
      'src/js/schools.js',
      'src/js/slider.js',
      'src/js/state.js',
      'src/js/toast.js',
      'src/js/utils.js',
    ];

    it('all 11 legacy files in src/js/ must exist and be non-empty', () => {
      for (const file of legacyFiles) {
        const fullPath = path.join(PROJECT_ROOT, file);
        assert.ok(fs.existsSync(fullPath), `Legacy file ${file} must exist`);
        const stat = fs.statSync(fullPath);
        assert.ok(stat.size > 0, `Legacy file ${file} must not be empty`);
      }
    });

    it('legacy api.js must retain original POST pattern and Apps Script URL', () => {
      const apiPath = path.join(PROJECT_ROOT, 'src', 'js', 'api.js');
      const content = fs.readFileSync(apiPath, 'utf-8');
      assert.ok(
        content.includes('https://script.google.com/macros/s/'),
        'src/js/api.js must preserve Google Apps Script endpoint'
      );
      assert.ok(
        content.includes('text/plain;charset=utf-8'),
        'src/js/api.js must preserve text/plain POST pattern'
      );
    });

    it('legacy schools.js must contain 400+ school entries', () => {
      const schoolsPath = path.join(PROJECT_ROOT, 'src', 'js', 'schools.js');
      const content = fs.readFileSync(schoolsPath, 'utf-8');
      assert.ok(
        content.length > 50000,
        'src/js/schools.js must preserve complete school directory'
      );
    });
  });

  // =========================================================================
  // 5. Barrel Export & Tokens Completeness
  // =========================================================================
  describe('5. Barrel Export and Token Constants', () => {
    it('tokens.ts must define exact authoritative color tokens', () => {
      const tokensPath = path.join(PROJECT_ROOT, 'src', 'components', 'illustrations', 'tokens.ts');
      const content = fs.readFileSync(tokensPath, 'utf-8');

      assert.ok(content.includes("contour: '#19202e'"), "tokens.ts contour must be '#19202e'");
      assert.ok(content.includes("surface: '#ffffff'"), "tokens.ts surface must be '#ffffff'");
      assert.ok(content.includes("spotPink: '#fa7268'"), "tokens.ts spotPink must be '#fa7268'");
      assert.ok(content.includes("spotYellow: '#fcd34d'"), "tokens.ts spotYellow must be '#fcd34d'");
      assert.ok(content.includes("spotOrange: '#fb923c'"), "tokens.ts spotOrange must be '#fb923c'");
      assert.ok(content.includes("width: 1.75"), "tokens.ts stroke width standard must be 1.75");
      assert.ok(content.includes("vectorEffect: 'non-scaling-stroke'"), "tokens.ts must specify non-scaling-stroke");
    });

    it('index.ts barrel export must export all components and tokens', () => {
      const indexPath = path.join(PROJECT_ROOT, 'src', 'components', 'illustrations', 'index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');

      const expectedExports = [
        './tokens',
        './LandingHeroIllustration',
        './AcademicRhythmIllustration',
        './StreakMilestoneIllustration',
        './StudyClockIllustration',
        './ZScoreForecastIllustration',
        './CalendarPaceIllustration',
        './AdminVerificationDeskIllustration',
        './EmptyStates',
      ];

      for (const exp of expectedExports) {
        assert.ok(content.includes(`export * from '${exp}';`), `index.ts must export from ${exp}`);
      }
    });
  });
});
