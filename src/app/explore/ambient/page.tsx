'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MicIcon, SendIcon, LoaderIcon } from '@/components/icons';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { generateJobId } from '@/lib/persistence';

// Dynamically import AudioOrb to avoid SSR issues
const AudioOrb = dynamic(
  () => import('@/components/ui/AudioOrb').then(mod => ({ default: mod.AudioOrb })),
  {
    ssr: false,
    loading: () => (
      <div className="w-72 h-72 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 animate-pulse" />
    ),
  }
);

// =============================================================================
// TYPES
// =============================================================================

type FlowState = 'waiting' | 'active' | 'listening' | 'processing';

interface PromptCard {
  id: string;
  title: string;
  query: string;
  emoji: string;
}

interface RecentRun {
  id: string;
  title: string;
  status: 'working' | 'completed' | 'watching';
  time: string;
  icon: string;
}

// =============================================================================
// PROMPT CARDS
// =============================================================================

const PROMPT_CARDS: PromptCard[] = [
  {
    id: 'date-night',
    title: 'Snag a dinner reservation',
    query: 'Find me a nice Italian spot in Dallas for date night tonight, 7pm for 2',
    emoji: '🍝',
  },
  {
    id: 'car-search',
    title: 'Find the perfect car',
    query: 'Find a 2024 Lexus GX Overtrail in Dallas',
    emoji: '🚗',
  },
  {
    id: 'cfo-search',
    title: 'Find leads for outreach',
    query: 'Find me CFOs at hospitality companies in DFW',
    emoji: '💼',
  },
];

// Demo route mapping
const DEMO_ROUTES: Record<string, string> = {
  'find me a nice italian spot in dallas for date night tonight, 7pm for 2': '/demo/date-night-cascade',
  'find a 2024 lexus gx overtrail in dallas': '/demo/car-search-cascade',
  'find me cfos at hospitality companies in dfw': '/demo/cfo-search-cascade',
};

