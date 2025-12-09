'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SearchIcon,
  StarIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  CheckIcon,
  ChevronDownIcon,
  CalendarIcon,
  BookmarkIcon,
  ShareIcon,
  MessageCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  BellIcon,
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
  PlanningStep,
  SynthesisStep,
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

type DemoPhase = 'idle' | 'ready' | 'planning' | 'spawning' | 'running' | 'synthesizing' | 'complete';

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

// Gallery images for Fachini
const HERO_RESTAURANT_GALLERY = [
  '/reservation-research/Fachini-1.jpg',
  '/reservation-research/Fachini-2.jpg',
  '/reservation-research/Fachini-interior-1.jpg',
  '/reservation-research/fachini-3.webp',
  '/reservation-research/fachini-4.jpg',
];

function HeroResultCard({ onBook }: { onBook: () => void }) {
  const result = DATE_NIGHT_BEST_RESULT;
  const synthesis = DATE_NIGHT_SYNTHESIS;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(1); // Default to 7pm

  if (!result.restaurant) return null;

  const timeSlots = [
    { time: '6:30pm', available: true },
    { time: '7:00pm', available: true },
    { time: '7:30pm', available: true },
    { time: '8:00pm', available: true },
  ];

  return (
    <div className="space-y-5">
      {/* Image Gallery */}
      <div className="space-y-2">
        {/* Hero Image */}
        <div className="relative h-72 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 ring-1 ring-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
          <img
            src={HERO_RESTAURANT_GALLERY[selectedImage]}
            alt={result.restaurant.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>{result.restaurant.cuisine}</span>
              <span>•</span>
              <span>{formatPriceLevel(result.restaurant.priceLevel)}</span>
              <span>•</span>
              <span>{result.restaurant.distance} mi away</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="flex gap-1.5">
          {HERO_RESTAURANT_GALLERY.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`relative flex-1 aspect-[4/3] rounded-lg overflow-hidden transition-all ${
                selectedImage === i
                  ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-[#0a0a14]'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Title Row with Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{result.restaurant.name}</h1>
          <div className="flex items-center gap-3 text-white/60 mt-1 text-sm">
            <span className="flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5 text-cyan-400" />
              {result.restaurant.rating} ({result.restaurant.reviewCount})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5" />
              {result.restaurant.distance} mi
            </span>
            <span>•</span>
            <span>{formatPriceLevel(result.restaurant.priceLevel)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="py-1.5 px-2.5 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/15 transition-colors flex items-center gap-1">
            <ExternalLinkIcon className="w-3 h-3" />Menu
          </button>
          <button className="py-1.5 px-2.5 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/15 transition-colors flex items-center gap-1">
            <PhoneIcon className="w-3 h-3" />Call
          </button>
        </div>
      </div>

      {/* Vibe Badges */}
      <div className="flex flex-wrap gap-2">
        {result.restaurant.vibe.map((v, i) => (
          <span key={i} className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300/90 text-xs flex items-center gap-1">
            <CheckIcon className="w-3 h-3" />
            {v}
          </span>
        ))}
      </div>

      {/* Why Mino Picked This - no container */}
      <div>
        <div className="text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">
          Why Mino Picked This
        </div>
        <ul className="space-y-1.5">
          {synthesis.rationale.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
              <span className="text-cyan-400 mt-0.5">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Mino Reservation Action Block */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">M</span>
          </div>
          <span className="text-white/70 text-sm font-medium">Mino can book your reservation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {timeSlots.map((slot, i) => (
              <button
                key={i}
                onClick={() => setSelectedTimeSlot(i)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedTimeSlot === i
                    ? 'bg-cyan-500/20 border border-cyan-400/50 text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
          {selectedTimeSlot !== null && (
            <button
              onClick={onBook}
              className="py-2 px-4 rounded-lg bg-cyan-600/80 text-white text-sm font-medium hover:bg-cyan-500/80 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Reserve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ALTERNATIVE RESULT CARD
// =============================================================================

function AlternativeResultCard({ result, onBook }: { result: RestaurantResult; onBook: () => void }) {
  const [selectedTime, setSelectedTime] = useState(0);
  if (!result.restaurant) return null;

  // Generate multiple available times based on the restaurant's time
  const baseTime = result.restaurant.availability.time;
  const availableTimes = [baseTime];
  // Add 30 min and 1 hour later slots
  const baseHour = parseInt(baseTime.split(':')[0]);
  const isPM = baseTime.includes('pm');
  availableTimes.push(`${baseHour}:30${isPM ? 'pm' : 'am'}`);
  availableTimes.push(`${baseHour + 1}:00${isPM ? 'pm' : 'am'}`);

  return (
    <div className="w-72 flex-shrink-0 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:bg-white/[0.03] transition-colors group">
      {/* Image */}
      <div className="h-32 overflow-hidden relative">
        <img
          src={result.restaurant.image}
          alt={result.restaurant.name}
          className="w-full h-full object-cover"
        />
        {/* View more button - appears on hover */}
        <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg">
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-white font-medium text-sm">{result.restaurant.name}</div>
            <div className="text-white/50 text-xs mt-0.5">
              {result.restaurant.cuisine} • {formatPriceLevel(result.restaurant.priceLevel)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-cyan-400 text-xs bg-cyan-500/10 px-1.5 py-0.5 rounded">
            <StarIcon className="w-3 h-3" />
            {result.restaurant.rating}
          </div>
        </div>

        {/* Available Times */}
        <div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5">Available tonight</div>
          <div className="flex gap-1.5">
            {availableTimes.map((time, i) => (
              <button
                key={i}
                onClick={() => setSelectedTime(i)}
                className={`flex-1 py-1.5 px-2 rounded text-xs transition-all ${
                  selectedTime === i
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/60 hover:bg-white/[0.06]'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={onBook}
          className="w-full py-2 px-3 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors border border-white/10 flex items-center justify-center gap-1.5"
        >
          <CalendarIcon className="w-3 h-3" />
          Book {availableTimes[selectedTime]}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function DateNightCascadePage() {
  const searchParams = useSearchParams();
  const isResultsView = searchParams.get('view') === 'results';

  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signupContext, setSignupContext] = useState<string>('');
  const openSignup = (context: string) => { setSignupContext(context); setShowSignUp(true); };
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

  // Cycle through active sessions periodically during search to show parallel execution
  useEffect(() => {
    if (phase !== 'running') return;

    const cycleInterval = setInterval(() => {
      setSelectedLaneId(prevId => {
        // Get all active (non-complete) lanes
        const activeLanes = lanes.filter(l => l.status !== 'complete' && l.status !== 'pending');
        if (activeLanes.length <= 1) return prevId;

        // Find current index among active lanes
        const currentIndex = activeLanes.findIndex(l => l.id === prevId);
        // Move to next active lane (wrap around)
        const nextIndex = (currentIndex + 1) % activeLanes.length;
        return activeLanes[nextIndex].id;
      });
    }, 3500); // Cycle every 3.5 seconds

    return () => clearInterval(cycleInterval);
  }, [phase, lanes]);

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
    setPhase('planning');
    setAgentThought(null);
  }, []);

  // Called when planning animation completes
  const handlePlanningComplete = useCallback(() => {
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

      // Thought sequence during search (spread over 30 seconds)
      const thoughtSequence: { delay: number; thought: AgentThought }[] = [
        {
          delay: 2000,
          thought: {
            type: 'analyzing',
            message: 'Resy showing 3 restaurants matching your criteria... checking reservation slots.',
          }
        },
        {
          delay: 7000,
          thought: {
            type: 'analyzing',
            message: 'Found availability at Lucia — 4.8 stars, romantic lighting mentioned in 12 reviews.',
            reasoning: 'Cross-referencing ratings with atmosphere keywords'
          }
        },
        {
          delay: 14000,
          thought: {
            type: 'executing',
            message: 'OpenTable search complete. Comparing pricing tiers with Resy results...',
          }
        },
        {
          delay: 20000,
          thought: {
            type: 'adapting',
            message: 'Yelp has more reviews but no direct booking — extracting ratings to validate choices.',
            reasoning: 'Using Yelp for social proof, Resy/OpenTable for booking'
          }
        },
        {
          delay: 27000,
          thought: {
            type: 'success',
            message: 'Found 4 great options. Ranking by your preferences: romantic vibe, $$$, tonight...',
          }
        },
      ];

      thoughtSequence.forEach(({ delay, thought }) => {
        setTimeout(() => setAgentThought(thought), delay);
      });

      // Start ALL lanes nearly simultaneously (small stagger for visual effect)
      // but have them COMPLETE at different staggered times over ~30 seconds
      const completionTimes = [8000, 14000, 18000, 24000, 28000]; // When each lane finishes

      allLanes.forEach((lane, i) => {
        const mockResult = getMockResult(lane.id);
        const startDelay = 500 + (i * 400); // Start all within first 2.5 seconds
        const completionTime = completionTimes[i] || 25000;
        const duration = completionTime - startDelay;

        // All lanes start nearly together
        setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 15, currentAction: 'Loading page...' }), startDelay);
        setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 30, currentAction: 'Searching...' }), startDelay + duration * 0.2);
        setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 50, currentAction: 'Found results...' }), startDelay + duration * 0.5);
        setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 75, currentAction: 'Extracting data...' }), startDelay + duration * 0.75);
        setTimeout(() => {
          updateLane(lane.id, { status: 'complete', progress: 100, result: mockResult });
        }, completionTime);
      });

      // Move to synthesizing after all lanes complete (~30 seconds)
      setTimeout(() => {
        setPhase('synthesizing');
        setAgentThought(null);
      }, 30000);
    }, 600);
  }, [getMockResult, updateLane]);

  // Called when synthesis animation completes
  const handleSynthesisComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  // Skip to completed state for results view
  const skipToComplete = useCallback(() => {
    const completedLanes: DemoLane[] = DATE_NIGHT_RESULTS.map(r => ({
      id: r.id,
      site: r.site,
      domain: r.site.toLowerCase().replace(/\s+/g, '') + '.com',
      status: 'complete' as LaneStatus,
      progress: 100,
      currentAction: 'Done',
      result: r,
    }));
    setLanes(completedLanes);
    setPhase('complete');
    setFiltersExpanded(false);
    setSourcesExpanded(false);
    setAgentThought(null);
  }, []);

  useEffect(() => {
    if (isResultsView) {
      skipToComplete();
    } else {
      const timer = setTimeout(startDemo, 500);
      return () => clearTimeout(timer);
    }
  }, [isResultsView, skipToComplete, startDemo]);

  useEffect(() => {
    if (phase === 'complete' && resultsRef.current) {
      setTimeout(() => {
        const element = resultsRef.current;
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [phase]);

  const totalComplete = lanes.filter(l => l.status === 'complete').length;
  const isSearching = phase === 'spawning' || phase === 'running';
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
    { icon: <BellIcon className="w-4 h-4" />, label: 'Monitor for Openings', subtitle: 'Get notified when tables open up', onClick: () => openSignup('Sign up to get notified when tables open up') },
    { icon: <BookmarkIcon className="w-4 h-4" />, label: 'Save', subtitle: 'Keep for later', onClick: () => openSignup('Sign up to save this search and come back anytime') },
    { icon: <ShareIcon className="w-4 h-4" />, label: 'Share', subtitle: 'Send link to anyone', onClick: () => openSignup('Sign up to share these options with your date') },
  ];

  return (
    <DemoLayout
      onRestart={startDemo}
      onSignUp={() => openSignup('Create a free account to save your results')}
      query={DATE_NIGHT_QUERY}
      overlay={
        <SignUpOverlay
          isOpen={showSignUp}
          onClose={() => setShowSignUp(false)}
          subtitle={signupContext}
        />
      }
    >
      <TimelineContainer>
        {/* Step 1: Query + Filters */}
        <TimelineStep
          icon={<SearchIcon className="w-3.5 h-3.5" />}
          isActive={phase === 'ready' || phase === 'idle'}
          isComplete={phase !== 'ready' && phase !== 'idle'}
          accentColor="cyan"
          showConnector={phase === 'planning' || isSearching || phase === 'complete'}
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

        {/* Step 2: Planning */}
        <PlanningStep
          isPlanning={phase === 'planning'}
          isVisible={phase === 'planning' || isSearching || phase === 'complete'}
          showConnector={isSearching || phase === 'complete'}
          sites={LANES_DATA}
          accentColor="cyan"
          onPlanningComplete={handlePlanningComplete}
        />

        {/* Step 3: Sources + Browser */}
        {(isSearching || phase === 'synthesizing' || phase === 'complete') && (
          <TimelineStep
            icon={<SearchIcon className="w-3.5 h-3.5" />}
            isActive={isSearching}
            isComplete={phase === 'synthesizing' || phase === 'complete'}
            accentColor="cyan"
            showConnector={phase === 'synthesizing' || phase === 'complete'}
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
                accentColor="cyan"
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
                      <p className="text-cyan-400 text-sm mt-1 flex items-center justify-center gap-1">
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
                  accentColor="cyan"
                  hasResult={(lane) => !!lane.result?.restaurant}
                  getResultLabel={(lane) => lane.result?.restaurant ? 'Found 1' : 'No results'}
                />
              </SearchPanel>
            )}
          </TimelineStep>
        )}

        {/* Step 4: Synthesis */}
        <SynthesisStep
          isSynthesizing={phase === 'synthesizing'}
          isVisible={phase === 'synthesizing' || phase === 'complete'}
          showConnector={phase === 'complete'}
          sourcesCount={lanes.length}
          resultsCount={lanes.filter(l => l.result?.restaurant).length}
          analysisPoints={[
            { id: 'ratings', label: 'Evaluating ratings & reviews', icon: '⭐' },
            { id: 'atmosphere', label: 'Checking atmosphere match', icon: '🕯️' },
            { id: 'availability', label: 'Verifying availability tonight', icon: '📅' },
            { id: 'ranking', label: 'Ranking by your preferences', icon: '🎯' },
          ]}
          accentColor="cyan"
          onSynthesisComplete={handleSynthesisComplete}
        />

        {/* Step 5: Results */}
        {phase === 'complete' && (
          <TimelineResultStep
            ref={resultsRef}
            icon={<StarIcon className="w-3.5 h-3.5" />}
            showConnector={true}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white/80 font-medium">Results</span>
              <span className="text-white/40 text-sm">
                {DATE_NIGHT_RESULTS.filter(r => r.status === 'available').length} reservations available
              </span>
            </div>
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <h2 className="text-white/50 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                  <StarIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Top Pick
                </h2>
                <HeroResultCard onBook={() => openSignup('Sign up to book this reservation')} />
              </div>
              {alternativeResults.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">Other Options</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {alternativeResults.map(result => (
                      <AlternativeResultCard key={result.id} result={result} onBook={() => openSignup('Sign up to book this reservation')} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TimelineResultStep>
        )}

        {/* Step 6: What's Next */}
        {phase === 'complete' && (
          <TimelineFinalStep
            icon={<ArrowRightIcon className="w-3.5 h-3.5" />}
            animationDelay="200ms"
          >
            <div className="p-4">
              <WhatsNextLabel />
              <WhatsNextActions actions={whatsNextActions} />
              {/* Follow-up action */}
              <div className="flex justify-center mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => openSignup('Sign up to ask follow-up questions and refine your search')}
                  className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-2"
                >
                  <MessageCircleIcon className="w-4 h-4" />
                  <span>Ask a follow-up question</span>
                </button>
              </div>
            </div>
          </TimelineFinalStep>
        )}
      </TimelineContainer>
    </DemoLayout>
  );
}
