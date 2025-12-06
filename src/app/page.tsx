'use client';

import { useState, useCallback, useEffect } from 'react';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { GlobeIcon, LoaderIcon, AlertTriangleIcon, ChevronDownIcon } from '@/components/icons';
import { BrowserViewer, ProgressNarration, ResultsDisplay } from '@/components/ui';
import { useSession } from '@/hooks';

// Scenario-based examples that feel relevant and personal
const SCENARIOS = [
  {
    category: 'Shopping',
    icon: '🛒',
    examples: [
      'Find the best price for AirPods Pro across major retailers',
      'Compare prices for a Nintendo Switch OLED',
    ],
  },
  {
    category: 'Research',
    icon: '🔍',
    examples: [
      'Find USPS shipping cost for a 5lb box from SF to Boston',
      'What are the hours for Tartine Bakery in San Francisco?',
    ],
  },
  {
    category: 'Travel',
    icon: '✈️',
    examples: [
      'Find hotels in Tokyo under $200/night for next weekend',
      'What are the cheapest flights from LAX to NYC in January?',
    ],
  },
];

type ViewState = 'landing' | 'running' | 'results';

export default function Home() {
  const [query, setQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const {
    streamingUrl,
    sessionOutput,
    sessionLog,
    error,
    isRunning,
    isComplete,
    runQuery,
    reset,
  } = useSession();

  // Track elapsed time during running state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Determine current view state
  const viewState: ViewState = isComplete ? 'results' : isRunning ? 'running' : 'landing';

  const handleRunQuery = useCallback(async () => {
    if (!query.trim() || isRunning) return;
    setCurrentQuery(query);
    setShowBrowser(false);
    setElapsedTime(0);
    setStartTime(Date.now());
    await runQuery(query);
  }, [query, isRunning, runQuery]);

  const handleTryAnother = useCallback(() => {
    setQuery('');
    setCurrentQuery('');
    setShowBrowser(false);
    setElapsedTime(0);
    setStartTime(null);
    reset();
  }, [reset]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRunQuery();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4">
        <div className="flex justify-center">
          <MinoLogo />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-3xl">

          {/* LANDING STATE */}
          {viewState === 'landing' && (
            <div className="animate-fadeIn">
              {/* Hero Section */}
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow-lg">
                  What do you want to find out?
                </h1>
                <p className="text-xl text-white/70">
                  Tell me what you need. I&apos;ll go find it.
                </p>
              </div>

              {/* Input Area */}
              <div className="glass-card p-2 mb-6">
                <div className="relative">
                  <div
                    className="absolute inset-x-0 top-0 h-px rounded-t-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.4) 50%, transparent 90%)',
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <div className="text-white/50 ml-4">
                      <GlobeIcon />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Find the best price for..."
                      className="flex-1 bg-transparent border-none text-white text-lg placeholder-white/40 focus:outline-none py-4"
                      autoFocus
                    />
                    <button
                      onClick={handleRunQuery}
                      disabled={!query.trim()}
                      className={`px-8 py-3 mr-1 font-semibold rounded-xl transition-all flex items-center gap-2 ${
                        query.trim()
                          ? 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      Go find it
                    </button>
                  </div>
                </div>
              </div>

              {/* Example Scenarios */}
              <div className="space-y-4">
                <p className="text-sm text-white/50 text-center">Or try one of these:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SCENARIOS.map((scenario) => (
                    <div key={scenario.category} className="space-y-2">
                      <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                        <span>{scenario.icon}</span>
                        <span>{scenario.category}</span>
                      </div>
                      {scenario.examples.map((example) => (
                        <button
                          key={example}
                          onClick={() => setQuery(example)}
                          className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 text-sm transition-all"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RUNNING STATE */}
          {viewState === 'running' && (
            <div className="animate-fadeIn">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 mb-4">
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Working on it...</span>
                  <span className="text-blue-300/70 text-sm">{formatTime(elapsedTime)}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Mino is finding your answer
                </h2>
                <p className="text-white/60 max-w-xl mx-auto">
                  &ldquo;{currentQuery}&rdquo;
                </p>
                {elapsedTime > 10 && (
                  <p className="text-white/40 text-sm mt-2">
                    Complex queries can take up to a minute
                  </p>
                )}
              </div>

              {/* Progress Narration */}
              <div className="glass-panel p-6 mb-6">
                <ProgressNarration sessionLog={sessionLog} isRunning={isRunning} />
              </div>

              {/* Browser Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowBrowser(!showBrowser)}
                  className="inline-flex items-center gap-2 text-white/50 hover:text-white/70 text-sm transition-colors"
                >
                  <span>{showBrowser ? 'Hide' : 'Show'} live browser</span>
                  <ChevronDownIcon className={`transition-transform ${showBrowser ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Collapsible Browser View */}
              {showBrowser && streamingUrl && (
                <div className="mt-4 animate-fadeIn">
                  <div className="glass-panel p-4 h-[400px]">
                    <BrowserViewer streamingUrl={streamingUrl} />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
                  <div className="flex items-start gap-3">
                    <AlertTriangleIcon />
                    <div>
                      <p className="font-medium">Something went wrong</p>
                      <p className="text-sm text-red-300/80 mt-1">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTryAnother}
                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RESULTS STATE */}
          {viewState === 'results' && (
            <div className="animate-fadeIn">
              <ResultsDisplay
                output={sessionOutput}
                query={currentQuery}
                onTryAnother={handleTryAnother}
              />
            </div>
          )}

        </div>
      </main>

      {/* Footer Tagline */}
      {viewState === 'landing' && (
        <footer className="py-8 text-center">
          <p className="text-white/40 text-sm">
            You ask. Mino goes. Answers come back.
          </p>
        </footer>
      )}
    </div>
  );
}
