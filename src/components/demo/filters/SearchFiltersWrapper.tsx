'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, LoaderIcon, SearchIcon } from '@/components/icons';

interface SearchFiltersWrapperProps {
  /** Whether the filters section is expanded */
  isExpanded: boolean;
  /** Toggle expand/collapse */
  onToggle: () => void;
  /** Whether filters should be shown (after thinking completes) */
  showFilters: boolean;
  /** Whether the thinking animation is active */
  isThinking: boolean;
  /** Whether search is in progress */
  isSearching: boolean;
  /** Handler for search button click */
  onStartSearch: () => void;
  /** Title when thinking */
  thinkingTitle?: string;
  /** Title when ready */
  readyTitle?: string;
  /** Summary chips to show when collapsed */
  summaryChips?: string[];
  /** Whether to show notes input */
  showNotesInput?: boolean;
  /** Custom filter content */
  children: React.ReactNode;
}

/**
 * Wrapper for search filter sections with collapsible behavior.
 * Handles thinking state animation and collapsed summary display.
 */
export function SearchFiltersWrapper({
  isExpanded,
  onToggle,
  showFilters,
  isThinking,
  isSearching,
  onStartSearch,
  thinkingTitle = 'Planning approach...',
  readyTitle = 'Refine Search',
  summaryChips = [],
  showNotesInput = true,
  children,
}: SearchFiltersWrapperProps) {
  const [notes, setNotes] = useState('');

  return (
    <div>
      {/* Collapsed summary / header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white/80 font-medium">
            {isThinking ? thinkingTitle : readyTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isExpanded && !isThinking && summaryChips.length > 0 && (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              {summaryChips.map((chip, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white/10">{chip}</span>
              ))}
            </div>
          )}
          {!isThinking && (
            <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Thinking state */}
      {isThinking && (
        <div className="px-4 pb-4">
          <ThinkingDots />
        </div>
      )}

      {/* Expanded filters */}
      {isExpanded && showFilters && !isThinking && (
        <div className="px-4 pb-4 space-y-4 animate-fadeIn">
          {children}

          {/* Notes input */}
          {showNotesInput && (
            <div className="max-w-sm">
              <div className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Additional notes
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or preferences..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/15 focus:bg-white/[0.06] transition-all resize-none"
              />
            </div>
          )}

          {/* Start Search Button */}
          <div className="pt-2">
            <button
              onClick={onStartSearch}
              disabled={isSearching}
              className="py-2 px-3.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <SearchIcon className="w-3.5 h-3.5" />
                  <span>Start</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Animated thinking dots indicator.
 */
export function ThinkingDots() {
  return (
    <div className="flex gap-1.5">
      <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

/**
 * Filter option button component for consistent styling.
 */
export function FilterOption({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition-all ${
        isSelected
          ? 'bg-white/20 text-white border border-white/30'
          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Filter section label.
 */
export function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-white/50 text-xs uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}
