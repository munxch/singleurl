'use client';

import { useRef, useEffect } from 'react';
import { ActivityIcon } from '@/components/icons';
import { SessionEvent, SessionStatus } from '@/types';

interface SessionEventsPanelProps {
  events: SessionEvent[];
  sessionStatus: SessionStatus | null;
  sessionOutput: unknown;
}

export function SessionEventsPanel({ events, sessionStatus, sessionOutput }: SessionEventsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getEventColor = (type: SessionEvent['type']) => {
    switch (type) {
      case 'navigation': return 'text-blue-400';
      case 'network': return 'text-purple-400';
      case 'console': return 'text-yellow-400';
      case 'status': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getEventDot = (type: SessionEvent['type']) => {
    switch (type) {
      case 'navigation': return 'bg-blue-400';
      case 'network': return 'bg-purple-400';
      case 'console': return 'bg-yellow-400';
      case 'status': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-white/40';
    }
  };

  const getStatusStyles = (status: SessionStatus) => {
    switch (status) {
      case 'running': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const formatOutput = (output: unknown): string => {
    if (typeof output === 'string') return output;
    return JSON.stringify(output, null, 2);
  };

  const getOutputPreview = (): string => {
    if (!sessionOutput) return '';
    const formatted = formatOutput(sessionOutput);
    return formatted.substring(0, 500) + (formatted.length > 500 ? '...' : '');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Status badge */}
      {sessionStatus && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-white/50">Status:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyles(sessionStatus)}`}>
            {sessionStatus}
          </span>
        </div>
      )}

      {/* Events list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-2">
        {events.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            <ActivityIcon className="w-8 h-8 mx-auto mb-2 text-white/30" />
            <p className="text-sm">Events will stream here</p>
          </div>
        ) : (
          events.map((event, i) => (
            <div key={i} className={`flex items-start gap-2 text-xs ${getEventColor(event.type)}`}>
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${getEventDot(event.type)}`} />
              <span className="break-all">{event.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Output preview */}
      {sessionOutput !== null && sessionOutput !== undefined && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-white/50 mb-1">Output:</div>
          <div className="text-xs text-white/80 bg-black/20 rounded p-2 max-h-24 overflow-y-auto">
            {getOutputPreview()}
          </div>
        </div>
      )}
    </div>
  );
}
