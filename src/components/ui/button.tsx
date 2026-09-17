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
          "bg-background/80 border border-border text-foreground hover:bg-background shadow-sm",
        terracotta:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-full px-3.5 text-xs",
        lg: "h-12 rounded-full px-8 text-base font-semibold",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
