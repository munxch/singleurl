'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, PlayIcon, LoaderIcon, PlusIcon, CheckIcon, ClockIcon, SparklesIcon, ChevronRightIcon, ArrowRightIcon } from '@/components/icons';
import { ParsedQuery, TargetSite, OUTPUT_PREVIEWS, RequiredInput } from '@/types/orchestrator';

interface QueryEnricherProps {
  query: string;
  onQueryChange: (query: string) => void;
  onAnalyze: () => void;
  parsedQuery: ParsedQuery | null;
  isParsing: boolean;
  isClarifying?: boolean;
  selectedSites: TargetSite[];
  userInputs?: Record<string, string>;
  onToggleSite: (siteId: string) => void;
  onSetUserInput?: (key: string, value: string) => void;
  onCompleteClarification?: () => void;
  onExecute: () => void;
  isReady: boolean;
}

export function QueryEnricher({
  query,
  onQueryChange,
  onAnalyze,
  parsedQuery,
  isParsing,
  isClarifying = false,
  selectedSites,
  userInputs = {},
  onToggleSite,
  onSetUserInput,
  onCompleteClarification,
  onExecute,
  isReady,
}: QueryEnricherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Expand when we have a parsed query
  useEffect(() => {
    if (parsedQuery && !isParsing) {
      setTimeout(() => setIsExpanded(true), 100);
    } else {
      setIsExpanded(false);
    }
  }, [parsedQuery, isParsing]);

  // Check if all required clarifying questions are answered
  const clarifyingQuestions = parsedQuery?.requiredInputs || [];
  const allQuestionsAnswered = clarifyingQuestions.every(
    q => !q.required || (userInputs[q.key] && userInputs[q.key].trim().length > 0)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isExpanded && query.length >= 5 && !isParsing) {
        // Not expanded yet - analyze the query
        onAnalyze();
      } else if (isReady && isExpanded) {
        // Expanded and ready - execute
        onExecute();
      }
    }
  };

  const selectedCount = selectedSites.length;
  const estimatedTime = Math.max(...selectedSites.map(s => s.estimatedTime || 15));
  const outputPreview = parsedQuery ? OUTPUT_PREVIEWS[parsedQuery.intent] : null;

  return (
    <div className={`
      glass-card overflow-hidden max-w-3xl mx-auto transition-all duration-500 ease-out
      ${isExpanded ? 'p-0' : 'p-1.5'}
    `}>
      {/* visionOS specular highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.4) 50%, transparent 90%)',
        }}
      />

      {/* Main input row */}
      <div className={`flex items-center gap-3 ${isExpanded ? 'p-4 pb-0' : ''}`}>
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
          onKeyDown={handleKeyDown}
          placeholder="What would you like to know?"
          className="flex-1 bg-transparent border-none text-white text-lg placeholder-white/50 focus:outline-none py-3"
          disabled={isParsing}
        />

        {!isExpanded && (
          <button
            onClick={onAnalyze}
            disabled={query.length < 5 || isParsing}
            className={`p-3 mr-1 rounded-xl transition-all ${
              query.length >= 5 && !isParsing
                ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title="Continue"
          >
            {isParsing ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRightIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Enrichment panel - slides down */}
      <div
        className={`
          overflow-hidden transition-all duration-500 ease-out
          ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 pt-4 border-t border-white/10 mt-4">
          {/* Clarifying questions section */}
          {isClarifying && clarifyingQuestions.length > 0 && (
            <div className="mb-6 animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="w-4 h-4 text-amber-400" />
                <span className="text-white/80 text-sm">
                  Quick question{clarifyingQuestions.length > 1 ? 's' : ''} to help me search better:
                </span>
              </div>

              <div className="space-y-3">
                {clarifyingQuestions.map((question) => (
                  <ClarifyingQuestion
                    key={question.key}
                    question={question}
                    value={userInputs[question.key] || ''}
                    onChange={(value) => onSetUserInput?.(question.key, value)}
                  />
                ))}
              </div>

              {/* Continue button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={onCompleteClarification}
                  disabled={!allQuestionsAnswered}
                  className={`
                    px-5 py-2.5 font-medium rounded-lg transition-all flex items-center gap-2 text-sm
                    ${allQuestionsAnswered
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    }
                  `}
                >
                  Continue
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Site selection - show when not clarifying OR after clarification */}
          {!isClarifying && (
            <>
              {/* Intent understanding */}
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-4 h-4 text-blue-400" />
                <span className="text-white/80 text-sm">
                  I&apos;ll check these {selectedCount} sites for {parsedQuery?.goal}:
                </span>
              </div>

              {/* Site selection grid */}
              <div className="flex flex-wrap gap-2 mb-4">
                {parsedQuery?.suggestedSites.map((site) => (
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
                  Add site
                </button>
              </div>

              {/* Preview of output */}
              {outputPreview && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
                  <div className="text-white/40 text-sm">
                    <span className="text-white/60 font-medium">Preview:</span>{' '}
                    {outputPreview.description}
                    {outputPreview.columns && (
                      <span className="block mt-1 text-white/30">
                        Columns: {outputPreview.columns.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <ClockIcon className="w-4 h-4" />
                  <span>Usually takes about {estimatedTime} seconds</span>
                </div>

                <button
                  onClick={onExecute}
                  disabled={!isReady || selectedCount === 0}
                  className={`
                    px-6 py-3 font-semibold rounded-xl transition-all flex items-center gap-2
                    ${isReady && selectedCount > 0
                      ? 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }
                  `}
                >
                  <PlayIcon className="w-4 h-4" />
                  Check {selectedCount} sites
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for rendering clarifying questions
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
      <div className="flex flex-col gap-1.5">
        <label className="text-white/70 text-sm font-medium">
          {question.label}
          {question.required && <span className="text-amber-400 ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {question.options.map((option, index) => {
            return (
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
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/70 text-sm font-medium">
        {question.label}
        {question.required && <span className="text-amber-400 ml-1">*</span>}
      </label>
      <input
        type={question.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-sm"
      />
    </div>
  );
}
