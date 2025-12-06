'use client';

import { MinoLogo } from '@/components/icons/MinoLogo';
import { BottomNav } from '@/components/ui';

export default function AccountPage() {
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
            <h1
              className="text-2xl font-bold text-white mb-6 opacity-0 animate-slideUp"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              Account
            </h1>

            <div
              className="glass-card p-6 space-y-6 opacity-0 animate-slideUp"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              {/* Placeholder content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/70">Email</span>
                  <span className="text-white/40 text-sm">Not signed in</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/70">Plan</span>
                  <span className="text-white/40 text-sm">Free</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/70">Searches today</span>
                  <span className="text-white/40 text-sm">0 / 10</span>
                </div>
              </div>

              <button
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-sm font-medium transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Settings section */}
            <h2
              className="text-lg font-bold text-white mt-8 mb-4 opacity-0 animate-slideUp"
              style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
            >
              Settings
            </h2>

            <div
              className="glass-card p-6 space-y-4 opacity-0 animate-slideUp"
              style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-between py-2">
                <span className="text-white/70 text-sm">Dark mode</span>
                <span className="text-white/40 text-xs">Always on</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-white/70 text-sm">Notifications</span>
                <span className="text-white/40 text-xs">Coming soon</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
