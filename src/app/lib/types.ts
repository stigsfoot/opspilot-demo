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

export interface AgentHandoffEvent {
  event_type: "agent_handoff";
  source_agent: string;
  target_agent: string;
  handoff_timestamp: string;
  context_size: number;
  handoff_approved: boolean;
  target_team: string;
  handoff_reason: string;
  business_impact?: string;
  user_type?: string;
  priority_handling?: boolean;
  immediate_assignment?: boolean;
  sla_category?: string;
  sla_target_minutes?: number;
  estimated_response_time?: string;
  requires_approval?: boolean;
  approval_workflow?: string[];
  management_notification?: boolean;
  assignment_schedule?: string;
}

export interface HandoffContext {
  user_context: {
    department: string;
    role: string;
    user_type: string;
    location?: string;
  };
  technical_context: {
    issue_description: string;
    classification_results?: Record<string, number>;
    attempted_solutions: any[];
    confidence_score: number;
  };
  handoff_metadata: {
    handoff_timestamp: string;
    source_tier: string;
    target_tier: string;
    handoff_reason: string;
    business_justification: string;
  };
}

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
  handoff_event?: AgentHandoffEvent;
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
  handoff_events?: AgentHandoffEvent[];
}