'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LoaderIcon } from '@/components/icons';
import { AccentColor, ACCENT_COLORS } from '../types';
import { AgentThought, AgentThoughts } from '../agent';
import { BrowserWindow } from './BrowserWindow';

interface SearchPanelProps {
  /** Content for the sources sidebar (SourcesList or custom component) */
  children: React.ReactNode;
  /** Width of the sources sidebar */
  sourcesWidth?: string;
  /** Browser window props */
  browser: {
    domain: string;
    status: string;
    currentAction?: string;
    statusMessage?: string;
    siteIcon?: string;
    siteName: string;
    siteSubtitle?: string;
    completeOverlay?: React.ReactNode;
  } | null;
  /** Current agent thought */
  agentThought?: AgentThought | null;
  /** Whether search is currently running */
  isSearching?: boolean;
  /** Accent color theme */
  accentColor?: AccentColor;
  /** Height of the panel */
  height?: string;
  /** Max height of the panel */
  maxHeight?: string;
  /** Number of total sessions for stack effect (shows layers behind) */
  totalSessions?: number;
}

/**
 * Combined panel with sources list, browser window, and agent thoughts.
 * Agent thoughts appear at the bottom during active search.
 */
export function SearchPanel({
  children,
  sourcesWidth = 'w-64',
  browser,
  agentThought,
  isSearching = false,
  accentColor = 'amber',
  height = '60vh',
  maxHeight = '580px',
  totalSessions = 4,
}: SearchPanelProps) {
  const colors = ACCENT_COLORS[accentColor];

  // Calculate how many stack layers to show (max 3 behind the main)
  const stackLayers = Math.min(Math.max(totalSessions - 1, 0), 3);

  // Track browser changes for transition animation
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevDomainRef = useRef<string | null>(null);

  useEffect(() => {
    const currentDomain = browser?.domain || null;
    if (prevDomainRef.current && currentDomain && prevDomainRef.current !== currentDomain) {
      // Domain changed - trigger transition
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
    prevDomainRef.current = currentDomain;
  }, [browser?.domain]);

  return (
    <div className="flex flex-col" style={{ height, maxHeight }}>
      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Sources sidebar - no border divider */}
        <div className={`${sourcesWidth} p-4 overflow-y-auto flex-shrink-0`}>
          {children}
        </div>

        {/* Browser window with stacked effect */}
        <div className="flex-1 relative p-4 pl-2 pb-12">
          {/* Stack container */}
          <div className="relative h-full w-full">
            {/* Background stack layers - scaled width for depth effect */}
            {[...Array(stackLayers)].map((_, i) => {
              const layerIndex = stackLayers - i; // Reverse so first renders at back
              const offsetY = layerIndex * 12;
              const scaleX = 1 - (layerIndex * 0.04); // Slightly narrower each layer
              const opacity = 0.5 - (layerIndex * 0.12);

              return (
                <div
                  key={i}
                  className={`absolute inset-x-0 top-0 bottom-0 rounded-xl border ${colors.border} bg-[#0a0a14]`}
                  style={{
                    transform: `translateY(${offsetY}px) scaleX(${scaleX})`,
                    opacity: Math.max(opacity, 0.15),
                    zIndex: i,
                  }}
                />
              );
            })}

            {/* Main browser window */}
            <div
              className={`relative h-full w-full rounded-xl border ${colors.border} overflow-hidden bg-[#0f0f1a] transition-all duration-300 ease-out ${
                isTransitioning ? 'animate-window-swap' : ''
              }`}
              style={{ zIndex: stackLayers + 1 }}
            >
              {browser ? (
                <BrowserWindow
                  domain={browser.domain}
                  status={browser.status as any}
                  currentAction={browser.currentAction}
                  statusMessage={browser.statusMessage}
                  accentColor={accentColor}
                  siteIcon={browser.siteIcon}
                  siteName={browser.siteName}
                  siteSubtitle={browser.siteSubtitle}
                  completeOverlay={browser.completeOverlay}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <LoaderIcon className={`w-6 h-6 ${colors.text} opacity-60 animate-spin mx-auto mb-2`} />
                    <p className="text-white/40 text-sm">Starting...</p>
                  </div>
                </div>
              )}
            </div>

            {/* CSS for window swap animation */}
            <style jsx>{`
              @keyframes window-swap {
                0% {
                  opacity: 0;
                  transform: translateY(20px) scale(0.97);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              .animate-window-swap {
                animation: window-swap 0.3s ease-out;
              }
            `}</style>

          </div>
        </div>
      </div>

      {/* Agent Thoughts - subtle section at bottom */}
      <AgentThoughts
        thought={agentThought}
        accentColor={accentColor}
        showTyping={true}
        totalSessions={totalSessions}
        isComplete={!isSearching}
      />
    </div>
  );
}
