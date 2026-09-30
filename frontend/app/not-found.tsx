import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--primary)] mx-auto">
          <FileQuestion className="h-7 w-7" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[var(--primary)]">
            404 Error
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            The workspace record, transformation, or page you are attempting to access does not exist or has been moved.
          </p>
        </div>
        <div>
          <Link href="/dashboard">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
