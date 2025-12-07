'use client';

import React from 'react';
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
  // Separate lanes by wave
  const wave1 = lanes.filter(l => !l.wave || l.wave === 1);
  const wave2 = lanes.filter(l => l.wave === 2);
  const hasTwoWaves = wave2.length > 0;

  return (
    <div className="space-y-4">
      {/* Wave 1 */}
      {wave1.length > 0 && (
        <div>
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
            {hasTwoWaves ? wave1Label : 'Sources'}
          </div>
          <div className="space-y-1">
            {wave1.map(lane => (
              <SourceRow
                key={lane.id}
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
            ))}
          </div>
        </div>
      )}

      {/* Escalation message */}
      {showEscalation && escalationMessage && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] text-white/50 text-sm">
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
            {wave2.map(lane => (
              <SourceRow
                key={lane.id}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
