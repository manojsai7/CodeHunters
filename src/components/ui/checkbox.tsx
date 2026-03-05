"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || `checkbox-${generatedId}`;
    return (
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          className={cn(
            "mt-0.5 h-4 w-4 rounded border-border bg-surface text-primary",
            "focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background",
            "accent-primary cursor-pointer",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm text-muted cursor-pointer select-none"
          >
            {label}
          </label>
        )}
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
