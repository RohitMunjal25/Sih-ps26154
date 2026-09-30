import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "processing"
    | "pending";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]",
    primary:
      "bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-soft)] font-medium",
    success:
      "bg-[var(--success-soft)] text-[var(--success)] border border-emerald-200 font-medium",
    warning:
      "bg-amber-50 text-[var(--warning)] border border-amber-200 font-medium",
    error:
      "bg-[var(--error-soft)] text-[var(--error)] border border-red-200 font-medium",
    processing:
      "bg-orange-50 text-[var(--primary)] border border-orange-200 animate-pulse font-medium",
    pending:
      "bg-gray-100 text-[var(--text-muted)] border border-[var(--border)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] leading-tight",
    md: "px-2.5 py-1 text-xs leading-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] font-medium tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "completed":
    case "done":
      return (
        <Badge variant="success" size="sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          Completed
        </Badge>
      );
    case "processing":
    case "generating":
      return (
        <Badge variant="processing" size="sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="error" size="sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--error)]" />
          Failed
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="pending" size="sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]" />
          Pending
        </Badge>
      );
  }
}

export function SeverityBadge({ severity }: { severity: string }) {
  const norm = severity.toLowerCase();
  if (norm.includes("critical")) {
    return <Badge variant="error">Critical Severity</Badge>;
  }
  if (norm.includes("high")) {
    return <Badge variant="warning">High Severity</Badge>;
  }
  if (norm.includes("med")) {
    return <Badge variant="primary">Medium Severity</Badge>;
  }
  return <Badge variant="default">Low Severity</Badge>;
}
