'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { ArrowRightIcon, LoaderIcon, MapPinIcon, MicIcon, PaperclipIcon } from '@/components/icons';
import { generateJobId } from '@/lib/persistence';
import { SignUpOverlay } from '@/components/demo/layout/SignUpOverlay';
import { Sidebar } from '@/components/ui/Sidebar';

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
  'find me a nice italian spot in dallas for date night tonight, 7pm for 2': '/demo/date-night-cascade',
  'find a 2024 lexus gx overtrail in dallas': '/demo/car-search-cascade',
  'find me cfos at hospitality companies in dfw': '/demo/cfo-search-cascade',
};

const FEATURED_EXAMPLES: ExampleCard[] = [
  {
    id: 'date-night',
    title: 'Snag a dinner reservation',
    query: 'Find me a nice Italian spot in Dallas for date night tonight, 7pm for 2',
    emoji: '🍝',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    id: 'car-search',
    title: 'Find the perfect car',
    query: 'Find a 2024 Lexus GX Overtrail in Dallas',
    emoji: '🚗',
    gradient: 'from-blue-500/30 to-cyan-500/20',
  },
  {
    id: 'cfo-search',
    title: 'Find leads for outreach',
    query: 'Find me CFOs at hospitality companies in DFW',
    emoji: '💼',
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
      className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
    >
      <span className="text-lg flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">{card.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-white/60 group-hover:text-white font-medium text-sm transition-colors">{card.title}</div>
        <div className="text-white/30 group-hover:text-white/50 text-xs truncate mt-0.5 transition-colors">{card.query}</div>
      </div>
      <span className="text-white/30 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
        Try
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
  const [isGlowing, setIsGlowing] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

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
    setIsGlowing(true);
    inputRef.current?.focus();
    // Remove glow after animation
    setTimeout(() => setIsGlowing(false), 600);
  }, []);

  return (
    <div className="h-screen flex bg-[#0a1628] overflow-hidden">
      {/* Sidebar */}
      <Sidebar onSignUp={() => setShowSignUp(true)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Background effects */}
        <div className="ocean-bg pointer-events-none" />
        <div className="wave-overlay pointer-events-none" />

        {/* Top bar with sign up */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={() => setShowSignUp(true)}
            className="px-4 py-1.5 text-sm text-white/70 hover:text-white rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
          >
            Sign up
          </button>
        </div>

        {/* Main content - centered, pushed down slightly */}
        <div className="content flex-1 flex flex-col items-center justify-center px-6 pt-16">
        <div className="max-w-xl w-full">
          {/* Logo */}
          <Link href="/" className="flex justify-center mb-8 animate-fadeInUp" style={{ animationDelay: '0ms' }}>
            <MinoLogo />
          </Link>

          {/* Search Input */}
          <div className="animate-fadeInUp" style={{ animationDelay: '50ms' }}>
            <div className={`relative rounded-2xl bg-white/[0.08] border transition-all duration-300 ${
              isGlowing
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4),0_0_40px_rgba(34,211,238,0.2)]'
                : 'border-white/[0.1] shadow-lg shadow-black/20 focus-within:border-white/25 focus-within:bg-white/[0.1]'
            }`}>
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
                  placeholder="What can Mino do for you?"
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
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] transition-all text-white/50 hover:text-white/70"
                      title="Set location"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <span className="text-sm">Dallas</span>
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
                        <ArrowRightIcon className="w-4 h-4" />
                      )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start - nested under search */}
          <div className="mt-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-white/40 text-xs uppercase tracking-wider">Quick start</span>
              <Link
                href="/explore"
                className="text-white/40 text-xs hover:text-white/60 transition-colors"
              >
                See all →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {FEATURED_EXAMPLES.slice(0, 3).map((card) => (
                <ExampleItem
                  key={card.id}
                  card={card}
                  onClick={() => handleSelectExample(card.query)}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Sign up modal */}
      <SignUpOverlay
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
      />
    </div>
  );
}
