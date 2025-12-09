'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { BottomNav } from '@/components/ui';
import { SearchIcon, ArrowRightIcon, LoaderIcon, CheckIcon, ZapIcon, GlobeIcon, ShieldIcon, ChevronDownIcon } from '@/components/icons';
import { generateJobId } from '@/lib/persistence';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function SectionDivider({ title, number }: { title: string; number: number }) {
  return (
    <div className="flex items-center gap-4 py-8">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/60 text-sm font-bold">
        {number}
      </div>
      <h2 className="text-white/40 text-sm font-medium uppercase tracking-wider">{title}</h2>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ============================================================================
// CONCEPT 1: LIVE DEMO LOOP (Ambient Magic)
// ============================================================================

function LiveDemoLoop() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sites = [
    { name: 'Amazon', price: '$189', status: 'complete' },
    { name: 'Target', price: '$189', status: 'complete' },
    { name: 'Best Buy', price: '$199', status: 'complete' },
    { name: 'Walmart', price: '$194', status: 'loading' },
    { name: 'Apple', price: '$249', status: 'waiting' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sites.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Ghosted/Ambient container */}
      <div className="glass-card p-6 border border-white/5 relative overflow-hidden">
        {/* Scanning line effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-shimmer"
          style={{ backgroundSize: '200% 100%' }}
        />

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/50 text-sm">LIVE: "airpods pro prices"</span>
        </div>

        {/* Site cards grid */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {sites.map((site, i) => (
            <div
              key={site.name}
              className={`
                p-3 rounded-xl text-center transition-all duration-500
                ${i <= activeIndex ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/5'}
              `}
            >
              <div className="text-white/60 text-xs mb-1">{site.name}</div>
              <div className={`text-lg font-semibold ${i <= activeIndex ? 'text-white' : 'text-white/20'}`}>
                {i <= activeIndex ? site.price : '—'}
              </div>
              <div className="mt-1">
                {site.status === 'complete' && i <= activeIndex && (
                  <CheckIcon className="w-4 h-4 text-green-400 mx-auto" />
                )}
                {site.status === 'loading' && i === activeIndex && (
                  <LoaderIcon className="w-4 h-4 text-blue-400 mx-auto animate-spin" />
                )}
                {(site.status === 'waiting' || i > activeIndex) && (
                  <div className="w-4 h-4 rounded-full border border-white/20 mx-auto" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Best result */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <span className="text-xl">🏆</span>
          <div>
            <div className="text-green-300 font-medium">Best: $189 at Amazon</div>
            <div className="text-white/50 text-sm">Arrives Friday · Free Prime shipping</div>
          </div>
        </div>

        {/* CTA text */}
        <div className="text-center mt-4 text-white/40 text-sm">
          This is what happens when you search. Try your own ↑
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 2: ROTATING HERO CARD (Before/After)
// ============================================================================

function RotatingHeroCard() {
  const [activeCard, setActiveCard] = useState(0);
  const examples = [
    {
      query: "Find me the best price for PS5",
      sites: 6,
      time: "23s",
      result: "$449 at Walmart",
      detail: "in stock, free shipping"
    },
    {
      query: "Compare home insurance in Austin",
      sites: 5,
      time: "2m",
      result: "$1,245/yr at Geico",
      detail: "$300k coverage, $1k deductible"
    },
    {
      query: "Roundtrip flights SF to Tokyo",
      sites: 5,
      time: "35s",
      result: "$847 on ANA",
      detail: "nonstop, March 15-22"
    },
    {
      query: "Used Tesla Model Y under $40k",
      sites: 8,
      time: "45s",
      result: "12 found, best $37.5k",
      detail: "2022, 28k miles, local dealer"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % examples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const example = examples[activeCard];

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Content */}
      <div className="space-y-4">
        {/* Query */}
        <div className="text-white/60 text-lg">"{example.query}"</div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <ArrowRightIcon className="w-4 h-4 text-blue-400 rotate-90" />
          </div>
        </div>

        {/* Result */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <CheckIcon className="w-4 h-4 text-green-400" />
            Checked {example.sites} sites in {example.time}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <div className="text-white font-semibold text-lg">{example.result}</div>
              <div className="text-white/50 text-sm">{example.detail}</div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 pt-2">
          {examples.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveCard(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeCard ? 'bg-white w-6' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 3: ONE-CLICK TRY CARDS
// ============================================================================

function OneClickTryCards({ onSelect }: { onSelect: (query: string) => void }) {
  const cards = [
    {
      emoji: '📱',
      title: 'AirPods Pro',
      subtitle: 'prices',
      sites: 6,
      time: '~25 sec',
      query: 'Find the best price for AirPods Pro 2nd generation',
    },
    {
      emoji: '🚗',
      title: 'Tesla Model Y',
      subtitle: 'under $40k',
      sites: 8,
      time: '~45 sec',
      query: 'Find a used Tesla Model Y Long Range under $40k',
    },
    {
      emoji: '✈️',
      title: 'Flights to',
      subtitle: 'Tokyo',
      sites: 5,
      time: '~30 sec',
      query: 'Roundtrip flights from San Francisco to Tokyo in March',
    },
  ];

  return (
    <div>
      <div className="text-white/50 text-sm mb-4 text-center">Try one of these — click to run now:</div>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => onSelect(card.query)}
            className="glass-card p-5 text-left hover:bg-white/10 transition-all group"
          >
            <div className="text-3xl mb-3">{card.emoji}</div>
            <div className="text-white font-medium">{card.title}</div>
            <div className="text-white/50 text-sm mb-4">{card.subtitle}</div>

            <div className="text-white/40 text-xs space-y-1 mb-4">
              <div>{card.sites} sites</div>
              <div>{card.time}</div>
            </div>

            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:text-blue-300">
              Run Now
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 4: TYPEWRITER AUTO-FILL
// ============================================================================

function TypewriterInput() {
  const examples = [
    "Find me the best price for AirPods Pro",
    "Compare auto insurance for a 2023 Toyota RAV4",
    "Roundtrip flights from LA to London in April",
    "Used Honda CR-V under $25k near me",
    "Is the iPhone 16 Pro Max in stock nearby?",
  ];

  const [displayText, setDisplayText] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const example = examples[exampleIndex];
    let charIndex = 0;
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      const typeChar = () => {
        if (charIndex <= example.length) {
          setDisplayText(example.slice(0, charIndex));
          charIndex++;
          timeout = setTimeout(typeChar, 50 + Math.random() * 30);
        } else {
          // Pause at end
          timeout = setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      };
      typeChar();
    } else {
      // Erasing
      let eraseIndex = displayText.length;
      const eraseChar = () => {
        if (eraseIndex > 0) {
          setDisplayText(displayText.slice(0, eraseIndex - 1));
          eraseIndex--;
          timeout = setTimeout(eraseChar, 20);
        } else {
          setExampleIndex((prev) => (prev + 1) % examples.length);
          setIsTyping(true);
        }
      };
      timeout = setTimeout(eraseChar, 500);
    }

    return () => clearTimeout(timeout);
  }, [exampleIndex, isTyping]);

  return (
    <div>
      <div className="glass-card p-1.5">
        <div className="flex items-center gap-3">
          <div className="text-white/70 ml-2">
            <SearchIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 py-3">
            <span className="text-white text-lg">{displayText}</span>
            <span className="inline-block w-0.5 h-5 bg-blue-400 ml-0.5 animate-pulse" />
          </div>
          <button className="p-3 mr-1 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all">
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="text-center mt-3 text-white/40 text-sm">
        Press Enter to run this example, or start typing your own
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 5: STATS FLEX (Social Proof)
// ============================================================================

function StatsFlex() {
  const stats = [
    { value: '2,847', label: 'searches today' },
    { value: '$47k', label: 'saved found' },
    { value: '23s', label: 'average time' },
    { value: '142', label: 'sites checked' },
  ];

  const trending = ['AirPods Pro ($189)', 'PS5 Slim', 'RTX 4080', 'Model Y'];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Trending */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-orange-400">🔥</span>
        <span className="text-white/50 text-sm">Trending:</span>
        <div className="flex gap-2">
          {trending.map((item) => (
            <span
              key={item}
              className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm hover:bg-white/10 cursor-pointer transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 6: SPLIT RESULT PREVIEW
// ============================================================================

function SplitResultPreview() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: You Ask */}
      <div className="glass-card p-5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3">You Ask</div>
        <div className="text-white/80 text-lg mb-4">"best price for AirPods Pro"</div>

        <div className="flex justify-center my-4">
          <ArrowRightIcon className="w-5 h-5 text-white/30 rotate-90" />
        </div>

        <div className="space-y-2 text-white/50 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Checks 6 stores
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Takes ~25 seconds
          </div>
        </div>
      </div>

      {/* Right: Mino Returns */}
      <div className="glass-card p-5 border-green-500/20">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Mino Returns</div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🏆</span>
          <span className="text-green-300 font-semibold text-lg">Amazon: $189</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-white/70">
            <CheckIcon className="w-4 h-4 text-green-400" />
            In stock
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <CheckIcon className="w-4 h-4 text-green-400" />
            Arrives Friday
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <CheckIcon className="w-4 h-4 text-green-400" />
            $60 cheaper than Apple
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-white/40 text-xs">
          + comparison table · + direct buy link
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 11: REFINED JOBS MENU (Fill Input, Don't Auto-Run)
// ============================================================================

function RefinedJobsMenu({ onFillInput }: { onFillInput: (query: string, hint?: string) => void }) {
  const categories = [
    {
      id: 'shopping',
      emoji: '🛒',
      label: 'Shopping & Prices',
      jobs: [
        {
          title: 'Price check a product',
          template: 'Find the best price for [product name]',
          example: 'Find the best price for AirPods Pro 2nd generation',
          hint: 'Replace [product name] with what you want',
          sites: 6,
          time: '~25 sec',
        },
        {
          title: 'Find deals & coupons',
          template: 'Find deals or coupons for [product/store]',
          example: 'Find deals or coupons for Dyson vacuums',
          hint: 'Specify a product or store',
          sites: 8,
          time: '~30 sec',
        },
        {
          title: 'Compare products',
          template: 'Compare [product A] vs [product B]',
          example: 'Compare iPhone 16 Pro vs Samsung S24 Ultra',
          hint: 'Name the products to compare',
          sites: 5,
          time: '~45 sec',
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
          template: 'Find a [year] [make] [model] under $[price] near [location]',
          example: 'Find a used Tesla Model Y under $40k near Austin',
          hint: 'Customize year, make, model, budget, location',
          sites: 8,
          time: '~45 sec',
        },
        {
          title: 'Compare car prices',
          template: 'Compare prices on [car] at dealers within [miles] miles',
          example: 'Compare prices on Honda CR-V at dealers within 50 miles',
          hint: 'Specify car and search radius',
          sites: 6,
          time: '~40 sec',
        },
      ],
    },
    {
      id: 'insurance',
      emoji: '🛡️',
      label: 'Insurance & Quotes',
      jobs: [
        {
          title: 'Auto insurance quotes',
          template: 'Compare auto insurance for a [year] [car] in [state]',
          example: 'Compare auto insurance for a 2023 Toyota RAV4 in California',
          hint: 'Add your car and state',
          sites: 5,
          time: '~2 min',
        },
        {
          title: 'Home insurance quotes',
          template: 'Home insurance quotes for a $[value] house in [city]',
          example: 'Home insurance quotes for a $500k house in Austin',
          hint: 'Add home value and location',
          sites: 5,
          time: '~2 min',
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
          template: 'Flights from [origin] to [destination] in [month]',
          example: 'Flights from San Francisco to Tokyo in March',
          hint: 'Add your cities and travel dates',
          sites: 5,
          time: '~30 sec',
        },
        {
          title: 'Compare hotels',
          template: 'Hotels in [city] for [dates] under $[price]/night',
          example: 'Hotels in NYC for New Years Eve under $300/night',
          hint: 'Specify city, dates, budget',
          sites: 5,
          time: '~35 sec',
        },
        {
          title: 'Rental cars',
          template: 'Car rental in [location] for [dates]',
          example: 'SUV rental in Maui for March 15-22',
          hint: 'Add location and dates',
          sites: 4,
          time: '~25 sec',
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
          template: 'Is [product] in stock at stores near [location]?',
          example: 'Is the iPhone 16 Pro Max in stock near me?',
          hint: 'Add product and your location',
          sites: 10,
          time: '~20 sec',
        },
        {
          title: 'Find service providers',
          template: 'Find [service] providers in [city] with good reviews',
          example: 'Find HVAC contractors in Austin with good reviews',
          hint: 'Specify service type and city',
          sites: 5,
          time: '~30 sec',
        },
      ],
    },
    {
      id: 'research',
      emoji: '🔬',
      label: 'Research & Reviews',
      jobs: [
        {
          title: 'Product research',
          template: 'Best [product category] for [use case] under $[budget]',
          example: 'Best robot vacuum for pet hair under $500',
          hint: 'Add category, use case, budget',
          sites: 6,
          time: '~45 sec',
        },
        {
          title: 'Compare services',
          template: 'Compare [service A] vs [service B] for [use case]',
          example: 'Compare YouTube TV vs Hulu Live for sports',
          hint: 'Name the services to compare',
          sites: 5,
          time: '~40 sec',
        },
      ],
    },
  ];

  const [expandedCategory, setExpandedCategory] = useState<string | null>('shopping');

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const isExpanded = expandedCategory === category.id;

        return (
          <div key={category.id} className="glass-card overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.emoji}</span>
                <span className="text-white font-medium">{category.label}</span>
                <span className="text-white/30 text-sm">{category.jobs.length} templates</span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Jobs */}
            {isExpanded && (
              <div className="border-t border-white/10 divide-y divide-white/5">
                {category.jobs.map((job, i) => (
                  <button
                    key={i}
                    onClick={() => onFillInput(job.example, job.hint)}
                    className="w-full p-4 text-left hover:bg-white/5 transition-colors group"
                  >
                    {/* Job Title */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{job.title}</span>
                      <span className="text-white/30 text-xs">{job.sites} sites • {job.time}</span>
                    </div>

                    {/* Template with brackets highlighted */}
                    <div className="text-white/40 text-sm mb-2 font-mono">
                      {job.template.split(/(\[[^\]]+\])/).map((part, idx) => (
                        part.startsWith('[') ? (
                          <span key={idx} className="text-blue-400/70 bg-blue-500/10 px-1 rounded">{part}</span>
                        ) : (
                          <span key={idx}>{part}</span>
                        )
                      ))}
                    </div>

                    {/* Example */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/20 text-xs">EXAMPLE:</span>
                      <span className="text-white/60 text-sm group-hover:text-white transition-colors">"{job.example}"</span>
                    </div>

                    {/* Fill indicator */}
                    <div className="mt-2 flex items-center gap-1.5 text-blue-400/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRightIcon className="w-3 h-3 -rotate-45" />
                      Click to fill input
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// CONCEPT 8: HIGH-VALUE JOBS LIST (The Menu)
// ============================================================================

function HighValueJobsList({ onSelect }: { onSelect: (query: string) => void }) {
  const categories = [
    {
      id: 'save-money',
      label: '💰 Save Money',
      description: 'Find the best prices across the web',
      jobs: [
        {
          title: 'Price check any product',
          subtitle: 'Compare prices across 6+ major retailers instantly',
          example: 'Find the best price for AirPods Pro 2nd generation',
          sites: ['Amazon', 'Best Buy', 'Walmart', 'Target', 'Costco', 'Apple'],
          value: 'Users save $47 on average',
        },
        {
          title: 'Find hidden deals',
          subtitle: 'Surface discounts that aren\'t advertised',
          example: 'Find any current deals or coupons for a Dyson V15 vacuum',
          sites: ['Retailer sites', 'Coupon sites', 'Deal forums'],
          value: 'Finds deals 73% of users miss',
        },
        {
          title: 'Track price drops',
          subtitle: 'Get notified when prices fall to your target',
          example: 'Alert me when PS5 drops below $400',
          sites: ['All major retailers'],
          value: 'Average wait: 2 weeks to hit target',
        },
      ],
    },
    {
      id: 'big-purchases',
      label: '🚗 Big Purchases',
      description: 'Research major decisions thoroughly',
      jobs: [
        {
          title: 'Search dealer inventory',
          subtitle: 'Find cars at local dealers before they hit aggregators',
          example: 'Find a used Tesla Model Y Long Range under $40k within 50 miles',
          sites: ['Dealer sites', 'CarGurus', 'Autotrader', 'Cars.com', 'Carvana'],
          value: 'Finds 3x more inventory than aggregators alone',
        },
        {
          title: 'Compare insurance quotes',
          subtitle: 'Get real quotes from multiple providers in minutes',
          example: 'Compare auto insurance quotes for a 2023 Toyota RAV4 in California',
          sites: ['Geico', 'Progressive', 'State Farm', 'Allstate', 'USAA'],
          value: 'Average savings: $847/year',
        },
        {
          title: 'Research home services',
          subtitle: 'Compare contractors, get quotes, read real reviews',
          example: 'Find top-rated HVAC contractors in Austin with free estimates',
          sites: ['Yelp', 'Angi', 'HomeAdvisor', 'Google', 'BBB'],
          value: 'Compares 5+ providers in one search',
        },
      ],
    },
    {
      id: 'travel',
      label: '✈️ Travel',
      description: 'Book smarter, travel better',
      jobs: [
        {
          title: 'Find the best flights',
          subtitle: 'Compare across airlines and booking sites',
          example: 'Cheapest roundtrip flights from SF to Tokyo in March',
          sites: ['Google Flights', 'Kayak', 'Skyscanner', 'Direct airlines'],
          value: 'Finds fares $200+ cheaper on average',
        },
        {
          title: 'Hotel price comparison',
          subtitle: 'Find the real best rate, not just the advertised one',
          example: 'Compare 4-star hotels in NYC for New Year\'s Eve weekend',
          sites: ['Booking.com', 'Hotels.com', 'Expedia', 'Direct hotel sites'],
          value: 'Includes member rates & hidden fees',
        },
        {
          title: 'Rental car deals',
          subtitle: 'Compare all agencies including prepaid discounts',
          example: 'Week-long SUV rental in Maui, best price with free cancellation',
          sites: ['Costco Travel', 'AutoSlash', 'Kayak', 'Direct agencies'],
          value: 'Prepaid rates save 30% on average',
        },
      ],
    },
    {
      id: 'local',
      label: '📍 Local & Availability',
      description: 'Find what you need, right now',
      jobs: [
        {
          title: 'Check local stock',
          subtitle: 'See what\'s actually in stock at stores near you',
          example: 'Is the iPhone 16 Pro Max 256GB in stock at stores near me?',
          sites: ['Apple', 'Best Buy', 'Target', 'Walmart', 'Carrier stores'],
          value: 'Real-time inventory from 10+ stores',
        },
        {
          title: 'Find appointments',
          subtitle: 'Check availability across multiple providers',
          example: 'Find dentists accepting new patients in Brooklyn with Saturday hours',
          sites: ['Zocdoc', 'Healthgrades', 'Google', 'Direct sites'],
          value: 'Shows next available appointments',
        },
        {
          title: 'Restaurant reservations',
          subtitle: 'Find open tables when everywhere seems booked',
          example: 'Find Italian restaurants in Manhattan with availability Saturday 7pm for 4',
          sites: ['OpenTable', 'Resy', 'Yelp', 'Google'],
          value: 'Finds cancellations & bar seating',
        },
      ],
    },
    {
      id: 'research',
      label: '🔬 Deep Research',
      description: 'Get comprehensive answers, not just links',
      jobs: [
        {
          title: 'Product research',
          subtitle: 'Aggregate reviews, specs, and comparisons',
          example: 'Compare the top 5 robot vacuums for pet hair under $500',
          sites: ['Wirecutter', 'RTINGS', 'Reddit', 'Amazon reviews'],
          value: 'Synthesizes 100+ reviews into recommendations',
        },
        {
          title: 'Company research',
          subtitle: 'Background check before you buy or apply',
          example: 'What do employees say about working at Stripe? Pros and cons?',
          sites: ['Glassdoor', 'Blind', 'LinkedIn', 'News'],
          value: 'Aggregates insider perspectives',
        },
        {
          title: 'Service comparisons',
          subtitle: 'Compare subscription services and alternatives',
          example: 'Compare YouTube TV vs Hulu Live vs Sling for sports coverage',
          sites: ['Review sites', 'Reddit', 'Official sites'],
          value: 'Side-by-side feature comparison',
        },
      ],
    },
  ];

  const [expandedCategory, setExpandedCategory] = useState<string | null>('save-money');

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const isExpanded = expandedCategory === category.id;

        return (
          <div key={category.id} className="glass-card overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.label.split(' ')[0]}</span>
                <div>
                  <div className="text-white font-medium text-left">{category.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-white/50 text-sm text-left">{category.description}</div>
                </div>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Jobs */}
            {isExpanded && (
              <div className="border-t border-white/10">
                {category.jobs.map((job, i) => (
                  <button
                    key={i}
                    onClick={() => onSelect(job.example)}
                    className="w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title & Subtitle */}
                        <div className="text-white font-medium mb-1">{job.title}</div>
                        <div className="text-white/50 text-sm mb-3">{job.subtitle}</div>

                        {/* Example query */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-white/30 text-xs">TRY:</span>
                          <span className="text-blue-400/80 text-sm italic truncate">"{job.example}"</span>
                        </div>

                        {/* Sites */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {job.sites.slice(0, 4).map((site) => (
                            <span key={site} className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-xs">
                              {site}
                            </span>
                          ))}
                          {job.sites.length > 4 && (
                            <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-xs">
                              +{job.sites.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Value prop */}
                        <div className="flex items-center gap-1.5 text-green-400/80 text-xs">
                          <CheckIcon className="w-3 h-3" />
                          {job.value}
                        </div>
                      </div>

                      {/* Run button */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                          <ArrowRightIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// CONCEPT 9: COMPACT HIGH-VALUE LIST (Cards Style)
// ============================================================================

function CompactJobCards({ onSelect }: { onSelect: (query: string) => void }) {
  const jobs = [
    {
      emoji: '💰',
      category: 'Save Money',
      title: 'Price check anything',
      example: 'Find the best price for AirPods Pro 2nd generation',
      metrics: '6 stores • ~25 sec • avg $47 saved',
    },
    {
      emoji: '🚗',
      category: 'Auto',
      title: 'Search dealer inventory',
      example: 'Find a used Tesla Model Y under $40k near me',
      metrics: '8 dealers • ~45 sec • 3x more listings',
    },
    {
      emoji: '🛡️',
      category: 'Insurance',
      title: 'Compare real quotes',
      example: 'Compare auto insurance for a 2023 RAV4 in California',
      metrics: '5 providers • ~2 min • avg $847/yr saved',
    },
    {
      emoji: '✈️',
      category: 'Travel',
      title: 'Find best flights',
      example: 'Roundtrip flights SF to Tokyo in March',
      metrics: '5 sites • ~30 sec • finds hidden fares',
    },
    {
      emoji: '📍',
      category: 'Local',
      title: 'Check real-time stock',
      example: 'Is iPhone 16 Pro Max in stock near me?',
      metrics: '10+ stores • ~20 sec • live inventory',
    },
    {
      emoji: '🔬',
      category: 'Research',
      title: 'Deep product research',
      example: 'Best robot vacuum for pet hair under $500',
      metrics: '100+ reviews • ~45 sec • synthesized recs',
    },
  ];

  return (
    <div className="space-y-2">
      {jobs.map((job, i) => (
        <button
          key={i}
          onClick={() => onSelect(job.example)}
          className="w-full glass-card p-4 text-left hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            {/* Emoji */}
            <div className="text-2xl">{job.emoji}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium">{job.title}</span>
                <span className="text-white/30 text-xs">• {job.category}</span>
              </div>
              <div className="text-white/50 text-sm truncate mb-1">"{job.example}"</div>
              <div className="text-white/30 text-xs">{job.metrics}</div>
            </div>

            {/* Arrow */}
            <ArrowRightIcon className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// CONCEPT 10: VALUE-FIRST STACKED LIST
// ============================================================================

function ValueFirstList({ onSelect }: { onSelect: (query: string) => void }) {
  const items = [
    {
      value: 'Save $47 on average',
      action: 'Price check any product',
      example: 'Find the best price for AirPods Pro 2nd generation',
      color: 'green',
    },
    {
      value: 'Find 3x more listings',
      action: 'Search dealer inventory directly',
      example: 'Find a used Tesla Model Y under $40k within 50 miles',
      color: 'blue',
    },
    {
      value: 'Save $847/year average',
      action: 'Compare insurance quotes',
      example: 'Compare auto insurance for a 2023 RAV4 in California',
      color: 'purple',
    },
    {
      value: 'Find fares $200+ cheaper',
      action: 'Search all flight options',
      example: 'Roundtrip flights from SF to Tokyo in March',
      color: 'sky',
    },
    {
      value: 'Real-time from 10+ stores',
      action: 'Check local availability',
      example: 'Is the iPhone 16 Pro Max in stock near me?',
      color: 'orange',
    },
    {
      value: 'Synthesize 100+ reviews',
      action: 'Deep product research',
      example: 'Best robot vacuum for pet hair under $500',
      color: 'pink',
    },
  ];

  const colorClasses: Record<string, string> = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onSelect(item.example)}
          className="w-full p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            {/* Value badge */}
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${colorClasses[item.color]}`}>
              {item.value}
            </div>

            {/* Action */}
            <div className="flex-1">
              <div className="text-white/80 font-medium">{item.action}</div>
              <div className="text-white/40 text-sm truncate">"{item.example}"</div>
            </div>

            {/* Arrow */}
            <ArrowRightIcon className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-all" />
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// BONUS CONCEPT 7: CATEGORY CARDS (Elevated Pills)
// ============================================================================

function CategoryCards({ onSelect }: { onSelect: (query: string) => void }) {
  const categories = [
    {
      icon: SearchIcon,
      label: 'Shopping',
      color: 'blue',
      description: 'Price comparisons across retailers',
      example: 'Find the best price for AirPods Pro',
    },
    {
      icon: ShieldIcon,
      label: 'Insurance',
      color: 'purple',
      description: 'Quote comparisons in minutes',
      example: 'Compare auto insurance for a 2023 Toyota RAV4',
    },
    {
      icon: ZapIcon,
      label: 'Auto',
      color: 'orange',
      description: 'Search dealers & aggregators',
      example: 'Find a used Tesla Model Y under $40k',
    },
    {
      icon: GlobeIcon,
      label: 'Travel',
      color: 'sky',
      description: 'Flights, hotels, car rentals',
      example: 'Roundtrip flights SF to Tokyo in March',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 hover:border-orange-500/50',
    sky: 'from-sky-500/20 to-sky-500/5 border-sky-500/30 hover:border-sky-500/50',
  };

  const iconColorMap: Record<string, string> = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    sky: 'text-sky-400',
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.label}
            onClick={() => onSelect(cat.example)}
            className={`
              p-5 rounded-2xl text-left transition-all
              bg-gradient-to-br ${colorMap[cat.color]}
              border backdrop-blur-sm
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-5 h-5 ${iconColorMap[cat.color]}`} />
              <span className="text-white font-medium">{cat.label}</span>
            </div>
            <div className="text-white/50 text-sm">{cat.description}</div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ExplorePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (query.trim().length < 5 || isNavigating) return;
    setIsNavigating(true);
    const jobId = generateJobId();
    router.push(`/search/${jobId}?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectExample = (exampleQuery: string) => {
    setIsNavigating(true);
    const jobId = generateJobId();
    router.push(`/search/${jobId}?q=${encodeURIComponent(exampleQuery)}`);
  };

  // Fill input instead of navigating - for templates
  const handleFillInput = (exampleQuery: string, hintText?: string) => {
    setQuery(exampleQuery);
    setHint(hintText || 'Edit to customize, then press Enter');
    inputRef.current?.focus();
    inputRef.current?.select();

    // Clear hint after a few seconds
    setTimeout(() => setHint(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content flex-1 flex flex-col">
        {/* Fixed header */}
        <header className="flex items-center justify-center px-6 py-4" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
          <MinoLogo />
        </header>

        {/* Sticky Search Input */}
        <div className="sticky top-0 z-50 px-6 py-4 bg-gradient-to-b from-[#0a1628] via-[#0a1628] to-transparent">
          <div className="max-w-2xl mx-auto">
            <h1 className="mb-4 text-white/80 text-center text-2xl font-medium">
              What can we help you find?
            </h1>
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
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setHint(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="What would you like to find?"
                  className="flex-1 bg-transparent border-none text-white text-lg placeholder-white/50 focus:outline-none py-3"
                  disabled={isNavigating}
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

            {/* Hint toast */}
            {hint && (
              <div className="mt-3 flex items-center justify-center gap-2 text-blue-400 text-sm animate-fadeIn">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {hint}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Concepts */}
        <main className="flex-1 px-6 pb-24">
          <div className="max-w-2xl mx-auto">

            {/* Concept 1: Live Demo Loop */}
            <SectionDivider title="Live Demo Loop (Ambient Magic)" number={1} />
            <LiveDemoLoop />

            {/* Concept 2: Rotating Hero Card */}
            <SectionDivider title="Rotating Hero Card (Before/After)" number={2} />
            <RotatingHeroCard />

            {/* Concept 3: One-Click Try Cards */}
            <SectionDivider title="One-Click Try Cards" number={3} />
            <OneClickTryCards onSelect={handleSelectExample} />

            {/* Concept 4: Typewriter Auto-Fill */}
            <SectionDivider title="Typewriter Auto-Fill" number={4} />
            <TypewriterInput />

            {/* Concept 5: Stats Flex */}
            <SectionDivider title="Stats Flex (Social Proof)" number={5} />
            <StatsFlex />

            {/* Concept 6: Split Result Preview */}
            <SectionDivider title="Split Result Preview" number={6} />
            <SplitResultPreview />

            {/* Bonus: Category Cards */}
            <SectionDivider title="Category Cards (Elevated Pills)" number={7} />
            <CategoryCards onSelect={handleSelectExample} />

            {/* Concept 8: High-Value Jobs List */}
            <SectionDivider title="High-Value Jobs List (The Menu)" number={8} />
            <HighValueJobsList onSelect={handleSelectExample} />

            {/* Concept 9: Compact Job Cards */}
            <SectionDivider title="Compact Job Cards" number={9} />
            <CompactJobCards onSelect={handleSelectExample} />

            {/* Concept 10: Value-First List */}
            <SectionDivider title="Value-First Stacked List" number={10} />
            <ValueFirstList onSelect={handleSelectExample} />

            {/* Concept 11: Refined Jobs Menu (THE RECOMMENDED ONE) */}
            <div className="mt-8 mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
                <span>⭐</span> RECOMMENDED
              </div>
              <div className="text-white/60 text-sm">
                This version fills the input for editing instead of auto-running.
                Shows templates with [placeholders] the user should customize.
              </div>
            </div>
            <SectionDivider title="Refined Jobs Menu (Fill Input)" number={11} />
            <RefinedJobsMenu onFillInput={handleFillInput} />

            {/* Spacer */}
            <div className="h-16" />

          </div>
        </main>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
