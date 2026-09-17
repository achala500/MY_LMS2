import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#f8f2ef] border-t border-[#e7e1de] mt-auto transition-colors">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-serif text-sm font-semibold text-[#1d1b19]">StudySync</span>
          <span className="w-1 h-1 rounded-full bg-[#dec0b7]" />
          <span className="text-[#2d2420]">Sri Lanka G.C.E. Advanced Level Academic Companion</span>
        </div>

        <div className="flex items-center gap-4 text-[#2d2420]">
          <Link
            href="/verify"
            className="flex items-center gap-1.5 text-[#2d2420] hover:text-[#1d1b19] transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#456644]" />
            <span>Verify Student Pass</span>
          </Link>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#456644] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#456644]" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider">Colombo Systems Active</span>
          </div>
          <span>•</span>
          <span className="font-mono text-[11px] text-[#4a3b35]">2026 Cohort</span>
        </div>

        <div className="text-[#4a3b35] font-mono text-[11px]">
          © 2026 StudySync Sri Lanka. Mindful Academic Clarity.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
