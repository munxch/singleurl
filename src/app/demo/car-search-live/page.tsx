'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import {
  LoaderIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  GlobeIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
} from '@/components/icons';
import {
  CAR_SEARCH_QUERY,
  CAR_SEARCH_RESULTS,
  CAR_SEARCH_SYNTHESIS,
  formatPrice,
  formatMileage,
  type CarResult,
} from '@/lib/mock-data';

// =============================================================================
// TYPES
// =============================================================================

type LaneStatus = 'pending' | 'spawning' | 'navigating' | 'extracting' | 'complete' | 'blocked' | 'error';

interface DemoLane {
  id: string;
  site: string;
  shortName: string;
  status: LaneStatus;
  progress: number;
  wave: 1 | 2;
  result?: CarResult;
  currentAction?: string;
}

type DemoPhase =
  | 'idle'
  | 'analyzing'
  | 'spawning_wave1'
  | 'running_wave1'
  | 'escalation_pause'
  | 'escalation_message'
  | 'spawning_wave2'
  | 'running_wave2'
  | 'synthesizing'
  | 'complete';

// =============================================================================
// INITIAL DATA
// =============================================================================

const WAVE1_LANES: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'cargurus', site: 'CarGurus', shortName: 'CG', wave: 1 },
  { id: 'carvana', site: 'Carvana', shortName: 'CV', wave: 1 },
  { id: 'autotrader', site: 'AutoTrader', shortName: 'AT', wave: 1 },
  { id: 'cars-com', site: 'Cars.com', shortName: 'Cars', wave: 1 },
  { id: 'carmax', site: 'CarMax', shortName: 'CM', wave: 1 },
  { id: 'fb-marketplace', site: 'FB Marketplace', shortName: 'FB', wave: 1 },
];

const WAVE2_LANES: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'honda-dallas', site: 'Honda of Dallas', shortName: 'HD', wave: 2 },
  { id: 'autonation', site: 'AutoNation', shortName: 'AN', wave: 2 },
  { id: 'park-place', site: 'Park Place', shortName: 'PP', wave: 2 },
  { id: 'craigslist-dallas', site: 'Craigslist', shortName: 'CL', wave: 2 },
];

// =============================================================================
// BROWSER THUMBNAIL COMPONENT
// =============================================================================

