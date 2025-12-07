// =============================================================================
// SHARED TYPES FOR DEMO COMPONENTS
// =============================================================================

// Base lane status - can be extended per demo
export type BaseLaneStatus =
  | 'pending'
  | 'spawning'
  | 'navigating'
  | 'extracting'
  | 'searching'
  | 'complete'
  | 'blocked'
  | 'paywalled'
  | 'partial'
  | 'error';

// Base lane interface - can be extended per demo
export interface BaseDemoLane {
  id: string;
  site: string;
  domain: string;
  status: BaseLaneStatus;
  progress: number;
  wave?: 1 | 2;
  currentAction?: string;
  statusMessage?: string;
}

// Accent colors used across demos
export type AccentColor = 'amber' | 'cyan' | 'emerald';

// Color mappings for consistent theming
export const ACCENT_COLORS = {
  amber: {
    border: 'border-amber-400',
    bg: 'bg-amber-400',
    bgLight: 'bg-amber-500/20',
    text: 'text-amber-400',
    ring: 'ring-amber-400/50',
    loader: 'text-amber-400/70',
  },
  cyan: {
    border: 'border-cyan-400',
    bg: 'bg-cyan-400',
    bgLight: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    ring: 'ring-cyan-400/50',
    loader: 'text-cyan-400/70',
  },
  emerald: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-400',
    bgLight: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    ring: 'ring-emerald-400/50',
    loader: 'text-emerald-400/70',
  },
} as const;
