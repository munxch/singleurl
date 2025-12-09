'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchIcon, SparklesIcon, CheckIcon, ChevronRightIcon, PlayIcon, PlusIcon, LoaderIcon } from '@/components/icons';
import { ParsedQuery, TargetSite, RequiredInput, SessionLane } from '@/types/orchestrator';

interface ConversationThreadProps {
  // Query state
  query: string;
  onQueryChange: (query: string) => void;
  onAnalyze: () => void;

  // Parsed state
  parsedQuery: ParsedQuery | null;
  isParsing: boolean;

  // Allow hiding the initial input (for transitioning from home page)
  hideInitialInput?: boolean;

  // Clarification state
  isClarifying: boolean;
  userInputs: Record<string, string>;
  onSetUserInput: (key: string, value: string) => void;
  onCompleteClarification: (autoExecute?: boolean) => void;

  // Configuration state
  isConfiguring: boolean;
  selectedSites: TargetSite[];
  onToggleSite: (siteId: string) => void;
  onExecute: () => void;

  // Running state
  isRunning: boolean;
  lanes: SessionLane[];
  progress: { total: number; completed: number; failed: number };

  // Completion state
  isComplete: boolean;
}

export function ConversationThread({
  query,
  onQueryChange,
  onAnalyze,
  parsedQuery,
  isParsing,
  hideInitialInput,
  isClarifying,
  userInputs,
  onSetUserInput,
  onCompleteClarification,
  isConfiguring,
  selectedSites,
  onToggleSite,
  onExecute,
  isRunning,
  lanes,
  progress,
  isComplete,
}: ConversationThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  // Show query immediately if we came from home page with a query (hideInitialInput)
  // or when we start parsing/have parsed
  const [showQuery, setShowQuery] = useState(hideInitialInput || false);

  // Track when query was submitted to show it as a "message"
  useEffect(() => {
    if (parsedQuery || isParsing || hideInitialInput) {
      setShowQuery(true);
    }
  }, [parsedQuery, isParsing, hideInitialInput]);

  // Auto-scroll as new content appears
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [parsedQuery, isClarifying, isConfiguring, isRunning, isComplete, lanes]);

  const clarifyingQuestions = parsedQuery?.requiredInputs || [];
  // For insurance (many fields), just require at least one answer to proceed
  // For simpler forms, require all required fields
  const hasAnyAnswer = Object.values(userInputs).some(v => v && v.trim().length > 0);
  const allRequiredAnswered = clarifyingQuestions.every(
    q => !q.required || (userInputs[q.key] && userInputs[q.key].trim().length > 0)
  );
  // Allow proceeding if: all required answered OR (has many questions and at least one answer)
  const canProceed = allRequiredAnswered || (clarifyingQuestions.length > 3 && hasAnyAnswer) || clarifyingQuestions.length === 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!showQuery && query.length >= 5 && !isParsing) {
        onAnalyze();
      }
    }
  };

  return (
    <div ref={threadRef} className="max-w-2xl mx-auto relative">
      {/* Thread line - vertical connector */}
      {showQuery && (
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/20 to-transparent" />
      )}

      <div className="space-y-0">
        {/* Initial input or submitted query */}
        {!showQuery ? (
          <InitialInput
            query={query}
            onQueryChange={onQueryChange}
            onAnalyze={onAnalyze}
            isParsing={isParsing}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <>
            {/* User's query as a "turn" */}
            <UserTurn content={query} />

            {/* Parsing state */}
            {isParsing && (
              <SystemTurn isLoading>
                Finding the best sites to search...
              </SystemTurn>
            )}

            {/* Clarifying questions - active */}
            {isClarifying && parsedQuery && (
              <ClarificationTurn
                questions={clarifyingQuestions}
                userInputs={userInputs}
                onSetUserInput={onSetUserInput}
                onComplete={() => {
                  // Auto-execute for price_comparison (skip site selection)
                  const shouldAutoExecute = parsedQuery.intent === 'price_comparison';
                  onCompleteClarification(shouldAutoExecute);
                }}
                allAnswered={canProceed}
              />
            )}

            {/* Site configuration */}
            {isConfiguring && parsedQuery && (
              <ConfigurationTurn
                parsedQuery={parsedQuery}
                selectedSites={selectedSites}
                onToggleSite={onToggleSite}
                onExecute={onExecute}
              />
            )}

            {/* Running state - just show a simple indicator, full progress is shown by OrchestraProgress */}
            {isRunning && (
              <SystemTurn isLoading>
                Searching {progress.total} sites...
              </SystemTurn>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Initial input component - the search box before anything is submitted
function InitialInput({
  query,
  onQueryChange,
  onAnalyze,
  isParsing,
  onKeyDown,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onAnalyze: () => void;
  isParsing: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="glass-card p-1.5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="text-white/70 ml-2">
          {isParsing ? (
            <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
          ) : (
            <SearchIcon className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="What would you like to find?"
          className="flex-1 bg-transparent border-none text-white text-lg placeholder-white/50 focus:outline-none py-3"
          disabled={isParsing}
          autoFocus
        />
        <button
          onClick={onAnalyze}
          disabled={query.length < 5 || isParsing}
          className={`p-3 mr-1 rounded-xl transition-all ${
            query.length >= 5 && !isParsing
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// User's message/query turn
function UserTurn({ content }: { content: string }) {
  return (
    <div className="relative pl-12 pb-4 animate-fadeIn">
      {/* Thread node */}
      <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-400 shadow-lg shadow-blue-500/30" />

      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-blue-400" />
          <p className="text-white font-medium text-lg">{content}</p>
        </div>
      </div>
    </div>
  );
}

// System response turn
function SystemTurn({
  children,
  isLoading = false
}: {
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <div className="relative pl-12 pb-4 animate-fadeIn">
      {/* Thread node */}
      <div className={`absolute left-4 top-3 w-4 h-4 rounded-full border-2 shadow-lg ${
        isLoading
          ? 'bg-purple-500 border-purple-400 shadow-purple-500/30'
          : 'bg-purple-500 border-purple-400 shadow-purple-500/30'
      }`} />

      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <LoaderIcon className="w-5 h-5 text-purple-400 animate-spin" />
          ) : (
            <SparklesIcon className="w-5 h-5 text-purple-400" />
          )}
          <p className="text-white/80">{children}</p>
        </div>
      </div>
    </div>
  );
}

// Clarification questions turn
function ClarificationTurn({
  questions,
  userInputs,
  onSetUserInput,
  onComplete,
  allAnswered,
}: {
  questions: RequiredInput[];
  userInputs: Record<string, string>;
  onSetUserInput: (key: string, value: string) => void;
  onComplete: () => void;
  allAnswered: boolean;
}) {
  return (
    <div className="relative pl-12 pb-4 animate-fadeIn">
      {/* Thread node */}
      <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-400 shadow-lg shadow-amber-500/30" />

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="w-5 h-5 text-amber-400" />
          <p className="text-white/80">
            {questions.length > 3 ? 'A few quick questions to get you accurate quotes:' : 'One quick question to narrow down your search:'}
          </p>
        </div>

        <div className="space-y-4 mb-4">
          {questions.map((question) => (
            <ClarifyingQuestion
              key={question.key}
              question={question}
              value={userInputs[question.key] || ''}
              onChange={(value) => onSetUserInput(question.key, value)}
            />
          ))}
        </div>

        <button
          onClick={onComplete}
          disabled={!allAnswered}
          className={`
            px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 text-sm
            ${allAnswered
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-white/10 text-white/60 cursor-not-allowed border border-white/20'
            }
          `}
        >
          {allAnswered ? 'Continue' : 'Fill in at least one field to continue'}
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Configuration turn - site selection
function ConfigurationTurn({
  parsedQuery,
  selectedSites,
  onToggleSite,
  onExecute,
}: {
  parsedQuery: ParsedQuery;
  selectedSites: TargetSite[];
  onToggleSite: (siteId: string) => void;
  onExecute: () => void;
}) {
  const selectedCount = selectedSites.length;

  return (
    <div className="relative pl-12 pb-4 animate-fadeIn">
      {/* Thread node */}
      <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-400 shadow-lg shadow-blue-500/30" />

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="w-5 h-5 text-blue-400" />
          <p className="text-white/80">
            I&apos;ll search these sites to find {parsedQuery.goal}:
          </p>
        </div>

        {/* Site chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {parsedQuery.suggestedSites.map((site) => (
            <button
              key={site.id}
              onClick={() => onToggleSite(site.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm
                ${site.selected
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                }
              `}
            >
              {site.selected ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 rounded border border-current opacity-50" />
              )}
              {site.name}
            </button>
          ))}

          <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 border border-dashed border-white/20 hover:border-white/30 transition-all">
            <PlusIcon className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Execute button */}
        <button
          onClick={onExecute}
          disabled={selectedCount === 0}
          className={`
            px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 text-sm
            ${selectedCount > 0
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
        >
          <PlayIcon className="w-3.5 h-3.5" />
          Search {selectedCount} sites
        </button>
      </div>
    </div>
  );
}

// Clarifying question input
function ClarifyingQuestion({
  question,
  value,
  onChange,
}: {
  question: RequiredInput;
  value: string;
  onChange: (value: string) => void;
}) {
  if (question.type === 'select' && question.options) {
    return (
      <div className="space-y-2">
        <label className="text-white/80 text-sm font-medium block">
          {question.label}
          {question.required && <span className="text-amber-400 ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {question.options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              onClick={() => onChange(option.value)}
              className={`
                px-3 py-2 rounded-lg text-sm transition-all
                ${value === option.value
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-white/80 text-sm font-medium block">
        {question.label}
        {question.required && <span className="text-amber-400 ml-1">*</span>}
      </label>
      <input
        type={question.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-sm"
      />
    </div>
  );
}
