'use client';

import { useState } from 'react';
import { SessionLane, ExtractedResult } from '@/types/orchestrator';
import { LoaderIcon, CheckCircleIcon, AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon, GlobeIcon } from '@/components/icons';

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
  expanded: initialExpanded = true,
}: OrchestraProgressProps) {
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [showAllBrowsers, setShowAllBrowsers] = useState(false);

  const completedCount = lanes.filter(l => l.status === 'complete').length;
  const totalCount = lanes.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Get the selected lane or the first one with a streaming URL
  const selectedLane = selectedLaneId
    ? lanes.find(l => l.id === selectedLaneId)
    : lanes.find(l => l.streamingUrl && l.status !== 'complete' && l.status !== 'error') || lanes.find(l => l.streamingUrl);

  // Get all lanes with streaming URLs
  const streamingLanes = lanes.filter(l => l.streamingUrl);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Main progress panel */}
      <div className="glass-panel p-4">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <LoaderIcon className="w-6 h-6 animate-spin text-blue-400" />
            </div>
            <span className="text-white font-medium">
              Checking {totalCount} sites
            </span>
            <span className="text-white/50 text-sm">
              {completedCount} of {totalCount} complete
            </span>
          </div>

          {onStopEarly && completedCount > 0 && (
            <button
              onClick={onStopEarly}
              className="text-white/50 hover:text-white/70 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-white/5"
            >
              Stop and show results
            </button>
          )}
        </div>

        {/* Main progress bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          />
        </div>

        {/* Current best result */}
        {currentBest && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🏆</span>
            </div>
            <div className="flex-1">
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

        {/* Lanes list */}
        <div className="space-y-2">
          {lanes.map((lane) => (
            <LaneRow
              key={lane.id}
              lane={lane}
              isSelected={selectedLane?.id === lane.id}
              onClick={() => setSelectedLaneId(lane.id === selectedLaneId ? null : lane.id)}
            />
          ))}
        </div>
      </div>

      {/* Browser Preview Panel - Always visible when there's a streaming URL */}
      {selectedLane?.streamingUrl && (
        <div className="glass-panel overflow-hidden animate-fadeIn">
          {/* Browser header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <div className="flex items-center gap-2">
                <GlobeIcon className="w-4 h-4 text-white/50" />
                <span className="text-white/80 text-sm font-medium">{selectedLane.site.name}</span>
                {selectedLane.status !== 'complete' && selectedLane.status !== 'error' && (
                  <LoaderIcon className="w-4 h-4 animate-spin text-blue-400" />
                )}
                {selectedLane.status === 'complete' && (
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>

            {/* Lane selector tabs */}
            <div className="flex items-center gap-1">
              {streamingLanes.slice(0, 6).map((lane) => (
                <button
                  key={lane.id}
                  onClick={() => setSelectedLaneId(lane.id)}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    selectedLane?.id === lane.id
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  {lane.site.name.slice(0, 3)}
                </button>
              ))}
              {streamingLanes.length > 6 && (
                <button
                  onClick={() => setShowAllBrowsers(!showAllBrowsers)}
                  className="px-2 py-1 text-xs text-white/50 hover:text-white/70"
                >
                  +{streamingLanes.length - 6}
                </button>
              )}
            </div>
          </div>

          {/* Browser iframe */}
          <div className="aspect-video bg-black/40 relative">
            <iframe
              src={selectedLane.streamingUrl}
              className="w-full h-full"
              style={{ border: 'none' }}
              title={`${selectedLane.site.name} browser`}
            />

            {/* Status overlay */}
            {selectedLane.currentAction && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <LoaderIcon className="w-4 h-4 animate-spin text-blue-400" />
                  {selectedLane.currentAction}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show all browsers grid (optional expansion) */}
      {showAllBrowsers && streamingLanes.length > 1 && (
        <div className="glass-panel p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm">All active browsers</span>
            <button
              onClick={() => setShowAllBrowsers(false)}
              className="text-white/50 hover:text-white/70 text-sm"
            >
              <ChevronUpIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {streamingLanes.map((lane) => (
              <button
                key={lane.id}
                onClick={() => {
                  setSelectedLaneId(lane.id);
                  setShowAllBrowsers(false);
                }}
                className={`rounded-lg overflow-hidden border transition-all ${
                  selectedLane?.id === lane.id
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="aspect-video bg-black/40 relative">
                  <iframe
                    src={lane.streamingUrl}
                    className="w-full h-full pointer-events-none"
                    style={{ border: 'none' }}
                    title={`${lane.site.name} browser thumbnail`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <span className="text-white text-xs font-medium">{lane.site.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No streaming URL yet message */}
      {!selectedLane?.streamingUrl && lanes.length > 0 && (
        <div className="glass-panel p-8 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-3 text-white/50">
            <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
            <span>Starting browser sessions...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual lane row
function LaneRow({
  lane,
  isSelected,
  onClick
}: {
  lane: SessionLane;
  isSelected: boolean;
  onClick: () => void;
}) {
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
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'queued': return 'bg-white/20';
      default: return 'bg-blue-500';
    }
  };

  const hasStream = !!lane.streamingUrl;

  return (
    <button
      onClick={onClick}
      disabled={!hasStream}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
        isSelected
          ? 'bg-blue-500/20 border border-blue-500/40'
          : hasStream
            ? 'bg-white/5 hover:bg-white/10 border border-transparent'
            : 'bg-white/5 border border-transparent opacity-70'
      }`}
    >
      {getStatusIcon()}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/80 text-sm font-medium truncate">
            {lane.site.name}
          </span>
          <div className="flex items-center gap-2">
            {lane.result?.price && (
              <span className="text-green-400 text-sm font-medium">
                ${lane.result.price.toFixed(2)}
              </span>
            )}
            {hasStream && (
              <span className="text-white/40 text-xs">
                {isSelected ? 'viewing' : 'click to view'}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
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
    </button>
  );
}
