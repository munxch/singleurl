'use client';

import { useRef, useEffect } from 'react';
import {
  SessionLogEvent,
  isFunctionCall,
  isFunctionResponse,
  isFinalResponse,
  FunctionCallEvent,
  VisitUrlArgs,
  InputTextArgs,
  ClickElementArgs,
  PageDescriptionArgs
} from '@/types';

interface ProgressStep {
  id: string;
  type: 'init' | 'navigate' | 'input' | 'click' | 'analyze' | 'complete';
  message: string;
  detail?: string;
  timestamp: number;
  status: 'active' | 'done';
}

interface ProgressNarrationProps {
  sessionLog: SessionLogEvent[];
  isRunning: boolean;
}

function parseSessionLogToSteps(sessionLog: SessionLogEvent[]): ProgressStep[] {
  const steps: ProgressStep[] = [];

  for (let i = 0; i < sessionLog.length; i++) {
    const event = sessionLog[i];

    if (isFunctionCall(event)) {
      const callEvent = event as FunctionCallEvent;
      const nextEvent = sessionLog[i + 1];
      const isDone = nextEvent && isFunctionResponse(nextEvent);

      switch (callEvent.data.name) {
        case 'init_browser_tool':
          steps.push({
            id: event.id,
            type: 'init',
            message: 'Starting browser session',
            detail: 'Spinning up a secure browser instance',
            timestamp: event.timestamp,
            status: isDone ? 'done' : 'active',
          });
          break;

        case 'visit_url_tool': {
          const args = callEvent.data.args as VisitUrlArgs;
          const url = args.url;
          const domain = new URL(url).hostname.replace('www.', '');
          steps.push({
            id: event.id,
            type: 'navigate',
            message: `Navigating to ${domain}`,
            detail: url,
            timestamp: event.timestamp,
            status: isDone ? 'done' : 'active',
          });
          break;
        }

        case 'input_text_tool': {
          const args = callEvent.data.args as InputTextArgs;
          steps.push({
            id: event.id,
            type: 'input',
            message: `Entering "${args.text}"`,
            detail: `Field: ${args.element_name}`,
            timestamp: event.timestamp,
            status: isDone ? 'done' : 'active',
          });
          break;
        }

        case 'click_element_tool': {
          const args = callEvent.data.args as ClickElementArgs;
          steps.push({
            id: event.id,
            type: 'click',
            message: `Clicking "${args.element_name}"`,
            timestamp: event.timestamp,
            status: isDone ? 'done' : 'active',
          });
          break;
        }

        case 'page_description_tool': {
          const args = callEvent.data.args as PageDescriptionArgs;
          const shortQuestion = args.questions.length > 60
            ? args.questions.substring(0, 60) + '...'
            : args.questions;
          steps.push({
            id: event.id,
            type: 'analyze',
            message: 'Analyzing page content',
            detail: shortQuestion,
            timestamp: event.timestamp,
            status: isDone ? 'done' : 'active',
          });
          break;
        }
      }
    }

    if (isFinalResponse(event)) {
      steps.push({
        id: event.id,
        type: 'complete',
        message: 'Preparing your answer',
        timestamp: event.timestamp,
        status: 'done',
      });
    }
  }

  return steps;
}

const stepIcons: Record<ProgressStep['type'], string> = {
  init: '🌐',
  navigate: '🔗',
  input: '⌨️',
  click: '👆',
  analyze: '🔍',
  complete: '✨',
};

export function ProgressNarration({ sessionLog, isRunning }: ProgressNarrationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const steps = parseSessionLogToSteps(sessionLog);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps.length]);

  if (steps.length === 0 && isRunning) {
    return (
      <div className="flex items-center gap-3 text-white/70">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-sm">Mino is getting started...</span>
      </div>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <div ref={scrollRef} className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-start gap-3 transition-all duration-300 ${
            index === steps.length - 1 ? 'animate-fadeIn' : ''
          }`}
        >
          {/* Icon */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            step.status === 'active'
              ? 'bg-blue-500/20 animate-pulse'
              : 'bg-green-500/20'
          }`}>
            <span className="text-sm">{stepIcons[step.type]}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <div className={`text-sm font-medium ${
              step.status === 'active' ? 'text-blue-300' : 'text-white/80'
            }`}>
              {step.message}
              {step.status === 'active' && (
                <span className="ml-2 inline-flex">
                  <span className="animate-pulse">...</span>
                </span>
              )}
            </div>
            {step.detail && (
              <div className="text-xs text-white/50 truncate mt-0.5">
                {step.detail}
              </div>
            )}
          </div>

          {/* Status indicator */}
          {step.status === 'done' && (
            <div className="text-green-400 flex-shrink-0 pt-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
