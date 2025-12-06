'use client';

import { SearchIcon, RefreshIcon, BellIcon, BookmarkIcon } from '@/components/icons';
import { QueryIntent } from '@/types/orchestrator';

interface FollowUpSuggestionsProps {
  intent: QueryIntent;
  subject: string;
  onNewSearch: () => void;
  onAction?: (action: string) => void;
}

export function FollowUpSuggestions({
  intent,
  subject,
  onNewSearch,
  onAction,
}: FollowUpSuggestionsProps) {
  const suggestions = getSuggestionsForIntent(intent, subject);

  return (
    <div className="space-y-3 animate-fadeIn pt-6 pb-8">
      <p className="text-white/40 text-sm text-center">What would you like to do next?</p>

      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => {
              if (suggestion.action === 'new_search') {
                onNewSearch();
              } else {
                onAction?.(suggestion.action);
              }
            }}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all
              ${suggestion.primary
                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }
            `}
          >
            <suggestion.icon className="w-4 h-4" />
            {suggestion.label}
          </button>
        ))}
      </div>

      {/* Quick search input for follow-up */}
      <div className="pt-4 max-w-md mx-auto">
        <button
          onClick={onNewSearch}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left group"
        >
          <SearchIcon className="w-4 h-4 text-white/40 group-hover:text-white/60" />
          <span className="text-white/40 text-sm group-hover:text-white/60">
            Search for something else...
          </span>
        </button>
      </div>
    </div>
  );
}

interface Suggestion {
  label: string;
  action: string;
  icon: React.FC<{ className?: string }>;
  primary?: boolean;
}

function getSuggestionsForIntent(intent: QueryIntent, subject: string): Suggestion[] {
  const baseSuggestions: Suggestion[] = [];

  switch (intent) {
    case 'price_comparison':
      baseSuggestions.push(
        { label: 'Set price alert', action: 'price_alert', icon: BellIcon },
        { label: 'Save comparison', action: 'save', icon: BookmarkIcon },
        { label: 'Search similar items', action: 'new_search', icon: SearchIcon, primary: true },
      );
      break;

    case 'vehicle_search':
      baseSuggestions.push(
        { label: 'Alert me for new listings', action: 'listing_alert', icon: BellIcon },
        { label: 'Compare with another car', action: 'new_search', icon: SearchIcon, primary: true },
        { label: 'Save search', action: 'save', icon: BookmarkIcon },
      );
      break;

    case 'quote_request':
      baseSuggestions.push(
        { label: 'Get more quotes', action: 'more_quotes', icon: RefreshIcon },
        { label: 'Save quotes', action: 'save', icon: BookmarkIcon },
        { label: 'Compare different coverage', action: 'new_search', icon: SearchIcon, primary: true },
      );
      break;

    case 'travel':
      baseSuggestions.push(
        { label: 'Track price changes', action: 'price_alert', icon: BellIcon },
        { label: 'Try different dates', action: 'new_search', icon: SearchIcon, primary: true },
        { label: 'Save itinerary', action: 'save', icon: BookmarkIcon },
      );
      break;

    case 'real_estate':
      baseSuggestions.push(
        { label: 'Get notified of new listings', action: 'listing_alert', icon: BellIcon },
        { label: 'Search different area', action: 'new_search', icon: SearchIcon, primary: true },
        { label: 'Save search', action: 'save', icon: BookmarkIcon },
      );
      break;

    case 'availability_check':
      baseSuggestions.push(
        { label: 'Alert when in stock', action: 'stock_alert', icon: BellIcon },
        { label: 'Check different stores', action: 'new_search', icon: SearchIcon, primary: true },
      );
      break;

    default:
      baseSuggestions.push(
        { label: 'New search', action: 'new_search', icon: SearchIcon, primary: true },
        { label: 'Save results', action: 'save', icon: BookmarkIcon },
      );
  }

  return baseSuggestions;
}
