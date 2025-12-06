'use client';

import { useState, useEffect } from 'react';
import { LoaderIcon, AlertTriangleIcon } from '@/components/icons';

interface BrowserViewerProps {
  streamingUrl: string | null;
  onStatusChange?: (status: 'connected' | 'error') => void;
}

export function BrowserViewer({ streamingUrl, onStatusChange }: BrowserViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [streamingUrl]);

  const handleLoad = () => {
    setIsLoaded(true);
    onStatusChange?.('connected');
  };

  const handleError = () => {
    setHasError(true);
    onStatusChange?.('error');
  };

  if (!streamingUrl) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <div className="text-center">
          <AlertTriangleIcon />
          <p className="text-sm mt-2">No streaming URL available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Status indicator */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        {!isLoaded && !hasError && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Loading...
          </div>
        )}
        {isLoaded && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            LIVE
          </div>
        )}
        {hasError && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Error
          </div>
        )}
      </div>

      {/* Iframe for browser view */}
      <div className="flex-1 bg-black/20 rounded-lg overflow-hidden relative">
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60">
            <div className="text-center">
              <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading browser view...</p>
            </div>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400">
            <div className="text-center">
              <AlertTriangleIcon />
              <p className="text-sm mt-2">Failed to load browser view</p>
            </div>
          </div>
        )}
        <iframe
          src={streamingUrl}
          className={`w-full h-full border-0 ${isLoaded ? '' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
