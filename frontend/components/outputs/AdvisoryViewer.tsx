"use client";

import { useState } from "react";
import { AdvisoryContent } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/Badge";
import { useClipboard } from "@/hooks/useClipboard";
import { Copy, Check, ShieldAlert, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvisoryViewerProps {
  content: AdvisoryContent;
}

export function AdvisoryViewer({ content }: AdvisoryViewerProps) {
  const { copy, isCopied } = useClipboard();
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const mitigations = Array.isArray(content?.mitigation)
    ? content.mitigation
    : [];

  const affectedSystems = Array.isArray(content?.affected_systems)
    ? content.affected_systems
    : [];

  const references = Array.isArray(content?.references)
    ? content.references
    : [];

  const formattedAdvisory = `SECURITY / TECHNICAL ADVISORY
Title: ${content.title}
Severity Rating: ${content.severity}

EXECUTIVE SUMMARY:
${content.summary}

AFFECTED SYSTEMS:
${affectedSystems.map((system, i) => `${i + 1}. ${system}`).join("\n")}

IMPACT:
${content.impact || "No impact information provided."}

ACTIONABLE MITIGATION STEPS:
${mitigations.map((step, i) => `${i + 1}. [ ] ${step}`).join("\n")}

REFERENCES:
${references.map((reference, i) => `${i + 1}. ${reference}`).join("\n")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[var(--primary)]" />

          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Security & Technical Advisory
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            copy(
              formattedAdvisory,
              "advisory-full",
              "Advisory copied to clipboard"
            )
          }
          className="gap-1.5 text-xs"
        >
          {isCopied("advisory-full") ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              <span>Copied Advisory</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Advisory</span>
            </>
          )}
        </Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[var(--surface-subtle)] border-b border-[var(--border)]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Formal Advisory Title
            </span>

            <CardTitle className="text-lg font-bold text-[var(--text-primary)]">
              {content.title}
            </CardTitle>
          </div>

          <div className="shrink-0">
            <SeverityBadge severity={content.severity || "Medium"} />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Threat Summary & Technical Context
            </span>

            <p className="text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)]">
              {content.summary}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Affected Systems
            </span>

            {affectedSystems.length > 0 ? (
              <div className="space-y-2">
                {affectedSystems.map((system, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                  >
                    {system}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No affected systems provided.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Impact
            </span>

            <p className="text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--border)]">
              {content.impact || "No impact information provided."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Required Mitigation & Action Checklist
              </span>

              <span className="text-[11px] text-[var(--text-muted)]">
                {Object.values(completedSteps).filter(Boolean).length} of{" "}
                {mitigations.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {mitigations.map((step, idx) => {
                const isChecked = !!completedSteps[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-[6px] border transition-all cursor-pointer select-none",
                      isChecked
                        ? "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-muted)] line-through"
                        : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]"
                    )}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-[var(--primary)] shrink-0 focus:outline-none"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-[var(--success)]" />
                      ) : (
                        <Square className="h-4 w-4 text-[var(--text-muted)]" />
                      )}
                    </button>

                    <span className="text-sm leading-relaxed">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              References
            </span>

            {references.length > 0 ? (
              <div className="space-y-2">
                {references.map((reference, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                  >
                    {reference}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No references provided.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}