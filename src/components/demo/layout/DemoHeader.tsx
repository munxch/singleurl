'use client';

import React from 'react';

interface DemoHeaderProps {
  /** Handler for restart button */
  onRestart: () => void;
  /** Handler for sign up button */
  onSignUp?: () => void;
  /** Query text to display in header */
  query?: string;
}

/**
 * Standard header for demo pages with query title and sign up button.
 */
export function DemoHeader({
  onRestart,
  onSignUp,
  query,
}: DemoHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#0a1628]/80 backdrop-blur-sm">
      <div className="relative px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left spacer - accounts for menu button */}
          <div className="w-24 flex-shrink-0" />

          {/* Center: Query title */}
          {query && (
            <div className="flex-1 flex justify-center min-w-0">
              <span className="text-white/50 text-sm truncate">
                {query}
              </span>
            </div>
          )}

          {/* Right: sign up */}
          <div className="w-24 flex-shrink-0 flex justify-end">
            {onSignUp && (
              <button
                onClick={onSignUp}
                className="px-3 py-1 text-sm text-white/70 hover:text-white rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all whitespace-nowrap"
              >
                Sign up
              </button>
            )}
          </div>
        </div>

        {/* Bottom gradient divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </header>
  );
}
