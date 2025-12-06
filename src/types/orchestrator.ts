// ===========================================
// Orchestra Types - Multi-Session Parallel Queries
// ===========================================

import { SessionStatus, SessionResponse } from './index';

// -----------------------------
// Query Intent & Parsing
// -----------------------------

export type QueryIntent =
  | 'price_comparison'
  | 'information_lookup'
  | 'availability_check'
  | 'quote_request'
  | 'research'
  | 'general';

export interface ParsedQuery {
  originalQuery: string;
  intent: QueryIntent;
  subject: string; // e.g., "AirPods Pro"
  goal: string; // e.g., "find best price"
  suggestedSites: TargetSite[];
  isHighStakes: boolean; // Complex queries need more input
  requiredInputs?: RequiredInput[]; // For high-stakes queries
}

export interface RequiredInput {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required: boolean;
}

// -----------------------------
// Target Sites
// -----------------------------

export interface TargetSite {
  id: string;
  name: string;
  domain: string;
  icon?: string;
  selected: boolean;
  estimatedTime?: number; // seconds
}

// Pre-configured site catalogs
export const SITE_CATALOGS: Record<QueryIntent, TargetSite[]> = {
  price_comparison: [
    { id: 'amazon', name: 'Amazon', domain: 'amazon.com', selected: true, estimatedTime: 15 },
    { id: 'bestbuy', name: 'Best Buy', domain: 'bestbuy.com', selected: true, estimatedTime: 12 },
    { id: 'walmart', name: 'Walmart', domain: 'walmart.com', selected: true, estimatedTime: 14 },
    { id: 'target', name: 'Target', domain: 'target.com', selected: true, estimatedTime: 12 },
    { id: 'costco', name: 'Costco', domain: 'costco.com', selected: true, estimatedTime: 15 },
    { id: 'apple', name: 'Apple', domain: 'apple.com', selected: true, estimatedTime: 10 },
    { id: 'ebay', name: 'eBay', domain: 'ebay.com', selected: false, estimatedTime: 18 },
    { id: 'newegg', name: 'Newegg', domain: 'newegg.com', selected: false, estimatedTime: 12 },
  ],
  information_lookup: [
    { id: 'google', name: 'Google', domain: 'google.com', selected: true, estimatedTime: 8 },
    { id: 'yelp', name: 'Yelp', domain: 'yelp.com', selected: true, estimatedTime: 10 },
    { id: 'maps', name: 'Google Maps', domain: 'maps.google.com', selected: true, estimatedTime: 8 },
  ],
  availability_check: [
    { id: 'amazon', name: 'Amazon', domain: 'amazon.com', selected: true, estimatedTime: 12 },
    { id: 'target', name: 'Target', domain: 'target.com', selected: true, estimatedTime: 10 },
    { id: 'walmart', name: 'Walmart', domain: 'walmart.com', selected: true, estimatedTime: 12 },
  ],
  quote_request: [
    { id: 'geico', name: 'Geico', domain: 'geico.com', selected: true, estimatedTime: 45 },
    { id: 'progressive', name: 'Progressive', domain: 'progressive.com', selected: true, estimatedTime: 50 },
    { id: 'statefarm', name: 'State Farm', domain: 'statefarm.com', selected: true, estimatedTime: 55 },
    { id: 'allstate', name: 'Allstate', domain: 'allstate.com', selected: true, estimatedTime: 50 },
    { id: 'libertymutual', name: 'Liberty Mutual', domain: 'libertymutual.com', selected: true, estimatedTime: 55 },
    { id: 'usaa', name: 'USAA', domain: 'usaa.com', selected: false, estimatedTime: 60 },
  ],
  research: [
    { id: 'google', name: 'Google', domain: 'google.com', selected: true, estimatedTime: 10 },
    { id: 'wikipedia', name: 'Wikipedia', domain: 'wikipedia.org', selected: true, estimatedTime: 8 },
  ],
  general: [
    { id: 'google', name: 'Google', domain: 'google.com', selected: true, estimatedTime: 10 },
  ],
};

// -----------------------------
// Session Lane State
// -----------------------------

export type LaneStatus =
  | 'queued'      // Waiting to start
  | 'initializing' // Browser spinning up
  | 'navigating'   // Loading the page
  | 'extracting'   // AI analyzing content
  | 'complete'     // Done, result available
  | 'error';       // Failed

export interface SessionLane {
  id: string;
  site: TargetSite;
  status: LaneStatus;
  sessionId?: string;
  streamingUrl?: string;
  startTime?: number;
  endTime?: number;
  result?: ExtractedResult;
  error?: string;
  progress: number; // 0-100
  currentAction?: string; // e.g., "Searching for product..."
}

// -----------------------------
// Extracted Results
// -----------------------------

export interface ExtractedResult {
  site: string;
  siteDomain: string;
  success: boolean;

  // For price comparisons
  price?: number;
  currency?: string;
  originalPrice?: number; // If on sale

  // Common fields
  title?: string;
  url?: string;
  inStock?: boolean;
  shipping?: string;
  shippingCost?: number;
  deliveryEstimate?: string;

