'use client';

import { AggregatedResults, Synthesis, NextAction, ExtractedResult, QueryIntent } from '@/types/orchestrator';
import { CheckCircleIcon, ExternalLinkIcon, StarIcon } from '@/components/icons';

interface ResultsAggregatorProps {
  results: AggregatedResults;
  synthesis: Synthesis | null;
  nextActions: NextAction[];
  onAction: (action: NextAction) => void;
}

export function ResultsAggregator({
  results,
  synthesis,
  nextActions,
  onAction,
}: ResultsAggregatorProps) {
  const { best, intent, subject } = results;

  // Get all results sorted by price
  const allResults = [...results.results]
    .filter(r => r.price !== undefined)
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity));

  // Generate rationale bullets based on the best result
  const rationale = generateRationale(best, allResults.slice(1), intent);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Query Context Header */}
      <div className="glass-panel p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-xl">🔍</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold truncate">{subject}</h1>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" />
              <span>Searched {results.totalSites} sites</span>
              <span>·</span>
              <span>{results.completedSites} found results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Deal - Hero Card */}
      {best && (
        <div className="glass-panel p-6 border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-4">
            <StarIcon className="w-4 h-4" />
            <span>Best Deal</span>
          </div>

          <div className="flex gap-6">
            {/* Product Image Placeholder */}
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{getProductEmoji(intent)}</span>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-white">${best.price?.toFixed(2)}</span>
                <span className="text-white/50">at {best.site}</span>
              </div>

              {/* Rationale */}
              <ul className="space-y-1 mb-4">
                {rationale.map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="text-green-400">✓</span>
                    {point}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {best.url && (
                <a
                  href={best.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all"
                >
                  {getActionButtonLabel(intent, best.site)}
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Results Grid */}
      <div>
        <h2 className="text-white/70 text-sm font-medium mb-3">All {allResults.length} results</h2>
        <div className="grid gap-3">
          {allResults.map((result, i) => (
            <ResultCard
              key={`${result.site}-${i}`}
              result={result}
              isBest={result === best}
              rank={i + 1}
            />
          ))}
        </div>
      </div>

      {/* Sites Checked */}
      <div className="glass-panel p-4">
        <div className="text-white/50 text-xs mb-3">Sites checked in this search:</div>
        <div className="flex flex-wrap gap-2">
          {allResults.map((result, i) => (
            <div
              key={`site-${result.site}-${i}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm"
            >
              <div className="w-5 h-5 rounded bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-xs">
                {result.site.charAt(0)}
              </div>
              <span className="text-white/70">{result.site}</span>
              {result === best && (
                <span className="text-green-400 text-xs">Best</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Result card component
function ResultCard({ result, isBest, rank }: { result: ExtractedResult; isBest: boolean; rank: number }) {
  return (
    <div className={`
      glass-panel p-4 flex items-center gap-4
      ${isBest ? 'border border-green-500/30 bg-green-500/5' : ''}
    `}>
      {/* Rank */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
        ${isBest ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}
      `}>
        {rank}
      </div>

      {/* Site icon placeholder */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-white/40">{result.site.charAt(0)}</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{result.site}</span>
          {isBest && (
            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 font-medium">
              Best Price
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-white/50 mt-0.5">
          {result.inStock === true && <span className="text-green-400">In stock</span>}
          {result.inStock === false && <span className="text-red-400">Out of stock</span>}
          {result.shipping && <span>{result.shipping}</span>}
          {result.deliveryEstimate && <span>{result.deliveryEstimate}</span>}
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <div className={`text-xl font-bold ${isBest ? 'text-green-400' : 'text-white'}`}>
          ${result.price?.toFixed(2)}
        </div>
      </div>

      {/* Action */}
      {result.url && (
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-sm transition-colors"
        >
          View
        </a>
      )}
    </div>
  );
}

// Helper: Get product emoji based on intent
function getProductEmoji(intent: QueryIntent): string {
  switch (intent) {
    case 'price_comparison':
      return '🎧';
    case 'vehicle_search':
      return '🚗';
    case 'travel':
      return '✈️';
    case 'real_estate':
      return '🏠';
    case 'quote_request':
      return '📋';
    case 'availability_check':
      return '📦';
    default:
      return '🔍';
  }
}

// Helper: Generate rationale bullets
function generateRationale(
  best: ExtractedResult | undefined,
  alternatives: ExtractedResult[],
  intent: QueryIntent
): string[] {
  if (!best) return [];

  const points: string[] = [];

  // Price comparison
  if (best.price && alternatives.length > 0) {
    const nextBest = alternatives[0];
    if (nextBest?.price && nextBest.price > best.price) {
      const diff = nextBest.price - best.price;
      points.push(`$${diff.toFixed(2)} cheaper than ${nextBest.site}`);
    }
  }

  // Shipping advantage
  if (best.shippingCost === 0) {
    points.push('Free shipping included');
  }

  // Delivery speed
  if (best.deliveryEstimate) {
    points.push(best.deliveryEstimate);
  }

  // Stock status
  if (best.inStock === true) {
    points.push('In stock');
  }

  // If we don't have enough points, add generic ones
  if (points.length === 0) {
    points.push('Best overall value');
  }

  return points.slice(0, 3);
}

// Helper: Get action button label
function getActionButtonLabel(intent: QueryIntent, siteName: string): string {
  switch (intent) {
    case 'price_comparison':
    case 'availability_check':
      return `Buy Now`;
    case 'vehicle_search':
      return `Schedule Test Drive`;
    case 'quote_request':
      return `Get Quote`;
    case 'travel':
      return `Book Now`;
    case 'real_estate':
      return `View Listing`;
    default:
      return `View`;
  }
}
