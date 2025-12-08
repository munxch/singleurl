'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  LoaderIcon,
  CheckIcon,
  SearchIcon,
  StarIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  DownloadIcon,
  UploadIcon,
  LockIcon,
  AlertTriangleIcon,
  MailIcon,
  UsersIcon,
  BellIcon,
  CalendarIcon,
  ShareIcon,
  MessageCircleIcon,
  MenuIcon,
} from '@/components/icons';
import { MinoLogo } from '@/components/icons/MinoLogo';
import {
  AgentThought,
  TimelineContainer,
  TimelineStep,
  TimelineResultStep,
  TimelineFinalStep,
  PlanningStep,
  SynthesisStep,
  SearchPanel,
  WhatsNextActions,
  WhatsNextLabel,
  SignUpOverlay,
} from '@/components/demo';
import {
  DataTable,
  DataTableColumn,
  ContactIndicators,
  CompanyTypeBadge,
  ConfidenceBadge,
} from '@/components/ui/DataTable';
import {
  CFO_SEARCH_QUERY,
  CFO_SEARCH_SOURCES,
  CFO_SEARCH_RESULTS,
  CFO_SEARCH_SYNTHESIS,
  type CFOResult,
} from '@/lib/mock-data';

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
// CFO DEMO TYPES
// =============================================================================

type LaneStatus = 'pending' | 'spawning' | 'searching' | 'extracting' | 'complete' | 'paywalled' | 'partial' | 'error';

interface DemoLane {
  id: string;
  site: string;
  domain: string;
  status: LaneStatus;
  progress: number;
  wave: 1 | 2;
  resultsFound: number;
  currentAction?: string;
  statusMessage?: string;
}

type DemoPhase = 'idle' | 'planning' | 'analyzing' | 'spawning_wave1' | 'running_wave1' | 'escalation_pause' | 'escalation_message' | 'spawning_wave2' | 'running_wave2' | 'synthesizing' | 'complete';

const WAVE1_SOURCES = CFO_SEARCH_SOURCES.filter(s => s.wave === 1);
const WAVE2_SOURCES = CFO_SEARCH_SOURCES.filter(s => s.wave === 2);

// =============================================================================
// CFO SOURCE ROW COMPONENT
// =============================================================================

