"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { projectService } from "@/services/projectService";
import { Project, ProjectOutput } from "@/types/api";

interface UseProjectPollingReturn {
  project: Project | null;
  outputs: ProjectOutput[];
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjectPolling(projectId: string): UseProjectPollingReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [outputs, setOutputs] = useState<ProjectOutput[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchDetails = useCallback(async () => {
    if (!projectId) return;

    try {
      const data = await projectService.getProjectDetails(projectId);
      if (!isMountedRef.current) return;

      setProject(data.project);
      setOutputs(data.outputs || []);
      setError(null);

      // Check whether terminal state reached
      const isTerminal =
        data.project.status === "completed" || data.project.status === "failed";

      if (isTerminal) {
        setIsPolling(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setIsPolling(true);
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      console.error("Polling fetch error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load project details";
      setError(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [projectId]);

  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);

    // Initial fetch immediately
    fetchDetails();

    // Setup 2500ms polling interval
    timerRef.current = setInterval(() => {
      fetchDetails();
    }, 2500);

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchDetails]);

  return {
    project,
    outputs,
    isLoading,
    isPolling,
    error,
    refetch: fetchDetails,
  };
}
