"use client";

import { TwitterContent } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useClipboard } from "@/hooks/useClipboard";
import { Copy, Check, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TwitterViewerProps {
  content: TwitterContent;
}

export function TwitterViewer({ content }: TwitterViewerProps) {
  const { copy, isCopied } = useClipboard();

  const rawTweets = Array.isArray(content?.tweets) ? content.tweets : [];

  const tweets = rawTweets.map((tweet: any) =>
    typeof tweet === "object" ? tweet.text || "" : String(tweet)
  );

  const isThread = content?.is_thread === true;

  const fullThread = tweets
    .map((tweet, idx) => `[${idx + 1}/${tweets.length}]\n${tweet}`)
    .join("\n\n---\n\n");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--primary)]" />

          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            X / Twitter {isThread ? "Thread" : "Post"} ({tweets.length} Tweets)
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            copy(
              fullThread,
              "twitter-full",
              "Complete thread copied to clipboard"
            )
          }
          className="gap-1.5 text-xs"
        >
          {isCopied("twitter-full") ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              <span>Copied Thread</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Full Thread</span>
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4 max-w-2xl">
        {tweets.map((tweet, index) => {
          const charCount = tweet.length;
          const isOverLimit = charCount > 280;
          const tweetKey = `tweet-${index}`;

          return (
            <Card key={index} className="relative transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] text-[10px] font-bold text-[var(--primary)]">
                      {index + 1}
                    </span>

                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      Tweet {index + 1} of {tweets.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-[11px] font-mono",
                        isOverLimit
                          ? "text-[var(--error)] font-bold"
                          : "text-[var(--text-muted)]"
                      )}
                    >
                      {charCount} / 280
                    </span>

                    <button
                      onClick={() =>
                        copy(
                          tweet,
                          tweetKey,
                          `Copied Tweet ${index + 1}`
                        )
                      }
                      title="Copy Tweet"
                      className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors p-1"
                    >
                      {isCopied(tweetKey) ? (
                        <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                  {tweet}
                </p>

                {isOverLimit && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--error)] bg-[var(--error-soft)] px-2.5 py-1 rounded-[4px]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Exceeds standard 280 character limit</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}