'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useOrchestrator } from './useOrchestrator';

export interface Job {
  id: string;
  query: string;
  status: 'configuring' | 'running' | 'complete' | 'error';
  createdAt: number;
  completedAt?: number;
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  isMinimized: boolean;
}

interface JobManagerState {
  jobs: Job[];
  activeJobId: string | null;
}

export function useJobManager() {
  const [state, setState] = useState<JobManagerState>({
    jobs: [],
    activeJobId: null,
  });

  // Create the active orchestrator
  const orchestrator = useOrchestrator();

  // Track job updates from orchestrator
  useEffect(() => {
    if (!state.activeJobId) return;

    // Update the active job with orchestrator state
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(job =>
        job.id === prev.activeJobId
          ? {
              ...job,
              query: orchestrator.originalQuery || job.query,
              status: orchestrator.isComplete
                ? 'complete'
                : orchestrator.isRunning
                  ? 'running'
                  : orchestrator.error
                    ? 'error'
                    : 'configuring',
              progress: orchestrator.progress,
              completedAt: orchestrator.isComplete ? Date.now() : undefined,
            }
          : job
      ),
    }));
  }, [
    state.activeJobId,
    orchestrator.originalQuery,
    orchestrator.isComplete,
    orchestrator.isRunning,
    orchestrator.error,
    orchestrator.progress,
  ]);

  // Create a new job
  const createJob = useCallback(() => {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // If there's an active job that's running, minimize it
    setState(prev => ({
      jobs: prev.jobs.map(job =>
        job.id === prev.activeJobId && job.status === 'running'
          ? { ...job, isMinimized: true }
          : job
      ).concat({
        id: jobId,
        query: '',
        status: 'configuring',
        createdAt: Date.now(),
        progress: { total: 0, completed: 0, failed: 0 },
        isMinimized: false,
      }),
      activeJobId: jobId,
    }));

    // Reset the orchestrator for the new job
    orchestrator.reset();

    return jobId;
  }, [orchestrator]);

  // Switch to a job
  const switchToJob = useCallback((jobId: string) => {
    setState(prev => ({
      ...prev,
      activeJobId: jobId,
      jobs: prev.jobs.map(job => ({
        ...job,
        isMinimized: job.id !== jobId ? job.isMinimized : false,
      })),
    }));
  }, []);

  // Minimize the active job
  const minimizeActiveJob = useCallback(() => {
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(job =>
        job.id === prev.activeJobId ? { ...job, isMinimized: true } : job
      ),
    }));
  }, []);

  // Maximize a job
  const maximizeJob = useCallback((jobId: string) => {
    switchToJob(jobId);
  }, [switchToJob]);

  // Remove a job
  const removeJob = useCallback((jobId: string) => {
    setState(prev => {
      const newJobs = prev.jobs.filter(j => j.id !== jobId);
      const newActiveId =
        prev.activeJobId === jobId
          ? newJobs.find(j => !j.isMinimized)?.id || newJobs[0]?.id || null
          : prev.activeJobId;
      return {
        jobs: newJobs,
        activeJobId: newActiveId,
      };
    });
  }, []);

  // Get active job
  const activeJob = state.jobs.find(j => j.id === state.activeJobId);

  // Get running jobs (for the minimized bar)
  const runningJobs = state.jobs.filter(j => j.status === 'running' && j.isMinimized);

  // Get completed jobs
  const completedJobs = state.jobs.filter(j => j.status === 'complete');

  // Check if we can start a new job
  const canStartNewJob = true; // Always allow starting new jobs

  return {
    // State
    jobs: state.jobs,
    activeJobId: state.activeJobId,
    activeJob,
    runningJobs,
    completedJobs,
    canStartNewJob,

    // Active orchestrator
    orchestrator,

    // Actions
    createJob,
    switchToJob,
    minimizeActiveJob,
    maximizeJob,
    removeJob,
  };
}
