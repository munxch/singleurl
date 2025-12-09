'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { SearchIcon, LoaderIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon, MicIcon, PaperclipIcon, SendIcon } from '@/components/icons';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { generateJobId } from '@/lib/persistence';
import { SignUpOverlay } from '@/components/demo/layout/SignUpOverlay';

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
    id: 'business',
    label: 'Sales & Research',
    examples: [
      {
        id: 'cfo-search',
        title: 'Find Decision Makers',
        query: 'Find me CFOs at hospitality companies in DFW',
        emoji: '💼',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'lead-gen',
        title: 'Build a Lead List',
        query: 'Find marketing directors at SaaS companies in Austin',
        emoji: '📋',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'competitor-pricing',
        title: 'Research Competitor Pricing',
        query: 'What are competitors charging for project management software?',
        emoji: '💰',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'market-research',
        title: 'Track Market Trends',
        query: 'Find companies that raised Series A in fintech this quarter',
        emoji: '📈',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'hiring-intel',
        title: 'Monitor Competitor Hiring',
        query: 'What roles are my competitors hiring for right now?',
        emoji: '👀',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'vendor-search',
        title: 'Find Vendors & Partners',
        query: 'Find agencies that specialize in Shopify development',
        emoji: '🤝',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'local-business',
        title: 'Find Local Businesses',
        query: 'Find restaurant owners in Dallas who opened in the last year',
        emoji: '🏪',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
    ],
  },
  {
    id: 'dining',
    label: 'Dining & Nightlife',
    examples: [
      {
        id: 'date-night',
        title: 'Find a Date Night Reservation',
        query: 'Date night tonight in Dallas, nice Italian, 7pm for 2',
        emoji: '🍝',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'group-dinner',
        title: 'Book a Group Dinner',
        query: 'Restaurant for 8 people Saturday night in Austin with private room',
        emoji: '🎉',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'brunch',
        title: 'Find the Best Brunch',
        query: 'Best brunch near me with outdoor seating and mimosas',
        emoji: '🥂',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'late-night',
        title: 'Find Late Night Eats',
        query: 'Restaurants open after midnight near downtown',
        emoji: '🌙',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'happy-hour',
        title: 'Find Happy Hour Spots',
        query: 'Best happy hour deals near me with good appetizers',
        emoji: '🍻',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'rooftop-bar',
        title: 'Discover Rooftop Bars',
        query: 'Rooftop bars in downtown with city views',
        emoji: '🌃',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'coffee-shop',
        title: 'Find a Coffee Shop',
        query: 'Quiet coffee shops near me good for working',
        emoji: '☕',
        gradient: 'from-blue-500/30 to-indigo-500/20',
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
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'lease-deals',
        title: 'Find the Best Lease Deals',
        query: 'Best lease deals on electric SUVs in my area',
        emoji: '⚡',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'compare-trucks',
        title: 'Compare Pickup Trucks',
        query: 'Compare Ford F-150 vs Toyota Tundra vs Chevy Silverado 2024',
        emoji: '🛻',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'electric-cars',
        title: 'Find Electric Vehicles',
        query: 'Best used electric cars under $35k with 200+ mile range',
        emoji: '🔋',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'suv-search',
        title: 'Search Family SUVs',
        query: 'Used 3-row SUV under $40k with good safety ratings',
        emoji: '🚙',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'motorcycle',
        title: 'Find a Motorcycle',
        query: 'Used Harley Davidson under $15k in good condition',
        emoji: '🏍️',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'car-value',
        title: 'Check Car Trade-In Value',
        query: 'What is my 2019 Toyota Camry worth for trade-in?',
        emoji: '💰',
        gradient: 'from-blue-500/30 to-indigo-500/20',
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
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'hotels',
        title: 'Find Hotel Deals',
        query: 'Hotels in NYC for New Years Eve under $300/night',
        emoji: '🏨',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'vacation-rental',
        title: 'Book a Vacation Rental',
        query: 'Beach house in Malibu for a week in July, sleeps 6',
        emoji: '🏖️',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'rental-car',
        title: 'Compare Rental Cars',
        query: 'SUV rental in Maui for March 15-22',
        emoji: '🚙',
        gradient: 'from-blue-500/30 to-indigo-500/20',
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
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'all-inclusive',
        title: 'Find All-Inclusive Resorts',
        query: 'All-inclusive resorts in Mexico for couples under $300/night',
        emoji: '🌴',
        gradient: 'from-blue-500/30 to-indigo-500/20',
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
        gradient: 'from-blue-500/30 to-indigo-500/20',
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
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'deals',
        title: 'Find Deals & Coupons',
        query: 'Find deals or coupons for Dyson vacuums',
        emoji: '🏷️',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'laptop',
        title: 'Compare Laptops',
        query: 'Best laptop for video editing under $2000',
        emoji: '💻',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'gaming',
        title: 'Find Gaming Deals',
        query: 'Best price on PS5 with extra controller bundle',
        emoji: '🎮',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'appliance',
        title: 'Compare Appliance Prices',
        query: 'Best price on Samsung Bespoke refrigerator',
        emoji: '🧊',
        gradient: 'from-blue-500/30 to-indigo-500/20',
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
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'insurance',
        title: 'Compare Insurance Quotes',
        query: 'Compare auto insurance for a 2023 Toyota RAV4 in California',
        emoji: '🛡️',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'movers',
        title: 'Get Moving Quotes',
        query: 'Moving companies in Chicago for 2 bedroom apartment',
        emoji: '📦',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'cleaning',
        title: 'Find Cleaning Services',
        query: 'House cleaning services in Seattle with weekly availability',
        emoji: '🧹',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'plumber',
        title: 'Find a Plumber',
        query: 'Emergency plumbers available now in my area',
        emoji: '🚿',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'electrician',
        title: 'Find an Electrician',
        query: 'Licensed electricians for home rewiring project',
        emoji: '💡',
        gradient: 'from-blue-500/30 to-indigo-500/20',
      },
      {
        id: 'lawn-care',
        title: 'Get Lawn Care Quotes',
        query: 'Lawn care services with weekly mowing in my neighborhood',
        emoji: '🌱',
        gradient: 'from-blue-500/30 to-indigo-500/20',
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
      <div className="flex items-center justify-between mb-3 px-6">
        <h2 className="text-sm font-medium text-white/70 uppercase tracking-wider">
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
  const spotlightInputRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  const handleSubmit = useCallback(() => {
    if (query.trim().length < 5 || isNavigating) return;

    setIsNavigating(true);
    const jobId = generateJobId();
    router.push(`/search/${jobId}?q=${encodeURIComponent(query.trim())}`);
  }, [query, isNavigating, router]);

  const openSpotlight = useCallback((initialQuery?: string) => {
    if (initialQuery) {
      setQuery(initialQuery);
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 600);
    }
    setIsSpotlightOpen(true);
    // Focus after animation
    setTimeout(() => spotlightInputRef.current?.focus(), 100);
  }, []);

  const closeSpotlight = useCallback(() => {
    if (!isNavigating) {
      setIsSpotlightOpen(false);
      setQuery('');
    }
  }, [isNavigating]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSpotlightOpen) {
        closeSpotlight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotlightOpen, closeSpotlight]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1628]">
      {/* Sidebar */}
      <Sidebar onSignUp={() => setShowSignUp(true)} />

      {/* Background effects */}
      <div className="ocean-bg pointer-events-none" />
      <div className="wave-overlay pointer-events-none" />

      {/* Content */}
      <div className="content flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0a1628]/80 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: '0ms' }}>
          <div className="relative px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left spacer - accounts for menu button */}
              <div className="w-24 flex-shrink-0" />

              {/* Center: Search trigger */}
              <div className="flex-1 max-w-md">
                <button
                  onClick={() => openSpotlight()}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] border border-white/[0.1] hover:border-white/20 hover:bg-white/[0.1] transition-all text-left"
                >
                  <SearchIcon className="w-4 h-4 text-white/40" />
                  <span className="text-white/40 text-sm">What are you looking for?</span>
                </button>
              </div>

              {/* Right: Sign up */}
              <div className="w-24 flex-shrink-0 flex justify-end">
                <button
                  onClick={() => setShowSignUp(true)}
                  className="px-3 py-1 text-sm text-white/70 hover:text-white rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all whitespace-nowrap"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>

          {/* Subtle divider */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </header>

        {/* Categories */}
        <main className="flex-1 pt-8 space-y-8 pb-12">
          <h1 className="text-4xl font-bold text-white px-6 animate-fadeInUp">
            Explore what's possible
          </h1>
          {CATEGORIES.map((category, index) => (
            <div key={category.id} className="animate-fadeInUp" style={{ animationDelay: `${50 + index * 75}ms` }}>
              <CategoryRow
                category={category}
                onSelectExample={(query) => openSpotlight(query)}
              />
            </div>
          ))}
        </main>
      </div>

      {/* Sign up modal */}
      <SignUpOverlay
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
      />

      {/* Spotlight Search Overlay */}
      {isSpotlightOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0a1628]/90 backdrop-blur-md animate-fadeIn"
            onClick={closeSpotlight}
          />

          {/* Spotlight content */}
          <div className="relative w-full max-w-xl mx-6 animate-scaleIn">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <MinoLogo />
            </div>

            {/* Search Input - styled like home page */}
            <div className={`relative rounded-2xl bg-white/[0.08] border transition-all duration-300 ${
              isGlowing
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4),0_0_40px_rgba(34,211,238,0.2)]'
                : 'border-white/[0.1] shadow-lg shadow-black/20 focus-within:border-white/25 focus-within:bg-white/[0.1]'
            }`}>
              {/* Textarea */}
              <textarea
                ref={spotlightInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="What are you looking for?"
                rows={1}
                className="w-full bg-transparent text-white text-base placeholder-white/40 focus:outline-none resize-none px-4 pt-4 pb-2 min-h-[52px] max-h-[200px]"
                disabled={isNavigating}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                }}
              />

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-3 pb-3">
                {/* Left: Location */}
                <div className="flex items-center">
                  <button
                    className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] transition-all text-cyan-400"
                    title="Set location"
                  >
                    <MapPinIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Attachment, Mic, Send */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 rounded-xl hover:bg-white/[0.08] transition-all text-white/40 hover:text-white/60"
                    title="Attach file"
                  >
                    <PaperclipIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-xl hover:bg-white/[0.08] transition-all text-white/40 hover:text-white/60"
                    title="Voice input"
                  >
                    <MicIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={query.trim().length < 5 || isNavigating}
                    className={`p-2 rounded-xl transition-all ${
                      query.trim().length >= 5 && !isNavigating
                        ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                        : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                    }`}
                    title="Send"
                  >
                    {isNavigating ? (
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <SendIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Hint text */}
            <div className="mt-4 text-center">
              <span className="text-white/30 text-sm">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 text-xs">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
