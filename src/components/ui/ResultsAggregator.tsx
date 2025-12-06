'use client';

import { AggregatedResults, Synthesis, NextAction, ExtractedResult } from '@/types/orchestrator';
import { CheckCircleIcon, ExternalLinkIcon, AlertTriangleIcon, ClockIcon, StarIcon } from '@/components/icons';

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
  const { best } = results;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Synthesis Panel */}
      {synthesis && (
        <div className="glass-panel p-6">
          {/* Headline */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {synthesis.headline}
              </h2>
              <p className="text-white/70">
                {synthesis.summary}
              </p>
            </div>
          </div>

          {/* Best option card */}
          {best && (
            <BestOptionCard result={best} />
          )}

          {/* Insights */}
          {synthesis.insights.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                <span className="text-lg">💡</span>
                Insights
              </div>
              <ul className="space-y-1">
                {synthesis.insights.map((insight, i) => (
                  <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                    <span className="text-blue-400/60 mt-0.5">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Caveats */}
          {synthesis.caveats && synthesis.caveats.length > 0 && (
            <div className="mt-3 flex items-start gap-2 text-yellow-400/70 text-sm">
              <AlertTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{synthesis.caveats.join('. ')}</span>
            </div>
          )}

          {/* Methodology */}
          {synthesis.methodology && (
            <div className="mt-3 flex items-center gap-2 text-white/40 text-xs">
              <ClockIcon className="w-3 h-3" />
              {synthesis.methodology}
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      <div className="glass-panel p-4">
        <h3 className="text-white font-medium mb-4">All prices found</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-white/50 text-sm border-b border-white/10">
                <th className="pb-3 font-medium">Retailer</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Shipping</th>
                <th className="pb-3 font-medium hidden md:table-cell">Availability</th>
                <th className="pb-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {results.results
                .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
                .map((result, i) => (
                  <ResultRow
                    key={`${result.site}-${i}`}
                    result={result}
                    isBest={result.site === best?.site && result.price === best?.price}
                  />
                ))}
            </tbody>
          </table>
        </div>

        {results.failedSites > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 text-white/40 text-sm">
            {results.failedSites} site(s) could not be reached
          </div>
        )}
      </div>

      {/* Next Actions */}
      <div className="glass-panel p-4">
        <h3 className="text-white/60 text-sm font-medium mb-3">What would you like to do?</h3>
        <div className="flex flex-wrap gap-2">
          {nextActions.map((action, i) => (
            <ActionButton
              key={i}
              action={action}
              onClick={() => onAction(action)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Best option card
function BestOptionCard({ result }: { result: ExtractedResult }) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-white/60 text-sm">Best Price</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${result.price?.toFixed(2)}
            <span className="text-lg text-white/40 font-normal ml-2">
              at {result.site}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {result.shipping && (
              <span className={`${result.shippingCost === 0 ? 'text-green-400' : 'text-white/60'}`}>
                {result.shippingCost === 0 ? '✓ Free shipping' : result.shipping}
              </span>
            )}
            {result.inStock !== undefined && (
              <span className={result.inStock ? 'text-green-400' : 'text-red-400'}>
                {result.inStock ? '✓ In stock' : '✗ Out of stock'}
              </span>
            )}
            {result.deliveryEstimate && (
              <span className="text-white/60">
                {result.deliveryEstimate}
              </span>
            )}
          </div>
        </div>

        {result.url && (
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all flex items-center gap-2 transform hover:scale-[1.02]"
          >
            View on {result.site}
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

// Result table row
function ResultRow({ result, isBest }: { result: ExtractedResult; isBest: boolean }) {
  return (
    <tr className={`border-b border-white/5 ${isBest ? 'bg-green-500/5' : ''}`}>
      <td className="py-3">
        <div className="flex items-center gap-2">
          {isBest && <StarIcon className="w-4 h-4 text-yellow-400" />}
          <span className={isBest ? 'text-white font-medium' : 'text-white/80'}>
            {result.site}
          </span>
        </div>
      </td>
      <td className="py-3">
        <span className={`font-medium ${isBest ? 'text-green-400' : 'text-white'}`}>
          {result.price ? `$${result.price.toFixed(2)}` : '—'}
        </span>
      </td>
      <td className="py-3 hidden sm:table-cell">
        <span className={result.shippingCost === 0 ? 'text-green-400' : 'text-white/60'}>
          {result.shipping || '—'}
        </span>
      </td>
      <td className="py-3 hidden md:table-cell">
        {result.inStock === true && (
          <span className="flex items-center gap-1 text-green-400 text-sm">
            <CheckCircleIcon className="w-3 h-3" />
            In stock
          </span>
        )}
        {result.inStock === false && (
          <span className="text-red-400 text-sm">Out of stock</span>
        )}
        {result.inStock === undefined && (
          <span className="text-white/40">—</span>
        )}
      </td>
      <td className="py-3">
        {result.url && (
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        )}
      </td>
    </tr>
  );
}

// Action button
function ActionButton({ action, onClick }: { action: NextAction; onClick: () => void }) {
  const getIcon = () => {
    switch (action.type) {
      case 'purchase':
        return '🛒';
      case 'save':
        return '💾';
      case 'alert':
        return '🔔';
      case 'expand':
        return '🔍';
      case 'retry':
        return '🔄';
      case 'new_search':
        return '✨';
      default:
        return '→';
    }
  };

  if (action.url) {
    return (
      <a
        href={action.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${action.primary
            ? 'bg-blue-500 hover:bg-blue-600 text-white font-medium'
            : 'bg-white/10 hover:bg-white/15 text-white/80'
          }
        `}
      >
        <span>{getIcon()}</span>
        {action.label}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${action.primary
          ? 'bg-blue-500 hover:bg-blue-600 text-white font-medium'
          : 'bg-white/10 hover:bg-white/15 text-white/80'
        }
      `}
    >
      <span>{getIcon()}</span>
      {action.label}
    </button>
  );
}
