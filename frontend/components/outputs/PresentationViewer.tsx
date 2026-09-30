"use client";

import { useState, useEffect, useCallback } from "react";
import { PresentationContent, SlideItem } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { useClipboard } from "@/hooks/useClipboard";
import {
  Copy,
  Check,
  Presentation,
  ChevronLeft,
  ChevronRight,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PresentationViewerProps {
  content: PresentationContent;
}

export function PresentationViewer({ content }: PresentationViewerProps) {
  const { copy, isCopied } = useClipboard();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const rawSlides = Array.isArray(content?.slides) ? content.slides : [];

  const slides: SlideItem[] = rawSlides.map((slide, index) => ({
    title: slide?.title || `Slide ${index + 1}`,
    bullets: Array.isArray(slide?.bullets) ? slide.bullets : [],
    speaker_notes: slide?.speaker_notes || "",
  }));

  const totalSlides = slides.length;

  const currentSlide = slides[currentSlideIndex] || {
    title: "Untitled Slide",
    bullets: [],
    speaker_notes: "",
  };

  const downloadUrl = (content as any)?.downloadUrl || "";
  const fileName = (content as any)?.fileName || "presentation.pptx";

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setShowNotes(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) =>
      prev < totalSlides - 1 ? prev + 1 : prev
    );
    setShowNotes(false);
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrev();
      }

      if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePrev, handleNext]);

  const fullDeckText = slides
    .map(
      (slide, index) =>
        `SLIDE ${index + 1}: ${slide.title}

${slide.bullets.map((bullet) => `• ${bullet}`).join("\n")}${
          slide.speaker_notes
            ? `\n\nSPEAKER NOTES:\n${slide.speaker_notes}`
            : ""
        }`
    )
    .join("\n\n====================\n\n");

  if (totalSlides === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No slides generated for this presentation deck.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Presentation className="h-4 w-4 text-[var(--primary)]" />

          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Presentation Slide Deck ({totalSlides} Slides)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={fileName}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PPTX</span>
            </a>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              copy(
                fullDeckText,
                "deck-full",
                "All slides copied to clipboard"
              )
            }
            className="gap-1.5 text-xs"
          >
            {isCopied("deck-full") ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                <span>Copied Deck</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy All Slides</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl space-y-4">
        <Card className="min-h-[380px] flex flex-col justify-between shadow-[var(--shadow-md)] bg-[var(--surface)] border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between bg-[var(--surface-subtle)] border-b border-[var(--border)] py-3 px-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>

            <div className="flex items-center gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlideIndex(index);
                    setShowNotes(false);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all cursor-pointer",
                    currentSlideIndex === index
                      ? "w-6 bg-[var(--primary)]"
                      : "w-2 bg-[var(--border-strong)] hover:bg-[var(--text-muted)]"
                  )}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-8 sm:p-10 flex-1 flex flex-col justify-center space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {currentSlide.title}
            </h2>

            {currentSlide.bullets.length > 0 ? (
              <ul className="space-y-3.5">
                {currentSlide.bullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm sm:text-base text-[var(--text-primary)] leading-relaxed"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No bullet points provided for this slide.
              </p>
            )}
          </CardContent>

          <CardFooter className="py-3 px-6 bg-[var(--surface-subtle)] border-t border-[var(--border)] flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer",
                showNotes
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />

              <span>Speaker Notes</span>

              {showNotes ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentSlideIndex === totalSlides - 1}
              className="gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>

        {showNotes && (
          <div className="p-4 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)] text-xs space-y-1.5">
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Talking Points & Speaker Context
            </span>

            <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
              {currentSlide.speaker_notes ||
                "No specific speaker notes for this slide."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}