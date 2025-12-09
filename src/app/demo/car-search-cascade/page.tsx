'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  LoaderIcon,
  CheckIcon,
  SearchIcon,
  StarIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  ChevronDownIcon,
  AlertTriangleIcon,
  CalendarIcon,
  BookmarkIcon,
  ShareIcon,
  MessageCircleIcon,
  BellIcon,
  ExternalLinkIcon,
} from '@/components/icons';
import {
  BaseDemoLane,
  AgentThought,
  TimelineContainer,
  TimelineStep,
  TimelineResultStep,
  TimelineFinalStep,
  PlanningStep,
  SynthesisStep,
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
  | 'idle' | 'ready' | 'planning' | 'analyzing'
  | 'spawning_wave1' | 'running_wave1'
  | 'escalation_pause' | 'escalation_message'
  | 'spawning_wave2' | 'running_wave2'
  | 'synthesizing' | 'complete';

interface CarSearchFilters {
  condition: string;
  maxMileage: string;
  trim: string;
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
  { id: 'truecar', site: 'TrueCar', domain: 'truecar.com', wave: 1 },
];

const WAVE2_LANES: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'sewell-lexus', site: 'Sewell Lexus', domain: 'sewelllexus.com', wave: 2 },
  { id: 'park-place-grapevine', site: 'Park Place Lexus', domain: 'parkplacelexus.com', wave: 2 },
  { id: 'autonation-lexus', site: 'AutoNation Lexus', domain: 'autonationlexus.com', wave: 2 },
  { id: 'fb-marketplace', site: 'FB Marketplace', domain: 'facebook.com/marketplace', wave: 2 },
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
            { id: 'cpo', label: 'Certified Pre-Owned' },
            { id: 'used', label: 'Used' },
            { id: 'new', label: 'New' },
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
          {['15k', '25k', '50k', 'Any'].map(miles => (
            <FilterOption
              key={miles}
              label={miles === 'Any' ? 'Any' : `${miles} mi`}
              isSelected={filters.maxMileage === miles}
              onClick={() => onFiltersChange({ ...filters, maxMileage: miles })}
            />
          ))}
        </div>
      </div>

      <div>
        <FilterLabel>Trim level</FilterLabel>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'overtrail', label: 'Overtrail' },
            { id: 'overtrail-plus', label: 'Overtrail+' },
            { id: 'any', label: 'Any trim' },
          ].map(opt => (
            <FilterOption
              key={opt.id}
              label={opt.label}
              isSelected={filters.trim === opt.id}
              onClick={() => onFiltersChange({ ...filters, trim: opt.id })}
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
      case 'blocked': return <AlertTriangleIcon className="w-4 h-4 text-cyan-400/70" />;
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
          <span className={`text-xs ${lane.status === 'blocked' ? 'text-cyan-400/80' : lane.result?.car ? 'text-green-400/80' : 'text-white/40'}`}>
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
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 animate-fadeIn">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🧠</span>
            <span className="text-cyan-400 text-xs font-medium uppercase tracking-wider">Mino is thinking</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Carvana blocked my search. Checking Lexus dealers directly for GX Overtrail inventory near <span className="text-white font-medium">{zipcode}</span>...
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

// Gallery images for the hero car (multiple angles of the black GX)
const HERO_CAR_GALLERY = [
  '/car-research/gx-1.jpeg',  // Front 3/4
  '/car-research/gx-2.jpeg',  // Front 3/4 alt
  '/car-research/gx-3.jpeg',  // Side profile
  '/car-research/gx-4.jpeg',  // Rear 3/4
  '/car-research/gx-7.jpeg',  // Interior
  '/car-research/gx-6.jpeg',  // Wheel detail
];

function HeroResultCard({ onSchedule }: { onSchedule: () => void }) {
  const result = CAR_SEARCH_BEST_RESULT;
  const synthesis = CAR_SEARCH_SYNTHESIS;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);

  if (!result.car || !result.dealer) return null;

  const timeSlots = [
    { label: 'Today', time: '12pm – 5pm', available: true },
    { label: 'Tomorrow', time: '9am – 12pm', available: true },
    { label: 'Tomorrow', time: '12:30pm – 5pm', available: true },
  ];

  return (
    <div className="space-y-5">
      {/* Main Image + Gallery Grid */}
      <div className="space-y-2">
        {/* Hero Image */}
        <div className="relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 ring-1 ring-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
          <img
            src={HERO_CAR_GALLERY[selectedImage]}
            alt={`${result.car.year} ${result.car.make} ${result.car.model}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {/* Inner glow/shadow overlay */}
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>{result.car.color}</span><span>•</span><span>VIN: {result.car.vin?.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery Grid */}
        <div className="grid grid-cols-6 gap-1.5">
          {HERO_CAR_GALLERY.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`relative h-14 rounded-lg overflow-hidden transition-all ${
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
        {['CPO Warranty', 'Under Budget', 'Under Mileage'].map(f => (
          <span key={f} className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />{f}
          </span>
        ))}
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm flex items-center gap-1.5">
          <CheckIcon className="w-3.5 h-3.5" />Overtrail Package
        </span>
      </div>

      <div>
        <div className="text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">Why Mino Picked This</div>
        <ul className="space-y-1.5">
          {synthesis.rationale.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
              <span className="text-cyan-400 mt-0.5">•</span>{reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-xl">🏢</div>
          <div className="flex-1">
            <div className="text-white font-medium">{result.dealer.name}</div>
            <div className="flex items-center gap-3 text-white/50 text-sm mt-1">
              <span className="flex items-center gap-1"><StarIcon className="w-3.5 h-3.5 text-cyan-400" />{result.dealer.rating} ({result.dealer.reviewCount})</span>
              <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{result.dealer.distance} mi</span>
              <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{result.dealer.hours}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="py-1.5 px-3 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/15 transition-colors flex items-center gap-1.5">
              <ExternalLinkIcon className="w-3.5 h-3.5" />Website
            </button>
            <button className="py-1.5 px-3 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/15 transition-colors flex items-center gap-1.5">
              <PhoneIcon className="w-3.5 h-3.5" />Call
            </button>
          </div>
        </div>

        {/* Mino Action: Schedule Test Drive */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">M</span>
            </div>
            <span className="text-white/70 text-sm font-medium">Mino can schedule your test drive</span>
          </div>
          <div className="space-y-2">
            {timeSlots.map((slot, i) => (
              <button
                key={i}
                onClick={() => setSelectedTimeSlot(i)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                  selectedTimeSlot === i
                    ? 'bg-cyan-500/20 border border-cyan-400/50 text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-white/40" />
                  <span className="font-medium">{slot.label}</span>
                  <span className="text-white/50">{slot.time}</span>
                </div>
                {selectedTimeSlot === i && (
                  <div className="flex items-center gap-1.5 text-cyan-400 text-sm">
                    <CheckIcon className="w-4 h-4" />
                    <span>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {selectedTimeSlot !== null && (
            <button
              onClick={onSchedule}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-cyan-600/80 text-white font-medium hover:bg-cyan-500/80 transition-all flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Schedule Test Drive
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

function AlternativeResultCard({ result }: { result: CarResult }) {
  if (!result.car) return null;

  const statusLabels: Record<string, { text: string; color: string; bg: string }> = {
    over_budget: { text: 'Over budget', color: 'text-cyan-400', bg: 'bg-amber-500/10' },
    over_mileage: { text: 'Over mileage', color: 'text-cyan-400', bg: 'bg-amber-500/10' },
    no_cpo: { text: 'No CPO warranty', color: 'text-cyan-400', bg: 'bg-amber-500/10' },
    success: { text: 'Runner up', color: 'text-green-400', bg: 'bg-green-500/10' },
  };
  const statusLabel = statusLabels[result.status];

  return (
    <div className="w-56 flex-shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors">
      <div className="w-full h-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden mb-3">
        <img
          src={result.car.image}
          alt={`${result.car.year} ${result.car.make} ${result.car.model}`}
          className="w-full h-full object-cover"
        />
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
  const searchParams = useSearchParams();
  const isResultsView = searchParams.get('view') === 'results';

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
  const [filters, setFilters] = useState<CarSearchFilters>({ condition: 'cpo', maxMileage: '25k', trim: 'overtrail', zipcode: '75201' });
  const resultsRef = useRef<HTMLDivElement>(null);

  const successResults = CAR_SEARCH_RESULTS.filter(r => r.status === 'success' && r.id !== 'sewell-lexus');
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

  // Cycle through active sessions periodically during search to show parallel execution
  useEffect(() => {
    if (phase !== 'running_wave1' && phase !== 'running_wave2') return;

    const cycleInterval = setInterval(() => {
      setSelectedLaneId(prevId => {
        // Get all active (non-complete, non-blocked) lanes
        const activeLanes = lanes.filter(l =>
          l.status !== 'complete' && l.status !== 'blocked' && l.status !== 'pending'
        );
        if (activeLanes.length <= 1) return prevId;

        // Find current index among active lanes
        const currentIndex = activeLanes.findIndex(l => l.id === prevId);
        // Move to next active lane (wrap around)
        const nextIndex = (currentIndex + 1) % activeLanes.length;
        return activeLanes[nextIndex].id;
      });
    }, 3000); // Cycle every 3 seconds

    return () => clearInterval(cycleInterval);
  }, [phase, lanes]);

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

  const handlePlanningComplete = useCallback(() => {
    setPhase('analyzing');

    // Initial planning thought
    setAgentThought({
      type: 'planning',
      message: "Starting with major aggregators — GX Overtrails are rare, need to cast a wide net.",
      reasoning: 'Aggregators first, then Lexus dealers direct'
    });

    setTimeout(() => {
      setPhase('spawning_wave1');
      const wave1: DemoLane[] = WAVE1_LANES.map(l => ({ ...l, status: 'spawning' as LaneStatus, progress: 0, currentAction: 'Connecting...' }));
      setLanes(wave1);
      setSelectedLaneId(wave1[0].id);

      setAgentThought({
        type: 'executing',
        message: 'Searching 6 major car marketplaces simultaneously...',
        reasoning: 'Comparing CPO inventory, prices, and dealer ratings'
      });

      setTimeout(() => {
        setPhase('running_wave1');

        // Wave 1 thought sequence (spread over ~15 seconds)
        const wave1Thoughts: { delay: number; thought: AgentThought }[] = [
          {
            delay: 3000,
            thought: {
              type: 'analyzing',
              message: 'CarGurus showing 8 GX Overtrails in DFW. Filtering by mileage and CPO status...',
            }
          },
          {
            delay: 7000,
            thought: {
              type: 'analyzing',
              message: 'Found a CPO 2024 Overtrail at $84,900 with 12k miles — checking vehicle history...',
              reasoning: 'Verifying no accidents, CPO certification valid'
            }
          },
          {
            delay: 11000,
            thought: {
              type: 'adapting',
              message: 'Carvana blocked my automated search. Pivoting to check Lexus dealers directly.',
              reasoning: 'Dealer sites often have fresher CPO inventory'
            }
          },
          {
            delay: 14000,
            thought: {
              type: 'planning',
              message: 'Wave 1 complete. Checking Lexus dealers for better CPO options...',
              reasoning: 'Lexus CPO includes 2-year/unlimited mile warranty'
            }
          },
        ];

        wave1Thoughts.forEach(({ delay, thought }) => {
          setTimeout(() => setAgentThought(thought), delay);
        });

        // Start ALL wave1 lanes nearly simultaneously, complete at staggered times
        // Carvana (index 1) gets blocked early
        const wave1CompletionTimes = [5000, 4000, 8000, 10000, 12000, 14000]; // 6 lanes

        wave1.forEach((lane, i) => {
          const mockResult = getMockResult(lane.id);
          const isBlocked = mockResult?.status === 'blocked';
          const startDelay = 500 + (i * 300); // Start all within first 2 seconds
          const completionTime = wave1CompletionTimes[i] || 12000;
          const duration = completionTime - startDelay;

          setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 15, currentAction: 'Loading page...' }), startDelay);
          setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 30, currentAction: 'Searching inventory...' }), startDelay + duration * 0.25);

          if (isBlocked) {
            setTimeout(() => {
              updateLane(lane.id, { status: 'blocked', progress: 40, result: mockResult });
            }, completionTime);
          } else {
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 50, currentAction: 'Found matches...' }), startDelay + duration * 0.5);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 75, currentAction: 'Extracting details...' }), startDelay + duration * 0.75);
            setTimeout(() => {
              updateLane(lane.id, { status: 'complete', progress: 100, result: mockResult });
              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => (!prev?.car || mockResult.car!.price < prev.car.price) ? mockResult : prev);
              }
            }, completionTime);
          }
        });
        setTimeout(() => setPhase('escalation_pause'), 15000);
      }, 500);
    }, 800);
  }, [getMockResult, updateLane]);

  const handleStartSearch = useCallback(() => {
    setFiltersExpanded(false);
    setPhase('planning');
  }, []);

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
          message: 'Checking 4 Lexus dealers in DFW for Overtrail inventory...',
          reasoning: 'Dealer sites often have CPO units not yet listed on aggregators'
        });

        setTimeout(() => {
          setPhase('running_wave2');

          // Wave 2 thought sequence (spread over ~12 seconds)
          const wave2Thoughts: { delay: number; thought: AgentThought }[] = [
            {
              delay: 3000,
              thought: {
                type: 'analyzing',
                message: 'Sewell Lexus has a Nori Green Overtrail with 11k miles — signature color!',
              }
            },
            {
              delay: 7000,
              thought: {
                type: 'analyzing',
                message: 'This one is Lexus CPO certified. 2-year warranty with unlimited miles...',
                reasoning: 'Lexus CPO is one of the best in the industry'
              }
            },
            {
              delay: 11000,
              thought: {
                type: 'success',
                message: 'Found 6 matching Overtrails. Ranking by price, mileage, and CPO status...',
              }
            },
          ];

          wave2Thoughts.forEach(({ delay, thought }) => {
            setTimeout(() => setAgentThought(thought), delay);
          });

          // Start ALL wave2 lanes nearly simultaneously, complete at staggered times
          const wave2CompletionTimes = [5000, 8000, 10000, 12000]; // 4 lanes

          wave2.forEach((lane, i) => {
            const mockResult = getMockResult(lane.id);
            const startDelay = 500 + (i * 300); // Start all within first 1.5 seconds
            const completionTime = wave2CompletionTimes[i] || 10000;
            const duration = completionTime - startDelay;

            setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 15, currentAction: 'Loading dealer site...' }), startDelay);
            setTimeout(() => updateLane(lane.id, { status: 'navigating', progress: 30, currentAction: 'Searching inventory...' }), startDelay + duration * 0.25);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 50, currentAction: 'Found vehicles...' }), startDelay + duration * 0.5);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 75, currentAction: 'Extracting details...' }), startDelay + duration * 0.75);
            setTimeout(() => {
              updateLane(lane.id, { status: 'complete', progress: 100, result: mockResult });
              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => (!prev?.car || mockResult.car!.price < prev.car.price) ? mockResult : prev);
              }
            }, completionTime);
          });
          setTimeout(() => {
            setPhase('synthesizing');
            setAgentThought(null);
          }, 14000);
        }, 600);
      }, 2000);
    }
  }, [phase, getMockResult, updateLane]);

  // Called when synthesis animation completes
  const handleSynthesisComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  // Skip to completed state for results view
  const skipToComplete = useCallback(() => {
    const completedLanes: DemoLane[] = CAR_SEARCH_RESULTS.map((r, index) => ({
      id: r.id,
      site: r.site,
      domain: r.site.toLowerCase().replace(/\s+/g, '') + '.com',
      status: (r.status === 'blocked' ? 'blocked' : 'complete') as LaneStatus,
      progress: 100,
      wave: (index < 3 ? 1 : 2) as 1 | 2,
      currentAction: r.status === 'blocked' ? 'Blocked' : 'Done',
      result: r,
    }));
    setLanes(completedLanes);
    setBestSoFar(CAR_SEARCH_RESULTS.find(r => r.id === 'sewell-lexus') || null);
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

  const totalComplete = lanes.filter(l => l.status === 'complete' || l.status === 'blocked').length;
  const isSearching = phase === 'analyzing' || phase === 'spawning_wave1' || phase === 'running_wave1' || phase === 'escalation_pause' || phase === 'escalation_message' || phase === 'spawning_wave2' || phase === 'running_wave2';
  const selectedLane = lanes.find(l => l.id === selectedLaneId);

  const whatsNextActions = [
    { icon: <BellIcon className="w-4 h-4" />, label: 'Monitor Inventory', subtitle: 'Watches for cars that meet your criteria', onClick: () => setShowSignUp(true) },
    { icon: <BookmarkIcon className="w-4 h-4" />, label: 'Save', subtitle: 'Keep for later', onClick: () => setShowSignUp(true) },
    { icon: <ShareIcon className="w-4 h-4" />, label: 'Share', subtitle: 'Send link to anyone', onClick: () => setShowSignUp(true) },
  ];

  return (
    <DemoLayout
      onRestart={startDemo}
      onSignUp={() => setShowSignUp(true)}
      query={CAR_SEARCH_QUERY}
      overlay={<SignUpOverlay isOpen={showSignUp} onClose={() => setShowSignUp(false)} subtitle="Save your searches, get alerts, and more" />}
    >
      <TimelineContainer>
        {/* Step 1: Query + Filters */}
        <TimelineStep icon={<SearchIcon className="w-3.5 h-3.5" />} isActive={phase === 'ready' || phase === 'idle'} isComplete={phase !== 'ready' && phase !== 'idle'} accentColor="cyan" showConnector={phase === 'planning' || isSearching || phase === 'complete'}>
          <div className="p-4 border-b border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Searching</div>
            <div className="text-white text-lg">"{CAR_SEARCH_QUERY}"</div>
          </div>
          <SearchFiltersWrapper
            isExpanded={filtersExpanded}
            onToggle={() => setFiltersExpanded(!filtersExpanded)}
            showFilters={showFilters}
            isThinking={isThinking}
            isSearching={isSearching || phase === 'planning'}
            onStartSearch={handleStartSearch}
            summaryChips={[filters.condition === 'cpo' ? 'CPO' : filters.condition, `< ${filters.maxMileage} mi`, filters.trim === 'overtrail' ? 'Overtrail' : filters.trim]}
          >
            <CarSearchFilters filters={filters} onFiltersChange={setFilters} />
          </SearchFiltersWrapper>
        </TimelineStep>

        {/* Step 2: Planning */}
        <PlanningStep
          isPlanning={phase === 'planning'}
          isVisible={phase === 'planning' || isSearching || phase === 'complete'}
          showConnector={isSearching || phase === 'complete'}
          sites={WAVE1_LANES}
          accentColor="cyan"
          onPlanningComplete={handlePlanningComplete}
        />

        {/* Step 3: Sources + Browser */}
        {(isSearching || phase === 'synthesizing' || phase === 'complete') && (
          <TimelineStep icon={<SearchIcon className="w-3.5 h-3.5" />} isActive={isSearching} isComplete={phase === 'synthesizing' || phase === 'complete'} accentColor="cyan" showConnector={phase === 'synthesizing' || phase === 'complete'}>
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
                  siteIcon: selectedLane.wave === 2 ? '🏢' : '🚙',
                  siteName: selectedLane.site,
                  siteSubtitle: 'GX Overtrail search',
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

        {/* Step 4: Synthesis */}
        <SynthesisStep
          isSynthesizing={phase === 'synthesizing'}
          isVisible={phase === 'synthesizing' || phase === 'complete'}
          showConnector={phase === 'complete'}
          sourcesCount={lanes.length}
          resultsCount={lanes.filter(l => l.result?.car).length}
          analysisPoints={[
            { id: 'price', label: 'Comparing CPO prices across dealers', icon: '💰' },
            { id: 'mileage', label: 'Evaluating mileage & warranty coverage', icon: '🛡️' },
            { id: 'history', label: 'Verifying vehicle history & CPO status', icon: '📋' },
            { id: 'ranking', label: 'Ranking by value & dealer reputation', icon: '🎯' },
          ]}
          accentColor="cyan"
          onSynthesisComplete={handleSynthesisComplete}
        />

        {/* Step 5: Results */}
        {phase === 'complete' && (
          <TimelineResultStep ref={resultsRef} icon={<StarIcon className="w-3.5 h-3.5" />} showConnector={true}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white/80 font-medium">Results</span>
              <span className="text-white/40 text-sm">{CAR_SEARCH_RESULTS.filter(r => r.status === 'success').length} matches found</span>
            </div>
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <h2 className="text-white/50 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                  <StarIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Top Pick
                </h2>
                <HeroResultCard onSchedule={() => setShowSignUp(true)} />
              </div>
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

        {/* Step 6: What's Next */}
        {phase === 'complete' && (
          <TimelineFinalStep icon={<ArrowRightIcon className="w-3.5 h-3.5" />} animationDelay="200ms">
            <div className="p-4">
              <WhatsNextLabel />
              <WhatsNextActions actions={whatsNextActions} />
              {/* Follow-up action */}
              <div className="flex justify-center mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowSignUp(true)}
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
