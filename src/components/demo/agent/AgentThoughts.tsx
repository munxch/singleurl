'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LoaderIcon } from '@/components/icons';
import { AccentColor, ACCENT_COLORS } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface AgentThought {
  /** Primary message - what the agent is doing */
  message: string;
  /** Optional reasoning/context */
  reasoning?: string;
  /** Type of thought affects styling */
  type: 'planning' | 'executing' | 'analyzing' | 'adapting' | 'success' | 'waiting';
}

interface AgentThoughtsProps {
  /** Current thought to display */
  thought?: AgentThought | null;
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Whether to show typing animation */
  showTyping?: boolean;
  /** Optional className */
  className?: string;
  /** Total number of sessions for display */
  totalSessions?: number;
  /** Whether the search is complete */
  isComplete?: boolean;
}

// =============================================================================
// TYPING ANIMATION HOOK
// =============================================================================

function useTypingAnimation(text: string, enabled: boolean, speed: number = 25) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, enabled, speed]);

  return { displayedText, isTyping };
}

// =============================================================================
// THOUGHT TRANSITION HOOK
// =============================================================================

function useThoughtTransition(thought: AgentThought | null | undefined) {
  const [displayedThought, setDisplayedThought] = useState<AgentThought | null>(thought ?? null);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const prevThoughtRef = useRef<string | null>(null);

  useEffect(() => {
    const newMessage = thought?.message || null;
    const prevMessage = prevThoughtRef.current;

    // If thought changed
    if (newMessage !== prevMessage) {
      if (displayedThought && newMessage) {
        // Transition: exit old, enter new
        setIsExiting(true);
        setIsEntering(false);

        setTimeout(() => {
          setDisplayedThought(thought ?? null);
          setIsExiting(false);
          setIsEntering(true);

          setTimeout(() => {
            setIsEntering(false);
          }, 400);
        }, 300);
      } else if (newMessage) {
        // First thought - just enter
        setDisplayedThought(thought ?? null);
        setIsEntering(true);
        setTimeout(() => setIsEntering(false), 400);
      } else {
        // Thought removed
        setIsExiting(true);
        setTimeout(() => {
          setDisplayedThought(null);
          setIsExiting(false);
        }, 300);
      }

      prevThoughtRef.current = newMessage;
    }
  }, [thought, displayedThought]);

  return { displayedThought, isExiting, isEntering };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AgentThoughts({
  thought,
  accentColor = 'amber',
  showTyping = true,
  className = '',
  totalSessions = 0,
  isComplete = false,
}: AgentThoughtsProps) {
  const colors = ACCENT_COLORS[accentColor];
  const { displayedThought, isExiting, isEntering } = useThoughtTransition(thought);
  const { displayedText, isTyping } = useTypingAnimation(
    displayedThought?.message || '',
    showTyping && !!displayedThought && isEntering
  );

  const getTypeLabel = (t: AgentThought) => {
    switch (t.type) {
      case 'planning':
        return 'Planning';
      case 'executing':
        return 'Executing';
      case 'analyzing':
        return 'Analyzing';
      case 'adapting':
        return 'Adapting';
      case 'success':
        return 'Found';
      case 'waiting':
        return 'Waiting';
      default:
        return 'Thinking';
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    if (isExiting) {
      return 'opacity-0 -translate-y-2';
    }
    if (isEntering) {
      return 'opacity-100 translate-y-0';
    }
    return 'opacity-100 translate-y-0';
  };

  return (
    <div className={`px-4 py-3 border-t border-white/[0.06] bg-white/[0.02] ${className}`}>
      <div className="flex items-center gap-3 min-h-[28px]">
        {/* Fixed section label */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isComplete ? (
            <div className={`w-3.5 h-3.5 rounded-full ${colors.bg} flex items-center justify-center`}>
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <LoaderIcon className={`w-3.5 h-3.5 animate-spin ${colors.text} opacity-60`} />
          )}
          <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Agent</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10" />

        {/* Content area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {isComplete ? (
            <p className={`text-sm ${colors.text}`}>
              Search complete
            </p>
          ) : displayedThought ? (
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-out ${getAnimationClasses()}`}
              style={isEntering ? { animation: 'slideInFromBottom 0.3s ease-out' } : {}}
            >
              <span className={`text-xs ${colors.text} opacity-70 flex-shrink-0`}>
                {getTypeLabel(displayedThought)}
              </span>
              <span className="text-white/20">·</span>
              <p className="text-white/50 text-sm truncate">
                {displayedText}
                {isTyping && <span className={`animate-pulse ml-0.5 ${colors.text}`}>|</span>}
              </p>
            </div>
          ) : (
            <p className="text-white/40 text-sm">
              Searching {totalSessions} sites...
            </p>
          )}
        </div>

        {/* Session count badge */}
        {totalSessions > 0 && (
          <div className="flex-shrink-0 flex items-center gap-1.5 text-white/30 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${colors.bg} opacity-50`} />
            <span>{totalSessions} sites</span>
          </div>
        )}
      </div>

      {/* CSS for slide-in animation */}
      <style jsx>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// AGENT LOG (Scrolling history of thoughts)
// =============================================================================

interface AgentLogProps {
  /** History of thoughts */
  thoughts: AgentThought[];
  /** Current active thought */
  currentThought: AgentThought | null;
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Max thoughts to show in history */
  maxHistory?: number;
  /** Optional className */
  className?: string;
}

export function AgentLog({
  thoughts,
  currentThought,
  accentColor = 'amber',
  maxHistory = 4,
  className = '',
}: AgentLogProps) {
  const colors = ACCENT_COLORS[accentColor];
  const recentThoughts = thoughts.slice(-maxHistory);

  return (
    <div className={`p-3 bg-black/30 backdrop-blur-sm ${className}`}>
      {/* History */}
      {recentThoughts.length > 0 && (
        <div className="space-y-1.5 mb-3 border-b border-white/5 pb-3">
          {recentThoughts.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-white/30 text-xs">
              <span className="opacity-50">✓</span>
              <span className="truncate">{t.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current thought */}
      {currentThought && (
        <div className="flex items-start gap-2">
          <LoaderIcon className={`w-3 h-3 animate-spin ${colors.text} opacity-60 mt-0.5 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-sm">{currentThought.message}</p>
            {currentThought.reasoning && (
              <p className="text-white/40 text-xs mt-0.5">{currentThought.reasoning}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// INLINE AGENT STATUS (Compact single-line version)
// =============================================================================

interface InlineAgentStatusProps {
  /** Current thought/action */
  thought: AgentThought | null;
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Optional className */
  className?: string;
}

export function InlineAgentStatus({
  thought,
  accentColor = 'amber',
  className = '',
}: InlineAgentStatusProps) {
  const colors = ACCENT_COLORS[accentColor];

  if (!thought) return null;

  const getTypeIcon = () => {
    switch (thought.type) {
      case 'planning': return '🧠';
      case 'executing': return '⚡';
      case 'analyzing': return '🔍';
      case 'adapting': return '🔄';
      case 'success': return '✓';
      case 'waiting': return '⏳';
      default: return '💭';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
      <span className="text-sm">{getTypeIcon()}</span>
      <span className="text-white/70 text-sm truncate flex-1">{thought.message}</span>
      {thought.type !== 'success' && (
        <LoaderIcon className={`w-3 h-3 animate-spin ${colors.text} opacity-50 flex-shrink-0`} />
      )}
    </div>
  );
}
