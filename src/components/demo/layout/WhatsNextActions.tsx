'use client';

import React from 'react';

interface Action {
  icon: string;
  label: string;
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
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          {action.icon} {action.label}
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
