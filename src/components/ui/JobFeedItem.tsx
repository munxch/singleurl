'use client';

import { useState } from 'react';
import { CheckCircleIcon, LoaderIcon, AlertTriangleIcon, ClockIcon, XIcon, ChevronRightIcon } from '@/components/icons';
import { PersistedJob } from '@/lib/persistence';

interface JobFeedItemProps {
  job: PersistedJob;
  onOpenJob: (jobId: string) => void;
  onRemoveJob: (jobId: string) => void;
}

export function JobFeedItem({ job, onOpenJob, onRemoveJob }: JobFeedItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Check if job is stale (running for more than 5 minutes without completion)
  const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
  const isStale = job.status === 'running' && (Date.now() - job.createdAt) > STALE_THRESHOLD_MS;

  const getStatusDisplay = () => {
    if (isStale) {
      return {
        icon: <AlertTriangleIcon className="w-4 h-4" />,
        text: 'Stale',
        color: 'text-amber-400',
      };
    }

    switch (job.status) {
      case 'running':
        return {
          icon: <LoaderIcon className="w-4 h-4 animate-spin" />,
          text: 'Searching...',
          color: 'text-blue-400',
        };
      case 'complete':
        return {
          icon: <CheckCircleIcon className="w-4 h-4" />,
          text: 'Complete',
          color: 'text-green-400',
        };
      case 'error':
        return {
          icon: <AlertTriangleIcon className="w-4 h-4" />,
          text: 'Error',
          color: 'text-red-400',
        };
      default:
        return {
          icon: <ClockIcon className="w-4 h-4" />,
          text: 'Draft',
          color: 'text-white/40',
        };
    }
  };

  const status = getStatusDisplay();
  const progressPercent = job.progress.total > 0
    ? Math.round((job.progress.completed / job.progress.total) * 100)
    : 0;

  // Get best result if available
  const results = job.orchestratorState?.aggregatedResults?.results || [];
  const bestResult = results.find(r => r.price !== undefined)
    ? results.reduce((best, r) => (r.price && (!best.price || r.price < best.price)) ? r : best, results[0])
    : null;

  const timeAgo = getTimeAgo(job.createdAt);

  return (
    <div
      className="glass-card transition-all duration-300 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button - shows on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemoveJob(job.id);
        }}
        className={`
          absolute -top-2 -right-2 z-10 p-1.5 rounded-full
          bg-slate-950 border border-white/20 shadow-lg
          text-white/50 hover:text-red-400 hover:border-red-500/30
          transition-all duration-200
          ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        `}
        title="Remove search"
      >
        <XIcon className="w-3 h-3" />
      </button>

      {/* Main clickable area */}
      <button
        onClick={() => onOpenJob(job.id)}
        className="w-full p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">
              {job.query || 'Untitled search'}
            </h3>
            <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
              <span className={`flex items-center gap-1.5 ${status.color}`}>
                {status.icon}
                {status.text}
              </span>
              {job.status === 'running' && !isStale && (
                <span className="text-white/40">
                  {job.progress.completed}/{job.progress.total} sites
                </span>
              )}
              {job.status === 'complete' && bestResult?.price && (
                <span className="text-green-400 font-medium">
                  Best: ${bestResult.price.toFixed(2)} at {bestResult.site}
                </span>
              )}
              <span className="text-white/30">{timeAgo}</span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRightIcon className="w-4 h-4 text-white/30 flex-shrink-0" />
        </div>

        {/* Progress bar for running jobs (not stale) */}
        {job.status === 'running' && !isStale && (
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </button>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
