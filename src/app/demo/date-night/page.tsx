'use client';

import React from 'react';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { CheckIcon, MapPinIcon, ClockIcon, StarIcon, ChevronDownIcon } from '@/components/icons';
import {
  DATE_NIGHT_QUERY,
  DATE_NIGHT_RESULTS,
  DATE_NIGHT_BEST_RESULT,
  DATE_NIGHT_SYNTHESIS,
  formatPriceLevel,
  type RestaurantResult,
} from '@/lib/mock-data';

// =============================================================================
// HERO RESULT CARD
// =============================================================================

function HeroResultCard() {
  const result = DATE_NIGHT_BEST_RESULT;
  const synthesis = DATE_NIGHT_SYNTHESIS;

  if (!result.restaurant) return null;

  return (
    <div className="glass-card overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-56 bg-gradient-to-br from-amber-900/40 to-rose-900/40 flex items-center justify-center">
        {/* Placeholder for actual restaurant image */}
        <div className="text-7xl">🍝</div>
        {/* Vibe overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex flex-wrap gap-2">
            {result.restaurant.vibe.map((v, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-white/20 text-white/90 text-xs backdrop-blur-sm">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {synthesis.headline}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-400">
                <StarIcon className="w-4 h-4 fill-current" />
                <span className="font-medium">{synthesis.rating}</span>
              </div>
              <span className="text-white/30">•</span>
              <span className="text-white/60">{formatPriceLevel(synthesis.priceLevel as 1|2|3|4)}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/60">{synthesis.cuisine}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {synthesis.subtitle}
            </div>
            <div className="text-white/50 text-sm">
              Table for 2
            </div>
          </div>
        </div>

        {/* Pull Quote */}
        <blockquote className="text-white/80 text-lg italic border-l-2 border-amber-500/50 pl-4">
          "{synthesis.pullQuote}"
        </blockquote>

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

        {/* Location Info */}
        <div className="flex items-center gap-3 text-white/60">
          <MapPinIcon className="w-4 h-4" />
          <span>{result.restaurant.address}</span>
          <span className="text-white/30">•</span>
          <span>{result.restaurant.distance} mi away</span>
        </div>

        {/* Primary Action */}
        <button className="w-full py-4 px-6 rounded-xl bg-amber-500 text-black font-semibold text-lg hover:bg-amber-400 transition-colors">
          {synthesis.primaryAction.label}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// ALTERNATIVE RESULT CARD
// =============================================================================

function AlternativeResultCard({ alt }: { alt: typeof DATE_NIGHT_SYNTHESIS.alternatives[0] }) {
  return (
    <div className="glass-card p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-amber-900/30 to-rose-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl">🍽️</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-lg">{alt.name}</span>
            <span className="text-white/40">{alt.time}</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm mt-0.5">
            <span className="text-amber-400 flex items-center gap-0.5">
              <StarIcon className="w-3 h-3 fill-current" />
              {alt.rating}
            </span>
            <span>•</span>
            <span>{formatPriceLevel(alt.priceLevel as 1|2|3|4)}</span>
          </div>
          <div className="text-white/40 text-sm mt-1 italic">
            "{alt.pullQuote}"
          </div>
          <div className="text-blue-400/80 text-sm mt-1">
            → {alt.tradeoff}
          </div>
        </div>

        {/* Action */}
        <button className="py-2 px-4 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex-shrink-0">
          Reserve
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

  const getStatusIcon = (result: RestaurantResult) => {
    switch (result.status) {
      case 'available':
        return <CheckIcon className="w-4 h-4 text-green-400" />;
      case 'no_results':
        return <span className="text-white/40">—</span>;
      default:
        return <span className="text-white/40 text-xs">!</span>;
    }
  };

  const getStatusText = (result: RestaurantResult) => {
    if (result.status === 'available' && result.restaurant) {
      return `${result.restaurant.name} — ${result.restaurant.availability.time}`;
    }
    return result.statusMessage || '';
  };

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <div>
            <div className="text-white font-medium text-left">Checked 5 Sources</div>
            <div className="text-white/50 text-sm text-left">
              {DATE_NIGHT_RESULTS.filter(r => r.status === 'available').length} with availability
            </div>
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 p-4">
          <div className="space-y-2">
            {DATE_NIGHT_RESULTS.map(result => (
              <div key={result.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result)}
                  <span className="text-white/70">{result.site}</span>
                </div>
                <span className={`text-sm ${
                  result.status === 'available' ? 'text-white/50' : 'text-white/40'
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
// PIVOT SUGGESTIONS - NOT WHAT YOU'RE LOOKING FOR?
// =============================================================================

function PivotSuggestions() {
  const pivots = [
    {
      emoji: '🍣',
      label: 'Japanese at 7pm',
      query: 'Japanese restaurant in Dallas, 7pm for 2',
    },
    {
      emoji: '🥩',
      label: 'Steakhouse at 7pm',
      query: 'Steakhouse in Dallas, 7pm for 2',
    },
    {
      emoji: '🌮',
      label: 'Mexican at 7pm',
      query: 'Upscale Mexican in Dallas, 7pm for 2',
    },
    {
      emoji: '🍷',
      label: 'Wine bar nearby',
      query: 'Wine bar in Dallas with small plates, 7pm',
    },
  ];

  return (
    <div className="glass-card p-5">
      <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
        Not feeling Italian?
      </div>
      <div className="grid grid-cols-2 gap-2">
        {pivots.map((pivot, i) => (
          <button
            key={i}
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-xl">{pivot.emoji}</span>
            <span className="text-white/80 text-sm">{pivot.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// RECURRING WORKFLOW SETUP
// =============================================================================

function RecurringSetup() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="glass-card overflow-hidden border border-blue-500/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <span className="text-xl">🔄</span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-white font-medium">Make this a weekly thing?</div>
          <div className="text-white/50 text-sm">
            Every Friday at 5pm, Mino finds date night options for tonight
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div className="text-white/60 text-sm">
            Get personalized restaurant recommendations delivered to your phone every week — ready when you are.
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/50 text-sm">
              <ClockIcon className="w-4 h-4" />
              <span>Fridays at 5:00 PM</span>
              <button className="text-blue-400 hover:text-blue-300 ml-1">Change</button>
            </div>

            <button className="w-full py-3 px-4 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
              Set Up Weekly Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BOTTOM ACTIONS - WHERE TO GO FROM HERE
// =============================================================================

function BottomActions() {
  return (
    <div className="space-y-3 pt-4">
      <div className="text-center text-white/40 text-sm">Not what you need?</div>
      <div className="flex gap-3">
        <button className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors border border-white/10">
          Modify Search
        </button>
        <button className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors border border-white/10">
          Start Over
        </button>
      </div>
      <div className="text-center">
        <button className="text-blue-400/80 text-sm hover:text-blue-300 transition-colors">
          Tell us what went wrong →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function DateNightDemoPage() {
  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <MinoLogo />
          <div className="text-white/40 text-sm">Demo: Date Night Results</div>
        </header>

        {/* Main */}
        <main className="px-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Query Display */}
            <div className="glass-card p-4">
              <div className="text-white/50 text-xs uppercase tracking-wider mb-1">You searched</div>
              <div className="text-white text-lg">"{DATE_NIGHT_QUERY}"</div>
            </div>

            {/* Hero Result */}
            <HeroResultCard />

            {/* Other Options */}
            <div className="space-y-3">
              <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">
                Other Great Options
              </h2>
              {DATE_NIGHT_SYNTHESIS.alternatives.map(alt => (
                <AlternativeResultCard key={alt.id} alt={alt} />
              ))}
            </div>

            {/* Pivot Suggestions */}
            <PivotSuggestions />

            {/* Transparency */}
            <TransparencyView />

            {/* Recurring Setup */}
            <RecurringSetup />

            {/* Bottom Actions */}
            <BottomActions />
          </div>
        </main>
      </div>
    </div>
  );
}
