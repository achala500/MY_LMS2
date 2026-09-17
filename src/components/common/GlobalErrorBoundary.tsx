'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering condition occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[StudySync ErrorBoundary]:', error, errorInfo);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('__studysync_reload');
      }
    } catch (e) {}
  }

  private handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((k) => caches.delete(k));
          });
        }
        window.location.reload();
      }
    } catch (e) {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fef8f4] text-[#1d1b19] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-[#c85a32]/10 border border-[#c85a32]/30 flex items-center justify-center text-[#c85a32] mb-6 shadow-xs">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <span className="text-xs font-mono font-bold tracking-widest text-[#c85a32] uppercase mb-2">
            Safe Mode Active
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1d1b19] mb-3">
            Interface Restored
          </h2>

          <p className="max-w-md text-sm text-[#57423b] leading-relaxed mb-6">
            A background script encountered an unexpected condition. State has been isolated to protect your study records.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
            >
              Reload Workspace
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-full bg-[#f3ede9] hover:bg-[#ede7e3] active:scale-95 text-[#1d1b19] text-xs font-semibold transition-all duration-150"
            >
              Return Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