// Recent runs for the idle state
const RECENT_RUNS: RecentRun[] = [
  { id: '1', title: 'Honda Civic search', status: 'completed', time: '3 hrs ago', icon: '🚗' },
  { id: '2', title: 'Lucia reservation', status: 'completed', time: 'Confirmed for tonight', icon: '🍽️' },
  { id: '3', title: 'AirPods Pro price', status: 'watching', time: 'Watching for drops', icon: '💰' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function AmbientHomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [state, setState] = useState<FlowState>('waiting');
  const [query, setQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // Auto-focus input when becoming active
  useEffect(() => {
    if (state === 'active' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [state]);

  const handleOrbTap = useCallback(() => {
    if (state === 'waiting') {
      setState('active');
    }
  }, [state]);

  const handleMicTap = useCallback(() => {
    if (state === 'active') {
      setState('listening');
    } else if (state === 'listening') {
      setState('active');
    }
  }, [state]);

  const handleSelectCard = useCallback((card: PromptCard) => {
    setQuery(card.query);
    // Auto-submit after a brief moment
    setTimeout(() => {
      handleSubmitQuery(card.query);
    }, 200);
  }, []);

  const handleSubmitQuery = useCallback((queryText?: string) => {
    const q = queryText || query;
    if (q.trim().length < 5 || isNavigating) return;

    setIsNavigating(true);
    setState('processing');

    const normalizedQuery = q.trim().toLowerCase();
    const demoRoute = DEMO_ROUTES[normalizedQuery];

    setTimeout(() => {
      if (demoRoute) {
        router.push(demoRoute);
      } else {
        const jobId = generateJobId();
        router.push(`/search/${jobId}?q=${encodeURIComponent(q.trim())}`);
      }
    }, 800);
  }, [query, isNavigating, router]);

  const handleBackdropClick = useCallback(() => {
    if (state === 'active' && query.trim().length === 0) {
      setState('waiting');
    }
  }, [state, query]);

  // Determine orb mode based on state
  const getOrbMode = () => {
    switch (state) {
      case 'waiting': return 'idle';
      case 'active': return 'active';
      case 'listening': return 'listening';
      case 'processing': return 'speaking';
      default: return 'idle';
    }
  };

  // Determine orb size based on state
  const getOrbSize = () => {
    switch (state) {
      case 'waiting': return 280;
      case 'active': return 200;
      case 'listening': return 220;
      case 'processing': return 240;
      default: return 280;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] overflow-hidden relative">
      {/* Background effects - always present */}
      <div className="ocean-bg pointer-events-none" />
      <div className="wave-overlay pointer-events-none" />

      {/* Darkening overlay when active */}
      <div
        className={`
          fixed inset-0 bg-black/70 backdrop-blur-sm z-10
          transition-opacity duration-500
          ${state !== 'waiting' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleBackdropClick}
      />

      {/* Logo - subtle at top */}
      <div
        className={`
          fixed top-8 left-1/2 -translate-x-1/2 z-30
          transition-all duration-500
          ${state !== 'waiting' ? 'opacity-30 scale-90' : 'opacity-60'}
        `}
      >
        <MinoLogo />
      </div>

      {/* Close button - appears when active */}
      <button
        onClick={() => {
          setState('waiting');
          setQuery('');
        }}
        className={`
          fixed top-6 right-6 z-30 p-2 rounded-full
          bg-white/10 hover:bg-white/20
          text-white/50 hover:text-white
          transition-all duration-300
          ${state !== 'waiting' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Scrollable container */}
      <div className="relative z-20">

        {/* Hero section - full viewport, orb centered */}
        <div className="h-screen flex flex-col items-center justify-center px-6 relative">
          {/* Orb container */}
          <div
            className={`
              relative transition-all duration-500 ease-out
              ${state === 'waiting' ? 'cursor-pointer group' : ''}
              ${state === 'active' ? '-translate-y-16' : ''}
              ${state === 'listening' ? '-translate-y-12' : ''}
              ${state === 'processing' ? 'scale-105' : ''}
            `}
            onClick={state === 'waiting' ? handleOrbTap : undefined}
          >
            {/* Clickable ring indicator - tighter, subtler */}
            {state === 'waiting' && (
              <div className="absolute inset-0 rounded-full border border-white/[0.08] group-hover:border-cyan-400/30 transition-colors duration-300" />
            )}

            <AudioOrb
              mode={getOrbMode()}
              size={getOrbSize()}
              audioEnabled={state === 'listening'}
            />

            {/* "Tap to start" text - tight to orb */}
            <div
              className={`
                absolute -bottom-10 left-1/2 -translate-x-1/2 text-center
                transition-all duration-300
                ${state === 'waiting' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}
            >
              <p className="text-white/40 text-sm group-hover:text-white/60 transition-colors">Tap to start</p>
            </div>
          </div>

          {/* Scroll indicator - only in waiting state */}
          <div
            className={`
              absolute bottom-8 left-1/2 -translate-x-1/2
              flex flex-col items-center gap-2
              transition-all duration-500
              ${state === 'waiting' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
          >
            <span className="text-white/30 text-xs">Recent jobs</span>
            <svg
              className="w-5 h-5 text-white/20 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Jobs section - below the fold */}
        <div
          className={`
            min-h-screen px-4 py-12 bg-gradient-to-b from-transparent to-black/20
            transition-opacity duration-500
            ${state === 'waiting' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          {/* Jobs container */}
          <div className="max-w-md mx-auto">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-white/60 text-lg font-medium">Jobs</h2>
              <div className="flex items-center gap-3">
                {RECENT_RUNS.filter(r => r.status === 'watching').length > 0 && (
                  <span className="flex items-center gap-1.5 text-cyan-400/70 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {RECENT_RUNS.filter(r => r.status === 'watching').length} watching
                  </span>
                )}
              </div>
            </div>

            {/* Jobs list */}
            <div className="space-y-3">
              {RECENT_RUNS.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <span className="text-2xl">{run.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 font-medium truncate">{run.title}</div>
                    <div className="text-white/40 text-sm">{run.time}</div>
                  </div>
                  {run.status === 'watching' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-cyan-400 text-sm">Watching</span>
                    </div>
                  )}
                  {run.status === 'completed' && (
                    <span className="text-emerald-400/80 text-sm px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Done</span>
                  )}
                </div>
              ))}
            </div>

            {/* Empty state hint */}
            <div className="mt-8 text-center">
              <p className="text-white/30 text-sm">Jobs you run will appear here</p>
            </div>
          </div>
        </div>

        {/* Active state content - overlays the jobs section */}
        <div
          className={`
            fixed inset-x-0 bottom-0 flex flex-col items-center pb-8 z-20
            transition-all duration-500
            ${state !== 'waiting' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
          `}
        >
          {/* Prompt cards */}
          <div
            className={`
              flex flex-col gap-3 w-full max-w-md mb-8 px-4
              transition-all duration-500 delay-100
              ${state === 'active' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              ${state === 'processing' ? 'opacity-30 pointer-events-none' : ''}
            `}
          >
            <p className="text-white/40 text-xs uppercase tracking-wider text-center mb-2">
              Quick actions
            </p>
            {PROMPT_CARDS.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleSelectCard(card)}
                disabled={isNavigating}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left
                  bg-white/[0.06] border border-white/[0.08]
                  hover:bg-white/[0.10] hover:border-white/[0.15]
                  transition-all duration-200 group
                  ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xl flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  {card.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 group-hover:text-white font-medium text-sm transition-colors">
                    {card.title}
                  </div>
                  <div className="text-white/40 group-hover:text-white/60 text-xs truncate mt-0.5 transition-colors">
                    {card.query}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Input area */}
          <div
            className={`
              w-full max-w-md px-4
              transition-all duration-500 delay-150
              ${state === 'active' || state === 'listening' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              ${state === 'processing' ? 'opacity-30 pointer-events-none' : ''}
            `}
          >
            <div className="relative rounded-2xl bg-white/[0.08] border border-white/[0.1] overflow-hidden">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitQuery();
                  }
                }}
                placeholder={state === 'listening' ? 'Listening...' : 'Or type your request...'}
                rows={1}
                className="w-full bg-transparent text-white text-base placeholder-white/40 focus:outline-none resize-none px-4 pt-4 pb-2 min-h-[52px] max-h-[120px]"
                disabled={isNavigating || state === 'listening'}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />

              {/* Input actions */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div />
                <div className="flex items-center gap-1">
                  {/* Mic button */}
                  <button
                    onClick={handleMicTap}
                    disabled={isNavigating}
                    className={`
                      p-2.5 rounded-xl transition-all
                      ${state === 'listening'
                        ? 'bg-teal-500/20 text-teal-400 animate-pulse'
                        : 'hover:bg-white/[0.08] text-white/40 hover:text-white/60'
                      }
                    `}
                  >
                    <MicIcon className="w-5 h-5" />
                  </button>

                  {/* Send button */}
                  <button
                    onClick={() => handleSubmitQuery()}
                    disabled={query.trim().length < 5 || isNavigating}
                    className={`
                      p-2.5 rounded-xl transition-all
                      ${query.trim().length >= 5 && !isNavigating
                        ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                        : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                      }
                    `}
                  >
                    {isNavigating ? (
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <SendIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Listening indicator */}
          {state === 'listening' && (
            <div className="mt-4 flex items-center gap-2 text-teal-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Listening... tap mic to stop</span>
            </div>
          )}

          {/* Processing indicator */}
          {state === 'processing' && (
            <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm">
              <LoaderIcon className="w-4 h-4 animate-spin" />
              <span>Launching search...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
