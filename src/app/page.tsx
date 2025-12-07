'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { LoaderIcon, MapPinIcon, MicIcon, PaperclipIcon, SendIcon } from '@/components/icons';
import { generateJobId } from '@/lib/persistence';

// =============================================================================
// FEATURED EXAMPLES - Best foot forward
// =============================================================================

interface ExampleCard {
  id: string;
  title: string;
  query: string;
  emoji: string;
  gradient: string;
}

// Demo route mapping - queries that have dedicated demo experiences
const DEMO_ROUTES: Record<string, string> = {
  'date night tonight in dallas, nice italian, 7pm for 2': '/demo/date-night-cascade',
  'used honda civic under $25k with apple carplay': '/demo/car-search-cascade',
};

const FEATURED_EXAMPLES: ExampleCard[] = [
  {
    id: 'date-night',
    title: 'Find a Date Night Spot',
    query: 'Date night tonight in Dallas, nice Italian, 7pm for 2',
    emoji: '🍝',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    id: 'used-car',
    title: 'Search Car Inventory',
    query: 'Used Honda Civic under $25k with Apple CarPlay',
    emoji: '🚗',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    id: 'price-check',
    title: 'Price Check Electronics',
    query: 'Find the best price for AirPods Pro 2',
    emoji: '🎧',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    id: 'flights',
    title: 'Search for Flights',
    query: 'Flights from SF to Tokyo in March',
    emoji: '✈️',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    id: 'contractors',
    title: 'Find Local Services',
    query: 'HVAC contractors in Austin with good reviews',
    emoji: '🔧',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    id: 'hotels',
    title: 'Book a Hotel',
    query: 'Hotels in NYC for New Years under $300/night',
    emoji: '🏨',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
];

// =============================================================================
// EXAMPLE LIST ITEM COMPONENT
// =============================================================================

function ExampleItem({ card, onClick }: { card: ExampleCard; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
    >
      <span className="text-lg flex-shrink-0">{card.emoji}</span>
      <span className="text-white/70 text-sm truncate flex-1">{card.query}</span>
      <span className="text-white/30 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        Use
      </span>
    </button>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSubmit = useCallback(() => {
    if (query.trim().length < 5 || isNavigating) return;

    setIsNavigating(true);

    // Check if this query matches a demo route
    const normalizedQuery = query.trim().toLowerCase();
    const demoRoute = DEMO_ROUTES[normalizedQuery];

    if (demoRoute) {
      router.push(demoRoute);
    } else {
      const jobId = generateJobId();
      router.push(`/search/${jobId}?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, isNavigating, router]);

  const handleSelectExample = useCallback((exampleQuery: string) => {
    setQuery(exampleQuery);
    inputRef.current?.focus();
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1628]">
      {/* Background effects */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content - vertically centered, pushed down slightly */}
      <div className="content flex-1 flex flex-col items-center justify-center px-6 pb-20 pt-16">
        <div className="max-w-xl w-full">

          {/* Logo */}
          <Link href="/" className="flex justify-center mb-8 animate-fadeInUp" style={{ animationDelay: '0ms' }}>
            <MinoLogo />
          </Link>

          {/* Search Input */}
          <div className="mb-6 animate-fadeInUp" style={{ animationDelay: '50ms' }}>
            <div className="rounded-2xl bg-white/[0.08] border border-white/[0.1] focus-within:border-white/25 focus-within:bg-white/[0.1] transition-all shadow-lg shadow-black/20">
              {/* Textarea */}
              <textarea
                ref={inputRef}
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
          </div>

          {/* Demo Showcase - See the workflow in action */}
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-3 px-1">
              See it in action
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/demo/date-night-cascade"
                className="group p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/5 border border-white/[0.08] hover:border-amber-500/30 hover:bg-amber-500/15 transition-all"
              >
                <div className="mb-2">
                  <span className="text-2xl">🍝</span>
                </div>
                <div className="text-white font-medium text-sm mb-1">Date Night</div>
                <div className="text-white/50 text-xs">Quick parallel search</div>
              </Link>
              <Link
                href="/demo/car-search-cascade"
                className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-white/[0.08] hover:border-blue-500/30 hover:bg-blue-500/15 transition-all"
              >
                <div className="mb-2">
                  <span className="text-2xl">🚗</span>
                </div>
                <div className="text-white font-medium text-sm mb-1">Car Search</div>
                <div className="text-white/50 text-xs">Complex with escalation</div>
              </Link>
              <Link
                href="/demo/cfo-search-cascade"
                className="group p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-white/[0.08] hover:border-emerald-500/30 hover:bg-emerald-500/15 transition-all"
              >
                <div className="mb-2">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="text-white font-medium text-sm mb-1">CFO Search</div>
                <div className="text-white/50 text-xs">Lead gen with enrichment</div>
              </Link>
            </div>
          </div>

          {/* Featured Examples - stacked list */}
          <div className="flex flex-col gap-2 mb-6 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1 px-1">
              Or try a query
            </div>
            {FEATURED_EXAMPLES.map((card) => (
              <ExampleItem
                key={card.id}
                card={card}
                onClick={() => handleSelectExample(card.query)}
              />
            ))}
          </div>

          {/* Explore All - subtle divider with text */}
          <Link
            href="/explore"
            className="flex items-center justify-center gap-4 py-2 group animate-fadeInUp"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-white/40 text-sm group-hover:text-white/60 transition-colors">
              Explore all
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </Link>
        </div>
      </div>

    </div>
  );
}
