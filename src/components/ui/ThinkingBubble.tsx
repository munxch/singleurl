'use client';

import { LoaderIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon, SparklesIcon } from '@/components/icons';
import { QueryFeedback } from '@/types';

interface ThinkingBubbleProps {
  message: string;
  highlight?: string;
  query: string;
  isThinking?: boolean;
  visible: boolean;
  willSucceed?: boolean;
  suggestedQuery?: string;
  estimatedTimeSeconds?: number;
  onApplySuggestion?: () => void;
  cursorPosition?: number;
}

export function ThinkingBubble({
  message,
  highlight,
  query,
  isThinking = false,
  visible,
  willSucceed = false,
  suggestedQuery,
  estimatedTimeSeconds,
  onApplySuggestion,
  cursorPosition = 50,
}: ThinkingBubbleProps) {
  if (!visible) return null;

  const formatTimeEstimate = (seconds: number) => {
    if (seconds < 60) return `~${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `~${minutes}min`;
    return `~${minutes}min ${remainingSeconds}s`;
  };

  const tailPosition = Math.max(15, Math.min(85, cursorPosition));

  const getGradient = () => {
    if (isThinking) return 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)';
    if (willSucceed) return 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)';
    return 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(234, 88, 12, 0.95) 100%)';
  };

  const getShadow = () => {
    if (isThinking) return '0 8px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset';
    if (willSucceed) return '0 8px 32px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset';
    return '0 8px 32px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset';
  };

  const getTailColor = () => {
    if (isThinking) return 'rgba(139, 92, 246, 0.95)';
    if (willSucceed) return 'rgba(22, 163, 74, 0.95)';
    return 'rgba(234, 88, 12, 0.95)';
  };

  const renderHighlightedText = () => {
    if (!query || !highlight) return null;
    const index = query.toLowerCase().indexOf(highlight.toLowerCase());
    if (index === -1) return null;
    const before = query.slice(0, index);
    const matched = query.slice(index, index + highlight.length);
    const after = query.slice(index + highlight.length);

    return (
      <div className="mt-2 px-3 py-2 rounded-lg bg-black/30 text-xs font-mono space-y-1.5">
        <div>
          <span className="text-white/50">{before}</span>
          <span className="text-amber-300 bg-amber-500/20 px-1 rounded">{matched}</span>
          <span className="text-white/50">{after}</span>
        </div>
        {suggestedQuery && (
          <div className="border-t border-white/10 pt-1.5">
            <span className="text-white/40">→ </span>
            <span className="text-amber-200 bg-amber-500/15 px-1 rounded">{suggestedQuery}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="absolute z-50 animate-fadeIn"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '100%',
        marginBottom: '12px',
      }}
    >
      <div className="relative">
        {/* Small tail puff */}
        <div
          className="absolute rounded-full animate-bubble"
          style={{
            width: 8,
            height: 8,
            background: getTailColor(),
            left: `${tailPosition}%`,
            bottom: -20,
            marginLeft: -4,
            boxShadow: `0 2px 6px ${getTailColor()}`,
          }}
        />

        {/* Main bubble */}
        <div
          className={`relative rounded-2xl animate-bubble ${isThinking ? 'px-3 py-3' : 'px-4 py-3 min-w-[280px] max-w-[400px]'}`}
          style={{
            background: getGradient(),
            boxShadow: getShadow(),
            backdropFilter: 'blur(12px)',
            animationDelay: '0.08s',
          }}
        >
          <div className="flex items-center justify-center gap-3">
            {isThinking ? (
              <LoaderIcon className="w-5 h-5 text-white animate-spin" />
            ) : (
              <>
                <div className="flex-shrink-0">
                  {willSucceed ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-relaxed">{message}</p>
                  {willSucceed && estimatedTimeSeconds && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-white/80 text-xs">
                      <ClockIcon />
                      <span>Est. {formatTimeEstimate(estimatedTimeSeconds)}</span>
                    </div>
                  )}
                  {renderHighlightedText()}
                  {onApplySuggestion && suggestedQuery && (
                    <button
                      onClick={onApplySuggestion}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                    >
                      <SparklesIcon />
                      Apply suggestion
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bubble connector */}
          <div
            className="absolute -bottom-2 w-3 h-3 rounded-full"
            style={{
              left: `${tailPosition}%`,
              marginLeft: -6,
              background: getTailColor(),
              boxShadow: `0 2px 4px ${getTailColor()}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
