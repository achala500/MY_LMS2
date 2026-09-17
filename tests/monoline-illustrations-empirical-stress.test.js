/**
 * Empirical Challenger Adversarial Stress Test Suite for Milestone 1 Vector Illustrations
 * 
 * Tests:
 * 1. Comprehensive Barrel Exports verification from src/components/illustrations/index.ts
 * 2. Token constants adherence (MONOLINE_COLORS and MONOLINE_STROKE)
 * 3. Pure SVG Tree rendering & XML validity for all 7 main illustrations and 7 empty states + EmptyState wrapper
 * 4. ViewBox definitions, aspect ratios, and responsive scaling calculations
 * 5. Stroke attributes, linecap, linejoin, and custom strokeWidth override verification
 * 6. Animation flag stress test: animated={false} strictly removes all animated CSS classes
 * 7. Color adherence: Contours strictly use #19202e, Spot fills strictly use #fa7268, #fcd34d, #fb923c
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const PROJECT_ROOT = path.resolve('.');
const ILLUST_DIR = path.join(PROJECT_ROOT, 'src', 'components', 'illustrations');
const CACHE_DIR = path.join(PROJECT_ROOT, 'node_modules', '.cache', 'illustrations-test');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Transpile all files from src/components/illustrations into CACHE_DIR as standard ESM JS
const illustrationFiles = fs.readdirSync(ILLUST_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

for (const file of illustrationFiles) {
  let code = fs.readFileSync(path.join(ILLUST_DIR, file), 'utf-8');
  // Ensure relative imports and exports point to .js files
  code = code.replace(/(from\s+['"])(\.\/[^'"\n]+?)(?:\.js)?(['"])/g, '$1$2.js$3');

  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    }
  }).outputText;

  const outFile = path.join(CACHE_DIR, file.replace(/\.tsx?$/, '.js'));
  fs.writeFileSync(outFile, transpiled, 'utf-8');
}

// Dynamic import the compiled barrel index
const barrelUrl = pathToFileURL(path.join(CACHE_DIR, 'index.js')).href;
const barrel = await import(barrelUrl);

const {
  MONOLINE_COLORS,
  MONOLINE_STROKE,
  LandingHeroIllustration,
  AcademicRhythmIllustration,
  StreakMilestoneIllustration,
  StudyClockIllustration,
  ZScoreForecastIllustration,
  CalendarPaceIllustration,
  AdminVerificationDeskIllustration,
  EmptyState,
  EmptyLogsIllustration,
  EmptyDailyBlocksIllustration,
  EmptyTestScoresIllustration,
  EmptyCalendarScheduleIllustration,
  EmptyPastPapersIllustration,
  EmptySubmissionsIllustration,
  EmptySearchResultsIllustration,
} = barrel;

const MAIN_ILLUSTRATIONS = [
  { name: 'LandingHeroIllustration', component: LandingHeroIllustration, expectedViewBox: '0 0 600 450', defaultWidth: 600, defaultHeight: 450 },
  { name: 'AcademicRhythmIllustration', component: AcademicRhythmIllustration, expectedViewBox: '0 0 400 300', defaultWidth: 400, defaultHeight: 300 },
  { name: 'StreakMilestoneIllustration', component: StreakMilestoneIllustration, expectedViewBox: '0 0 320 280', defaultWidth: 320, defaultHeight: 280 },
  { name: 'StudyClockIllustration', component: StudyClockIllustration, expectedViewBox: '0 0 320 320', defaultWidth: 320, defaultHeight: 320 },
  { name: 'ZScoreForecastIllustration', component: ZScoreForecastIllustration, expectedViewBox: '0 0 420 280', defaultWidth: 420, defaultHeight: 280 },
  { name: 'CalendarPaceIllustration', component: CalendarPaceIllustration, expectedViewBox: '0 0 360 280', defaultWidth: 360, defaultHeight: 280 },
  { name: 'AdminVerificationDeskIllustration', component: AdminVerificationDeskIllustration, expectedViewBox: '0 0 400 300', defaultWidth: 400, defaultHeight: 300 },
];

const EMPTY_STATE_ILLUSTRATIONS = [
  { name: 'EmptyLogsIllustration', component: EmptyLogsIllustration, expectedViewBox: '0 0 200 160', defaultSize: 180 },
  { name: 'EmptyDailyBlocksIllustration', component: EmptyDailyBlocksIllustration, expectedViewBox: '0 0 200 160', defaultSize: 160 },
  { name: 'EmptyTestScoresIllustration', component: EmptyTestScoresIllustration, expectedViewBox: '0 0 200 160', defaultSize: 160 },
  { name: 'EmptyCalendarScheduleIllustration', component: EmptyCalendarScheduleIllustration, expectedViewBox: '0 0 200 160', defaultSize: 160 },
  { name: 'EmptyPastPapersIllustration', component: EmptyPastPapersIllustration, expectedViewBox: '0 0 200 160', defaultSize: 160 },
  { name: 'EmptySubmissionsIllustration', component: EmptySubmissionsIllustration, expectedViewBox: '0 0 200 160', defaultSize: 160 },
  { name: 'EmptySearchResultsIllustration', component: EmptySearchResultsIllustration, expectedViewBox: '0 0 200 160', defaultSize: 160 },
];

const ANIMATION_CLASSES = [
  'animate-monoline-star',
  'animate-monoline-lamp',
  'animate-monoline-cloud',
  'animate-monoline-breath',
  'animate-monoline-steam',
];

describe('Empirical Challenger: Monoline Vector Components Stress Suite', () => {

  // =========================================================================
  // 1. Barrel Exports Integrity
  // =========================================================================
  describe('1. Barrel Export Integrity in src/components/illustrations/index.ts', () => {
    const indexPath = path.join(ILLUST_DIR, 'index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    it('index.ts file must exist and have non-zero size', () => {
      assert.ok(fs.existsSync(indexPath), 'index.ts must exist');
      assert.ok(indexContent.length > 50, 'index.ts must not be empty');
    });

    const expectedReExports = [
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

    for (const reExp of expectedReExports) {
      it(`index.ts must re-export from '${reExp}'`, () => {
        const regex = new RegExp(`export\\s+\\*\\s+from\\s+['"]${reExp.replace('.', '\\.')}['"]`);
        assert.ok(regex.test(indexContent), `Missing re-export for ${reExp} in index.ts`);
      });
    }

    it('all component symbols must be exported and defined functions', () => {
      const allSymbols = [
        LandingHeroIllustration,
        AcademicRhythmIllustration,
        StreakMilestoneIllustration,
        StudyClockIllustration,
        ZScoreForecastIllustration,
        CalendarPaceIllustration,
        AdminVerificationDeskIllustration,
        EmptyState,
        EmptyLogsIllustration,
        EmptyDailyBlocksIllustration,
        EmptyTestScoresIllustration,
        EmptyCalendarScheduleIllustration,
        EmptyPastPapersIllustration,
        EmptySubmissionsIllustration,
        EmptySearchResultsIllustration,
      ];
      for (const sym of allSymbols) {
        assert.strictEqual(typeof sym, 'function', `Exported component ${sym?.name || 'anonymous'} must be a callable React function component`);
      }
    });
  });

  // =========================================================================
  // 2. Token Constants Adherence
  // =========================================================================
  describe('2. Design Token Constants Invariants', () => {
    it('MONOLINE_COLORS must define authoritative contour and spot fills', () => {
      assert.strictEqual(MONOLINE_COLORS.contour, '#19202e', 'Contour must strictly equal #19202e');
      assert.strictEqual(MONOLINE_COLORS.surface, '#ffffff', 'Surface must strictly equal #ffffff');
      assert.strictEqual(MONOLINE_COLORS.spotPink, '#fa7268', 'spotPink must strictly equal #fa7268');
      assert.strictEqual(MONOLINE_COLORS.spotYellow, '#fcd34d', 'spotYellow must strictly equal #fcd34d');
      assert.strictEqual(MONOLINE_COLORS.spotOrange, '#fb923c', 'spotOrange must strictly equal #fb923c');
    });

    it('MONOLINE_STROKE must define uniform stroke width and cap/join attributes', () => {
      assert.strictEqual(MONOLINE_STROKE.width, 1.75, 'Standard stroke width must be 1.75');
      assert.strictEqual(MONOLINE_STROKE.minWidth, 1.5, 'Minimum stroke width must be 1.5');
      assert.strictEqual(MONOLINE_STROKE.maxWidth, 2.0, 'Maximum stroke width must be 2.0');
      assert.strictEqual(MONOLINE_STROKE.linecap, 'round', 'Linecap must be round');
      assert.strictEqual(MONOLINE_STROKE.linejoin, 'round', 'Linejoin must be round');
      assert.strictEqual(MONOLINE_STROKE.vectorEffect, 'non-scaling-stroke', 'vectorEffect must be non-scaling-stroke');
    });
  });

  // =========================================================================
  // 3. SVG Tree Structure & ViewBox Specifications (7 Main Illustrations)
  // =========================================================================
  describe('3. Main Illustrations SVG Tree & ViewBox Verification', () => {
    for (const item of MAIN_ILLUSTRATIONS) {
      it(`${item.name} renders a valid, well-formed SVG tree with correct viewBox`, () => {
        const markup = renderToStaticMarkup(React.createElement(item.component));
        assert.ok(markup.startsWith('<svg'), `${item.name} markup must start with <svg`);
        assert.ok(markup.endsWith('</svg>'), `${item.name} markup must close with </svg>`);
        assert.ok(markup.includes('xmlns="http://www.w3.org/2000/svg"'), `${item.name} must specify SVG namespace`);
        assert.ok(markup.includes(`viewBox="${item.expectedViewBox}"`), `${item.name} must have viewBox="${item.expectedViewBox}"`);
        assert.ok(markup.includes('role="img"'), `${item.name} must have accessible role="img"`);
        assert.ok(markup.includes('aria-label='), `${item.name} must provide an aria-label`);
        assert.ok(markup.includes('preserveAspectRatio="xMidYMid meet"'), `${item.name} must preserve aspect ratio`);
      });

      it(`${item.name} applies default width and height properly`, () => {
        const markup = renderToStaticMarkup(React.createElement(item.component));
        assert.ok(markup.includes(`width="${item.defaultWidth}"`), `${item.name} default width must be ${item.defaultWidth}`);
        assert.ok(markup.includes(`height="${item.defaultHeight}"`), `${item.name} default height must be ${item.defaultHeight}`);
      });

      it(`${item.name} scales proportionally when size prop is provided as a number`, () => {
        const customSize = 200;
        const markup = renderToStaticMarkup(React.createElement(item.component, { size: customSize }));
        assert.ok(markup.includes(`width="${customSize}"`), `${item.name} custom width must equal ${customSize}`);
        const expectedHeight = (customSize * item.defaultHeight) / item.defaultWidth;
        assert.ok(
          markup.includes(`height="${expectedHeight}"`),
          `${item.name} custom height should be proportional (${expectedHeight})`
        );
      });
    }
  });

  // =========================================================================
  // 4. Empty State Illustrations SVG Tree & ViewBox Verification (7 Empty States)
  // =========================================================================
  describe('4. Empty State Illustrations SVG Tree & ViewBox Verification', () => {
    for (const item of EMPTY_STATE_ILLUSTRATIONS) {
      it(`${item.name} renders a valid SVG tree with viewBox="${item.expectedViewBox}"`, () => {
        const markup = renderToStaticMarkup(React.createElement(item.component));
        assert.ok(markup.startsWith('<svg'), `${item.name} markup must start with <svg`);
        assert.ok(markup.endsWith('</svg>'), `${item.name} markup must close with </svg>`);
        assert.ok(markup.includes('xmlns="http://www.w3.org/2000/svg"'), `${item.name} must specify SVG namespace`);
        assert.ok(markup.includes(`viewBox="${item.expectedViewBox}"`), `${item.name} must have viewBox="${item.expectedViewBox}"`);
        assert.ok(markup.includes('role="img"'), `${item.name} must have accessible role="img"`);
        assert.ok(markup.includes('aria-label='), `${item.name} must provide an aria-label`);
        assert.ok(markup.includes('preserveAspectRatio="xMidYMid meet"'), `${item.name} must preserve aspect ratio`);
      });

      it(`${item.name} scales proportionally when size prop is specified`, () => {
        const customSize = 240;
        const markup = renderToStaticMarkup(React.createElement(item.component, { size: customSize }));
        assert.ok(markup.includes(`width="${customSize}"`), `${item.name} must support custom size width`);
        const expectedHeight = (customSize * 160) / 200;
        assert.ok(markup.includes(`height="${expectedHeight}"`), `${item.name} must scale height to ${expectedHeight}`);
      });
    }
  });

  // =========================================================================
  // 5. Universal EmptyState Wrapper Component Verification
  // =========================================================================
  describe('5. Universal EmptyState Wrapper Component Behavior', () => {
    it('EmptyState renders title, description, and region role', () => {
      const markup = renderToStaticMarkup(
        React.createElement(EmptyState, {
          title: 'No study logs yet',
          description: 'Record your daily session hours to establish your rhythm.',
          actionLabel: 'Log study now',
          onAction: () => {},
        })
      );
      assert.ok(markup.includes('role="region"'), 'EmptyState must render role="region"');
      assert.ok(markup.includes('aria-label="No study logs yet"'), 'EmptyState must include aria-label matching title');
      assert.ok(markup.includes('No study logs yet'), 'EmptyState must render title');
      assert.ok(markup.includes('Record your daily session hours'), 'EmptyState must render description');
      assert.ok(markup.includes('Log study now'), 'EmptyState must render action button');
      assert.ok(markup.includes('min-h-[44px]'), 'Action button must respect comfortable 44px ergonomics');
    });

    it('EmptyState embeds illustration with hover-monoline-lift wrapper', () => {
      const markup = renderToStaticMarkup(
        React.createElement(EmptyState, {
          illustration: React.createElement(EmptyLogsIllustration),
          title: 'No study logs',
        })
      );
      assert.ok(markup.includes('hover-monoline-lift'), 'EmptyState illustration slot must have hover-monoline-lift transition class');
      assert.ok(markup.includes('No Study Logs Illustration'), 'Nested illustration aria-label must be present');
    });
  });

  // =========================================================================
  // 6. Animation Toggle Stress Test (animated={false} must remove animated classes)
  // =========================================================================
  describe('6. Animation Prop Contract: animated={false} Strict Class Removal', () => {
    const all14Illustrations = [...MAIN_ILLUSTRATIONS, ...EMPTY_STATE_ILLUSTRATIONS];

    for (const item of all14Illustrations) {
      it(`${item.name}: animated={true} includes monoline micro-animation classes`, () => {
        const animatedMarkup = renderToStaticMarkup(React.createElement(item.component, { animated: true }));
        const hasAnyAnimation = ANIMATION_CLASSES.some(cls => animatedMarkup.includes(cls));
        assert.ok(hasAnyAnimation, `${item.name} with animated=true must contain at least one monoline animation class`);
      });

      it(`${item.name}: animated={false} strictly eliminates all animated classes`, () => {
        const staticMarkup = renderToStaticMarkup(React.createElement(item.component, { animated: false }));
        for (const cls of ANIMATION_CLASSES) {
          assert.ok(
            !staticMarkup.includes(cls),
            `${item.name} with animated={false} must NOT contain animation class '${cls}'`
          );
        }
      });
    }
  });

  // =========================================================================
  // 7. Palette & Contour Color Strictness
  // =========================================================================
  describe('7. Monoline Contour & Spot Fill Strict Invariants', () => {
    const all14Illustrations = [...MAIN_ILLUSTRATIONS, ...EMPTY_STATE_ILLUSTRATIONS];

    for (const item of all14Illustrations) {
      it(`${item.name} strictly utilizes contour color #19202e for structural vector lines`, () => {
        const markup = renderToStaticMarkup(React.createElement(item.component));
        assert.ok(
          markup.includes('#19202e'),
          `${item.name} must use #19202e for its stroke contours`
        );
      });

      it(`${item.name} only utilizes permitted spot colors (#fa7268, #fcd34d, #fb923c) or surface tints`, () => {
        const markup = renderToStaticMarkup(React.createElement(item.component));

        // Find all hex colors in rendered markup
        const hexMatches = markup.match(/#[0-9a-fA-F]{6}/g) || [];
        const uniqueColors = [...new Set(hexMatches.map(c => c.toLowerCase()))];

        const ALLOWED_COLORS = new Set([
          '#19202e', // contour
          '#ffffff', // surface
          '#fa7268', // spotPink
          '#fcd34d', // spotYellow
          '#fb923c', // spotOrange
          // Architectural ivory paper tints & plate gradients:
          '#fbf8f2',
          '#f8f4ee',
          '#faf6f0',
          '#f6f2ec',
          '#fbf7f1',
          '#fbeada',
          '#e4dfd7',
          '#f4ede6',
          '#fcf8f2',
          '#fbf5ee',
          '#faf5ee',
        ]);

        for (const color of uniqueColors) {
          assert.ok(
            ALLOWED_COLORS.has(color),
            `${item.name} uses unauthorized off-palette color: ${color}`
          );
        }
      });
    }
  });

  // =========================================================================
  // 8. Stroke Width Customization & Invariants
  // =========================================================================
  describe('8. Stroke Attributes & Customization', () => {
    it('custom strokeWidth prop overrides the default 1.75 on main illustrations', () => {
      for (const item of MAIN_ILLUSTRATIONS) {
        const customStroke = 3.5;
        const markup = renderToStaticMarkup(React.createElement(item.component, { strokeWidth: customStroke }));
        assert.ok(
          markup.includes(`stroke-width="${customStroke}"`) || markup.includes(`strokeWidth="${customStroke}"`),
          `${item.name} must accept custom strokeWidth=${customStroke}`
        );
      }
    });

    it('custom strokeWidth prop overrides the default on empty state illustrations', () => {
      for (const item of EMPTY_STATE_ILLUSTRATIONS) {
        const customStroke = 2.8;
        const markup = renderToStaticMarkup(React.createElement(item.component, { strokeWidth: customStroke }));
        assert.ok(
          markup.includes(`stroke-width="${customStroke}"`) || markup.includes(`strokeWidth="${customStroke}"`),
          `${item.name} must accept custom strokeWidth=${customStroke}`
        );
      }
    });
  });

});
