'use client';

import React from 'react';
import Link from 'next/link';
import { MinoLogo } from '@/components/icons/MinoLogo';
import { ArrowLeftIcon } from '@/components/icons';

interface DemoHeaderProps {
  /** Handler for restart button */
  onRestart: () => void;
  /** Back link href */
  backHref?: string;
  /** Back link text */
  backText?: string;
}

/**
 * Standard header for demo pages with back link, logo, and restart button.
 */
export function DemoHeader({
  onRestart,
  backHref = '/',
  backText = 'Back',
}: DemoHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link
        href={backHref}
        className="flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span className="text-sm">{backText}</span>
      </Link>
      <MinoLogo />
      <button
        onClick={onRestart}
        className="text-white/50 hover:text-white/70 transition-colors text-sm"
      >
        Restart
      </button>
    </header>
  );
}
