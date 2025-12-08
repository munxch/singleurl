'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SendIcon, LoaderIcon } from '@/components/icons';
import { MinoLogo } from '@/components/icons/MinoLogo';

// Dynamically import AudioOrb
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
// DEMO DATA
// =============================================================================

interface DemoPrompt {
  id: string;
  text: string;
  route: string;
}

// These match our actual demo pages
const DEMO_PROMPTS: DemoPrompt[] = [
  {
    id: 'date-night',
    text: "Find me a nice Italian spot in Dallas for date night tonight, 7pm for 2",
    route: '/demo/date-night-cascade',
  },
  {
    id: 'car-search',
    text: "Find a 2024 Lexus GX Overtrail in Dallas",
    route: '/demo/car-search-cascade',
  },
  {
    id: 'cfo-search',
    text: "Find me CFOs at hospitality companies in DFW",
    route: '/demo/cfo-search-cascade',
  },
];

// Jobs organized by status
const ACTIVE_JOBS = [
  { id: '1', title: 'Finding CFOs in hospitality', subtitle: 'Searching LinkedIn, Apollo, ZoomInfo...', icon: '👔', progress: '12 found' },
  { id: '2', title: 'Lexus GX inventory check', subtitle: 'Scanning 8 dealerships in DFW...', icon: '🚙', progress: '3 of 8' },
];

const SCHEDULED_JOBS = [
  { id: '3', title: 'Austin flight monitor', subtitle: 'Runs daily at 6:00 AM', icon: '✈️', schedule: 'Daily' },
  { id: '4', title: 'PS5 Pro restock alert', subtitle: 'Runs every 2 hours', icon: '🎮', schedule: 'Every 2h' },
  { id: '5', title: 'AirPods Pro price watch', subtitle: 'Runs daily at 10:00 AM', icon: '🎧', schedule: 'Daily' },
];

const COMPLETED_JOBS = [
  { id: '5', title: 'Honda Civic search', subtitle: '3 dealers found nearby', time: '3 hrs ago', icon: '🚗' },
  { id: '6', title: 'Lucia reservation', subtitle: 'Confirmed for tonight 7pm', time: '5 hrs ago', icon: '🍽️' },
  { id: '7', title: 'CFO contacts in DFW', subtitle: '12 contacts exported', time: 'Yesterday', icon: '👔' },
  { id: '8', title: 'Lexus GX Overtrail', subtitle: 'Found 2 in stock', time: '2 days ago', icon: '🚙' },
];

// =============================================================================
// COMPONENT
// =============================================================================

type FlowState = 'idle' | 'active' | 'processing';

