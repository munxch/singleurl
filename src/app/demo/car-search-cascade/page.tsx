'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import {
  LoaderIcon,
  CheckCircleIcon,
  CheckIcon,
  AlertTriangleIcon,
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
  CAR_SEARCH_QUERY,
  CAR_SEARCH_RESULTS,
  CAR_SEARCH_BEST_RESULT,
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
  domain: string;
  status: LaneStatus;
  progress: number;
  wave: 1 | 2;
  result?: CarResult;
  currentAction?: string;
}

type DemoPhase =
  | 'idle'
  | 'ready'
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
// SEARCH FILTERS SECTION (INLINE/COLLAPSIBLE)
// =============================================================================

interface CarSearchFilters {
  condition: string;
  maxMileage: string;
  color: string;
  zipcode: string;
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
  filters: CarSearchFilters;
  onFiltersChange: (filters: CarSearchFilters) => void;
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
              <span className="px-2 py-0.5 rounded bg-white/10">{filters.condition}</span>
              <span className="px-2 py-0.5 rounded bg-white/10">{filters.maxMileage} mi</span>
              <span className="px-2 py-0.5 rounded bg-white/10">{filters.zipcode}</span>
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
          {/* Condition */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Condition</div>
            <div className="flex gap-2">
              {[
                { id: 'new', label: 'New' },
                { id: 'used', label: 'Used' },
                { id: 'cpo', label: 'Certified Pre-Owned' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onFiltersChange({ ...filters, condition: opt.id })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filters.condition === opt.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Mileage */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Max mileage</div>
            <div className="flex gap-2 flex-wrap">
              {['30k', '50k', '75k', '100k+'].map(miles => (
                <button
                  key={miles}
                  onClick={() => onFiltersChange({ ...filters, maxMileage: miles })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filters.maxMileage === miles
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {miles} mi
                </button>
              ))}
            </div>
          </div>

          {/* Color Preference */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Color preference</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'any', label: 'Any color' },
                { id: 'white', label: '⚪ White' },
                { id: 'black', label: '⚫ Black' },
                { id: 'silver', label: '🔘 Silver' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onFiltersChange({ ...filters, color: opt.id })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filters.color === opt.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zipcode */}
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Your location</div>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 max-w-[160px]">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={filters.zipcode}
                  onChange={(e) => onFiltersChange({ ...filters, zipcode: e.target.value })}
                  placeholder="Zipcode"
                  maxLength={5}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <span className="text-white/40 text-sm">Dallas, TX area</span>
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

const WAVE1_LANES: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'cargurus', site: 'CarGurus', domain: 'cargurus.com', wave: 1 },
  { id: 'carvana', site: 'Carvana', domain: 'carvana.com', wave: 1 },
  { id: 'autotrader', site: 'AutoTrader', domain: 'autotrader.com', wave: 1 },
  { id: 'cars-com', site: 'Cars.com', domain: 'cars.com', wave: 1 },
  { id: 'carmax', site: 'CarMax', domain: 'carmax.com', wave: 1 },
  { id: 'fb-marketplace', site: 'FB Marketplace', domain: 'facebook.com/marketplace', wave: 1 },
];

const WAVE2_LANES: Omit<DemoLane, 'status' | 'progress' | 'currentAction'>[] = [
  { id: 'honda-dallas', site: 'Honda of Dallas', domain: 'hondaofdallas.com', wave: 2 },
  { id: 'autonation', site: 'AutoNation Honda', domain: 'autonationhonda.com', wave: 2 },
  { id: 'park-place', site: 'Park Place Honda', domain: 'parkplacehonda.com', wave: 2 },
  { id: 'craigslist-dallas', site: 'Craigslist Dallas', domain: 'dallas.craigslist.org', wave: 2 },
];

// =============================================================================
// BROWSER WINDOW COMPONENT
// =============================================================================

function BrowserWindow({
  lane,
  isSelected,
}: {
  lane: DemoLane;
  isSelected?: boolean;
}) {
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
          {lane.status === 'blocked' && <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />}
          {!['complete', 'blocked', 'pending'].includes(lane.status) && (
            <LoaderIcon className="w-4 h-4 animate-spin text-cyan-400/70" />
          )}
        </div>
      </div>

      {/* Browser content */}
      <div className="h-full p-4 relative">
        {/* Site header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-base">{lane.wave === 2 ? '🏢' : '🚗'}</span>
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">{lane.site}</div>
            <div className="text-white/40 text-xs">Inventory search</div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-8 bg-white/5 rounded border border-white/10" />
          <div className="w-16 h-8 bg-blue-500/20 rounded" />
        </div>

        {/* Result cards */}
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 p-3 bg-white/[0.02] rounded border border-white/5">
              <div className="w-16 h-12 bg-white/5 rounded flex items-center justify-center">
                <span className="text-lg opacity-30">🚗</span>
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
            {lane.status === 'blocked' ? (
              <div className="text-center">
                <AlertTriangleIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-400 font-medium text-sm">Blocked</p>
              </div>
            ) : (
              <div className="text-center">
                <LoaderIcon className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                <p className="text-white/80 text-sm">{lane.currentAction}</p>
              </div>
            )}
          </div>
        )}

        {lane.status === 'complete' && lane.result?.car && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white font-bold text-xl">{formatPrice(lane.result.car.price)}</p>
              <p className="text-white/50 text-sm mt-1">
                {lane.result.car.year} {lane.result.car.model}
              </p>
            </div>
          </div>
        )}

        {lane.status === 'complete' && !lane.result?.car && lane.result && (
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
      case 'blocked':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />;
      case 'pending':
        return <div className="w-3 h-3 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className="w-4 h-4 animate-spin text-blue-400/70" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all overflow-hidden
        ${isSelected
          ? 'ring-1 ring-cyan-400/50 bg-transparent'
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
        {(lane.status === 'complete' || lane.status === 'blocked') && (
          <span className={`text-xs ${
            lane.status === 'blocked' ? 'text-amber-400/80' :
            lane.result?.car ? 'text-green-400/80' : 'text-white/40'
          }`}>
            {lane.status === 'blocked' ? 'Blocked' :
             lane.result?.car ? 'Found 1' : 'No match'}
          </span>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// SOURCES LIST COMPONENT
// =============================================================================

interface SourcesListProps {
  lanes: DemoLane[];
  selectedLaneId: string | null;
  onSelectLane: (id: string) => void;
  isRunning: boolean;
  totalComplete: number;
  showEscalation: boolean;
  phase: DemoPhase;
  zipcode: string;
}

function SourcesList({
  lanes,
  selectedLaneId,
  onSelectLane,
  isRunning,
  totalComplete,
  showEscalation,
  phase,
  zipcode,
}: SourcesListProps) {
  const wave1 = lanes.filter(l => l.wave === 1);
  const wave2 = lanes.filter(l => l.wave === 2);

  return (
    <div className="space-y-4">

      {/* Wave 1 */}
      {wave1.length > 0 && (
        <div>
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
            {wave2.length > 0 ? 'Initial Search' : 'Sources'}
          </div>
          <div className="space-y-1">
            {wave1.map(lane => (
              <SourceRow
                key={lane.id}
                lane={lane}
                isSelected={selectedLaneId === lane.id}
                onClick={() => onSelectLane(lane.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Escalation message - intelligent decision */}
      {showEscalation && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 animate-fadeIn">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🧠</span>
            <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Mino is thinking</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Carvana blocked my search. Finding Honda dealers with Civics for sale near <span className="text-white font-medium">{zipcode}</span>...
          </p>
        </div>
      )}

      {/* Wave 2 */}
      {wave2.length > 0 && (
        <div className="animate-fadeIn">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🏢</span>
            <span>Direct from Dealers</span>
          </div>
          <div className="space-y-1">
            {wave2.map(lane => (
              <SourceRow
                key={lane.id}
                lane={lane}
                isSelected={selectedLaneId === lane.id}
                onClick={() => onSelectLane(lane.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BEST MATCH (subtle)
// =============================================================================

function BestMatchBanner({ result }: { result: CarResult | null }) {
  if (!result?.car) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/5 border-t border-white/5">
      <span className="text-base">🏆</span>
      <div className="flex-1 min-w-0">
        <span className="text-white/60 text-sm">Best: </span>
        <span className="text-cyan-400/90 text-sm font-medium">
          {formatPrice(result.car.price)} at {result.site}
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// HERO RESULT CARD
// =============================================================================

function HeroResultCard() {
  const result = CAR_SEARCH_BEST_RESULT;
  const synthesis = CAR_SEARCH_SYNTHESIS;

  if (!result.car || !result.dealer) return null;

  return (
    <div className="space-y-5">
      {/* Hero Image */}
      <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
        <div className="text-6xl">🚗</div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>{result.car.color}</span>
            <span>•</span>
            <span>VIN: {result.car.vin?.slice(-6)}</span>
          </div>
        </div>
      </div>

      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {result.car.year} {result.car.make} {result.car.model} {result.car.trim}
            </h1>
            <div className="text-white/60 mt-1">
              at {result.dealer.name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatPrice(result.car.price)}
            </div>
            <div className="text-white/50 text-sm">
              {formatMileage(result.car.mileage)}
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            Apple CarPlay
          </span>
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            Under Budget
          </span>
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            Under Mileage
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            Clean Title
          </span>
        </div>

        {/* Why Mino Picked This */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
            Why Mino Picked This
          </div>
          <ul className="space-y-2">
            {synthesis.rationale.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-white/80">
                <span className="text-green-400 mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Dealer Card with Call + Test Drive */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
          {/* Dealer Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
              🏢
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{result.dealer.name}</div>
              <div className="flex items-center gap-3 text-white/50 text-sm mt-1">
                <span className="flex items-center gap-1">
                  <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                  {result.dealer.rating} ({result.dealer.reviewCount})
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {result.dealer.distance} mi
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {result.dealer.hours}
                </span>
              </div>
            </div>
            <button className="py-2.5 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Call
            </button>
          </div>

          {/* Test Drive Times */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/50 text-xs uppercase tracking-wider font-medium">
                Schedule Test Drive
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Today 2pm', 'Today 4pm', 'Tomorrow 10am', 'Tomorrow 2pm', 'Sat 11am'].map((time, i) => (
                <button
                  key={i}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    i === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}

// =============================================================================
// ALTERNATIVE RESULT CARD
// =============================================================================

function AlternativeResultCard({ result }: { result: CarResult }) {
  if (!result.car) return null;

  const getStatusLabel = () => {
    switch (result.status) {
      case 'over_budget':
        return { text: 'Over budget', color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'over_mileage':
        return { text: 'Over mileage', color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'no_carplay':
        return { text: 'No CarPlay', color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'success':
        return { text: 'Runner up', color: 'text-green-400', bg: 'bg-green-500/10' };
      default:
        return null;
    }
  };

  const statusLabel = getStatusLabel();

  return (
    <div className="w-56 flex-shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors">
      {/* Thumbnail */}
      <div className="w-full h-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-3">
        <span className="text-4xl">🚗</span>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="text-white font-medium text-sm truncate">
          {result.car.year} {result.car.model} {result.car.trim}
        </div>
        <div className="text-white/50 text-xs">
          {formatMileage(result.car.mileage)} • {result.site}
        </div>
        {statusLabel && (
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${statusLabel.color} ${statusLabel.bg}`}>
            {statusLabel.text}
          </span>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="text-white font-semibold">
            {formatPrice(result.car.price)}
          </div>
          {result.dealer && (
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <MapPinIcon className="w-3 h-3" />
              {result.dealer.distance} mi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// STATUS ICON COMPONENT
// =============================================================================

function StatusIcon({ status }: { status: CarResult['status'] }) {
  switch (status) {
    case 'success':
      return <CheckIcon className="w-4 h-4 text-green-400" />;
    case 'blocked':
      return <AlertTriangleIcon className="w-4 h-4 text-amber-400" />;
    case 'no_results':
      return <span className="text-white/40">—</span>;
    default:
      return <span className="text-white/40 text-xs">!</span>;
  }
}

// =============================================================================
// TRANSPARENCY VIEW - WHAT WE CHECKED
// =============================================================================

function TransparencyView() {
  const wave1 = CAR_SEARCH_RESULTS.filter(r => r.wave === 1);
  const wave2 = CAR_SEARCH_RESULTS.filter(r => r.wave === 2);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getStatusText = (result: CarResult) => {
    switch (result.status) {
      case 'success':
        if (result.id === 'honda-dallas') return '← BEST';
        return result.car ? formatPrice(result.car.price) : '';
      case 'blocked':
        return 'Blocked';
      case 'over_budget':
        return 'Over budget';
      case 'over_mileage':
        return 'Over mileage';
      case 'no_carplay':
        return 'No CarPlay';
      case 'no_results':
        return 'No results';
      default:
        return '';
    }
  };

  const successCount = CAR_SEARCH_RESULTS.filter(r => r.status === 'success').length;
  const blockedCount = CAR_SEARCH_RESULTS.filter(r => r.status === 'blocked').length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
      >
        Checked 10 sources ({successCount} results, {blockedCount} blocked)
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-80 p-4 rounded-xl bg-[#0a1628] border border-white/20 shadow-xl z-50 space-y-3">
          {/* Wave 1 */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Initial Search</div>
            <div className="space-y-1">
              {wave1.map(result => (
                <div key={result.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={result.status} />
                    <span className="text-white/70">{result.site}</span>
                  </div>
                  <span className={`${
                    result.status === 'success' ? 'text-white/50' :
                    result.status === 'blocked' ? 'text-amber-400/80' :
                    'text-white/40'
                  }`}>
                    {getStatusText(result)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation */}
          <div className="text-blue-400/80 text-xs">
            Carvana blocked → searched local dealers
          </div>

          {/* Wave 2 */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Dealership Search</div>
            <div className="space-y-1">
              {wave2.map(result => (
                <div key={result.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={result.status} />
                    <span className="text-white/70">{result.site}</span>
                  </div>
                  <span className={`${
                    result.id === 'honda-dallas' ? 'text-green-400' :
                    result.status === 'success' ? 'text-white/50' :
                    'text-white/40'
                  }`}>
                    {getStatusText(result)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ADJUST SEARCH VIEW - Subtle footnote with popover
// =============================================================================

function AdjustSearchView() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const pivots = [
    { emoji: '💰', label: 'Raise budget to $30k', description: '12 more options' },
    { emoji: '📍', label: 'Expand to 50 miles', description: '8 more dealers' },
    { emoji: '🚙', label: 'Try Honda Accord', description: 'More space' },
    { emoji: '🔄', label: 'Drop Apple CarPlay', description: '6 more options' },
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
// PRICE ALERT SETUP
// =============================================================================

function PriceAlertSetup() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-green-500/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="text-xl">🔔</span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-white font-medium">Watch for new listings?</div>
          <div className="text-white/50 text-sm">
            Get alerted when new Civics under $25k hit the market
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-green-400/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div className="text-white/60 text-sm">
            Mino checks dealer inventory daily and texts you when a matching car appears — before it hits the aggregators.
          </div>

          <div className="p-3 rounded-lg bg-white/5 space-y-2">
            <div className="text-white/50 text-xs uppercase tracking-wider">Watching for:</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">Honda Civic</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">Under $25k</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">Under 50k mi</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">Apple CarPlay</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">Dallas area</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="tel"
              placeholder="Your phone number"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
            />
            <button className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 transition-colors">
              Start Watching
            </button>
            <div className="text-center text-white/40 text-xs">
              Usually finds 2-3 new listings per week
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function CarSearchCascadePage() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [bestSoFar, setBestSoFar] = useState<CarResult | null>(null);
  const [showEscalation, setShowEscalation] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CarSearchFilters>({
    condition: 'used',
    maxMileage: '50k',
    color: 'any',
    zipcode: '75201',
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  // Get filtered results for display
  const successResults = CAR_SEARCH_RESULTS.filter(
    r => r.status === 'success' && r.id !== 'honda-dallas'
  );
  const otherResults = CAR_SEARCH_RESULTS.filter(
    r => r.status !== 'success' && r.status !== 'blocked' && r.car
  );

  const getMockResult = useCallback((laneId: string): CarResult | undefined => {
    return CAR_SEARCH_RESULTS.find(r => r.id === laneId);
  }, []);

  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => {
    setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);


  // Auto-select active lanes as they progress
  useEffect(() => {
    if (selectedLaneId) return; // Don't auto-select if user has selected

    const activeLane = lanes.find(l =>
      !['pending', 'complete', 'blocked'].includes(l.status)
    );
    if (activeLane) {
      setSelectedLaneId(activeLane.id);
    }
  }, [lanes, selectedLaneId]);

  // Initialize demo (show thinking, then filters)
  const startDemo = useCallback(() => {
    setPhase('ready');
    setLanes([]);
    setBestSoFar(null);
    setShowEscalation(false);
    setSelectedLaneId(null);
    setFiltersExpanded(true);
    setSourcesExpanded(true);
    setShowFilters(false);
    setIsThinking(true);

    // Show thinking for 1.5s, then reveal filters
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
      setPhase('spawning_wave1');

      const wave1: DemoLane[] = WAVE1_LANES.map(l => ({
        ...l,
        status: 'spawning' as LaneStatus,
        progress: 0,
        currentAction: 'Starting browser...',
      }));
      setLanes(wave1);
      setSelectedLaneId(wave1[0].id);

      setTimeout(() => {
        setPhase('running_wave1');

        wave1.forEach((lane, i) => {
          const mockResult = getMockResult(lane.id);
          const isBlocked = mockResult?.status === 'blocked';
          const baseDelay = 200 + (i * 600);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'navigating',
              progress: 25,
              currentAction: 'Navigating to search...'
            });
          }, baseDelay);

          if (isBlocked) {
            setTimeout(() => {
              updateLane(lane.id, {
                status: 'blocked',
                progress: 40,
                result: mockResult,
              });
            }, baseDelay + 2500);
          } else {
            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 60,
                currentAction: 'Searching inventory...'
              });
            }, baseDelay + 1800);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'complete',
                progress: 100,
                result: mockResult,
              });

              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => {
                  if (!prev?.car || mockResult.car!.price < prev.car.price) {
                    return mockResult;
                  }
                  return prev;
                });
              }
            }, baseDelay + 3200);
          }
        });

        setTimeout(() => setPhase('escalation_pause'), 6000);
      }, 500);
    }, 1200);
  }, [getMockResult, updateLane]);

  // Handle escalation phases
  useEffect(() => {
    if (phase === 'escalation_pause') {
      setTimeout(() => {
        setPhase('escalation_message');
        setShowEscalation(true);
      }, 1000);
    }

    if (phase === 'escalation_message') {
      setTimeout(() => {
        setPhase('spawning_wave2');

        const wave2: DemoLane[] = WAVE2_LANES.map(l => ({
          ...l,
          status: 'spawning' as LaneStatus,
          progress: 0,
          currentAction: 'Starting browser...',
        }));
        setLanes(prev => [...prev, ...wave2]);
        setSelectedLaneId(wave2[0].id);

        setTimeout(() => {
          setPhase('running_wave2');

          wave2.forEach((lane, i) => {
            const mockResult = getMockResult(lane.id);
            const baseDelay = 400 + (i * 500);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'navigating',
                progress: 30,
                currentAction: 'Navigating to dealer...'
              });
            }, baseDelay);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 65,
                currentAction: 'Checking inventory...'
              });
            }, baseDelay + 1200);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'complete',
                progress: 100,
                result: mockResult,
              });

              if (mockResult?.status === 'success' && mockResult.car) {
                setBestSoFar(prev => {
                  if (!prev?.car || mockResult.car!.price < prev.car.price) {
                    return mockResult;
                  }
                  return prev;
                });
              }
            }, baseDelay + 2400);
          });

          setTimeout(() => {
            setPhase('synthesizing');
            setTimeout(() => setPhase('complete'), 1200);
          }, 4500);
        }, 600);
      }, 2000);
    }
  }, [phase, getMockResult, updateLane]);

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

  const totalComplete = lanes.filter(l => l.status === 'complete' || l.status === 'blocked').length;
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
                      ? 'border-cyan-400 bg-cyan-400'
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
                    <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Searching</div>
                    <div className="text-white text-lg">"{CAR_SEARCH_QUERY}"</div>
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
                      ? 'border-cyan-400 bg-cyan-400'
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
                          • {lanes.length} sources checked • {lanes.filter(l => l.result?.car).length} matches found
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

                  {/* Main content (collapsible) */}
                  {sourcesExpanded && (
                  <div className="flex" style={{ height: '55vh', maxHeight: '500px' }}>
                    {/* Left: Sources list */}
                    <div className="w-72 p-4 border-r border-white/10 overflow-y-auto">
                      <SourcesList
                        lanes={lanes}
                        selectedLaneId={selectedLaneId}
                        onSelectLane={setSelectedLaneId}
                        isRunning={isSearching}
                        totalComplete={totalComplete}
                        showEscalation={showEscalation}
                        phase={phase}
                        zipcode={filters.zipcode}
                      />
                    </div>

                    {/* Right: Browser preview */}
                    <div className="flex-1 relative overflow-hidden">
                      {selectedLaneId && lanes.find(l => l.id === selectedLaneId) ? (
                        <BrowserWindow
                          lane={lanes.find(l => l.id === selectedLaneId)!}
                          isSelected={true}
                        />
                      ) : lanes.length > 0 ? (
                        <BrowserWindow
                          lane={lanes[0]}
                          isSelected={true}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1a]">
                          <div className="text-center">
                            <LoaderIcon className="w-6 h-6 text-cyan-400/60 animate-spin mx-auto mb-2" />
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
                      {CAR_SEARCH_RESULTS.filter(r => r.status === 'success').length} matches found
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="p-4 space-y-6">
                    {/* Hero Result */}
                    <HeroResultCard />

                    {/* Other Options - horizontal carousel */}
                    {(successResults.length > 0 || otherResults.length > 0) && (
                      <div className="space-y-3">
                        <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">
                          More Options
                        </h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                          {[...successResults, ...otherResults].map(result => (
                            <AlternativeResultCard key={result.id} result={result} />
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
                      🔔 Price Alert
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
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🐟</span>
              </div>
              <h2 className="text-xl font-semibold text-white">Sign up for Mino</h2>
              <p className="text-white/50 text-sm mt-1">
                Save your searches, get alerts, and more
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
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
              />

              <button className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
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