function BrowserThumbnail({ lane, isNew = false }: { lane: DemoLane; isNew?: boolean }) {
  const getStatusColor = () => {
    switch (lane.status) {
      case 'complete': return 'border-green-500/50 bg-green-500/5';
      case 'blocked':
      case 'error': return 'border-amber-500/50 bg-amber-500/5';
      case 'pending': return 'border-white/10 bg-white/[0.02]';
      default: return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'blocked':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertTriangleIcon className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className="w-4 h-4 animate-spin text-blue-400" />;
    }
  };

  const isActive = lane.status !== 'pending' && lane.status !== 'complete' && lane.status !== 'blocked' && lane.status !== 'error';

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden transition-all duration-500
        ${getStatusColor()}
        ${isNew ? 'animate-scaleIn' : ''}
        border
      `}
    >
      {/* Browser chrome header */}
      <div className="flex items-center gap-2 px-2 py-1.5 bg-black/20 border-b border-white/10">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <GlobeIcon className="w-2.5 h-2.5 text-white/40" />
          <span className="text-white/40 text-[10px] truncate">{lane.site.toLowerCase().replace(/\s/g, '')}.com</span>
        </div>
        {getStatusIcon()}
      </div>

      {/* Browser viewport - simplified skeleton */}
      <div className="aspect-[4/3] bg-gradient-to-b from-slate-900/50 to-slate-950/50 relative p-2">
        {/* Site logo / content placeholder */}
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <span className="text-2xl">{lane.wave === 2 ? '🏢' : '🚗'}</span>
          <span className="text-white/60 text-xs font-medium">{lane.shortName}</span>
        </div>

        {/* Active overlay with action */}
        {isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center px-2">
              <LoaderIcon className="w-4 h-4 text-blue-400 animate-spin mx-auto mb-1" />
              <p className="text-white/70 text-[10px] leading-tight">{lane.currentAction}</p>
            </div>
          </div>
        )}

        {/* Blocked overlay */}
        {lane.status === 'blocked' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center px-2">
              <AlertTriangleIcon className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-amber-400/80 text-[10px]">Blocked</p>
            </div>
          </div>
        )}

        {/* Complete overlay with price */}
        {lane.status === 'complete' && lane.result?.car && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <CheckCircleIcon className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-white font-medium text-sm">{formatPrice(lane.result.car.price)}</p>
              <p className="text-white/50 text-[10px]">{formatMileage(lane.result.car.mileage)}</p>
            </div>
          </div>
        )}

        {/* No results */}
        {lane.status === 'complete' && !lane.result?.car && lane.result && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <p className="text-white/40 text-[10px] text-center px-2">{lane.result.statusMessage || 'No results'}</p>
          </div>
        )}
      </div>

      {/* Progress bar at bottom */}
      <div className="h-0.5 bg-white/10">
        <div
          className={`h-full transition-all duration-300 ${
            lane.status === 'complete' ? 'bg-green-500' :
            lane.status === 'blocked' || lane.status === 'error' ? 'bg-amber-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${lane.progress}%` }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// BEST SO FAR CARD
// =============================================================================

function BestSoFarCard({ result, isNew = false }: { result: CarResult | null; isNew?: boolean }) {
  if (!result?.car) return null;

  return (
    <div className={`
      p-4 rounded-xl bg-green-500/10 border border-green-500/30
      flex items-center gap-4
      ${isNew ? 'animate-pulse-once' : ''}
    `}>
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">🏆</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white/50 text-xs">Best so far</div>
        <div className="text-green-400 font-semibold text-lg">
          {formatPrice(result.car.price)} at {result.site}
        </div>
        <div className="text-white/50 text-sm">
          {result.car.year} {result.car.model} • {formatMileage(result.car.mileage)}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ESCALATION MESSAGE
// =============================================================================

function EscalationMessage({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="animate-slideUp p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🔍</span>
        </div>
        <div>
          <div className="text-white font-medium">Carvana blocked us.</div>
          <div className="text-blue-300 mt-1">
            Going deeper — finding Honda dealerships near 75201...
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TEXT ME WHEN READY (UI Only)
// =============================================================================

function TextMeWhenReady({ visible }: { visible: boolean }) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <div className="animate-fadeIn p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
      <div className="text-white/60 text-sm">
        This is taking a moment... want us to text you when it's ready?
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 text-sm text-white/60 hover:text-white/80 transition-colors"
        >
          Keep watching
        </button>
        <button
          className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Text me
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function CarSearchLivePage() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [bestSoFar, setBestSoFar] = useState<CarResult | null>(null);
  const [showTextMe, setShowTextMe] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [isNewWave, setIsNewWave] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  // Get the mock result for a lane
  const getMockResult = useCallback((laneId: string): CarResult | undefined => {
    return CAR_SEARCH_RESULTS.find(r => r.id === laneId);
  }, []);

  // Update a specific lane
  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => {
    setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  // Start the demo
  const startDemo = useCallback(() => {
    setPhase('analyzing');
    setLanes([]);
    setBestSoFar(null);
    setShowTextMe(false);
    setShowEscalation(false);

    // After 1s, start spawning wave 1
    setTimeout(() => {
      setPhase('spawning_wave1');

      // Spawn all 6 lanes at once
      const wave1: DemoLane[] = WAVE1_LANES.map(l => ({
        ...l,
        status: 'spawning' as LaneStatus,
        progress: 0,
        currentAction: 'Starting browser...',
      }));
      setLanes(wave1);

      // After 500ms, transition to running
      setTimeout(() => {
        setPhase('running_wave1');

        // Simulate each lane progressing
        wave1.forEach((lane, i) => {
          const mockResult = getMockResult(lane.id);
          const isBlocked = mockResult?.status === 'blocked';

          // Stagger the progress updates
          const baseDelay = 300 + (i * 200);

          // Navigate phase
          setTimeout(() => {
            updateLane(lane.id, {
              status: 'navigating',
              progress: 25,
              currentAction: 'Navigating to search...'
            });
          }, baseDelay);

          if (isBlocked) {
            // Carvana gets blocked
            setTimeout(() => {
              updateLane(lane.id, {
                status: 'blocked',
                progress: 40,
                result: mockResult,
              });
            }, baseDelay + 1500);
          } else {
            // Normal progress
            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 60,
                currentAction: 'Searching inventory...'
              });
            }, baseDelay + 1200);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 80,
                currentAction: 'Extracting results...'
              });
            }, baseDelay + 2000);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'complete',
                progress: 100,
                result: mockResult,
              });

              // Update best so far if this is a success with a good price
              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => {
                  if (!prev?.car || mockResult.car!.price < prev.car.price) {
                    setIsNewBest(true);
                    setTimeout(() => setIsNewBest(false), 500);
                    return mockResult;
                  }
                  return prev;
                });
              }
            }, baseDelay + 2800);
          }
        });

        // After wave 1 completes (mostly), do escalation
        setTimeout(() => {
          setPhase('escalation_pause');
        }, 4500);

        // Show "text me" after 3 seconds
        setTimeout(() => {
          setShowTextMe(true);
        }, 3000);

      }, 500);
    }, 1200);
  }, [getMockResult, updateLane]);

  // Handle escalation
  useEffect(() => {
    if (phase === 'escalation_pause') {
      // 1 second pause to let the block register
      setTimeout(() => {
        setPhase('escalation_message');
        setShowEscalation(true);
      }, 1000);
    }

    if (phase === 'escalation_message') {
      // After showing message, spawn wave 2
      setTimeout(() => {
        setPhase('spawning_wave2');
        setIsNewWave(true);

        // Add wave 2 lanes
        const wave2: DemoLane[] = WAVE2_LANES.map(l => ({
          ...l,
          status: 'spawning' as LaneStatus,
          progress: 0,
          currentAction: 'Starting browser...',
        }));
        setLanes(prev => [...prev, ...wave2]);

        setTimeout(() => {
          setIsNewWave(false);
          setPhase('running_wave2');

          // Progress wave 2 lanes
          wave2.forEach((lane, i) => {
            const mockResult = getMockResult(lane.id);
            const baseDelay = 400 + (i * 250);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'navigating',
                progress: 25,
                currentAction: 'Navigating to dealer...'
              });
            }, baseDelay);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 50,
                currentAction: 'Checking inventory...'
              });
            }, baseDelay + 800);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 75,
                currentAction: 'Extracting details...'
              });
            }, baseDelay + 1400);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'complete',
                progress: 100,
                result: mockResult,
              });

              // Update best - Honda of Dallas should become the new best
              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => {
                  if (!prev?.car || mockResult.car!.price < prev.car.price) {
                    setIsNewBest(true);
                    setTimeout(() => setIsNewBest(false), 500);
                    return mockResult;
                  }
                  return prev;
                });
              }
            }, baseDelay + 2000);
          });

          // Complete after wave 2 finishes
          setTimeout(() => {
            setPhase('synthesizing');
            setTimeout(() => {
              setPhase('complete');
            }, 1500);
          }, 3500);
        }, 600);
      }, 2000);
    }
  }, [phase, getMockResult, updateLane]);

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(startDemo, 500);
    return () => clearTimeout(timer);
  }, [startDemo]);

  const wave1Lanes = lanes.filter(l => l.wave === 1);
  const wave2Lanes = lanes.filter(l => l.wave === 2);
  const totalComplete = lanes.filter(l => l.status === 'complete' || l.status === 'blocked' || l.status === 'error').length;
  const isRunning = phase !== 'idle' && phase !== 'complete';

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link
            href="/demo/car-search"
            className="flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Skip to results</span>
          </Link>
          <MinoLogo />
          <button
            onClick={startDemo}
            className="text-white/50 hover:text-white/70 transition-colors text-sm"
          >
            Restart demo
          </button>
        </header>

        {/* Main */}
        <main className="px-6 pb-24">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Query Card */}
            <div className="glass-card p-4">
              <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Searching for</div>
              <div className="text-white text-lg">"{CAR_SEARCH_QUERY}"</div>
            </div>

            {/* Progress Header */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {isRunning ? (
                    <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  )}
                  <span className="text-white font-medium">
                    {phase === 'analyzing' && 'Analyzing your request...'}
                    {phase === 'spawning_wave1' && 'Starting browsers...'}
                    {(phase === 'running_wave1' || phase === 'escalation_pause') && `Checking ${wave1Lanes.length} sites...`}
                    {phase === 'escalation_message' && 'Going deeper...'}
                    {phase === 'spawning_wave2' && 'Spawning dealership searches...'}
                    {phase === 'running_wave2' && `Checking ${lanes.length} sites...`}
                    {phase === 'synthesizing' && 'Synthesizing results...'}
                    {phase === 'complete' && `Checked ${lanes.length} sites`}
                  </span>
                  {lanes.length > 0 && (
                    <span className="text-white/40 text-sm">
                      {totalComplete} of {lanes.length} complete
                    </span>
                  )}
                </div>
              </div>

              {/* Main progress bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${lanes.length > 0 ? (totalComplete / lanes.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Browser Thumbnail Grid */}
            {lanes.length > 0 && (
              <div className="glass-card p-4 space-y-4">
                {/* Wave 1 Grid */}
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-3">
                    {wave2Lanes.length > 0 ? 'Initial Search' : 'Searching'}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {wave1Lanes.map(lane => (
                      <BrowserThumbnail key={lane.id} lane={lane} />
                    ))}
                  </div>
                </div>

                {/* Wave 2 Grid - with visual distinction */}
                {wave2Lanes.length > 0 && (
                  <div className={isNewWave ? 'animate-fadeIn' : ''}>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span>Dealership Search</span>
                      <span className="text-blue-400">← Going deeper</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {wave2Lanes.map(lane => (
                        <BrowserThumbnail key={lane.id} lane={lane} isNew={isNewWave} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Escalation Message */}
            <EscalationMessage visible={showEscalation && phase !== 'complete'} />

            {/* Best So Far */}
            {bestSoFar && phase !== 'complete' && (
              <BestSoFarCard result={bestSoFar} isNew={isNewBest} />
            )}

            {/* Text Me When Ready */}
            <TextMeWhenReady visible={showTextMe && isRunning} />

            {/* Complete - Link to results */}
            {phase === 'complete' && (
              <div className="animate-fadeIn space-y-4">
                <BestSoFarCard result={bestSoFar} />

                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-lg">{CAR_SEARCH_SYNTHESIS.headline}</div>
                      <div className="text-white/60 mt-1">
                        Found the best match from {lanes.length} sources searched
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/demo/car-search"
                    className="block w-full py-4 px-6 rounded-xl bg-blue-500 text-white text-center font-semibold hover:bg-blue-600 transition-colors"
                  >
                    View Full Results
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
