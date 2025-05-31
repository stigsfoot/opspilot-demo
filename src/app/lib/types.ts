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

/**
 * Represents an agent handoff event in the ITSM workflow.
 * Contains all metadata about transferring an issue between support tiers or specialized teams.
 */
export interface AgentHandoffEvent {
  /** The type of event, always "agent_handoff" for handoff events */
  event_type: "agent_handoff";
  /** The source agent or tier handling the issue initially */
  source_agent: string;
  /** The target agent or tier receiving the handoff */
  target_agent: string;
  /** ISO timestamp when the handoff occurred */
  handoff_timestamp: string;
  /** Size of context data transferred in bytes */
  context_size: number;
  /** Whether the handoff was approved or rejected */
  handoff_approved: boolean;
  /** The target support team (e.g., "L2_security_operations") */
  target_team: string;
  /** Reason for the handoff (e.g., "escalation_required", "vip_user") */
  handoff_reason: string;
  /** Business impact level (low, medium, high, critical) */
  business_impact?: string;
  /** Type of user (standard, vip, business_critical) */
  user_type?: string;
  /** Whether this handoff receives priority handling */
  priority_handling?: boolean;
  /** Whether the handoff requires immediate assignment */
  immediate_assignment?: boolean;
  /** SLA category (low, medium, high, urgent) */
  sla_category?: string;
  /** SLA target response time in minutes */
  sla_target_minutes?: number;
  /** Human-readable estimated response time */
  estimated_response_time?: string;
  /** Whether manager or CAB approval is required */
  requires_approval?: boolean;
  /** List of approval steps required */
  approval_workflow?: string[];
  /** Whether management has been notified */
  management_notification?: boolean;
  /** When the handoff will be processed (immediate, next_business_day) */
  assignment_schedule?: string;
}

/**
 * Context information transferred during an agent handoff.
 * Contains user details, technical information, and handoff metadata.
 */
export interface HandoffContext {
  /** Information about the user who submitted the issue */
  user_context: {
    /** User's department (e.g., "Marketing", "Engineering") */
    department: string;
    /** User's job role (e.g., "Software Engineer", "Marketing Manager") */
    role: string;
    /** Classification of user priority (standard, vip, business_critical) */
    user_type: string;
    /** User's physical location or office */
    location?: string;
  };
  /** Technical details about the issue and classification */
  technical_context: {
    /** The original issue description from the user */
    issue_description: string;
    /** AI classification results with confidence scores */
    classification_results?: Record<string, number>;
    /** List of solutions already attempted */
    attempted_solutions: any[];
    /** Overall confidence score of the classification */
    confidence_score: number;
  };
  /** Metadata about the handoff process itself */
  handoff_metadata: {
    /** When the handoff occurred */
    handoff_timestamp: string;
    /** Source support tier (e.g., "L1", "L2") */
    source_tier: string;
    /** Target support tier (e.g., "L2", "L3") */
    target_tier: string;
    /** Reason for escalation */
    handoff_reason: string;
    /** Business justification for the handoff */
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