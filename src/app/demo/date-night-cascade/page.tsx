'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SparklesIcon,
  SearchIcon,
  StarIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@/components/icons';
import {
  // Types
  BaseDemoLane,
  AgentThought,
  // Timeline
  TimelineContainer,
  TimelineStep,
  TimelineResultStep,
  TimelineFinalStep,
  // Sources
  SourcesList,
  SearchPanel,
  // Filters
  SearchFiltersWrapper,
  FilterLabel,
  FilterOption,
  // Layout
  DemoLayout,
  WhatsNextActions,
  WhatsNextLabel,
  SignUpOverlay,
  // Popovers
  TransparencyView,
  AdjustSearchView,
} from '@/components/demo';
import {
  DATE_NIGHT_QUERY,
  DATE_NIGHT_RESULTS,
  DATE_NIGHT_BEST_RESULT,
  DATE_NIGHT_SYNTHESIS,
  formatPriceLevel,
  type RestaurantResult,
} from '@/lib/mock-data';

// =============================================================================
// TYPES
// =============================================================================

type LaneStatus = 'pending' | 'spawning' | 'navigating' | 'extracting' | 'complete' | 'error';

interface DemoLane extends BaseDemoLane {
  result?: RestaurantResult;
}

type DemoPhase = 'idle' | 'ready' | 'analyzing' | 'spawning' | 'running' | 'synthesizing' | 'complete';

interface SearchFilters {
  partySize: number;
  atmosphere: string;
  priceRange: string;
}

// =============================================================================
// INITIAL DATA
// =============================================================================

const LANES_DATA: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'resy', site: 'Resy', domain: 'resy.com' },
  { id: 'opentable', site: 'OpenTable', domain: 'opentable.com' },
  { id: 'yelp', site: 'Yelp', domain: 'yelp.com' },
  { id: 'google', site: 'Google', domain: 'google.com/maps' },
  { id: 'tock', site: 'Tock', domain: 'exploretock.com' },
];

// =============================================================================
// DATE NIGHT FILTERS
// =============================================================================

