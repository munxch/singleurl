'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { BottomNav } from '@/components/ui';
import { SearchIcon, ArrowRightIcon, LoaderIcon, ChevronDownIcon } from '@/components/icons';
import { generateJobId } from '@/lib/persistence';

// =============================================================================
// TYPES
// =============================================================================

interface JobTemplate {
  title: string;
  example: string;
  meta: string; // e.g., "5 sites · ~10 sec"
}

interface Category {
  id: string;
  emoji: string;
  label: string;
  jobs: JobTemplate[];
}

// =============================================================================
// CATEGORY DATA
// =============================================================================

const CATEGORIES: Category[] = [
  {
    id: 'dining',
    emoji: '🍝',
    label: 'Dining & Reservations',
    jobs: [
      {
        title: 'Date night reservation',
        example: 'Date night tonight in Dallas, nice Italian, 7pm for 2',
        meta: '5 sites · ~10 sec',
      },
      {
        title: 'Group dinner',
        example: 'Restaurant in Austin for 12 with private dining Saturday night',
        meta: '5 sites · ~15 sec',
      },
      {
        title: 'Last-minute table',
        example: 'Nice restaurant with availability tonight near downtown Dallas',
        meta: '5 sites · ~10 sec',
      },
    ],
  },
  {
    id: 'auto',
    emoji: '🚗',
    label: 'Cars & Vehicles',
    jobs: [
      {
        title: 'Search dealer inventory',
        example: 'Find a used Honda Civic under $25k, under 50k miles, with Apple CarPlay',
        meta: '10 sites · ~35 sec',
      },
      {
        title: 'Compare dealer prices',
        example: 'Compare Honda CR-V prices at dealers within 50 miles of Dallas',
        meta: '8 sites · ~40 sec',
      },
      {
        title: 'Certified pre-owned',
        example: 'CPO Toyota Camry under $30k near Austin',
        meta: '6 sites · ~30 sec',
      },
    ],
  },
  {
    id: 'shopping',
    emoji: '🛒',
    label: 'Shopping & Prices',
    jobs: [
      {
        title: 'Price check',
        example: 'Find the best price for AirPods Pro 2nd generation',
        meta: '6 sites · ~25 sec',
      },
      {
        title: 'Find deals',
        example: 'Find deals or coupons for Dyson vacuums',
        meta: '8 sites · ~30 sec',
      },
      {
        title: 'Compare products',
        example: 'Compare iPhone 16 Pro vs Samsung S24 Ultra',
        meta: '5 sites · ~45 sec',
      },
    ],
  },
  {
    id: 'local',
    emoji: '📍',
    label: 'Local & Availability',
    jobs: [
      {
        title: 'Check store inventory',
        example: 'Is the iPhone 16 Pro Max in stock near me?',
        meta: '10 sites · ~20 sec',
      },
      {
        title: 'Find service providers',
        example: 'Find HVAC contractors in Austin with good reviews',
        meta: '5 sites · ~30 sec',
      },
    ],
  },
  {
    id: 'travel',
    emoji: '✈️',
    label: 'Travel & Booking',
    jobs: [
      {
        title: 'Search flights',
        example: 'Flights from San Francisco to Tokyo in March',
        meta: '5 sites · ~30 sec',
      },
      {
        title: 'Compare hotels',
        example: 'Hotels in NYC for New Years Eve under $300/night',
        meta: '5 sites · ~35 sec',
      },
      {
        title: 'Rental cars',
        example: 'SUV rental in Maui for March 15-22',
        meta: '4 sites · ~25 sec',
      },
    ],
  },
  {
    id: 'insurance',
    emoji: '🛡️',
    label: 'Insurance & Quotes',
    jobs: [
      {
        title: 'Auto insurance',
        example: 'Compare auto insurance for a 2023 Toyota RAV4 in California',
        meta: '5 sites · ~2 min',
      },
      {
        title: 'Home insurance',
        example: 'Home insurance quotes for a $500k house in Austin',
        meta: '5 sites · ~2 min',
      },
    ],
  },
];

// =============================================================================
// CATEGORY ACCORDION
// =============================================================================

function CategoryAccordion({
  category,
  isExpanded,
  onToggle,
  onSelectExample,
}: {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectExample: (query: string) => void;
}) {
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.emoji}</span>
          <span className="text-white/90 font-medium">{category.label}</span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Jobs */}
      {isExpanded && (
        <div className="pb-2">
          {category.jobs.map((job, i) => (
            <button
              key={i}
              onClick={() => onSelectExample(job.example)}
              className="w-full px-4 py-3 text-left hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 pl-8">
                <div className="flex-1 min-w-0">
                  <div className="text-white/70 text-sm mb-0.5">{job.title}</div>
                  <div className="text-white/40 text-sm truncate group-hover:text-white/60 transition-colors">
                    {job.example}
                  </div>
                </div>
                <div className="text-white/20 text-xs whitespace-nowrap pt-0.5">
                  {job.meta}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('dining');

  const handleSubmit = useCallback(() => {
    if (query.trim().length < 5 || isNavigating) return;

    setIsNavigating(true);
    const jobId = generateJobId();
    router.push(`/search/${jobId}?q=${encodeURIComponent(query.trim())}`);
  }, [query, isNavigating, router]);

  const handleSelectExample = useCallback((exampleQuery: string) => {
    setQuery(exampleQuery);
    inputRef.current?.focus();
    // Select all text so user can immediately edit or press enter
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1628]">
      {/* Background effects */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content flex-1 flex flex-col">
        {/* Header with logo */}
        <header className="flex items-center justify-center px-6 py-4">
          <MinoLogo />
        </header>

        {/* Sticky Search Area - gradient blend */}
        <div className="sticky top-0 z-50">
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628]/95 to-transparent pointer-events-none" />

          <div className="relative px-6 pt-3 pb-6">
            <div className="max-w-xl mx-auto">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.08] border border-white/[0.1] focus-within:border-white/25 focus-within:bg-white/[0.1] transition-all shadow-lg shadow-black/20">
                <div className="text-white/40">
                  {isNavigating ? (
                    <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
                  ) : (
                    <SearchIcon className="w-5 h-5" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What are you looking for?"
                  className="flex-1 bg-transparent text-white text-base placeholder-white/40 focus:outline-none"
                  disabled={isNavigating}
                />
                {query.trim().length >= 5 && (
                  <button
                    onClick={handleSubmit}
                    disabled={isNavigating}
                    className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <main className="flex-1 px-6 pb-24">
          <div className="max-w-xl mx-auto">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              {CATEGORIES.map((category) => (
                <CategoryAccordion
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategory === category.id}
                  onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  onSelectExample={handleSelectExample}
                />
              ))}
            </div>

            {/* Subtle helper text */}
            <p className="text-center text-white/20 text-sm mt-6">
              Select an example or type your own query
            </p>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
