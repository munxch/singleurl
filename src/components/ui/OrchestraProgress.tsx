'use client';

import { useState } from 'react';
import { SessionLane, ExtractedResult } from '@/types/orchestrator';
import { LoaderIcon, CheckCircleIcon, AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/icons';

interface OrchestraProgressProps {
  lanes: SessionLane[];
  currentBest: ExtractedResult | null;
  onStopEarly?: () => void;
  expanded?: boolean;
}

export function OrchestraProgress({
  lanes,
  currentBest,
  onStopEarly,
  expanded: initialExpanded = false,
}: OrchestraProgressProps) {
  const [showBrowsers, setShowBrowsers] = useState(false);
  const [expanded, setExpanded] = useState(initialExpanded);

  const completedCount = lanes.filter(l => l.status === 'complete').length;
  const totalCount = lanes.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Get lanes with streaming URLs for browser preview
  const streamingLanes = lanes.filter(l => l.streamingUrl);

  return (
    <div className="glass-panel p-4 animate-fadeIn">
      {/* Header with progress bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6">
            <LoaderIcon className="w-6 h-6 animate-spin text-blue-400" />
          </div>
          <span className="text-white font-medium">
            Checking {totalCount} sites
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-white/50 hover:text-white/70 transition-colors text-sm"
        >
          {expanded ? 'Collapse' : 'Expand'}
          {expanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main progress bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Animated shimmer */}
        <div
          className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ animationDuration: '1.5s' }}
        />
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-white/60">
          {completedCount} of {totalCount} complete
        </span>
        {onStopEarly && (
          <button
            onClick={onStopEarly}
            className="text-white/50 hover:text-white/70 transition-colors"
          >
            Stop and show results
          </button>
        )}
      </div>

      {/* Current best result */}
      {currentBest && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-lg">🏆</span>
          </div>
          <div>
            <div className="text-white/60 text-xs">Best so far</div>
            <div className="text-green-400 font-medium">
              ${currentBest.price?.toFixed(2)} at {currentBest.site}
              {currentBest.shipping === 'Free' && (
                <span className="text-green-300/70 text-sm ml-2">(free shipping)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded lanes view */}
      {expanded && (
        <div className="space-y-2 animate-fadeIn">
          {lanes.map((lane) => (
            <LaneRow key={lane.id} lane={lane} />
          ))}
        </div>
      )}

      {/* Browser preview toggle */}
      {streamingLanes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => setShowBrowsers(!showBrowsers)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            {showBrowsers ? (
              <>
                <ChevronUpIcon className="w-4 h-4" />
                Hide live browsers
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                Show live browsers ({streamingLanes.length} active)
              </>
            )}
          </button>

          {showBrowsers && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {streamingLanes.slice(0, 4).map((lane) => (
                <BrowserPreview key={lane.id} lane={lane} />
              ))}
              {streamingLanes.length > 4 && (
                <div className="flex items-center justify-center text-white/40 text-sm">
                  +{streamingLanes.length - 4} more running...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual lane row
function LaneRow({ lane }: { lane: SessionLane }) {
  const getStatusIcon = () => {
    switch (lane.status) {
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangleIcon className="w-4 h-4 text-red-400" />;
      case 'queued':
        return <div className="w-4 h-4 rounded-full border-2 border-white/20" />;
      default:
        return <LoaderIcon className="w-4 h-4 animate-spin text-blue-400" />;
    }
  };

  const getStatusColor = () => {
    switch (lane.status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'queued':
        return 'bg-white/20';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
      {getStatusIcon()}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm font-medium truncate">
            {lane.site.name}
          </span>
          {lane.result?.price && (
            <span className="text-green-400 text-sm font-medium ml-2">
              ${lane.result.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${lane.progress}%` }}
          />
        </div>

        {/* Current action */}
        {lane.currentAction && lane.status !== 'complete' && lane.status !== 'error' && (
          <div className="text-white/40 text-xs mt-1 truncate">
            {lane.currentAction}
          </div>
        )}
      </div>
    </div>
  );
}

// Browser preview iframe
function BrowserPreview({ lane }: { lane: SessionLane }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
        </div>
        <span className="text-white/60 text-xs truncate flex-1">
          {lane.site.name}
        </span>
        {lane.status !== 'complete' && (
          <LoaderIcon className="w-3 h-3 animate-spin text-blue-400" />
        )}
      </div>
      <div className="aspect-video bg-black/40">
        {lane.streamingUrl ? (
          <iframe
            src={lane.streamingUrl}
            className="w-full h-full"
            style={{ border: 'none' }}
            title={`${lane.site.name} browser`}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            Connecting...
          </div>
        )}
      </div>
    </div>
  );
}
