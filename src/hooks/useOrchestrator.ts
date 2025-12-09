'use client';

import { useRef, useCallback, useEffect, useReducer } from 'react';
import { runPlaygroundQuery, getSessionStatus } from '@/lib/api';
import {
  OrchestratorState,
  OrchestratorAction,
  ParsedQuery,
  TargetSite,
  SessionLane,
  ExtractedResult,
  Synthesis,
  NextAction,
  LaneStatus,
  QueryIntent,
  SITE_CATALOGS,
  AggregatedResults,
} from '@/types/orchestrator';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Initial state
const createInitialState = (): OrchestratorState => ({
  queryId: generateId(),
  status: 'idle',
  originalQuery: '',
  selectedSites: [],
  lanes: [],
  maxConcurrent: 6,
  staggerDelay: 1500, // Stagger lane starts for visual effect (1.5s between each)
  nextActions: [],
  progress: {
    total: 0,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
  },
});

// Helper to compute progress from lanes
function computeProgress(lanes: SessionLane[]) {
  return {
    total: lanes.length,
    queued: lanes.filter(l => l.status === 'queued').length,
    running: lanes.filter(l => ['initializing', 'navigating', 'extracting'].includes(l.status)).length,
    completed: lanes.filter(l => l.status === 'complete').length,
    failed: lanes.filter(l => l.status === 'error').length,
  };
}

// Generate next actions based on results
function generateNextActions(state: OrchestratorState): NextAction[] {
  const actions: NextAction[] = [];
  const best = state.aggregatedResults?.best;

  if (best?.url) {
    actions.push({
      type: 'purchase',
      label: state.parsedQuery?.intent === 'price_comparison' ? `Buy from ${best.site}` : `View on ${best.site}`,
      primary: true,
      url: best.url,
    });
  }

  actions.push({ type: 'save', label: 'Save results' });

  if (state.parsedQuery?.intent === 'price_comparison') {
    actions.push({ type: 'alert', label: 'Alert if price drops' });
  }

  if (state.progress.failed > 0) {
    actions.push({ type: 'retry', label: `Retry ${state.progress.failed} failed` });
  }

  actions.push({ type: 'new_search', label: 'New search' });

  return actions;
}

