'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon } from '@/components/icons';

// Dynamically import AudioOrb to avoid SSR issues with Three.js
const AudioOrb = dynamic(() => import('@/components/ui/AudioOrb').then(mod => ({ default: mod.AudioOrb })), {
  ssr: false,
  loading: () => (
    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 animate-pulse" />
  ),
});

// =============================================================================
// NAVIGATION BETWEEN EXPLORATIONS
// =============================================================================

type Exploration = 'dispatch' | 'ambient' | 'combined';

export default function EntryExplorationsPage() {
  const [activeExploration, setActiveExploration] = useState<Exploration>('combined');

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Background effects */}
      <div className="ocean-bg pointer-events-none" />
      <div className="wave-overlay pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back link */}
            <Link
              href="/"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="text-sm">Back to home</span>
            </Link>

            {/* Title */}
            <h1 className="text-white font-medium">Entry Point Explorations</h1>

            {/* Spacer */}
            <div className="w-24" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setActiveExploration('combined')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeExploration === 'combined'
                  ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              ★ Combined: The Dispatcher
            </button>
            <button
              onClick={() => setActiveExploration('dispatch')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeExploration === 'dispatch'
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Direction 1: Dispatch
            </button>
            <button
              onClick={() => setActiveExploration('ambient')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeExploration === 'ambient'
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Direction 2: Ambient
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10">
        {activeExploration === 'combined' && <CombinedExploration />}
        {activeExploration === 'dispatch' && <DispatchExploration />}
        {activeExploration === 'ambient' && <AmbientExploration />}
      </main>
    </div>
  );
}

// =============================================================================
// DIRECTION 1: DISPATCH
// "You don't search here. You send agents."
// =============================================================================

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  parameters: AgentParameter[];
  sites: string[];
  estimatedTime: string;
  gradient: string;
}

interface AgentParameter {
  id: string;
  label: string;
  value: string;
  editable?: boolean;
}

const AGENTS: Agent[] = [
  {
    id: 'car-scout',
    name: 'Car Scout',
    description: 'Find vehicles across dealerships, auctions & marketplaces',
    icon: '🚗',
    parameters: [
      { id: 'make', label: 'Make', value: 'Honda', editable: true },
      { id: 'model', label: 'Model', value: 'Civic', editable: true },
      { id: 'budget', label: 'Max Price', value: '$25,000', editable: true },
      { id: 'mileage', label: 'Max Miles', value: '50,000', editable: true },
    ],
    sites: ['CarGurus', 'AutoTrader', 'Cars.com', 'CarMax', 'FB Marketplace', 'Craigslist', '+ local dealers'],
    estimatedTime: '~35 sec',
    gradient: 'from-emerald-500/10 to-cyan-500/5',
  },
  {
    id: 'table-finder',
    name: 'Table Finder',
    description: 'Book reservations across all major platforms',
    icon: '🍽️',
    parameters: [
      { id: 'cuisine', label: 'Cuisine', value: 'Italian', editable: true },
      { id: 'location', label: 'Location', value: 'Dallas', editable: true },
      { id: 'time', label: 'Time', value: '7:00 PM', editable: true },
      { id: 'party', label: 'Party Size', value: '2', editable: true },
    ],
    sites: ['OpenTable', 'Resy', 'Yelp', 'Google', 'Tock'],
    estimatedTime: '~12 sec',
    gradient: 'from-orange-500/10 to-red-500/5',
  },
  {
    id: 'lead-hunter',
    name: 'Lead Hunter',
    description: 'Find decision makers and build prospect lists',
    icon: '💼',
    parameters: [
      { id: 'title', label: 'Title', value: 'CFO', editable: true },
      { id: 'industry', label: 'Industry', value: 'Hospitality', editable: true },
      { id: 'region', label: 'Region', value: 'DFW', editable: true },
    ],
    sites: ['LinkedIn', 'Apollo', 'ZoomInfo', 'Company websites'],
    estimatedTime: '~45 sec',
    gradient: 'from-blue-500/10 to-indigo-500/5',
  },
  {
    id: 'price-watcher',
    name: 'Price Watcher',
    description: 'Compare prices and find the best deals',
    icon: '💰',
    parameters: [
      { id: 'product', label: 'Product', value: 'AirPods Pro 2', editable: true },
      { id: 'condition', label: 'Condition', value: 'New', editable: true },
    ],
    sites: ['Amazon', 'Best Buy', 'Target', 'Walmart', 'Costco', 'Apple'],
    estimatedTime: '~20 sec',
    gradient: 'from-purple-500/10 to-pink-500/5',
  },
];

