'use client';

import { useState, useCallback } from 'react';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { GlobeIcon, LoaderIcon, CheckCircleIcon, AlertTriangleIcon } from '@/components/icons';
import { SearchInput, BrowserViewer, SessionEventsPanel } from '@/components/ui';
import { useQueryFeedback, useSession } from '@/hooks';
import { EXAMPLE_QUERIES } from '@/lib/constants';
import { BrowserPresetKey } from '@/types';

export default function Home() {
  const [query, setQuery] = useState('');
  const [browserPreset, setBrowserPreset] = useState<BrowserPresetKey>('BASIC');

  const {
    sessionId,
    streamingUrl,
    sessionStatus,
    sessionOutput,
    events,
    error,
    isRunning,
    isComplete,
    runQuery,
    reset,
  } = useSession();

  const { feedback, isAnalyzing, clearFeedback } = useQueryFeedback(
    query,
    !isRunning && !isComplete
  );

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const handleApplySuggestion = useCallback(() => {
    if (feedback?.suggestedQuery) {
      setQuery(feedback.suggestedQuery);
      clearFeedback();
    }
  }, [feedback, clearFeedback]);

  const handleRunQuery = useCallback(async () => {
    if (!query.trim() || isRunning) return;
    clearFeedback();
    await runQuery(query);
  }, [query, isRunning, clearFeedback, runQuery]);

  const handleTryAnother = useCallback(() => {
    setQuery('');
    reset();
  }, [reset]);

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-12">
      {/* MINO Header Logo */}
      <div
        className="fixed top-6 left-0 right-0 flex justify-center z-50 animate-fadeIn"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
      >
        <MinoLogo />
      </div>

      <div className="w-full max-w-6xl mt-16 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2 text-center text-shadow-lg">
            Try a Search
          </h2>

          {!isComplete && (
            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <p className="text-white/70 text-center mb-6">
                See Mino in action - enter a search query below
              </p>

              {/* Search Bar */}
              <SearchInput
                query={query}
                onQueryChange={handleQueryChange}
                onSubmit={handleRunQuery}
                isRunning={isRunning}
                queryFeedback={feedback}
                isAnalyzingQuery={isAnalyzing}
                onApplySuggestion={handleApplySuggestion}
                selectedPreset={browserPreset}
                onPresetChange={setBrowserPreset}
              />

              {/* Quick Examples */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {EXAMPLE_QUERIES.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleQueryChange(example)}
                    disabled={isRunning}
                    className="px-3 py-1.5 text-white/90 text-sm rounded-lg border border-white/20 transition-all disabled:opacity-50 hover:border-white/30 hover:text-white glass-button"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-auto lg:h-[500px]">
          {/* Left Panel: Browser View (60%) */}
          <div className="lg:col-span-3 glass-panel p-4 h-[350px] lg:h-full">
            <div className="flex items-center gap-2 mb-3 text-white/70 text-sm font-medium">
              <GlobeIcon />
              <span>Browser Session</span>
              {sessionId && (
                <span className="text-xs text-white/40 ml-auto font-mono">
                  {sessionId.substring(0, 8)}...
                </span>
              )}
            </div>
            <div className="h-[calc(100%-40px)]">
              {streamingUrl ? (
                <BrowserViewer
                  streamingUrl={streamingUrl}
                  onStatusChange={(status) => {
                    if (status === 'connected') {
                      // Event handled by hook
                    }
                  }}
                />
              ) : isRunning ? (
                <div className="flex items-center justify-center h-full text-white/40">
                  <div className="text-center">
                    <LoaderIcon className="w-12 h-12 animate-spin mx-auto mb-3 text-blue-400" />
                    <p>Starting browser session...</p>
                    <p className="text-sm text-white/30 mt-1">Waiting for stream...</p>
                  </div>
                </div>
              ) : isComplete ? (
                <div className="flex items-center justify-center h-full text-white/40">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircleIcon className="text-green-400" />
                    </div>
                    <p className="text-green-400 mb-4">Query completed!</p>
                    <button
                      onClick={handleTryAnother}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Try another query
                    </button>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-white/40">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                      <AlertTriangleIcon className="text-red-400" />
                    </div>
                    <p className="text-red-400 mb-2">Error</p>
                    <p className="text-sm text-white/50 mb-4 max-w-xs">{error}</p>
                    <button
                      onClick={handleTryAnother}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/40">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-3">
                      <GlobeIcon />
                    </div>
                    <p>Enter a query to start</p>
                    <p className="text-sm text-white/30 mt-1">Live browser view will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Events (40%) */}
          <div className="lg:col-span-2 glass-panel p-4 h-[350px] lg:h-full">
            <div className="flex items-center gap-2 mb-3 text-white/70 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>Session Events</span>
            </div>
            <div className="h-[calc(100%-40px)]">
              <SessionEventsPanel
                events={events}
                sessionStatus={sessionStatus}
                sessionOutput={sessionOutput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
