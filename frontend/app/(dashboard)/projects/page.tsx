"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import { Project } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  ArrowRight,
  FolderKanban,
  FileQuestion,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectsHistoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setIsLoading(true);
      try {
        // Try getting projects from getProjects endpoint
        const data = await projectService.getProjects(searchQuery, statusFilter);
        if (isMounted) {
          setProjects(data || []);
          setError(null);
        }
      } catch (err) {
        console.warn("getProjects failed, falling back to dashboard recent projects:", err);
        try {
          const dashData = await userService.getDashboard();
          if (isMounted) {
            // Map recent projects to minimal Project array
            const mapped = (dashData.recentProjects || []).map((rp) => ({
              _id: rp._id,
              userId: dashData.user.id,
              title: rp.title,
              status: rp.status,
              sourceData: { inputType: "text" as const, extractedText: "" },
              createdAt: rp.createdAt,
              updatedAt: rp.createdAt,
            }));
            setProjects(mapped);
          }
        } catch (innerErr) {
          if (isMounted) {
            setError("Unable to load project history. Please check connection.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, statusFilter]);

  // Client-side filtering in case query params were cached
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const statuses = [
    { label: "All Projects", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Processing", value: "processing" },
    { label: "Failed", value: "failed" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <span className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">
            Workspace Archive
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Transformation Projects
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Audit, inspect, and export all past source transformations and intelligence outputs.
          </p>
        </div>

        <div>
          <Link href="/projects/new">
            <Button className="gap-2 shadow-sm w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>Create Transformation</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            placeholder="Search projects by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[var(--surface)] text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-[var(--text-muted)] hidden sm:block mr-1" />
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-[6px] border transition-colors cursor-pointer whitespace-nowrap",
                statusFilter === s.value
                  ? "bg-[var(--primary-soft)] text-[var(--primary-hover)] border-[var(--primary)]"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-subtle)]"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[6px] bg-[var(--error-soft)] border border-red-200 text-xs text-[var(--error)]">
          {error}
        </div>
      )}

      {/* Projects Table / Listing */}
      {isLoading ? (
        <Card>
          <div className="p-6 space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </Card>
      ) : projects.length === 0 ? (
        /* Empty Workspace State */
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              No transformations yet.
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mt-1 mb-5">
              Create your first transformation to process and generate audience-specific outputs.
            </p>
            <Link href="/projects/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Transformation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        /* No Search Results */
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <FileQuestion className="h-8 w-8 text-[var(--text-muted)] mb-2" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              No projects match your search.
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Try adjusting your query keyword or reset the status filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Project Listing */
        <Card>
          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[8px]">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[var(--surface-subtle)] transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/projects/${project._id}`}
                      className="font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors truncate block"
                    >
                      {project.title}
                    </Link>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>Created on {formatDate(project.createdAt)}</span>
                    {project.sourceData?.inputType && (
                      <>
                        <span>•</span>
                        <span className="uppercase text-[11px] font-mono">
                          {project.sourceData.inputType}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/projects/${project._id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <span>Open Studio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
