"use client";

import { ExecutiveSummaryContent } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useClipboard } from "@/hooks/useClipboard";
import { Copy, Check, FileText, AlertTriangle } from "lucide-react";

interface ExecutiveSummaryViewerProps {
  content: ExecutiveSummaryContent;
}

export function ExecutiveSummaryViewer({
  content,
}: ExecutiveSummaryViewerProps) {
  const { copy, isCopied } = useClipboard();

  const keyPoints = Array.isArray(content?.key_points)
    ? content.key_points
    : [];

  const risks = Array.isArray(content?.risks) ? content.risks : [];

  const recommendations = Array.isArray(content?.recommendations)
    ? content.recommendations
    : [];

  const fullSummary = `EXECUTIVE SUMMARY

BLUF:
${content.bluf}

KEY FINDINGS:
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}

RISKS & CONCERNS:
${risks.map((risk, i) => `${i + 1}. ${risk}`).join("\n")}

STRATEGIC RECOMMENDATIONS:
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Executive Summary
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            copy(
              fullSummary,
              "executive-summary-full",
              "Executive summary copied to clipboard"
            )
          }
          className="gap-1.5 text-xs"
        >
          {isCopied("executive-summary-full") ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              <span>Copied Summary</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Summary</span>
            </>
          )}
        </Button>
      </div>

      <div className="max-w-3xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              Bottom Line Up Front
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
              {content.bluf}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              Key Findings
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                    {idx + 1}
                  </span>

                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
              Risks & Concerns
            </CardTitle>
          </CardHeader>

          <CardContent>
            {risks.length > 0 ? (
              <div className="space-y-3">
                {risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)]"
                  >
                    <span className="text-xs font-bold text-[var(--primary)]">
                      {idx + 1}.
                    </span>

                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                      {risk}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No risks or concerns provided.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              Strategic Recommendations
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                    {idx + 1}
                  </span>

                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}