export default function FlowPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<FlowState>('idle');
  const [query, setQuery] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(2); // Start with CFO demo
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cycle through example prompts when active (only if not transcribing)
  useEffect(() => {
    if (state !== 'active' || query || isTranscribing) return;

    const interval = setInterval(() => {
      setCurrentPromptIndex(prev => (prev + 1) % DEMO_PROMPTS.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [state, query, isTranscribing]);

  // Auto-transcribe after 5 seconds of being active - word by word like speech recognition
  useEffect(() => {
    if (state !== 'active') {
      setSpokenText('');
      setIsTranscribing(false);
      return;
    }

    let timeouts: NodeJS.Timeout[] = [];
    let currentIndex = currentPromptIndex; // Capture current index

    // Wait 5 seconds then start transcribing
    const startTimeout = setTimeout(() => {
      setIsTranscribing(true);
      const targetText = DEMO_PROMPTS[currentIndex].text;
      const words = targetText.split(' ');

      let cumulativeDelay = 0;

      // Add words progressively with natural speech timing
      words.forEach((word, index) => {
        // Vary timing: shorter words faster, longer words slower, random variation
        const baseDelay = 150 + (word.length * 30) + (Math.random() * 100);
        cumulativeDelay += baseDelay;

        const wordTimeout = setTimeout(() => {
          setSpokenText(words.slice(0, index + 1).join(' '));
        }, cumulativeDelay);

        timeouts.push(wordTimeout);
      });

      // Auto-submit after all words are shown
      const submitTimeout = setTimeout(() => {
        handleSubmit(DEMO_PROMPTS[currentIndex]);
      }, cumulativeDelay + 1000);

      timeouts.push(submitTimeout);
    }, 5000);

    timeouts.push(startTimeout);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]); // Only depend on state, not currentPromptIndex

  // Track scroll progress for gradient shift
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      setScrollProgress(progress);
      setHasScrolled(scrollTop > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when active
  useEffect(() => {
    if (state === 'active') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [state]);

  const handleOrbTap = useCallback(() => {
    if (state === 'idle') {
      setState('active');
    } else if (state === 'active' && query.trim().length >= 5) {
      handleSubmit();
    }
  }, [state, query]);

  const handleSubmit = useCallback((promptOverride?: DemoPrompt) => {
    const prompt = promptOverride || DEMO_PROMPTS.find(p => p.text.toLowerCase() === query.trim().toLowerCase());

    setState('processing');

    setTimeout(() => {
      if (prompt) {
        router.push(prompt.route);
      } else {
        // Default to date night demo for any other query
        router.push('/demo/date-night-cascade');
      }
    }, 1000);
  }, [query, router]);

  const handleSelectPrompt = useCallback((prompt: DemoPrompt) => {
    setQuery(prompt.text);
  }, []);

  const handleClose = useCallback(() => {
    setState('idle');
    setQuery('');
  }, []);

  const getOrbMode = () => {
    switch (state) {
      case 'idle': return 'idle';
      case 'active': return 'listening';
      case 'processing': return 'speaking';
      default: return 'idle';
    }
  };

  const isActive = state !== 'idle';

  // Organic gradient positions based on scroll
  const blob1X = 30 - (scrollProgress * 20);
  const blob1Y = 20 + (scrollProgress * 30);
  const blob2X = 70 + (scrollProgress * 15);
  const blob2Y = 60 - (scrollProgress * 20);
  const blob3X = 50 + (scrollProgress * 10);
  const blob3Y = 80 - (scrollProgress * 40);

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen bg-[#0a1628] overflow-x-hidden overflow-y-scroll snap-y snap-mandatory"
    >
      {/* Background */}
      <div className="ocean-bg pointer-events-none fixed inset-0" />
      <div className="wave-overlay pointer-events-none fixed inset-0" />

      {/* Organic gradient overlay - multiple radial gradients that shift */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: `
            radial-gradient(ellipse 200% 150% at ${blob1X}% ${blob1Y}%, rgba(10, 22, 40, 0.5) 0%, transparent 70%),
            radial-gradient(ellipse 150% 200% at ${blob2X}% ${blob2Y}%, rgba(0, 0, 0, 0.6) 0%, transparent 60%),
            radial-gradient(ellipse 220% 120% at ${blob3X}% ${blob3Y}%, rgba(5, 15, 30, 0.5) 0%, transparent 70%),
            radial-gradient(ellipse 180% 180% at 50% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 80%)
          `
        }}
      />

      {/* Dark overlay - darker when active */}
      <div
        className={`
          fixed inset-0 z-10 transition-all duration-700
          ${isActive ? 'bg-black/50 backdrop-blur-sm' : ''}
        `}
        onClick={isActive ? handleClose : undefined}
      />

      {/* Edge glow effect - only when active */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {/* Active state - cyan glow */}
        <div
          className={`
            absolute inset-0 transition-opacity duration-700
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              boxShadow: 'inset 0 0 150px 40px rgba(34, 211, 238, 0.12), inset 0 0 300px 100px rgba(34, 211, 238, 0.05)',
              animationDuration: '3s',
            }}
          />
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              boxShadow: 'inset 0 0 200px 60px rgba(34, 211, 238, 0.08)',
              animationDuration: '4s',
              animationDelay: '1s',
            }}
          />
        </div>
      </div>

      {/* Logo */}
      <div
        className={`
          fixed top-8 left-1/2 -translate-x-1/2 z-30
          transition-all duration-500
          ${isActive ? 'opacity-30 scale-90' : 'opacity-60'}
        `}
      >
        <MinoLogo />
      </div>


      {/* Main content */}
      <div className="relative z-20">

        {/* Hero */}
        <div className="h-screen flex flex-col items-center justify-center px-6 relative pt-16 snap-start snap-always">

          {/* Orb */}
          <div
            className={`
              relative transition-all duration-500 ease-out cursor-pointer group
              ${state === 'processing' ? 'scale-105' : ''}
            `}
            onClick={handleOrbTap}
          >
            {state === 'idle' && (
              <div className="absolute inset-2 rounded-full border border-white/[0.06] group-hover:border-orange-400/20 transition-colors" />
            )}

            {/* Listening label / Spoken text above orb */}
            <div
              className={`
                absolute -top-20 left-1/2 -translate-x-1/2 w-[650px] text-center
                transition-all duration-500
                ${state === 'active' ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {isTranscribing ? (
                <p className="text-white text-xl font-medium">
                  {spokenText || '...'}
                  <span className="animate-pulse text-cyan-400 ml-1">|</span>
                </p>
              ) : (
                <span className="text-white/30 text-xs uppercase tracking-[0.2em]">Listening</span>
              )}
            </div>

            <AudioOrb
              mode={getOrbMode()}
              size={280}
              audioEnabled={false}
            />

            {/* Idle text */}
            <div
              className={`
                absolute -bottom-14 left-1/2 -translate-x-1/2 text-center whitespace-nowrap
                transition-all duration-300
                ${state === 'idle' ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <p className="text-white/40 text-sm group-hover:text-white/60 transition-colors">
                Tap to start
              </p>
            </div>

            {/* Processing text */}
            <div
              className={`
                absolute -bottom-12 left-1/2 -translate-x-1/2 text-center
                transition-all duration-300
                ${state === 'processing' ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="flex items-center gap-2 text-purple-400">
                <LoaderIcon className="w-4 h-4 animate-spin" />
                <span className="text-sm">Launching...</span>
              </div>
            </div>
          </div>

          {/* Active state content below orb */}
          <div
            className={`
              flex flex-col items-center -mt-2
              transition-all duration-500
              ${state === 'active' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
            `}
          >
            {/* Cycling prompts - hide when transcribing */}
            <div className={`text-center mb-8 transition-opacity duration-500 ${isTranscribing ? 'opacity-0' : 'opacity-100'}`}>
              <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-3">You can ask Mino to</p>
              <div className="relative h-7 w-[650px] overflow-hidden">
                {DEMO_PROMPTS.map((prompt, index) => (
                  <p
                    key={prompt.id}
                    className={`
                      absolute inset-0 flex items-center justify-center
                      text-white/60 text-lg
                      transition-all duration-700 ease-in-out
                      ${index === currentPromptIndex
                        ? 'opacity-100 translate-y-0'
                        : index === (currentPromptIndex - 1 + DEMO_PROMPTS.length) % DEMO_PROMPTS.length
                          ? 'opacity-0 -translate-y-4'
                          : 'opacity-0 translate-y-4'
                      }
                    `}
                  >
                    "{prompt.text}"
                  </p>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-6">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="w-16 h-16 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/[0.12] hover:text-white/70 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Mic button */}
              <button
                onClick={() => handleSubmit(DEMO_PROMPTS[currentPromptIndex])}
                className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Type instead button */}
              <button
                onClick={() => {/* Could open a text input */}}
                className="w-16 h-16 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/[0.12] hover:text-white/70 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className={`
              absolute bottom-4 left-1/2 -translate-x-1/2
              flex flex-col items-center gap-1
              transition-all duration-500
              ${!isActive && !hasScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
          >
            <span className="text-white/20 text-xs">Recent jobs</span>
            <svg className="w-4 h-4 text-white/15 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

        </div>

        {/* Jobs section */}
        <div
          className={`
            min-h-screen px-4 pt-32 pb-12 snap-start snap-always
            transition-opacity duration-500
            ${!isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <div className="max-w-md mx-auto space-y-8">

            {/* Active Jobs - Currently Running */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">In Progress</h2>
                </div>
                <span className="text-emerald-400/60 text-xs">{ACTIVE_JOBS.length} running</span>
              </div>
              <div className="space-y-2">
                {ACTIVE_JOBS.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 hover:bg-emerald-500/[0.08] transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <span className="text-2xl">{job.icon}</span>
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a1628] animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/80 font-medium truncate">{job.title}</div>
                      <div className="text-emerald-400/60 text-sm">{job.subtitle}</div>
                    </div>
                    <span className="text-emerald-400 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20">
                      {job.progress}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Jobs - Recurring Workflows */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Recurring</h2>
                </div>
                <span className="text-cyan-400/60 text-xs">{SCHEDULED_JOBS.length} workflows</span>
              </div>
              <div className="space-y-2">
                {SCHEDULED_JOBS.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10 hover:bg-cyan-500/[0.06] transition-colors cursor-pointer"
                  >
                    <span className="text-2xl opacity-80">{job.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/70 font-medium truncate">{job.title}</div>
                      <div className="text-white/40 text-sm">{job.subtitle}</div>
                    </div>
                    <span className="text-cyan-400/70 text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      {job.schedule}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Jobs */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">Completed</h2>
                </div>
                <span className="text-emerald-400/60 text-xs">{COMPLETED_JOBS.length} done</span>
              </div>
              <div className="space-y-2">
                {COMPLETED_JOBS.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <span className="text-2xl opacity-70">{job.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/60 font-medium truncate">{job.title}</div>
                      <div className="text-white/30 text-sm">{job.subtitle}</div>
                    </div>
                    <span className="text-white/30 text-xs">{job.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
