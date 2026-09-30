"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjectPolling } from "@/hooks/useProjectPolling";
import { OutputType, ProjectOutput } from "@/types/api";
import { OUTPUT_OPTIONS } from "@/lib/constants";
import { ProjectBriefCard } from "@/components/projects/ProjectBriefCard";
import { LinkedInViewer } from "@/components/outputs/LinkedInViewer";
import { TwitterViewer } from "@/components/outputs/TwitterViewer";
import { AdvisoryViewer } from "@/components/outputs/AdvisoryViewer";
import { VideoViewer } from "@/components/outputs/VideoViewer";
import { ExecutiveSummaryViewer } from "@/components/outputs/ExecutiveSummaryViewer";
import { PresentationViewer } from "@/components/outputs/PresentationViewer";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectStudioPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";

  const { project, outputs, isLoading, isPolling, error, refetch } =
    useProjectPolling(projectId);

  const [activeTab, setActiveTab] = useState<OutputType | null>(null);

  // Available outputs sorted by the order they were requested
  const outputTabs = useMemo(() => {
    if (!outputs || outputs.length === 0) return [];
    return outputs.map((out) => {
      const match = OUTPUT_OPTIONS.find((opt) => opt.type === out.outputType);
      return {
        outputType: out.outputType,
        label: match ? match.label : out.outputType,
        status: out.status,
        output: out,
      };
    });
  }, [outputs]);

  // Set initial active tab when outputs become available
  const effectiveActiveTab: OutputType | null = useMemo(() => {
    if (activeTab && outputTabs.some((t) => t.outputType === activeTab)) {
      return activeTab;
    }
    return outputTabs.length > 0 ? outputTabs[0].outputType : null;
  }, [activeTab, outputTabs]);

  const activeOutput: ProjectOutput | undefined = useMemo(() => {
    return outputs.find((o) => o.outputType === effectiveActiveTab);
  }, [outputs, effectiveActiveTab]);

  if (isLoading && !project) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="h-12 w-12 rounded-full bg-[var(--error-soft)] text-[var(--error)] flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Transformation Project Not Found
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          The requested transformation record could not be loaded from the server.
        </p>
        <Link href="/projects">
          <Button variant="secondary" className="gap-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <Link
            href="/projects"
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Projects History</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {project?.title || "Content Transformation"}
          </h1>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
            <span>
              Source Format:{" "}
              <strong className="text-[var(--text-secondary)] uppercase">
                {project?.sourceData?.inputType}
              </strong>
            </span>
            {project?.params?.tone && (
              <>
                <span>•</span>
                <span>
                  Tone:{" "}
                  <strong className="text-[var(--text-secondary)]">
                    {project.params.tone}
                  </strong>
                </span>
              </>
            )}
            {project?.params?.audience && (
              <>
                <span>•</span>
                <span>
                  Audience:{" "}
                  <strong className="text-[var(--text-secondary)]">
                    {project.params.audience}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {project?.status && <StatusBadge status={project.status} />}

          {isPolling && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--primary)] px-2.5 py-1 rounded-[4px] bg-[var(--primary-soft)] animate-pulse">
              <Sparkles className="h-3 w-3 animate-spin" />
              <span>Pipeline Active (2.5s)</span>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            title="Manual sync"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Brief Section (Appears independently as soon as generated) */}
      <ProjectBriefCard
        brief={project?.brief}
        isGenerating={project?.status === "processing" && !project?.brief}
      />

      {/* Structured Output Formats Studio */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)]">
          {/* Format Tabs */}
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {outputTabs.map((tab) => {
              const isActive = effectiveActiveTab === tab.outputType;
              return (
                <button
                  key={tab.outputType}
                  onClick={() => setActiveTab(tab.outputType)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-subtle)]"
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.status === "done" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                  )}
                  {tab.status === "generating" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                  )}
                  {tab.status === "failed" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--error)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Output Presentation */}
        {!activeOutput ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
              <Layers className="h-8 w-8 text-[var(--text-muted)]" />
              <span>No output selected.</span>
            </CardContent>
          </Card>
        ) : activeOutput.status === "generating" ? (
          /* Generating State */
          <Card className="bg-[var(--surface)]">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-2 text-[var(--primary)] text-sm font-semibold">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Generating {effectiveActiveTab} format...</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                The LLM pipeline is synthesizing and structuring audience-specific content from the brief.
              </p>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-3/4" />
            </CardContent>
          </Card>
        ) : activeOutput.status === "pending" ? (
          /* Pending State */
          <Card className="bg-[var(--surface)] border-dashed">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Clock className="h-7 w-7 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Waiting to generate
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm">
                This format is queued in the background transformation pipeline.
              </p>
            </CardContent>
          </Card>
        ) : activeOutput.status === "failed" ? (
          /* Failed State */
          <Card className="border-red-200 bg-[var(--error-soft)]">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-[var(--error)] font-bold text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Generation Failed</span>
              </div>
              <p className="text-xs text-[var(--error)] leading-relaxed">
                Unable to generate this format. The model encountered an issue during output structuring.
              </p>
              {activeOutput.errorLog && (
                <p className="text-[11px] font-mono p-2 bg-white rounded border border-red-200 text-red-700">
                  {activeOutput.errorLog}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2 text-xs border-red-300 text-[var(--error)] hover:bg-white"
              >
                Retry Fetch
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Completed Output Viewers */
          <div>
            {activeOutput.outputType === "linkedin" && (
              <LinkedInViewer content={activeOutput.content as any} />
            )}
            {activeOutput.outputType === "twitter" && (
              <TwitterViewer content={activeOutput.content as any} />
            )}
            {activeOutput.outputType === "advisory" && (
              <AdvisoryViewer content={activeOutput.content as any} />
            )}
            {activeOutput.outputType === "video" && (
              <VideoViewer content={activeOutput.content as any} />
            )}
            {activeOutput.outputType === "executive_summary" && (
              <ExecutiveSummaryViewer content={activeOutput.content as any} />
            )}
            {activeOutput.outputType === "presentation" && (
              <PresentationViewer content={activeOutput.content as any} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
