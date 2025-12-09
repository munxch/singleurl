'use client';

import React from 'react';

interface Action {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick: () => void;
}

interface WhatsNextActionsProps {
  /** Actions to display */
  actions: Action[];
}

/**
 * Grid of action buttons for "What's Next" section.
 */
export function WhatsNextActions({ actions }: WhatsNextActionsProps) {
  return (
    <div className={`grid gap-3 ${actions.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          className={`py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ${
            action.subtitle ? 'flex flex-col items-start text-left' : 'flex items-center justify-center gap-2'
          }`}
        >
          {action.subtitle ? (
            <>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <span className="text-white/60">{action.icon}</span>
                <span>{action.label}</span>
              </div>
              <div className="text-white/40 text-xs mt-0.5">{action.subtitle}</div>
            </>
          ) : (
            <span className="text-white/70 text-sm hover:text-white flex items-center gap-2">
              <span className="text-white/60">{action.icon}</span>
              {action.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Section label for "What's Next" content.
 */
export function WhatsNextLabel() {
  return (
    <div className="text-white/50 text-xs uppercase tracking-wider mb-3">
      What's Next
    </div>
  );
}
