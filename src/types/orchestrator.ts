// ===========================================
// Orchestra Types - Multi-Session Parallel Queries
// ===========================================

import { SessionStatus, SessionResponse } from './index';

// -----------------------------
// Query Intent & Parsing
// -----------------------------

export type QueryIntent =
  | 'price_comparison'
  | 'vehicle_search'
  | 'real_estate'
  | 'travel'
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

// Pre-configured site catalogs - includes unique sources Google can't easily search
export const SITE_CATALOGS: Record<QueryIntent, TargetSite[]> = {
  price_comparison: [
    // Major retailers
    { id: 'amazon', name: 'Amazon', domain: 'amazon.com', selected: true, estimatedTime: 15 },
    { id: 'bestbuy', name: 'Best Buy', domain: 'bestbuy.com', selected: true, estimatedTime: 12 },
    { id: 'walmart', name: 'Walmart', domain: 'walmart.com', selected: true, estimatedTime: 14 },
    // Specialty electronics - often has better prices
    { id: 'bhphoto', name: 'B&H Photo', domain: 'bhphotovideo.com', selected: true, estimatedTime: 12 },
    { id: 'microcenter', name: 'Micro Center', domain: 'microcenter.com', selected: true, estimatedTime: 12 },
    // Deal aggregators - finds sales Google misses
    { id: 'slickdeals', name: 'Slickdeals', domain: 'slickdeals.net', selected: true, estimatedTime: 10 },
    // Warehouse clubs (members only pricing)
    { id: 'costco', name: 'Costco', domain: 'costco.com', selected: false, estimatedTime: 15 },
    // Refurbished/Open-box deals
    { id: 'backmarket', name: 'Back Market', domain: 'backmarket.com', selected: false, estimatedTime: 12 },
    { id: 'woot', name: 'Woot', domain: 'woot.com', selected: false, estimatedTime: 10 },
    // Official store (baseline price)
    { id: 'apple', name: 'Apple Store', domain: 'apple.com', selected: false, estimatedTime: 10 },
    // Other major retailers
    { id: 'target', name: 'Target', domain: 'target.com', selected: false, estimatedTime: 12 },
    { id: 'newegg', name: 'Newegg', domain: 'newegg.com', selected: false, estimatedTime: 12 },
  ],
  vehicle_search: [
    { id: 'autotrader', name: 'Autotrader', domain: 'autotrader.com', selected: true, estimatedTime: 15 },
    { id: 'cargurus', name: 'CarGurus', domain: 'cargurus.com', selected: true, estimatedTime: 15 },
    { id: 'carscom', name: 'Cars.com', domain: 'cars.com', selected: true, estimatedTime: 15 },
    { id: 'carmax', name: 'CarMax', domain: 'carmax.com', selected: true, estimatedTime: 12 },
    { id: 'carvana', name: 'Carvana', domain: 'carvana.com', selected: true, estimatedTime: 12 },
    { id: 'truecar', name: 'TrueCar', domain: 'truecar.com', selected: false, estimatedTime: 12 },
    { id: 'edmunds', name: 'Edmunds', domain: 'edmunds.com', selected: false, estimatedTime: 10 },
    { id: 'kbb', name: 'Kelley Blue Book', domain: 'kbb.com', selected: false, estimatedTime: 10 },
  ],
  real_estate: [
    { id: 'zillow', name: 'Zillow', domain: 'zillow.com', selected: true, estimatedTime: 15 },
    { id: 'redfin', name: 'Redfin', domain: 'redfin.com', selected: true, estimatedTime: 15 },
    { id: 'realtor', name: 'Realtor.com', domain: 'realtor.com', selected: true, estimatedTime: 15 },
    { id: 'trulia', name: 'Trulia', domain: 'trulia.com', selected: true, estimatedTime: 12 },
    { id: 'apartments', name: 'Apartments.com', domain: 'apartments.com', selected: false, estimatedTime: 12 },
  ],
  travel: [
    { id: 'google_flights', name: 'Google Flights', domain: 'google.com/flights', selected: true, estimatedTime: 12 },
    { id: 'kayak', name: 'Kayak', domain: 'kayak.com', selected: true, estimatedTime: 15 },
    { id: 'expedia', name: 'Expedia', domain: 'expedia.com', selected: true, estimatedTime: 15 },
    { id: 'skyscanner', name: 'Skyscanner', domain: 'skyscanner.com', selected: true, estimatedTime: 12 },
    { id: 'hopper', name: 'Hopper', domain: 'hopper.com', selected: false, estimatedTime: 12 },
    { id: 'southwest', name: 'Southwest', domain: 'southwest.com', selected: false, estimatedTime: 15 },
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
    // Direct insurers - usually cheapest
    { id: 'geico', name: 'Geico', domain: 'geico.com', selected: true, estimatedTime: 45 },
    { id: 'progressive', name: 'Progressive', domain: 'progressive.com', selected: true, estimatedTime: 50 },
    // Traditional insurers - often best for bundling
    { id: 'statefarm', name: 'State Farm', domain: 'statefarm.com', selected: true, estimatedTime: 55 },
    { id: 'allstate', name: 'Allstate', domain: 'allstate.com', selected: true, estimatedTime: 50 },
    { id: 'libertymutual', name: 'Liberty Mutual', domain: 'libertymutual.com', selected: true, estimatedTime: 55 },
    // Comparison tools - aggregates quotes
    { id: 'thezebra', name: 'The Zebra', domain: 'thezebra.com', selected: true, estimatedTime: 40 },
    // Military/credit union (if eligible)
    { id: 'usaa', name: 'USAA', domain: 'usaa.com', selected: false, estimatedTime: 60 },
    // Regional/specialty
    { id: 'nationwide', name: 'Nationwide', domain: 'nationwide.com', selected: false, estimatedTime: 50 },
    { id: 'farmers', name: 'Farmers', domain: 'farmers.com', selected: false, estimatedTime: 55 },
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
  | 'clarifying'  // Waiting for answers to clarifying questions
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
  completedInputs?: Record<string, string>; // Saved after clarification complete

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

  // Auto-execute flag (skip configuring step)
  autoExecutePending?: boolean;
}

// -----------------------------
// Orchestrator Actions
// -----------------------------

export type OrchestratorAction =
  | { type: 'SET_QUERY'; query: string }
  | { type: 'PARSE_COMPLETE'; parsed: ParsedQuery; needsClarification: boolean }
  | { type: 'CLARIFICATION_COMPLETE'; autoExecute?: boolean }
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
  | { type: 'RESET' }
  | { type: 'RESTORE'; state: OrchestratorState };

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
  vehicle_search: {
    type: 'table',
    description: 'Vehicle listings with prices, mileage, and details',
    columns: ['Source', 'Price', 'Year/Mileage', 'Location'],
  },
  real_estate: {
    type: 'table',
    description: 'Property listings with prices and details',
    columns: ['Source', 'Price', 'Beds/Baths', 'Location'],
  },
  travel: {
    type: 'table',
    description: 'Flight and travel options with prices',
    columns: ['Provider', 'Price', 'Duration', 'Stops'],
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
