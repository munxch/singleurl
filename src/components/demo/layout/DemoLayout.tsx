'use client';

import React from 'react';
import { DemoHeader } from './DemoHeader';

interface DemoLayoutProps {
  /** Handler for restart button */
  onRestart: () => void;
  /** Main content */
  children: React.ReactNode;
  /** Optional overlay/modal content */
  overlay?: React.ReactNode;
}

/**
 * Standard layout wrapper for demo pages.
 * Includes background effects, header, and main content area.
 */
export function DemoLayout({ onRestart, children, overlay }: DemoLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      <div className="content">
        <DemoHeader onRestart={onRestart} />

        <main className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {overlay}
    </div>
  );
}
