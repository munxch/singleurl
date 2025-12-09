'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from '@/components/icons';
import {
  BaseDemoLane,
  AgentThought,
  TimelineContainer,
  TimelineStep,
  TimelineResultStep,
  TimelineFinalStep,
  PlanningStep,
  SynthesisStep,
  SearchPanel,
  DemoLayout,
  WhatsNextActions,
  WhatsNextLabel,
  SignUpOverlay,
} from '@/components/demo';
import {
  DataTable,
  DataTableColumn,
  TableActionsBar,
  TableStatsBar,
  ConfidenceBadge,
  ContactIndicators,
  CompanyTypeBadge,
} from '@/components/ui/DataTable';
import {
  CFO_SEARCH_QUERY,
  CFO_SEARCH_SOURCES,
  CFO_SEARCH_RESULTS,
  CFO_SEARCH_SYNTHESIS,
  type CFOResult,
  type CFOSourceResult,
} from '@/lib/mock-data';

// =============================================================================
// TYPES
// =============================================================================

type LaneStatus = 'pending' | 'spawning' | 'searching' | 'extracting' | 'complete' | 'paywalled' | 'partial' | 'error';

interface DemoLane extends BaseDemoLane {
  wave: 1 | 2;
  resultsFound: number;
}

type DemoPhase = 'idle' | 'planning' | 'analyzing' | 'spawning_wave1' | 'running_wave1' | 'escalation_pause' | 'escalation_message' | 'spawning_wave2' | 'running_wave2' | 'synthesizing' | 'complete';

// =============================================================================
// NOTIFY POPUP COMPONENT (Unique to CFO)
// =============================================================================

function NotifyMePopup({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: () => void }) {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0a1628] border border-white/20 shadow-2xl animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors">✕</button>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🔔</span></div>
          <h2 className="text-xl font-semibold text-white">Get notified when ready</h2>
          <p className="text-white/50 text-sm mt-2">We'll email you when your search results are ready.</p>
        </div>
        <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 mb-4" />
        <button onClick={() => { onSubmit(); onClose(); }} className="w-full py-3 px-4 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-400 transition-colors">Notify Me</button>
        <button onClick={onClose} className="w-full mt-3 py-2 px-4 text-white/50 text-sm hover:text-white/70 transition-colors">I'll wait for results</button>
      </div>
    </div>
  );
}

// =============================================================================
// SOURCE ROW (CFO-specific with paywalled/partial states)
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
          <span className={`text-sm tabular-nums ${lane.status === 'partial' ? 'text-cyan-400/80' : 'text-cyan-400/80'}`}>{lane.resultsFound} found</span>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// SOURCES LIST (CFO-specific with escalation)
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
// RESULTS TABLE
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

  const tableStats = [
    { label: 'Total', value: CFO_SEARCH_SYNTHESIS.stats.totalFound, icon: <UsersIcon className="w-4 h-4" /> },
    { label: 'Verified Emails', value: CFO_SEARCH_SYNTHESIS.stats.emailsVerified, icon: <MailIcon className="w-4 h-4" />, color: 'text-green-400' },
    { label: 'High Confidence', value: CFO_SEARCH_SYNTHESIS.stats.highConfidence, icon: <CheckIcon className="w-4 h-4" />, color: 'text-cyan-400' },
  ];

  const tableActions = [
    { id: 'export-csv', label: 'Export CSV', icon: <DownloadIcon className="w-4 h-4" />, onClick: onOpenSignup },
    { id: 'send-crm', label: 'Send to CRM', icon: <UploadIcon className="w-4 h-4" />, onClick: onOpenSignup, variant: 'primary' as const },
  ];

  return (
    <div className="overflow-hidden">
      {/* Summary message */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-white/70 text-sm">
          Found <span className="text-white font-medium">{CFO_SEARCH_SYNTHESIS.stats.totalFound} CFOs</span> at hospitality companies in the DFW area. {CFO_SEARCH_SYNTHESIS.stats.emailsVerified} have verified emails.
        </p>
      </div>
      {/* Stats - inline and subtle */}
      <div className="flex items-center gap-4 px-4 pb-4 text-xs text-white/40">
        {tableStats.map((stat, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="text-white/30">{stat.icon}</span>
            <span>{stat.value} {stat.label.toLowerCase()}</span>
          </span>
        ))}
      </div>
      <DataTable data={CFO_SEARCH_RESULTS} columns={columns} keyExtractor={(row) => row.id} maxHeight="400px" showRowNumbers={true} />
      <TableActionsBar actions={tableActions} />
    </div>
  );
}

