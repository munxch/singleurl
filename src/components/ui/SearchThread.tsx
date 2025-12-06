'use client';

import { useState } from 'react';
import { SessionLane, ExtractedResult, AggregatedResults, Synthesis, NextAction, ParsedQuery, RequiredInput } from '@/types/orchestrator';
import {
  SearchIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GlobeIcon,
  ExternalLinkIcon,
  SparklesIcon,
} from '@/components/icons';
import { SignupModal } from './SignupModal';

interface SearchThreadProps {
  // Query
  query: string;
  parsedQuery: ParsedQuery | null;
  completedInputs?: Record<string, string>;

  // Progress state
  isRunning: boolean;
  lanes: SessionLane[];
  progress: { total: number; completed: number; failed: number };
  currentBest: ExtractedResult | null;

  // Results state
  isComplete: boolean;
  results: AggregatedResults | null;
  synthesis: Synthesis | null;
  nextActions: NextAction[];
  onAction: (action: NextAction) => void;
}

export function SearchThread({
  query,
  parsedQuery,
  completedInputs,
  isRunning,
  lanes,
  progress,
  currentBest,
  isComplete,
  results,
  synthesis,
  nextActions,
  onAction,
}: SearchThreadProps) {
  const [progressExpanded, setProgressExpanded] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupContext, setSignupContext] = useState<{ title: string; subtitle: string }>({
    title: 'Save your results',
    subtitle: 'Create an account to save results and access them anytime.',
  });

  const showProgress = isRunning || (isComplete && lanes.length > 0);

  // Handle actions - show signup for save/alert, pass through for others
  const handleAction = (action: NextAction) => {
    if (action.type === 'save') {
      setSignupContext({
        title: 'Save your results',
        subtitle: 'Create an account to save results and access them anytime.',
      });
      setShowSignup(true);
    } else if (action.type === 'alert') {
      setSignupContext({
        title: 'Track price changes',
        subtitle: 'Create an account to get notified when prices drop.',
      });
      setShowSignup(true);
    } else {
      onAction(action);
    }
  };

  return (
    <div className="relative">
      {/* Thread line - vertical connector */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/20 to-transparent" />

      <div className="space-y-0">
        {/* Query Card */}
        <QueryCard query={query} />

        {/* Completed Clarification Card - shows user's answers */}
        {completedInputs && Object.keys(completedInputs).length > 0 && parsedQuery?.requiredInputs && (
          <CompletedClarificationCard
            questions={parsedQuery.requiredInputs}
            answers={completedInputs}
          />
        )}

        {/* Progress Card - appears when running or complete */}
        {showProgress && (
          <ProgressCard
            lanes={lanes}
            progress={progress}
            currentBest={currentBest}
            isRunning={isRunning}
            isComplete={isComplete}
            expanded={progressExpanded}
            onToggle={() => setProgressExpanded(!progressExpanded)}
          />
        )}

        {/* Results Card - appears when complete */}
        {isComplete && results && (
          <ResultsCard
            results={results}
            synthesis={synthesis}
            lanes={lanes}
            nextActions={nextActions}
            onAction={handleAction}
          />
        )}
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        title={signupContext.title}
        subtitle={signupContext.subtitle}
      />
    </div>
  );
}

// Query Card - shows the user's search query
function QueryCard({ query }: { query: string }) {
  return (
    <div className="relative pl-12 pb-4">
      {/* Thread node */}
      <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-400 shadow-lg shadow-blue-500/30" />

      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-blue-400" />
          <p className="text-white font-medium text-lg">{query}</p>
        </div>
      </div>
    </div>
  );
}

