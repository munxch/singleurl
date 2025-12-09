'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@/components/icons';

interface SourceStatus {
  id: string;
  site: string;
  status: 'success' | 'available' | 'blocked' | 'paywalled' | 'partial' | 'no_results' | 'error';
  wave?: 1 | 2;
  statusText?: string;
  isBest?: boolean;
}

interface TransparencyViewProps {
  /** All sources that were checked */
  sources: SourceStatus[];
  /** Summary text (e.g., "Checked 5 sources (4 with availability)") */
  summaryText: string;
  /** Label for wave 1 sources */
  wave1Label?: string;
  /** Label for wave 2 sources */
  wave2Label?: string;
  /** Function to get status text for each source */
  getStatusText?: (source: SourceStatus) => string;
}

/**
 * Expandable popover showing all sources checked and their results.
 * Supports single-wave and dual-wave configurations.
 */
export function TransparencyView({
  sources,
  summaryText,
  wave1Label = 'Sources Checked',
  wave2Label = 'Data Enrichment',
  getStatusText,
}: TransparencyViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Separate by wave
  const wave1 = sources.filter(s => !s.wave || s.wave === 1);
  const wave2 = sources.filter(s => s.wave === 2);
  const hasTwoWaves = wave2.length > 0;

  const defaultGetStatusText = (source: SourceStatus): string => {
    if (source.statusText) return source.statusText;
    if (source.isBest) return '← BEST';
    switch (source.status) {
      case 'success':
      case 'available':
        return 'Found';
      case 'blocked':
        return 'Blocked';
      case 'paywalled':
        return 'Paywalled';
      case 'partial':
        return 'Partial';
      case 'no_results':
        return 'No results';
      default:
        return '';
    }
  };

  const getTextFn = getStatusText || defaultGetStatusText;

  const renderSourceRow = (source: SourceStatus) => {
    const isPositive = ['success', 'available'].includes(source.status);
    const text = getTextFn(source);

    return (
      <div key={source.id} className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isPositive ? (
            <CheckIcon className="w-4 h-4 text-green-400" />
          ) : (
            <span className="text-white/40 w-4 text-center">—</span>
          )}
          <span className="text-white/70">{source.site}</span>
        </div>
        <span className={`${
          source.isBest ? 'text-amber-400' :
          isPositive ? 'text-white/50' :
          'text-white/40'
        }`}>
          {text}
        </span>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
      >
        {summaryText}
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-4 rounded-xl bg-[#0a1628] border border-white/20 shadow-xl z-50 space-y-3">
          {/* Wave 1 */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
              {hasTwoWaves ? wave1Label : 'Sources Checked'}
            </div>
            <div className="space-y-1">
              {wave1.map(renderSourceRow)}
            </div>
          </div>

          {/* Wave 2 */}
          {hasTwoWaves && wave2.length > 0 && (
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
                {wave2Label}
              </div>
              <div className="space-y-1">
                {wave2.map(renderSourceRow)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
