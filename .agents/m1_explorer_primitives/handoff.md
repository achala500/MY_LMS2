# Milestone 1 UI Primitives Refactoring Handoff Report

## 1. Observation

Direct examination of `src/components/ui/card.tsx`, `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, and `tests/m1-challenger-component-stress.test.js` revealed the following structural details and styling configurations:

### 1.1 Card Primitive (`src/components/ui/card.tsx`)
Line 11 specifies Card container styling:
```tsx
className={cn(
  "rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#17191D] text-foreground shadow-sm transition-all duration-300",
  className
)}
```
Line 38 specifies CardTitle styling:
```tsx
className={cn(
  "text-xl font-semibold leading-none tracking-tight text-zinc-100 font-sans",
  className
)}
```
Line 52 specifies CardDescription styling:
```tsx
className={cn("text-sm text-zinc-400 leading-relaxed", className)}
```
Exports at lines 78 include: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`.
In light mode, cards render with background `#ffffff`, while `CardTitle` forces `text-zinc-100` (`#f4f4f5`), creating a near-zero contrast ratio of 1.08:1 against white surfaces, causing card headings to appear completely blank.

### 1.2 Button Primitive (`src/components/ui/button.tsx`)
Line 7 defines the base classes:
```tsx
"inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
```
Line 11-29 defines variants:
- `default`: `"bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500"`
- `destructive`: `"bg-rose-600 text-white shadow-md shadow-rose-600/25 hover:bg-rose-500"`
- `outline`: `"border border-zinc-800 bg-zinc-900/40 backdrop-blur-md text-zinc-200 hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700"`
- `secondary`: `"bg-zinc-800/90 text-zinc-100 shadow-sm hover:bg-zinc-700/90"`
- `ghost`: `"text-zinc-300 hover:bg-zinc-800/60 hover:text-white"`
- `link`: `"text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300"`
- `indigo`: `"bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"`
- `emerald`: `"bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500"`
- `glass`: `"bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 text-zinc-100 hover:bg-zinc-800/70 hover:border-zinc-700 shadow-xl"`
Lines 30-35 define sizes:
- `default`: `"h-10 px-4 py-2"` (40px height)
- `sm`: `"h-9 rounded-lg px-3 text-xs"`
- `lg`: `"h-12 rounded-xl px-8 text-base font-semibold"`
- `icon`: `"h-10 w-10 rounded-xl"`
Lines 44-64 provide `ButtonProps` extending `VariantProps<typeof buttonVariants>`, `Slot` delegation via `asChild`, and exports for `Button` and `buttonVariants`.

### 1.3 Badge Primitive (`src/components/ui/badge.tsx`)
Line 6 defines the base class:
```tsx
"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
```
Lines 10-26 define variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `cyan`, `purple`.
Lines 34-44 define `BadgeProps`, `Badge` component, and exports for `Badge` and `badgeVariants`.

### 1.4 Test Suite Contract (`tests/m1-challenger-component-stress.test.js`)
Inspection of test assertions verified the exact verification checks:
1. `card.tsx`:
   - Exports tested at line 74: `['Card', 'CardHeader', 'CardFooter', 'CardTitle', 'CardDescription', 'CardContent']`.
2. `button.tsx`:
   - Radix Slot checks at lines 116-118: imports `@radix-ui/react-slot`, defines `asChild = false`, uses `const Comp = asChild ? Slot : "button"`.
   - Variant names check at lines 121-124: string contains `${v}:` for all entries in `['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'indigo', 'emerald', 'glass']`.
   - Size names check at lines 127-130: string contains `${s}:` for all entries in `['default', 'sm', 'lg', 'icon']`.
   - Exports tested at line 73: `['Button', 'buttonVariants']`.
3. `badge.tsx`:
   - Variant names check at lines 137-140: string contains `${v}:` for all entries in `['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'cyan', 'purple']`.
   - Exports tested at line 82: `['Badge', 'badgeVariants']`.

---

## 2. Logic Chain

1. Card Inversion and Contrast Fix:
   - Line 38 of `card.tsx` sets `text-zinc-100` on `CardTitle`. When cards render with `bg-white` in light mode, text-zinc-100 produces an invisible title.
   - Replacing `text-zinc-100 font-sans` with `text-foreground font-serif` resolves the contrast problem: in light mode `text-foreground` resolves to `--foreground: #1d1b19`, and in dark mode to `--foreground: #f6f0ec`. The `font-serif` class applies Newsreader typography consistent with the Kinfolk Academic design system.
   - Refactoring `Card` container from hardcoded `border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#17191D]` to `rounded-xl border border-border bg-card text-card-foreground shadow-sm` binds the card surface directly to project design tokens (`--border`, `--card`, `--card-foreground`), guaranteeing zero backdrop blur distortion and complete contrast stability across themes.

