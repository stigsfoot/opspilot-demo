/**
 * Message types for the chat interface
 */

export type MessageRole = "user" | "assistant" | "system";

export interface StatusIndicator {
  type?: string;
  color?: string;
  state?: string;
  label?: string;
  location?: string;
  message?: string;
  status?: string;
  image?: string;
}

export interface VisibleIssue {
  type?: string;
  component?: string;
  condition?: string;
}

export interface ErrorDetails {
  code?: string;
  name?: string;
  description?: string;
  severity?: string;
}

export interface PreprocessingMetadata {
  type?: string;
  enhancement_level?: string;
  original_size?: number[] | string;
  processed_size?: number[] | string;
  timestamp?: string;
}

export interface SuggestedAction {
  action?: string;
  detail?: string;
  difficulty?: string;
  step?: number;
}

export interface ConfidenceScores {
  overall?: number;
  error_recognition?: number;
  text_extraction?: number;
  ui_recognition?: number;
  model_identification?: number;
  issue_detection?: number;
  status_reading?: number;
  component_identification?: number;
  hardware_detection?: number;
  document_type?: number;
  content_structure?: number;
}

export interface ImageAnalysisResults {
  success?: boolean;
  content_type?: string;
  device_type?: string;
  model?: string;
  manufacturer?: string;
  extracted_text?: string;
  ui_elements?: string[];
  detected_application?: string;
  application_version?: string;
  error_codes?: string[];
  error_details?: ErrorDetails;
  status_indicators?: StatusIndicator[];
  visible_issues?: VisibleIssue[];
  assessment?: string;
  analysis?: string;
  confidence?: ConfidenceScores;
  preprocessing?: PreprocessingMetadata;
  suggested_actions?: (string | SuggestedAction)[];
}

export type ImageAttachment = {
  id: string;
  url: string;
  base64Data: string;
  contentType: string;
  name: string;
  analysisResults?: ImageAnalysisResults;
};

export type VisualTroubleshootingGuide = {
  title: string;
  content: string;
  format: string;
};

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  processingImages?: boolean;
  classification?: {
    category: string;
    confidence: number;
  }[];
  traceId?: string;
  images?: ImageAttachment[];
  visualGuides?: VisualTroubleshootingGuide[];
}

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
};

/**
 * Trace types for the agent reasoning view
 */

export interface TraceStep {
  step?: number;
  step_number?: number;
  thought?: string;
  reasoning?: string;
  tool?: string;
  action?: string;
  tool_input?: any;
  tool_output?: any;
  result?: any;
}

export interface CategoryConfidence {
  category: string;
  confidence: number;
}

export interface TraceClassification {
  results: Record<string, number>;
  top_categories: CategoryConfidence[];
}

export interface Trace {
  id: string;
  timestamp: string;
  input: string;
  final_output: string;
  completed: boolean;
  steps: TraceStep[];
  classification?: TraceClassification;
  has_images?: boolean;
  has_system_info?: boolean;
  visual_guides?: VisualTroubleshootingGuide[];
}