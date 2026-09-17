'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="relative max-w-lg w-full text-center space-y-6">
        {/* Glow Orb */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300 shadow-inner">
          <HelpCircle className="h-4 w-4" />
          <span>Error 404 â€” Page Not Found</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            Lost in Study Space
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 rounded-xl"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/25">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Student Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
