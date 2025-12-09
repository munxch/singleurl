'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SearchIcon, ListIcon, UserIcon } from '@/components/icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  matchPaths: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'search',
    label: 'Search',
    icon: SearchIcon,
    href: '/',
    matchPaths: ['/', '/search'],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: ListIcon,
    href: '/jobs',
    matchPaths: ['/jobs'],
  },
  {
    id: 'account',
    label: 'Account',
    icon: UserIcon,
    href: '/account',
    matchPaths: ['/account', '/settings'],
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    return item.matchPaths.some(path => {
      if (path === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(path);
    });
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="px-2 py-2 flex items-center gap-1 rounded-2xl bg-slate-950 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center justify-center p-3 rounded-xl
                transition-all duration-200
                ${active
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
