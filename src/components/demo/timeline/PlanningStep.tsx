'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon, LoaderIcon } from '@/components/icons';
import { TimelineStep } from './TimelineStep';
import { AccentColor } from '../types';

interface Site {
  id: string;
  site: string;
  domain: string;
}

type PlanningPhase = 'thinking' | 'identifying' | 'revealing' | 'complete';

interface PlanningStepProps {
  /** Whether planning is active (vs complete) */
  isPlanning: boolean;
  /** Whether to show this step at all */
  isVisible: boolean;
  /** Whether to show the connector line */
  showConnector: boolean;
  /** Sites that will be searched */
  sites: Site[];
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Callback when planning animation completes */
  onPlanningComplete?: () => void;
  /** Planning duration in ms (default 3500) */
  planningDuration?: number;
}

/**
 * Reusable planning step with dynamic thinking animation.
 * Shows agent-like thinking progression before revealing sites to search.
 */
export function PlanningStep({
  isPlanning,
  isVisible,
  showConnector,
  sites,
  accentColor = 'cyan',
  onPlanningComplete,
  planningDuration = 3500,
}: PlanningStepProps) {
  const [planningPhase, setPlanningPhase] = useState<PlanningPhase>('thinking');
  const [isExpanded, setIsExpanded] = useState(true);
  const [revealedSites, setRevealedSites] = useState<number>(0);

  // Reset when planning starts
  useEffect(() => {
    if (isPlanning) {
      setPlanningPhase('thinking');
      setRevealedSites(0);
      setIsExpanded(true);

      // Phase 1: Thinking (0-800ms)
      const thinkingTimer = setTimeout(() => {
        setPlanningPhase('identifying');
      }, 800);

      // Phase 2: Identifying (800-1600ms)
      const identifyingTimer = setTimeout(() => {
        setPlanningPhase('revealing');
      }, 1600);

      // Phase 3: Reveal sites one by one
      const revealTimers: NodeJS.Timeout[] = [];
      sites.forEach((_, index) => {
        const timer = setTimeout(() => {
          setRevealedSites(index + 1);
        }, 1800 + (index * 200));
        revealTimers.push(timer);
      });

      // Phase 4: Complete
      const completeTimer = setTimeout(() => {
        setPlanningPhase('complete');
        onPlanningComplete?.();
      }, planningDuration);

      return () => {
        clearTimeout(thinkingTimer);
        clearTimeout(identifyingTimer);
        clearTimeout(completeTimer);
        revealTimers.forEach(clearTimeout);
      };
    } else {
      // When not planning, show complete state
      setPlanningPhase('complete');
      setRevealedSites(sites.length);
    }
  }, [isPlanning, sites, planningDuration, onPlanningComplete]);

  if (!isVisible) return null;

  const getMessage = () => {
    switch (planningPhase) {
      case 'thinking':
        return 'Analyzing your request...';
      case 'identifying':
        return `Identified ${sites.length} sites to search`;
      case 'revealing':
        return `Identified ${sites.length} sites to search`;
      case 'complete':
        return 'Search planned';
      default:
        return 'Planning...';
    }
  };

  const isAnimating = planningPhase !== 'complete';

  return (
    <TimelineStep
      icon={isAnimating ? <LoaderIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckIcon className="w-3.5 h-3.5" />}
      isActive={isAnimating}
      isComplete={!isAnimating}
      accentColor={accentColor}
      showConnector={showConnector}
    >
      <button
        onClick={() => !isAnimating && setIsExpanded(!isExpanded)}
        disabled={isAnimating}
        className={`w-full text-left px-4 py-3 ${isExpanded && (planningPhase === 'revealing' || planningPhase === 'complete') ? 'border-b border-white/10' : ''} ${!isAnimating ? 'hover:bg-white/[0.02] cursor-pointer' : ''} transition-colors`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white/80 font-medium">
              {getMessage()}
            </span>
            {!isExpanded && !isAnimating && (
              <span className="text-white/40 text-sm">
                • {sites.length} sites selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {planningPhase === 'thinking' && (
              <ThinkingDots />
            )}
            {!isAnimating && (
              <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>
      </button>

      {/* Sites list - visible during revealing and when expanded */}
      {isExpanded && (planningPhase === 'revealing' || planningPhase === 'complete') && (
        <div className="px-4 py-3 space-y-2">
          <div className="text-white/50 text-xs uppercase tracking-wider">Sites to search</div>
          <div className="flex flex-wrap gap-2">
            {sites.map((site, index) => {
              const isRevealed = planningPhase === 'complete' || index < revealedSites;
              return (
                <div
                  key={site.id}
                  className={`px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 text-sm transition-all duration-300 ${
                    isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  {site.site}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </TimelineStep>
  );
}

/**
 * Animated thinking dots indicator.
 */
function ThinkingDots() {
  return (
    <div className="flex gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
