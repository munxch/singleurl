'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import {
  LoaderIcon,
  CheckCircleIcon,
  CheckIcon,
  AlertTriangleIcon,
  GlobeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  DownloadIcon,
  UploadIcon,
  LockIcon,
  MailIcon,
  UsersIcon,
  BuildingIcon,
  SparklesIcon,
  SearchIcon,
  StarIcon,
} from '@/components/icons';
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

// =============================================================================
// NOTIFY POPUP COMPONENT
// =============================================================================

function NotifyMePopup({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0c1e38] border border-white/20 shadow-2xl animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-xl font-semibold text-white">This search takes a bit longer</h2>
          <p className="text-white/50 text-sm mt-2">
            We're enriching data from multiple sources. Leave your contact info and we'll notify you when your results are ready.
          </p>
        </div>

        {/* Contact method toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setContactMethod('email')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              contactMethod === 'email'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            <MailIcon className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => setContactMethod('phone')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              contactMethod === 'phone'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-sm">📱</span>
            Phone
          </button>
        </div>

        {/* Input */}
        <input
          type={contactMethod === 'email' ? 'email' : 'tel'}
          placeholder={contactMethod === 'email' ? 'your@email.com' : '(555) 123-4567'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
        >
          Notify Me
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 px-4 text-white/50 text-sm hover:text-white/70 transition-colors"
        >
          I'll wait for results
        </button>
      </div>
    </div>
  );
}

type DemoPhase =
  | 'idle'
  | 'analyzing'
  | 'spawning_wave1'
  | 'running_wave1'
  | 'escalation_pause'
  | 'escalation_message'
  | 'spawning_wave2'
  | 'running_wave2'
  | 'synthesizing'
  | 'complete';

// =============================================================================
// BROWSER WINDOW COMPONENT
// =============================================================================

