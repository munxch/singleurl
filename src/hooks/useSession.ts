'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { runPlaygroundQuery, getSessionStatus } from '@/lib/api';
import { SessionStatus, SessionEvent } from '@/types';

interface UseSessionReturn {
  sessionId: string | null;
  streamingUrl: string | null;
  sessionStatus: SessionStatus | null;
  sessionOutput: unknown;
  events: SessionEvent[];
  error: string | null;
  isRunning: boolean;
  isComplete: boolean;
  runQuery: (query: string) => Promise<void>;
  reset: () => void;
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [sessionOutput, setSessionOutput] = useState<unknown>(null);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addEvent = useCallback((event: SessionEvent) => {
    setEvents(prev => [...prev.slice(-49), event]);
  }, []);

  const startPolling = useCallback((sid: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    const poll = async () => {
      try {
        const session = await getSessionStatus(sid);
        setSessionStatus(session.status);

        // Update streaming URL if available
        if (session.streaming_url && !streamingUrl) {
          setStreamingUrl(session.streaming_url);
          addEvent({ type: 'status', message: 'Browser stream connected', timestamp: Date.now() });
        }

        // Check for completion
        if (session.status === 'completed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsRunning(false);
          setIsComplete(true);
          setSessionOutput(session.output);
          addEvent({ type: 'status', message: 'Session completed', timestamp: Date.now() });
        } else if (session.status === 'error') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsRunning(false);
          setError(session.error_message || 'Session failed');
          addEvent({ type: 'error', message: session.error_message || 'Session failed', timestamp: Date.now() });
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    // Poll immediately, then every 2 seconds
    poll();
    pollIntervalRef.current = setInterval(poll, 2000);
  }, [streamingUrl, addEvent]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const runQuery = useCallback(async (query: string) => {
    if (!query.trim() || isRunning) return;

    setIsRunning(true);
    setError(null);
    setEvents([]);
    setSessionId(null);
    setStreamingUrl(null);
    setSessionStatus(null);
    setSessionOutput(null);
    setIsComplete(false);

    addEvent({ type: 'status', message: 'Starting session...', timestamp: Date.now() });

    try {
      const result = await runPlaygroundQuery(query);
      console.log('Playground result:', result);

      setSessionId(result.session_id);
      setSessionStatus(result.status);
      addEvent({ type: 'status', message: `Session created: ${result.session_id}`, timestamp: Date.now() });

      // Set streaming URL if available immediately
      if (result.streaming_url) {
        setStreamingUrl(result.streaming_url);
        addEvent({ type: 'status', message: 'Browser stream available', timestamp: Date.now() });
      }

      // Start polling for status updates
      if (result.session_id) {
        startPolling(result.session_id);
      }

      // If already completed (unlikely but possible)
      if (result.status === 'completed') {
        setIsRunning(false);
        setIsComplete(true);
        setSessionOutput(result.output);
      }
    } catch (e) {
      console.error('Query error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Failed to run query';
      setError(errorMessage);
      setIsRunning(false);
      addEvent({ type: 'error', message: errorMessage, timestamp: Date.now() });
    }
  }, [isRunning, addEvent, startPolling]);

  const reset = useCallback(() => {
    setSessionId(null);
    setStreamingUrl(null);
    setSessionStatus(null);
    setSessionOutput(null);
    setEvents([]);
    setError(null);
    setIsComplete(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  return {
    sessionId,
    streamingUrl,
    sessionStatus,
    sessionOutput,
    events,
    error,
    isRunning,
    isComplete,
    runQuery,
    reset,
  };
}
