"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { projectService } from "@/services/projectService";
import { InputType, OutputType } from "@/types/api";
import {
  INPUT_OPTIONS,
  OUTPUT_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/constants";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

import {
  FileText,
  Globe,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Video,
  UploadCloud,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Save,
  CheckSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import axios from "axios";

/* =========================================================
   LOCAL PARAMETER OPTIONS
========================================================= */

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
];

const DETAIL_LEVEL_OPTIONS = [
  "Brief",
  "Standard",
  "Detailed",
];

const OBJECTIVE_OPTIONS = [
  "Inform",
  "Alert",
  "Educate",
  "Promote",
];

const CONTENT_STYLE_OPTIONS = [
  "Professional",
  "News / Report",
  "Social Media",
  "Government / Official",
  "Technical",
  "Storytelling",
  "Executive",
];

/* =========================================================
   TYPES
========================================================= */

interface OutputOverride {
  enabled: boolean;
  tone: string;
  audience: string;
  language: string;
  detailLevel: string;
  contentStyle: string;
}

type OutputOverrides = Record<string, OutputOverride>;

/* =========================================================
   PAGE
========================================================= */

export default function NewProjectPage() {
  const router = useRouter();

  const { success, error: toastError } = useToast();

  /* -------------------------------------------------------
     SOURCE
  ------------------------------------------------------- */

  const [title, setTitle] = useState("");

  const [inputType, setInputType] =
    useState<InputType>("text");

  const [inputValue, setInputValue] = useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [context, setContext] = useState("");

  /* -------------------------------------------------------
     OUTPUTS
  ------------------------------------------------------- */

  const [selectedOutputs, setSelectedOutputs] =
    useState<OutputType[]>([
      "linkedin",
      "executive_summary",
    ]);

  /* -------------------------------------------------------
     GLOBAL PARAMETERS
  ------------------------------------------------------- */

  const [language, setLanguage] =
    useState("English");

  const [tone, setTone] =
    useState("Professional");

  const [audience, setAudience] =
    useState("");

  const [detailLevel, setDetailLevel] =
    useState("Standard");

  const [objective, setObjective] =
    useState("Inform");

  const [contentStyle, setContentStyle] =
    useState("Professional");

  /* -------------------------------------------------------
     PER OUTPUT OVERRIDES
  ------------------------------------------------------- */

  const [outputOverrides, setOutputOverrides] =
    useState<OutputOverrides>({});

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* =========================================================
     OUTPUT TOGGLE
  ========================================================= */

  const toggleOutput = (type: OutputType) => {
    setSelectedOutputs((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) {
          toastError(
            "Selection required",
            "At least one target output format must be selected."
          );

          return prev;
        }

        return prev.filter(
          (item) => item !== type
        );
      }

      return [...prev, type];
    });
  };

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const allOutputsSelected =
    selectedOutputs.length ===
    OUTPUT_OPTIONS.length;

  const toggleSelectAll = () => {
    if (allOutputsSelected) {
      setSelectedOutputs(["linkedin"]);
      return;
    }

    setSelectedOutputs(
      OUTPUT_OPTIONS.map(
        (option) => option.type
      )
    );
  };

  /* =========================================================
     FILE HANDLING
  ========================================================= */

  const getMaxFileSize = () => {
    return inputType === "video"
      ? 100 * 1024 * 1024
      : 10 * 1024 * 1024;
  };

  const validateFile = (selectedFile: File) => {
    const maxSize = getMaxFileSize();

    if (selectedFile.size > maxSize) {
      setValidationError(
        inputType === "video"
          ? "Video size must be less than 100 MB."
          : "Selected file exceeds the 10 MB limit."
      );

      return false;
    }

    return true;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) return;

    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    setValidationError(null);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    const droppedFile =
      e.dataTransfer.files?.[0];

    if (!droppedFile) return;

    if (!validateFile(droppedFile)) {
      return;
    }

    setFile(droppedFile);
    setValidationError(null);
  };

  const removeFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     INPUT ICON
  ========================================================= */

  const getInputIcon = (
    type: InputType
  ) => {
    switch (type) {
      case "text":
        return FileText;

      case "url":
        return Globe;

      case "pdf":
        return FileCode;

      case "docx":
        return FileSpreadsheet;

      case "image":
        return ImageIcon;

      case "video":
        return Video;

      default:
        return FileText;
    }
  };

  /* =========================================================
     OUTPUT OVERRIDE
  ========================================================= */

  const getOverride = (
    outputType: OutputType
  ): OutputOverride => {
    return (
      outputOverrides[outputType] || {
        enabled: false,
        tone,
        audience,
        language,
        detailLevel,
        contentStyle,
      }
    );
  };

  const updateOverride = (
    outputType: OutputType,
    changes: Partial<OutputOverride>
  ) => {
    const current =
      getOverride(outputType);

    setOutputOverrides((prev) => ({
      ...prev,

      [outputType]: {
        ...current,
        ...changes,
      },
    }));
  };

  /* =========================================================
     SAVE TEMPLATE
  ========================================================= */

  const saveTemplate = () => {
    const template = {
      language,
      tone,
      audience,
      detailLevel,
      objective,
      contentStyle,
      outputTypes: selectedOutputs,
      outputOverrides,
    };

    localStorage.setItem(
      "nitogen-template",
      JSON.stringify(template)
    );

    success(
      "Template saved",
      "Current transformation settings have been saved."
    );
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setValidationError(null);

    /* -------------------------
       Basic validation
    ------------------------- */

    if (!title.trim()) {
      setValidationError(
        "Project title is required."
      );
      return;
    }

    /* -------------------------
       Text
    ------------------------- */

    if (
      inputType === "text" &&
      !inputValue.trim()
    ) {
      setValidationError(
        "Please input the source text for transformation."
      );
      return;
    }

    /* -------------------------
       URL
    ------------------------- */

    if (inputType === "url") {
      if (!inputValue.trim()) {
        setValidationError(
          "Please enter a valid URL."
        );
        return;
      }

      if (
        !/^https?:\/\/.+/i.test(
          inputValue.trim()
        )
      ) {
        setValidationError(
          "Please enter a valid URL starting with http:// or https://"
        );
        return;
      }
    }

    /* -------------------------
       File inputs
    ------------------------- */

    if (
      (
        inputType === "pdf" ||
        inputType === "docx" ||
        inputType === "image" ||
        inputType === "video"
      ) &&
      !file
    ) {
      setValidationError(
        `Please upload a ${
          inputType === "video"
            ? "VIDEO"
            : inputType.toUpperCase()
        } file to proceed.`
      );

      return;
    }

    /* -------------------------
       Outputs
    ------------------------- */

    if (selectedOutputs.length === 0) {
      setValidationError(
        "Please select at least one output format."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await projectService.createProject({
          title: title.trim(),

          inputType,

          inputValue:
            inputType === "text" ||
            inputType === "url"
              ? inputValue.trim()
              : undefined,

          file,

          outputTypes:
            selectedOutputs,

          params: {
            language,
            tone,
            audience:
              audience.trim() ||
              undefined,

            detailLevel,

            objective,

            contentStyle,

            context:
              context.trim() ||
              undefined,

            outputOverrides,
          },
        });

      if (
        response.success &&
        response.projectId
      ) {
        success(
          "Transformation initiated",
          "Source ingested. Navigating to Generation Studio..."
        );

        router.push(
          `/projects/${response.projectId}`
        );
      } else {
        setValidationError(
          response.message ||
            "Failed to initialize transformation project."
        );
      }
    } catch (err: unknown) {
      console.error(
        "Project generation error:",
        err
      );

      if (
        axios.isAxiosError(err)
      ) {
        setValidationError(
          err.response?.data?.message ||
            "Failed to submit project."
        );
      } else {
        setValidationError(
          "An error occurred during submission. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentInputOption =
    INPUT_OPTIONS.find(
      (opt) =>
        opt.type === inputType
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">

        <div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />

            <span>
              Back to Dashboard
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            New Content Transformation
          </h1>

          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure multi-format extraction and target outputs for intelligence distribution.
          </p>
        </div>

        <Badge variant="primary">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Pipeline
        </Badge>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {validationError && (
        <div className="p-4 rounded-[6px] bg-[var(--error-soft)] border border-red-200 text-sm text-[var(--error)] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />

          <span>
            {validationError}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* ===================================================
            STEP 1
        =================================================== */}

        <Card>
          <CardHeader>
            <CardTitle>
              1. Project Identification
            </CardTitle>

            <CardDescription>
              Assign a recognizable title for internal reference and tracking.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Transformation Title"
              required
              placeholder="e.g., Global Threat Landscape Q3 Advisory"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* ===================================================
            STEP 2 — SOURCE
        =================================================== */}

        <Card>
          <CardHeader>
            <CardTitle>
              2. Content Source Ingestion
            </CardTitle>

            <CardDescription>
              Choose how you wish to feed content into the pipeline.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* INPUT TYPES */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">

              {INPUT_OPTIONS.map(
                (option) => {
                  const Icon =
                    getInputIcon(
                      option.type
                    );

                  const isSelected =
                    inputType ===
                    option.type;

                  return (
                    <button
                      type="button"
                      key={option.type}
                      disabled={
                        isSubmitting
                      }
                      onClick={() => {
                        setInputType(
                          option.type
                        );

                        setFile(null);
                        setInputValue("");

                        setValidationError(
                          null
                        );

                        if (
                          fileInputRef.current
                        ) {
                          fileInputRef.current.value =
                            "";
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-[6px] border text-center transition-all cursor-pointer",
                        isSelected
                          ? "bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary-hover)] shadow-sm font-semibold"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <Icon className="h-5 w-5 mb-1.5" />

                      <span className="text-xs">
                        {option.label}
                      </span>
                    </button>
                  );
                }
              )}

            </div>

            <p className="text-xs text-[var(--text-muted)] italic">
              {currentInputOption?.hint}
            </p>

            {/* PLAIN TEXT */}

            {inputType === "text" && (
              <div className="space-y-1.5">

                <Textarea
                  label="Plain Text Source"
                  placeholder="Paste intelligence report, transcript, raw data, or brief text here..."
                  rows={8}
                  value={inputValue}
                  onChange={(e) =>
                    setInputValue(
                      e.target.value
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                />

                <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                  <span>
                    Formatting is preserved during normalization.
                  </span>

                  <span>
                    {inputValue.length} characters
                  </span>
                </div>

              </div>
            )}

            {/* URL */}

            {inputType === "url" && (
              <Input
                label="Target Web URL"
                type="url"
                placeholder="https://example.gov/advisory/incident-report-2026"
                value={inputValue}
                onChange={(e) =>
                  setInputValue(
                    e.target.value
                  )
                }
                hint="Article contents will be scraped, sanitized, and normalized."
                disabled={
                  isSubmitting
                }
              />
            )}

            {/* FILE UPLOAD */}

            {(
              inputType === "pdf" ||
              inputType === "docx" ||
              inputType === "image" ||
              inputType === "video"
            ) && (
              <div className="space-y-3">

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={
                    handleFileChange
                  }
                  accept={
                    currentInputOption?.accept
                  }
                  className="hidden"
                />

                {!file ? (
                  <div
                    onDragOver={(e) =>
                      e.preventDefault()
                    }
                    onDrop={handleDrop}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="border-2 border-dashed border-[var(--border-strong)] rounded-[8px] p-8 text-center bg-[var(--surface-subtle)] hover:bg-[var(--surface)] hover:border-[var(--primary)] transition-all cursor-pointer flex flex-col items-center"
                  >
                    <div className="h-12 w-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-3 shadow-xs">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Click to upload or drag & drop
                    </p>

                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {inputType === "video"
                        ? "Video · Max 100 MB"
                        : `${inputType.toUpperCase()} · Max 10 MB`}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="h-9 w-9 rounded-[4px] bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">

                        {inputType ===
                        "video" ? (
                          <Video className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {file.name}
                        </p>

                        <p className="text-[11px] text-[var(--text-muted)]">
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>

                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={
                        removeFile
                      }
                      className="text-[var(--text-muted)] hover:text-[var(--error)]"
                    >
                      <X className="h-4 w-4" />
                    </Button>

                  </div>
                )}

              </div>
            )}

            {/* OPTIONAL CONTEXT */}

            <div className="pt-2 border-t border-[var(--border)]">

              <Textarea
                label="Optional Context"
                placeholder="Add additional background information, instructions, constraints, keywords, or context for the AI..."
                rows={4}
                value={context}
                onChange={(e) =>
                  setContext(
                    e.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
              />

              <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                Additional context helps the AI understand the purpose and background of the source.
              </p>

            </div>

          </CardContent>
        </Card>

        {/* ===================================================
            STEP 3 — OUTPUTS
        =================================================== */}

        <Card>

          <CardHeader>

            <div className="flex items-center justify-between gap-3">

              <div>
                <CardTitle>
                  3. Target Output Formats
                </CardTitle>

                <CardDescription>
                  Select one or more formats to generate concurrently from this single source.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={
                    toggleSelectAll
                  }
                  disabled={
                    isSubmitting
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  <CheckSquare className="h-3.5 w-3.5" />

                  {allOutputsSelected
                    ? "Clear All"
                    : "Select All"}
                </button>

                <Badge variant="default">
                  {selectedOutputs.length} selected
                </Badge>

              </div>

            </div>

          </CardHeader>

          <CardContent className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {OUTPUT_OPTIONS.map(
                (output) => {

                  const isChecked =
                    selectedOutputs.includes(
                      output.type
                    );

                  return (
                    <div
                      key={output.type}
                      onClick={() =>
                        toggleOutput(
                          output.type
                        )
                      }
                      className={cn(
                        "p-4 rounded-[6px] border transition-all cursor-pointer flex items-start gap-3 select-none",
                        isChecked
                          ? "bg-[var(--surface)] border-[var(--primary)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--primary)]"
                          : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-subtle)]"
                      )}
                    >

                      <div
                        className={cn(
                          "h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          isChecked
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                            : "border-[var(--border-strong)] bg-white"
                        )}
                      >
                        {isChecked && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-2">

                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {output.label}
                          </span>

                          <Badge
                            variant="default"
                            size="sm"
                          >
                            {output.badge}
                          </Badge>

                        </div>

                        <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {output.description}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <div className="text-xs text-[var(--text-muted)]">
              {selectedOutputs.length} format
              {selectedOutputs.length === 1
                ? ""
                : "s"}{" "}
              selected.
            </div>

            {/* =================================================
                PER OUTPUT OVERRIDES
            ================================================= */}

            {selectedOutputs.length > 0 && (
              <div className="pt-5 border-t border-[var(--border)]">

                <div className="mb-4">

                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Per-Output Overrides
                  </h4>

                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Use global parameters by default, or customize settings for individual outputs.
                  </p>

                </div>

                <div className="space-y-3">

                  {selectedOutputs.map(
                    (outputType) => {

                      const output =
                        OUTPUT_OPTIONS.find(
                          (item) =>
                            item.type ===
                            outputType
                        );

                      if (!output)
                        return null;

                      const override =
                        getOverride(
                          outputType
                        );

                      return (
                        <div
                          key={outputType}
                          className="rounded-[6px] border border-[var(--border)] bg-[var(--surface-subtle)] p-3"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div>
                              <p className="text-xs font-semibold text-[var(--text-primary)]">
                                {output.label}
                              </p>

                              <p className="text-[10px] text-[var(--text-muted)]">
                                {override.enabled
                                  ? "Custom settings enabled"
                                  : "Using global settings"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                updateOverride(
                                  outputType,
                                  {
                                    enabled:
                                      !override.enabled,
                                  }
                                )
                              }
                              className={cn(
                                "px-3 py-1.5 rounded-[5px] text-[10px] font-semibold border transition-all",
                                override.enabled
                                  ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]"
                                  : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]"
                              )}
                            >
                              {override.enabled
                                ? "Override On"
                                : "Use Global"}
                            </button>

                          </div>

                          {override.enabled && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

                              {/* Override Tone */}

                              <div>
                                <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1.5">
                                  Tone
                                </label>

                                <select
                                  value={
                                    override.tone
                                  }
                                  onChange={(e) =>
                                    updateOverride(
                                      outputType,
                                      {
                                        tone: e
                                          .target
                                          .value,
                                      }
                                    )
                                  }
                                  className="w-full h-9 rounded-[5px] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-primary)]"
                                >
                                  {TONE_OPTIONS.map(
                                    (option) => (
                                      <option
                                        key={
                                          option.value
                                        }
                                        value={
                                          option.value
                                        }
                                      >
                                        {
                                          option.label
                                        }
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              {/* Override Language */}

                              <div>
                                <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1.5">
                                  Language
                                </label>

                                <select
                                  value={
                                    override.language
                                  }
                                  onChange={(e) =>
                                    updateOverride(
                                      outputType,
                                      {
                                        language:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  className="w-full h-9 rounded-[5px] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-primary)]"
                                >
                                  {LANGUAGE_OPTIONS.map(
                                    (option) => (
                                      <option
                                        key={
                                          option
                                        }
                                        value={
                                          option
                                        }
                                      >
                                        {option}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              {/* Override Detail */}

                              <div>
                                <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1.5">
                                  Detail Level
                                </label>

                                <select
                                  value={
                                    override.detailLevel
                                  }
                                  onChange={(e) =>
                                    updateOverride(
                                      outputType,
                                      {
                                        detailLevel:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  className="w-full h-9 rounded-[5px] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-primary)]"
                                >
                                  {DETAIL_LEVEL_OPTIONS.map(
                                    (option) => (
                                      <option
                                        key={
                                          option
                                        }
                                        value={
                                          option
                                        }
                                      >
                                        {option}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              {/* Override Style */}

                              <div>
                                <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1.5">
                                  Content Style
                                </label>

                                <select
                                  value={
                                    override.contentStyle
                                  }
                                  onChange={(e) =>
                                    updateOverride(
                                      outputType,
                                      {
                                        contentStyle:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  className="w-full h-9 rounded-[5px] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-primary)]"
                                >
                                  {CONTENT_STYLE_OPTIONS.map(
                                    (option) => (
                                      <option
                                        key={
                                          option
                                        }
                                        value={
                                          option
                                        }
                                      >
                                        {option}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              {/* Override Audience */}

                              <div className="sm:col-span-2">

                                <Input
                                  label="Target Audience"
                                  placeholder="e.g., Government officials, technical teams, executives"
                                  value={
                                    override.audience
                                  }
                                  onChange={(e) =>
                                    updateOverride(
                                      outputType,
                                      {
                                        audience:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                />

                              </div>

                            </div>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* ===================================================
            STEP 4 — PARAMETERS
        =================================================== */}

        <Card>

          <CardHeader>

            <CardTitle>
              4. AI Parameters
            </CardTitle>

            <CardDescription>
              Control how the generated content should be written.
            </CardDescription>

          </CardHeader>

          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* LANGUAGE */}

            <div className="space-y-1.5">

              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)] focus:border-[var(--primary)]"
              >
                {LANGUAGE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>

              <p className="text-[10px] text-[var(--text-muted)]">
                Choose the language for generated outputs.
              </p>

            </div>

            {/* TONE */}

            <div className="space-y-1.5">

              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Tone & Voice
              </label>

              <select
                value={tone}
                onChange={(e) =>
                  setTone(
                    e.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)] focus:border-[var(--primary)]"
              >
                {TONE_OPTIONS.map(
                  (opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* AUDIENCE */}

            <div className="sm:col-span-2">

              <Input
                label="Target Audience"
                placeholder="e.g., C-Suite Executives, IT SecOps, Public, Government Officials"
                value={audience}
                onChange={(e) =>
                  setAudience(
                    e.target.value
                  )
                }
                hint="Specifies context and depth of recommendations."
                disabled={
                  isSubmitting
                }
              />

            </div>

            {/* DETAIL */}

            <div className="space-y-1.5">

              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Level of Detail
              </label>

              <select
                value={detailLevel}
                onChange={(e) =>
                  setDetailLevel(
                    e.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-primary)]"
              >
                {DETAIL_LEVEL_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* OBJECTIVE */}

            <div className="space-y-1.5">

              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Communication Objective
              </label>

              <select
                value={objective}
                onChange={(e) =>
                  setObjective(
                    e.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-primary)]"
              >
                {OBJECTIVE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* CONTENT STYLE */}

            <div className="sm:col-span-2 space-y-1.5">

              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Content Style
              </label>

              <select
                value={contentStyle}
                onChange={(e) =>
                  setContentStyle(
                    e.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text-primary)]"
              >
                {CONTENT_STYLE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>

            </div>

          </CardContent>
        </Card>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">

          <Button
            type="button"
            variant="outline"
            onClick={saveTemplate}
            disabled={
              isSubmitting
            }
            className="gap-2"
          >
            <Save className="h-4 w-4" />

            Save as Template
          </Button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto"
          >
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={
                isSubmitting
              }
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            size="lg"
            isLoading={
              isSubmitting
            }
            className="gap-2 shadow-sm px-6"
          >
            {!isSubmitting && (
              <Sparkles className="h-4 w-4" />
            )}

            <span>
              Start Transformation Pipeline
            </span>
          </Button>

        </div>

      </form>
    </div>
  );
}