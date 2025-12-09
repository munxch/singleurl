'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusIcon, GridIcon, MenuIcon, XIcon } from '@/components/icons';
import { MinoLogo } from '@/components/icons/MinoLogo';

// Sample recent queries for demo - links to completed state
const RECENT_QUERIES = [
  { id: '1', query: 'CFOs at hospitality companies in DFW', href: '/demo/cfo-search-cascade?view=results' },
  { id: '2', query: 'Italian restaurants for date night in Dallas', href: '/demo/date-night-cascade?view=results' },
  { id: '3', query: '2024 Lexus GX Overtrail in Dallas', href: '/demo/car-search-cascade?view=results' },
];

interface SidebarProps {
  onSignUp?: () => void;
}

export function Sidebar({ onSignUp }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: <PlusIcon className="w-5 h-5" />, label: 'New Search', href: '/' },
    { icon: <GridIcon className="w-5 h-5" />, label: 'Explore', href: '/explore' },
  ];

  return (
    <>
      {/* Hamburger trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 left-4 z-50 p-2 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all"
      >
        <MenuIcon className="w-4 h-4 text-white/70" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding panel */}
      <aside
        className={`fixed top-3 left-3 bottom-3 w-72 bg-[#0c1525]/95 backdrop-blur-md border border-white/10 rounded-2xl z-50 transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+24px)] opacity-0'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header with logo and close button */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <MinoLogo className="h-4" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <XIcon className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-4" />

          {/* Main nav */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent my-4" />

          {/* Recents */}
          <div>
            <div className="px-3 mb-2">
              <span className="text-white/40 text-xs uppercase tracking-wider">Recents</span>
            </div>
            <nav className="space-y-0.5">
              {RECENT_QUERIES.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-xl transition-colors truncate text-sm ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {item.query}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sign up CTA card */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
            <img src="/tinyfish_logo-png.png" alt="TinyFish" className="h-5 mb-2" />
            <div className="text-white font-medium text-sm mb-1">
              Unlock the full experience
            </div>
            <div className="text-white/50 text-xs mb-3">
              Save searches, get alerts, and sync across devices
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onSignUp?.();
              }}
              className="w-full py-2 px-3 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Sign up free →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
