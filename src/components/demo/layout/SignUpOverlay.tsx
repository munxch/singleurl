'use client';

import React, { useEffect, useState } from 'react';
import { MinoLogo } from '@/components/icons/MinoLogo';

interface SignUpOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
}

/**
 * Standard sign-up overlay modal for demo pages.
 */
export function SignUpOverlay({
  isOpen,
  onClose,
  title = 'Sign up for Mino',
  subtitle = 'Save your results, get alerts, and more',
}: SignUpOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div className={`relative w-full max-w-md p-6 rounded-2xl bg-[#0a1628] border border-white/20 shadow-2xl transition-all duration-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <MinoLogo className="h-8" />
          </div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-white/50 text-sm mt-1">{subtitle}</p>
        </div>

        <div className="space-y-3">
          {/* Google OAuth */}
          <button className="w-full py-3 px-4 rounded-xl bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Email */}
          <button className="w-full py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors flex items-center justify-center gap-2 border border-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Continue with Email
          </button>
        </div>

        <p className="text-white/30 text-xs text-center mt-4">
          By signing up, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}
