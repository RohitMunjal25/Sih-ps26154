import { apiClient } from "./apiClient";
import {
  InputType,
  OutputType,
  ProjectParams,
  ProjectDetailsResponse,
  Project,
} from "@/types/api";

export interface CreateProjectPayload {
  title: string;
  inputType: InputType;
  inputValue?: string; // used for 'text' or 'url'
  file?: File | null; // used for 'pdf', 'docx', 'image'
  outputTypes: OutputType[];
  params?: ProjectParams;
}

export const projectService = {
  // Dispatches multipart/form-data request
  createProject: async (payload: CreateProjectPayload) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("inputType", payload.inputType);

    if (payload.inputValue) {
      formData.append("inputValue", payload.inputValue);
    }

    if (payload.file) {
      formData.append("file", payload.file);
    }

    // Backend accepts JSON stringified array
    formData.append("outputTypes", JSON.stringify(payload.outputTypes));

    if (payload.params) {
      formData.append("params", JSON.stringify(payload.params));
    }

    const res = await apiClient.post<{
      success: boolean;
      message: string;
      projectId: string;
    }>("/api/projects/generate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Polls current generation progress and structured outputs
  getProjectDetails: async (projectId: string) => {
    const res = await apiClient.get<ProjectDetailsResponse>(
      `/api/projects/${projectId}`
    );
    return res.data.data;
  },

  // Fetches project history
  getProjects: async (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);

    const res = await apiClient.get<{ success: boolean; data: Project[] }>(
      `/api/projects?${params.toString()}`
    );
    return res.data.data;
  },
};
