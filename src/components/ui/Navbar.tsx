'use client';

import { MinoLogo } from '@/components/icons/MinoLogo';
import { MapPinIcon, UserIcon } from '@/components/icons';

interface NavbarProps {
  showSearch?: boolean;
  searchContent?: React.ReactNode;
}

export function Navbar({ showSearch = false, searchContent }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient background for seamless blend */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628]/98 to-transparent pointer-events-none" />

      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <MinoLogo className="h-5" />
          </div>

          {/* Center: Search (absolutely centered) */}
          <div className={`
            absolute left-1/2 -translate-x-1/2 transition-all duration-300
            ${showSearch ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
          `}>
            {searchContent}
          </div>

          {/* Right: Location + Profile */}
          <div className="flex items-center gap-1">
            {/* Location indicator */}
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
              title="Location"
            >
              <MapPinIcon className="w-4 h-4 text-white/60" />
              <span className="text-white/70 text-xs font-medium">Dallas</span>
            </button>

            {/* Profile */}
            <button
              className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
              title="Account"
            >
              <UserIcon className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
