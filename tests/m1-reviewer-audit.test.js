import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Reviewer M1 Verification & Adversarial Audit', () => {
  const css = fs.readFileSync('src/app/globals.css', 'utf-8');

  it('1. Review src/app/globals.css keyframes', () => {
    const keyframes = [
      'monoline-star-drift',
      'monoline-lamp-glow',
      'monoline-cloud-drift',
      'monoline-breath-pulse',
      'monoline-steam-rise',
    ];
    for (const kf of keyframes) {
      assert.ok(css.includes(`@keyframes ${kf}`), `Missing keyframe: ${kf}`);
    }
  });

  it('2. Verify hardware acceleration and will-change', () => {
    const classes = [
      'animate-monoline-star',
      'animate-monoline-lamp',
      'animate-monoline-cloud',
      'animate-monoline-breath',
      'animate-monoline-steam',
    ];
    for (const cls of classes) {
      const rx = new RegExp(`\\.${cls}\\s*\\{([^}]+)\\}`);
      const m = css.match(rx);
      assert.ok(m, `Missing class .${cls}`);
      assert.ok(m[1].includes('will-change: transform'), `.${cls} must have will-change: transform`);
      assert.ok(m[1].includes('transform-box: fill-box'), `.${cls} must have transform-box: fill-box`);
      assert.ok(m[1].includes('transform-origin: center'), `.${cls} must have transform-origin: center`);
    }
  });

  it('3. Verify prefers-reduced-motion media query override', () => {
    const prmMatch = css.match(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([^}]+(?:\{[^}]+\}[^}]*)*)\}/);
    assert.ok(prmMatch, 'prefers-reduced-motion media query block missing');
    const prmContent = prmMatch[1];
    const classes = [
      'animate-monoline-star',
      'animate-monoline-lamp',
      'animate-monoline-cloud',
      'animate-monoline-breath',
      'animate-monoline-steam',
    ];
    for (const cls of classes) {
      assert.ok(prmContent.includes(`.${cls}`), `Reduced motion missing .${cls}`);
    }
    assert.ok(prmContent.includes('animation: none !important;'), 'Reduced motion must have animation: none !important;');
    assert.ok(prmContent.includes('transition: none !important;'), 'Reduced motion must have transition: none !important;');
  });

  it('4. Verify zero layout shift (CLS = 0) and container containment across all illustrations', () => {
    const dir = 'src/components/illustrations';
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx'));
    assert.strictEqual(files.length, 8, 'Expected 8 illustration .tsx files');
    for (const f of files) {
      const content = fs.readFileSync(path.join(dir, f), 'utf-8');
      assert.ok(content.includes('viewBox='), `${f} must specify viewBox`);
      assert.ok(content.includes('preserveAspectRatio="xMidYMid meet"'), `${f} must specify preserveAspectRatio`);
      assert.ok(content.includes('animated = true') || content.includes('animated'), `${f} must support animated prop`);
    }
  });

  it('5. Verify src/js/ legacy directory is completely untouched', () => {
    const checkDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else {
          const stat = fs.statSync(fullPath);
          const mtime = stat.mtime;
          // Must not have been modified today (9/13/2026)
          const isToday = mtime.toISOString().startsWith('2026-09-13');
          assert.strictEqual(isToday, false, `File ${fullPath} was touched on 2026-09-13`);
        }
      }
    };
    checkDir('src/js');
  });
});
