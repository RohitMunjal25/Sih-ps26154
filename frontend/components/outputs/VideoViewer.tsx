"use client";

import { VideoContent, VideoStoryboardScene } from "@/types/api";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { useClipboard } from "@/hooks/useClipboard";
import {
  Copy,
  Check,
  Video,
  Film,
  Eye,
  Mic,
  Captions,
  FileText,
} from "lucide-react";

interface VideoViewerProps {
  content: VideoContent;
}

export function VideoViewer({ content }: VideoViewerProps) {
  const { copy, isCopied } = useClipboard();

  const narrationText =
    content?.narration ||
    content?.script ||
    "";

  const storyboard =
    Array.isArray(content?.storyboard)
      ? content.storyboard
      : [];

  const scenes =
    Array.isArray(content?.scenes) && content.scenes.length > 0
      ? content.scenes
      : storyboard;

  const normalizedScenes: VideoStoryboardScene[] =
    scenes.map((item: any, index: number) => {
      if (typeof item === "string") {
        return {
          scene_number: index + 1,
          title: `Scene ${index + 1}`,
          description: item,
          narration: "",
          visual: item,
        };
      }

      return {
        scene_number:
          Number(item?.scene_number) || index + 1,
        title:
          item?.title || `Scene ${index + 1}`,
        description:
          item?.description || "",
        narration:
          item?.narration || "",
        visual:
          item?.visual || "",
      };
    });

  const subtitles = content?.subtitles || "";

  const visualRecommendations =
    Array.isArray(content?.visual_recommendations)
      ? content.visual_recommendations
      : [];

  const fullVideoPackage = `
VIDEO SCRIPT

${content?.script || ""}

NARRATION

${narrationText}

SUBTITLES

${subtitles}

STORYBOARD

${normalizedScenes
  .map(
    (scene) =>
      `Scene ${scene.scene_number}: ${scene.title}

Description:
${scene.description}

Visual:
${scene.visual}

Narration:
${scene.narration}`
  )
  .join("\n\n--------------------\n\n")}

VISUAL RECOMMENDATIONS

${visualRecommendations
  .map(
    (item) =>
      `${item.title}
${item.description}`
  )
  .join("\n\n")}
`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-[var(--primary)]" />

          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Video Script & Storyboard
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            copy(
              fullVideoPackage,
              "video-full",
              "Complete video package copied"
            )
          }
          className="gap-1.5 text-xs"
        >
          {isCopied("video-full") ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              <span>Copied Package</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Video Package</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="bg-[var(--surface-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--primary)]" />

                <CardTitle className="text-sm">
                  Video Script
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="p-4 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)] text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-line max-h-[350px] overflow-y-auto">
                {content?.script ||
                  "No video script generated."}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-[var(--surface-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-[var(--primary)]" />

                <CardTitle className="text-sm">
                  Narration Voiceover
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="p-4 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)] font-serif text-sm leading-relaxed text-[var(--text-primary)] max-h-[400px] overflow-y-auto whitespace-pre-line">
                {narrationText ||
                  "No narration text generated."}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-[var(--surface-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Captions className="h-4 w-4 text-[var(--primary)]" />

                <CardTitle className="text-sm">
                  Subtitles
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="p-4 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)] text-xs leading-relaxed text-[var(--text-primary)] whitespace-pre-line max-h-[300px] overflow-y-auto">
                {subtitles ||
                  "No subtitles generated."}
              </div>
            </CardContent>
          </Card>

          {visualRecommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[var(--primary)]" />

                  <CardTitle className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    Production Directives
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="space-y-4">
                  {visualRecommendations.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)]"
                      >
                        <div className="text-xs font-semibold text-[var(--text-primary)]">
                          {item.title ||
                            `Recommendation ${index + 1}`}
                        </div>

                        <div className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-[var(--surface-subtle)] flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-[var(--primary)]" />

                <CardTitle className="text-sm">
                  Audio-Visual Storyboard
                </CardTitle>
              </div>

              <span className="text-xs text-[var(--text-muted)] font-medium">
                {normalizedScenes.length} Scenes
              </span>
            </CardHeader>

            <CardContent className="p-0">
              {normalizedScenes.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  No storyboard scenes generated.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)] overflow-hidden">
                  {normalizedScenes.map(
                    (scene, index) => (
                      <div
                        key={index}
                        className="p-5 space-y-4 hover:bg-[var(--surface-subtle)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[4px] bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-bold text-[var(--primary)]">
                            Scene{" "}
                            {scene.scene_number}
                          </span>

                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                            {scene.title}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              Scene Description
                            </span>

                            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                              {scene.description ||
                                "No description available."}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              Visual Cue
                            </span>

                            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                              {scene.visual ||
                                "No visual recommendation available."}
                            </p>
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              Narration / Dialogue
                            </span>

                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                              {scene.narration ||
                                "No narration available."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}