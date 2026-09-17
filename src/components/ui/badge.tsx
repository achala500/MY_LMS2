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
          "border-[#e6e4dd] bg-[#efece6] dark:bg-[#1F2227] text-[#242220] dark:text-[#f6f0ec]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
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
