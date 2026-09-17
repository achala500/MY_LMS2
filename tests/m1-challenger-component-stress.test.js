/**
 * Milestone M1 Empirical Challenger Test Suite
 * Stress-tests UI component exports, CVA variants, CSS design tokens,
 * animation keyframes, dark mode rules, Radix slot variants, and layout structure.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve('.');

describe('Milestone M1 Component & Styling Stress Verification', () => {

  // =========================================================================
  // 1. UI Component File Manifest & Primitives Inventory (19 Primitives)
  // =========================================================================
  describe('1. shadcn/ui Component Primitives Inventory', () => {
    const requiredPrimitives = [
      'avatar.tsx',
      'badge.tsx',
      'button.tsx',
      'card.tsx',
      'command.tsx',
      'dialog.tsx',
      'input.tsx',
      'label.tsx',
      'navigation-menu.tsx',
      'popover.tsx',
      'progress.tsx',
      'select.tsx',
      'separator.tsx',
      'skeleton.tsx',
      'sonner.tsx',
      'table.tsx',
      'tabs.tsx',
      'textarea.tsx',
      'tooltip.tsx',
    ];

    it('should contain all 19 required shadcn/ui component files in src/components/ui', () => {
      const uiDir = path.join(PROJECT_ROOT, 'src', 'components', 'ui');
      assert.ok(fs.existsSync(uiDir), 'src/components/ui directory must exist');

      for (const file of requiredPrimitives) {
        const filePath = path.join(uiDir, file);
        assert.ok(fs.existsSync(filePath), `Required component primitive missing: ${file}`);
        const stat = fs.statSync(filePath);
        assert.ok(stat.size > 100, `Component primitive ${file} is unexpectedly empty (${stat.size} bytes)`);
      }
    });

    it('should contain all 3 required layout component files in src/components/layout', () => {
      const layoutDir = path.join(PROJECT_ROOT, 'src', 'components', 'layout');
      assert.ok(fs.existsSync(layoutDir), 'src/components/layout directory must exist');

      const layoutFiles = ['AuroraBackground.tsx', 'Header.tsx', 'Footer.tsx'];
      for (const file of layoutFiles) {
        const filePath = path.join(layoutDir, file);
        assert.ok(fs.existsSync(filePath), `Required layout component missing: ${file}`);
        const stat = fs.statSync(filePath);
        assert.ok(stat.size > 200, `Layout component ${file} is unexpectedly empty (${stat.size} bytes)`);
      }
    });
  });

  // =========================================================================
  // 2. Component Export Signatures & DisplayNames
  // =========================================================================
  describe('2. Component Export Signatures & DisplayNames', () => {
    const componentExports = {
      'button.tsx': ['Button', 'buttonVariants'],
      'card.tsx': ['Card', 'CardHeader', 'CardFooter', 'CardTitle', 'CardDescription', 'CardContent'],
      'dialog.tsx': ['Dialog', 'DialogPortal', 'DialogOverlay', 'DialogClose', 'DialogTrigger', 'DialogContent', 'DialogHeader', 'DialogFooter', 'DialogTitle', 'DialogDescription'],
      'table.tsx': ['Table', 'TableHeader', 'TableBody', 'TableFooter', 'TableHead', 'TableRow', 'TableCell', 'TableCaption'],
      'tabs.tsx': ['Tabs', 'TabsList', 'TabsTrigger', 'TabsContent'],
      'select.tsx': ['Select', 'SelectGroup', 'SelectValue', 'SelectTrigger', 'SelectContent', 'SelectLabel', 'SelectItem', 'SelectSeparator', 'SelectScrollUpButton', 'SelectScrollDownButton'],
      'input.tsx': ['Input'],
      'textarea.tsx': ['Textarea'],
      'progress.tsx': ['Progress'],
      'badge.tsx': ['Badge', 'badgeVariants'],
      'sonner.tsx': ['Toaster', 'toast'],
      'navigation-menu.tsx': ['navigationMenuTriggerStyle', 'NavigationMenu', 'NavigationMenuList', 'NavigationMenuItem', 'NavigationMenuContent', 'NavigationMenuTrigger', 'NavigationMenuLink', 'NavigationMenuIndicator', 'NavigationMenuViewport'],
      'popover.tsx': ['Popover', 'PopoverTrigger', 'PopoverContent', 'PopoverAnchor'],
      'avatar.tsx': ['Avatar', 'AvatarImage', 'AvatarFallback'],
      'skeleton.tsx': ['Skeleton'],
      'separator.tsx': ['Separator'],
      'label.tsx': ['Label'],
      'tooltip.tsx': ['Tooltip', 'TooltipTrigger', 'TooltipContent', 'TooltipProvider'],
      'command.tsx': ['Command', 'CommandDialog', 'CommandInput', 'CommandList', 'CommandEmpty', 'CommandGroup', 'CommandItem', 'CommandShortcut', 'CommandSeparator'],
    };

    for (const [file, exportsList] of Object.entries(componentExports)) {
      it(`should correctly export all expected symbols from src/components/ui/${file}`, () => {
        const filePath = path.join(PROJECT_ROOT, 'src', 'components', 'ui', file);
        const content = fs.readFileSync(filePath, 'utf-8');

        for (const exp of exportsList) {
          const exportRegex = new RegExp(`export\\s*\\{[^}]*\\b${exp}\\b[^}]*\\}|export\\s+(const|function|interface|type)\\s+${exp}\\b`);
          assert.ok(exportRegex.test(content), `Missing export '${exp}' in ${file}`);
        }
      });
    }
  });

  // =========================================================================
  // 3. CVA Variants Stress Testing (Button & Badge)
  // =========================================================================
  describe('3. CVA Variants & Radix Slot Pattern Stress Test', () => {
    it('Button variants should define all required theme colors and sizes', () => {
      const buttonFile = path.join(PROJECT_ROOT, 'src', 'components', 'ui', 'button.tsx');
      const content = fs.readFileSync(buttonFile, 'utf-8');

      // Check for Radix Slot import
      assert.ok(content.includes('@radix-ui/react-slot'), 'Button must import Slot from @radix-ui/react-slot');
      assert.ok(content.includes('asChild = false'), 'Button must support asChild prop');
      assert.ok(content.includes('const Comp = asChild ? Slot : "button"'), 'Button must dynamically switch to Slot when asChild=true');

      // Check variant names
      const requiredVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'indigo', 'emerald', 'glass'];
      for (const v of requiredVariants) {
        assert.ok(content.includes(`${v}:`), `Button missing variant: ${v}`);
      }

      // Check size names
      const requiredSizes = ['default', 'sm', 'lg', 'icon'];
      for (const s of requiredSizes) {
        assert.ok(content.includes(`${s}:`), `Button missing size: ${s}`);
      }
    });

    it('Badge variants should define all required semantic status colors', () => {
      const badgeFile = path.join(PROJECT_ROOT, 'src', 'components', 'ui', 'badge.tsx');
      const content = fs.readFileSync(badgeFile, 'utf-8');

      const requiredVariants = ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'cyan', 'purple'];
      for (const v of requiredVariants) {
        assert.ok(content.includes(`${v}:`), `Badge missing variant: ${v}`);
      }
    });
  });

  // =========================================================================
  // 4. CSS Design Tokens, Keyframes, & Dark Mode Rules
  // =========================================================================
  describe('4. CSS Design Tokens, Keyframes, & Dark Mode Validation', () => {
    const cssPath = path.join(PROJECT_ROOT, 'src', 'app', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    it('should define all core shadcn CSS variables in HSL', () => {
      const requiredVars = [
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
        '--muted',
        '--muted-foreground',
        '--accent',
        '--accent-foreground',
        '--destructive',
        '--destructive-foreground',
        '--border',
        '--input',
        '--ring',
        '--radius',
      ];

      for (const v of requiredVars) {
        assert.ok(cssContent.includes(v), `Missing CSS variable: ${v}`);
      }

      // Verify radius is 0.75rem per specification
      assert.ok(cssContent.includes('--radius: 0.75rem;'), 'Border radius token must be 0.75rem');
    });

    it('should define all 4 aurora floating animation keyframes', () => {
      assert.ok(cssContent.includes('@keyframes aurora-1'), 'Missing @keyframes aurora-1');
      assert.ok(cssContent.includes('@keyframes aurora-2'), 'Missing @keyframes aurora-2');
      assert.ok(cssContent.includes('@keyframes aurora-3'), 'Missing @keyframes aurora-3');
      assert.ok(cssContent.includes('@keyframes aurora-4'), 'Missing @keyframes aurora-4');
      assert.ok(cssContent.includes('@keyframes pulseGlow'), 'Missing @keyframes pulseGlow');
      assert.ok(cssContent.includes('@keyframes shimmer'), 'Missing @keyframes shimmer');
    });

    it('should include prefers-reduced-motion media query for accessibility', () => {
      assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'globals.css must include prefers-reduced-motion override');
      assert.ok(cssContent.includes('animation: none !important;'), 'Reduced motion must disable animations');
    });

    it('should include Apple glassmorphic, gradient and 3D wallet card utilities', () => {
      const requiredClasses = [
        '.glass-panel',
        '.glass-card',
        '.glass-card-hover',
        '.glass-input',
        '.apple-gradient-text',
        '.apple-gradient-accent',
        '.apple-btn-primary',
        '.apple-btn-secondary',
        '.wallet-card-container',
        '.wallet-card',
        '.card-emv-chip',
        '.card-hologram-seal',
      ];

      for (const cls of requiredClasses) {
        assert.ok(cssContent.includes(cls), `Missing CSS utility class: ${cls}`);
      }
    });

    it('should configure custom font stacks in globals.css and tailwind.config.ts', () => {
      const tailwindPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
      const tailwindContent = fs.readFileSync(tailwindPath, 'utf-8');

      // Check globals.css imports
      assert.ok(cssContent.includes('sf-pro-display'), 'globals.css must import SF Pro Display font');
      assert.ok(cssContent.includes('product-sans'), 'globals.css must import Product Sans font');
      assert.ok(cssContent.includes('Plus+Jakarta+Sans'), 'globals.css must import Plus Jakarta Sans font');
      assert.ok(cssContent.includes('JetBrains+Mono'), 'globals.css must import JetBrains Mono font');

      // Check tailwind.config.ts font families
      assert.ok(tailwindContent.includes('SF Pro Display'), 'tailwind.config.ts must define SF Pro Display');
      assert.ok(tailwindContent.includes('Product Sans'), 'tailwind.config.ts must define Product Sans');
      assert.ok(tailwindContent.includes('JetBrains Mono'), 'tailwind.config.ts must define JetBrains Mono');
    });
  });

  // =========================================================================
  // 5. Layout Scaffolding & Root Layout Integrity
  // =========================================================================
  describe('5. Layout Scaffolding & Root Layout Integrity', () => {
    const layoutPath = path.join(PROJECT_ROOT, 'src', 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    it('Root layout should inject dark class, viewport config, and preconnect font links', () => {
      assert.ok(layoutContent.includes('className="dark font-sans"'), 'Root layout must have dark class');
      assert.ok(layoutContent.includes('suppressHydrationWarning'), 'Root layout must suppress hydration warning for theme');
      assert.ok(layoutContent.includes('export const viewport'), 'Root layout must export viewport configuration');
      assert.ok(layoutContent.includes('export const metadata'), 'Root layout must export metadata');
    });

    it('Root layout should load Firebase compat SDKs via next/script', () => {
      assert.ok(layoutContent.includes('firebase-app-compat.js'), 'Root layout must load firebase-app-compat.js');
      assert.ok(layoutContent.includes('firebase-auth-compat.js'), 'Root layout must load firebase-auth-compat.js');
      assert.ok(layoutContent.includes('strategy="beforeInteractive"'), 'Firebase scripts must use beforeInteractive strategy');
      assert.ok(layoutContent.includes('studysync-al-2026'), 'Firebase initialization config must use studysync-al-2026 project ID');
    });

    it('Root layout should assemble AuroraBackground, Header, Footer, and Sonner Toaster', () => {
      assert.ok(layoutContent.includes('<AuroraBackground'), 'Root layout must render AuroraBackground');
      assert.ok(layoutContent.includes('<Header'), 'Root layout must render Header');
      assert.ok(layoutContent.includes('<Footer'), 'Root layout must render Footer');
      assert.ok(layoutContent.includes('<Toaster'), 'Root layout must render Toaster');
      assert.ok(layoutContent.includes('<TooltipProvider'), 'Root layout must provide TooltipProvider');
    });

    it('Header component should implement admin whitelist check and responsive navigation', () => {
      const headerPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Header.tsx');
      const headerContent = fs.readFileSync(headerPath, 'utf-8');

      assert.ok(headerContent.includes('alwisachalaanurada@gmail.com'), 'Header must contain admin email constant');
      assert.ok(headerContent.includes('mobileMenuOpen'), 'Header must handle mobile menu state');
      assert.ok(headerContent.includes('effectiveStreak'), 'Header must calculate streak display');
      assert.ok(headerContent.includes('navLinks'), 'Header must define navigation items');
    });

    it('Footer component should include cloud sync pulse and verification route link', () => {
      const footerPath = path.join(PROJECT_ROOT, 'src', 'components', 'layout', 'Footer.tsx');
      const footerContent = fs.readFileSync(footerPath, 'utf-8');

      assert.ok(footerContent.includes('href="/verify"'), 'Footer must link to /verify');
      assert.ok(footerContent.includes('animate-ping'), 'Footer must have pulsing cloud sync indicator');
      assert.ok(footerContent.includes('StudySync Sri Lanka'), 'Footer must display brand title');
    });
  });

  // =========================================================================
  // 6. Static Export Configuration & Build Output Verification
  // =========================================================================
  describe('6. Static Export Configuration & Build Artifacts', () => {
    it('next.config.mjs should be configured for pure static HTML/CSS/JS export', () => {
      const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.mjs');
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');

      assert.ok(nextConfigContent.includes("output: 'export'"), 'next.config.mjs must have output: "export"');
      assert.ok(nextConfigContent.includes('unoptimized: true'), 'next.config.mjs must set images.unoptimized: true');
    });

    it('firebase.json should configure hosting public directory to out', () => {
      const firebasePath = path.join(PROJECT_ROOT, 'firebase.json');
      const firebaseContent = fs.readFileSync(firebasePath, 'utf-8');
      const firebaseConfig = JSON.parse(firebaseContent);

      assert.strictEqual(firebaseConfig.hosting.public, 'out', 'firebase.json hosting.public must be "out"');
    });

    it('out/ directory should contain index.html, 404.html, and _next static bundle', () => {
      const outDir = path.join(PROJECT_ROOT, 'out');
      assert.ok(fs.existsSync(outDir), 'out/ directory must exist after build');

      const indexHtml = path.join(outDir, 'index.html');
      assert.ok(fs.existsSync(indexHtml), 'out/index.html must exist');
      const indexContent = fs.readFileSync(indexHtml, 'utf-8');
      assert.ok(indexContent.includes('StudySync'), 'out/index.html must contain StudySync branding');

      const notFoundHtml = path.join(outDir, '404.html');
      assert.ok(fs.existsSync(notFoundHtml), 'out/404.html must exist');

      const nextStaticDir = path.join(outDir, '_next', 'static');
      assert.ok(fs.existsSync(nextStaticDir), 'out/_next/static directory must exist');
    });
  });

});
