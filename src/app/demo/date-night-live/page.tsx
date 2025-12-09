'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import {
  LoaderIcon,
  CheckCircleIcon,
  GlobeIcon,
  ArrowLeftIcon,
  StarIcon,
} from '@/components/icons';
import {
  DATE_NIGHT_QUERY,
  DATE_NIGHT_RESULTS,
  DATE_NIGHT_SYNTHESIS,
  formatPriceLevel,
  type RestaurantResult,
} from '@/lib/mock-data';

// =============================================================================
// TYPES
// =============================================================================

type LaneStatus = 'pending' | 'spawning' | 'navigating' | 'extracting' | 'complete' | 'error';

interface DemoLane {
  id: string;
  site: string;
  shortName: string;
  status: LaneStatus;
  progress: number;
  result?: RestaurantResult;
  currentAction?: string;
}

type DemoPhase = 'idle' | 'analyzing' | 'spawning' | 'running' | 'synthesizing' | 'complete';

// =============================================================================
// INITIAL DATA
// =============================================================================

const LANES_DATA: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'resy', site: 'Resy', shortName: 'Resy' },
  { id: 'opentable', site: 'OpenTable', shortName: 'OT' },
  { id: 'yelp', site: 'Yelp', shortName: 'Yelp' },
  { id: 'google', site: 'Google', shortName: 'G' },
  { id: 'tock', site: 'Tock', shortName: 'Tock' },
];

// =============================================================================
// BROWSER THUMBNAIL COMPONENT
// =============================================================================

