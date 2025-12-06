'use client';

import { useState, useRef, useCallback, useEffect, useReducer } from 'react';
import { runPlaygroundQuery, getSessionStatus } from '@/lib/api';
import {
  OrchestratorState,
  OrchestratorAction,
  OrchestratorStatus,
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
  staggerDelay: 300, // 300ms between spawns
  nextActions: [],
  progress: {
    total: 0,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
  },
});

// Reducer
function orchestratorReducer(
  state: OrchestratorState,
  action: OrchestratorAction
): OrchestratorState {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        originalQuery: action.query,
        status: 'parsing',
      };

    case 'PARSE_COMPLETE':
      return {
        ...state,
        parsedQuery: action.parsed,
        selectedSites: action.parsed.suggestedSites.filter(s => s.selected),
        status: 'configuring',
      };

    case 'UPDATE_SITES':
      return {
        ...state,
        selectedSites: action.sites.filter(s => s.selected),
        parsedQuery: state.parsedQuery
          ? { ...state.parsedQuery, suggestedSites: action.sites }
          : undefined,
      };

    case 'SET_USER_INPUT':
      return {
        ...state,
        userInputs: {
          ...state.userInputs,
          [action.key]: action.value,
        },
      };

    case 'START_EXECUTION': {
      const lanes: SessionLane[] = state.selectedSites.map((site, index) => ({
        id: `lane-${site.id}-${generateId()}`,
        site,
        status: index < state.maxConcurrent ? 'initializing' : 'queued',
        progress: 0,
      }));

      return {
        ...state,
        status: 'running',
        lanes,
        startTime: Date.now(),
        estimatedTotalTime: Math.max(...state.selectedSites.map(s => s.estimatedTime || 30)),
        progress: {
          total: lanes.length,
          queued: lanes.filter(l => l.status === 'queued').length,
          running: lanes.filter(l => l.status === 'initializing').length,
          completed: 0,
          failed: 0,
        },
      };
    }

    case 'LANE_UPDATE': {
      const lanes = state.lanes.map(lane =>
        lane.id === action.laneId ? { ...lane, ...action.update } : lane
      );
      const progress = computeProgress(lanes);
      return { ...state, lanes, progress };
    }

    case 'LANE_COMPLETE': {
      const lanes = state.lanes.map(lane =>
        lane.id === action.laneId
          ? { ...lane, status: 'complete' as LaneStatus, result: action.result, progress: 100, endTime: Date.now() }
          : lane
      );
      const progress = computeProgress(lanes);
      return { ...state, lanes, progress };
    }

    case 'LANE_ERROR': {
      const lanes = state.lanes.map(lane =>
        lane.id === action.laneId
          ? { ...lane, status: 'error' as LaneStatus, error: action.error, endTime: Date.now() }
          : lane
      );
      const progress = computeProgress(lanes);
      return { ...state, lanes, progress };
    }

    case 'AGGREGATE_RESULTS': {
      const results = state.lanes
        .filter(l => l.status === 'complete' && l.result)
        .map(l => l.result!);

      // Find best result based on intent
      let best: ExtractedResult | undefined;
      if (state.parsedQuery?.intent === 'price_comparison' || state.parsedQuery?.intent === 'availability_check') {
        best = results
          .filter(r => r.price !== undefined && r.inStock !== false)
          .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))[0];
      } else if (state.parsedQuery?.intent === 'quote_request') {
        best = results
          .filter(r => r.annualCost !== undefined)
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
      return {
        ...state,
        synthesis: action.synthesis,
        status: 'completing',
      };

    case 'COMPLETE': {
      const nextActions = generateNextActions(state);
      return {
        ...state,
        status: 'complete',
        nextActions,
      };
    }

    case 'ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

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
    if (state.parsedQuery?.intent === 'price_comparison') {
      actions.push({
        type: 'purchase',
        label: `Buy from ${best.site}`,
        primary: true,
        url: best.url,
      });
    } else {
      actions.push({
        type: 'purchase',
        label: `View on ${best.site}`,
        primary: true,
        url: best.url,
      });
    }
  }

  actions.push({
    type: 'save',
    label: 'Save results',
  });

  if (state.parsedQuery?.intent === 'price_comparison') {
    actions.push({
      type: 'alert',
      label: 'Alert if price drops',
    });
  }

  if (state.progress.failed > 0) {
    actions.push({
      type: 'retry',
      label: `Retry ${state.progress.failed} failed`,
    });
  }

  actions.push({
    type: 'new_search',
    label: 'New search',
  });

  return actions;
}