// =============================================================================
// INSIGHTS PANEL
// =============================================================================

function InsightsPanel() {
  return (
    <div className="px-4 py-3 border-t border-white/10">
      <div className="text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">Insights</div>
      <ul className="space-y-1.5">
        {CFO_SEARCH_SYNTHESIS.insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-white/60 text-sm"><span className="text-cyan-400 mt-0.5">•</span>{insight}</li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// NEW HIRE ALERT SETUP
// =============================================================================

function NewHireAlertSetup() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden border border-green-500/20">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-xl">🔔</span></div>
        <div className="flex-1 text-left">
          <div className="text-white font-medium">Watch for new hires?</div>
          <div className="text-white/50 text-sm">Get alerted when new CFOs join hospitality groups in DFW</div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-green-400/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div className="text-white/60 text-sm">Mino monitors LinkedIn and company websites daily for executive changes — you'll know before the news does.</div>
          <div className="p-3 rounded-lg bg-white/5 space-y-2">
            <div className="text-white/50 text-xs uppercase tracking-wider">Watching for:</div>
            <div className="flex flex-wrap gap-2">{['CFO / VP Finance', 'Hospitality', 'DFW Area'].map(t => <span key={t} className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">{t}</span>)}</div>
          </div>
          <div className="space-y-3">
            <input type="email" placeholder="Your email" className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50" />
            <button className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 transition-colors">Start Watching</button>
            <div className="text-center text-white/40 text-xs">Usually finds 1-2 new executives per month</div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

const WAVE1_SOURCES = CFO_SEARCH_SOURCES.filter(s => s.wave === 1);
const WAVE2_SOURCES = CFO_SEARCH_SOURCES.filter(s => s.wave === 2);

export default function CFOSearchCascadePage() {
  const searchParams = useSearchParams();
  const isResultsView = searchParams.get('view') === 'results';

  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [showEscalation, setShowEscalation] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupContext, setSignupContext] = useState<string>('');
  const openSignup = (context: string) => { setSignupContext(context); setShowSignupModal(true); };
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [agentThought, setAgentThought] = useState<AgentThought | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const getMockSource = useCallback((laneId: string) => CFO_SEARCH_SOURCES.find(s => s.id === laneId), []);
  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => { setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)); }, []);

  useEffect(() => {
    if (selectedLaneId) return;
    const activeLane = lanes.find(l => !['pending', 'complete', 'paywalled', 'partial'].includes(l.status));
    if (activeLane) setSelectedLaneId(activeLane.id);
  }, [lanes, selectedLaneId]);

  // Cycle through active sessions periodically during search to show parallel execution
  useEffect(() => {
    if (phase !== 'running_wave1' && phase !== 'running_wave2') return;

    const cycleInterval = setInterval(() => {
      setSelectedLaneId(prevId => {
        // Get all active (non-complete, non-paywalled, non-partial) lanes
        const activeLanes = lanes.filter(l =>
          l.status !== 'complete' && l.status !== 'paywalled' && l.status !== 'partial' && l.status !== 'pending'
        );
        if (activeLanes.length <= 1) return prevId;

        // Find current index among active lanes
        const currentIndex = activeLanes.findIndex(l => l.id === prevId);
        // Move to next active lane (wrap around)
        const nextIndex = (currentIndex + 1) % activeLanes.length;
        return activeLanes[nextIndex].id;
      });
    }, 3000); // Cycle every 3 seconds

    return () => clearInterval(cycleInterval);
  }, [phase, lanes]);

  const handlePlanningComplete = useCallback(() => {
    setPhase('analyzing');

    // Initial planning thought
    setAgentThought({
      type: 'planning',
      message: "I'll start with LinkedIn Sales Nav and ZoomInfo — best data quality for executive contacts.",
      reasoning: 'Business databases have verified emails and direct dials'
    });

    setTimeout(() => {
      setPhase('spawning_wave1');
      const wave1: DemoLane[] = WAVE1_SOURCES.map(s => ({ id: s.id, site: s.site, domain: s.domain, status: 'spawning' as LaneStatus, progress: 0, wave: 1 as const, resultsFound: 0, currentAction: 'Connecting...' }));
      setLanes(wave1);
      setSelectedLaneId(wave1[0].id);

      setAgentThought({
        type: 'executing',
        message: 'Querying business databases for CFOs at hospitality companies in DFW...',
        reasoning: 'Filtering by industry, title, and geography'
      });

      setTimeout(() => {
        setPhase('running_wave1');

        // Wave 1 thought sequence (spread over ~15 seconds)
        const wave1Thoughts: { delay: number; thought: AgentThought }[] = [
          {
            delay: 2000,
            thought: {
              type: 'analyzing',
              message: 'LinkedIn showing 47 CFO profiles in Dallas hospitality sector...',
            }
          },
          {
            delay: 6000,
            thought: {
              type: 'analyzing',
              message: 'Found Michael Torres at Omni Hotels — VP Finance, verifying contact info...',
              reasoning: 'Cross-referencing with company website'
            }
          },
          {
            delay: 10000,
            thought: {
              type: 'adapting',
              message: 'ZoomInfo requires subscription for full data. Pivoting to direct company sources.',
              reasoning: 'Will extract from SEC filings and press releases'
            }
          },
          {
            delay: 14000,
            thought: {
              type: 'planning',
              message: 'Primary sources checked. Enriching with company website data...',
              reasoning: 'Direct sources often have updated contact info'
            }
          },
        ];

        wave1Thoughts.forEach(({ delay, thought }) => {
          setTimeout(() => setAgentThought(thought), delay);
        });

        // Start ALL wave1 lanes nearly simultaneously, complete at staggered times
        const wave1CompletionTimes = [6000, 5000, 9000, 12000]; // 4 lanes (ZoomInfo paywalled early)

        wave1.forEach((lane, i) => {
          const mockSource = getMockSource(lane.id);
          const isPaywalled = mockSource?.status === 'paywalled';
          const isPartial = mockSource?.status === 'partial';
          const startDelay = 500 + (i * 300); // Start all within first 1.5 seconds
          const completionTime = wave1CompletionTimes[i] || 10000;
          const duration = completionTime - startDelay;

          setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 15, currentAction: 'Connecting...' }), startDelay);
          setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 30, currentAction: 'Querying database...' }), startDelay + duration * 0.25);

          if (isPaywalled) {
            setTimeout(() => {
              updateLane(lane.id, { status: 'paywalled', progress: 40, statusMessage: mockSource?.statusMessage });
            }, completionTime);
          } else {
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 50, currentAction: 'Found results...' }), startDelay + duration * 0.5);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 75, currentAction: 'Extracting contacts...' }), startDelay + duration * 0.75);
            setTimeout(() => {
              updateLane(lane.id, { status: (isPartial ? 'partial' : 'complete') as LaneStatus, progress: 100, resultsFound: mockSource?.resultsFound || 0, statusMessage: mockSource?.statusMessage });
              if (mockSource?.resultsFound) setTotalFound(prev => prev + mockSource.resultsFound);
            }, completionTime);
          }
        });
        setTimeout(() => setPhase('escalation_pause'), 14000);
      }, 500);
    }, 800);
  }, [getMockSource, updateLane]);

  const startDemo = useCallback(() => {
    setPhase('planning');
    setLanes([]);
    setTotalFound(0);
    setShowEscalation(false);
    setSelectedLaneId(null);
    setSourcesExpanded(true);
    setShowNotifyPopup(false);
    setNotifySubmitted(false);
    setAgentThought(null);
  }, []);

  useEffect(() => {
    if (phase === 'escalation_pause') setTimeout(() => { setPhase('escalation_message'); setShowEscalation(true); }, 1000);
    if (phase === 'escalation_message') {
      setTimeout(() => {
        setPhase('spawning_wave2');
        const wave2: DemoLane[] = WAVE2_SOURCES.map(s => ({ id: s.id, site: s.site, domain: s.domain, status: 'spawning' as LaneStatus, progress: 0, wave: 2 as const, resultsFound: 0, currentAction: 'Connecting...' }));
        setLanes(prev => { const ids = new Set(prev.map(l => l.id)); return [...prev, ...wave2.filter(l => !ids.has(l.id))]; });
        setSelectedLaneId(wave2[0].id);

        setAgentThought({
          type: 'executing',
          message: 'Scanning company websites for leadership team pages...',
          reasoning: 'Direct sources often have most current contact info'
        });

        setTimeout(() => {
          setPhase('running_wave2');

          // Wave 2 thought sequence (spread over ~12 seconds)
          const wave2Thoughts: { delay: number; thought: AgentThought }[] = [
            {
              delay: 3000,
              thought: {
                type: 'analyzing',
                message: 'Omni Hotels leadership page found — extracting executive contacts...',
              }
            },
            {
              delay: 7000,
              thought: {
                type: 'analyzing',
                message: 'Found Sarah Chen, CFO at Ashford Hospitality — email pattern verified.',
                reasoning: 'Matched against company email format'
              }
            },
            {
              delay: 11000,
              thought: {
                type: 'success',
                message: 'Compiled 23 verified CFO contacts. Scoring by data quality...',
              }
            },
          ];

          wave2Thoughts.forEach(({ delay, thought }) => {
            setTimeout(() => setAgentThought(thought), delay);
          });

          // Start ALL wave2 lanes nearly simultaneously, complete at staggered times
          const wave2CompletionTimes = [5000, 7000, 9000, 11000]; // 4 lanes

          wave2.forEach((lane, i) => {
            const mockSource = getMockSource(lane.id);
            const startDelay = 500 + (i * 300); // Start all within first 1.5 seconds
            const completionTime = wave2CompletionTimes[i] || 9000;
            const duration = completionTime - startDelay;

            setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 15, currentAction: 'Loading page...' }), startDelay);
            setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 30, currentAction: 'Scanning team page...' }), startDelay + duration * 0.25);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 50, currentAction: 'Found contacts...' }), startDelay + duration * 0.5);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 75, currentAction: 'Enriching data...' }), startDelay + duration * 0.75);
            setTimeout(() => {
              updateLane(lane.id, { status: 'complete', progress: 100, resultsFound: mockSource?.resultsFound || 0 });
            }, completionTime);
          });
          setTimeout(() => {
            setPhase('synthesizing');
            setAgentThought(null);
          }, 13000);
        }, 500);
      }, 1800);
    }
  }, [phase, getMockSource, updateLane]);

  // Called when synthesis animation completes
  const handleSynthesisComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  // Skip to completed state for results view
  const skipToComplete = useCallback(() => {
    const allLanes: DemoLane[] = CFO_SEARCH_SOURCES.map(s => ({
      id: s.id,
      site: s.site,
      domain: s.domain,
      status: (s.status === 'success' ? 'complete' : s.status) as LaneStatus,
      progress: 100,
      wave: s.wave as 1 | 2,
      resultsFound: s.resultsFound,
      currentAction: s.status === 'success' ? 'Done' : s.status === 'paywalled' ? 'Paywalled' : 'Partial',
    }));
    setLanes(allLanes);
    setTotalFound(allLanes.reduce((acc, l) => acc + l.resultsFound, 0));
    setPhase('complete');
    setSourcesExpanded(false);
    setAgentThought(null);
  }, []);

  useEffect(() => {
    if (isResultsView) {
      skipToComplete();
    } else {
      const timer = setTimeout(startDemo, 500);
      return () => clearTimeout(timer);
    }
  }, [isResultsView, skipToComplete, startDemo]);
  useEffect(() => {
    if (phase === 'complete' && resultsRef.current) {
      setTimeout(() => {
        const element = resultsRef.current;
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [phase]);
  // Notify popup is now triggered by bell button click, not auto-popup

  const totalComplete = lanes.filter(l => ['complete', 'paywalled', 'partial'].includes(l.status)).length;
  const isRunning = phase === 'analyzing' || phase === 'spawning_wave1' || phase === 'running_wave1' || phase === 'escalation_pause' || phase === 'escalation_message' || phase === 'spawning_wave2' || phase === 'running_wave2';
  const selectedLane = lanes.find(l => l.id === selectedLaneId);

  const whatsNextActions = [
    { icon: <CalendarIcon className="w-4 h-4" />, label: 'Schedule', subtitle: 'Run this search daily', onClick: () => openSignup('Sign up to schedule this search and get fresh results daily') },
    { icon: <UploadIcon className="w-4 h-4" />, label: 'Export', subtitle: 'Send to your tools', onClick: () => openSignup('Sign up to export these contacts to your CRM or spreadsheet') },
    { icon: <ShareIcon className="w-4 h-4" />, label: 'Share', subtitle: 'Send link to anyone', onClick: () => openSignup('Sign up to share this search with your team') },
  ];

  return (
    <DemoLayout onRestart={startDemo} onSignUp={() => openSignup('Create a free account to save your results')} query={CFO_SEARCH_QUERY}>
      <TimelineContainer>
        {/* Step 1: Query */}
        <TimelineStep icon={<SearchIcon className="w-3.5 h-3.5" />} isActive={phase === 'idle'} isComplete={phase !== 'idle'} accentColor="cyan" showConnector={phase !== 'idle'}>
          <div className="p-4">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Searching</div>
            <div className="text-white text-lg">"{CFO_SEARCH_QUERY}"</div>
          </div>
        </TimelineStep>

        {/* Step 2: Planning */}
        <PlanningStep
          isPlanning={phase === 'planning'}
          isVisible={phase === 'planning' || isRunning || phase === 'complete'}
          showConnector={isRunning || phase === 'complete'}
          sites={WAVE1_SOURCES}
          accentColor="cyan"
          onPlanningComplete={handlePlanningComplete}
        />

        {/* Step 3: Sources + Browser */}
        {(isRunning || phase === 'synthesizing' || phase === 'complete') && (
          <TimelineStep icon={<SearchIcon className="w-3.5 h-3.5" />} isActive={isRunning} isComplete={phase === 'synthesizing' || phase === 'complete'} accentColor="cyan" showConnector={phase === 'synthesizing' || phase === 'complete'}>
            <div className={`flex items-center justify-between px-4 py-3 ${sourcesExpanded ? 'border-b border-white/10' : ''}`}>
              <button
                onClick={() => phase === 'complete' && setSourcesExpanded(!sourcesExpanded)}
                className={`flex items-center gap-3 ${phase === 'complete' ? 'hover:opacity-80 cursor-pointer' : ''} transition-opacity`}
              >
                <span className="text-white/80 font-medium">{phase === 'complete' ? 'Search Complete' : 'Searching Sources'}</span>
                {!sourcesExpanded && phase === 'complete' && <span className="text-white/40 text-sm">• {lanes.length} sources checked • {lanes.reduce((acc, l) => acc + l.resultsFound, 0)} contacts found</span>}
                {phase === 'complete' && <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} />}
              </button>
              <div className="flex items-center gap-2">
                {isRunning && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowNotifyPopup(true); }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
                    title="Get notified when ready"
                  >
                    <BellIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
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
                    <div className="text-center"><p className="text-white font-bold text-2xl">{selectedLane.resultsFound}</p><p className="text-white/50 text-sm mt-1">contacts found</p></div>
                  ) : undefined
                } : null}
              >
                <CFOSourcesList lanes={lanes} selectedLaneId={selectedLaneId} onSelectLane={setSelectedLaneId} showEscalation={showEscalation} />
              </SearchPanel>
            )}
          </TimelineStep>
        )}

        {/* Step 4: Synthesis */}
        <SynthesisStep
          isSynthesizing={phase === 'synthesizing'}
          isVisible={phase === 'synthesizing' || phase === 'complete'}
          showConnector={phase === 'complete'}
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
        {phase === 'complete' && (
          <TimelineResultStep ref={resultsRef} icon={<StarIcon className="w-3.5 h-3.5" />} showConnector={true}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white/80 font-medium">Results</span>
              <span className="text-white/40 text-sm">{CFO_SEARCH_SYNTHESIS.stats.totalFound} contacts found</span>
            </div>
            <CFOResultsTable onOpenSignup={() => openSignup('Sign up to view full contact details and export to your CRM')} />
            <InsightsPanel />
            <div className="p-4 pt-2">
              <NewHireAlertSetup />
            </div>
          </TimelineResultStep>
        )}

        {/* Step 6: What's Next */}
        {phase === 'complete' && (
          <TimelineFinalStep icon={<ArrowRightIcon className="w-3.5 h-3.5" />} animationDelay="200ms">
            <div className="p-4">
              <WhatsNextLabel />
              <WhatsNextActions actions={whatsNextActions} />
              {/* Follow-up action */}
              <div className="flex justify-center mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => openSignup('Sign up to ask follow-up questions and refine your search')}
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

      <SignUpOverlay isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} subtitle={signupContext} />
      <NotifyMePopup isOpen={showNotifyPopup} onClose={() => setShowNotifyPopup(false)} onSubmit={() => setNotifySubmitted(true)} />
    </DemoLayout>
  );
}
