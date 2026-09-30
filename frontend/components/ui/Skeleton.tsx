import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[4px] bg-[var(--surface-subtle)] border border-[var(--border)]",
        className
      )}
      {...props}
    />
  );
}
