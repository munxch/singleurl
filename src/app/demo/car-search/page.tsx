'use client';

import React from 'react';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { CheckIcon, AlertTriangleIcon, MapPinIcon, PhoneIcon, ClockIcon, StarIcon, ChevronDownIcon } from '@/components/icons';
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
// HERO RESULT CARD
// =============================================================================

function HeroResultCard() {
  const result = CAR_SEARCH_BEST_RESULT;
  const synthesis = CAR_SEARCH_SYNTHESIS;

  if (!result.car || !result.dealer) return null;

  return (
    <div className="glass-card overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
        {/* Placeholder for actual car image */}
        <div className="text-6xl">🚗</div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>{result.car.color}</span>
            <span>•</span>
            <span>VIN: {result.car.vin?.slice(-6)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
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

        {/* Dealer Info */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
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
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 py-3.5 px-6 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
            {synthesis.primaryAction.label}
          </button>
          <button className="py-3.5 px-6 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
            <PhoneIcon className="w-4 h-4" />
            {synthesis.secondaryAction.label}
          </button>
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
        return { text: 'Over budget', color: 'text-amber-400' };
      case 'over_mileage':
        return { text: 'Over mileage', color: 'text-amber-400' };
      case 'no_carplay':
        return { text: 'No CarPlay', color: 'text-amber-400' };
      default:
        return null;
    }
  };

  const statusLabel = getStatusLabel();

  return (
    <div className="glass-card p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl">🚗</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">
              {result.car.year} {result.car.model} {result.car.trim}
            </span>
            {statusLabel && (
              <span className={`text-xs ${statusLabel.color}`}>
                • {statusLabel.text}
              </span>
            )}
          </div>
          <div className="text-white/50 text-sm mt-0.5">
            {formatMileage(result.car.mileage)} • {result.site}
          </div>
          {result.dealer && (
            <div className="flex items-center gap-2 text-white/40 text-xs mt-1">
              <MapPinIcon className="w-3 h-3" />
              {result.dealer.distance} mi
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-right">
          <div className="text-white font-semibold">
            {formatPrice(result.car.price)}
          </div>
          {result.status === 'success' && (
            <button className="text-blue-400 text-sm mt-1 hover:text-blue-300">
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TRANSPARENCY VIEW - WHAT WE CHECKED
// =============================================================================

function TransparencyView() {
  const wave1 = CAR_SEARCH_RESULTS.filter(r => r.wave === 1);
  const wave2 = CAR_SEARCH_RESULTS.filter(r => r.wave === 2);
  const [isExpanded, setIsExpanded] = React.useState(true);

  const getStatusText = (result: CarResult) => {
    switch (result.status) {
      case 'success':
        if (result.id === 'honda-dallas') return '← BEST MATCH';
        return result.car ? formatPrice(result.car.price) : '';
      case 'blocked':
        return 'Blocked — went to dealers instead';
      case 'over_budget':
        return 'Over budget';
      case 'over_mileage':
        return 'Over mileage';
      case 'no_carplay':
        return 'No CarPlay confirmed';
      case 'no_results':
        return 'No matching inventory';
      default:
        return '';
    }
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
            <div className="text-white font-medium text-left">Checked 10 Sources</div>
            <div className="text-white/50 text-sm text-left">
              {CAR_SEARCH_RESULTS.filter(r => r.status === 'success').length} with results,{' '}
              {CAR_SEARCH_RESULTS.filter(r => r.status === 'blocked').length} blocked
            </div>
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Wave 1 */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Initial Search</div>
            <div className="space-y-2">
              {wave1.map(result => (
                <div key={result.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={result.status} />
                    <span className="text-white/70">{result.site}</span>
                  </div>
                  <span className={`text-sm ${
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

          {/* Escalation Message */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-blue-300 text-sm">
              Carvana blocked us. Went deeper — searched local Honda dealerships near 75201.
            </div>
          </div>

          {/* Wave 2 */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Dealership Search</div>
            <div className="space-y-2">
              {wave2.map(result => (
                <div key={result.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={result.status} />
                    <span className="text-white/70">{result.site}</span>
                  </div>
                  <span className={`text-sm ${
                    result.id === 'honda-dallas' ? 'text-green-400 font-medium' :
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
// PIVOT SUGGESTIONS - NOT FINDING THE RIGHT FIT?
// =============================================================================

function PivotSuggestions() {
  const pivots = [
    {
      emoji: '💰',
      label: 'Raise budget to $30k',
      description: '12 more options available',
    },
    {
      emoji: '📍',
      label: 'Expand to 50 miles',
      description: '8 more dealers in range',
    },
    {
      emoji: '🚙',
      label: 'Try Honda Accord',
      description: 'Similar features, more space',
    },
    {
      emoji: '🔄',
      label: 'Drop Apple CarPlay',
      description: '6 more options under budget',
    },
  ];

  return (
    <div className="glass-card p-5">
      <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
        Not finding the right fit?
      </div>
      <div className="grid grid-cols-2 gap-2">
        {pivots.map((pivot, i) => (
          <button
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-xl">{pivot.emoji}</span>
            <div>
              <div className="text-white/80 text-sm">{pivot.label}</div>
              <div className="text-white/40 text-xs">{pivot.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// PRICE ALERT SETUP - RECURRING WORKFLOW
// =============================================================================

function PriceAlertSetup() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="glass-card overflow-hidden border border-green-500/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
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
        <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>

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

export default function CarSearchDemoPage() {
  const successResults = CAR_SEARCH_RESULTS.filter(
    r => r.status === 'success' && r.id !== 'honda-dallas'
  );
  const otherResults = CAR_SEARCH_RESULTS.filter(
    r => r.status !== 'success' && r.status !== 'blocked' && r.car
  );

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
          <div className="text-white/40 text-sm">Demo: Car Search Results</div>
        </header>

        {/* Main */}
        <main className="px-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Query Display */}
            <div className="glass-card p-4">
              <div className="text-white/50 text-xs uppercase tracking-wider mb-1">You searched</div>
              <div className="text-white text-lg">"{CAR_SEARCH_QUERY}"</div>
            </div>

            {/* Hero Result */}
            <HeroResultCard />

            {/* Other Matching Options */}
            {successResults.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">
                  Other Options That Match
                </h2>
                {successResults.map(result => (
                  <AlternativeResultCard key={result.id} result={result} />
                ))}
              </div>
            )}

            {/* Near Misses */}
            {otherResults.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider px-1">
                  Close But Not Quite
                </h2>
                {otherResults.map(result => (
                  <AlternativeResultCard key={result.id} result={result} />
                ))}
              </div>
            )}

            {/* Pivot Suggestions */}
            <PivotSuggestions />

            {/* Transparency */}
            <TransparencyView />

            {/* Price Alert Setup */}
            <PriceAlertSetup />

            {/* Bottom Actions */}
            <BottomActions />
          </div>
        </main>
      </div>
    </div>
  );
}
