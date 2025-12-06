// ===========================================
// Mino API Types - Based on live API testing
// ===========================================

// -----------------------------
// Session Status
// -----------------------------
export type SessionStatus = 'pending' | 'running' | 'completed' | 'error';

// -----------------------------
// Session Log Event Types
// -----------------------------
export type SessionLogEventType = 'function_call' | 'function_response' | 'final_response';

// Agent Tool Names
export type AgentToolName =
  | 'init_browser_tool'
  | 'visit_url_tool'
  | 'input_text_tool'
  | 'click_element_tool'
  | 'page_description_tool';

// -----------------------------
// Tool Arguments
// -----------------------------
export interface InitBrowserArgs {
  // No args required
}

export interface VisitUrlArgs {
  url: string;
}

export interface InputTextArgs {
  element_id: string;
  element_name: string;
  text: string;
  typing: boolean;
}

export interface ClickElementArgs {
  element_id: string;
  element_name: string;
  check_hover_menu: boolean;
}

export interface PageDescriptionArgs {
  questions: string;
}

export type ToolArgs =
  | InitBrowserArgs
  | VisitUrlArgs
  | InputTextArgs
  | ClickElementArgs
  | PageDescriptionArgs;

// -----------------------------
// Tool Responses
// -----------------------------
export interface InitBrowserResponse {
  status: 'success' | 'error';
  active_browsers: number;
  expired_browsers_cleaned: number;
  streaming_url: string;
}

export interface VisitUrlResponse {
  status: 'Success' | 'Error';
  urls_visited: string[];
}

export interface InputTextResponse {
  status: 'Success' | 'Error';
  notes: string;
}

export interface ClickElementResponse {
  status: 'Success' | 'Error';
}

export interface PageDescriptionResponse {
  page_description: string;
}

export type ToolResponse =
  | InitBrowserResponse
  | VisitUrlResponse
  | InputTextResponse
  | ClickElementResponse
  | PageDescriptionResponse;

// -----------------------------
// Session Log Events
// -----------------------------
export interface FunctionCallEvent {
  type: 'function_call';
  data: {
    name: AgentToolName;
    args: ToolArgs;
  };
  role: null;
  author: 'tinyfish_web_agent';
  timestamp: number;
  id: string;
  finishReason: 'STOP';
}

export interface FunctionResponseEvent {
  type: 'function_response';
  data: {
    name: AgentToolName;
    response: ToolResponse;
  };
  role: null;
  author: 'tinyfish_web_agent';
  timestamp: number;
  id: string;
  streaming_url?: string; // Present on init_browser_tool response
}

export interface FinalResponseEvent {
  type: 'final_response';
  data: {
    raw: string;
  };
  role: null;
  author: 'tinyfish_web_agent';
  timestamp: number;
  id: string;
  finishReason: 'STOP';
}

export type SessionLogEvent =
  | FunctionCallEvent
  | FunctionResponseEvent
  | FinalResponseEvent;

// -----------------------------
// Session Output
// -----------------------------
export interface SessionOutput {
  raw: string;
}

// -----------------------------
// Full Session Response
// -----------------------------
export interface SessionResponse {
  job_id: string | null;
  source: 'playground';
  user_id: string | null;
  user_message: string;
  custom_name: string | null;
  web_agent_session_id: string;
  status: SessionStatus;
  session_id: string;
  session_log: SessionLogEvent[];
  output: SessionOutput | null;
  streaming_url: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

// Alias for backward compatibility
export type PlaygroundRunResponse = SessionResponse;

// -----------------------------
// Browser Presets (UI Config)
// -----------------------------
export interface BrowserPreset {
  label: string;
  description: string;
  browser_type: 'tetra' | 'tetra-anchor';
  proxy_enabled: boolean;
  proxy_country_code?: string;
}

export type BrowserPresetKey = 'BASIC' | 'STEALTH' | 'GEO_US' | 'GEO_EU';

// -----------------------------
// Query Feedback (Mock/Future)
// -----------------------------
export interface QueryFeedback {
  willSucceed: boolean;
  advice?: string;
  extractionSummary?: string;
  highlight?: string;
  suggestedQuery?: string;
  estimatedTimeSeconds?: number;
}

// -----------------------------
// UI Event Types (Simplified for display)
// -----------------------------

// Simple event type for basic UI display (current implementation)
export interface SessionEvent {
  type: 'navigation' | 'network' | 'console' | 'status' | 'error';
  message: string;
  timestamp: number;
}

// Rich event type for enhanced UI display (future implementation)
export interface UISessionEvent {
  type: 'init' | 'navigate' | 'input' | 'click' | 'analyze' | 'complete' | 'error';
  message: string;
  timestamp: number;
  details?: {
    url?: string;
    elementName?: string;
    text?: string;
    questions?: string;
    pageDescription?: string;
    output?: string;
  };
}

// -----------------------------
// Helper Type Guards
// -----------------------------
export function isFunctionCall(event: SessionLogEvent): event is FunctionCallEvent {
  return event.type === 'function_call';
}

export function isFunctionResponse(event: SessionLogEvent): event is FunctionResponseEvent {
  return event.type === 'function_response';
}

export function isFinalResponse(event: SessionLogEvent): event is FinalResponseEvent {
  return event.type === 'final_response';
}

// Tool-specific type guards
export function isVisitUrlCall(event: FunctionCallEvent): boolean {
  return event.data.name === 'visit_url_tool';
}

export function isInputTextCall(event: FunctionCallEvent): boolean {
  return event.data.name === 'input_text_tool';
}

export function isClickElementCall(event: FunctionCallEvent): boolean {
  return event.data.name === 'click_element_tool';
}

export function isPageDescriptionCall(event: FunctionCallEvent): boolean {
  return event.data.name === 'page_description_tool';
}
