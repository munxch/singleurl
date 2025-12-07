'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LoaderIcon,
  CheckIcon,
  SparklesIcon,
  SearchIcon,
  StarIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  ChevronDownIcon,
  AlertTriangleIcon,
} from '@/components/icons';
import {
  BaseDemoLane,
  AgentThought,
  TimelineContainer,
  TimelineStep,
  TimelineResultStep,
  TimelineFinalStep,
  SearchPanel,
  SearchFiltersWrapper,
  FilterLabel,
  FilterOption,
  DemoLayout,
  WhatsNextActions,
  WhatsNextLabel,
  SignUpOverlay,
} from '@/components/demo';
import {
  CAR_SEARCH_QUERY,
  CAR_SEARCH_RESULTS,
  CAR_SEARCH_BEST_RESULT,
  CAR_SEARCH_SYNTHESIS,
  formatPrice,
  formatMileage,
  type CarResult,
} from '@/lib/mock-data';

// =============================================================================
// TYPES
// =============================================================================

type LaneStatus = 'pending' | 'spawning' | 'navigating' | 'extracting' | 'complete' | 'blocked' | 'error';

interface DemoLane extends BaseDemoLane {
  wave: 1 | 2;
  result?: CarResult;
}

type DemoPhase =
  | 'idle' | 'ready' | 'analyzing'
  | 'spawning_wave1' | 'running_wave1'
  | 'escalation_pause' | 'escalation_message'
  | 'spawning_wave2' | 'running_wave2'
  | 'synthesizing' | 'complete';

interface CarSearchFilters {
  condition: string;
  maxMileage: string;
  color: string;
  zipcode: string;
}

// =============================================================================
// INITIAL DATA
// =============================================================================

const WAVE1_LANES: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'cargurus', site: 'CarGurus', domain: 'cargurus.com', wave: 1 },
  { id: 'carvana', site: 'Carvana', domain: 'carvana.com', wave: 1 },
  { id: 'autotrader', site: 'AutoTrader', domain: 'autotrader.com', wave: 1 },
  { id: 'cars-com', site: 'Cars.com', domain: 'cars.com', wave: 1 },
  { id: 'carmax', site: 'CarMax', domain: 'carmax.com', wave: 1 },
  { id: 'fb-marketplace', site: 'FB Marketplace', domain: 'facebook.com/marketplace', wave: 1 },
];

const WAVE2_LANES: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'honda-dallas', site: 'Honda of Dallas', domain: 'hondaofdallas.com', wave: 2 },
  { id: 'autonation', site: 'AutoNation Honda', domain: 'autonationhonda.com', wave: 2 },
  { id: 'park-place', site: 'Park Place Honda', domain: 'parkplacehonda.com', wave: 2 },
  { id: 'craigslist-dallas', site: 'Craigslist Dallas', domain: 'dallas.craigslist.org', wave: 2 },
];

// =============================================================================
// CAR SEARCH FILTERS
// =============================================================================

function CarSearchFilters({
  filters,
  onFiltersChange,
}: {
  filters: CarSearchFilters;
  onFiltersChange: (filters: CarSearchFilters) => void;
}) {
  return (
    <>
      <div>
        <FilterLabel>Condition</FilterLabel>
        <div className="flex gap-2">
          {[
            { id: 'new', label: 'New' },
            { id: 'used', label: 'Used' },
            { id: 'cpo', label: 'Certified Pre-Owned' },
          ].map(opt => (
            <FilterOption
              key={opt.id}
              label={opt.label}
              isSelected={filters.condition === opt.id}
              onClick={() => onFiltersChange({ ...filters, condition: opt.id })}
            />
          ))}
        </div>
      </div>

      <div>
        <FilterLabel>Max mileage</FilterLabel>
        <div className="flex gap-2 flex-wrap">
          {['30k', '50k', '75k', '100k+'].map(miles => (
            <FilterOption
              key={miles}
              label={`${miles} mi`}
              isSelected={filters.maxMileage === miles}
              onClick={() => onFiltersChange({ ...filters, maxMileage: miles })}
            />
          ))}
        </div>
      </div>

      <div>
        <FilterLabel>Color preference</FilterLabel>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'any', label: 'Any color' },
            { id: 'white', label: 'White' },
            { id: 'black', label: 'Black' },
            { id: 'silver', label: 'Silver' },
          ].map(opt => (
            <FilterOption
              key={opt.id}
              label={opt.label}
              isSelected={filters.color === opt.id}
              onClick={() => onFiltersChange({ ...filters, color: opt.id })}
            />
          ))}
        </div>
      </div>

      <div>
        <FilterLabel>Your location</FilterLabel>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-[160px]">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={filters.zipcode}
              onChange={(e) => onFiltersChange({ ...filters, zipcode: e.target.value })}
              placeholder="Zipcode"
              maxLength={5}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <span className="text-white/40 text-sm">Dallas, TX area</span>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// SOURCE ROW (Car-specific with blocked state)