// Parse query to understand intent
async function parseQuery(query: string): Promise<ParsedQuery> {
  // Simulate AI parsing (in production, this would call an API)
  await new Promise(resolve => setTimeout(resolve, 600));

  const lowerQuery = query.toLowerCase();

  let intent: QueryIntent = 'general';
  let subject = query;
  let goal = 'find information';
  let isHighStakes = false;

  // Detect intent from keywords
  if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('cheap') || lowerQuery.includes('best deal')) {
    intent = 'price_comparison';
    goal = 'find best price';
    // Extract product name (simplified)
    const priceMatch = query.match(/(?:price|cost|deal)(?:\s+(?:for|of|on))?\s+(.+?)(?:\s+(?:on|at|from|across))?$/i);
    if (priceMatch) subject = priceMatch[1].trim();
  } else if (lowerQuery.includes('insurance') || lowerQuery.includes('quote')) {
    intent = 'quote_request';
    goal = 'compare quotes';
    isHighStakes = true;
  } else if (lowerQuery.includes('in stock') || lowerQuery.includes('available') || lowerQuery.includes('availability')) {
    intent = 'availability_check';
    goal = 'check availability';
  } else if (lowerQuery.includes('hours') || lowerQuery.includes('open') || lowerQuery.includes('when')) {
    intent = 'information_lookup';
    goal = 'find information';
  }

  // Get suggested sites based on intent
  const suggestedSites = [...(SITE_CATALOGS[intent] || SITE_CATALOGS.general)];

  return {
    originalQuery: query,
    intent,
    subject,
    goal,
    suggestedSites,
    isHighStakes,
    requiredInputs: isHighStakes
      ? [
          { key: 'address', label: 'Property Address', type: 'text', placeholder: '123 Main St, City, State', required: true },
          { key: 'value', label: 'Home Value', type: 'text', placeholder: '$400,000', required: true },
          { key: 'year', label: 'Year Built', type: 'text', placeholder: '1985', required: false },
        ]
      : undefined,
  };
}

// Extract result from session output (simplified parser)
function extractResult(site: TargetSite, output: unknown, intent: QueryIntent): ExtractedResult {
  const result: ExtractedResult = {
    site: site.name,
    siteDomain: site.domain,
    success: true,
    extractedAt: Date.now(),
    url: `https://${site.domain}`,
  };

  // Parse the output if it's a string (the raw response from the agent)
  if (typeof output === 'object' && output !== null && 'raw' in output) {
    const raw = (output as { raw: string }).raw;
    result.rawResponse = raw;

    // Try to extract price
    const priceMatch = raw.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) {
      result.price = parseFloat(priceMatch[1].replace(',', ''));
      result.currency = 'USD';
    }

    // Check for stock status
    if (raw.toLowerCase().includes('in stock') || raw.toLowerCase().includes('available')) {
      result.inStock = true;
    } else if (raw.toLowerCase().includes('out of stock') || raw.toLowerCase().includes('unavailable')) {
      result.inStock = false;
    }

    // Try to extract shipping info
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
    const avgPrice = results.reduce((sum, r) => sum + (r.price || 0), 0) / pricesFound;

    summary = `Found ${pricesFound} prices for ${subject}. The best deal is at ${best.site} for $${best.price.toFixed(2)}${best.shipping ? ` with ${best.shipping.toLowerCase()} shipping` : ''}.`;

    if (best.inStock) {
      insights.push(`${best.site} shows this item as in stock`);
    }

    if (avgPrice > best.price) {
      const savings = ((avgPrice - best.price) / avgPrice * 100).toFixed(0);
      insights.push(`This is ${savings}% below the average price of $${avgPrice.toFixed(2)}`);
    }

    // Find the most expensive
    const mostExpensive = results.sort((a, b) => (b.price || 0) - (a.price || 0))[0];
    if (mostExpensive && mostExpensive.price && mostExpensive.price > best.price) {
      insights.push(`${mostExpensive.site} charges $${(mostExpensive.price - best.price).toFixed(2)} more`);
    }

  } else if (intent === 'quote_request' && best?.annualCost) {
    headline = `Best rate: $${best.annualCost.toLocaleString()}/year at ${best.site}`;
    summary = `Compared ${results.length} insurance quotes. ${best.site} offers the lowest annual rate.`;
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
}

