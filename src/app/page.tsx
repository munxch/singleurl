'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { ExampleCards, BottomNav } from '@/components/ui';
import { SearchIcon, ArrowRightIcon, LoaderIcon } from '@/components/icons';
import { generateJobId } from '@/lib/persistence';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Navigate to search page with query
  const handleSubmit = useCallback(() => {
    if (query.trim().length < 5 || isNavigating) return;

    setIsNavigating(true);
    const jobId = generateJobId();
    router.push(`/search/${jobId}?q=${encodeURIComponent(query.trim())}`);
  }, [query, isNavigating, router]);

  const handleTryExample = useCallback((exampleQuery: string) => {
    setIsNavigating(true);
    const jobId = generateJobId();
    router.push(`/search/${jobId}?q=${encodeURIComponent(exampleQuery)}`);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content flex-1 flex flex-col">
        {/* Fixed header with logo */}
        <header
          className="flex items-center justify-center px-6 py-4"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
        >
          <MinoLogo />
        </header>

        {/* Main content area - always centered */}
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            {/* Simple headline */}
            <h1
              className="mb-8 text-white/80 text-center text-3xl font-medium opacity-0 animate-slideUp"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              What can we help you find?
            </h1>

            {/* Simple Search Input */}
            <div
              className="opacity-0 animate-slideUp"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <div className="glass-card p-1.5">
                <div className="flex items-center gap-3">
                  <div className="text-white/70 ml-2">
                    {isNavigating ? (
                      <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
                    ) : (
                      <SearchIcon className="w-5 h-5" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What would you like to find?"
                    className="flex-1 bg-transparent border-none text-white text-lg placeholder-white/50 focus:outline-none py-3"
                    disabled={isNavigating}
                    autoFocus
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={query.trim().length < 5 || isNavigating}
                    className={`p-3 mr-1 rounded-xl transition-all ${
                      query.trim().length >= 5 && !isNavigating
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Example Cards */}
            <div
              className="mt-8 opacity-0 animate-slideUp"
              style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
            >
              <ExampleCards onSelectExample={handleTryExample} />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