// =============================================================================

function CarSourceRow({ lane, isSelected, onClick }: { lane: DemoLane; isSelected: boolean; onClick: () => void }) {
  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete': return <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><CheckIcon className="w-3 h-3 text-white/60" /></div>;
      case 'blocked': return <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />;
      case 'pending': return <div className="w-3 h-3 rounded-full border-2 border-white/20" />;
      default: return <LoaderIcon className="w-4 h-4 animate-spin text-cyan-400/70" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all overflow-hidden ${isSelected ? 'ring-1 ring-cyan-400/50' : 'hover:bg-white/[0.03]'}`}
    >
      <div className="absolute inset-0 bg-white/[0.04] transition-all duration-500" style={{ width: `${lane.progress}%` }} />
      <div className="relative flex items-center gap-3 w-full">
        {getStatusIcon()}
        <span className="flex-1 text-sm text-white/80 truncate">{lane.site}</span>
        {(lane.status === 'complete' || lane.status === 'blocked') && (
          <span className={`text-xs ${lane.status === 'blocked' ? 'text-amber-400/80' : lane.result?.car ? 'text-green-400/80' : 'text-white/40'}`}>
            {lane.status === 'blocked' ? 'Blocked' : lane.result?.car ? 'Found 1' : 'No match'}
          </span>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// SOURCES LIST (Car-specific with escalation)
// =============================================================================

function CarSourcesList({ lanes, selectedLaneId, onSelectLane, showEscalation, zipcode }: {
  lanes: DemoLane[];
  selectedLaneId: string | null;
  onSelectLane: (id: string) => void;
  showEscalation: boolean;
  zipcode: string;
}) {
  const wave1 = lanes.filter(l => l.wave === 1);
  const wave2 = lanes.filter(l => l.wave === 2);

  return (
    <div className="space-y-4">
      {wave1.length > 0 && (
        <div>
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">{wave2.length > 0 ? 'Initial Search' : 'Sources'}</div>
          <div className="space-y-1">
            {wave1.map(lane => (
              <CarSourceRow key={lane.id} lane={lane} isSelected={selectedLaneId === lane.id} onClick={() => onSelectLane(lane.id)} />
            ))}
          </div>
        </div>
      )}

      {showEscalation && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 animate-fadeIn">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🧠</span>
            <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Mino is thinking</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Carvana blocked my search. Finding Honda dealers with Civics for sale near <span className="text-white font-medium">{zipcode}</span>...
          </p>
        </div>
      )}

      {wave2.length > 0 && (
        <div className="animate-fadeIn">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🏢</span><span>Direct from Dealers</span>
          </div>
          <div className="space-y-1">
            {wave2.map(lane => (
              <CarSourceRow key={lane.id} lane={lane} isSelected={selectedLaneId === lane.id} onClick={() => onSelectLane(lane.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HERO RESULT CARD
// =============================================================================

function HeroResultCard() {
  const result = CAR_SEARCH_BEST_RESULT;
  const synthesis = CAR_SEARCH_SYNTHESIS;
  if (!result.car || !result.dealer) return null;

  return (
    <div className="space-y-5">
      <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
        <div className="text-6xl">🚗</div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>{result.car.color}</span><span>•</span><span>VIN: {result.car.vin?.slice(-6)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{result.car.year} {result.car.make} {result.car.model} {result.car.trim}</h1>
          <div className="text-white/60 mt-1">at {result.dealer.name}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{formatPrice(result.car.price)}</div>
          <div className="text-white/50 text-sm">{formatMileage(result.car.mileage)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Apple CarPlay', 'Under Budget', 'Under Mileage'].map(f => (
          <span key={f} className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />{f}
          </span>
        ))}
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm flex items-center gap-1.5">
          <CheckIcon className="w-3.5 h-3.5" />Clean Title
        </span>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">Why Mino Picked This</div>
        <ul className="space-y-2">
          {synthesis.rationale.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-white/80">
              <span className="text-green-400 mt-0.5">•</span>{reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">🏢</div>
          <div className="flex-1">
            <div className="text-white font-medium">{result.dealer.name}</div>
            <div className="flex items-center gap-3 text-white/50 text-sm mt-1">
              <span className="flex items-center gap-1"><StarIcon className="w-3.5 h-3.5 text-amber-400" />{result.dealer.rating} ({result.dealer.reviewCount})</span>
              <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{result.dealer.distance} mi</span>
              <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{result.dealer.hours}</span>
            </div>
          </div>
          <button className="py-2.5 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
            <PhoneIcon className="w-4 h-4" />Call
          </button>
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Schedule Test Drive</div>
          <div className="flex gap-2 flex-wrap">
            {['Today 2pm', 'Today 4pm', 'Tomorrow 10am', 'Tomorrow 2pm', 'Sat 11am'].map((time, i) => (
              <button key={i} className={`px-3 py-2 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`}>
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ALTERNATIVE RESULT CARD
// =============================================================================

function AlternativeResultCard({ result }: { result: CarResult }) {
  if (!result.car) return null;

  const statusLabels: Record<string, { text: string; color: string; bg: string }> = {
    over_budget: { text: 'Over budget', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    over_mileage: { text: 'Over mileage', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    no_carplay: { text: 'No CarPlay', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    success: { text: 'Runner up', color: 'text-green-400', bg: 'bg-green-500/10' },
  };
  const statusLabel = statusLabels[result.status];

  return (
    <div className="w-56 flex-shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors">
      <div className="w-full h-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-3">
        <span className="text-4xl">🚗</span>
      </div>
      <div className="space-y-1">
        <div className="text-white font-medium text-sm truncate">{result.car.year} {result.car.model} {result.car.trim}</div>
        <div className="text-white/50 text-xs">{formatMileage(result.car.mileage)} • {result.site}</div>
        {statusLabel && <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${statusLabel.color} ${statusLabel.bg}`}>{statusLabel.text}</span>}
        <div className="flex items-center justify-between pt-1">
          <div className="text-white font-semibold">{formatPrice(result.car.price)}</div>
          {result.dealer && <div className="flex items-center gap-1 text-white/40 text-xs"><MapPinIcon className="w-3 h-3" />{result.dealer.distance} mi</div>}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function CarSearchCascadePage() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [bestSoFar, setBestSoFar] = useState<CarResult | null>(null);
  const [showEscalation, setShowEscalation] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [agentThought, setAgentThought] = useState<AgentThought | null>(null);
  const [filters, setFilters] = useState<CarSearchFilters>({ condition: 'used', maxMileage: '50k', color: 'any', zipcode: '75201' });
  const resultsRef = useRef<HTMLDivElement>(null);

  const successResults = CAR_SEARCH_RESULTS.filter(r => r.status === 'success' && r.id !== 'honda-dallas');
  const otherResults = CAR_SEARCH_RESULTS.filter(r => r.status !== 'success' && r.status !== 'blocked' && r.car);

  const getMockResult = useCallback((laneId: string) => CAR_SEARCH_RESULTS.find(r => r.id === laneId), []);
  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => {
    setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  useEffect(() => {
    if (selectedLaneId) return;
    const activeLane = lanes.find(l => !['pending', 'complete', 'blocked'].includes(l.status));
    if (activeLane) setSelectedLaneId(activeLane.id);
  }, [lanes, selectedLaneId]);

  const startDemo = useCallback(() => {
    setPhase('ready');
    setLanes([]);
    setBestSoFar(null);
    setShowEscalation(false);
    setSelectedLaneId(null);
    setFiltersExpanded(true);
    setSourcesExpanded(true);
    setShowFilters(false);
    setIsThinking(true);
    setAgentThought(null);
    setTimeout(() => { setIsThinking(false); setShowFilters(true); }, 1500);
  }, []);

  const handleStartSearch = useCallback(() => {
    setFiltersExpanded(false);
    setPhase('analyzing');

    // Initial planning thought
    setAgentThought({
      type: 'planning',
      message: "Starting with CarGurus and Carvana — they have the largest used inventory in Texas.",
      reasoning: 'Aggregators first, then direct dealers if needed'
    });

    setTimeout(() => {
      setPhase('spawning_wave1');
      const wave1: DemoLane[] = WAVE1_LANES.map(l => ({ ...l, status: 'spawning' as LaneStatus, progress: 0, currentAction: 'Connecting...' }));
      setLanes(wave1);
      setSelectedLaneId(wave1[0].id);

      setAgentThought({
        type: 'executing',
        message: 'Searching 6 major car marketplaces simultaneously...',
        reasoning: 'Comparing prices, mileage, and dealer ratings in real-time'
      });

      setTimeout(() => {
        setPhase('running_wave1');

        // Wave 1 thought sequence (slower pacing for readability)
        const wave1Thoughts: { delay: number; thought: AgentThought }[] = [
          {
            delay: 2000,
            thought: {
              type: 'analyzing',
              message: 'CarGurus showing 12 Civics in your area. Filtering by mileage and CarPlay...',
            }
          },
          {
            delay: 5000,
            thought: {
              type: 'analyzing',
              message: 'Found a 2022 EX-L at $23,900 with 28k miles — checking Carfax history...',
              reasoning: 'Verifying no accidents, single owner preferred'
            }
          },
          {
            delay: 8000,
            thought: {
              type: 'adapting',
              message: 'Carvana blocked my automated search. Pivoting to check dealer sites directly.',
              reasoning: 'Some sites require manual browsing — working around it'
            }
          },
          {
            delay: 11000,
            thought: {
              type: 'analyzing',
              message: 'AutoTrader has 3 options under $25k. One CPO with warranty included...',
            }
          },
          {
            delay: 14000,
            thought: {
              type: 'planning',
              message: 'Wave 1 complete. Checking local Honda dealers for better CPO options...',
              reasoning: 'Direct dealer inventory often has better financing'
            }
          },
        ];

        wave1Thoughts.forEach(({ delay, thought }) => {
          setTimeout(() => setAgentThought(thought), delay);
        });

        wave1.forEach((lane, i) => {
          const mockResult = getMockResult(lane.id);
          const isBlocked = mockResult?.status === 'blocked';
          const baseDelay = 200 + (i * 600);

          setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 25, currentAction: 'Searching...' }), baseDelay);

          if (isBlocked) {
            setTimeout(() => updateLane(lane.id, { status: 'blocked', progress: 40, result: mockResult }), baseDelay + 2500);
          } else {
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 60, currentAction: 'Extracting...' }), baseDelay + 1800);
            setTimeout(() => {
              updateLane(lane.id, { status: 'complete', progress: 100, result: mockResult });
              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => (!prev?.car || mockResult.car!.price < prev.car.price) ? mockResult : prev);
              }
            }, baseDelay + 3200);
          }
        });
        setTimeout(() => setPhase('escalation_pause'), 6000);
      }, 500);
    }, 1200);
  }, [getMockResult, updateLane]);

  useEffect(() => {
    if (phase === 'escalation_pause') {
      setTimeout(() => { setPhase('escalation_message'); setShowEscalation(true); }, 1000);
    }
    if (phase === 'escalation_message') {
      setTimeout(() => {
        setPhase('spawning_wave2');
        const wave2: DemoLane[] = WAVE2_LANES.map(l => ({ ...l, status: 'spawning' as LaneStatus, progress: 0, currentAction: 'Connecting...' }));
        setLanes(prev => [...prev, ...wave2]);
        setSelectedLaneId(wave2[0].id);

        setAgentThought({
          type: 'executing',
          message: 'Checking 4 local Honda dealers for fresh inventory...',
          reasoning: 'Dealer sites often have cars not yet on aggregators'
        });

        setTimeout(() => {
          setPhase('running_wave2');

          // Wave 2 thought sequence (slower pacing for readability)
          const wave2Thoughts: { delay: number; thought: AgentThought }[] = [
            {
              delay: 2000,
              thought: {
                type: 'analyzing',
                message: 'Honda of Dallas has a 2023 Sport with 15k miles — best mileage so far!',
              }
            },
            {
              delay: 5500,
              thought: {
                type: 'analyzing',
                message: 'Park Place has CPO warranty included. Calculating total cost of ownership...',
                reasoning: 'CPO adds ~$2k value in warranty coverage'
              }
            },
            {
              delay: 9000,
              thought: {
                type: 'success',
                message: 'Found 8 matching vehicles. Ranking by price, mileage, and dealer reputation...',
              }
            },
          ];

          wave2Thoughts.forEach(({ delay, thought }) => {
            setTimeout(() => setAgentThought(thought), delay);
          });

          wave2.forEach((lane, i) => {
            const mockResult = getMockResult(lane.id);
            const baseDelay = 400 + (i * 500);
            setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 30, currentAction: 'Searching...' }), baseDelay);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 65, currentAction: 'Extracting...' }), baseDelay + 1200);
            setTimeout(() => {
              updateLane(lane.id, { status: 'complete', progress: 100, result: mockResult });
              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => (!prev?.car || mockResult.car!.price < prev.car.price) ? mockResult : prev);
              }
            }, baseDelay + 2400);
          });
          setTimeout(() => {
            setPhase('synthesizing');
            setAgentThought({
              type: 'analyzing',
              message: 'Comparing 8 vehicles across price, condition, and dealer ratings...',
            });
            setTimeout(() => {
              setPhase('complete');
              setAgentThought(null);
            }, 1200);
          }, 4500);
        }, 600);
      }, 2000);
    }
  }, [phase, getMockResult, updateLane]);

  useEffect(() => { const timer = setTimeout(startDemo, 500); return () => clearTimeout(timer); }, [startDemo]);
  useEffect(() => { if (phase === 'complete' && resultsRef.current) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300); }, [phase]);

  const totalComplete = lanes.filter(l => l.status === 'complete' || l.status === 'blocked').length;
  const isSearching = phase !== 'idle' && phase !== 'complete' && phase !== 'ready';
  const selectedLane = lanes.find(l => l.id === selectedLaneId);

  const whatsNextActions = [
    { icon: '🔄', label: 'New Search', onClick: startDemo },
    { icon: '🔔', label: 'Price Alert', onClick: () => setShowSignUp(true) },
    { icon: '💾', label: 'Save Results', onClick: () => setShowSignUp(true) },
    { icon: '↗', label: 'Share', onClick: () => setShowSignUp(true) },
  ];

  return (
    <DemoLayout
      onRestart={startDemo}
      overlay={<SignUpOverlay isOpen={showSignUp} onClose={() => setShowSignUp(false)} accentColor="cyan" subtitle="Save your searches, get alerts, and more" />}
    >
      <TimelineContainer showLine={isSearching || phase === 'complete'}>
        {/* Step 1: Query + Filters */}
        <TimelineStep icon={<SparklesIcon className="w-3.5 h-3.5" />} isActive={phase === 'ready' || phase === 'idle'} isComplete={phase !== 'ready' && phase !== 'idle'} accentColor="cyan">
          <div className="p-4 border-b border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Searching</div>
            <div className="text-white text-lg">"{CAR_SEARCH_QUERY}"</div>
          </div>
          <SearchFiltersWrapper
            isExpanded={filtersExpanded}
            onToggle={() => setFiltersExpanded(!filtersExpanded)}
            showFilters={showFilters}
            isThinking={isThinking}
            isSearching={isSearching}
            onStartSearch={handleStartSearch}
            summaryChips={[filters.condition, `${filters.maxMileage} mi`, filters.zipcode]}
          >
            <CarSearchFilters filters={filters} onFiltersChange={setFilters} />
          </SearchFiltersWrapper>
        </TimelineStep>

        {/* Step 2: Sources + Browser */}
        {(isSearching || phase === 'complete') && (
          <TimelineStep icon={<SearchIcon className="w-3.5 h-3.5" />} isActive={isSearching} isComplete={phase === 'complete'} accentColor="cyan">
            <button
              onClick={() => phase === 'complete' && setSourcesExpanded(!sourcesExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 ${sourcesExpanded ? 'border-b border-white/10' : ''} ${phase === 'complete' ? 'hover:bg-white/[0.02] cursor-pointer' : ''} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span className="text-white/80 font-medium">{phase === 'complete' ? 'Search Complete' : 'Searching Sources'}</span>
                {!sourcesExpanded && phase === 'complete' && (
                  <span className="text-white/40 text-sm">• {lanes.length} sources checked • {lanes.filter(l => l.result?.car).length} matches found</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">{totalComplete} of {lanes.length}</span>
                {phase === 'complete' && <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} />}
              </div>
            </button>

            {sourcesExpanded && (
              <SearchPanel
                accentColor="cyan"
                sourcesWidth="w-72"
                agentThought={agentThought}
                totalSessions={lanes.length}
                isSearching={isSearching}
                browser={selectedLane ? {
                  domain: selectedLane.domain,
                  status: selectedLane.status,
                  currentAction: selectedLane.currentAction,
                  siteIcon: selectedLane.wave === 2 ? '🏢' : '🚗',
                  siteName: selectedLane.site,
                  siteSubtitle: 'Inventory search',
                  completeOverlay: selectedLane.result?.car ? (
                    <div className="text-center">
                      <p className="text-white font-bold text-xl">{formatPrice(selectedLane.result.car.price)}</p>
                      <p className="text-white/50 text-sm mt-1">{selectedLane.result.car.year} {selectedLane.result.car.model}</p>
                    </div>
                  ) : <p className="text-white/40 text-sm">{selectedLane.result?.statusMessage || 'No results'}</p>
                } : null}
              >
                <CarSourcesList lanes={lanes} selectedLaneId={selectedLaneId} onSelectLane={setSelectedLaneId} showEscalation={showEscalation} zipcode={filters.zipcode} />
              </SearchPanel>
            )}
          </TimelineStep>
        )}

        {/* Step 3: Results */}
        {phase === 'complete' && (
          <TimelineResultStep ref={resultsRef} icon={<StarIcon className="w-3.5 h-3.5" />}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white/80 font-medium">Results</span>
              <span className="text-white/40 text-sm">{CAR_SEARCH_RESULTS.filter(r => r.status === 'success').length} matches found</span>
            </div>
            <div className="p-4 space-y-6">
              <HeroResultCard />
              {(successResults.length > 0 || otherResults.length > 0) && (
                <div className="space-y-3">
                  <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">More Options</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {[...successResults, ...otherResults].map(result => <AlternativeResultCard key={result.id} result={result} />)}
                  </div>
                </div>
              )}
            </div>
          </TimelineResultStep>
        )}

        {/* Step 4: What's Next */}
        {phase === 'complete' && (
          <TimelineFinalStep icon={<ArrowRightIcon className="w-3.5 h-3.5" />} animationDelay="200ms">
            <div className="p-4"><WhatsNextLabel /><WhatsNextActions actions={whatsNextActions} /></div>
          </TimelineFinalStep>
        )}
      </TimelineContainer>
    </DemoLayout>
  );
}