// Reducer
function orchestratorReducer(
  state: OrchestratorState,
  action: OrchestratorAction
): OrchestratorState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, originalQuery: action.query, status: 'parsing' };

    case 'PARSE_COMPLETE':
      return {
        ...state,
        parsedQuery: action.parsed,
        selectedSites: action.parsed.suggestedSites.filter(s => s.selected),
        status: action.needsClarification ? 'clarifying' : 'configuring',
      };

    case 'CLARIFICATION_COMPLETE': {
      // Save the completed inputs
      const completedInputs = { ...state.userInputs };

      // If autoExecute, skip directly to running state
      if (action.autoExecute) {
        const lanes: SessionLane[] = state.selectedSites.map((site) => ({
          id: `lane-${site.id}-${generateId()}`,
          site,
          status: 'queued' as LaneStatus,
          progress: 0,
        }));
        return {
          ...state,
          status: 'running',
          completedInputs,
          lanes,
          startTime: Date.now(),
          estimatedTotalTime: Math.max(...state.selectedSites.map(s => s.estimatedTime || 30)),
          progress: computeProgress(lanes),
        };
      }
      return {
        ...state,
        status: 'configuring',
        completedInputs,
      };
    }

    case 'UPDATE_SITES':
      return {
        ...state,
        selectedSites: action.sites.filter(s => s.selected),
        parsedQuery: state.parsedQuery
          ? { ...state.parsedQuery, suggestedSites: action.sites }
          : undefined,
      };

    case 'SET_USER_INPUT':
      return { ...state, userInputs: { ...state.userInputs, [action.key]: action.value } };

    case 'START_EXECUTION': {
      // Create lanes from selected sites
      const lanes: SessionLane[] = state.selectedSites.map((site) => ({
        id: `lane-${site.id}-${generateId()}`,
        site,
        status: 'queued' as LaneStatus,
        progress: 0,
      }));

      return {
        ...state,
        status: 'running',
        lanes,
        startTime: Date.now(),
        estimatedTotalTime: Math.max(...state.selectedSites.map(s => s.estimatedTime || 30)),
        progress: computeProgress(lanes),
      };
    }

    case 'LANE_UPDATE': {
      const lanes = state.lanes.map(lane =>
        lane.id === action.laneId ? { ...lane, ...action.update } : lane
      );
      return { ...state, lanes, progress: computeProgress(lanes) };
    }

    case 'LANE_COMPLETE': {
      const lanes = state.lanes.map(lane =>
        lane.id === action.laneId
          ? { ...lane, status: 'complete' as LaneStatus, result: action.result, progress: 100, endTime: Date.now() }
          : lane
      );
      return { ...state, lanes, progress: computeProgress(lanes) };
    }

    case 'LANE_ERROR': {
      const lanes = state.lanes.map(lane =>
        lane.id === action.laneId
          ? { ...lane, status: 'error' as LaneStatus, error: action.error, endTime: Date.now() }
          : lane
      );
      return { ...state, lanes, progress: computeProgress(lanes) };
    }

    case 'AGGREGATE_RESULTS': {
      const results = state.lanes.filter(l => l.status === 'complete' && l.result).map(l => l.result!);
      let best: ExtractedResult | undefined;

      if (state.parsedQuery?.intent === 'price_comparison' || state.parsedQuery?.intent === 'availability_check') {
        best = results.filter(r => r.price !== undefined && r.inStock !== false)
          .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))[0];
      } else if (state.parsedQuery?.intent === 'quote_request') {
        best = results.filter(r => r.annualCost !== undefined)
          .sort((a, b) => (a.annualCost || Infinity) - (b.annualCost || Infinity))[0];
      }

      const aggregatedResults: AggregatedResults = {
        queryId: state.queryId,
        subject: state.parsedQuery?.subject || state.originalQuery,
        intent: state.parsedQuery?.intent || 'general',
        results,
        best,
        totalSites: state.lanes.length,
        completedSites: state.progress.completed,
        failedSites: state.progress.failed,
        startTime: state.startTime || Date.now(),
        endTime: Date.now(),
        totalDuration: state.startTime ? Date.now() - state.startTime : 0,
      };

      return { ...state, aggregatedResults };
    }

    case 'SYNTHESIZE_RESULTS':
      return { ...state, synthesis: action.synthesis, status: 'completing' };

    case 'COMPLETE':
      return { ...state, status: 'complete', nextActions: generateNextActions(state) };

    case 'ERROR':
      return { ...state, status: 'error', error: action.error };

    case 'RESET':
      return createInitialState();

    case 'RESTORE':
      return action.state;

    default:
      return state;
  }
}

// Response type from the parse-query API
interface ParseQueryAPIResponse {
  intent: QueryIntent;
  subject: string;
  goal: string;
  needsClarification: boolean;
  clarifyingQuestions: { key: string; label: string; type: 'text' | 'number' | 'select'; placeholder?: string; options?: { value: string; label: string }[]; required: boolean }[];
  suggestedSites: { id: string; name: string; domain: string; icon?: string; selected: boolean; estimatedTime?: number }[];
  reasoning: string;
}

// Parse query to understand intent via AI
async function parseQuery(query: string): Promise<{ parsed: ParsedQuery; needsClarification: boolean }> {
  try {
    const response = await fetch('/api/parse-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse query');
    }

    const data: ParseQueryAPIResponse = await response.json();

    const parsed: ParsedQuery = {
      originalQuery: query,
      intent: data.intent,
      subject: data.subject,
      goal: data.goal,
      suggestedSites: data.suggestedSites,
      isHighStakes: data.needsClarification,
      requiredInputs: data.clarifyingQuestions.length > 0 ? data.clarifyingQuestions : undefined,
    };

    return { parsed, needsClarification: data.needsClarification };

  } catch (error) {
    console.error('Parse query error:', error);
    // Fallback to basic parsing
    return fallbackParseQuery(query);
  }
}

