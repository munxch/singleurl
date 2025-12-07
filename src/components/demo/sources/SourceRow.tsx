'use client';

import React from 'react';
import {
  LoaderIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  LockIcon,
} from '@/components/icons';
import { BaseLaneStatus, AccentColor, ACCENT_COLORS } from '../types';

interface SourceRowProps {
  /** Unique identifier for the lane */
  id: string;
  /** Display name for the source */
  site: string;
  /** Current status of the lane */
  status: BaseLaneStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether this row is currently selected */
  isSelected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Accent color for selection ring */
  accentColor?: AccentColor;
  /** Result count to display when complete */
  resultCount?: number;
  /** Result label (e.g., "Found 1", "12 found") */
  resultLabel?: string;
  /** Whether there was a positive result */
  hasResult?: boolean;
}

/**
 * Individual source row with progress fill background.
 * Shows status icon, site name, and result indicator.
 */
export function SourceRow({
  site,
  status,
  progress,
  isSelected,
  onClick,
  accentColor = 'amber',
  resultCount,
  resultLabel,
  hasResult = false,
}: SourceRowProps) {
  const colors = ACCENT_COLORS[accentColor];

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-white/40" />;
      case 'blocked':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />;
      case 'paywalled':
        return <LockIcon className="w-4 h-4 text-amber-400/70" />;
      case 'partial':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-400/70" />;
      case 'pending':
        return <div className="w-3 h-3 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className={`w-4 h-4 animate-spin ${colors.loader}`} />;
    }
  };

  const getResultText = () => {
    if (resultLabel) return resultLabel;
    if (resultCount !== undefined && resultCount > 0) {
      return `${resultCount} found`;
    }
    if (status === 'complete' && !hasResult) {
      return 'No results';
    }
    return null;
  };

  const getResultColor = () => {
    if (status === 'partial') return 'text-amber-400/80';
    if (hasResult || (resultCount !== undefined && resultCount > 0)) {
      return `${colors.text.replace('text-', 'text-')}/80`;
    }
    return 'text-white/40';
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all overflow-hidden
        ${isSelected ? `ring-1 ${colors.ring} bg-transparent` : 'hover:bg-white/[0.03]'}
      `}
    >
      {/* Progress fill background */}
      <div
        className="absolute inset-0 bg-white/[0.04] transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-3 w-full">
        {getStatusIcon()}
        <span className="flex-1 text-sm text-white/80 truncate">
          {site}
        </span>
        {status === 'complete' || status === 'partial' ? (
          <span className={`text-xs ${getResultColor()}`}>
            {getResultText()}
          </span>
        ) : null}
      </div>
    </button>
  );
}
