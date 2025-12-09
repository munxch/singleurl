'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, LoaderIcon, ChevronDownIcon } from '@/components/icons';
import { TimelineStep } from './TimelineStep';
import { AccentColor } from '../types';

type SynthesisPhase = 'thinking' | 'revealing' | 'complete';

interface AnalysisPoint {
  id: string;
  label: string;
  icon?: string;
}

interface SynthesisStepProps {
  /** Whether synthesis is active (vs complete) */
  isSynthesizing: boolean;
  /** Whether to show this step at all */
  isVisible: boolean;
  /** Whether to show the connector line */
  showConnector: boolean;
  /** Number of sources that were searched */
  sourcesCount: number;
  /** Number of results found */
  resultsCount: number;
  /** Analysis points to show (e.g., "Comparing prices", "Checking ratings") */
  analysisPoints?: AnalysisPoint[];
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Callback when synthesis animation completes */
  onSynthesisComplete?: () => void;
  /** Synthesis duration in ms (default 3500) */
  synthesisDuration?: number;
}

const DEFAULT_ANALYSIS_POINTS: AnalysisPoint[] = [
  { id: 'quality', label: 'Evaluating quality signals', icon: '⭐' },
  { id: 'price', label: 'Comparing pricing', icon: '💰' },
  { id: 'availability', label: 'Checking availability', icon: '📅' },
  { id: 'ranking', label: 'Ranking by your preferences', icon: '🎯' },
];

/**
 * Reusable synthesis step with dynamic evaluation animation.
 * Shows agent-like analysis progression before revealing results.
 */
export function SynthesisStep({
  isSynthesizing,
  isVisible,
  showConnector,
  sourcesCount,
  resultsCount,
  analysisPoints = DEFAULT_ANALYSIS_POINTS,
  accentColor = 'cyan',
  onSynthesisComplete,
  synthesisDuration = 3500,
}: SynthesisStepProps) {
  const [synthesisPhase, setSynthesisPhase] = useState<SynthesisPhase>('thinking');
  const [revealedPoints, setRevealedPoints] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Store points count in a ref to avoid dependency issues
  const pointsCount = analysisPoints.length;

  // Reset when synthesis starts - only depend on isSynthesizing to prevent re-runs
  useEffect(() => {
    if (isSynthesizing) {
      setSynthesisPhase('thinking');
      setRevealedPoints(0);
      setIsExpanded(false); // Start collapsed

      // Phase 1: Thinking (0-1000ms) - collapsed with thinking dots
      const revealingTimer = setTimeout(() => {
        setSynthesisPhase('revealing');
        setIsExpanded(true); // Now expand
      }, 1000);

      // Phase 2: Reveal analysis points one by one (starting at 1200ms)
      const revealTimers: NodeJS.Timeout[] = [];
      for (let i = 0; i < pointsCount; i++) {
        const timer = setTimeout(() => {
          setRevealedPoints(i + 1);
        }, 1200 + (i * 400));
        revealTimers.push(timer);
      }

      // Phase 3: Complete
      const completeTimer = setTimeout(() => {
        setSynthesisPhase('complete');
        onSynthesisComplete?.();
      }, synthesisDuration);

      return () => {
        clearTimeout(revealingTimer);
        clearTimeout(completeTimer);
        revealTimers.forEach(clearTimeout);
      };
    } else if (!isSynthesizing) {
      // When not synthesizing, ensure we're in complete state
      setSynthesisPhase('complete');
      setRevealedPoints(pointsCount);
      setIsExpanded(false); // Collapsed in complete state
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSynthesizing]);

  if (!isVisible) return null;

  const getMessage = () => {
    switch (synthesisPhase) {
      case 'thinking':
        return `Analyzing ${resultsCount} results from ${sourcesCount} sources...`;
      case 'revealing':
        return `Evaluating ${resultsCount} results`;
      case 'complete':
        return 'Analysis complete';
      default:
        return 'Processing...';
    }
  };

  const isAnimating = synthesisPhase !== 'complete';

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
        className={`w-full text-left px-4 py-3 ${isExpanded ? 'border-b border-white/10' : ''} ${!isAnimating ? 'hover:bg-white/[0.02] cursor-pointer' : ''} transition-colors`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white/80 font-medium">
              {getMessage()}
            </span>
            {!isExpanded && !isAnimating && (
              <span className="text-white/40 text-sm">
                • {resultsCount} options evaluated
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {synthesisPhase === 'thinking' && (
              <SynthesisThinkingDots />
            )}
            {!isAnimating && (
              <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>
      </button>

      {/* Analysis points - visible when expanded */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-2">
          <div className="text-white/50 text-xs uppercase tracking-wider">Evaluating</div>
          <div className="space-y-2">
            {analysisPoints.map((point, index) => {
              const isRevealed = synthesisPhase === 'complete' || index < revealedPoints;
              const isCurrentlyProcessing = isAnimating && index === revealedPoints - 1;
              return (
                <div
                  key={point.id}
                  className={`flex items-center gap-3 py-1.5 transition-all duration-300 ${
                    isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`}
                >
                  <span className="text-base">{point.icon || '•'}</span>
                  <span className={`text-sm ${isCurrentlyProcessing ? 'text-white/80' : 'text-white/60'}`}>
                    {point.label}
                  </span>
                  {isRevealed && !isCurrentlyProcessing && (
                    <CheckIcon className="w-3.5 h-3.5 text-green-400/70 ml-auto" />
                  )}
                  {isCurrentlyProcessing && (
                    <LoaderIcon className="w-3.5 h-3.5 text-white/40 animate-spin ml-auto" />
                  )}
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
 * Animated thinking dots indicator for synthesis.
 */
function SynthesisThinkingDots() {
  return (
    <div className="flex gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
