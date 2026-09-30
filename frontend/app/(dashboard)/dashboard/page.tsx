"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { DashboardResponse } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, ArrowRight, FolderKanban, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const data = await userService.getDashboard();
        if (isMounted) {
          setDashboardData(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Dashboard fetch error:", err);
          setError("Unable to load dashboard data. Please verify your connection.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <span className="text-xs uppercase tracking-wider text-[var(--primary)] font-semibold">
            Operator Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Welcome back, {user?.name || "Operator"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Transform intelligence reports, web articles, documents, and media into multi-format assets.
          </p>
        </div>

        <div>
          <Link href="/projects/new">
            <Button size="lg" className="gap-2 shadow-sm w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>Create Transformation</span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[6px] bg-[var(--error-soft)] border border-red-200 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div className="h-11 w-11 rounded-[6px] bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Total Transformations
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">
                    {dashboardData?.statistics.totalProjects ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div className="h-11 w-11 rounded-[6px] bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[var(--success)]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Completed Outputs
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">
                    {dashboardData?.statistics.completedProjects ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div className="h-11 w-11 rounded-[6px] bg-amber-50 border border-amber-200 flex items-center justify-center text-[var(--warning)]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Active / Processing
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">
                    {(dashboardData?.statistics.totalProjects ?? 0) -
                      (dashboardData?.statistics.completedProjects ?? 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Transformations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              Recent Transformations
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Recently ingested source documents and generated briefings.
            </p>
          </div>

          <Link
            href="/projects"
            className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <Card>
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </Card>
        ) : !dashboardData?.recentProjects || dashboardData.recentProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                No transformations yet
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mt-1 mb-5">
                Create your first transformation to process text, web links, or documents into audience-ready outputs.
              </p>
              <Link href="/projects/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Transformation
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[8px]">
              {dashboardData.recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/projects/${project._id}`}
                      className="font-medium text-sm text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors truncate block"
                    >
                      {project.title}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Created on {formatDate(project.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge status={project.status} />
                    <Link href={`/projects/${project._id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <span>Open Studio</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