function BrowserWindow({ lane }: { lane: DemoLane }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0f0f1a]">
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] border-b border-white/10">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] rounded-md">
          <GlobeIcon className="w-3.5 h-3.5 text-white/40" />
          <span className="text-white/50 text-xs font-mono truncate">
            {lane.domain}
          </span>
        </div>
        <div className="flex items-center">
          {lane.status === 'complete' && <CheckCircleIcon className="w-4 h-4 text-white/40" />}
          {lane.status === 'paywalled' && <LockIcon className="w-4 h-4 text-amber-400/70" />}
          {lane.status === 'partial' && <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />}
          {!['complete', 'paywalled', 'partial', 'pending'].includes(lane.status) && (
            <LoaderIcon className="w-4 h-4 animate-spin text-cyan-400/70" />
          )}
        </div>
      </div>

      {/* Browser content */}
      <div className="h-full p-4 relative">
        {/* Site header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-base">{lane.wave === 2 ? '🔍' : '💼'}</span>
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">{lane.site}</div>
            <div className="text-white/40 text-xs">
              {lane.wave === 1 ? 'Business database' : 'Data enrichment'}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-8 bg-white/5 rounded border border-white/10 flex items-center px-3">
            <span className="text-white/30 text-xs truncate">
              hospitality CFO Dallas Fort Worth...
            </span>
          </div>
          <div className="w-16 h-8 bg-blue-500/20 rounded" />
        </div>

        {/* Result rows */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-2 bg-white/[0.02] rounded border border-white/5">
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                <span className="text-sm opacity-30">👤</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="w-2/3 h-2.5 bg-white/10 rounded" />
                <div className="w-1/2 h-2 bg-white/5 rounded" />
              </div>
              <div className="w-16 h-6 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Status overlays */}
        {lane.status !== 'complete' && lane.status !== 'pending' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            {lane.status === 'paywalled' ? (
              <div className="text-center">
                <LockIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-400 font-medium text-sm">Paywalled</p>
                <p className="text-white/40 text-xs mt-1">{lane.statusMessage}</p>
              </div>
            ) : lane.status === 'partial' ? (
              <div className="text-center">
                <AlertTriangleIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-400 font-medium text-sm">Limited Results</p>
                <p className="text-white/40 text-xs mt-1">{lane.statusMessage}</p>
              </div>
            ) : (
              <div className="text-center">
                <LoaderIcon className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                <p className="text-white/80 text-sm">{lane.currentAction}</p>
              </div>
            )}
          </div>
        )}

        {lane.status === 'complete' && lane.resultsFound > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white font-bold text-2xl">{lane.resultsFound}</p>
              <p className="text-white/50 text-sm mt-1">contacts found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SOURCE ROW WITH PROGRESS FILL
// =============================================================================

function SourceRow({
  lane,
  isSelected,
  onClick,
}: {
  lane: DemoLane;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-white/40" />;
      case 'paywalled':
        return <LockIcon className="w-4 h-4 text-amber-400/70" />;
      case 'partial':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />;
      case 'pending':
        return <div className="w-3 h-3 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className="w-4 h-4 animate-spin text-blue-400/70" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all overflow-hidden
        ${isSelected
          ? 'ring-1 ring-cyan-400/50 bg-transparent'
          : 'hover:bg-white/[0.03]'
        }
      `}
    >
      {/* Progress fill background */}
      <div
        className="absolute inset-0 bg-white/[0.04] transition-all duration-500 ease-out"
        style={{ width: `${lane.progress}%` }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-3 w-full">
        {getStatusIcon()}
        <span className="flex-1 text-sm text-white/80 truncate">
          {lane.site}
        </span>
        {lane.status === 'complete' && lane.resultsFound > 0 && (
          <span className="text-cyan-400/80 text-sm tabular-nums">
            {lane.resultsFound} found
          </span>
        )}
        {lane.status === 'partial' && lane.resultsFound > 0 && (
          <span className="text-amber-400/80 text-sm tabular-nums">
            {lane.resultsFound} found
          </span>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// SOURCES LIST COMPONENT
// =============================================================================

function SourcesList({
  lanes,
  selectedLaneId,
  onSelectLane,
  showEscalation,
}: {
  lanes: DemoLane[];
  selectedLaneId: string | null;
  onSelectLane: (id: string) => void;
  showEscalation: boolean;
}) {
  const wave1 = lanes.filter(l => l.wave === 1);
  const wave2 = lanes.filter(l => l.wave === 2);

  return (
    <div className="space-y-4">
      {/* Wave 1 */}
      {wave1.length > 0 && (
        <div>
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
            {wave2.length > 0 ? 'Business Databases' : 'Sources'}
          </div>
          <div className="space-y-1">
            {wave1.map(lane => (
              <SourceRow
                key={lane.id}
                lane={lane}
                isSelected={selectedLaneId === lane.id}
                onClick={() => onSelectLane(lane.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Escalation message */}
      {showEscalation && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] text-white/50 text-sm">
          <span className="text-white/30">+</span>
          <span>ZoomInfo paywalled — enriching from company websites...</span>
        </div>
      )}

      {/* Wave 2 */}
      {wave2.length > 0 && (
        <div className="animate-fadeIn">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
            Data Enrichment
          </div>
          <div className="space-y-1">
            {wave2.map(lane => (
              <SourceRow
                key={lane.id}
                lane={lane}
                isSelected={selectedLaneId === lane.id}
                onClick={() => onSelectLane(lane.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PROGRESS BANNER
// =============================================================================

function ProgressBanner({
  totalFound,
  isEnriching,
}: {
  totalFound: number;
  isEnriching: boolean;
}) {
  if (totalFound === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/5 border-t border-white/5">
      <span className="text-base">📊</span>
      <div className="flex-1 min-w-0">
        <span className="text-white/60 text-sm">
          {isEnriching ? 'Enriching: ' : 'Found: '}
        </span>
        <span className="text-cyan-400/90 text-sm font-medium">
          {totalFound} CFOs so far
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// RESULTS TABLE
// =============================================================================

function CFOResultsTable({ onOpenSignup }: { onOpenSignup: () => void }) {
  const columns: DataTableColumn<CFOResult>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '180px',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-white font-medium">{row.name}</div>
          <div className="text-white/40 text-xs">{row.title}</div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      width: '200px',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="text-white/80">{row.company.name}</div>
          <CompanyTypeBadge type={row.company.type} />
        </div>
      ),
    },
    {
      key: 'employees',
      header: 'Size',
      width: '80px',
      sortable: true,
      render: (row) => (
        <span className="text-white/60 tabular-nums">
          {row.company.employees.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      width: '120px',
      render: (row) => (
        <ContactIndicators
          email={row.contact.email}
          emailVerified={row.contact.emailVerified}
          linkedIn={row.contact.linkedIn}
          phone={row.contact.phone}
        />
      ),
    },
    {
      key: 'confidence',
      header: 'Quality',
      width: '80px',
      sortable: true,
      render: (row) => <ConfidenceBadge level={row.confidence} />,
    },
    {
      key: 'source',
      header: 'Source',
      width: '150px',
      render: (row) => (
        <span className="text-white/40 text-xs">{row.source}</span>
      ),
    },
  ];

  const tableStats = [
    { label: 'Total', value: CFO_SEARCH_SYNTHESIS.stats.totalFound, icon: <UsersIcon className="w-4 h-4" /> },
    { label: 'Verified Emails', value: CFO_SEARCH_SYNTHESIS.stats.emailsVerified, icon: <MailIcon className="w-4 h-4" />, color: 'text-green-400' },
    { label: 'High Confidence', value: CFO_SEARCH_SYNTHESIS.stats.highConfidence, icon: <CheckIcon className="w-4 h-4" />, color: 'text-cyan-400' },
  ];

  const tableActions = [
    {
      id: 'export-csv',
      label: 'Export CSV',
      icon: <DownloadIcon className="w-4 h-4" />,
      onClick: onOpenSignup,
    },
    {
      id: 'send-crm',
      label: 'Send to CRM',
      icon: <UploadIcon className="w-4 h-4" />,
      onClick: onOpenSignup,
      variant: 'primary' as const,
    },
  ];

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-lg">🎯</span>
          <span className="text-white/80 font-medium">{CFO_SEARCH_SYNTHESIS.headline}</span>
        </div>
        <span className="text-white/40 text-sm">{CFO_SEARCH_SYNTHESIS.subtitle}</span>
      </div>

      {/* Stats bar */}
      <TableStatsBar stats={tableStats} />

      {/* Table */}
      <DataTable
        data={CFO_SEARCH_RESULTS}
        columns={columns}
        keyExtractor={(row) => row.id}
        maxHeight="400px"
        showRowNumbers={true}
      />

      {/* Actions bar */}
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
      <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium">
        Insights
      </div>
      <ul className="space-y-2">
        {CFO_SEARCH_SYNTHESIS.insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
            <span className="text-cyan-400 mt-0.5">•</span>
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// PIVOT SUGGESTIONS
// =============================================================================

function PivotSuggestions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
      >
        Adjust search
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 rounded-xl bg-[#0a1628] border border-white/20 shadow-xl z-50 space-y-2">
          {CFO_SEARCH_SYNTHESIS.pivots.map((pivot, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <span className="text-sm">{pivot.emoji}</span>
              <div>
                <div className="text-white/80 text-xs">{pivot.label}</div>
                <div className="text-white/40 text-[10px]">{pivot.description}</div>
              </div>
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-colors">
              Modify
            </button>
            <button className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-colors">
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TRANSPARENCY VIEW
// =============================================================================

function TransparencyView() {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: CFOSourceResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckIcon className="w-4 h-4 text-green-400" />;
      case 'paywalled':
        return <LockIcon className="w-4 h-4 text-amber-400" />;
      case 'partial':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-400" />;
      default:
        return <span className="text-white/40">—</span>;
    }
  };

  const wave1 = CFO_SEARCH_SOURCES.filter(s => s.wave === 1);
  const wave2 = CFO_SEARCH_SOURCES.filter(s => s.wave === 2);
  const successCount = CFO_SEARCH_SOURCES.filter(s => s.status === 'success').length;
  const paywalledCount = CFO_SEARCH_SOURCES.filter(s => s.status === 'paywalled').length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white/40 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
      >
        Checked {CFO_SEARCH_SOURCES.length} sources ({successCount} success, {paywalledCount} paywalled)
        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-80 p-4 rounded-xl bg-[#0a1628] border border-white/20 shadow-xl z-50 space-y-3">
          {/* Wave 1 */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Business Databases</div>
            <div className="space-y-1">
              {wave1.map(source => (
                <div key={source.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <span className="text-white/70">{source.site}</span>
                  </div>
                  <span className={`${
                    source.status === 'success' ? 'text-white/50' :
                    source.status === 'paywalled' ? 'text-amber-400/80' :
                    'text-white/40'
                  }`}>
                    {source.status === 'success' ? `${source.resultsFound} found` :
                     source.status === 'partial' ? `${source.resultsFound} (limited)` :
                     source.statusMessage || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation */}
          <div className="text-blue-400/80 text-xs">
            ZoomInfo paywalled → enriched from company websites
          </div>

          {/* Wave 2 */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Data Enrichment</div>
            <div className="space-y-1">
              {wave2.map(source => (
                <div key={source.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <span className="text-white/70">{source.site}</span>
                  </div>
                  <span className="text-white/50">
                    {source.resultsFound} enriched
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="text-xl">🔔</span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-white font-medium">Watch for new hires?</div>
          <div className="text-white/50 text-sm">
            Get alerted when new CFOs join hospitality groups in DFW
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-green-400/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          <div className="text-white/60 text-sm">
            Mino monitors LinkedIn and company websites daily for executive changes — you'll know before the news does.
          </div>

          <div className="p-3 rounded-lg bg-white/5 space-y-2">
            <div className="text-white/50 text-xs uppercase tracking-wider">Watching for:</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">CFO / VP Finance</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">Hospitality</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs">DFW Area</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
            />
            <button className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 transition-colors">
              Start Watching
            </button>
            <div className="text-center text-white/40 text-xs">
              Usually finds 1-2 new executives per month
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

// Static data - computed once outside component to prevent recreation on each render
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

  const getMockSource = useCallback((laneId: string): CFOSourceResult | undefined => {
    return CFO_SEARCH_SOURCES.find(s => s.id === laneId);
  }, []);

  const updateLane = useCallback((id: string, updates: Partial<DemoLane>) => {
    setLanes(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  // Auto-select active lanes as they progress
  useEffect(() => {
    if (selectedLaneId) return;

    const activeLane = lanes.find(l =>
      !['pending', 'complete', 'paywalled', 'partial'].includes(l.status)
    );
    if (activeLane) {
      setSelectedLaneId(activeLane.id);
    }
  }, [lanes, selectedLaneId]);

  // Start demo
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

      const wave1: DemoLane[] = WAVE1_SOURCES.map(s => ({
        id: s.id,
        site: s.site,
        domain: s.domain,
        status: 'spawning' as LaneStatus,
        progress: 0,
        wave: 1 as const,
        resultsFound: 0,
        currentAction: 'Starting search...',
      }));
      setLanes(wave1);
      setSelectedLaneId(wave1[0].id);

      setTimeout(() => {
        setPhase('running_wave1');

        wave1.forEach((lane, i) => {
          const mockSource = getMockSource(lane.id);
          const isPaywalled = mockSource?.status === 'paywalled';
          const isPartial = mockSource?.status === 'partial';
          const baseDelay = 200 + (i * 500);

          setTimeout(() => {
            updateLane(lane.id, {
              status: 'searching',
              progress: 25,
              currentAction: 'Searching database...'
            });
          }, baseDelay);

          if (isPaywalled) {
            setTimeout(() => {
              updateLane(lane.id, {
                status: 'paywalled',
                progress: 40,
                statusMessage: mockSource?.statusMessage,
              });
            }, baseDelay + 2000);
          } else {
            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 60,
                currentAction: 'Extracting contacts...'
              });
            }, baseDelay + 1500);

            setTimeout(() => {
              const finalStatus = isPartial ? 'partial' : 'complete';
              updateLane(lane.id, {
                status: finalStatus as LaneStatus,
                progress: 100,
                resultsFound: mockSource?.resultsFound || 0,
                statusMessage: mockSource?.statusMessage,
              });

              if (mockSource?.resultsFound) {
                setTotalFound(prev => prev + mockSource.resultsFound);
              }
            }, baseDelay + 2800);
          }
        });

        setTimeout(() => setPhase('escalation_pause'), 5500);
      }, 500);
    }, 1200);
  }, [getMockSource, updateLane]);

  // Handle escalation phases
  useEffect(() => {
    if (phase === 'escalation_pause') {
      setTimeout(() => {
        setPhase('escalation_message');
        setShowEscalation(true);
      }, 1000);
    }

    if (phase === 'escalation_message') {
      setTimeout(() => {
        setPhase('spawning_wave2');

        const wave2: DemoLane[] = WAVE2_SOURCES.map(s => ({
          id: s.id,
          site: s.site,
          domain: s.domain,
          status: 'spawning' as LaneStatus,
          progress: 0,
          wave: 2 as const,
          resultsFound: 0,
          currentAction: 'Starting enrichment...',
        }));
        setLanes(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newLanes = wave2.filter(l => !existingIds.has(l.id));
          return [...prev, ...newLanes];
        });
        setSelectedLaneId(wave2[0].id);

        setTimeout(() => {
          setPhase('running_wave2');

          wave2.forEach((lane, i) => {
            const mockSource = getMockSource(lane.id);
            const baseDelay = 300 + (i * 400);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'searching',
                progress: 30,
                currentAction: 'Scanning website...'
              });
            }, baseDelay);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'extracting',
                progress: 65,
                currentAction: 'Enriching data...'
              });
            }, baseDelay + 1000);

            setTimeout(() => {
              updateLane(lane.id, {
                status: 'complete',
                progress: 100,
                resultsFound: mockSource?.resultsFound || 0,
              });
            }, baseDelay + 2000);
          });

          setTimeout(() => {
            setPhase('synthesizing');
            setTimeout(() => setPhase('complete'), 1000);
          }, 4000);
        }, 500);
      }, 1800);
    }
  }, [phase, getMockSource, updateLane]);

  // Auto-start
  useEffect(() => {
    const timer = setTimeout(startDemo, 500);
    return () => clearTimeout(timer);
  }, [startDemo]);

  // Auto-scroll to results when complete
  useEffect(() => {
    if (phase === 'complete' && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [phase]);

  // Show notify popup during wave 2 (after a delay)
  useEffect(() => {
    if (phase === 'running_wave2' && !notifySubmitted) {
      const timer = setTimeout(() => {
        setShowNotifyPopup(true);
      }, 2500); // Show after 2.5 seconds into wave 2
      return () => clearTimeout(timer);
    }
  }, [phase, notifySubmitted]);

  const totalComplete = lanes.filter(l =>
    l.status === 'complete' || l.status === 'paywalled' || l.status === 'partial'
  ).length;
  const isRunning = phase !== 'idle' && phase !== 'complete';

  return (
    <div className="min-h-screen">
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      <div className="content">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <MinoLogo />
          <button onClick={startDemo} className="text-white/50 hover:text-white/70 transition-colors text-sm">
            Restart
          </button>
        </header>

        <main className="px-6 pb-12">
          <div className="max-w-5xl mx-auto">
            {/* Timeline container */}
            <div className="relative">
              {/* Timeline vertical line - only show when there's more than one step */}
              {phase !== 'idle' && phase !== 'analyzing' && (
                <div className="absolute left-[13px] top-6 bottom-28 w-px bg-white/10" />
              )}

              {/* Step 1: Query */}
              <div className="relative flex gap-4 mb-6">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    phase === 'idle' || phase === 'analyzing'
                      ? 'border-emerald-400 bg-emerald-400'
                      : 'border-white/20 bg-white/10'
                  }`}>
                    {phase !== 'idle' && phase !== 'analyzing' ? (
                      <CheckIcon className="w-3.5 h-3.5 text-white/70" />
                    ) : (
                      <SparklesIcon className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 glass-card p-4">
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Searching</div>
                  <div className="text-white text-lg">"{CFO_SEARCH_QUERY}"</div>
                </div>
              </div>

              {/* Step 2: Sources + Browser */}
              {phase !== 'idle' && phase !== 'analyzing' && (
              <div className="relative flex gap-4 mb-6 animate-fadeIn">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    isRunning
                      ? 'border-emerald-400 bg-emerald-400'
                      : 'border-white/20 bg-white/10'
                  }`}>
                    {isRunning ? (
                      <SearchIcon className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <CheckIcon className="w-3.5 h-3.5 text-white/70" />
                    )}
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 glass-card overflow-hidden">
                  {/* Card header - clickable to toggle */}
                  <button
                    onClick={() => phase === 'complete' && setSourcesExpanded(!sourcesExpanded)}
                    className={`w-full flex items-center justify-between px-4 py-3 ${sourcesExpanded ? 'border-b border-white/10' : ''} ${phase === 'complete' ? 'hover:bg-white/[0.02] cursor-pointer' : ''} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/80 font-medium">
                        {phase === 'complete' ? 'Search Complete' : 'Searching Sources'}
                      </span>
                      {!sourcesExpanded && phase === 'complete' && (
                        <span className="text-white/40 text-sm">
                          • {lanes.length} sources checked • {lanes.reduce((acc, l) => acc + l.resultsFound, 0)} contacts found
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-sm">
                        {totalComplete} of {lanes.length}
                      </span>
                      {phase === 'complete' && (
                        <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${sourcesExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </button>

                  {/* Main content (collapsible) */}
                  {sourcesExpanded && (
                  <div className="flex flex-col" style={{ height: '55vh', maxHeight: '500px' }}>
                    <div className="flex flex-1 min-h-0">
                      {/* Left: Sources list */}
                      <div className="w-72 p-4 border-r border-white/10 overflow-y-auto">
                        <SourcesList
                          lanes={lanes}
                          selectedLaneId={selectedLaneId}
                          onSelectLane={setSelectedLaneId}
                          showEscalation={showEscalation}
                        />
                      </div>

                      {/* Right: Browser preview */}
                      <div className="flex-1 relative overflow-hidden">
                        {selectedLaneId && lanes.find(l => l.id === selectedLaneId) ? (
                          <BrowserWindow lane={lanes.find(l => l.id === selectedLaneId)!} />
                        ) : lanes.length > 0 ? (
                          <BrowserWindow lane={lanes[0]} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1a]">
                            <div className="text-center">
                              <LoaderIcon className="w-6 h-6 text-cyan-400/60 animate-spin mx-auto mb-2" />
                              <p className="text-white/40 text-sm">Starting...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress banner */}
                    {isRunning && totalFound > 0 && (
                      <ProgressBanner
                        totalFound={totalFound}
                        isEnriching={phase === 'running_wave2'}
                      />
                    )}
                  </div>
                  )}
                </div>
              </div>
              )}

              {/* Step 3: Results */}
              {phase === 'complete' && (
              <div ref={resultsRef} className="relative flex gap-4 mb-6 animate-fadeIn">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full border-2 border-green-400 bg-green-400 flex items-center justify-center">
                    <StarIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 space-y-6">
                  {/* Results Table */}
                  <CFOResultsTable onOpenSignup={() => setShowSignupModal(true)} />

                  {/* Insights */}
                  <InsightsPanel />

                  {/* New Hire Alert */}
                  <NewHireAlertSetup />

                </div>
              </div>
              )}

              {/* Step 4: What's Next */}
              {phase === 'complete' && (
              <div className="relative flex gap-4 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center">
                    <ArrowRightIcon className="w-3.5 h-3.5 text-white/70" />
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 glass-card p-4">
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-3">What's Next</div>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={startDemo}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      🔄 New Search
                    </button>
                    <button
                      onClick={() => setShowSignupModal(true)}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      🔔 Watch for Hires
                    </button>
                    <button
                      onClick={() => setShowSignupModal(true)}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      📤 Export to CRM
                    </button>
                    <button
                      onClick={() => setShowSignupModal(true)}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      ↗ Share
                    </button>
                  </div>
                </div>
              </div>
              )}

            </div>
            {/* End timeline container */}
          </div>
        </main>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        title="Export your results"
        subtitle="Create a free account to export contacts and sync with your CRM."
      />

      {/* Notify Me Popup */}
      <NotifyMePopup
        isOpen={showNotifyPopup}
        onClose={() => setShowNotifyPopup(false)}
        onSubmit={() => setNotifySubmitted(true)}
      />
    </div>
  );
}
