'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showNoise?: boolean;
}

/**
 * AuroraBackground
 * Lightweight, zero-rerender ambient layout shell for the Monoline Study Sanctuary.
 * Provides subtle micro-grid texture and warm paper background without any React state re-rendering.
 */
export function AuroraBackground({
  children,
  className,
  showNoise = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        'min-h-[100dvh] bg-[#fef8f4] text-[#1d1b19] flex flex-col antialiased selection:bg-[#c85a32]/20 selection:text-[#c85a32] relative overflow-x-hidden w-full max-w-full',
        className
      )}
    >
      {/* Subtle micro-grid texture */}
      {showNoise && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-15 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_0)] bg-[size:32px_32px]"
          aria-hidden="true"
        />
      )}

      {/* Foreground Page Content Container - Flex-1 ensures natural fit without double min-h-screen */}
      <div className="relative z-10 flex flex-1 flex-col w-full max-w-full">
        {children}
      </div>
    </div>
  );
}

export default AuroraBackground;
