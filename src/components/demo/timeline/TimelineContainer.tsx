'use client';

import React from 'react';

interface TimelineContainerProps {
  children: React.ReactNode;
  showLine?: boolean;
}

/**
 * Container for timeline steps with optional vertical connecting line.
 * The line stops before the last step (via bottom-28 offset).
 */
export function TimelineContainer({ children, showLine = true }: TimelineContainerProps) {
  return (
    <div className="relative">
      {/* Timeline vertical line */}
      {showLine && (
        <div className="absolute left-[13px] top-6 bottom-28 w-px bg-white/10" />
      )}
      {children}
    </div>
  );
}