export function useOrchestrator(options: UseOrchestratorOptions = {}) {
  const [state, dispatch] = useReducer(orchestratorReducer, createInitialState());
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isExecutingRef = useRef(false);

  // Cleanup polling intervals
  const cleanupPolling = useCallback(() => {
    pollIntervalsRef.current.forEach(interval => clearInterval(interval));
    pollIntervalsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => cleanupPolling();
  }, [cleanupPolling]);

  // Set query and parse it
  const setQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;

    dispatch({ type: 'SET_QUERY', query });

    try {
      const parsed = await parseQuery(query);
      dispatch({ type: 'PARSE_COMPLETE', parsed });
    } catch (error) {
      dispatch({ type: 'ERROR', error: 'Failed to understand query' });
    }
  }, []);

  // Update site selection
  const updateSites = useCallback((sites: TargetSite[]) => {
    dispatch({ type: 'UPDATE_SITES', sites });
  }, []);

  // Toggle a specific site
  const toggleSite = useCallback((siteId: string) => {
    if (!state.parsedQuery) return;

    const updatedSites = state.parsedQuery.suggestedSites.map(site =>
      site.id === siteId ? { ...site, selected: !site.selected } : site
    );
    dispatch({ type: 'UPDATE_SITES', sites: updatedSites });
  }, [state.parsedQuery]);

  // Set user input for high-stakes queries
  const setUserInput = useCallback((key: string, value: string) => {
    dispatch({ type: 'SET_USER_INPUT', key, value });
  }, []);

  // Poll a single lane for updates
  const pollLane = useCallback(async (lane: SessionLane) => {
    if (!lane.sessionId) return;

    try {
      const session = await getSessionStatus(lane.sessionId);

      // Update streaming URL if available
      if (session.streaming_url && !lane.streamingUrl) {
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: {
            streamingUrl: session.streaming_url,
            status: 'navigating',
            progress: 30,
            currentAction: `Loading ${lane.site.name}...`,
          },
        });
      }

      // Check for completion
      if (session.status === 'completed') {
        // Stop polling this lane
        const interval = pollIntervalsRef.current.get(lane.id);
        if (interval) {
          clearInterval(interval);
          pollIntervalsRef.current.delete(lane.id);
        }

        // Extract result
        const result = extractResult(
          lane.site,
          session.output,
          state.parsedQuery?.intent || 'general'
        );

        dispatch({ type: 'LANE_COMPLETE', laneId: lane.id, result });
      } else if (session.status === 'error') {
        const interval = pollIntervalsRef.current.get(lane.id);
        if (interval) {
          clearInterval(interval);
          pollIntervalsRef.current.delete(lane.id);
        }

        dispatch({
          type: 'LANE_ERROR',
          laneId: lane.id,
          error: session.error_message || 'Unknown error',
        });
      } else if (session.status === 'running') {
        // Update progress based on session log length
        const logLength = session.session_log?.length || 0;
        const progress = Math.min(30 + logLength * 10, 90);
        dispatch({
          type: 'LANE_UPDATE',
          laneId: lane.id,
          update: {
            status: 'extracting',
            progress,
            currentAction: `Analyzing ${lane.site.name}...`,
          },
        });
      }
    } catch (error) {
      console.error(`Polling error for lane ${lane.id}:`, error);
    }
  }, [state.parsedQuery?.intent]);

  // Start a single lane
  const startLane = useCallback(async (lane: SessionLane) => {
    const query = `Find ${state.parsedQuery?.goal || 'information'} for ${state.parsedQuery?.subject || state.originalQuery} on ${lane.site.domain}`;

    try {
      dispatch({
        type: 'LANE_UPDATE',
        laneId: lane.id,
        update: {
          status: 'initializing',
          progress: 10,
          currentAction: `Starting ${lane.site.name}...`,
          startTime: Date.now(),
        },
      });

      const result = await runPlaygroundQuery(query);

      dispatch({
        type: 'LANE_UPDATE',
        laneId: lane.id,
        update: {
          sessionId: result.session_id,
          streamingUrl: result.streaming_url || undefined,
          status: result.streaming_url ? 'navigating' : 'initializing',
          progress: 20,
        },
      });

      // Start polling this lane
      const interval = setInterval(() => {
        const currentLane = state.lanes.find(l => l.id === lane.id);
        if (currentLane && currentLane.sessionId) {
          pollLane(currentLane);
        }
      }, 2000);

      pollIntervalsRef.current.set(lane.id, interval);

    } catch (error) {
      dispatch({
        type: 'LANE_ERROR',
        laneId: lane.id,
        error: error instanceof Error ? error.message : 'Failed to start session',
      });
    }
  }, [state.parsedQuery, state.originalQuery, state.lanes, pollLane]);

  // Execute all lanes
  const execute = useCallback(async () => {
    if (isExecutingRef.current) return;
    if (state.selectedSites.length === 0) return;

    isExecutingRef.current = true;
    dispatch({ type: 'START_EXECUTION' });

    // Get lanes to start (limited by maxConcurrent)
    const maxConcurrent = options.maxConcurrent || 6;
    const staggerDelay = options.staggerDelay || 300;

    // We need to wait for the START_EXECUTION dispatch to update state
    // So we'll use the selectedSites directly
    const lanesToStart = state.selectedSites.slice(0, maxConcurrent);

    for (let i = 0; i < lanesToStart.length; i++) {
      const site = lanesToStart[i];
      const lane: SessionLane = {
        id: `lane-${site.id}-${generateId()}`,
        site,
        status: 'initializing',
        progress: 0,
      };

      // Stagger the starts
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, staggerDelay));
      }

      startLane(lane);
    }

    isExecutingRef.current = false;
  }, [state.selectedSites, options.maxConcurrent, options.staggerDelay, startLane]);

  // Check if all lanes are complete
  useEffect(() => {
    if (state.status !== 'running') return;

    const allDone = state.lanes.length > 0 &&
      state.lanes.every(l => l.status === 'complete' || l.status === 'error');

    if (allDone) {
      // Aggregate results
      dispatch({ type: 'AGGREGATE_RESULTS' });

      // Generate synthesis
      const synthesis = generateSynthesis(state);
      dispatch({ type: 'SYNTHESIZE_RESULTS', synthesis });

      // Mark as complete
      setTimeout(() => {
        dispatch({ type: 'COMPLETE' });
      }, 500);
    }
  }, [state.lanes, state.status]);

  // Reset
  const reset = useCallback(() => {
    cleanupPolling();
    isExecutingRef.current = false;
    dispatch({ type: 'RESET' });
  }, [cleanupPolling]);

  // Get current best result (for live "best so far" display)
  const currentBest = state.lanes
    .filter(l => l.status === 'complete' && l.result?.price)
    .sort((a, b) => (a.result?.price || Infinity) - (b.result?.price || Infinity))[0]?.result;

  return {
    // State
    state,
    status: state.status,
    originalQuery: state.originalQuery,
    parsedQuery: state.parsedQuery,
    selectedSites: state.selectedSites,
    lanes: state.lanes,
    progress: state.progress,
    aggregatedResults: state.aggregatedResults,
    synthesis: state.synthesis,
    nextActions: state.nextActions,
    error: state.error,
    currentBest,

    // Computed
    isIdle: state.status === 'idle',
    isParsing: state.status === 'parsing',
    isConfiguring: state.status === 'configuring',
    isRunning: state.status === 'running',
    isComplete: state.status === 'complete' || state.status === 'completing',
    estimatedTime: state.estimatedTotalTime,

    // Actions
    setQuery,
    updateSites,
    toggleSite,
    setUserInput,
    execute,
    reset,
  };
}
