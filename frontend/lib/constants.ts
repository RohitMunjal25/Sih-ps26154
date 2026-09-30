import { OutputType, InputType } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";


// ==================== OUTPUT OPTIONS ====================

export interface OutputOption {
  type: OutputType;
  label: string;
  description: string;
  badge: string;
}

export const OUTPUT_OPTIONS: OutputOption[] = [
  {
    type: "linkedin",
    label: "LinkedIn Post",
    description:
      "Professional hook, structured insight body, and curated hashtags.",
    badge: "Social",
  },

  {
    type: "twitter",
    label: "X / Twitter Thread",
    description:
      "Sequential bite-sized tweets optimized for 280-character readability.",
    badge: "Social",
  },

  {
    type: "advisory",
    label: "Security Advisory",
    description:
      "Executive technical advisory with severity rating and actionable checklist.",
    badge: "Security",
  },

  {
    type: "video",
    label: "Video Script & Storyboard",
    description:
      "Narration teleprompter script and 3-column audio-visual storyboard.",
    badge: "Media",
  },

  {
    type: "executive_summary",
    label: "Executive Summary",
    description:
      "Bottom Line Up Front (BLUF), bulleted takeaways, and strategic recommendations.",
    badge: "Briefing",
  },

  {
    type: "presentation",
    label: "Presentation Deck",
    description:
      "Slide deck with titles, key bullet points, and speaker talking notes.",
    badge: "Slides",
  },

  {
    type: "infographic",
    label: "Infographic",
    description:
      "Infographic headline, key messages, sections, layout guidance, and visual suggestions.",
    badge: "Visual",
  },
];


// ==================== INPUT OPTIONS ====================

export interface InputOption {
  type: InputType;
  label: string;
  hint: string;
  accept?: string;
}

export const INPUT_OPTIONS: InputOption[] = [
  {
    type: "text",
    label: "Plain Text",
    hint:
      "Paste reports, transcripts, raw notes, or articles directly.",
  },

  {
    type: "url",
    label: "Web URL",
    hint:
      "Extract and analyze content directly from any public webpage or article.",
  },

  {
    type: "pdf",
    label: "PDF Document",
    hint:
      "Upload policy documents, papers, or manuals (up to 10MB).",
    accept: ".pdf,application/pdf",
  },

  {
    type: "docx",
    label: "DOCX Document",
    hint:
      "Upload Word documents or reports (up to 10MB).",
    accept:
      ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },

  {
    type: "image",
    label: "Image OCR",
    hint:
      "Ingest infographics, screenshots, or scanned notices via OCR.",
    accept:
      ".png,.jpg,.jpeg,.webp,image/*",
  },

  {
    type: "video",
    label: "Video",
    hint:
      "Upload video content for transcript and visual analysis (up to 100MB).",
    accept:
      "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
  },
];


// ==================== TONE OPTIONS ====================

export const TONE_OPTIONS = [
  {
    value: "Professional",
    label: "Professional & Objective",
  },

  {
    value: "Urgent",
    label: "Urgent & High-Priority",
  },

  {
    value: "Technical",
    label: "Deep Technical & Analytical",
  },

  {
    value: "Executive",
    label: "Executive & Strategic",
  },

  {
    value: "Engaging",
    label: "Engaging & Conversational",
  },
];