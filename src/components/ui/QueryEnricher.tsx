'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, PlayIcon, LoaderIcon, PlusIcon, CheckIcon, ClockIcon, SparklesIcon } from '@/components/icons';
import { ParsedQuery, TargetSite, OUTPUT_PREVIEWS } from '@/types/orchestrator';

interface QueryEnricherProps {
  query: string;
  onQueryChange: (query: string) => void;
  parsedQuery: ParsedQuery | null;
  isParsing: boolean;
  selectedSites: TargetSite[];
  onToggleSite: (siteId: string) => void;
  onExecute: () => void;
  isReady: boolean;
}

export function QueryEnricher({
  query,
  onQueryChange,
  parsedQuery,
  isParsing,
  selectedSites,
  onToggleSite,
  onExecute,
  isReady,
}: QueryEnricherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Expand when we have a parsed query
  useEffect(() => {
    if (parsedQuery && !isParsing) {
      setTimeout(() => setIsExpanded(true), 100);
    } else {
      setIsExpanded(false);
    }
  }, [parsedQuery, isParsing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (isReady && isExpanded) {
        onExecute();
      }
    }
  };

  const selectedCount = selectedSites.length;
  const estimatedTime = Math.max(...selectedSites.map(s => s.estimatedTime || 15));
  const outputPreview = parsedQuery ? OUTPUT_PREVIEWS[parsedQuery.intent] : null;

  return (
    <div className={`
      glass-card overflow-hidden max-w-3xl mx-auto transition-all duration-500 ease-out
      ${isExpanded ? 'p-0' : 'p-1.5'}
    `}>
      {/* visionOS specular highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.4) 50%, transparent 90%)',
        }}
      />

      {/* Main input row */}
      <div className={`flex items-center gap-3 ${isExpanded ? 'p-4 pb-0' : ''}`}>
        <div className="text-white/70 ml-2">
          {isParsing ? (
            <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
          ) : (
            <SearchIcon className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What would you like to know?"
          className="flex-1 bg-transparent border-none text-white text-lg placeholder-white/50 focus:outline-none py-3"
          disabled={isParsing}
        />

        {!isExpanded && (
          <button
            onClick={() => query.length > 5 && onQueryChange(query)}
            disabled={query.length < 5}
            className={`px-6 py-3 mr-1 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              query.length >= 5
                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            Analyze
          </button>
        )}
      </div>

      {/* Enrichment panel - slides down */}
      <div
        className={`
          overflow-hidden transition-all duration-500 ease-out
          ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 pt-4 border-t border-white/10 mt-4">
          {/* Intent understanding */}
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-4 h-4 text-blue-400" />
            <span className="text-white/80 text-sm">
              I&apos;ll check these {selectedCount} sites for {parsedQuery?.goal}:
            </span>
          </div>

          {/* Site selection grid */}
          <div className="flex flex-wrap gap-2 mb-4">
            {parsedQuery?.suggestedSites.map((site) => (
              <button
                key={site.id}
                onClick={() => onToggleSite(site.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm
                  ${site.selected
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {site.selected ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 rounded border border-current opacity-50" />
                )}
                {site.name}
              </button>
            ))}

            <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 border border-dashed border-white/20 hover:border-white/30 transition-all">
              <PlusIcon className="w-4 h-4" />
              Add site
            </button>
          </div>

          {/* Preview of output */}
          {outputPreview && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
              <div className="text-white/40 text-sm">
                <span className="text-white/60 font-medium">Preview:</span>{' '}
                {outputPreview.description}
                {outputPreview.columns && (
                  <span className="block mt-1 text-white/30">
                    Columns: {outputPreview.columns.join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <ClockIcon className="w-4 h-4" />
              <span>Usually takes about {estimatedTime} seconds</span>
            </div>

            <button
              onClick={onExecute}
              disabled={!isReady || selectedCount === 0}
              className={`
                px-6 py-3 font-semibold rounded-xl transition-all flex items-center gap-2
                ${isReady && selectedCount > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
                }
              `}
            >
              <PlayIcon className="w-4 h-4" />
              Check {selectedCount} sites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
