'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { ConversationThread, SearchThread } from '@/components/ui';
import { useOrchestrator } from '@/hooks';
import { ArrowLeftIcon, SearchIcon, PlusIcon } from '@/components/icons';
import { getPersistedJob, persistJob, type PersistedJob } from '@/lib/persistence';

export default function SearchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const urlQuery = searchParams.get('q') || '';
  const shouldAutoRun = searchParams.get('run') === '1';

  const [query, setQuery] = useState(urlQuery);
  const [initialized, setInitialized] = useState(false);
  const autoRunTriggeredRef = useRef(false);
  const restoredRef = useRef(false);
  const hasUrlQuery = !!urlQuery; // Track if we came with a query from home page

  const orchestrator = useOrchestrator();

  const {
    state,
    status,
    parsedQuery,
    selectedSites,
    userInputs,
    completedInputs,
    lanes,
    progress,
    aggregatedResults,
    synthesis,
    nextActions,
    currentBest,
    isParsing,
    isClarifying,
    isConfiguring,
    isRunning,
    isComplete,
    setQuery: analyzeQuery,
    toggleSite,
    setUserInput,
    completeClarification,
    execute,
    restore,
  } = orchestrator;

  // Try to restore state from localStorage on mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const savedJob = getPersistedJob(jobId);
    if (savedJob?.orchestratorState) {
      setInitialized(true);
      setQuery(savedJob.query);
      restore(savedJob.orchestratorState);
    }
  }, [jobId, restore]);

  // Auto-analyze query from URL on first load
  useEffect(() => {
    if (initialized) return;
    if (!urlQuery) return;
    if (status !== 'idle') return; // Already started

    setInitialized(true);
    analyzeQuery(urlQuery);
  }, [initialized, urlQuery, status, analyzeQuery]);

  // Auto-execute when shouldAutoRun is true and we're in configuring state
  useEffect(() => {
    if (!shouldAutoRun) return;
    if (autoRunTriggeredRef.current) return;
    if (status !== 'configuring') return;
    if (selectedSites.length === 0) return;

    autoRunTriggeredRef.current = true;
    execute();
  }, [shouldAutoRun, status, selectedSites.length, execute]);

  // Persist state changes to localStorage
  useEffect(() => {
    if (status === 'idle') return;

    const job: PersistedJob = {
      id: jobId,
      query: state.originalQuery || query,
      status: status === 'complete' || status === 'completing'
        ? 'complete'
        : status === 'running'
          ? 'running'
          : status === 'error'
            ? 'error'
            : 'configuring',
      createdAt: Date.now(),
      progress: progress,
      orchestratorState: state,
    };

    persistJob(job);
  }, [jobId, status, state, progress, query]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const handleExecute = useCallback(async () => {
    if (selectedSites.length > 0) {
      await execute();
    }
  }, [selectedSites, execute]);

  const handleStartNewJob = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleGoBack = useCallback(() => {
    router.push('/jobs');
  }, [router]);

  // Show SearchThread when running or complete (execution phase)
  const showSearchThread = isRunning || isComplete;
  // Show ConversationThread when in pre-execution phase
  const showConversationThread = !showSearchThread;

  const handleAction = useCallback((action: { type: string; url?: string }) => {
    if (action.type === 'new_search') {
      router.push('/');
    } else if (action.url) {
      window.open(action.url, '_blank');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content flex-1 flex flex-col">
        {/* Header with back, logo, and new search */}
        <header
          className="flex items-center justify-between px-6 py-4"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
        >
          {/* Back button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back to jobs</span>
          </button>

          {/* Center logo */}
          <MinoLogo />

          {/* New search button */}
          <button
            onClick={handleStartNewJob}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white/70 hover:text-white/90 transition-all text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New search</span>
          </button>
        </header>

        {/* Main content area - scrollable */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="w-full max-w-3xl mx-auto">
            {/* Pre-execution: Conversation Thread - handles input, clarifying, configuring */}
            {showConversationThread && (
              <ConversationThread
                query={query}
                onQueryChange={handleQueryChange}
                onAnalyze={() => analyzeQuery(query)}
                parsedQuery={parsedQuery || null}
                isParsing={isParsing}
                hideInitialInput={hasUrlQuery}
                isClarifying={isClarifying}
                userInputs={userInputs || {}}
                onSetUserInput={setUserInput}
                onCompleteClarification={completeClarification}
                isConfiguring={isConfiguring}
                selectedSites={selectedSites}
                onToggleSite={toggleSite}
                onExecute={handleExecute}
                isRunning={isRunning}
                lanes={lanes}
                progress={progress}
                isComplete={isComplete}
              />
            )}

            {/* Execution phase: Search Thread - shows query, progress, results in card-based layout */}
            {showSearchThread && (
              <SearchThread
                query={state.originalQuery || query}
                parsedQuery={parsedQuery || null}
                completedInputs={completedInputs}
                isRunning={isRunning}
                lanes={lanes}
                progress={{ total: progress.total, completed: progress.completed, failed: progress.failed }}
                currentBest={currentBest || null}
                isComplete={isComplete}
                results={aggregatedResults || null}
                synthesis={synthesis || null}
                nextActions={nextActions}
                onAction={handleAction}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
