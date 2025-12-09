'use client';

import React from 'react';
import { DemoHeader } from './DemoHeader';
import { Sidebar } from '@/components/ui/Sidebar';

interface DemoLayoutProps {
  /** Handler for restart button */
  onRestart: () => void;
  /** Handler for sign up button */
  onSignUp?: () => void;
  /** Query text to display in header */
  query?: string;
  /** Main content */
  children: React.ReactNode;
  /** Optional overlay/modal content */
  overlay?: React.ReactNode;
}

/**
 * Standard layout wrapper for demo pages.
 * Includes background effects, header, and main content area.
 */
export function DemoLayout({ onRestart, onSignUp, query, children, overlay }: DemoLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar onSignUp={onSignUp} />

      {/* Main area */}
      <div className="flex-1">
        <div className="ocean-bg pointer-events-none" />
        <div className="wave-overlay pointer-events-none" />

        <div className="content">
          <DemoHeader onRestart={onRestart} onSignUp={onSignUp} query={query} />

          <main className="px-6 pt-8 pb-12">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {overlay}
      </div>
    </div>
  );
}