function CFOSourceRow({ lane, isSelected, onClick }: { lane: DemoLane; isSelected: boolean; onClick: () => void }) {
  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete': return <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><CheckIcon className="w-3 h-3 text-white/60" /></div>;
      case 'paywalled': return <LockIcon className="w-4 h-4 text-cyan-400/70" />;
      case 'partial': return <AlertTriangleIcon className="w-4 h-4 text-cyan-400/70" />;
      case 'pending': return <div className="w-3 h-3 rounded-full border-2 border-white/20" />;
      default: return <LoaderIcon className="w-4 h-4 animate-spin text-cyan-400/70" />;
    }
  };

  return (
    <button onClick={onClick} className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all overflow-hidden ${isSelected ? 'ring-1 ring-cyan-400/50' : 'hover:bg-white/[0.03]'}`}>
      <div className="absolute inset-0 bg-white/[0.04] transition-all duration-500" style={{ width: `${lane.progress}%` }} />
      <div className="relative flex items-center gap-3 w-full">
        {getStatusIcon()}
        <span className="flex-1 text-sm text-white/80 truncate">{lane.site}</span>
        {(lane.status === 'complete' || lane.status === 'partial') && lane.resultsFound > 0 && (
          <span className="text-sm tabular-nums text-cyan-400/80">{lane.resultsFound} found</span>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// CFO SOURCES LIST COMPONENT
// =============================================================================

function CFOSourcesList({ lanes, selectedLaneId, onSelectLane, showEscalation }: { lanes: DemoLane[]; selectedLaneId: string | null; onSelectLane: (id: string) => void; showEscalation: boolean }) {
  const wave1 = lanes.filter(l => l.wave === 1);
  const wave2 = lanes.filter(l => l.wave === 2);

  return (
    <div className="space-y-4">
      {wave1.length > 0 && (
        <div>
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">{wave2.length > 0 ? 'Business Databases' : 'Sources'}</div>
          <div className="space-y-1">{wave1.map(lane => <CFOSourceRow key={lane.id} lane={lane} isSelected={selectedLaneId === lane.id} onClick={() => onSelectLane(lane.id)} />)}</div>
        </div>
      )}
      {showEscalation && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] text-white/50 text-sm">
          <span className="text-white/30">+</span><span>ZoomInfo paywalled — enriching from company websites...</span>
        </div>
      )}
      {wave2.length > 0 && (
        <div className="animate-fadeIn">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Data Enrichment</div>
          <div className="space-y-1">{wave2.map(lane => <CFOSourceRow key={lane.id} lane={lane} isSelected={selectedLaneId === lane.id} onClick={() => onSelectLane(lane.id)} />)}</div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CFO RESULTS TABLE COMPONENT
// =============================================================================

function CFOResultsTable({ onOpenSignup }: { onOpenSignup: () => void }) {
  const columns: DataTableColumn<CFOResult>[] = [
    { key: 'name', header: 'Name', width: '180px', sortable: true, render: (row) => (<div><div className="text-white font-medium">{row.name}</div><div className="text-white/40 text-xs">{row.title}</div></div>) },
    { key: 'company', header: 'Company', width: '200px', sortable: true, render: (row) => (<div className="space-y-1"><div className="text-white/80">{row.company.name}</div><CompanyTypeBadge type={row.company.type} /></div>) },
    { key: 'employees', header: 'Size', width: '80px', sortable: true, render: (row) => <span className="text-white/60 tabular-nums">{row.company.employees.toLocaleString()}</span> },
    { key: 'contact', header: 'Contact', width: '120px', render: (row) => <ContactIndicators email={row.contact.email} emailVerified={row.contact.emailVerified} linkedIn={row.contact.linkedIn} phone={row.contact.phone} /> },
    { key: 'confidence', header: 'Quality', width: '80px', sortable: true, render: (row) => <ConfidenceBadge level={row.confidence} /> },
    { key: 'source', header: 'Source', width: '150px', render: (row) => <span className="text-white/40 text-xs">{row.source}</span> },
  ];

  const tableActions = [
    { id: 'export-csv', label: 'Export CSV', icon: <DownloadIcon className="w-4 h-4" />, onClick: onOpenSignup },
    { id: 'send-crm', label: 'Send to CRM', icon: <UploadIcon className="w-4 h-4" />, onClick: onOpenSignup, variant: 'primary' as const },
  ];

  return (
    <div className="overflow-hidden">
      <div className="px-4 pt-5 pb-4">
        <p className="text-white/70 text-sm">
          Found <span className="text-white font-medium">{CFO_SEARCH_SYNTHESIS.stats.totalFound} CFOs</span> at hospitality companies in the DFW area.
        </p>
      </div>
      <div className="flex items-center gap-4 px-4 pb-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5"><UsersIcon className="w-4 h-4 text-white/30" />{CFO_SEARCH_SYNTHESIS.stats.totalFound} total</span>
        <span className="flex items-center gap-1.5"><MailIcon className="w-4 h-4 text-white/30" />{CFO_SEARCH_SYNTHESIS.stats.emailsVerified} verified</span>
        <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-white/30" />{CFO_SEARCH_SYNTHESIS.stats.highConfidence} high confidence</span>
      </div>
      <DataTable data={CFO_SEARCH_RESULTS} columns={columns} keyExtractor={(row) => row.id} maxHeight="400px" showRowNumbers={true} />
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

type FlowState = 'idle' | 'active' | 'processing' | 'demo';

export default function FlowPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Flow state
  const [state, setState] = useState<FlowState>('idle');
  const [query, setQuery] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(2); // Start with CFO demo
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Demo state
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [showEscalation, setShowEscalation] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [agentThought, setAgentThought] = useState<AgentThought | null>(null);

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

  // Helper functions for demo
  const getMockSource = useCallback((laneId: string) => CFO_SEARCH_SOURCES.find(s => s.id === laneId), []);
  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => {
    setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const handleSubmit = useCallback((promptOverride?: DemoPrompt) => {
    setState('processing');

    // Brief processing state, then transition to demo
    setTimeout(() => {
      setState('demo');
      setDemoPhase('planning');
      setLanes([]);
      setShowEscalation(false);
      setSelectedLaneId(null);
      setSourcesExpanded(true);
      setAgentThought(null);
    }, 800);
  }, []);

  // Handle planning complete - start the search
  const handlePlanningComplete = useCallback(() => {
    setDemoPhase('analyzing');
    setAgentThought({
      type: 'planning',
      message: "I'll start with LinkedIn Sales Nav and ZoomInfo — best data quality for executive contacts.",
      reasoning: 'Business databases have verified emails and direct dials'
    });

    setTimeout(() => {
      setDemoPhase('spawning_wave1');
      const wave1: DemoLane[] = WAVE1_SOURCES.map(s => ({
        id: s.id,
        site: s.site,
        domain: s.domain,
        status: 'spawning' as LaneStatus,
        progress: 0,
        wave: 1 as const,
        resultsFound: 0,
        currentAction: 'Connecting...'
      }));
      setLanes(wave1);
      setSelectedLaneId(wave1[0].id);

      setAgentThought({
        type: 'executing',
        message: 'Querying business databases for CFOs at hospitality companies in DFW...',
        reasoning: 'Filtering by industry, title, and geography'
      });

      setTimeout(() => {
        setDemoPhase('running_wave1');

        // Wave 1 thoughts
        setTimeout(() => setAgentThought({ type: 'analyzing', message: 'LinkedIn showing 47 CFO profiles in Dallas hospitality sector...' }), 2000);
        setTimeout(() => setAgentThought({ type: 'analyzing', message: 'Found Michael Torres at Omni Hotels — VP Finance, verifying contact info...', reasoning: 'Cross-referencing with company website' }), 6000);
        setTimeout(() => setAgentThought({ type: 'adapting', message: 'ZoomInfo requires subscription for full data. Pivoting to direct company sources.', reasoning: 'Will extract from SEC filings and press releases' }), 10000);
        setTimeout(() => setAgentThought({ type: 'planning', message: 'Primary sources checked. Enriching with company website data...', reasoning: 'Direct sources often have updated contact info' }), 14000);

        // Run wave 1 lanes
        const wave1CompletionTimes = [6000, 5000, 9000, 12000];
        wave1.forEach((lane, i) => {
          const mockSource = getMockSource(lane.id);
          const isPaywalled = mockSource?.status === 'paywalled';
          const isPartial = mockSource?.status === 'partial';
          const startDelay = 500 + (i * 300);
          const completionTime = wave1CompletionTimes[i] || 10000;
          const duration = completionTime - startDelay;

          setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 15, currentAction: 'Connecting...' }), startDelay);
          setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 30, currentAction: 'Querying database...' }), startDelay + duration * 0.25);

          if (isPaywalled) {
            setTimeout(() => updateLane(lane.id, { status: 'paywalled', progress: 40, statusMessage: mockSource?.statusMessage }), completionTime);
          } else {
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 50, currentAction: 'Found results...' }), startDelay + duration * 0.5);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 75, currentAction: 'Extracting contacts...' }), startDelay + duration * 0.75);
            setTimeout(() => updateLane(lane.id, { status: (isPartial ? 'partial' : 'complete') as LaneStatus, progress: 100, resultsFound: mockSource?.resultsFound || 0, statusMessage: mockSource?.statusMessage }), completionTime);
          }
        });

        setTimeout(() => setDemoPhase('escalation_pause'), 14000);
      }, 500);
    }, 800);
  }, [getMockSource, updateLane]);

  // Handle escalation and wave 2
  useEffect(() => {
    if (demoPhase === 'escalation_pause') {
      setTimeout(() => {
        setDemoPhase('escalation_message');
        setShowEscalation(true);
      }, 1000);
    }

    if (demoPhase === 'escalation_message') {
      setTimeout(() => {
        setDemoPhase('spawning_wave2');
        const wave2: DemoLane[] = WAVE2_SOURCES.map(s => ({
          id: s.id,
          site: s.site,
          domain: s.domain,
          status: 'spawning' as LaneStatus,
          progress: 0,
          wave: 2 as const,
          resultsFound: 0,
          currentAction: 'Connecting...'
        }));
        setLanes(prev => {
          const ids = new Set(prev.map(l => l.id));
          return [...prev, ...wave2.filter(l => !ids.has(l.id))];
        });
        setSelectedLaneId(wave2[0].id);

        setAgentThought({
          type: 'executing',
          message: 'Scanning company websites for leadership team pages...',
          reasoning: 'Direct sources often have most current contact info'
        });

        setTimeout(() => {
          setDemoPhase('running_wave2');

          // Wave 2 thoughts
          setTimeout(() => setAgentThought({ type: 'analyzing', message: 'Omni Hotels leadership page found — extracting executive contacts...' }), 3000);
          setTimeout(() => setAgentThought({ type: 'analyzing', message: 'Found Sarah Chen, CFO at Ashford Hospitality — email pattern verified.', reasoning: 'Matched against company email format' }), 7000);
          setTimeout(() => setAgentThought({ type: 'success', message: 'Compiled 23 verified CFO contacts. Scoring by data quality...' }), 11000);

          // Run wave 2 lanes
          const wave2CompletionTimes = [5000, 7000, 9000, 11000];
          wave2.forEach((lane, i) => {
            const mockSource = getMockSource(lane.id);
            const startDelay = 500 + (i * 300);
            const completionTime = wave2CompletionTimes[i] || 9000;
            const duration = completionTime - startDelay;

            setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 15, currentAction: 'Loading page...' }), startDelay);
            setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 30, currentAction: 'Scanning team page...' }), startDelay + duration * 0.25);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 50, currentAction: 'Found contacts...' }), startDelay + duration * 0.5);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 75, currentAction: 'Enriching data...' }), startDelay + duration * 0.75);
            setTimeout(() => updateLane(lane.id, { status: 'complete', progress: 100, resultsFound: mockSource?.resultsFound || 0 }), completionTime);
          });

          setTimeout(() => {
            setDemoPhase('synthesizing');
            setAgentThought(null);
          }, 13000);
        }, 500);
      }, 1800);
    }
  }, [demoPhase, getMockSource, updateLane]);

  // Handle synthesis complete
  const handleSynthesisComplete = useCallback(() => {
    setDemoPhase('complete');
  }, []);

  // Auto-select active lane during search
  useEffect(() => {
    if (demoPhase !== 'running_wave1' && demoPhase !== 'running_wave2') return;

    const cycleInterval = setInterval(() => {
      setSelectedLaneId(prevId => {
        const activeLanes = lanes.filter(l =>
          l.status !== 'complete' && l.status !== 'paywalled' && l.status !== 'partial' && l.status !== 'pending'
        );
        if (activeLanes.length <= 1) return prevId;
        const currentIndex = activeLanes.findIndex(l => l.id === prevId);
        const nextIndex = (currentIndex + 1) % activeLanes.length;
        return activeLanes[nextIndex].id;
      });
    }, 3000);

    return () => clearInterval(cycleInterval);
  }, [demoPhase, lanes]);

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
      case 'demo': return demoPhase === 'complete' ? 'idle' : 'speaking';
      default: return 'idle';
    }
  };

  const isActive = state === 'active' || state === 'processing';
  const isDemo = state === 'demo';
  const isRunning = demoPhase === 'analyzing' || demoPhase === 'spawning_wave1' || demoPhase === 'running_wave1' || demoPhase === 'escalation_pause' || demoPhase === 'escalation_message' || demoPhase === 'spawning_wave2' || demoPhase === 'running_wave2';
  const selectedLane = lanes.find(l => l.id === selectedLaneId);

  const whatsNextActions = [
    { icon: <CalendarIcon className="w-4 h-4" />, label: 'Schedule', subtitle: 'Run this search daily', onClick: () => setShowSignupModal(true) },
    { icon: <UploadIcon className="w-4 h-4" />, label: 'Export', subtitle: 'Send to your tools', onClick: () => setShowSignupModal(true) },
    { icon: <ShareIcon className="w-4 h-4" />, label: 'Share', subtitle: 'Send link to anyone', onClick: () => setShowSignupModal(true) },
  ];

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
      className={`h-screen bg-[#0a1628] overflow-x-hidden overflow-y-scroll ${isDemo ? '' : 'snap-y snap-mandatory'}`}
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
          ${isDemo ? 'bg-black/40' : isActive ? 'bg-black/50 backdrop-blur-sm' : ''}
        `}
        onClick={isActive && !isDemo ? handleClose : undefined}
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
          ${isDemo ? 'opacity-0 pointer-events-none' : isActive ? 'opacity-30 scale-90' : 'opacity-60'}
        `}
      >
        <MinoLogo />
      </div>


      {/* Main content */}
      <div className="relative z-20">

        {/* Demo Header - sticky bar with orb on left */}
        {isDemo && (
          <header className="sticky top-0 z-30 bg-[#0a1628]/80 backdrop-blur-sm">
            <div className="relative px-4 py-2">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Menu button */}
                <div className="w-20 flex-shrink-0">
                  <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <MenuIcon className="w-5 h-5 text-white/50" />
                  </button>
                </div>

                {/* Center: Orb + Query */}
                <button
                  onClick={() => {
                    setState('idle');
                    setDemoPhase('idle');
                    setLanes([]);
                    setShowEscalation(false);
                    setQuery('');
                    setSpokenText('');
                    setIsTranscribing(false);
                  }}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-10 h-10 flex-shrink-0 overflow-hidden relative rounded-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="scale-[0.22]">
                        <AudioOrb
                          mode={getOrbMode()}
                          size={280}
                          audioEnabled={false}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-white/50 text-sm truncate">
                    {CFO_SEARCH_QUERY}
                  </span>
                </button>

                {/* Right: Sign up */}
                <div className="w-20 flex-shrink-0 flex justify-end">
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="px-3 py-1 text-sm text-white/70 hover:text-white rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all whitespace-nowrap"
                  >
                    Sign up
                  </button>
                </div>
              </div>

              {/* Bottom gradient divider */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </header>
        )}

        {/* Hero - full screen when not in demo */}
        <div className={`
          flex flex-col items-center px-6 relative
          transition-all duration-700 ease-out
          ${isDemo ? 'hidden' : 'h-screen justify-center pt-16 snap-start snap-always'}
        `}>
          {/* Orb */}
          <div
            className={`
              relative transition-all duration-700 ease-out cursor-pointer group
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

        {/* Demo cascade section */}
        {isDemo && (
          <div className="px-4 pb-12 animate-fadeIn">
            <div className="max-w-4xl mx-auto pt-4">
              <TimelineContainer>
                {/* Step 1: Query */}
                <TimelineStep
                  icon={<SearchIcon className="w-3.5 h-3.5" />}
                  isActive={demoPhase === 'idle'}
                  isComplete={demoPhase !== 'idle'}
                  accentColor="cyan"
                  showConnector={demoPhase !== 'idle'}
                >
                  <div className="p-4">
                    <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Query</div>
                    <div className="text-white">Find CFOs at hospitality companies in DFW</div>
                  </div>
                </TimelineStep>

                {/* Step 2: Planning */}
                <PlanningStep
                  isPlanning={demoPhase === 'planning'}
                  isVisible={demoPhase === 'planning' || isRunning || demoPhase === 'synthesizing' || demoPhase === 'complete'}
                  showConnector={isRunning || demoPhase === 'synthesizing' || demoPhase === 'complete'}
                  sites={WAVE1_SOURCES}
                  accentColor="cyan"
                  onPlanningComplete={handlePlanningComplete}
                />

                {/* Step 3: Sources + Browser */}
                {(isRunning || demoPhase === 'synthesizing' || demoPhase === 'complete') && (
                  <TimelineStep
                    icon={<SearchIcon className="w-3.5 h-3.5" />}
                    isActive={isRunning}
                    isComplete={demoPhase === 'synthesizing' || demoPhase === 'complete'}
                    accentColor="cyan"
                    showConnector={demoPhase === 'synthesizing' || demoPhase === 'complete'}
                  >
                    <div className={`flex items-center justify-between px-4 py-3 ${sourcesExpanded ? 'border-b border-white/10' : ''}`}>
                      <button
                        onClick={() => demoPhase === 'complete' && setSourcesExpanded(!sourcesExpanded)}
                        className={`flex items-center gap-3 ${demoPhase === 'complete' ? 'hover:opacity-80 cursor-pointer' : ''} transition-opacity`}
                      >
                        <span className="text-white/80 font-medium">{demoPhase === 'complete' ? 'Search Complete' : 'Searching Sources'}</span>
                        {!sourcesExpanded && demoPhase === 'complete' && (
                          <span className="text-white/40 text-sm">• {lanes.length} sources checked</span>
                        )}
                        {demoPhase === 'complete' && (
                          <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </div>

                    {sourcesExpanded && (
                      <SearchPanel
                        accentColor="cyan"
                        sourcesWidth="w-72"
                        agentThought={agentThought}
                        totalSessions={lanes.length}
                        isSearching={isRunning}
                        browser={selectedLane ? {
                          domain: selectedLane.domain,
                          status: selectedLane.status,
                          currentAction: selectedLane.currentAction,
                          statusMessage: selectedLane.statusMessage,
                          siteIcon: selectedLane.wave === 2 ? '🔍' : '💼',
                          siteName: selectedLane.site,
                          siteSubtitle: selectedLane.wave === 1 ? 'Business database' : 'Data enrichment',
                          completeOverlay: selectedLane.resultsFound > 0 ? (
                            <div className="text-center">
                              <p className="text-white font-bold text-2xl">{selectedLane.resultsFound}</p>
                              <p className="text-white/50 text-sm mt-1">contacts found</p>
                            </div>
                          ) : undefined
                        } : null}
                      >
                        <CFOSourcesList
                          lanes={lanes}
                          selectedLaneId={selectedLaneId}
                          onSelectLane={setSelectedLaneId}
                          showEscalation={showEscalation}
                        />
                      </SearchPanel>
                    )}
                  </TimelineStep>
                )}

                {/* Step 4: Synthesis */}
                <SynthesisStep
                  isSynthesizing={demoPhase === 'synthesizing'}
                  isVisible={demoPhase === 'synthesizing' || demoPhase === 'complete'}
                  showConnector={demoPhase === 'complete'}
                  sourcesCount={lanes.length}
                  resultsCount={lanes.reduce((acc, l) => acc + l.resultsFound, 0)}
                  analysisPoints={[
                    { id: 'emails', label: 'Verifying email addresses', icon: '📧' },
                    { id: 'confidence', label: 'Scoring data confidence', icon: '✅' },
                    { id: 'freshness', label: 'Checking data freshness', icon: '🕐' },
                    { id: 'ranking', label: 'Ranking by quality score', icon: '🎯' },
                  ]}
                  accentColor="cyan"
                  onSynthesisComplete={handleSynthesisComplete}
                />

                {/* Step 5: Results */}
                {demoPhase === 'complete' && (
                  <TimelineResultStep ref={resultsRef} icon={<StarIcon className="w-3.5 h-3.5" />} showConnector={true}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <span className="text-white/80 font-medium">Results</span>
                      <span className="text-white/40 text-sm">{CFO_SEARCH_SYNTHESIS.stats.totalFound} contacts found</span>
                    </div>
                    <CFOResultsTable onOpenSignup={() => setShowSignupModal(true)} />
                    <div className="px-4 py-3 border-t border-white/10">
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">Insights</div>
                      <ul className="space-y-1.5">
                        {CFO_SEARCH_SYNTHESIS.insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                            <span className="text-cyan-400 mt-0.5">•</span>{insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TimelineResultStep>
                )}

                {/* Step 6: What's Next */}
                {demoPhase === 'complete' && (
                  <TimelineFinalStep icon={<ArrowRightIcon className="w-3.5 h-3.5" />} animationDelay="200ms">
                    <div className="p-4">
                      <WhatsNextLabel />
                      <WhatsNextActions actions={whatsNextActions} />
                      <div className="flex justify-center mt-4 pt-4 border-t border-white/5">
                        <button
                          onClick={() => setShowSignupModal(true)}
                          className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-2"
                        >
                          <MessageCircleIcon className="w-4 h-4" />
                          <span>Ask a follow-up question</span>
                        </button>
                      </div>
                    </div>
                  </TimelineFinalStep>
                )}
              </TimelineContainer>
            </div>
          </div>
        )}

        {/* Jobs section */}
        <div
          className={`
            min-h-screen px-4 pt-32 pb-12 snap-start snap-always
            transition-opacity duration-500
            ${!isActive && !isDemo ? 'opacity-100' : 'opacity-0 pointer-events-none'}
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

      {/* Sign up modal */}
      <SignUpOverlay
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        subtitle="Export contacts, sync with your CRM, and more"
      />
    </div>
  );
}
