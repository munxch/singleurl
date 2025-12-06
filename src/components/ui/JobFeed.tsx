'use client';

import { JobFeedItem } from './JobFeedItem';
import { PersistedJob } from '@/lib/persistence';
import { ClockIcon } from '@/components/icons';

interface JobFeedProps {
  jobs: PersistedJob[];
  onOpenJob: (jobId: string) => void;
  onRemoveJob: (jobId: string) => void;
}

export function JobFeed({ jobs, onOpenJob, onRemoveJob }: JobFeedProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <ClockIcon className="w-6 h-6 text-white/30" />
        </div>
        <p className="text-white/40 text-sm">Your searches will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobFeedItem
          key={job.id}
          job={job}
          onOpenJob={onOpenJob}
          onRemoveJob={onRemoveJob}
        />
      ))}
    </div>
  );
}