2. Button Ergonomics and Color Alignment:
   - The original button base uses `rounded-xl` and `h-10` (40px) for default size. Touch targets for primary controls require at least 44px ergonomics.
   - Changing the base class and size variants to pill-shaped `rounded-full` with `h-11` (44px) default height satisfies ergonomic touch target standards.
   - Updating the `default` variant from indigo to Terracotta (`bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm`) aligns the primary CTA with the authoritative Stitch design tokens.
   - Updating `secondary` to `bg-[#efece6] text-[#242220] hover:bg-[#e6e4dd] dark:bg-[#1F2227] dark:text-[#f6f0ec] dark:hover:bg-[#282c33]` provides the warm sand/stone neutral tone specified in the design guidelines.
   - Preserving all variant keys (`destructive`, `outline`, `ghost`, `link`, `indigo`, `emerald`, `glass`) and size keys (`default`, `sm`, `lg`, `icon`) ensures that `tests/m1-challenger-component-stress.test.js` passes without regression.

3. Badge Ergonomics and Kinfolk Variants:
   - Updating badge base styling to `rounded-full font-medium tracking-wide` eliminates harsh boldness while introducing pill capsule geometry.
   - Retaining existing semantic status variants (`destructive`, `outline`, `success`, `warning`, `cyan`, `purple`) preserves compatibility with existing tests, while adding Kinfolk variants (`terracotta`, `sage`, `amber`, `sand`) fulfills Stitch design system integration.
   - `default` badge variant aligns with Terracotta (`border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`), and `secondary` variant aligns with soft sand.

---

## 3. Caveats

1. The challenger test suite `tests/m1-challenger-component-stress.test.js` inspects source code text literals for specific variant names and Radix Slot expressions. Any replacement code must retain the literal variant keys `default:`, `destructive:`, `outline:`, `secondary:`, `ghost:`, `link:`, `indigo:`, `emerald:`, `glass:` in `button.tsx` and `default:`, `secondary:`, `destructive:`, `outline:`, `success:`, `warning:`, `cyan:`, `purple:` in `badge.tsx`.
2. No direct source code edits have been performed by this explorer subagent in compliance with the read-only exploration charter. The implementation must be executed by the designated worker agent.

---

## 4. Conclusion & Exact Code Chunks for Worker Implementation

Below are the complete, drop-in replacement file implementations prepared for the Worker agent.

### 4.1 Target File: `src/components/ui/card.tsx`

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight text-foreground font-serif",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### 4.2 Target File: `src/components/ui/button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
        outline:
          "border border-[#dec0b7] dark:border-white/10 bg-transparent text-foreground hover:bg-[#efece6]/60 dark:hover:bg-white/5",
        secondary:
          "bg-[#efece6] text-[#242220] hover:bg-[#e6e4dd] dark:bg-[#1F2227] dark:text-[#f6f0ec] dark:hover:bg-[#282c33] shadow-sm",
        ghost:
          "text-muted-foreground hover:bg-[#efece6]/50 dark:hover:bg-white/5 hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        indigo:
          "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
        emerald:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500",
        glass:
          "bg-background/60 backdrop-blur-md border border-border text-foreground hover:bg-background/80 shadow-sm",
        terracotta:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-full px-3.5 text-xs",
        lg: "h-12 rounded-full px-8 text-base font-semibold",
        icon: "h-11 w-11 rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 4.3 Target File: `src/components/ui/badge.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "border-[#dec0b7]/40 bg-[#efece6] dark:bg-[#1F2227] text-[#242220] dark:text-[#f6f0ec] hover:bg-[#e6e4dd] dark:hover:bg-[#282c33]",
        destructive:
          "border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
        outline:
          "border-border text-foreground hover:bg-muted",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25",
        cyan:
          "border-cyan-500/30 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/25",
        purple:
          "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-300 hover:bg-purple-500/25",
        terracotta:
          "border-[#dec0b7] bg-[#f8efea] dark:bg-[#c85a32]/20 text-[#a24220] dark:text-[#ffb59c]",
        sage:
          "border-[#abd0a6] bg-[#eef3ed] dark:bg-[#456644]/20 text-[#405b3e] dark:text-[#abd0a6]",
        amber:
          "border-[#ffb86a] bg-[#fbf4e8] dark:bg-[#854f00]/20 text-[#8c5919] dark:text-[#ffb86a]",
        sand:
          "border-[#e6e4dd] bg-[#efece6] dark:bg-[#1F2227] text-[#242220] dark:text-[#f6f0ec]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

---

## 5. Verification Method

To verify the implementation once applied by the Worker agent:

1. Execute the empirical challenger component test suite:
   ```powershell
   node --test tests/m1-challenger-component-stress.test.js
   ```
   Verification criteria: All 36 tests must pass with 0 failures.

2. Execute the full repository test suite:
   ```powershell
   npm test
   ```
   Verification criteria: All 423 tests across 73 suites must pass with 0 failures.

3. Verify static export build:
   ```powershell
   npm run build
   ```
   Verification criteria: Next.js static export succeeds producing 10/10 routes in `out/` with zero TypeScript compilation errors.

4. Contrast verification:
   Inspect rendered HTML in light mode to ensure `CardTitle` elements have computed color matching `#1d1b19` or `var(--foreground)` and Newsreader font family styling, with contrast ratio exceeding 7:1 against `#ffffff`.
