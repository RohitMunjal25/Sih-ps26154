"use client";

import { LinkedInContent } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useClipboard } from "@/hooks/useClipboard";
import { Copy, Check, Share2, Hash } from "lucide-react";

interface LinkedInViewerProps {
  content: LinkedInContent;
}

export function LinkedInViewer({ content }: LinkedInViewerProps) {
  const { copy, isCopied } = useClipboard();

  const hashtags = Array.isArray(content?.hashtags) ? content.hashtags : [];

  const formattedPost = `${content.hook}

${content.body}

${hashtags
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ")}

${content.cta || ""}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            LinkedIn Formatted Post
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            copy(
              formattedPost,
              "linkedin-full",
              "LinkedIn post copied to clipboard"
            )
          }
          className="gap-1.5 text-xs"
        >
          {isCopied("linkedin-full") ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              <span>Copied Post</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Post</span>
            </>
          )}
        </Button>
      </div>

      <Card className="max-w-2xl bg-[var(--surface)]">
        <CardContent className="p-6 space-y-5">
          <div className="p-4 rounded-[6px] bg-[var(--surface-subtle)] border-l-4 border-l-[var(--primary)] border border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] block mb-1">
              Opening Hook
            </span>
            <p className="text-base font-semibold text-[var(--text-primary)] leading-snug">
              {content.hook}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Core Insight & Context
            </span>
            <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line font-normal">
              {content.body}
            </div>
          </div>

          {hashtags.length > 0 && (
            <div className="pt-3 border-t border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Recommended Hashtags
              </span>

              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag, idx) => {
                  const displayTag = tag.startsWith("#") ? tag : `#${tag}`;

                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs text-[var(--primary)] font-medium px-2 py-0.5 rounded-[4px] bg-[var(--primary-soft)] hover:opacity-90 transition-opacity"
                    >
                      <Hash className="h-3 w-3" />
                      {displayTag.replace(/^#/, "")}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
              Call to Action
            </span>

            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {content.cta || "No call to action provided."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}