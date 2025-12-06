'use client';

import { useState } from 'react';
import { SessionLane, ExtractedResult } from '@/types/orchestrator';
import { LoaderIcon, CheckCircleIcon, AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon, GlobeIcon } from '@/components/icons';

interface OrchestraProgressProps {
  lanes: SessionLane[];
  currentBest: ExtractedResult | null;
  onStopEarly?: () => void;
}

export function OrchestraProgress({
  lanes,
  currentBest,
  onStopEarly,
}: OrchestraProgressProps) {
  const [expandedLaneId, setExpandedLaneId] = useState<string | null>(null);

  const completedCount = lanes.filter(l => l.status === 'complete').length;
  const totalCount = lanes.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;

  // Toggle lane expansion (collapse others)
  const toggleLane = (laneId: string) => {
    setExpandedLaneId(prev => prev === laneId ? null : laneId);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Main progress panel */}
      <div className="glass-panel p-4">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {!allComplete ? (
              <LoaderIcon className="w-6 h-6 animate-spin text-blue-400" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            )}
            <span className="text-white font-medium">
              {allComplete ? 'Complete' : `Checking ${totalCount} sites`}
            </span>
            <span className="text-white/50 text-sm">
              {completedCount} of {totalCount} complete
            </span>
          </div>

          {onStopEarly && completedCount > 0 && !allComplete && (
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
          {!allComplete && (
            <div
              className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            />
          )}
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

        {/* Accordion lanes list */}
        <div className="space-y-2">
          {lanes.map((lane) => (
            <AccordionLane
              key={lane.id}
              lane={lane}
              isExpanded={expandedLaneId === lane.id}
              onToggle={() => toggleLane(lane.id)}
            />
          ))}
        </div>
      </div>

      {/* No lanes yet message */}
      {lanes.length === 0 && (
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

// Accordion lane with expandable browser view
function AccordionLane({
  lane,
  isExpanded,
  onToggle,
}: {
  lane: SessionLane;
  isExpanded: boolean;
  onToggle: () => void;
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
  const canExpand = hasStream || lane.status === 'complete' || lane.status === 'error';

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-300 ${
        isExpanded
          ? 'bg-white/10 border border-white/20'
          : 'bg-white/5 border border-transparent hover:bg-white/[0.07]'
      }`}
    >
      {/* Header row - always visible */}
      <button
        onClick={onToggle}
        disabled={!canExpand}
        className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
          !canExpand ? 'opacity-70 cursor-default' : 'cursor-pointer'
        }`}
      >
        {getStatusIcon()}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/90 text-sm font-medium truncate">
              {lane.site.name}
            </span>
            <div className="flex items-center gap-2">
              {lane.result?.price && (
                <span className="text-green-400 text-sm font-medium">
                  ${lane.result.price.toFixed(2)}
                </span>
              )}
              {lane.result?.inStock === true && (
                <span className="text-green-400/70 text-xs">In stock</span>
              )}
              {lane.result?.inStock === false && (
                <span className="text-red-400/70 text-xs">Out of stock</span>
              )}
              {lane.status === 'error' && (
                <span className="text-red-400/70 text-xs">Failed</span>
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

          {/* Current action - only when not expanded */}
          {!isExpanded && lane.currentAction && lane.status !== 'complete' && lane.status !== 'error' && (
            <div className="text-white/40 text-xs mt-1 truncate">
              {lane.currentAction}
            </div>
          )}
        </div>

        {/* Expand/collapse chevron */}
        {canExpand && (
          <div className="flex-shrink-0 text-white/40">
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </button>

      {/* Expanded content - browser view */}
      {isExpanded && (
        <div className="animate-fadeIn">
          {/* Browser preview */}
          {hasStream && (
            <div className="border-t border-white/10">
              {/* Browser chrome header */}
              <div className="flex items-center gap-3 px-3 py-2 bg-black/30">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0 bg-black/30 rounded px-2 py-1">
                  <GlobeIcon className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/50 text-xs truncate">https://{lane.site.domain}</span>
                </div>
              </div>

              {/* Browser viewport - placeholder or real */}
              <div className="aspect-video bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
                {lane.streamingUrl?.startsWith('placeholder') ? (
                  // Placeholder browser view
                  <div className="absolute inset-0 flex flex-col">
                    {/* Simulated page header */}
                    <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4">
                      <div className="w-24 h-6 bg-white/10 rounded" />
                      <div className="flex-1" />
                      <div className="flex gap-2">
                        <div className="w-16 h-6 bg-white/10 rounded" />
                        <div className="w-16 h-6 bg-white/10 rounded" />
                      </div>
                    </div>

                    {/* Simulated content */}
                    <div className="flex-1 p-4 flex gap-4">
                      {/* Product image placeholder */}
                      <div className="w-1/3 aspect-square bg-white/5 rounded-lg flex items-center justify-center">
                        {lane.status === 'complete' ? (
                          <span className="text-4xl">📦</span>
                        ) : (
                          <LoaderIcon className="w-8 h-8 text-white/20 animate-spin" />
                        )}
                      </div>

                      {/* Product details placeholder */}
                      <div className="flex-1 space-y-3">
                        <div className="w-3/4 h-6 bg-white/10 rounded" />
                        <div className="w-1/2 h-4 bg-white/5 rounded" />
                        <div className="w-1/4 h-8 bg-white/10 rounded mt-4" />
                        <div className="space-y-2 mt-4">
                          <div className="w-full h-3 bg-white/5 rounded" />
                          <div className="w-5/6 h-3 bg-white/5 rounded" />
                          <div className="w-4/6 h-3 bg-white/5 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Status overlay */}
                    {lane.status !== 'complete' && lane.status !== 'error' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center">
                          <LoaderIcon className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                          <p className="text-white/70 text-sm">{lane.currentAction}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Real iframe
                  <iframe
                    src={lane.streamingUrl}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    title={`${lane.site.name} browser`}
                  />
                )}
              </div>

              {/* Current action bar */}
              {lane.currentAction && lane.status !== 'complete' && lane.status !== 'error' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-black/20 border-t border-white/10">
                  <LoaderIcon className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span className="text-white/60 text-xs">{lane.currentAction}</span>
                </div>
              )}
            </div>
          )}

          {/* Result details (for completed lanes) */}
          {lane.status === 'complete' && lane.result && (
            <div className="border-t border-white/10 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {lane.result.price && (
                  <div>
                    <div className="text-white/40 text-xs">Price</div>
                    <div className="text-white font-medium">${lane.result.price.toFixed(2)}</div>
                  </div>
                )}
                {lane.result.shipping && (
                  <div>
                    <div className="text-white/40 text-xs">Shipping</div>
                    <div className="text-white">{lane.result.shipping}</div>
                  </div>
                )}
                {lane.result.deliveryEstimate && (
                  <div>
                    <div className="text-white/40 text-xs">Delivery</div>
                    <div className="text-white">{lane.result.deliveryEstimate}</div>
                  </div>
                )}
                {lane.result.inStock !== undefined && (
                  <div>
                    <div className="text-white/40 text-xs">Availability</div>
                    <div className={lane.result.inStock ? 'text-green-400' : 'text-red-400'}>
                      {lane.result.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                )}
              </div>
              {lane.result.url && (
                <a
                  href={lane.result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  <GlobeIcon className="w-3.5 h-3.5" />
                  View on {lane.site.name}
                </a>
              )}
            </div>
          )}

          {/* Error details */}
          {lane.status === 'error' && lane.error && (
            <div className="border-t border-white/10 p-3">
              <div className="text-red-400/80 text-sm">{lane.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
