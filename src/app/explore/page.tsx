'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/ui';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { SearchIcon, ArrowRightIcon, LoaderIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon, UserIcon } from '@/components/icons';
import { generateJobId } from '@/lib/persistence';

// =============================================================================
// EXAMPLE CARDS DATA
// =============================================================================

interface ExampleCard {
  id: string;
  title: string;
  query: string;
  emoji: string;
  gradient: string;
}

interface Category {
  id: string;
  label: string;
  examples: ExampleCard[];
}

const CATEGORIES: Category[] = [
  {
    id: 'dining',
    label: 'Dining & Nightlife',
    examples: [
      {
        id: 'date-night',
        title: 'Find a Date Night Reservation',
        query: 'Date night tonight in Dallas, nice Italian, 7pm for 2',
        emoji: '🍝',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'group-dinner',
        title: 'Book a Group Dinner',
        query: 'Restaurant for 8 people Saturday night in Austin with private room',
        emoji: '🎉',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'brunch',
        title: 'Find the Best Brunch',
        query: 'Best brunch near me with outdoor seating and mimosas',
        emoji: '🥂',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'late-night',
        title: 'Find Late Night Eats',
        query: 'Restaurants open after midnight near downtown',
        emoji: '🌙',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'happy-hour',
        title: 'Find Happy Hour Spots',
        query: 'Best happy hour deals near me with good appetizers',
        emoji: '🍻',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'rooftop-bar',
        title: 'Discover Rooftop Bars',
        query: 'Rooftop bars in downtown with city views',
        emoji: '🌃',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'coffee-shop',
        title: 'Find a Coffee Shop',
        query: 'Quiet coffee shops near me good for working',
        emoji: '☕',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
    ],
  },
  {
    id: 'auto',
    label: 'Cars & Vehicles',
    examples: [
      {
        id: 'used-car',
        title: 'Search Used Car Inventory',
        query: 'Find a used Honda Civic under $25k, under 50k miles, with Apple CarPlay',
        emoji: '🚗',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'lease-deals',
        title: 'Find the Best Lease Deals',
        query: 'Best lease deals on electric SUVs in my area',
        emoji: '⚡',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'compare-trucks',
        title: 'Compare Pickup Trucks',
        query: 'Compare Ford F-150 vs Toyota Tundra vs Chevy Silverado 2024',
        emoji: '🛻',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'electric-cars',
        title: 'Find Electric Vehicles',
        query: 'Best used electric cars under $35k with 200+ mile range',
        emoji: '🔋',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'suv-search',
        title: 'Search Family SUVs',
        query: 'Used 3-row SUV under $40k with good safety ratings',
        emoji: '🚙',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'motorcycle',
        title: 'Find a Motorcycle',
        query: 'Used Harley Davidson under $15k in good condition',
        emoji: '🏍️',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'car-value',
        title: 'Check Car Trade-In Value',
        query: 'What is my 2019 Toyota Camry worth for trade-in?',
        emoji: '💰',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
    ],
  },
  {
    id: 'travel',
    label: 'Travel & Hotels',
    examples: [
      {
        id: 'flights',
        title: 'Search for Flights',
        query: 'Flights from San Francisco to Tokyo in March',
        emoji: '✈️',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'hotels',
        title: 'Find Hotel Deals',
        query: 'Hotels in NYC for New Years Eve under $300/night',
        emoji: '🏨',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'vacation-rental',
        title: 'Book a Vacation Rental',
        query: 'Beach house in Malibu for a week in July, sleeps 6',
        emoji: '🏖️',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'rental-car',
        title: 'Compare Rental Cars',
        query: 'SUV rental in Maui for March 15-22',
        emoji: '🚙',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'cruise',
        title: 'Find Cruise Deals',
        query: 'Caribbean cruise for 2 in February under $2000',
        emoji: '🚢',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'ski-resort',
        title: 'Book a Ski Trip',
        query: 'Ski resorts in Colorado with lodging for a family of 4',
        emoji: '⛷️',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'all-inclusive',
        title: 'Find All-Inclusive Resorts',
        query: 'All-inclusive resorts in Mexico for couples under $300/night',
        emoji: '🌴',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
    ],
  },
  {
    id: 'shopping',
    label: 'Shopping & Deals',
    examples: [
      {
        id: 'price-check',
        title: 'Price Check Electronics',
        query: 'Find the best price for AirPods Pro 2nd generation',
        emoji: '🎧',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'in-stock',
        title: 'Check In-Stock Nearby',
        query: 'Is the iPhone 16 Pro Max in stock near me?',
        emoji: '📱',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'compare-prices',
        title: 'Compare TV Prices',
        query: 'Compare prices for LG C4 65 inch OLED TV',
        emoji: '📺',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'deals',
        title: 'Find Deals & Coupons',
        query: 'Find deals or coupons for Dyson vacuums',
        emoji: '🏷️',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'laptop',
        title: 'Compare Laptops',
        query: 'Best laptop for video editing under $2000',
        emoji: '💻',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'gaming',
        title: 'Find Gaming Deals',
        query: 'Best price on PS5 with extra controller bundle',
        emoji: '🎮',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'appliance',
        title: 'Compare Appliance Prices',
        query: 'Best price on Samsung Bespoke refrigerator',
        emoji: '🧊',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
    ],
  },
  {
    id: 'services',
    label: 'Local Services',
    examples: [
      {
        id: 'contractors',
        title: 'Find Contractors',
        query: 'Find HVAC contractors in Austin with good reviews',
        emoji: '🔧',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'insurance',
        title: 'Compare Insurance Quotes',
        query: 'Compare auto insurance for a 2023 Toyota RAV4 in California',
        emoji: '🛡️',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'movers',
        title: 'Get Moving Quotes',
        query: 'Moving companies in Chicago for 2 bedroom apartment',
        emoji: '📦',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'cleaning',
        title: 'Find Cleaning Services',
        query: 'House cleaning services in Seattle with weekly availability',
        emoji: '🧹',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'plumber',
        title: 'Find a Plumber',
        query: 'Emergency plumbers available now in my area',
        emoji: '🚿',
        gradient: 'from-blue-500/30 to-sky-500/20',
      },
      {
        id: 'electrician',
        title: 'Find an Electrician',
        query: 'Licensed electricians for home rewiring project',
        emoji: '💡',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
      {
        id: 'lawn-care',
        title: 'Get Lawn Care Quotes',
        query: 'Lawn care services with weekly mowing in my neighborhood',
        emoji: '🌱',
        gradient: 'from-blue-500/30 to-cyan-500/20',
      },
    ],
  },
];

// =============================================================================
// EXAMPLE CARD COMPONENT
// =============================================================================

function ExampleCard({ card, onClick }: { card: ExampleCard; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 w-72 p-4 rounded-2xl text-left relative
        bg-gradient-to-br ${card.gradient}
        border border-white/[0.08]
        hover:border-white/20 hover:scale-[1.02]
        transition-all duration-200
        group
      `}
    >
      {/* Use indicator - shows on hover */}
      <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Use
      </span>

      {/* Emoji + Title row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{card.emoji}</span>
        <h3 className="text-white font-medium text-sm leading-snug">
          {card.title}
        </h3>
      </div>

      {/* Query preview - full text */}
      <p className="text-white/50 text-sm leading-relaxed">
        "{card.query}"
      </p>
    </button>
  );
}

// =============================================================================
// CATEGORY ROW COMPONENT
// =============================================================================

function CategoryRow({ category, onSelectExample }: {
  category: Category;
  onSelectExample: (query: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <h2 className="text-lg font-medium text-white">
          {category.label}
        </h2>

        {/* Scroll buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`
              p-1.5 rounded-full border border-white/20
              ${canScrollLeft
                ? 'hover:border-white/40 hover:bg-white/5 text-white/60'
                : 'opacity-30 cursor-not-allowed text-white/30'
              }
              transition-all
            `}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`
              p-1.5 rounded-full border border-white/20
              ${canScrollRight
                ? 'hover:border-white/40 hover:bg-white/5 text-white/60'
                : 'opacity-30 cursor-not-allowed text-white/30'
              }
              transition-all
            `}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards row - extra padding for hover scale effect */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto overflow-y-visible scrollbar-hide px-6 py-2 -my-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {category.examples.map((card) => (
          <ExampleCard
            key={card.id}
            card={card}
            onClick={() => onSelectExample(card.query)}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ExplorePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSubmit = useCallback(() => {
    if (query.trim().length < 5 || isNavigating) return;

    setIsNavigating(true);
    const jobId = generateJobId();
    router.push(`/search/${jobId}?q=${encodeURIComponent(query.trim())}`);
  }, [query, isNavigating, router]);

  const handleSelectExample = useCallback((exampleQuery: string) => {
    setQuery(exampleQuery);
    inputRef.current?.focus();
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
        {/* Header */}
        <header className="sticky top-0 z-50 w-full animate-fadeInUp" style={{ animationDelay: '0ms' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628]/98 to-transparent pointer-events-none" />

          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Logo */}
              <Link href="/" className="flex-shrink-0">
                <MinoLogo className="h-5" />
              </Link>

              {/* Center: Search */}
              <div className="flex-1 max-w-md mx-4">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] border border-white/[0.1] focus-within:border-white/20 focus-within:bg-white/[0.1] transition-all">
                  <div className="text-white/40">
                    {isNavigating ? (
                      <LoaderIcon className="w-4 h-4 animate-spin text-blue-400" />
                    ) : (
                      <SearchIcon className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What are you looking for?"
                    className="flex-1 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
                    disabled={isNavigating}
                  />
                  {query.trim().length >= 5 && (
                    <button
                      onClick={handleSubmit}
                      disabled={isNavigating}
                      className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Location + Profile */}
              <div className="flex items-center gap-1">
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
                  title="Location"
                >
                  <MapPinIcon className="w-4 h-4 text-white/60" />
                  <span className="text-white/70 text-xs font-medium">Dallas</span>
                </button>
                <button
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
                  title="Account"
                >
                  <UserIcon className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtle divider */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </header>

        {/* Categories */}
        <main className="flex-1 pt-6 space-y-8 pb-24">
          {CATEGORIES.map((category, index) => (
            <div key={category.id} className="animate-fadeInUp" style={{ animationDelay: `${50 + index * 75}ms` }}>
              <CategoryRow
                category={category}
                onSelectExample={handleSelectExample}
              />
            </div>
          ))}
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
