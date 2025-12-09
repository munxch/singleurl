'use client';

import { LoaderIcon, CheckCircleIcon, AlertTriangleIcon, XIcon } from '@/components/icons';

// Job display data for the bar
interface JobDisplay {
  id: string;
  query: string;
  status: 'configuring' | 'running' | 'complete' | 'error';
  createdAt: number;
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  isMinimized: boolean;
}

interface JobsBarProps {
  jobs: JobDisplay[];
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
}: JobsBarProps) {
  // Only show jobs that aren't the active one
  const visibleJobs = jobs.filter(j => j.id !== activeJobId && j.status !== 'configuring');

  if (visibleJobs.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        <div className="text-white/40 text-xs mb-1">Recent searches</div>
        {visibleJobs.slice(0, 5).map((job) => (
          <JobPill
            key={job.id}
            job={job}
            onSwitch={() => onSwitchToJob(job.id)}
            onRemove={() => onRemoveJob(job.id)}
          />
        ))}
      </div>
    </div>
  );
}

function JobPill({
  job,
  onSwitch,
  onRemove,
}: {
  job: JobDisplay;
  onSwitch: () => void;
  onRemove: () => void;
}) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'running':
        return <LoaderIcon className="w-3.5 h-3.5 animate-spin text-yellow-400" />;
      case 'complete':
        return <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" />;
      case 'error':
        return <AlertTriangleIcon className="w-3.5 h-3.5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
    switch (job.status) {
      case 'running':
        return `Running ${job.progress.completed}/${job.progress.total}`;
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Failed';
      default:
        return '';
    }
  };

  // Truncate query for display
  const displayQuery = job.query.length > 40
    ? job.query.substring(0, 40) + '...'
    : job.query || 'Search';

  return (
    <div
      onClick={onSwitch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSwitch()}
      className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-black/70 transition-all shadow-lg cursor-pointer"
    >
      {getStatusIcon()}

      <div className="flex flex-col items-start">
        <span className="text-white/90 text-sm font-medium">{displayQuery}</span>
        <span className="text-white/40 text-xs">{getStatusLabel()}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-2 p-1 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove"
      >
        <XIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
