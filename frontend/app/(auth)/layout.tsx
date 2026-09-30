import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--background)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--primary)] text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>NTRO Gen AI Workspace</span>
        </Link>
        <p className="mt-1.5 text-xs text-[var(--text-secondary)] font-medium">
          Automated Enterprise Content Transformation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--surface)] py-8 px-6 shadow-[var(--shadow-md)] border border-[var(--border)] sm:rounded-[8px] sm:px-10">
          {children}
        </div>
      </div>
    </main>
  );
}