// Completed Clarification Card - shows user's answers
function CompletedClarificationCard({
  questions,
  answers,
}: {
  questions: RequiredInput[];
  answers: Record<string, string>;
}) {
  // Get only answered questions
  const answeredQuestions = questions.filter(q => answers[q.key] && answers[q.key].trim());

  if (answeredQuestions.length === 0) return null;

  return (
    <div className="relative pl-12 pb-4">
      {/* Thread node */}
      <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-400 shadow-lg shadow-amber-500/30" />

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-2">
          {answeredQuestions.map((q) => {
            const answer = answers[q.key];
            // For select types, find the label
            const displayValue = q.options?.find(o => o.value === answer)?.label || answer;
            return (
              <div
                key={q.key}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm"
              >
                <span className="text-white/50">{q.label}:</span>{' '}
                <span className="text-amber-300">{displayValue}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Progress Card - collapsible view of search progress
function ProgressCard({
  lanes,
  progress,
  currentBest,
  isRunning,
  isComplete,
  expanded,
  onToggle,
}: {
  lanes: SessionLane[];
  progress: { total: number; completed: number; failed: number };
  currentBest: ExtractedResult | null;
  isRunning: boolean;
  isComplete: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [expandedLaneId, setExpandedLaneId] = useState<string | null>(null);

  const completedCount = progress.completed;
  const totalCount = progress.total;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleLane = (laneId: string) => {
    setExpandedLaneId(prev => prev === laneId ? null : laneId);
  };

  return (
    <div className="relative pl-12 pb-6 animate-fadeIn">
      {/* Thread node */}
      <div className={`absolute left-4 top-3 w-4 h-4 rounded-full border-2 shadow-lg ${
        isComplete
          ? 'bg-green-500 border-green-400 shadow-green-500/30'
          : 'bg-purple-500 border-purple-400 shadow-purple-500/30'
      }`} />

      <div className="glass-card overflow-hidden">
        {/* Collapsed header - always visible */}
        <button
          onClick={onToggle}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isRunning ? (
              <LoaderIcon className="w-5 h-5 animate-spin text-purple-400" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            )}
            <span className="text-white font-medium">
              {isRunning ? `Checking ${totalCount} sites...` : `Checked ${totalCount} sites`}
            </span>
            <span className="text-white/40 text-sm">
              {completedCount} of {totalCount} complete
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mini progress indicator */}
            {isRunning && (
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
            {expanded ? (
              <ChevronUpIcon className="w-5 h-5 text-white/40" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-white/40" />
            )}
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-white/10 p-4 space-y-3 animate-fadeIn">
            {/* Current best indicator */}
            {currentBest && isRunning && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-3">
                <span className="text-lg">🏆</span>
                <div>
                  <div className="text-white/60 text-xs">Best so far</div>
                  <div className="text-green-400 font-medium">
                    ${currentBest.price?.toFixed(2)} at {currentBest.site}
                  </div>
                </div>
              </div>
            )}

            {/* Lane list with expandable browser previews */}
            <div className="space-y-2">
              {lanes.map((lane) => (
                <LaneRow
                  key={lane.id}
                  lane={lane}
                  isExpanded={expandedLaneId === lane.id}
                  onToggle={() => toggleLane(lane.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Expandable lane row with browser preview
function LaneRow({ lane, isExpanded, onToggle }: { lane: SessionLane; isExpanded: boolean; onToggle: () => void }) {
  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangleIcon className="w-4 h-4 text-red-400" />;
      case 'queued':
        return <div className="w-4 h-4 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className="w-4 h-4 animate-spin text-blue-400" />;
    }
  };

  const canExpand = lane.status !== 'queued';

  return (
    <div className={`rounded-lg overflow-hidden transition-all ${
      isExpanded ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5 hover:bg-white/[0.07]'
    }`}>
      {/* Collapsed row - clickable header */}
      <button
        onClick={onToggle}
        disabled={!canExpand}
        className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
          !canExpand ? 'opacity-60 cursor-default' : 'cursor-pointer'
        }`}
      >
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium truncate">{lane.site.name}</span>
            {lane.result?.price && (
              <span className="text-green-400 text-sm font-medium ml-2">${lane.result.price.toFixed(2)}</span>
            )}
          </div>
          {!isExpanded && lane.currentAction && lane.status !== 'complete' && lane.status !== 'error' && (
            <div className="text-white/40 text-xs truncate">{lane.currentAction}</div>
          )}
        </div>
        {/* Mini progress bar */}
        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              lane.status === 'complete' ? 'bg-green-500' :
              lane.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${lane.progress}%` }}
          />
        </div>
        {canExpand && (
          <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Expanded browser preview */}
      {isExpanded && (
        <div className="border-t border-white/10 animate-fadeIn">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 px-3 py-2 bg-black/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0 bg-black/30 rounded px-2 py-1">
              <GlobeIcon className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/50 text-xs truncate">https://{lane.site.domain}</span>
            </div>
          </div>

          {/* Browser viewport - simulated page */}
          <div className="aspect-[16/10] bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
            {/* Simulated page content */}
            <div className="absolute inset-0 flex flex-col">
              {/* Simulated page header */}
              <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4">
                <div className="w-20 h-5 bg-white/10 rounded" />
                <div className="flex-1" />
                <div className="flex gap-2">
                  <div className="w-14 h-5 bg-white/10 rounded" />
                  <div className="w-14 h-5 bg-white/10 rounded" />
                </div>
              </div>

              {/* Simulated content */}
              <div className="flex-1 p-4 flex gap-4">
                {/* Product image placeholder */}
                <div className="w-1/3 aspect-square bg-white/5 rounded-lg flex items-center justify-center">
                  {lane.status === 'complete' ? (
                    <span className="text-3xl">📦</span>
                  ) : lane.status === 'error' ? (
                    <span className="text-3xl">❌</span>
                  ) : (
                    <LoaderIcon className="w-6 h-6 text-white/20 animate-spin" />
                  )}
                </div>

                {/* Product details placeholder */}
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-5 bg-white/10 rounded" />
                  <div className="w-1/2 h-4 bg-white/5 rounded" />
                  <div className="w-1/4 h-6 bg-white/10 rounded mt-3" />
                  <div className="space-y-1.5 mt-3">
                    <div className="w-full h-2.5 bg-white/5 rounded" />
                    <div className="w-5/6 h-2.5 bg-white/5 rounded" />
                    <div className="w-4/6 h-2.5 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Status overlay - shows current action */}
            {lane.status !== 'complete' && lane.status !== 'error' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center px-4">
                  <LoaderIcon className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-white/80 text-sm">{lane.currentAction}</p>
                </div>
              </div>
            )}

            {/* Complete overlay */}
            {lane.status === 'complete' && lane.result && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-medium text-lg">${lane.result.price?.toFixed(2)}</p>
                  <p className="text-white/60 text-sm">{lane.result.shipping}</p>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {lane.status === 'error' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center px-4">
                  <AlertTriangleIcon className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400/80 text-sm">{lane.error || 'Failed to load'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Result details for completed lanes */}
          {lane.status === 'complete' && lane.result && (
            <div className="p-3 bg-black/20 border-t border-white/10">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-white/40 text-xs">Price</div>
                  <div className="text-white font-medium">${lane.result.price?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Shipping</div>
                  <div className="text-white/80">{lane.result.shipping || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Delivery</div>
                  <div className="text-white/80">{lane.result.deliveryEstimate || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Results Card - the main results display
function ResultsCard({
  results,
  synthesis,
  lanes,
  nextActions,
  onAction,
}: {
  results: AggregatedResults;
  synthesis: Synthesis | null;
  lanes: SessionLane[];
  nextActions: NextAction[];
  onAction: (action: NextAction) => void;
}) {
  const best = results.best;
  const isInsurance = results.intent === 'quote_request';

  return (
    <div className="relative pl-12 animate-fadeIn">
      {/* Thread node */}
      <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-400 shadow-lg shadow-emerald-500/30" />

      <div className="glass-card overflow-hidden">
        {/* Best deal header - different for insurance vs products */}
        {best && !isInsurance && (
          <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white/60 text-sm mb-1">Best price found</div>
                <div className="text-4xl font-bold text-white mb-1">
                  ${best.price?.toFixed(2)}
                </div>
                <div className="text-emerald-400 font-medium">{best.site}</div>
                {best.shipping && (
                  <div className="text-white/50 text-sm mt-1">{best.shipping}</div>
                )}
              </div>
              {best.url && (
                <a
                  href={best.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  View Deal
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Insurance recommendation header */}
        {best && isInsurance && (
          <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white/60 text-sm mb-1">Our Recommendation</div>
                <div className="text-3xl font-bold text-white mb-1">
                  ${best.monthlyCost || Math.round((best.annualCost || 0) / 12)}<span className="text-lg font-normal text-white/60">/month</span>
                </div>
                <div className="text-blue-400 font-medium text-lg">{best.site}</div>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                  <span>${best.annualCost?.toLocaleString()}/year</span>
                  {best.deductible && <span>${best.deductible} deductible</span>}
                  {best.coverage && <span>{best.coverage}</span>}
                </div>
              </div>
              {best.url && (
                <a
                  href={best.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  Get Quote
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Synthesis */}
        {synthesis && (
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-white/80 leading-relaxed">{synthesis.summary}</p>
                {synthesis.insights && synthesis.insights.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {synthesis.insights.slice(0, 3).map((insight, i) => (
                      <p key={i} className="text-white/50 text-sm">• {insight}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quote comparison table for insurance */}
        {isInsurance && (
          <div className="px-6 py-4 border-b border-white/10">
            <div className="text-white/60 text-sm font-medium mb-3">All Quotes Compared</div>
            <div className="space-y-2">
              {lanes
                .filter(l => l.status === 'complete' && l.result?.annualCost)
                .sort((a, b) => (a.result?.annualCost || 0) - (b.result?.annualCost || 0))
                .map((lane, index) => {
                  const isBest = index === 0;
                  return (
                    <div
                      key={lane.id}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        isBest ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isBest && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-medium">
                            BEST
                          </span>
                        )}
                        <span className={`font-medium ${isBest ? 'text-white' : 'text-white/70'}`}>
                          {lane.site.name}
                        </span>
                        <span className="text-white/40 text-sm">{lane.result?.coverage}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${isBest ? 'text-white' : 'text-white/80'}`}>
                          ${lane.result?.monthlyCost}/mo
                        </div>
                        <div className="text-white/40 text-xs">
                          ${lane.result?.annualCost?.toLocaleString()}/yr • ${lane.result?.deductible} ded.
                        </div>
                      </div>
                    </div>
                  );
                })}
              {lanes.filter(l => l.status === 'error').map((lane) => (
                <div key={lane.id} className="p-3 rounded-lg bg-red-500/10 flex items-center justify-between">
                  <span className="text-red-400/70">{lane.site.name}</span>
                  <span className="text-red-400/50 text-sm">Quote unavailable</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact sites checked - for non-insurance */}
        {!isInsurance && (
          <div className="px-6 py-3 bg-white/[0.02] border-b border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/40 text-xs">Checked:</span>
              {lanes.filter(l => l.status === 'complete').map((lane) => (
                <span
                  key={lane.id}
                  className="text-white/50 text-xs px-2 py-0.5 bg-white/5 rounded"
                >
                  {lane.site.name}
                  {lane.result?.price && (
                    <span className="text-white/30 ml-1">${lane.result.price.toFixed(0)}</span>
                  )}
                </span>
              ))}
              {lanes.filter(l => l.status === 'error').map((lane) => (
                <span
                  key={lane.id}
                  className="text-red-400/50 text-xs px-2 py-0.5 bg-red-500/10 rounded"
                >
                  {lane.site.name} (failed)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prominent Next Actions */}
        <div className="p-6">
          <div className="text-white/60 text-sm font-medium mb-3">What would you like to do?</div>
          <div className="grid grid-cols-2 gap-3">
            {nextActions.filter(a => a.type !== 'new_search').slice(0, 4).map((action, i) => (
              <button
                key={i}
                onClick={() => onAction(action)}
                className={`p-4 rounded-xl text-left transition-all ${
                  action.primary
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className={`font-medium ${action.primary ? 'text-blue-300' : 'text-white/80'}`}>
                  {action.label}
                </div>
                {action.type === 'alert' && (
                  <div className="text-white/40 text-xs mt-1">Get notified if price drops</div>
                )}
                {action.type === 'save' && (
                  <div className="text-white/40 text-xs mt-1">Save for later reference</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search for something else - bottom of results */}
        <div className="p-6 pt-0">
          <button
            onClick={() => onAction({ type: 'new_search', label: 'New search' })}
            className="w-full px-4 py-4 flex items-center justify-center gap-3 transition-all group rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
          >
            <SearchIcon className="w-5 h-5 text-white/50 group-hover:text-white/70" />
            <span className="text-white/50 group-hover:text-white/70 font-medium">
              Search for something else
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
