import { ProjectBrief } from "@/types/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { FileSearch, Sparkles, CheckCircle2, Compass } from "lucide-react";

interface ProjectBriefCardProps {
  brief?: ProjectBrief | null;
  isGenerating?: boolean;
}

export function ProjectBriefCard({
  brief,
  isGenerating = false,
}: ProjectBriefCardProps) {
  if (isGenerating && !brief) {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="bg-[var(--surface-subtle)] pb-3">
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Synthesizing Source Intelligence Brief...
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <CardHeader className="bg-[var(--surface-subtle)] border-b border-[var(--border)] py-3 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-[var(--primary)]" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Synthesized AI Intelligence Brief
          </CardTitle>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          Normalized Source
        </span>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Brief Title & Summary */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
            {brief.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            {brief.summary}
          </p>
        </div>

        {/* Intent Callout */}
        {brief.intent && (
          <div className="p-3.5 rounded-[6px] bg-[var(--surface-subtle)] border-l-3 border-l-[var(--primary)] border border-[var(--border)] flex items-start gap-2.5">
            <Compass className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                Primary Operational Intent
              </span>
              <p className="text-xs font-medium text-[var(--text-primary)] mt-0.5">
                {brief.intent}
              </p>
            </div>
          </div>
        )}

        {/* Key Facts Checklist */}
        {brief.key_facts && brief.key_facts.length > 0 && (
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2.5">
              Extracted Key Facts
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {brief.key_facts.map((fact, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-[4px] bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] leading-normal"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] shrink-0 mt-0.5" />
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
