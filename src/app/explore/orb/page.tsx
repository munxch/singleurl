'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon, MicIcon } from '@/components/icons';

// Dynamically import AudioOrb to avoid SSR issues
const AudioOrb = dynamic(
  () => import('@/components/ui/AudioOrb').then(mod => ({ default: mod.AudioOrb })),
  {
    ssr: false,
    loading: () => (
      <div className="w-80 h-80 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 animate-pulse" />
    ),
  }
);

type OrbMode = 'idle' | 'listening' | 'speaking' | 'active';

interface ModeConfig {
  id: OrbMode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'idle',
    label: 'Idle',
    description: 'Calm, ambient state. Gentle breathing.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
  },
  {
    id: 'listening',
    label: 'Listening',
    description: 'Active, attentive. Fast, busy particles.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500/40',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    description: 'Responding, processing. Audio-reactive.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/40',
  },
  {
    id: 'active',
    label: 'Active',
    description: 'Engaged, ready to act. Energetic.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/40',
  },
];

export default function OrbDemoPage() {
  const [mode, setMode] = useState<OrbMode>('idle');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Check for audio permission on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setHasAudioPermission(result.state === 'granted');
      }).catch(() => {
        setHasAudioPermission(null);
      });
    }
  }, []);

  const handleEnableAudio = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasAudioPermission(true);
      setAudioEnabled(true);
    } catch (err) {
      console.error('Audio permission denied:', err);
      setHasAudioPermission(false);
    }
  };

  const handleSimulateConversation = () => {
    if (isSimulating) return;

    setIsSimulating(true);

    // Simulate a conversation flow
    const sequence: { mode: OrbMode; duration: number }[] = [
      { mode: 'listening', duration: 2000 },
      { mode: 'speaking', duration: 3000 },
      { mode: 'listening', duration: 1500 },
      { mode: 'speaking', duration: 2500 },
      { mode: 'idle', duration: 1000 },
    ];

    let delay = 0;
    sequence.forEach(({ mode: nextMode, duration }) => {
      setTimeout(() => setMode(nextMode), delay);
      delay += duration;
    });

    setTimeout(() => {
      setIsSimulating(false);
    }, delay);
  };

  const currentModeConfig = MODES.find(m => m.id === mode)!;

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Background */}
      <div className="ocean-bg pointer-events-none" />
      <div className="wave-overlay pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/explore/entry"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="text-sm">Back to explorations</span>
            </Link>
            <h1 className="text-white font-medium">AudioOrb Demo</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center px-6 py-12">

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">The Living Orb</h2>
          <p className="text-white/50 max-w-md">
            3000 particles. Audio-reactive. Four distinct modes.
          </p>
        </div>

        {/* Orb */}
        <div className="relative mb-8">
          <AudioOrb
            mode={mode}
            size={320}
            audioEnabled={audioEnabled && mode === 'speaking'}
          />

          {/* Mode indicator overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`
              px-4 py-2 rounded-full
              ${currentModeConfig.bgColor} border ${currentModeConfig.borderColor}
              backdrop-blur-sm
            `}>
              <span className={`text-sm font-medium ${currentModeConfig.color}`}>
                {currentModeConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Mode description */}
        <p className="text-white/40 text-sm mb-8 text-center max-w-xs">
          {currentModeConfig.description}
        </p>

        {/* Mode selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {MODES.map((modeConfig) => (
            <button
              key={modeConfig.id}
              onClick={() => setMode(modeConfig.id)}
              disabled={isSimulating}
              className={`
                px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-300
                ${mode === modeConfig.id
                  ? `${modeConfig.bgColor} ${modeConfig.borderColor} border ${modeConfig.color}`
                  : 'bg-white/[0.06] border border-white/10 text-white/60 hover:bg-white/[0.1] hover:text-white/80'
                }
                ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {modeConfig.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">

          {/* Simulate conversation */}
          <button
            onClick={handleSimulateConversation}
            disabled={isSimulating}
            className={`
              px-6 py-3 rounded-xl font-medium text-sm
              transition-all duration-300
              ${isSimulating
                ? 'bg-white/10 text-white/40 cursor-wait'
                : 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white hover:from-purple-500 hover:to-pink-500'
              }
            `}
          >
            {isSimulating ? 'Simulating...' : 'Simulate Conversation'}
          </button>

          {/* Audio toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={audioEnabled ? () => setAudioEnabled(false) : handleEnableAudio}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                transition-all duration-300
                ${audioEnabled
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-white/[0.06] border border-white/10 text-white/60 hover:bg-white/[0.1]'
                }
              `}
            >
              <MicIcon className="w-4 h-4" />
              {audioEnabled ? 'Mic On' : 'Enable Mic'}
            </button>

            {hasAudioPermission === false && (
              <span className="text-red-400/70 text-xs">Permission denied</span>
            )}

            {audioEnabled && (
              <span className="text-emerald-400/70 text-xs">
                Active in Speaking mode
              </span>
            )}
          </div>
        </div>

        {/* Technical details */}
        <div className="mt-12 w-full max-w-lg">
          <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4 text-center">
            Technical Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-white/40 text-xs mb-1">Particles</div>
              <div className="text-white font-mono text-lg">3,000</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-white/40 text-xs mb-1">FFT Size</div>
              <div className="text-white font-mono text-lg">512</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-white/40 text-xs mb-1">Orb Radius</div>
              <div className="text-white font-mono text-lg">2.5 units</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-white/40 text-xs mb-1">Blending</div>
              <div className="text-white font-mono text-lg">Additive</div>
            </div>
          </div>

          {/* Mode colors */}
          <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-white/40 text-xs mb-3">Mode Colors</div>
            <div className="space-y-2">
              {MODES.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${m.bgColor.replace('/20', '')}`} />
                    <span className={`text-xs font-mono ${m.color}`}>
                      {m.id === 'idle' && 'Cyan + Blue'}
                      {m.id === 'listening' && 'Teal + Cyan'}
                      {m.id === 'speaking' && 'Purple + Blue'}
                      {m.id === 'active' && 'Purple + Pink'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
