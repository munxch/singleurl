'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

interface PivotOption {
  icon: string;
  label: string;
  description: string;
  onClick?: () => void;
}

interface AdjustSearchViewProps {
  /** Pivot suggestions to display */
  pivots: PivotOption[];
  /** Handler for modify action */
  onModify?: () => void;
  /** Handler for start over action */
  onStartOver?: () => void;
  /** Custom button label */
  buttonLabel?: string;
}

/**
 * Expandable popover showing pivot/adjustment suggestions.
 * Allows users to modify their search or start over.
 */
export function AdjustSearchView({
  pivots,
  onModify,
  onStartOver,
  buttonLabel = 'Adjust search',
}: AdjustSearchViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
      >
        {buttonLabel}
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-xl bg-[#0a1628] border border-white/20 shadow-xl z-50 space-y-2">
          {pivots.map((pivot, i) => (
            <button
              key={i}
              onClick={pivot.onClick}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <span className="text-sm">{pivot.icon}</span>
              <div>
                <div className="text-white/80 text-xs">{pivot.label}</div>
                <div className="text-white/40 text-[10px]">{pivot.description}</div>
              </div>
            </button>
          ))}

          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              onClick={onModify}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-colors"
            >
              Modify
            </button>
            <button
              onClick={onStartOver}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
