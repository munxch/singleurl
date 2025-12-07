'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LoaderIcon,
  CheckIcon,
  SparklesIcon,
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
} from '@/components/icons';
import {
  BaseDemoLane,
  TimelineContainer,
  TimelineStep,
  TimelineResultStep,
  TimelineFinalStep,
  BrowserWindow,
  DemoLayout,
  WhatsNextActions,
  WhatsNextLabel,
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
import { SignupModal } from '@/components/ui/SignupModal';
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

type DemoPhase = 'idle' | 'analyzing' | 'spawning_wave1' | 'running_wave1' | 'escalation_pause' | 'escalation_message' | 'spawning_wave2' | 'running_wave2' | 'synthesizing' | 'complete';

// =============================================================================
// NOTIFY POPUP COMPONENT (Unique to CFO)
// =============================================================================

function NotifyMePopup({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: () => void }) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0c1e38] border border-white/20 shadow-2xl animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors">✕</button>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">⏳</span></div>
          <h2 className="text-xl font-semibold text-white">This search takes a bit longer</h2>
          <p className="text-white/50 text-sm mt-2">We're enriching data from multiple sources. Leave your contact info and we'll notify you when your results are ready.</p>
        </div>
        <div className="flex gap-2 mb-4">
          {(['email', 'phone'] as const).map(m => (
            <button key={m} onClick={() => setContactMethod(m)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${contactMethod === m ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}>
              {m === 'email' ? <MailIcon className="w-4 h-4" /> : <span className="text-sm">📱</span>}{m === 'email' ? 'Email' : 'Phone'}
            </button>
          ))}
        </div>
        <input type={contactMethod === 'email' ? 'email' : 'tel'} placeholder={contactMethod === 'email' ? 'your@email.com' : '(555) 123-4567'} value={value} onChange={(e) => setValue(e.target.value)} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 mb-4" />
        <button onClick={() => { onSubmit(); onClose(); }} className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors">Notify Me</button>
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
      case 'paywalled': return <LockIcon className="w-4 h-4 text-amber-400/70" />;
      case 'partial': return <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />;
      case 'pending': return <div className="w-3 h-3 rounded-full border-2 border-white/20" />;
      default: return <LoaderIcon className="w-4 h-4 animate-spin text-emerald-400/70" />;
    }
  };

  return (
    <button onClick={onClick} className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all overflow-hidden ${isSelected ? 'ring-1 ring-emerald-400/50' : 'hover:bg-white/[0.03]'}`}>
      <div className="absolute inset-0 bg-white/[0.04] transition-all duration-500" style={{ width: `${lane.progress}%` }} />
      <div className="relative flex items-center gap-3 w-full">
        {getStatusIcon()}
        <span className="flex-1 text-sm text-white/80 truncate">{lane.site}</span>
        {(lane.status === 'complete' || lane.status === 'partial') && lane.resultsFound > 0 && (
          <span className={`text-sm tabular-nums ${lane.status === 'partial' ? 'text-amber-400/80' : 'text-emerald-400/80'}`}>{lane.resultsFound} found</span>
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
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3"><span className="text-lg">🎯</span><span className="text-white/80 font-medium">{CFO_SEARCH_SYNTHESIS.headline}</span></div>
        <span className="text-white/40 text-sm">{CFO_SEARCH_SYNTHESIS.subtitle}</span>
      </div>
      <TableStatsBar stats={tableStats} />
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
    <div className="glass-card p-4">
      <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">Insights</div>
      <ul className="space-y-2">
        {CFO_SEARCH_SYNTHESIS.insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-white/70 text-sm"><span className="text-emerald-400 mt-0.5">•</span>{insight}</li>
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
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [lanes, setLanes] = useState<DemoLane[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [showEscalation, setShowEscalation] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const getMockSource = useCallback((laneId: string) => CFO_SEARCH_SOURCES.find(s => s.id === laneId), []);
  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => { setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)); }, []);

  useEffect(() => {
    if (selectedLaneId) return;
    const activeLane = lanes.find(l => !['pending', 'complete', 'paywalled', 'partial'].includes(l.status));
    if (activeLane) setSelectedLaneId(activeLane.id);
  }, [lanes, selectedLaneId]);

  const startDemo = useCallback(() => {
    setPhase('analyzing');
    setLanes([]);
    setTotalFound(0);
    setShowEscalation(false);
    setSelectedLaneId(null);
    setSourcesExpanded(true);
    setShowNotifyPopup(false);
    setNotifySubmitted(false);

    setTimeout(() => {
      setPhase('spawning_wave1');
      const wave1: DemoLane[] = WAVE1_SOURCES.map(s => ({ id: s.id, site: s.site, domain: s.domain, status: 'spawning' as LaneStatus, progress: 0, wave: 1 as const, resultsFound: 0, currentAction: 'Starting search...' }));
      setLanes(wave1);
      setSelectedLaneId(wave1[0].id);

      setTimeout(() => {
        setPhase('running_wave1');
        wave1.forEach((lane, i) => {
          const mockSource = getMockSource(lane.id);
          const isPaywalled = mockSource?.status === 'paywalled';
          const isPartial = mockSource?.status === 'partial';
          const baseDelay = 200 + (i * 500);

          setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 25, currentAction: 'Searching database...' }), baseDelay);

          if (isPaywalled) {
            setTimeout(() => updateLane(lane.id, { status: 'paywalled', progress: 40, statusMessage: mockSource?.statusMessage }), baseDelay + 2000);
          } else {
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 60, currentAction: 'Extracting contacts...' }), baseDelay + 1500);
            setTimeout(() => {
              updateLane(lane.id, { status: (isPartial ? 'partial' : 'complete') as LaneStatus, progress: 100, resultsFound: mockSource?.resultsFound || 0, statusMessage: mockSource?.statusMessage });
              if (mockSource?.resultsFound) setTotalFound(prev => prev + mockSource.resultsFound);
            }, baseDelay + 2800);
          }
        });
        setTimeout(() => setPhase('escalation_pause'), 5500);
      }, 500);
    }, 1200);
  }, [getMockSource, updateLane]);

  useEffect(() => {
    if (phase === 'escalation_pause') setTimeout(() => { setPhase('escalation_message'); setShowEscalation(true); }, 1000);
    if (phase === 'escalation_message') {
      setTimeout(() => {
        setPhase('spawning_wave2');
        const wave2: DemoLane[] = WAVE2_SOURCES.map(s => ({ id: s.id, site: s.site, domain: s.domain, status: 'spawning' as LaneStatus, progress: 0, wave: 2 as const, resultsFound: 0, currentAction: 'Starting enrichment...' }));
        setLanes(prev => { const ids = new Set(prev.map(l => l.id)); return [...prev, ...wave2.filter(l => !ids.has(l.id))]; });
        setSelectedLaneId(wave2[0].id);

        setTimeout(() => {
          setPhase('running_wave2');
          wave2.forEach((lane, i) => {
            const mockSource = getMockSource(lane.id);
            const baseDelay = 300 + (i * 400);
            setTimeout(() => updateLane(lane.id, { status: 'searching', progress: 30, currentAction: 'Scanning website...' }), baseDelay);
            setTimeout(() => updateLane(lane.id, { status: 'extracting', progress: 65, currentAction: 'Enriching data...' }), baseDelay + 1000);
            setTimeout(() => updateLane(lane.id, { status: 'complete', progress: 100, resultsFound: mockSource?.resultsFound || 0 }), baseDelay + 2000);
          });
          setTimeout(() => { setPhase('synthesizing'); setTimeout(() => setPhase('complete'), 1000); }, 4000);
        }, 500);
      }, 1800);
    }
  }, [phase, getMockSource, updateLane]);

  useEffect(() => { const timer = setTimeout(startDemo, 500); return () => clearTimeout(timer); }, [startDemo]);
  useEffect(() => { if (phase === 'complete' && resultsRef.current) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300); }, [phase]);
  useEffect(() => { if (phase === 'running_wave2' && !notifySubmitted) { const timer = setTimeout(() => setShowNotifyPopup(true), 2500); return () => clearTimeout(timer); } }, [phase, notifySubmitted]);

  const totalComplete = lanes.filter(l => ['complete', 'paywalled', 'partial'].includes(l.status)).length;
  const isRunning = phase !== 'idle' && phase !== 'complete';
  const selectedLane = lanes.find(l => l.id === selectedLaneId);

  const whatsNextActions = [
    { icon: '🔄', label: 'New Search', onClick: startDemo },
    { icon: '🔔', label: 'Watch for Hires', onClick: () => setShowSignupModal(true) },
    { icon: '📤', label: 'Export to CRM', onClick: () => setShowSignupModal(true) },
    { icon: '↗', label: 'Share', onClick: () => setShowSignupModal(true) },
  ];

  return (
    <DemoLayout onRestart={startDemo}>
      <TimelineContainer showLine={phase !== 'idle' && phase !== 'analyzing'}>
        {/* Step 1: Query */}
        <TimelineStep icon={<SparklesIcon className="w-3.5 h-3.5" />} isActive={phase === 'idle' || phase === 'analyzing'} isComplete={phase !== 'idle' && phase !== 'analyzing'} accentColor="emerald">
          <div className="p-4">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Searching</div>
            <div className="text-white text-lg">"{CFO_SEARCH_QUERY}"</div>
          </div>
        </TimelineStep>

        {/* Step 2: Sources + Browser */}
        {phase !== 'idle' && phase !== 'analyzing' && (
          <TimelineStep icon={<SearchIcon className="w-3.5 h-3.5" />} isActive={isRunning} isComplete={phase === 'complete'} accentColor="emerald">
            <button
              onClick={() => phase === 'complete' && setSourcesExpanded(!sourcesExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 ${sourcesExpanded ? 'border-b border-white/10' : ''} ${phase === 'complete' ? 'hover:bg-white/[0.02] cursor-pointer' : ''} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span className="text-white/80 font-medium">{phase === 'complete' ? 'Search Complete' : 'Searching Sources'}</span>
                {!sourcesExpanded && phase === 'complete' && <span className="text-white/40 text-sm">• {lanes.length} sources checked • {lanes.reduce((acc, l) => acc + l.resultsFound, 0)} contacts found</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">{totalComplete} of {lanes.length}</span>
                {phase === 'complete' && <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} />}
              </div>
            </button>

            {sourcesExpanded && (
              <div className="flex flex-col" style={{ height: '55vh', maxHeight: '500px' }}>
                <div className="flex flex-1 min-h-0">
                  <div className="w-72 p-4 border-r border-white/10 overflow-y-auto">
                    <CFOSourcesList lanes={lanes} selectedLaneId={selectedLaneId} onSelectLane={setSelectedLaneId} showEscalation={showEscalation} />
                  </div>
                  <div className="flex-1 relative overflow-hidden">
                    {selectedLane ? (
                      <BrowserWindow
                        domain={selectedLane.domain}
                        status={selectedLane.status}
                        currentAction={selectedLane.currentAction}
                        statusMessage={selectedLane.statusMessage}
                        accentColor="emerald"
                        siteIcon={selectedLane.wave === 2 ? '🔍' : '💼'}
                        siteName={selectedLane.site}
                        siteSubtitle={selectedLane.wave === 1 ? 'Business database' : 'Data enrichment'}
                        completeOverlay={selectedLane.resultsFound > 0 ? (
                          <div className="text-center"><p className="text-white font-bold text-2xl">{selectedLane.resultsFound}</p><p className="text-white/50 text-sm mt-1">contacts found</p></div>
                        ) : undefined}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1a]">
                        <div className="text-center"><LoaderIcon className="w-6 h-6 text-emerald-400/60 animate-spin mx-auto mb-2" /><p className="text-white/40 text-sm">Starting...</p></div>
                      </div>
                    )}
                  </div>
                </div>
                {isRunning && totalFound > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border-t border-white/5">
                    <span className="text-base">📊</span>
                    <span className="text-white/60 text-sm">{phase === 'running_wave2' ? 'Enriching: ' : 'Found: '}</span>
                    <span className="text-emerald-400/90 text-sm font-medium">{totalFound} CFOs so far</span>
                  </div>
                )}
              </div>
            )}
          </TimelineStep>
        )}

        {/* Step 3: Results */}
        {phase === 'complete' && (
          <TimelineResultStep ref={resultsRef} icon={<StarIcon className="w-3.5 h-3.5" />}>
            <div className="p-4 space-y-6">
              <CFOResultsTable onOpenSignup={() => setShowSignupModal(true)} />
              <InsightsPanel />
              <NewHireAlertSetup />
            </div>
          </TimelineResultStep>
        )}

        {/* Step 4: What's Next */}
        {phase === 'complete' && (
          <TimelineFinalStep icon={<ArrowRightIcon className="w-3.5 h-3.5" />} animationDelay="200ms">
            <div className="p-4"><WhatsNextLabel /><WhatsNextActions actions={whatsNextActions} /></div>
          </TimelineFinalStep>
        )}
      </TimelineContainer>

      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} title="Export your results" subtitle="Create a free account to export contacts and sync with your CRM." />
      <NotifyMePopup isOpen={showNotifyPopup} onClose={() => setShowNotifyPopup(false)} onSubmit={() => setNotifySubmitted(true)} />
    </DemoLayout>
  );
}
