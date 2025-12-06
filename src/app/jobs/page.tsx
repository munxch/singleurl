'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { JobFeed, BottomNav } from '@/components/ui';
import { getPersistedJobs, removePersistedJob, type PersistedJob } from '@/lib/persistence';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<PersistedJob[]>([]);

  // Load jobs from localStorage on mount
  useEffect(() => {
    setJobs(getPersistedJobs());
  }, []);

  // Refresh jobs periodically (for running jobs)
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(getPersistedJobs());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenJob = useCallback((jobId: string) => {
    router.push(`/search/${jobId}`);
  }, [router]);

  const handleRemoveJob = useCallback((jobId: string) => {
    removePersistedJob(jobId);
    setJobs(getPersistedJobs());
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="ocean-bg" />
      <div className="wave-overlay" />

      {/* Content */}
      <div className="content flex-1 flex flex-col">
        {/* Header with logo */}
        <header
          className="flex items-center justify-center px-6 py-4"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
        >
          <MinoLogo />
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col px-6 py-4">
          <div className="w-full max-w-2xl mx-auto">
            <div
              className="flex items-center justify-between mb-6 opacity-0 animate-slideUp"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <h1 className="text-2xl font-bold text-white">Your Searches</h1>
              {jobs.length > 0 && (
                <span className="text-white/40 text-sm">{jobs.length} total</span>
              )}
            </div>

            <div
              className="opacity-0 animate-slideUp"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              {jobs.length > 0 ? (
                <JobFeed
                  jobs={jobs}
                  onOpenJob={handleOpenJob}
                  onRemoveJob={handleRemoveJob}
                />
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-white/50 text-sm">
                    No searches yet. Start a new search to see your history here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
