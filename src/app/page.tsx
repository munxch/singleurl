'use client';

import { useState, useCallback, useEffect } from 'react';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { QueryEnricher, OrchestraProgress, ResultsAggregator } from '@/components/ui';
import { useOrchestrator } from '@/hooks';
import { PARALLEL_QUERY_EXAMPLES } from '@/types/orchestrator';
import { SparklesIcon, ZapIcon, LayersIcon, RefreshIcon } from '@/components/icons';

export default function Home() {
  const [query, setQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);

  const {
    status,
    parsedQuery,
    selectedSites,
    lanes,
    progress,
    aggregatedResults,
    synthesis,
    nextActions,
    currentBest,
    isParsing,
    isConfiguring,
    isRunning,
    isComplete,
    setQuery: analyzeQuery,
    toggleSite,
    execute,
    reset,
  } = useOrchestrator();

  // Hide onboarding once user starts interacting
  useEffect(() => {
    if (status !== 'idle') {
      setShowOnboarding(false);
    }
  }, [status]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (query.trim().length >= 5) {
      analyzeQuery(query);
    }
  }, [query, analyzeQuery]);

  const handleExecute = useCallback(async () => {
    if (selectedSites.length > 0) {
      await execute();
    }
  }, [selectedSites, execute]);

  const handleNewSearch = useCallback(() => {
    setQuery('');
    reset();
    setShowOnboarding(true);
  }, [reset]);

  const handleAction = useCallback((action: { type: string; url?: string }) => {
    if (action.type === 'new_search') {
      handleNewSearch();
    } else if (action.url) {
      window.open(action.url, '_blank');
    }
  }, [handleNewSearch]);

  const handleTryExample = useCallback((exampleQuery: string) => {
    setQuery(exampleQuery);
    setShowOnboarding(false);
    setTimeout(() => analyzeQuery(exampleQuery), 100);
  }, [analyzeQuery]);

  // Determine which view to show
  const showInput = status === 'idle' || status === 'parsing' || status === 'configuring';
  const showProgress = status === 'running';
  const showResults = status === 'complete' || status === 'completing';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content flex-1 flex flex-col">
        {/* MINO Header Logo */}
        <header
          className="flex justify-center py-6 animate-fadeIn"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
        >
          <MinoLogo />
        </header>

        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center px-6 py-8">
          <div className="w-full max-w-4xl">
            {/* Hero section - shown on first visit */}
            {showOnboarding && status === 'idle' && (
              <div className="text-center mb-12 animate-fadeIn">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow-lg">
                  You ask. Mino goes.
                  <br />
                  <span className="text-blue-400">Answers come back.</span>
                </h1>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                  Search multiple sites at once. Get synthesized answers, not raw data.
                </p>
              </div>
            )}

            {/* Compact header when not in onboarding */}
            {!showOnboarding && showInput && (
              <div className="text-center mb-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-white text-shadow-lg">
                  {isConfiguring ? 'Ready to search' : 'What would you like to know?'}
                </h2>
              </div>
            )}

            {/* Query Input / Enricher */}
            {showInput && (
              <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <QueryEnricher
                  query={query}
                  onQueryChange={(q) => {
                    handleQueryChange(q);
                    // Auto-analyze after typing stops
                    if (q.length >= 10 && status === 'idle') {
                      const timeout = setTimeout(() => analyzeQuery(q), 800);
                      return () => clearTimeout(timeout);
                    }
                  }}
                  parsedQuery={parsedQuery || null}
                  isParsing={isParsing}
                  selectedSites={selectedSites}
                  onToggleSite={toggleSite}
                  onExecute={handleExecute}
                  isReady={isConfiguring && selectedSites.length > 0}
                />

                {/* Quick examples */}
                {status === 'idle' && (
                  <div className="mt-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    <div className="text-center text-white/40 text-sm mb-4">Try an example</div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {PARALLEL_QUERY_EXAMPLES.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => handleTryExample(example.query)}
                          className="group glass-button px-4 py-3 rounded-xl transition-all hover:scale-[1.02] text-left max-w-xs"
                        >
                          <div className="text-white/90 text-sm font-medium mb-1">
                            {example.query}
                          </div>
                          <div className="flex items-center gap-2 text-white/40 text-xs">
                            <LayersIcon className="w-3 h-3" />
                            {example.description}
                            <span className="text-white/30">~{example.estimatedTime}s</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress View - The Orchestra */}
            {showProgress && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-white text-shadow-lg">
                    Searching {progress.total} sites...
                  </h2>
                  <p className="text-white/60 mt-1">
                    {parsedQuery?.goal} for {parsedQuery?.subject}
                  </p>
                </div>

                <OrchestraProgress
                  lanes={lanes}
                  currentBest={currentBest || null}
                  onStopEarly={() => {
                    // Could implement early stop logic
                  }}
                  expanded={true}
                />
              </div>
            )}

            {/* Results View */}
            {showResults && aggregatedResults && (
              <div className="animate-fadeIn">
                <ResultsAggregator
                  results={aggregatedResults}
                  synthesis={synthesis || null}
                  nextActions={nextActions}
                  onAction={handleAction}
                />
              </div>
            )}
          </div>
        </main>

        {/* Footer - subtle branding */}
        <footer className="py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
            <ZapIcon className="w-4 h-4" />
            <span>Powered by TinyFish</span>
          </div>
        </footer>
      </div>

      {/* Floating action button for new search (when viewing results) */}
      {showResults && (
        <button
          onClick={handleNewSearch}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 animate-fadeIn"
          style={{ animationDelay: '0.5s' }}
        >
          <RefreshIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Feature highlights - shown on first visit */}
      {showOnboarding && status === 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
          <div className="max-w-6xl mx-auto px-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto">
              <FeatureCard
                icon={<LayersIcon className="w-6 h-6" />}
                title="Parallel Search"
                description="Check multiple sites simultaneously, not one at a time"
              />
              <FeatureCard
                icon={<SparklesIcon className="w-6 h-6" />}
                title="Smart Synthesis"
                description="Get answers, not just raw data from each site"
              />
              <FeatureCard
                icon={<ZapIcon className="w-6 h-6" />}
                title="Real-time Results"
                description="See results flow in as each site responds"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Feature card component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel p-4 flex items-start gap-3 animate-fadeIn hover:bg-white/10 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium text-sm">{title}</h3>
        <p className="text-white/50 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}