function BrowserThumbnail({ lane }: { lane: DemoLane }) {
  const getStatusColor = () => {
    switch (lane.status) {
      case 'complete': return 'border-green-500/50 bg-green-500/5';
      case 'error': return 'border-red-500/50 bg-red-500/5';
      case 'pending': return 'border-white/10 bg-white/[0.02]';
      default: return 'border-amber-500/30 bg-amber-500/5';
    }
  };

  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <span className="text-red-400 text-[10px]">✗</span>;
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className="w-4 h-4 animate-spin text-amber-400" />;
    }
  };

  const isActive = lane.status !== 'pending' && lane.status !== 'complete' && lane.status !== 'error';

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden transition-all duration-500
        ${getStatusColor()}
        border animate-scaleIn
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
          <span className="text-white/40 text-[10px] truncate">{lane.site.toLowerCase()}.com</span>
        </div>
        {getStatusIcon()}
      </div>

      {/* Browser viewport */}
      <div className="aspect-[4/3] bg-gradient-to-b from-slate-900/50 to-slate-950/50 relative p-2">
        {/* Site content placeholder */}
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <span className="text-2xl">🍝</span>
          <span className="text-white/60 text-xs font-medium">{lane.shortName}</span>
        </div>

        {/* Active overlay with action */}
        {isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center px-2">
              <LoaderIcon className="w-4 h-4 text-amber-400 animate-spin mx-auto mb-1" />
              <p className="text-white/70 text-[10px] leading-tight">{lane.currentAction}</p>
            </div>
          </div>
        )}

        {/* Complete overlay with restaurant info */}
        {lane.status === 'complete' && lane.result?.restaurant && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center px-1">
              <CheckCircleIcon className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-white font-medium text-xs">{lane.result.restaurant.name}</p>
              <p className="text-amber-400 text-[10px] flex items-center justify-center gap-0.5">
                <StarIcon className="w-2.5 h-2.5" />
                {lane.result.restaurant.rating}
              </p>
            </div>
          </div>
        )}

        {/* No results */}
        {lane.status === 'complete' && !lane.result?.restaurant && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <p className="text-white/40 text-[10px] text-center px-2">{lane.result?.statusMessage || 'No results'}</p>
          </div>
        )}
      </div>

      {/* Progress bar at bottom */}
      <div className="h-0.5 bg-white/10">
        <div
          className={`h-full transition-all duration-300 ${
            lane.status === 'complete' ? 'bg-green-500' :
            lane.status === 'error' ? 'bg-red-500' :
            'bg-amber-500'
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

function BestSoFarCard({ result, isNew = false }: { result: RestaurantResult | null; isNew?: boolean }) {
  if (!result?.restaurant) return null;

  return (
    <div className={`
      p-4 rounded-xl bg-amber-500/10 border border-amber-500/30
      flex items-center gap-4
      ${isNew ? 'animate-pulse-once' : ''}
    `}>
      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">🏆</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white/50 text-xs">Best match</div>
        <div className="text-amber-400 font-semibold text-lg">
          {result.restaurant.name}
        </div>
        <div className="text-white/50 text-sm flex items-center gap-2">
          <span className="flex items-center gap-1">
            <StarIcon className="w-3 h-3 text-amber-400" />
            {result.restaurant.rating}
          </span>
          <span>•</span>
          <span>{formatPriceLevel(result.restaurant.priceLevel)}</span>
          <span>•</span>
          <span>{result.restaurant.availability.time}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function DateNightLivePage() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [bestSoFar, setBestSoFar] = useState<RestaurantResult | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  // Get the mock result for a lane
  const getMockResult = useCallback((laneId: string): RestaurantResult | undefined => {
    return DATE_NIGHT_RESULTS.find(r => r.id === laneId);
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

    // After 800ms, start spawning (faster than car search)
    setTimeout(() => {
      setPhase('spawning');

      // Spawn all 5 lanes at once
      const allLanes: DemoLane[] = LANES_DATA.map(l => ({
        ...l,
        status: 'spawning' as LaneStatus,
        progress: 0,
        currentAction: 'Starting browser...',
      }));
      setLanes(allLanes);

      // After 400ms, transition to running
      setTimeout(() => {
        setPhase('running');

        // Simulate each lane progressing quickly
        allLanes.forEach((lane, i) => {
          const mockResult = getMockResult(lane.id);

          // Faster stagger for the quick flow
          const baseDelay = 200 + (i * 150);

          // Navigate phase
          setTimeout(() => {
            updateLane(lane.id, {
              status: 'navigating',
              progress: 30,
              currentAction: 'Searching restaurants...'
            });
          }, baseDelay);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'extracting',
              progress: 60,
              currentAction: 'Checking availability...'
            });
          }, baseDelay + 600);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'extracting',
              progress: 85,
              currentAction: 'Getting details...'
            });
          }, baseDelay + 1100);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'complete',
              progress: 100,
              result: mockResult,
            });

            // Update best so far for available restaurants
            if (mockResult?.status === 'available' && mockResult.restaurant) {
              setBestSoFar(prev => {
                // First available result, or better rating
                if (!prev?.restaurant || mockResult.restaurant!.rating > prev.restaurant.rating) {
                  setIsNewBest(true);
                  setTimeout(() => setIsNewBest(false), 500);
                  return mockResult;
                }
                return prev;
              });
            }
          }, baseDelay + 1600);
        });

        // Complete much faster - around 3.5 seconds total
        setTimeout(() => {
          setPhase('synthesizing');
          setTimeout(() => {
            setPhase('complete');
          }, 800);
        }, 2800);

      }, 400);
    }, 800);
  }, [getMockResult, updateLane]);

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(startDemo, 500);
    return () => clearTimeout(timer);
  }, [startDemo]);

  const totalComplete = lanes.filter(l => l.status === 'complete' || l.status === 'error').length;
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
            href="/demo/date-night"
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
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Query Card */}
            <div className="glass-card p-4">
              <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Finding</div>
              <div className="text-white text-lg">"{DATE_NIGHT_QUERY}"</div>
            </div>

            {/* Progress Header */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {isRunning ? (
                    <LoaderIcon className="w-5 h-5 animate-spin text-amber-400" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  )}
                  <span className="text-white font-medium">
                    {phase === 'analyzing' && 'Understanding your request...'}
                    {phase === 'spawning' && 'Starting searches...'}
                    {phase === 'running' && `Checking ${lanes.length} sources...`}
                    {phase === 'synthesizing' && 'Finding the best option...'}
                    {phase === 'complete' && `Found from ${lanes.length} sources`}
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
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${lanes.length > 0 ? (totalComplete / lanes.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Browser Thumbnail Grid - 5 columns */}
            {lanes.length > 0 && (
              <div className="glass-card p-4">
                <div className="grid grid-cols-5 gap-2">
                  {lanes.map(lane => (
                    <BrowserThumbnail key={lane.id} lane={lane} />
                  ))}
                </div>
              </div>
            )}

            {/* Best So Far */}
            {bestSoFar && (
              <BestSoFarCard result={bestSoFar} isNew={isNewBest} />
            )}

            {/* Complete - Link to results */}
            {phase === 'complete' && (
              <div className="animate-fadeIn space-y-4">
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-lg">{DATE_NIGHT_SYNTHESIS.headline}</div>
                      <div className="text-amber-400 mt-1">
                        {DATE_NIGHT_SYNTHESIS.subtitle}
                      </div>
                      <div className="text-white/50 text-sm mt-1">
                        "{DATE_NIGHT_SYNTHESIS.pullQuote}"
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/demo/date-night"
                    className="block w-full py-4 px-6 rounded-xl bg-amber-500 text-black text-center font-semibold hover:bg-amber-400 transition-colors"
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
