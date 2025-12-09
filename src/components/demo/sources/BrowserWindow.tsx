'use client';

import React from 'react';
import {
  LoaderIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  GlobeIcon,
  LockIcon,
} from '@/components/icons';
import { BaseLaneStatus, AccentColor, ACCENT_COLORS } from '../types';

interface BrowserWindowProps {
  /** Domain to display in URL bar */
  domain: string;
  /** Current status */
  status: BaseLaneStatus;
  /** Current action message */
  currentAction?: string;
  /** Status message for blocked/paywalled states */
  statusMessage?: string;
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Site icon/emoji */
  siteIcon?: string;
  /** Site name */
  siteName: string;
  /** Site subtitle */
  siteSubtitle?: string;
  /** Custom content for the browser preview area */
  previewContent?: React.ReactNode;
  /** Custom overlay content when complete */
  completeOverlay?: React.ReactNode;
}

/**
 * Mini browser window component showing search progress.
 * Displays URL bar, site header, and status overlays.
 */
export function BrowserWindow({
  domain,
  status,
  currentAction,
  statusMessage,
  accentColor = 'amber',
  siteIcon = '🔍',
  siteName,
  siteSubtitle = 'Search',
  previewContent,
  completeOverlay,
}: BrowserWindowProps) {
  const colors = ACCENT_COLORS[accentColor];

  const getStatusBarIcon = () => {
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
        return null;
      default:
        return <LoaderIcon className={`w-4 h-4 animate-spin ${colors.loader}`} />;
    }
  };

  const renderOverlay = () => {
    // Active states (loading)
    if (!['complete', 'pending', 'blocked', 'paywalled', 'partial'].includes(status)) {
      return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon className={`w-6 h-6 ${colors.text} animate-spin mx-auto mb-2`} />
            <p className="text-white/80 text-sm">{currentAction}</p>
          </div>
        </div>
      );
    }

    // Blocked state
    if (status === 'blocked') {
      return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangleIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-amber-400 font-medium text-sm">Blocked</p>
            {statusMessage && (
              <p className="text-white/40 text-xs mt-1">{statusMessage}</p>
            )}
          </div>
        </div>
      );
    }

    // Paywalled state
    if (status === 'paywalled') {
      return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <LockIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-amber-400 font-medium text-sm">Paywalled</p>
            {statusMessage && (
              <p className="text-white/40 text-xs mt-1">{statusMessage}</p>
            )}
          </div>
        </div>
      );
    }

    // Partial state
    if (status === 'partial') {
      return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangleIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-amber-400 font-medium text-sm">Limited Results</p>
            {statusMessage && (
              <p className="text-white/40 text-xs mt-1">{statusMessage}</p>
            )}
          </div>
        </div>
      );
    }

    // Complete state with custom overlay
    if (status === 'complete' && completeOverlay) {
      return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          {completeOverlay}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0f0f1a]">
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] border-b border-white/10">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] rounded-md">
          <GlobeIcon className="w-3.5 h-3.5 text-white/40" />
          <span className="text-white/50 text-xs font-mono truncate">
            {domain}
          </span>
        </div>
        <div className="flex items-center">
          {getStatusBarIcon()}
        </div>
      </div>

      {/* Browser content */}
      <div className="h-full p-4 relative">
        {/* Site header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-base">{siteIcon}</span>
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">{siteName}</div>
            <div className="text-white/40 text-xs">{siteSubtitle}</div>
          </div>
        </div>

        {/* Preview content */}
        {previewContent || <DefaultPreviewContent />}

        {/* Status overlay */}
        {renderOverlay()}
      </div>
    </div>
  );
}

/**
 * Default preview content showing generic search results skeleton.
 */
function DefaultPreviewContent() {
  return (
    <>
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 h-8 bg-white/5 rounded border border-white/10" />
        <div className="w-16 h-8 bg-blue-500/20 rounded" />
      </div>

      {/* Result cards */}
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 p-3 bg-white/[0.02] rounded border border-white/5">
            <div className="w-16 h-12 bg-white/5 rounded flex items-center justify-center">
              <span className="text-lg opacity-30">📄</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="w-3/4 h-3 bg-white/10 rounded" />
              <div className="w-1/2 h-2 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
