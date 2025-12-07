'use client';

import React from 'react';

interface TimelineContainerProps {
  children: React.ReactNode;
}

/**
 * Container for timeline steps.
 * Individual steps control their own connector lines via showConnector prop.
 */
export function TimelineContainer({ children }: TimelineContainerProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}