// Fallback parser when API fails
function fallbackParseQuery(query: string): { parsed: ParsedQuery; needsClarification: boolean } {
  const lowerQuery = query.toLowerCase();
  let intent: QueryIntent = 'general';
  let subject = query;
  let goal = 'find information';

  if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('cheap') || lowerQuery.includes('best deal') || lowerQuery.includes('best price')) {
    intent = 'price_comparison';
    goal = 'find best price';
    const priceMatch = query.match(/(?:price|cost|deal)(?:\s+(?:for|of|on))?\s+(.+?)(?:\s+(?:on|at|from|across))?$/i);
    if (priceMatch) subject = priceMatch[1].trim();
  } else if (lowerQuery.includes('insurance') || lowerQuery.includes('quote')) {
    intent = 'quote_request';
    goal = 'compare quotes';
  } else if (lowerQuery.includes('in stock') || lowerQuery.includes('available')) {
    intent = 'availability_check';
    goal = 'check availability';
  } else if (lowerQuery.includes('hours') || lowerQuery.includes('open')) {
    intent = 'information_lookup';
    goal = 'find information';
  }

  const suggestedSites = [...(SITE_CATALOGS[intent] || SITE_CATALOGS.general)];

  return {
    parsed: {
      originalQuery: query,
      intent,
      subject,
      goal,
      suggestedSites,
      isHighStakes: false,
    },
    needsClarification: false,
  };
}

// Extract result from session output
function extractResult(site: TargetSite, output: unknown, intent: QueryIntent): ExtractedResult {
  const result: ExtractedResult = {
    site: site.name,
    siteDomain: site.domain,
    success: true,
    extractedAt: Date.now(),
    url: `https://${site.domain}`,
  };

  if (typeof output === 'object' && output !== null && 'raw' in output) {
    const raw = (output as { raw: string }).raw;
    result.rawResponse = raw;

    const priceMatch = raw.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) {
      result.price = parseFloat(priceMatch[1].replace(',', ''));
      result.currency = 'USD';
    }

    if (raw.toLowerCase().includes('in stock') || raw.toLowerCase().includes('available')) {
      result.inStock = true;
    } else if (raw.toLowerCase().includes('out of stock')) {
      result.inStock = false;
    }

    if (raw.toLowerCase().includes('free shipping') || raw.toLowerCase().includes('free delivery')) {
      result.shipping = 'Free';
      result.shippingCost = 0;
    }
  }

  return result;
}