function DispatchExploration() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsLaunching(true);
    // Simulate launch animation
    setTimeout(() => {
      setIsLaunching(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 py-12">
      {/* Concept label */}
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs uppercase tracking-wider mb-4">
          Direction 1
        </span>
        <h2 className="text-3xl font-bold text-white mb-2">Dispatch</h2>
        <p className="text-white/50 max-w-md">
          You don't search here. You send agents.
        </p>
      </div>

      {/* Agent Cards */}
      <div className="w-full max-w-4xl">
        {/* Ready status */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-sm">4 agents ready to deploy</span>
          </div>
          <button className="text-white/40 hover:text-white/60 text-sm transition-colors">
            + Create custom agent
          </button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onLaunch={() => handleLaunch(agent)}
              isLaunching={isLaunching && selectedAgent?.id === agent.id}
            />
          ))}
        </div>
      </div>

      {/* Launch animation overlay */}
      {isLaunching && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1628]/95 backdrop-blur-sm animate-fadeIn">
          <div className="text-center animate-scaleIn">
            <div className="text-6xl mb-6 animate-float">{selectedAgent.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">Deploying {selectedAgent.name}</h3>
            <p className="text-white/50 mb-6">Spinning up {selectedAgent.sites.length} browser sessions...</p>

            {/* Site badges appearing */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {selectedAgent.sites.slice(0, 6).map((site, i) => (
                <span
                  key={site}
                  className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm animate-fadeInUp"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {site}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, onLaunch, isLaunching }: { agent: Agent; onLaunch: () => void; isLaunching: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`
        relative rounded-2xl border border-white/[0.08] overflow-hidden
        bg-gradient-to-br ${agent.gradient}
        transition-all duration-300
        ${isExpanded ? 'ring-1 ring-white/20' : 'hover:border-white/15'}
      `}
    >
      {/* Main content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{agent.icon}</span>
            <div>
              <h3 className="text-white font-semibold text-lg">{agent.name}</h3>
              <p className="text-white/50 text-sm">{agent.description}</p>
            </div>
          </div>
        </div>

        {/* Parameters preview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.parameters.slice(0, 3).map((param) => (
            <span
              key={param.id}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/70 text-sm"
            >
              {param.value}
            </span>
          ))}
          {agent.parameters.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-white/40 text-sm hover:bg-white/[0.06] hover:text-white/60 transition-colors"
            >
              +{agent.parameters.length - 3} more
            </button>
          )}
        </div>

        {/* Expanded parameters */}
        {isExpanded && (
          <div className="mb-4 p-3 rounded-xl bg-black/20 space-y-2 animate-fadeIn">
            {agent.parameters.map((param) => (
              <div key={param.id} className="flex items-center justify-between">
                <span className="text-white/40 text-sm">{param.label}</span>
                <input
                  type="text"
                  defaultValue={param.value}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm w-32 text-right focus:outline-none focus:border-white/15"
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <span>{agent.sites.length} sources</span>
            <span>{agent.estimatedTime}</span>
          </div>

          <button
            onClick={onLaunch}
            disabled={isLaunching}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
              ${isLaunching
                ? 'bg-white/10 text-white/50 cursor-wait'
                : 'bg-white/15 hover:bg-white/25 text-white'
              }
            `}
          >
            {isLaunching ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                Launch
                <span className="text-lg">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DIRECTION 2: AMBIENT (SIRI-LIKE) — WITH PROGRESSIVE REVEAL
// Mino is a presence, not a search box. Tap an intent, reveal inputs, deploy.
// =============================================================================

interface AgentConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  inputs: AgentInput[];
}

interface AgentInput {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}

const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'car',
    label: 'Find me a car',
    icon: '🚗',
    color: 'emerald',
    inputs: [
      { id: 'make', label: 'Make', placeholder: 'Honda, Toyota...', defaultValue: 'Honda' },
      { id: 'model', label: 'Model', placeholder: 'Civic, Camry...', defaultValue: 'Civic' },
      { id: 'budget', label: 'Max Price', placeholder: '$25,000', defaultValue: '$25,000' },
      { id: 'miles', label: 'Max Miles', placeholder: '50,000', defaultValue: '50,000' },
    ],
  },
  {
    id: 'dinner',
    label: 'Book dinner',
    icon: '🍽️',
    color: 'orange',
    inputs: [
      { id: 'cuisine', label: 'Cuisine', placeholder: 'Italian, Japanese...', defaultValue: 'Italian' },
      { id: 'time', label: 'Time', placeholder: '7:00 PM', defaultValue: '7:00 PM' },
      { id: 'party', label: 'Party size', placeholder: '2', defaultValue: '2' },
    ],
  },
  {
    id: 'prices',
    label: 'Compare prices',
    icon: '💰',
    color: 'purple',
    inputs: [
      { id: 'product', label: 'Product', placeholder: 'AirPods Pro, iPhone...', defaultValue: 'AirPods Pro' },
      { id: 'condition', label: 'Condition', placeholder: 'New, Used', defaultValue: 'New' },
    ],
  },
  {
    id: 'leads',
    label: 'Find leads',
    icon: '💼',
    color: 'blue',
    inputs: [
      { id: 'title', label: 'Title', placeholder: 'CFO, CTO...', defaultValue: 'CFO' },
      { id: 'industry', label: 'Industry', placeholder: 'Hospitality, Tech...', defaultValue: 'Hospitality' },
      { id: 'region', label: 'Region', placeholder: 'DFW, Austin...', defaultValue: 'DFW' },
    ],
  },
];

interface RecentRun {
  id: string;
  title: string;
  status: 'working' | 'completed' | 'watching';
  time: string;
  icon: string;
  color: string;
}

const INITIAL_RECENT: RecentRun[] = [
  { id: '1', title: 'Honda Civic search', status: 'completed', time: '3 hrs ago', icon: '🚗', color: 'emerald' },
  { id: '2', title: 'Lucia reservation', status: 'completed', time: 'Confirmed for tonight', icon: '🍽️', color: 'orange' },
  { id: '3', title: 'AirPods Pro price', status: 'watching', time: 'Watching for drops', icon: '💰', color: 'purple' },
];

function AmbientExploration() {
  // States: 'idle' | 'selecting' | 'configuring' | 'deploying'
  const [mode, setMode] = useState<'idle' | 'selecting' | 'configuring' | 'deploying'>('idle');
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>(INITIAL_RECENT);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-[0_0_40px_rgba(249,115,22,0.3)]' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]' },
    };
    return colors[color] || colors.emerald;
  };

  const handleOrbClick = () => {
    if (mode === 'idle') {
      // Activate - show agent options
      setMode('selecting');
    } else if (mode === 'selecting') {
      // Deactivate - go back to idle
      setMode('idle');
    } else if (mode === 'configuring' && selectedAgent) {
      // Deploy the agent
      handleDeploy();
    }
  };

  const handleAgentClick = (agent: AgentConfig) => {
    setSelectedAgent(agent);
    const defaults: Record<string, string> = {};
    agent.inputs.forEach(input => {
      defaults[input.id] = input.defaultValue || '';
    });
    setInputValues(defaults);
    setMode('configuring');
  };

  const handleInputChange = (inputId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [inputId]: value }));
  };

  const handleCancel = () => {
    setSelectedAgent(null);
    setInputValues({});
    setMode('selecting');
  };

  const handleDeploy = () => {
    if (!selectedAgent) return;

    setMode('deploying');

    const summary = Object.values(inputValues).filter(Boolean).slice(0, 2).join(' ');

    setTimeout(() => {
      const newRun: RecentRun = {
        id: `run-${Date.now()}`,
        title: summary || selectedAgent.label,
        status: 'working',
        time: 'Just now',
        icon: selectedAgent.icon,
        color: selectedAgent.color,
      };

      setRecentRuns(prev => [newRun, ...prev]);
      setMode('idle');
      setSelectedAgent(null);
      setInputValues({});

      // Simulate completion
      setTimeout(() => {
        setRecentRuns(prev =>
          prev.map(run =>
            run.id === newRun.id
              ? { ...run, status: 'completed' as const, time: 'Just now' }
              : run
          )
        );
      }, 3000);
    }, 1800);
  };

  const colorClasses = selectedAgent ? getColorClasses(selectedAgent.color) : null;
  const isActive = mode !== 'idle';

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 py-12">
      {/* Concept label */}
      <div className="mb-6 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs uppercase tracking-wider mb-4">
          Direction 2 — Evolved
        </span>
        <h2 className="text-3xl font-bold text-white mb-2">Tap to Reveal</h2>
        <p className="text-white/50 max-w-md">
          The orb awakens. Agents appear. Choose your mission.
        </p>
      </div>

      {/* Main interaction area */}
      <div className="relative flex flex-col items-center">

        {/* Agent options - radiate from orb when selecting */}
        <div className={`
          absolute inset-0 flex items-center justify-center pointer-events-none
          transition-all duration-500
          ${mode === 'selecting' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}>
          {AGENT_CONFIGS.map((agent, index) => {
            const angle = (index * 90) - 45; // 45°, 135°, 225°, 315°
            const radius = 140;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const agentColors = getColorClasses(agent.color);

            return (
              <button
                key={agent.id}
                onClick={() => handleAgentClick(agent)}
                disabled={mode !== 'selecting'}
                className={`
                  absolute w-20 h-20 rounded-2xl
                  flex flex-col items-center justify-center gap-1
                  ${agentColors.bg} border ${agentColors.border}
                  hover:scale-110 hover:${agentColors.glow}
                  transition-all duration-300
                  ${mode === 'selecting' ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}
                `}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  transitionDelay: mode === 'selecting' ? `${index * 50}ms` : '0ms',
                }}
              >
                <span className="text-2xl">{agent.icon}</span>
                <span className={`text-[10px] font-medium ${agentColors.text}`}>
                  {agent.label.split(' ').slice(-1)[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Central Orb - Three.js Audio Reactive */}
        <button
          onClick={handleOrbClick}
          disabled={mode === 'deploying'}
          className="relative z-10 mb-8 group"
        >
          {/* Three.js Orb */}
          <div className={`
            relative transition-transform duration-500
            ${mode === 'deploying' ? 'scale-110' : mode !== 'idle' ? 'scale-105' : 'group-hover:scale-105'}
          `}>
            <AudioOrb
              mode={mode === 'deploying' ? 'speaking' : mode === 'configuring' ? 'active' : mode === 'selecting' ? 'listening' : 'idle'}
              size={160}
              audioEnabled={mode === 'deploying'}
            />
          </div>

          {/* Overlay content - positioned over the orb */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center relative z-10">
              {mode === 'deploying' ? (
                <div className="animate-scaleIn">
                  <span className="text-4xl mb-1 block drop-shadow-lg">{selectedAgent?.icon || '✨'}</span>
                  <span className="text-cyan-300 text-xs font-medium drop-shadow-md">Deploying...</span>
                </div>
              ) : mode === 'configuring' && selectedAgent ? (
                <div className="animate-scaleIn">
                  <span className="text-4xl mb-1 block drop-shadow-lg">{selectedAgent.icon}</span>
                  <span className={`${colorClasses?.text} text-xs font-medium drop-shadow-md`}>Deploy</span>
                </div>
              ) : mode === 'selecting' ? (
                <div className="animate-scaleIn">
                  <span className="text-white/90 text-sm font-medium drop-shadow-md">Choose</span>
                  <div className="text-white/50 text-[10px] mt-0.5 drop-shadow-sm">an agent</div>
                </div>
              ) : (
                <>
                  <span className="text-white font-semibold text-lg drop-shadow-md">Mino</span>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                    <span className="text-white/60 text-xs drop-shadow-sm">Tap</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </button>

        {/* Input panel - appears when configuring */}
        {mode === 'configuring' && selectedAgent && (
          <div className={`
            w-full max-w-sm p-4 rounded-2xl
            ${colorClasses?.bg} border ${colorClasses?.border}
            animate-slideUp
          `}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <span className="text-2xl">{selectedAgent.icon}</span>
              <div>
                <h3 className={`font-semibold ${colorClasses?.text}`}>{selectedAgent.label}</h3>
                <p className="text-white/40 text-xs">Configure and deploy</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedAgent.inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-white/50 text-xs mb-1.5 ml-1">{input.label}</label>
                  <input
                    type="text"
                    value={inputValues[input.id] || ''}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/25 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handleCancel}
                className="text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                ← Back
              </button>
              <span className={`${colorClasses?.text} text-xs`}>
                Tap orb to deploy
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Runs - visible when idle, hidden when active */}
      <div className={`
        w-full max-w-sm mt-8 transition-all duration-500
        ${isActive ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}
      `}>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-white/40 text-xs uppercase tracking-wider">Recent</span>
          {recentRuns.filter(r => r.status === 'working').length > 0 && (
            <span className="text-cyan-400 text-xs">
              {recentRuns.filter(r => r.status === 'working').length} working
            </span>
          )}
        </div>
        <div className="space-y-2">
          {recentRuns.slice(0, 4).map((run) => {
            const runColors = getColorClasses(run.color);
            return (
              <div
                key={run.id}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  bg-white/[0.02] border border-white/[0.04]
                  hover:bg-white/[0.04] transition-all cursor-pointer
                  ${run.status === 'working' ? 'animate-pulse' : ''}
                `}
              >
                <span className="text-lg opacity-70">{run.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white/70 text-sm font-medium truncate">{run.title}</div>
                  <div className="text-white/40 text-xs">{run.time}</div>
                </div>
                {run.status === 'working' && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className={`${runColors.text} text-xs`}>Working</span>
                  </div>
                )}
                {run.status === 'watching' && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400/70 text-xs">Watching</span>
                  </div>
                )}
                {run.status === 'completed' && (
                  <span className="text-emerald-400/70 text-xs">Done</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Idle hint */}
      {mode === 'idle' && (
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-white/30 text-sm">
            Tap the orb to begin
          </p>
        </div>
      )}

      {/* Selecting hint */}
      {mode === 'selecting' && (
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-white/40 text-sm">
            Choose an agent • Tap orb to cancel
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMBINED: THE DISPATCHER
// Mino is the ambient intelligence that summons and deploys agents
// =============================================================================

interface DispatcherAgent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  sites: number;
  time: string;
}

const DISPATCHER_AGENTS: DispatcherAgent[] = [
  { id: 'car', name: 'Car Scout', icon: '🚗', color: 'emerald', description: 'Search dealerships & marketplaces', sites: 10, time: '~35s' },
  { id: 'table', name: 'Table Finder', icon: '🍽️', color: 'orange', description: 'Book reservations', sites: 5, time: '~12s' },
  { id: 'leads', name: 'Lead Hunter', icon: '💼', color: 'blue', description: 'Find decision makers', sites: 4, time: '~45s' },
  { id: 'price', name: 'Price Watcher', icon: '💰', color: 'purple', description: 'Compare & track prices', sites: 6, time: '~20s' },
];

interface DeployedAgent {
  id: string;
  agent: DispatcherAgent;
  status: 'deploying' | 'working' | 'complete';
  progress?: number;
  result?: string;
}

function CombinedExploration() {
  const [isActive, setIsActive] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<DispatcherAgent | null>(null);
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([]);
  const [showAgentRing, setShowAgentRing] = useState(true);

  const handleAgentSelect = (agent: DispatcherAgent) => {
    if (selectedAgent?.id === agent.id) {
      // Clicking same agent deselects
      setSelectedAgent(null);
    } else {
      setSelectedAgent(agent);
    }
  };

  const handleDeploy = () => {
    if (!selectedAgent) return;

    setIsActive(true);

    const newDeployed: DeployedAgent = {
      id: `${selectedAgent.id}-${Date.now()}`,
      agent: selectedAgent,
      status: 'deploying',
      progress: 0,
    };

    setDeployedAgents(prev => [...prev, newDeployed]);
    setShowAgentRing(false);

    // Simulate deployment phases
    setTimeout(() => {
      setDeployedAgents(prev =>
        prev.map(a => a.id === newDeployed.id ? { ...a, status: 'working', progress: 30 } : a)
      );
    }, 800);

    setTimeout(() => {
      setDeployedAgents(prev =>
        prev.map(a => a.id === newDeployed.id ? { ...a, progress: 70 } : a)
      );
    }, 1500);

    setTimeout(() => {
      setDeployedAgents(prev =>
        prev.map(a => a.id === newDeployed.id ? { ...a, status: 'complete', progress: 100, result: 'Found 8 matches' } : a)
      );
      setIsActive(false);
      setSelectedAgent(null);
      setShowAgentRing(true);
    }, 2500);
  };

  const handleOrbClick = () => {
    if (selectedAgent) {
      handleDeploy();
    } else {
      setShowAgentRing(!showAgentRing);
    }
  };

  const getAgentColor = (color: string, variant: 'bg' | 'border' | 'text' | 'glow') => {
    const colors: Record<string, Record<string, string>> = {
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
    };
    return colors[color]?.[variant] || '';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 py-12">
      {/* Concept label */}
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs uppercase tracking-wider mb-4">
          Combined Direction
        </span>
        <h2 className="text-3xl font-bold text-white mb-2">The Dispatcher</h2>
        <p className="text-white/50 max-w-md">
          Mino is the intelligence. Agents are its workers.
        </p>
      </div>

      {/* Main dispatcher area */}
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">

        {/* Agent ring - positioned around the orb */}
        {showAgentRing && (
          <div className="absolute inset-0 flex items-center justify-center">
            {DISPATCHER_AGENTS.map((agent, index) => {
              const angle = (index * 90) - 45; // Position at 45, 135, 225, 315 degrees
              const radius = 180; // Distance from center
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              const isSelected = selectedAgent?.id === agent.id;

              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className={`
                    absolute w-24 h-24 rounded-2xl
                    flex flex-col items-center justify-center gap-1
                    transition-all duration-300 cursor-pointer
                    ${isSelected
                      ? `${getAgentColor(agent.color, 'bg')} ${getAgentColor(agent.color, 'border')} border-2 scale-110 shadow-lg ${getAgentColor(agent.color, 'glow')}`
                      : 'bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15 hover:scale-105'
                    }
                  `}
                  style={{
                    transform: `translate(${x}px, ${y}px) ${isSelected ? 'scale(1.1)' : ''}`,
                  }}
                >
                  <span className="text-2xl">{agent.icon}</span>
                  <span className={`text-xs font-medium ${isSelected ? getAgentColor(agent.color, 'text') : 'text-white/70'}`}>
                    {agent.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Connection lines from selected agent to orb */}
        {selectedAgent && showAgentRing && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                <stop offset="50%" stopColor="rgba(34, 211, 238, 0.5)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
              </linearGradient>
            </defs>
            <line
              x1="50%"
              y1="50%"
              x2="50%"
              y2="50%"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Central Orb - The Dispatcher */}
        <button
          onClick={handleOrbClick}
          className="relative z-10 group"
        >
          {/* Outer glow */}
          <div className={`
            absolute inset-0 -m-8 rounded-full transition-all duration-700
            ${isActive
              ? 'bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40 blur-3xl scale-150'
              : selectedAgent
                ? `${getAgentColor(selectedAgent.color, 'bg')} blur-2xl scale-125`
                : 'bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 blur-2xl group-hover:scale-110'
            }
          `} />

          {/* Inner glow */}
          <div className={`
            absolute inset-0 -m-4 rounded-full transition-all duration-500
            ${isActive
              ? 'bg-cyan-400/30 blur-xl scale-125 animate-pulse'
              : 'bg-cyan-400/10 blur-lg'
            }
          `} />

          {/* Main orb */}
          <div className={`
            relative w-32 h-32 rounded-full flex items-center justify-center
            bg-gradient-to-br from-white/[0.15] to-white/[0.05]
            border-2 transition-all duration-500
            ${isActive
              ? 'border-cyan-400/60 scale-110'
              : selectedAgent
                ? `${getAgentColor(selectedAgent.color, 'border')} scale-105`
                : 'border-white/20 group-hover:border-white/30 group-hover:scale-105'
            }
          `}>
            {/* Rotating ring when active */}
            {isActive && (
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '3s' }} />
            )}

            {/* Center content */}
            <div className="text-center relative z-10">
              {isActive ? (
                <div className="animate-scaleIn">
                  <span className="text-3xl mb-1 block">{selectedAgent?.icon || '✨'}</span>
                  <span className="text-cyan-300 text-xs font-medium">Deploying...</span>
                </div>
              ) : selectedAgent ? (
                <div className="animate-scaleIn">
                  <span className="text-3xl mb-1 block">{selectedAgent.icon}</span>
                  <span className={`${getAgentColor(selectedAgent.color, 'text')} text-xs font-medium`}>Deploy</span>
                </div>
              ) : (
                <>
                  <span className="text-white font-semibold text-sm">MINO</span>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white/40 text-[10px]">Ready</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </button>

        {/* Deployed agents - orbiting satellites */}
        {deployedAgents.map((deployed, index) => {
          const orbitRadius = 220 + (index * 30);
          const angle = (index * 60) + (Date.now() / 50); // Slowly rotating

          return (
            <div
              key={deployed.id}
              className={`
                absolute w-16 h-16 rounded-xl
                flex flex-col items-center justify-center
                ${getAgentColor(deployed.agent.color, 'bg')}
                border ${getAgentColor(deployed.agent.color, 'border')}
                transition-all duration-500
                ${deployed.status === 'complete' ? 'opacity-80' : 'animate-pulse'}
              `}
              style={{
                transform: `translate(${Math.cos((angle * Math.PI) / 180) * orbitRadius}px, ${Math.sin((angle * Math.PI) / 180) * orbitRadius}px)`,
                zIndex: 20,
              }}
            >
              <span className="text-xl">{deployed.agent.icon}</span>
              {deployed.status === 'working' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getAgentColor(deployed.agent.color, 'bg')} transition-all duration-300`}
                    style={{ width: `${deployed.progress}%` }}
                  />
                </div>
              )}
              {deployed.status === 'complete' && (
                <span className="absolute -bottom-5 text-[10px] text-white/60 whitespace-nowrap">{deployed.result}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected agent details panel */}
      {selectedAgent && !isActive && (
        <div className={`
          mt-8 p-4 rounded-2xl max-w-sm w-full
          ${getAgentColor(selectedAgent.color, 'bg')}
          border ${getAgentColor(selectedAgent.color, 'border')}
          animate-slideUp
        `}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{selectedAgent.icon}</span>
            <div>
              <h3 className={`font-semibold ${getAgentColor(selectedAgent.color, 'text')}`}>{selectedAgent.name}</h3>
              <p className="text-white/50 text-sm">{selectedAgent.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{selectedAgent.sites} sources</span>
            <span>{selectedAgent.time}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <span className="text-white/40 text-xs">Tap the orb to deploy</span>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {!selectedAgent && deployedAgents.length === 0 && (
        <div className="mt-8 text-center animate-fadeIn">
          <p className="text-white/30 text-sm">
            Select an agent to deploy
          </p>
        </div>
      )}

      {/* Active agents summary */}
      {deployedAgents.length > 0 && !isActive && (
        <div className="mt-8 text-center animate-fadeIn">
          <p className="text-white/40 text-sm">
            {deployedAgents.filter(a => a.status === 'complete').length} agents completed •{' '}
            {deployedAgents.filter(a => a.status === 'working').length} working
          </p>
        </div>
      )}
    </div>
  );
}
