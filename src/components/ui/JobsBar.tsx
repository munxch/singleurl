'use client';

import { Job } from '@/hooks/useJobManager';
import { LoaderIcon, CheckCircleIcon, AlertTriangleIcon, XIcon, MaximizeIcon } from '@/components/icons';

interface JobsBarProps {
  jobs: Job[];
  activeJobId: string | null;
  onSwitchToJob: (jobId: string) => void;
  onRemoveJob: (jobId: string) => void;
  onNewJob: () => void;
}

export function JobsBar({
  jobs,
  activeJobId,
  onSwitchToJob,
  onRemoveJob,
  onNewJob,
}: JobsBarProps) {
  // Only show minimized or completed jobs that aren't the active one
  const visibleJobs = jobs.filter(j =>
    (j.isMinimized || j.status === 'complete') && j.id !== activeJobId
  );

  if (visibleJobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
          {visibleJobs.map((job) => (
            <JobPill
              key={job.id}
              job={job}
              onSwitch={() => onSwitchToJob(job.id)}
              onRemove={() => onRemoveJob(job.id)}
            />
          ))}

          {/* New job button if there are background jobs */}
          {jobs.some(j => j.status === 'running' && j.isMinimized) && (
            <button
              onClick={onNewJob}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-sm font-medium transition-all"
            >
              <span className="text-lg">+</span>
              New search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function JobPill({
  job,
  onSwitch,
  onRemove,
}: {
  job: Job;
  onSwitch: () => void;
  onRemove: () => void;
}) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'running':
        return <LoaderIcon className="w-4 h-4 animate-spin text-blue-400" />;
      case 'complete':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangleIcon className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'running':
        return 'border-blue-500/40 bg-blue-500/10';
      case 'complete':
        return 'border-green-500/40 bg-green-500/10';
      case 'error':
        return 'border-red-500/40 bg-red-500/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  // Truncate query for display
  const displayQuery = job.query.length > 30
    ? job.query.substring(0, 30) + '...'
    : job.query || 'New search';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getStatusColor()} animate-fadeIn`}
    >
      {getStatusIcon()}

      <button
        onClick={onSwitch}
        className="text-white/80 text-sm hover:text-white transition-colors flex items-center gap-2"
      >
        <span className="max-w-[150px] truncate">{displayQuery}</span>
        {job.status === 'running' && (
          <span className="text-white/50 text-xs">
            {job.progress.completed}/{job.progress.total}
          </span>
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSwitch();
        }}
        className="p-1 text-white/40 hover:text-white/70 transition-colors"
        title="Maximize"
      >
        <MaximizeIcon className="w-3 h-3" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-1 text-white/40 hover:text-red-400 transition-colors"
        title="Remove"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
}
