"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none rounded-[6px] cursor-pointer";

    const variants = {
      primary:
        "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus:ring-[var(--primary-soft)] active:bg-[var(--primary-hover)]",
      secondary:
        "bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border)] focus:ring-[var(--border)] border border-[var(--border)]",
      outline:
        "bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] focus:ring-[var(--border)]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] focus:ring-[var(--border)]",
      danger:
        "bg-[var(--error)] text-white hover:opacity-90 focus:ring-red-300",
      subtle:
        "bg-[var(--primary-soft)] text-[var(--primary-hover)] hover:opacity-90 focus:ring-[var(--primary-soft)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs tracking-wide",
      md: "h-9 px-4 text-sm",
      lg: "h-11 px-5 text-base font-semibold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
