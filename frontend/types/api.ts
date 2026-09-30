// ==================== AUTH & USER ====================

export type UserRole = "operator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
    userId?: string;
    email?: string;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: {
    user: User;
    statistics: {
      totalProjects: number;
      completedProjects: number;
    };
    recentProjects: Array<{
      _id: string;
      title: string;
      status: "pending" | "processing" | "completed" | "failed";
      createdAt: string;
    }>;
  };
}


// ==================== PROJECT & INGESTION ====================

export type InputType =
  | "text"
  | "url"
  | "pdf"
  | "docx"
  | "image"
  | "video";

export type OutputType =
  | "linkedin"
  | "twitter"
  | "advisory"
  | "video"
  | "executive_summary"
  | "infographic"
  | "presentation";

export interface ProjectParams {
  tone?: string;
  audience?: string;
  language?: string;
  detailLevel?: string;
  objective?: string;
  contentStyle?: string;
  context?: string;

  outputOverrides?: Record<
    string,
    {
      enabled?: boolean;
      tone?: string;
      audience?: string;
      language?: string;
      detailLevel?: string;
      contentStyle?: string;
    }
  >;

  [key: string]: unknown;
}

export interface ProjectBrief {
  title: string;
  summary: string;
  key_facts: string[];
  intent: string;
}

export interface Project {
  _id: string;
  userId: string;
  title: string;

  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed";

  sourceData: {
    inputType: InputType;
    extractedText: string;
  };

  params?: ProjectParams;
  brief?: ProjectBrief | null;

  createdAt: string;
  updatedAt: string;
}


// ==================== LINKEDIN ====================

export interface LinkedInContent {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
}


// ==================== TWITTER / X ====================

export interface TwitterTweet {
  id: number;
  text: string;
}

export interface TwitterContent {
  tweets: TwitterTweet[];
  is_thread: boolean;
}


// ==================== ADVISORY ====================

export interface AdvisoryContent {
  title: string;

  severity:
    | "Critical"
    | "High"
    | "Medium"
    | "Low"
    | string;

  summary: string;

  affected_systems: string[];

  impact: string;

  mitigation: string[];

  references: string[];
}


// ==================== VIDEO ====================

export interface VideoStoryboardScene {
  scene_number: number;
  title: string;
  description: string;
  narration: string;
  visual: string;
}

export interface VideoVisualRecommendation {
  title: string;
  description: string;
}

export interface VideoContent {
  script: string;

  storyboard: VideoStoryboardScene[];

  scenes: VideoStoryboardScene[];

  narration: string;

  subtitles: string;

  visual_recommendations: VideoVisualRecommendation[];
}


// ==================== EXECUTIVE SUMMARY ====================

export interface ExecutiveSummaryContent {
  bluf: string;

  key_points: string[];

  risks: string[];

  recommendations: string[];
}


// ==================== INFOGRAPHIC ====================

export interface InfographicSection {
  title: string;
  description: string;
}

export interface InfographicContent {
  headline: string;

  key_messages: string[];

  sections: InfographicSection[];

  layout_recommendation: string;

  color_icon_suggestions: string[];
}


// ==================== PRESENTATION ====================

export interface SlideItem {
  title: string;
  bullets: string[];
  speaker_notes: string;
}

export interface PresentationContent {
  slides: SlideItem[];

  downloadUrl?: string;

  fileName?: string;
}


// ==================== OUTPUT CONTENT ====================

export type AnyOutputContent =
  | LinkedInContent
  | TwitterContent
  | AdvisoryContent
  | VideoContent
  | ExecutiveSummaryContent
  | InfographicContent
  | PresentationContent;


// ==================== PROJECT OUTPUT ====================

export interface ProjectOutput {
  _id: string;
  projectId: string;

  outputType: OutputType;

  status:
    | "pending"
    | "generating"
    | "done"
    | "failed";

  content: AnyOutputContent | null;

  errorLog?: string | null;

  createdAt: string;
  updatedAt: string;
}


// ==================== PROJECT DETAILS ====================

export interface ProjectDetailsResponse {
  success: boolean;

  data: {
    project: Project;
    outputs: ProjectOutput[];
  };
}