function DateNightFilters({
  filters,
  onFiltersChange,
}: {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}) {
  return (
    <>
      {/* Party Size */}
      <div>
        <FilterLabel>Party size</FilterLabel>
        <div className="flex gap-2">
          {[2, 4, 6].map(size => (
            <FilterOption
              key={size}
              label={`${size} guests`}
              isSelected={filters.partySize === size}
              onClick={() => onFiltersChange({ ...filters, partySize: size })}
            />
          ))}
        </div>
      </div>

      {/* Atmosphere */}
      <div>
        <FilterLabel>Vibe</FilterLabel>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'romantic', label: 'Romantic' },
            { id: 'lively', label: 'Lively' },
            { id: 'quiet', label: 'Quiet' },
          ].map(opt => (
            <FilterOption
              key={opt.id}
              label={opt.label}
              isSelected={filters.atmosphere === opt.id}
              onClick={() => onFiltersChange({ ...filters, atmosphere: opt.id })}
            />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <FilterLabel>Budget</FilterLabel>
        <div className="flex gap-2">
          {['$$', '$$$', '$$$$'].map(price => (
            <FilterOption
              key={price}
              label={price}
              isSelected={filters.priceRange === price}
              onClick={() => onFiltersChange({ ...filters, priceRange: price })}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// =============================================================================
// HERO RESULT CARD
// =============================================================================

function HeroResultCard({ onBook }: { onBook: () => void }) {
  const result = DATE_NIGHT_BEST_RESULT;
  const synthesis = DATE_NIGHT_SYNTHESIS;

  if (!result.restaurant) return null;

  return (
    <div className="space-y-5">
      {/* Image Grid */}
      <div className="grid grid-cols-4 gap-2 h-48">
        <div className="col-span-2 row-span-2 rounded-xl overflow-hidden bg-gradient-to-br from-amber-900/40 to-slate-900 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">🍝</div>
              <div className="text-white/40 text-xs">Handmade Pasta</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-rose-900/30 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🥖</div>
            <div className="text-white/30 text-[10px]">Fresh Bread</div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-amber-800/30 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🍷</div>
            <div className="text-white/30 text-[10px]">Wine Bar</div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-orange-900/30 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🕯️</div>
            <div className="text-white/30 text-[10px]">Intimate</div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🧑‍🍳</div>
            <div className="text-white/30 text-[10px]">Chef's Table</div>
          </div>
        </div>
      </div>

      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{result.restaurant.name}</h1>
          <div className="flex items-center gap-3 text-white/60 mt-1">
            <span className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-amber-400" />
              {result.restaurant.rating} ({result.restaurant.reviewCount})
            </span>
            <span>•</span>
            <span>{result.restaurant.cuisine}</span>
            <span>•</span>
            <span>{formatPriceLevel(result.restaurant.priceLevel)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{synthesis.subtitle}</div>
          <div className="text-white/50 text-sm">Party of 2</div>
        </div>
      </div>

      {/* Vibe Badges */}
      <div className="flex flex-wrap gap-2">
        {result.restaurant.vibe.map((v, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            {v}
          </span>
        ))}
      </div>

      {/* Why Mino Picked This */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
          Why Mino Picked This
        </div>
        <ul className="space-y-2">
          {synthesis.rationale.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-white/80">
              <span className="text-amber-400 mt-0.5">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Restaurant Card with Call + Reservation */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">
            🍽️
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">{result.restaurant.name}</div>
            <div className="flex items-center gap-3 text-white/50 text-sm mt-1">
              <span className="flex items-center gap-1">
                <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                {result.restaurant.rating} ({result.restaurant.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {result.restaurant.distance} mi
              </span>
            </div>
          </div>
          <button className="py-2.5 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
            <PhoneIcon className="w-4 h-4" />
            Call
          </button>
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/50 text-xs uppercase tracking-wider font-medium">
              Available Times Tonight
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap flex-1">
              {['6:30pm', '7:00pm', '7:15pm', '7:30pm', '8:00pm', '8:30pm'].map((time, i) => (
                <button
                  key={i}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    i === 1
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <button
              onClick={onBook}
              className="py-3 px-6 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-colors flex-shrink-0"
            >
              Reserve 7:00pm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ALTERNATIVE RESULT CARD
// =============================================================================

function AlternativeResultCard({ result, onBook }: { result: RestaurantResult; onBook: () => void }) {
  if (!result.restaurant) return null;

  return (
    <div className="w-56 flex-shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors">
      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-amber-900/20 to-slate-800 flex items-center justify-center mb-3">
        <span className="text-3xl">🍝</span>
      </div>
      <div className="space-y-2">
        <div className="text-white font-medium text-sm truncate">{result.restaurant.name}</div>
        <div className="text-white/50 text-xs">
          {result.restaurant.cuisine} • {formatPriceLevel(result.restaurant.priceLevel)}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <StarIcon className="w-3 h-3" />
            {result.restaurant.rating}
          </div>
          <div className="text-white/70 text-sm">{result.restaurant.availability.time}</div>
        </div>
        <button
          onClick={onBook}
          className="w-full py-2 px-3 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors border border-white/10"
        >
          Book {result.restaurant.availability.time}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function DateNightCascadePage() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [agentThought, setAgentThought] = useState<AgentThought | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    partySize: 2,
    atmosphere: 'romantic',
    priceRange: '$$$',
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  const alternativeResults = DATE_NIGHT_RESULTS.filter(
    r => r.status === 'available' && r.id !== 'resy'
  );

  const getMockResult = useCallback((laneId: string): RestaurantResult | undefined => {
    return DATE_NIGHT_RESULTS.find(r => r.id === laneId);
  }, []);

  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => {
    setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  useEffect(() => {
    if (selectedLaneId) return;
    const activeLane = lanes.find(l => !['pending', 'complete'].includes(l.status));
    if (activeLane) setSelectedLaneId(activeLane.id);
  }, [lanes, selectedLaneId]);

  const startDemo = useCallback(() => {
    setPhase('ready');
    setLanes([]);
    setSelectedLaneId(null);
    setFiltersExpanded(true);
    setSourcesExpanded(true);
    setIsThinking(true);
    setShowFilters(false);
    setAgentThought(null);
    setTimeout(() => {
      setIsThinking(false);
      setShowFilters(true);
    }, 1500);
  }, []);

  const handleStartSearch = useCallback(() => {
    setFiltersExpanded(false);
    setPhase('analyzing');

    // Initial planning thought
    setAgentThought({
      type: 'planning',
      message: "I'll check Resy first — they have the best real-time availability data for upscale spots.",
      reasoning: 'Romantic + $$$ usually means better inventory on Resy vs OpenTable'
    });

    setTimeout(() => {
      setPhase('spawning');
      const allLanes: DemoLane[] = LANES_DATA.map(l => ({
        ...l,
        status: 'spawning' as LaneStatus,
        progress: 0,
        currentAction: 'Connecting...',
      }));
      setLanes(allLanes);
      setSelectedLaneId(allLanes[0].id);

      // Update thought for spawning
      setAgentThought({
        type: 'executing',
        message: 'Launching parallel searches across 5 reservation platforms...',
        reasoning: 'Running simultaneously to compare availability and prices'
      });

      setTimeout(() => {
        setPhase('running');

        // Thought sequence during search (slower pacing for readability)
        const thoughtSequence: { delay: number; thought: AgentThought }[] = [
          {
            delay: 1500,
            thought: {
              type: 'analyzing',
              message: 'Resy showing 3 restaurants matching your criteria... checking reservation slots.',
            }
          },
          {
            delay: 4000,
            thought: {
              type: 'analyzing',
              message: 'Found availability at Lucia — 4.8 stars, romantic lighting mentioned in 12 reviews.',
              reasoning: 'Cross-referencing ratings with atmosphere keywords'
            }
          },
          {
            delay: 6500,
            thought: {
              type: 'executing',
              message: 'OpenTable search complete. Comparing pricing tiers with Resy results...',
            }
          },
          {
            delay: 8500,
            thought: {
              type: 'adapting',
              message: 'Yelp has more reviews but no direct booking — extracting ratings to validate choices.',
              reasoning: 'Using Yelp for social proof, Resy/OpenTable for booking'
            }
          },
          {
            delay: 10500,
            thought: {
              type: 'success',
              message: 'Found 4 great options. Ranking by your preferences: romantic vibe, $$$, tonight...',
            }
          },
        ];

        thoughtSequence.forEach(({ delay, thought }) => {
          setTimeout(() => setAgentThought(thought), delay);
        });

        allLanes.forEach((lane, i) => {
          const mockResult = getMockResult(lane.id);
          const baseDelay = 200 + (i * 400);

          setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 25, currentAction: 'Searching...' }), baseDelay);
          setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 60, currentAction: 'Extracting...' }), baseDelay + 800);
          setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 85, currentAction: 'Verifying...' }), baseDelay + 1400);
          setTimeout(() => updateLane(lane.id, { status: 'complete', progress: 100, result: mockResult }), baseDelay + 2000);
        });

        setTimeout(() => {
          setPhase('synthesizing');
          setAgentThought({
            type: 'analyzing',
            message: 'Analyzing 4 options across price, reviews, atmosphere, and availability...',
          });
          setTimeout(() => {
            setPhase('complete');
            setAgentThought(null);
          }, 800);
        }, 3500);
      }, 400);
    }, 800);
  }, [getMockResult, updateLane]);

  useEffect(() => {
    const timer = setTimeout(startDemo, 500);
    return () => clearTimeout(timer);
  }, [startDemo]);

  useEffect(() => {
    if (phase === 'complete' && resultsRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [phase]);

  const totalComplete = lanes.filter(l => l.status === 'complete').length;
  const isSearching = phase !== 'idle' && phase !== 'complete' && phase !== 'ready';
  const selectedLane = lanes.find(l => l.id === selectedLaneId);

  // Transparency data
  const transparencySources = DATE_NIGHT_RESULTS.map(r => ({
    id: r.id,
    site: r.site,
    status: r.status as 'available' | 'no_results',
    isBest: r.id === 'resy',
    statusText: r.status === 'available' && r.restaurant
      ? (r.id === 'resy' ? '← BEST' : r.restaurant.availability.time)
      : 'No results',
  }));

  const pivots = [
    { icon: '🕐', label: 'Try later time', description: '8pm or after' },
    { icon: '📍', label: 'Expand area', description: '10+ miles out' },
    { icon: '🍕', label: 'Try other cuisines', description: 'Mexican, French, etc.' },
    { icon: '💰', label: 'Change price range', description: '$$ to $$$$' },
  ];

  const whatsNextActions = [
    { icon: '🔄', label: 'New Search', onClick: startDemo },
    { icon: '🔔', label: 'Set Alert', onClick: () => setShowSignUp(true) },
    { icon: '💾', label: 'Save Results', onClick: () => setShowSignUp(true) },
    { icon: '↗', label: 'Share', onClick: () => setShowSignUp(true) },
  ];

  return (
    <DemoLayout
      onRestart={startDemo}
      overlay={
        <SignUpOverlay
          isOpen={showSignUp}
          onClose={() => setShowSignUp(false)}
          accentColor="amber"
          subtitle="Save your reservations, get alerts, and more"
        />
      }
    >
      <TimelineContainer showLine={isSearching || phase === 'complete'}>
        {/* Step 1: Query + Filters */}
        <TimelineStep
          icon={<SparklesIcon className="w-3.5 h-3.5" />}
          isActive={phase === 'ready' || phase === 'idle'}
          isComplete={phase !== 'ready' && phase !== 'idle'}
          accentColor="amber"
        >
          <div className="p-4 border-b border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Finding</div>
            <div className="text-white text-lg">"{DATE_NIGHT_QUERY}"</div>
          </div>
          <SearchFiltersWrapper
            isExpanded={filtersExpanded}
            onToggle={() => setFiltersExpanded(!filtersExpanded)}
            showFilters={showFilters}
            isThinking={isThinking}
            isSearching={isSearching}
            onStartSearch={handleStartSearch}
            summaryChips={[`${filters.partySize} guests`, filters.atmosphere, filters.priceRange]}
          >
            <DateNightFilters filters={filters} onFiltersChange={setFilters} />
          </SearchFiltersWrapper>
        </TimelineStep>

        {/* Step 2: Sources + Browser */}
        {(isSearching || phase === 'complete') && (
          <TimelineStep
            icon={<SearchIcon className="w-3.5 h-3.5" />}
            isActive={isSearching}
            isComplete={phase === 'complete'}
            accentColor="amber"
          >
            <button
              onClick={() => phase === 'complete' && setSourcesExpanded(!sourcesExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 ${sourcesExpanded ? 'border-b border-white/10' : ''} ${phase === 'complete' ? 'hover:bg-white/[0.02] cursor-pointer' : ''} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span className="text-white/80 font-medium">
                  {phase === 'complete' ? 'Search Complete' : 'Searching Sources'}
                </span>
                {!sourcesExpanded && phase === 'complete' && (
                  <span className="text-white/40 text-sm">
                    • {lanes.length} sources checked • {lanes.filter(l => l.result?.restaurant).length} found availability
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">{totalComplete} of {lanes.length}</span>
                {phase === 'complete' && (
                  <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} />
                )}
              </div>
            </button>

            {sourcesExpanded && (
              <SearchPanel
                accentColor="amber"
                agentThought={agentThought}
                isSearching={isSearching}
                totalSessions={lanes.length}
                browser={selectedLane ? {
                  domain: selectedLane.domain,
                  status: selectedLane.status,
                  currentAction: selectedLane.currentAction,
                  siteIcon: '🍝',
                  siteName: selectedLane.site,
                  siteSubtitle: 'Restaurant reservations',
                  completeOverlay: selectedLane.result?.restaurant ? (
                    <div className="text-center">
                      <p className="text-white font-bold text-xl">{selectedLane.result.restaurant.name}</p>
                      <p className="text-amber-400 text-sm mt-1 flex items-center justify-center gap-1">
                        <StarIcon className="w-4 h-4" />
                        {selectedLane.result.restaurant.rating} • {selectedLane.result.restaurant.availability.time}
                      </p>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">{selectedLane.result?.statusMessage || 'No results'}</p>
                  )
                } : null}
              >
                <SourcesList
                  lanes={lanes}
                  selectedLaneId={selectedLaneId}
                  onSelectLane={setSelectedLaneId}
                  accentColor="amber"
                  hasResult={(lane) => !!lane.result?.restaurant}
                  getResultLabel={(lane) => lane.result?.restaurant ? 'Found 1' : 'No results'}
                />
              </SearchPanel>
            )}
          </TimelineStep>
        )}

        {/* Step 3: Results */}
        {phase === 'complete' && (
          <TimelineResultStep
            ref={resultsRef}
            icon={<StarIcon className="w-3.5 h-3.5" />}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white/80 font-medium">Results</span>
              <span className="text-white/40 text-sm">
                {DATE_NIGHT_RESULTS.filter(r => r.status === 'available').length} reservations available
              </span>
            </div>
            <div className="p-4 space-y-6">
              <HeroResultCard onBook={() => setShowSignUp(true)} />
              {alternativeResults.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">Other Options</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {alternativeResults.map(result => (
                      <AlternativeResultCard key={result.id} result={result} onBook={() => setShowSignUp(true)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TimelineResultStep>
        )}

        {/* Step 4: What's Next */}
        {phase === 'complete' && (
          <TimelineFinalStep
            icon={<ArrowRightIcon className="w-3.5 h-3.5" />}
            animationDelay="200ms"
          >
            <div className="p-4">
              <WhatsNextLabel />
              <WhatsNextActions actions={whatsNextActions} />
            </div>
          </TimelineFinalStep>
        )}
      </TimelineContainer>
    </DemoLayout>
  );
}
