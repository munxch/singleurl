'use client';

import React from 'react';
import { CheckIcon } from '@/components/icons';
import { AccentColor, ACCENT_COLORS } from '../types';

interface TimelineStepProps {
  /** Icon to display in the node when active */
  icon: React.ReactNode;
  /** Whether this step is currently active */
  isActive: boolean;
  /** Whether this step is complete */
  isComplete?: boolean;
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Whether to show the connector line below this step */
  showConnector?: boolean;
  /** Additional class names for the card */
  className?: string;
  /** Animation delay for fade-in (e.g., "200ms") */
  animationDelay?: string;
  /** Children to render in the card */
  children: React.ReactNode;
}

/**
 * Individual timeline step with node and card content.
 * Handles active/complete states with appropriate styling.
 */
export function TimelineStep({
  icon,
  isActive,
  isComplete = false,
  accentColor = 'amber',
  showConnector = false,
  className = '',
  animationDelay,
  children,
}: TimelineStepProps) {
  const colors = ACCENT_COLORS[accentColor];

  // Determine node styling based on state
  const getNodeStyles = () => {
    if (isActive) {
      return `${colors.border} ${colors.bg}`;
    }
    if (isComplete) {
      return 'border-white/20 bg-white/10';
    }
    return 'border-white/20 bg-white/10';
  };

  return (
    <div
      className={`relative flex gap-4 mb-6 ${animationDelay ? 'animate-fadeIn' : ''}`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      {/* Timeline node */}
      <div className="relative z-10 flex-shrink-0">
        {/* Pulsing glow for active state */}
        {isActive && (
          <div className={`absolute inset-0 w-7 h-7 rounded-full ${colors.bg} animate-ping opacity-40`} />
        )}
        <div className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center ${getNodeStyles()}`}>
          {isComplete && !isActive ? (
            <CheckIcon className="w-3.5 h-3.5 text-white/70" />
          ) : (
            <span className={isActive ? 'text-white' : 'text-white/70'}>
              {icon}
            </span>
          )}
        </div>
        {/* Connector line to next step */}
        {showConnector && (
          <div className="absolute left-1/2 top-7 bottom-0 w-px -translate-x-1/2 bg-white/10 h-[calc(100%+24px)]" />
        )}
      </div>

      {/* Card content */}
      <div className={`flex-1 glass-card overflow-hidden ${className}`}>
        {children}
      </div>
    </div>
  );
}

interface TimelineResultStepProps {
  icon: React.ReactNode;
  className?: string;
  animationDelay?: string;
  showConnector?: boolean;
  children: React.ReactNode;
}

/**
 * Specialized timeline step for results (always green).
 * Supports ref forwarding for scroll-to behavior.
 */
export const TimelineResultStep = React.forwardRef<HTMLDivElement, TimelineResultStepProps>(
  function TimelineResultStep({ icon, className = '', animationDelay, showConnector = false, children }, ref) {
    return (
      <div
        ref={ref}
        className={`relative flex gap-4 mb-6 ${animationDelay ? 'animate-fadeIn' : ''}`}
        style={animationDelay ? { animationDelay } : undefined}
      >
        {/* Timeline node - always green for results */}
        <div className="relative z-10 flex-shrink-0">
          <div className="w-7 h-7 rounded-full border-2 border-green-400 bg-green-400 flex items-center justify-center">
            <span className="text-white">{icon}</span>
          </div>
          {/* Connector line to next step */}
          {showConnector && (
            <div className="absolute left-1/2 top-7 bottom-0 w-px -translate-x-1/2 bg-white/10 h-[calc(100%+24px)]" />
          )}
        </div>

        {/* Card content */}
        <div className={`flex-1 glass-card overflow-hidden ${className}`}>
          {children}
        </div>
      </div>
    );
  }
);

/**
 * Final timeline step for "What's Next" actions (muted styling).
 */
export function TimelineFinalStep({
  icon,
  className = '',
  animationDelay,
  children,
}: Omit<TimelineStepProps, 'isActive' | 'isComplete' | 'accentColor'>) {
  return (
    <div
      className={`relative flex gap-4 ${animationDelay ? 'animate-fadeIn' : ''}`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      {/* Timeline node - muted for final step */}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-7 h-7 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center">
          <span className="text-white/70">{icon}</span>
        </div>
      </div>

      {/* Card content */}
      <div className={`flex-1 glass-card ${className}`}>
        {children}
      </div>
    </div>
  );
}
