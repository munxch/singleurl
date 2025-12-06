import { OrchestratorState } from '@/types/orchestrator';

const JOBS_STORAGE_KEY = 'mino_jobs';
const MAX_JOBS = 20; // Keep only last 20 jobs

export interface PersistedJob {
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
  orchestratorState?: OrchestratorState;
}

// Get all persisted jobs
export function getPersistedJobs(): PersistedJob[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!stored) return [];

    const jobs = JSON.parse(stored) as PersistedJob[];
    // Sort by createdAt descending (newest first)
    return jobs.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Failed to load persisted jobs:', error);
    return [];
  }
}

// Get a specific job
export function getPersistedJob(jobId: string): PersistedJob | null {
  const jobs = getPersistedJobs();
  return jobs.find(j => j.id === jobId) || null;
}

// Persist a job (create or update)
export function persistJob(job: PersistedJob): void {
  if (typeof window === 'undefined') return;

  try {
    const jobs = getPersistedJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);

    if (existingIndex >= 0) {
      // Update existing job
      jobs[existingIndex] = job;
    } else {
      // Add new job at the beginning
      jobs.unshift(job);
    }

    // Trim to max jobs
    const trimmedJobs = jobs.slice(0, MAX_JOBS);

    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(trimmedJobs));
  } catch (error) {
    console.error('Failed to persist job:', error);
  }
}

// Remove a job
export function removePersistedJob(jobId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const jobs = getPersistedJobs();
    const filteredJobs = jobs.filter(j => j.id !== jobId);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(filteredJobs));
  } catch (error) {
    console.error('Failed to remove job:', error);
  }
}

// Clear all jobs
export function clearPersistedJobs(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(JOBS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear jobs:', error);
  }
}

// Generate a new job ID
export function generateJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
