'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SourceRow } from './SourceRow';
import { BaseDemoLane, AccentColor } from '../types';

interface SourcesListProps<T extends BaseDemoLane> {
  /** All lanes to display */
  lanes: T[];
  /** Currently selected lane ID */
  selectedLaneId: string | null;
  /** Handler for selecting a lane */
  onSelectLane: (id: string) => void;
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Whether to show escalation message between waves */
  showEscalation?: boolean;
  /** Custom escalation message */
  escalationMessage?: string;
  /** Label for wave 1 sources */
  wave1Label?: string;
  /** Label for wave 2 sources */
  wave2Label?: string;
  /** Function to get result count for a lane */
  getResultCount?: (lane: T) => number | undefined;
  /** Function to get result label for a lane */
  getResultLabel?: (lane: T) => string | undefined;
  /** Function to determine if lane has a positive result */
  hasResult?: (lane: T) => boolean;
}

/**
 * List of sources organized by wave with optional escalation message.
 * Supports single-wave (no wave property) and dual-wave configurations.
 */
export function SourcesList<T extends BaseDemoLane>({
  lanes,
  selectedLaneId,
  onSelectLane,
  accentColor = 'amber',
  showEscalation = false,
  escalationMessage,
  wave1Label = 'Sources',
  wave2Label = 'Data Enrichment',
  getResultCount,
  getResultLabel,
  hasResult,
}: SourcesListProps<T>) {
  // Track which lanes have been revealed (for staggered animation)
  const [revealedLanes, setRevealedLanes] = useState<Set<string>>(new Set());
  const prevLanesRef = useRef<string[]>([]);

  // Reveal new lanes with stagger
  useEffect(() => {
    const currentIds = lanes.map(l => l.id);
    const prevIds = prevLanesRef.current;
    const newLanes = currentIds.filter(id => !prevIds.includes(id));

    if (newLanes.length > 0) {
      // Stagger reveal new lanes
      newLanes.forEach((id, index) => {
        setTimeout(() => {
          setRevealedLanes(prev => new Set([...prev, id]));
        }, index * 100); // 100ms stagger between each lane
      });
    }

    prevLanesRef.current = currentIds;
  }, [lanes]);

  // Separate lanes by wave
  const wave1 = lanes.filter(l => !l.wave || l.wave === 1);
  const wave2 = lanes.filter(l => l.wave === 2);
  const hasTwoWaves = wave2.length > 0;

  return (
    <div className="space-y-4">
      {/* Wave 1 */}
      {wave1.length > 0 && (
        <div className="animate-fadeIn">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
            {hasTwoWaves ? wave1Label : 'Sources'}
          </div>
          <div className="space-y-1">
            {wave1.map((lane, index) => {
              const isRevealed = revealedLanes.has(lane.id);
              return (
                <div
                  key={lane.id}
                  className={`transition-all duration-300 ease-out ${
                    isRevealed
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'
                  }`}
                  style={{ transitionDelay: isRevealed ? '0ms' : `${index * 50}ms` }}
                >
                  <SourceRow
                    id={lane.id}
                    site={lane.site}
                    status={lane.status}
                    progress={lane.progress}
                    isSelected={selectedLaneId === lane.id}
                    onClick={() => onSelectLane(lane.id)}
                    accentColor={accentColor}
                    resultCount={getResultCount?.(lane)}
                    resultLabel={getResultLabel?.(lane)}
                    hasResult={hasResult?.(lane)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Escalation message */}
      {showEscalation && escalationMessage && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] text-white/50 text-sm animate-fadeIn">
          <span className="text-white/30">+</span>
          <span>{escalationMessage}</span>
        </div>
      )}

      {/* Wave 2 */}
      {wave2.length > 0 && (
        <div className="animate-fadeIn">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
            {wave2Label}
          </div>
          <div className="space-y-1">
            {wave2.map((lane, index) => {
              const isRevealed = revealedLanes.has(lane.id);
              return (
                <div
                  key={lane.id}
                  className={`transition-all duration-300 ease-out ${
                    isRevealed
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'
                  }`}
                  style={{ transitionDelay: isRevealed ? '0ms' : `${index * 50}ms` }}
                >
                  <SourceRow
                    id={lane.id}
                    site={lane.site}
                    status={lane.status}
                    progress={lane.progress}
                    isSelected={selectedLaneId === lane.id}
                    onClick={() => onSelectLane(lane.id)}
                    accentColor={accentColor}
                    resultCount={getResultCount?.(lane)}
                    resultLabel={getResultLabel?.(lane)}
                    hasResult={hasResult?.(lane)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
