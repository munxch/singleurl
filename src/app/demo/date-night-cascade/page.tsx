'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import {
  LoaderIcon,
  CheckCircleIcon,
  CheckIcon,
  GlobeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  SearchIcon,
  ChevronDownIcon,
} from '@/components/icons';
import {
  DATE_NIGHT_QUERY,
  DATE_NIGHT_RESULTS,
  DATE_NIGHT_BEST_RESULT,
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
  domain: string;
  status: LaneStatus;
  progress: number;
  result?: RestaurantResult;
  currentAction?: string;
}

type DemoPhase = 'idle' | 'ready' | 'analyzing' | 'spawning' | 'running' | 'synthesizing' | 'complete';

// =============================================================================
// CLARIFYING QUESTIONS SECTION (INLINE/COLLAPSIBLE)
// =============================================================================

interface SearchFilters {
  partySize: number;
  atmosphere: string;
  priceRange: string;
}

function SearchFiltersSection({
  isExpanded,
  onToggle,
  filters,
  onFiltersChange,
  onStartSearch,
  isSearching,
  isThinking,
  showFilters,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onStartSearch: () => void;
  isSearching: boolean;
  isThinking: boolean;
  showFilters: boolean;
}) {
  return (
    <div>
      {/* Collapsed summary / header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🎯</span>
          <span className="text-white/80 font-medium">
            {isThinking ? 'Planning approach...' : 'Refine Search'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isExpanded && !isThinking && (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <span className="px-2 py-0.5 rounded bg-white/10">{filters.partySize} guests</span>
              <span className="px-2 py-0.5 rounded bg-white/10">{filters.atmosphere}</span>
              <span className="px-2 py-0.5 rounded bg-white/10">{filters.priceRange}</span>
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
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* Expanded filters */}
      {isExpanded && showFilters && !isThinking && (
        <div className="px-4 pb-4 space-y-4 animate-fadeIn">
          {/* Party Size */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Party size</div>
            <div className="flex gap-2">
              {[2, 4, 6].map(size => (
                <button
                  key={size}
                  onClick={() => onFiltersChange({ ...filters, partySize: size })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filters.partySize === size
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {size} guests
                </button>
              ))}
            </div>
          </div>

          {/* Atmosphere */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Vibe</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'romantic', label: '🕯️ Romantic' },
                { id: 'lively', label: '🎉 Lively' },
                { id: 'quiet', label: '🤫 Quiet' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onFiltersChange({ ...filters, atmosphere: opt.id })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filters.atmosphere === opt.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Budget</div>
            <div className="flex gap-2">
              {['$$', '$$$', '$$$$'].map(price => (
                <button
                  key={price}
                  onClick={() => onFiltersChange({ ...filters, priceRange: price })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filters.priceRange === price
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Start Search Button */}
          <div className="pt-2">
            <button
              onClick={onStartSearch}
              disabled={isSearching}
              className="py-2.5 px-8 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// INITIAL DATA
// =============================================================================

const LANES_DATA: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'resy', site: 'Resy', domain: 'resy.com' },
  { id: 'opentable', site: 'OpenTable', domain: 'opentable.com' },
  { id: 'yelp', site: 'Yelp', domain: 'yelp.com' },
  { id: 'google', site: 'Google', domain: 'google.com/maps' },
  { id: 'tock', site: 'Tock', domain: 'exploretock.com' },
];

// =============================================================================
// BROWSER WINDOW COMPONENT
// =============================================================================

function BrowserWindow({ lane }: { lane: DemoLane }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0f0f1a]">
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] border-b border-white/10">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] rounded-md">
          <GlobeIcon className="w-3.5 h-3.5 text-white/40" />
          <span className="text-white/50 text-xs font-mono truncate">
            {lane.domain}
          </span>
        </div>
        <div className="flex items-center">
          {lane.status === 'complete' && <CheckCircleIcon className="w-4 h-4 text-white/40" />}
          {!['complete', 'pending'].includes(lane.status) && (
            <LoaderIcon className="w-4 h-4 animate-spin text-amber-400/70" />
          )}
        </div>
      </div>

      {/* Browser content */}
      <div className="h-full p-4 relative">
        {/* Site header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-base">🍝</span>
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">{lane.site}</div>
            <div className="text-white/40 text-xs">Restaurant reservations</div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-8 bg-white/5 rounded border border-white/10" />
          <div className="w-16 h-8 bg-amber-500/20 rounded" />
        </div>

        {/* Result cards */}
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 p-3 bg-white/[0.02] rounded border border-white/5">
              <div className="w-16 h-12 bg-white/5 rounded flex items-center justify-center">
                <span className="text-lg opacity-30">🍽️</span>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="w-3/4 h-3 bg-white/10 rounded" />
                <div className="w-1/2 h-2 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Status overlays */}
        {lane.status !== 'complete' && lane.status !== 'pending' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <LoaderIcon className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-white/80 text-sm">{lane.currentAction}</p>
            </div>
          </div>
        )}

        {lane.status === 'complete' && lane.result?.restaurant && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white font-bold text-xl">{lane.result.restaurant.name}</p>
              <p className="text-amber-400 text-sm mt-1 flex items-center justify-center gap-1">
                <StarIcon className="w-4 h-4" />
                {lane.result.restaurant.rating} • {lane.result.restaurant.availability.time}
              </p>
            </div>
          </div>
        )}

        {lane.status === 'complete' && !lane.result?.restaurant && lane.result && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <p className="text-white/40 text-sm">{lane.result.statusMessage || 'No results'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SOURCE ROW WITH PROGRESS FILL
// =============================================================================

function SourceRow({
  lane,
  isSelected,
  onClick,
}: {
  lane: DemoLane;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-white/40" />;
      case 'pending':
        return <div className="w-3 h-3 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className="w-4 h-4 animate-spin text-amber-400/70" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all overflow-hidden
        ${isSelected
          ? 'ring-1 ring-amber-400/50 bg-transparent'
          : 'hover:bg-white/[0.03]'
        }
      `}
    >
      {/* Progress fill background */}
      <div
        className="absolute inset-0 bg-white/[0.04] transition-all duration-500 ease-out"
        style={{ width: `${lane.progress}%` }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-3 w-full">
        {getStatusIcon()}
        <span className="flex-1 text-sm text-white/80 truncate">
          {lane.site}
        </span>
        {lane.status === 'complete' && (
          <span className={`text-xs ${lane.result?.restaurant ? 'text-green-400/80' : 'text-white/40'}`}>
            {lane.result?.restaurant ? 'Found 1' : 'No results'}
          </span>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// SOURCES LIST COMPONENT
// =============================================================================

function SourcesList({
  lanes,
  selectedLaneId,
  onSelectLane,
}: {
  lanes: DemoLane[];
  selectedLaneId: string | null;
  onSelectLane: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
          Sources
        </div>
        <div className="space-y-1">
          {lanes.map(lane => (
            <SourceRow
              key={lane.id}
              lane={lane}
              isSelected={selectedLaneId === lane.id}
              onClick={() => onSelectLane(lane.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HERO RESULT CARD
// =============================================================================

function HeroResultCard({ onBook }: { onBook: () => void }) {
  const result = DATE_NIGHT_BEST_RESULT;
  const synthesis = DATE_NIGHT_SYNTHESIS;

  if (!result.restaurant) return null;

  return (
    <div className="space-y-5">
      {/* Image Grid */}
      <div className="grid grid-cols-4 gap-2 h-48">
        {/* Main large image */}
        <div className="col-span-2 row-span-2 rounded-xl overflow-hidden bg-gradient-to-br from-amber-900/40 to-slate-900 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">🍝</div>
              <div className="text-white/40 text-xs">Handmade Pasta</div>
            </div>
          </div>
        </div>
        {/* Top right */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-rose-900/30 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🥖</div>
            <div className="text-white/30 text-[10px]">Fresh Bread</div>
          </div>
        </div>
        {/* Top far right */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-amber-800/30 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🍷</div>
            <div className="text-white/30 text-[10px]">Wine Bar</div>
          </div>
        </div>
        {/* Bottom right */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-orange-900/30 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🕯️</div>
            <div className="text-white/30 text-[10px]">Intimate</div>
          </div>
        </div>
        {/* Bottom far right */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl">🧑‍🍳</div>
            <div className="text-white/30 text-[10px]">Chef's Table</div>
          </div>
        </div>
      </div>

      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {result.restaurant.name}
          </h1>
          <div className="flex items-center gap-3 text-white/60 mt-1">
            <span className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-amber-400" />
              {result.restaurant.rating} ({result.restaurant.reviewCount})
            </span>
            <span>•</span>
            <span>{result.restaurant.cuisine}</span>
            <span>•</span>
            <span>{formatPriceLevel(result.restaurant.priceLevel)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">
            {synthesis.subtitle}
          </div>
          <div className="text-white/50 text-sm">
            Party of 2
          </div>
        </div>
      </div>

      {/* Vibe Badges */}
      <div className="flex flex-wrap gap-2">
        {result.restaurant.vibe.map((v, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            {v}
          </span>
        ))}
      </div>

      {/* Why Mino Picked This */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
          Why Mino Picked This
        </div>
        <ul className="space-y-2">
          {synthesis.rationale.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-white/80">
              <span className="text-amber-400 mt-0.5">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Restaurant Card with Call + Reservation */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
        {/* Restaurant Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">
            🍽️
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">{result.restaurant.name}</div>
            <div className="flex items-center gap-3 text-white/50 text-sm mt-1">
              <span className="flex items-center gap-1">
                <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                {result.restaurant.rating} ({result.restaurant.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {result.restaurant.distance} mi
              </span>
            </div>
          </div>
          <button className="py-2.5 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
            <PhoneIcon className="w-4 h-4" />
            Call
          </button>
        </div>

        {/* Reservation Times */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/50 text-xs uppercase tracking-wider font-medium">
              Available Times Tonight
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap flex-1">
              {['6:30pm', '7:00pm', '7:15pm', '7:30pm', '8:00pm', '8:30pm'].map((time, i) => (
                <button
                  key={i}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    i === 1
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <button
              onClick={onBook}
              className="py-3 px-6 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-colors flex-shrink-0"
            >
              Reserve 7:00pm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ALTERNATIVE RESULT CARD
// =============================================================================

function AlternativeResultCard({ result, onBook }: { result: RestaurantResult; onBook: () => void }) {
  if (!result.restaurant) return null;

  return (
    <div className="w-56 flex-shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors">
      {/* Thumbnail */}
      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-amber-900/20 to-slate-800 flex items-center justify-center mb-3">
        <span className="text-3xl">🍝</span>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="text-white font-medium text-sm truncate">
          {result.restaurant.name}
        </div>
        <div className="text-white/50 text-xs">
          {result.restaurant.cuisine} • {formatPriceLevel(result.restaurant.priceLevel)}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <StarIcon className="w-3 h-3" />
            {result.restaurant.rating}
          </div>
          <div className="text-white/70 text-sm">
            {result.restaurant.availability.time}
          </div>
        </div>
        {/* Book CTA */}
        <button
          onClick={onBook}
          className="w-full py-2 px-3 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors border border-white/10"
        >
          Book {result.restaurant.availability.time}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// TRANSPARENCY VIEW - WHAT WE CHECKED
// =============================================================================

function TransparencyView() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getStatusText = (result: RestaurantResult) => {
    if (result.status === 'available' && result.restaurant) {
      if (result.id === 'resy') return '← BEST';
      return result.restaurant.availability.time;
    }
    if (result.status === 'no_results') return 'No results';
    return '';
  };

  const availableCount = DATE_NIGHT_RESULTS.filter(r => r.status === 'available').length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
      >
        Checked 5 sources ({availableCount} with availability)
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-4 rounded-xl bg-[#0a1628] border border-white/20 shadow-xl z-50 space-y-2">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Sources Checked</div>
          <div className="space-y-1">
            {DATE_NIGHT_RESULTS.map(result => (
              <div key={result.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {result.status === 'available' ? (
                    <CheckIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <span className="text-white/40">—</span>
                  )}
                  <span className="text-white/70">{result.site}</span>
                </div>
                <span className={`${
                  result.id === 'resy' ? 'text-amber-400' :
                  result.status === 'available' ? 'text-white/50' :
                  'text-white/40'
                }`}>
                  {getStatusText(result)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ADJUST SEARCH VIEW
// =============================================================================

function AdjustSearchView() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const pivots = [
    { emoji: '🕐', label: 'Try later time', description: '8pm or after' },
    { emoji: '📍', label: 'Expand area', description: '10+ miles out' },
    { emoji: '🍕', label: 'Try other cuisines', description: 'Mexican, French, etc.' },
    { emoji: '💰', label: 'Change price range', description: '$$ to $$$$' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
      >
        Adjust search
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-xl bg-[#0a1628] border border-white/20 shadow-xl z-50 space-y-2">
          {pivots.map((pivot, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <span className="text-sm">{pivot.emoji}</span>
              <div>
                <div className="text-white/80 text-xs">{pivot.label}</div>
                <div className="text-white/40 text-[10px]">{pivot.description}</div>
              </div>
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-colors">
              Modify
            </button>
            <button className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-colors">
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function DateNightCascadePage() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    partySize: 2,
    atmosphere: 'romantic',
    priceRange: '$$$',
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  // Get alternative results (not the best one)
  const alternativeResults = DATE_NIGHT_RESULTS.filter(
    r => r.status === 'available' && r.id !== 'resy'
  );

  const getMockResult = useCallback((laneId: string): RestaurantResult | undefined => {
    return DATE_NIGHT_RESULTS.find(r => r.id === laneId);
  }, []);

  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => {
    setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  // Auto-select active lanes as they progress
  useEffect(() => {
    if (selectedLaneId) return;

    const activeLane = lanes.find(l =>
      !['pending', 'complete'].includes(l.status)
    );
    if (activeLane) {
      setSelectedLaneId(activeLane.id);
    }
  }, [lanes, selectedLaneId]);

  // Initialize demo (show thinking, then filters)
  const startDemo = useCallback(() => {
    setPhase('ready');
    setLanes([]);
    setSelectedLaneId(null);
    setFiltersExpanded(true);
    setSourcesExpanded(true);
    setIsThinking(true);
    setShowFilters(false);

    // After thinking, show the filters
    setTimeout(() => {
      setIsThinking(false);
      setShowFilters(true);
    }, 1500);
  }, []);

  // Handle search start - collapse filters and begin searching
  const handleStartSearch = useCallback(() => {
    setFiltersExpanded(false);
    setPhase('analyzing');

    setTimeout(() => {
      setPhase('spawning');

      const allLanes: DemoLane[] = LANES_DATA.map(l => ({
        ...l,
        status: 'spawning' as LaneStatus,
        progress: 0,
        currentAction: 'Starting browser...',
      }));
      setLanes(allLanes);
      setSelectedLaneId(allLanes[0].id);

      setTimeout(() => {
        setPhase('running');

        allLanes.forEach((lane, i) => {
          const mockResult = getMockResult(lane.id);
          const baseDelay = 200 + (i * 400);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'navigating',
              progress: 25,
              currentAction: 'Searching restaurants...'
            });
          }, baseDelay);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'extracting',
              progress: 60,
              currentAction: 'Checking availability...'
            });
          }, baseDelay + 800);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'extracting',
              progress: 85,
              currentAction: 'Getting details...'
            });
          }, baseDelay + 1400);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'complete',
              progress: 100,
              result: mockResult,
            });
          }, baseDelay + 2000);
        });

        // Complete after all lanes finish
        setTimeout(() => {
          setPhase('synthesizing');
          setTimeout(() => setPhase('complete'), 800);
        }, 3500);
      }, 400);
    }, 800);
  }, [getMockResult, updateLane]);

  // Auto-start
  useEffect(() => {
    const timer = setTimeout(startDemo, 500);
    return () => clearTimeout(timer);
  }, [startDemo]);

  // Auto-scroll to results when complete
  useEffect(() => {
    if (phase === 'complete' && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [phase]);

  const totalComplete = lanes.filter(l => l.status === 'complete').length;
  const isSearching = phase !== 'idle' && phase !== 'complete' && phase !== 'ready';

  return (
    <div className="min-h-screen">
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      <div className="content">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <MinoLogo />
          <button onClick={startDemo} className="text-white/50 hover:text-white/70 transition-colors text-sm">
            Restart
          </button>
        </header>

        <main className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Timeline container */}
            <div className="relative">
              {/* Timeline vertical line - only show when there's more than one step */}
              {(isSearching || phase === 'complete') && (
                <div className="absolute left-[13px] top-6 bottom-28 w-px bg-white/10" />
              )}

              {/* Step 1: Query + Filters */}
              <div className="relative flex gap-4 mb-6">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    phase === 'ready' || phase === 'idle'
                      ? 'border-amber-400 bg-amber-400'
                      : 'border-white/20 bg-white/10'
                  }`}>
                    {(phase !== 'ready' && phase !== 'idle') ? (
                      <CheckIcon className="w-3.5 h-3.5 text-white/70" />
                    ) : (
                      <SparklesIcon className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 glass-card overflow-hidden">
                  {/* Query header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Finding</div>
                    <div className="text-white text-lg">"{DATE_NIGHT_QUERY}"</div>
                  </div>

                  {/* Search Filters Section */}
                  <SearchFiltersSection
                    isExpanded={filtersExpanded}
                    onToggle={() => setFiltersExpanded(!filtersExpanded)}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onStartSearch={handleStartSearch}
                    isSearching={isSearching}
                    isThinking={isThinking}
                    showFilters={showFilters}
                  />
                </div>
              </div>

              {/* Step 2: Sources + Browser */}
              {(isSearching || phase === 'complete') && (
              <div className="relative flex gap-4 mb-6 animate-fadeIn">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    isSearching
                      ? 'border-amber-400 bg-amber-400'
                      : 'border-white/20 bg-white/10'
                  }`}>
                    {isSearching ? (
                      <SearchIcon className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <CheckIcon className="w-3.5 h-3.5 text-white/70" />
                    )}
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 glass-card overflow-hidden">
                  {/* Card header - clickable to toggle */}
                  <button
                    onClick={() => phase === 'complete' && setSourcesExpanded(!sourcesExpanded)}
                    className={`w-full flex items-center justify-between px-4 py-3 ${sourcesExpanded ? 'border-b border-white/10' : ''} ${phase === 'complete' ? 'hover:bg-white/[0.02] cursor-pointer' : ''} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/80 font-medium">
                        {phase === 'complete' ? 'Search Complete' : 'Searching Sources'}
                      </span>
                      {!sourcesExpanded && phase === 'complete' && (
                        <span className="text-white/40 text-sm">
                          • {lanes.length} sources checked • {lanes.filter(l => l.result?.restaurant).length} found availability
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-sm">
                        {totalComplete} of {lanes.length}
                      </span>
                      {phase === 'complete' && (
                        <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </button>

                  {/* Main content - Sources + Browser (collapsible) */}
                  {sourcesExpanded && (
                  <div className="flex" style={{ height: '55vh', maxHeight: '500px' }}>
                    {/* Left: Sources list */}
                    <div className="w-56 p-4 border-r border-white/10 overflow-y-auto">
                      <SourcesList
                        lanes={lanes}
                        selectedLaneId={selectedLaneId}
                        onSelectLane={setSelectedLaneId}
                      />
                    </div>

                    {/* Right: Browser preview */}
                    <div className="flex-1 relative overflow-hidden">
                      {selectedLaneId && lanes.find(l => l.id === selectedLaneId) ? (
                        <BrowserWindow
                          lane={lanes.find(l => l.id === selectedLaneId)!}
                        />
                      ) : lanes.length > 0 ? (
                        <BrowserWindow
                          lane={lanes[0]}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1a]">
                          <div className="text-center">
                            <LoaderIcon className="w-6 h-6 text-amber-400/60 animate-spin mx-auto mb-2" />
                            <p className="text-white/40 text-sm">Starting...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>
              )}

              {/* Step 3: Results */}
              {phase === 'complete' && (
              <div ref={resultsRef} className="relative flex gap-4 mb-6 animate-fadeIn">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full border-2 border-green-400 bg-green-400 flex items-center justify-center">
                    <StarIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 glass-card overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-white/80 font-medium">Results</span>
                    </div>
                    <span className="text-white/40 text-sm">
                      {DATE_NIGHT_RESULTS.filter(r => r.status === 'available').length} reservations available
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="p-4 space-y-6">
                    {/* Hero Result */}
                    <HeroResultCard onBook={() => setShowSignUp(true)} />

                    {/* Other Options - horizontal carousel */}
                    {alternativeResults.length > 0 && (
                      <div className="space-y-3">
                        <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">
                          Other Options
                        </h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                          {alternativeResults.map(result => (
                            <AlternativeResultCard key={result.id} result={result} onBook={() => setShowSignUp(true)} />
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
              )}

              {/* Step 4: What's Next */}
              {phase === 'complete' && (
              <div className="relative flex gap-4 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center">
                    <ArrowRightIcon className="w-3.5 h-3.5 text-white/70" />
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 glass-card p-4">
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-3">What's Next</div>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={startDemo}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      🔄 New Search
                    </button>
                    <button
                      onClick={() => setShowSignUp(true)}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      🔔 Set Alert
                    </button>
                    <button
                      onClick={() => setShowSignUp(true)}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      💾 Save Results
                    </button>
                    <button
                      onClick={() => setShowSignUp(true)}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      ↗ Share
                    </button>
                  </div>
                </div>
              </div>
              )}

            </div>
            {/* End timeline container */}
          </div>
        </main>
      </div>

      {/* Sign Up Overlay */}
      {showSignUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSignUp(false)}
          />
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0c1e38] border border-white/20 shadow-2xl">
            <button
              onClick={() => setShowSignUp(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🐟</span>
              </div>
              <h2 className="text-xl font-semibold text-white">Sign up for Mino</h2>
              <p className="text-white/50 text-sm mt-1">
                Save your reservations, get alerts, and more
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 px-4 rounded-xl bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button className="w-full py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/>
                </svg>
                Continue with Apple
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#0c1e38] text-white/40 text-xs">or</span>
                </div>
              </div>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
              />

              <button className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors">
                Continue with Email
              </button>
            </div>

            <p className="text-white/30 text-xs text-center mt-4">
              By signing up, you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