// Generate synthesis from results
function generateSynthesis(state: OrchestratorState): Synthesis {
  const results = state.aggregatedResults?.results || [];
  const best = state.aggregatedResults?.best;
  const intent = state.parsedQuery?.intent || 'general';
  const subject = state.parsedQuery?.subject || 'item';

  let headline = '';
  let summary = '';
  const insights: string[] = [];
  const caveats: string[] = [];

  if (intent === 'price_comparison' && best?.price) {
    headline = `Best price: $${best.price.toFixed(2)} at ${best.site}`;
    const pricesFound = results.filter(r => r.price).length;
    const avgPrice = pricesFound > 0 ? results.reduce((sum, r) => sum + (r.price || 0), 0) / pricesFound : 0;
    summary = `Found ${pricesFound} prices for ${subject}. The best deal is at ${best.site} for $${best.price.toFixed(2)}${best.shipping ? ` with ${best.shipping.toLowerCase()} shipping` : ''}.`;

    if (best.inStock) insights.push(`${best.site} shows this item as in stock`);
    if (avgPrice > best.price) {
      insights.push(`This is ${((avgPrice - best.price) / avgPrice * 100).toFixed(0)}% below average`);
    }
  } else if (intent === 'quote_request') {
    const quotesWithCost = results.filter(r => r.annualCost !== undefined);

    if (best?.annualCost) {
      const monthlyPayment = best.monthlyCost || Math.round(best.annualCost / 12);
      const avgCost = quotesWithCost.length > 0
        ? Math.round(quotesWithCost.reduce((sum, r) => sum + (r.annualCost || 0), 0) / quotesWithCost.length)
        : 0;
      const savingsVsAvg = avgCost > best.annualCost ? avgCost - best.annualCost : 0;

      headline = `Recommended: ${best.site} at $${monthlyPayment}/mo`;
      summary = `We compared ${quotesWithCost.length} insurance quotes. ${best.site} offers the best value at $${best.annualCost.toLocaleString()}/year ($${monthlyPayment}/month)${best.deductible ? ` with a $${best.deductible} deductible` : ''}.`;

      if (savingsVsAvg > 0) {
        insights.push(`Save $${savingsVsAvg.toLocaleString()}/year vs. the average quote`);
      }
      if (best.coverage) {
        insights.push(`Coverage level: ${best.coverage}`);
      }

      // Add comparison insights
      const sortedByPrice = [...quotesWithCost].sort((a, b) => (a.annualCost || 0) - (b.annualCost || 0));
      if (sortedByPrice.length >= 2) {
        const second = sortedByPrice[1];
        if (second.annualCost && second.annualCost > best.annualCost) {
          insights.push(`$${(second.annualCost - best.annualCost).toLocaleString()}/year cheaper than ${second.site}`);
        }
      }
    } else {
      headline = `Found ${quotesWithCost.length} quotes`;
      summary = `Compared quotes from ${results.length} insurance providers.`;
    }
  } else {
    headline = `Found ${results.length} results`;
    summary = `Completed search across ${state.progress.completed} sites.`;
  }

  if (state.progress.failed > 0) {
    caveats.push(`${state.progress.failed} site(s) could not be reached`);
  }

  return {
    headline,
    summary,
    insights,
    caveats: caveats.length > 0 ? caveats : undefined,
    methodology: `Checked ${state.progress.completed} sites in ${((state.aggregatedResults?.totalDuration || 0) / 1000).toFixed(1)} seconds`,
  };
}

// Main hook
interface UseOrchestratorOptions {
  maxConcurrent?: number;
  staggerDelay?: number;
  disableApi?: boolean; // Disable actual API calls for development
}

// Flag to disable API calls globally
const API_DISABLED = true;

