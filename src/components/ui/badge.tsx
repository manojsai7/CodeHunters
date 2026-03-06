import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-white/80 border border-white/10",
        secondary: "bg-white/5 text-muted border border-border",
        success: "bg-success/10 text-success border border-success/20",
        error: "bg-error/10 text-error border border-error/20",
        gold: "bg-gold/10 text-gold border border-gold/20",
        outline: "border border-border-light text-muted",
        bestseller: "bg-accent text-black font-semibold",
        new: "bg-white text-black font-semibold",
      },
    },
    defaultVariants: { variant: "default" },
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