  // For quotes
  annualCost?: number;
  monthlyCost?: number;
  deductible?: number;
  coverage?: string;

  // Raw data
  rawResponse?: string;
  extractedAt: number;

  // Any additional structured data
  metadata?: Record<string, unknown>;
}

// -----------------------------
// Aggregated Results
// -----------------------------

export interface AggregatedResults {
  queryId: string;
  subject: string;
  intent: QueryIntent;

  results: ExtractedResult[];

  // Best option (computed)
  best?: ExtractedResult;

  // Statistics
  totalSites: number;
  completedSites: number;
  failedSites: number;

  // Timing
  startTime: number;
  endTime?: number;
  totalDuration?: number;
}

// -----------------------------
// AI Synthesis
// -----------------------------

export interface Synthesis {
  headline: string; // e.g., "Best price: $189 at Amazon"
  summary: string; // Short paragraph
  insights: string[]; // Bullet points of analysis
  caveats?: string[]; // Warnings or notes
  methodology?: string; // How the comparison was done
}

// -----------------------------
// Next Actions
// -----------------------------

export type ActionType =
  | 'purchase'
  | 'save'
  | 'alert'
  | 'expand'
  | 'retry'
  | 'new_search';

export interface NextAction {
  type: ActionType;
  label: string;
  icon?: string;
  primary?: boolean;
  url?: string;
  onClick?: () => void;
}

// -----------------------------
// Orchestrator State
// -----------------------------

export type OrchestratorStatus =
  | 'idle'
  | 'parsing'     // Understanding the query
  | 'configuring' // User selecting sites
  | 'running'     // Sessions in progress
  | 'completing'  // Finishing up
  | 'complete'    // All done
  | 'error';      // Something went wrong

export interface OrchestratorState {
  queryId: string;
  status: OrchestratorStatus;

  // Query understanding
  originalQuery: string;
  parsedQuery?: ParsedQuery;
  userInputs?: Record<string, string>; // For high-stakes queries

  // Site selection
  selectedSites: TargetSite[];

  // Execution
  lanes: SessionLane[];
  maxConcurrent: number;
  staggerDelay: number; // ms between spawns

  // Results
  aggregatedResults?: AggregatedResults;
  synthesis?: Synthesis;
  nextActions: NextAction[];

  // Progress
  progress: {
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
  };

  // Timing
  startTime?: number;
  estimatedTotalTime?: number;

  // Errors
  error?: string;
}

// -----------------------------
// Orchestrator Actions
// -----------------------------

export type OrchestratorAction =
  | { type: 'SET_QUERY'; query: string }
  | { type: 'PARSE_COMPLETE'; parsed: ParsedQuery }
  | { type: 'UPDATE_SITES'; sites: TargetSite[] }
  | { type: 'SET_USER_INPUT'; key: string; value: string }
  | { type: 'START_EXECUTION' }
  | { type: 'LANE_UPDATE'; laneId: string; update: Partial<SessionLane> }
  | { type: 'LANE_COMPLETE'; laneId: string; result: ExtractedResult }
  | { type: 'LANE_ERROR'; laneId: string; error: string }
  | { type: 'AGGREGATE_RESULTS' }
  | { type: 'SYNTHESIZE_RESULTS'; synthesis: Synthesis }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

// -----------------------------
// Preview Configuration
// -----------------------------

export interface OutputPreview {
  type: 'table' | 'cards' | 'summary';
  description: string;
  columns?: string[];
}

export const OUTPUT_PREVIEWS: Record<QueryIntent, OutputPreview> = {
  price_comparison: {
    type: 'table',
    description: 'Comparison table with prices, shipping, and availability',
    columns: ['Retailer', 'Price', 'Shipping', 'Availability'],
  },
  information_lookup: {
    type: 'summary',
    description: 'Direct answer with source links',
  },
  availability_check: {
    type: 'cards',
    description: 'Stock status across retailers',
  },
  quote_request: {
    type: 'table',
    description: 'Detailed quote comparison with coverage details',
    columns: ['Provider', 'Annual Cost', 'Deductible', 'Coverage'],
  },
  research: {
    type: 'summary',
    description: 'Comprehensive research summary with sources',
  },
  general: {
    type: 'summary',
    description: 'Answer to your question',
  },
};

// -----------------------------
// Example Parallel Queries
// -----------------------------

export const PARALLEL_QUERY_EXAMPLES = [
  {
    query: "Find the best price for AirPods Pro",
    intent: 'price_comparison' as QueryIntent,
    description: "Checks 6 major retailers simultaneously",
    estimatedTime: 25,
  },
  {
    query: "Compare home insurance quotes for a 2000 sq ft house in Austin",
    intent: 'quote_request' as QueryIntent,
    description: "Gets quotes from 5 insurance providers",
    estimatedTime: 120,
  },
  {
    query: "Is the iPhone 16 Pro in stock near me?",
    intent: 'availability_check' as QueryIntent,
    description: "Checks inventory at nearby stores",
    estimatedTime: 30,
  },
];