export function useOrchestrator(options: UseOrchestratorOptions = {}) {
  const [state, dispatch] = useReducer(orchestratorReducer, createInitialState());
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lanesRef = useRef<SessionLane[]>([]); // Keep current lanes in a ref for callbacks
  const stateRef = useRef(state); // Keep current state in a ref

  // Update refs when state changes
  useEffect(() => {
    lanesRef.current = state.lanes;
    stateRef.current = state;
  }, [state]);

  // Cleanup
  const cleanupPolling = useCallback(() => {
    pollIntervalsRef.current.forEach(interval => clearInterval(interval));
    pollIntervalsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => cleanupPolling();
  }, [cleanupPolling]);

  // Set query and parse
  const setQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    dispatch({ type: 'SET_QUERY', query });
    try {
      const { parsed, needsClarification } = await parseQuery(query);
      dispatch({ type: 'PARSE_COMPLETE', parsed, needsClarification });
    } catch {
      dispatch({ type: 'ERROR', error: 'Failed to understand query' });
    }
  }, []);

  // Complete clarification and move to configuring (or running if autoExecute)
  const completeClarification = useCallback((autoExecute?: boolean) => {
    dispatch({ type: 'CLARIFICATION_COMPLETE', autoExecute });
  }, []);

  // Update sites
  const updateSites = useCallback((sites: TargetSite[]) => {
    dispatch({ type: 'UPDATE_SITES', sites });
  }, []);

  // Toggle site
  const toggleSite = useCallback((siteId: string) => {
    const currentState = stateRef.current;
    if (!currentState.parsedQuery) return;
    const updatedSites = currentState.parsedQuery.suggestedSites.map(site =>
      site.id === siteId ? { ...site, selected: !site.selected } : site
    );
    dispatch({ type: 'UPDATE_SITES', sites: updatedSites });
  }, []);

  // Set user input
  const setUserInput = useCallback((key: string, value: string) => {
    dispatch({ type: 'SET_USER_INPUT', key, value });
  }, []);

  // Start a lane (called after lanes are created in state)
  const startLane = useCallback(async (laneId: string) => {
    const lane = lanesRef.current.find(l => l.id === laneId);
    if (!lane) {
      console.error('Lane not found:', laneId);
      return;
    }

    const currentState = stateRef.current;
    const query = `Find ${currentState.parsedQuery?.goal || 'information'} for ${currentState.parsedQuery?.subject || currentState.originalQuery} on ${lane.site.domain}`;

    console.log(`Starting lane ${laneId} with query:`, query);

    dispatch({
      type: 'LANE_UPDATE',
      laneId: lane.id,
      update: { status: 'initializing', progress: 10, currentAction: `Starting ${lane.site.name}...`, startTime: Date.now() },
    });

    // If API is disabled, simulate progress and completion with realistic timing
    if (API_DISABLED) {
      console.log(`[API DISABLED] Simulating lane ${laneId}`);

      // Base time varies per site (10-18 seconds) - deliberately slow for visual effect
      const baseTime = 10000 + Math.random() * 8000;

      // Step 1: Browser launching (15%)
      setTimeout(() => {
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: {
            status: 'initializing',
            progress: 15,
            currentAction: `Launching browser for ${lane.site.name}...`,
            streamingUrl: `placeholder-${lane.id}`, // Enable expand
          },
        });
      }, baseTime * 0.1);

      // Step 2: Navigating to site (30%)
      setTimeout(() => {
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: { status: 'navigating', progress: 30, currentAction: `Navigating to ${lane.site.domain}...` },
        });
      }, baseTime * 0.2);

      // Step 3: Page loading (45%)
      setTimeout(() => {
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: { status: 'navigating', progress: 45, currentAction: `Loading page content...` },
        });
      }, baseTime * 0.35);

      // Step 4: Searching (55%)
      setTimeout(() => {
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: { status: 'extracting', progress: 55, currentAction: `Searching for product...` },
        });
      }, baseTime * 0.5);

      // Step 5: Found product (70%)
      setTimeout(() => {
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: { status: 'extracting', progress: 70, currentAction: `Found product, extracting details...` },
        });
      }, baseTime * 0.65);

      // Step 6: Extracting price (85%)
      setTimeout(() => {
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: { status: 'extracting', progress: 85, currentAction: `Reading price and availability...` },
        });
      }, baseTime * 0.8);

      // Step 7: Complete
      setTimeout(() => {
        const intent = currentState.parsedQuery?.intent;
        let mockResult: ExtractedResult;

        if (intent === 'quote_request') {
          // Insurance quote mock data
          const baseAnnual = 800 + Math.floor(Math.random() * 1200);
          const deductibleOptions = [250, 500, 1000];
          const deductible = deductibleOptions[Math.floor(Math.random() * deductibleOptions.length)];
          const coverageOptions = ['Liability Only', 'Standard', 'Full Coverage', 'Premium'];
          const coverage = coverageOptions[Math.floor(Math.random() * coverageOptions.length)];

          mockResult = {
            site: lane.site.name,
            siteDomain: lane.site.domain,
            success: true,
            extractedAt: Date.now(),
            url: `https://${lane.site.domain}/quote/example`,
            annualCost: baseAnnual,
            monthlyCost: Math.round(baseAnnual / 12),
            deductible: deductible,
            coverage: coverage,
            currency: 'USD',
          };
        } else {
          // Product price mock data
          const basePrice = 189 + Math.floor(Math.random() * 60);
          const hasFreeShipping = Math.random() > 0.4;
          const isInStock = Math.random() > 0.15;

          const deliveryOptions = [
            'Arrives Friday',
            'Arrives tomorrow',
            'Arrives in 2 days',
            'Arrives next week',
            'Arrives Saturday',
            '2-day delivery',
          ];
          const deliveryEstimate = deliveryOptions[Math.floor(Math.random() * deliveryOptions.length)];

          mockResult = {
            site: lane.site.name,
            siteDomain: lane.site.domain,
            success: true,
            extractedAt: Date.now(),
            url: `https://${lane.site.domain}/product/example`,
            price: basePrice,
            currency: 'USD',
            inStock: isInStock,
            shipping: hasFreeShipping ? 'Free shipping' : '$5.99 shipping',
            shippingCost: hasFreeShipping ? 0 : 5.99,
            deliveryEstimate: isInStock ? deliveryEstimate : undefined,
          };
        }

        dispatch({ type: 'LANE_COMPLETE', laneId, result: mockResult });
      }, baseTime);

      return;
    }

    try {
      const result = await runPlaygroundQuery(query);
      console.log(`Lane ${laneId} session created:`, result.session_id);

      dispatch({
        type: 'LANE_UPDATE',
        laneId: lane.id,
        update: {
          sessionId: result.session_id,
          streamingUrl: result.streaming_url || undefined,
          status: 'navigating',
          progress: 25,
          currentAction: `Loading ${lane.site.name}...`,
        },
      });

      // Start polling
      const pollFn = async () => {
        const currentLane = lanesRef.current.find(l => l.id === laneId);
        if (!currentLane?.sessionId) return;
        if (currentLane.status === 'complete' || currentLane.status === 'error') {
          const interval = pollIntervalsRef.current.get(laneId);
          if (interval) {
            clearInterval(interval);
            pollIntervalsRef.current.delete(laneId);
          }
          return;
        }

        try {
          const session = await getSessionStatus(currentLane.sessionId);
          console.log(`Lane ${laneId} status:`, session.status);

          if (session.streaming_url && !currentLane.streamingUrl) {
            dispatch({
              type: 'LANE_UPDATE',
              laneId,
              update: { streamingUrl: session.streaming_url },
            });
          }

          if (session.status === 'completed') {
            const interval = pollIntervalsRef.current.get(laneId);
            if (interval) {
              clearInterval(interval);
              pollIntervalsRef.current.delete(laneId);
            }
            const extractedResult = extractResult(currentLane.site, session.output, stateRef.current.parsedQuery?.intent || 'general');
            dispatch({ type: 'LANE_COMPLETE', laneId, result: extractedResult });
          } else if (session.status === 'error') {
            const interval = pollIntervalsRef.current.get(laneId);
            if (interval) {
              clearInterval(interval);
              pollIntervalsRef.current.delete(laneId);
            }
            dispatch({ type: 'LANE_ERROR', laneId, error: session.error_message || 'Unknown error' });
          } else if (session.status === 'running') {
            const logLength = session.session_log?.length || 0;
            dispatch({
              type: 'LANE_UPDATE',
              laneId,
              update: { status: 'extracting', progress: Math.min(30 + logLength * 10, 90), currentAction: `Analyzing ${currentLane.site.name}...` },
            });
          }
        } catch (error) {
          console.error(`Polling error for ${laneId}:`, error);
        }
      };

      // Initial poll
      setTimeout(pollFn, 1000);
      // Then poll every 2 seconds
      const interval = setInterval(pollFn, 2000);
      pollIntervalsRef.current.set(laneId, interval);

    } catch (error) {
      console.error(`Failed to start lane ${laneId}:`, error);
      dispatch({
        type: 'LANE_ERROR',
        laneId: lane.id,
        error: error instanceof Error ? error.message : 'Failed to start session',
      });
    }
  }, []);

  // Execute - dispatch START_EXECUTION and let useEffect handle starting lanes
  const execute = useCallback(() => {
    if (state.status === 'running') return;
    if (state.selectedSites.length === 0) return;
    console.log('Starting execution with', state.selectedSites.length, 'sites');
    dispatch({ type: 'START_EXECUTION' });
  }, [state.status, state.selectedSites.length]);

  // Effect to start lanes when execution begins
  useEffect(() => {
    if (state.status !== 'running') return;
    if (state.lanes.length === 0) return;

    // Check if any lanes haven't been started yet
    const queuedLanes = state.lanes.filter(l => l.status === 'queued');
    if (queuedLanes.length === 0) return;

    console.log('Found', queuedLanes.length, 'queued lanes to start');

    const maxConcurrent = options.maxConcurrent || 6;
    const staggerDelay = options.staggerDelay || 300;

    // Start lanes with staggering
    queuedLanes.slice(0, maxConcurrent).forEach((lane, index) => {
      setTimeout(() => {
        startLane(lane.id);
      }, index * staggerDelay);
    });
  }, [state.status, state.lanes, options.maxConcurrent, options.staggerDelay, startLane]);

  // Effect to check completion
  useEffect(() => {
    if (state.status !== 'running') return;
    if (state.lanes.length === 0) return;

    const allDone = state.lanes.every(l => l.status === 'complete' || l.status === 'error');
    if (!allDone) return;

    console.log('All lanes complete, aggregating results');
    dispatch({ type: 'AGGREGATE_RESULTS' });
  }, [state.status, state.lanes]);

  // Effect to synthesize after aggregation
  useEffect(() => {
    if (!state.aggregatedResults) return;
    if (state.synthesis) return;

    const synthesis = generateSynthesis(state);
    dispatch({ type: 'SYNTHESIZE_RESULTS', synthesis });

    setTimeout(() => {
      dispatch({ type: 'COMPLETE' });
    }, 300);
  }, [state.aggregatedResults, state.synthesis]);

  // Reset
  const reset = useCallback(() => {
    cleanupPolling();
    dispatch({ type: 'RESET' });
  }, [cleanupPolling]);

  // Restore from saved state
  const restore = useCallback((savedState: OrchestratorState) => {
    dispatch({ type: 'RESTORE', state: savedState });
  }, []);

  // Current best
  const currentBest = state.lanes
    .filter(l => l.status === 'complete' && l.result?.price)
    .sort((a, b) => (a.result?.price || Infinity) - (b.result?.price || Infinity))[0]?.result;

  return {
    state,
    status: state.status,
    originalQuery: state.originalQuery,
    parsedQuery: state.parsedQuery,
    selectedSites: state.selectedSites,
    userInputs: state.userInputs,
    completedInputs: state.completedInputs,
    lanes: state.lanes,
    progress: state.progress,
    aggregatedResults: state.aggregatedResults,
    synthesis: state.synthesis,
    nextActions: state.nextActions,
    error: state.error,
    currentBest,
    isIdle: state.status === 'idle',
    isParsing: state.status === 'parsing',
    isClarifying: state.status === 'clarifying',
    isConfiguring: state.status === 'configuring',
    isRunning: state.status === 'running',
    isComplete: state.status === 'complete' || state.status === 'completing',
    estimatedTime: state.estimatedTotalTime,
    setQuery,
    updateSites,
    toggleSite,
    setUserInput,
    completeClarification,
    execute,
    reset,
    restore,
  };
}
