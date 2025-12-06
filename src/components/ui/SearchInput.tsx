'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SearchIcon, PlayIcon, LoaderIcon, Settings2Icon, ChevronDownIcon, CheckCircle2Icon } from '@/components/icons';
import { ThinkingBubble } from './ThinkingBubble';
import { BROWSER_PRESETS } from '@/lib/constants';
import { BrowserPresetKey, QueryFeedback } from '@/types';

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  isRunning: boolean;
  queryFeedback: QueryFeedback | null;
  isAnalyzingQuery: boolean;
  onApplySuggestion: () => void;
  selectedPreset: BrowserPresetKey;
  onPresetChange: (preset: BrowserPresetKey) => void;
}

export function SearchInput({
  query,
  onQueryChange,
  onSubmit,
  isRunning,
  queryFeedback,
  isAnalyzingQuery,
  onApplySuggestion,
  selectedPreset,
  onPresetChange,
}: SearchInputProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentConfig = BROWSER_PRESETS[selectedPreset];

  useEffect(() => {
    setPortalContainer(document.getElementById('portal-root'));
  }, []);

  useEffect(() => {
    if (isConfigOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isConfigOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isConfigOpen && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsConfigOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isConfigOpen]);

  const handleSelectPreset = (preset: BrowserPresetKey) => {
    onPresetChange(preset);
    setIsConfigOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="glass-card p-1.5 max-w-3xl mx-auto relative">
      {/* visionOS specular highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, rgba(255, 255, 255, 0.4) 50%, transparent 90%)',
        }}
      />

      {/* AI Feedback Bubble */}
      <ThinkingBubble
        message={
          queryFeedback?.willSucceed
            ? queryFeedback?.extractionSummary || 'Looking good! Ready to run.'
            : queryFeedback?.advice || ''
        }
        highlight={queryFeedback?.highlight}
        query={query}
        isThinking={isAnalyzingQuery}
        visible={isAnalyzingQuery || (queryFeedback !== null && query.length >= 10)}
        willSucceed={queryFeedback?.willSucceed}
        suggestedQuery={queryFeedback?.suggestedQuery}
        estimatedTimeSeconds={queryFeedback?.estimatedTimeSeconds}
        onApplySuggestion={onApplySuggestion}
        cursorPosition={Math.min(10 + query.length * 1.2, 70)}
      />

      <div className="flex items-center gap-3">
        <div className="text-white/70 ml-4">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Find hotels in Melbourne under $200/night..."
          className="flex-1 bg-transparent border-none text-white text-lg placeholder-white/60 focus:outline-none py-3"
          disabled={isRunning}
        />

        {/* Browser Config Dropdown */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsConfigOpen(!isConfigOpen);
            }}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/60 hover:text-white/80 transition-colors disabled:opacity-50 rounded-lg hover:bg-white/5"
          >
            <Settings2Icon />
            <span className="hidden sm:inline">{currentConfig.label}</span>
            <ChevronDownIcon className={`transition-transform ${isConfigOpen ? 'rotate-180' : ''}`} />
          </button>

          {isConfigOpen && dropdownPosition && portalContainer && createPortal(
            <div
              className="dropdown-portal w-64 animate-fadeIn"
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                right: dropdownPosition.right,
                zIndex: 99999,
              }}
            >
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(20, 20, 30, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                {(Object.entries(BROWSER_PRESETS) as [BrowserPresetKey, typeof currentConfig][]).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                      selectedPreset === key
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div className="text-xs text-white/50">{preset.description}</div>
                    </div>
                    {selectedPreset === key && (
                      <div className="text-blue-400 flex-shrink-0">
                        <CheckCircle2Icon />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>,
            portalContainer
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={!query.trim() || isRunning}
          className={`px-6 py-3 mr-1 font-semibold rounded-xl transition-all flex items-center gap-2 ${
            query.trim() && !isRunning
              ? 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-white/10 text-white/60 cursor-not-allowed'
          }`}
        >
          {isRunning ? (
            <>
              <LoaderIcon className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayIcon />
              Run
            </>
          )}
        </button>
      </div>
    </div>
  );
}
