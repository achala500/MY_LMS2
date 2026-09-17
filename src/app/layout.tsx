import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider, ConnectedHeader } from "@/context/AppContext";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MouseReactiveEffect } from "@/components/effects/MouseReactiveEffect";
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#fef8f4",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "StudySync � The Atelier | Sri Lanka A/L Learning Space",
  description:
    "An editorial, distraction-free learning space for Sri Lanka G.C.E. Advanced Level (A/L) students, instructors, and examiners.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark font-sans" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,6..72,300..800;1,6..72,300..800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Anti-Crash & Auto-Recovery Inline Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Ensure light/warm paper theme
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              } catch (e) {}

              if (typeof window !== 'undefined') {
                // One-time service worker unregistration & legacy cache cleanup
                try {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      for (var i = 0; i < regs.length; i++) {
                        regs[i].unregister();
                      }
                    }).catch(function() {});
                  }
                  if ('caches' in window && !window.sessionStorage.getItem('__studysync_cache_cleared')) {
                    caches.keys().then(function(keys) {
                      for (var j = 0; j < keys.length; j++) {
                        caches.delete(keys[j]);
                      }
                      window.sessionStorage.setItem('__studysync_cache_cleared', '1');
                    }).catch(function() {});
                  }
                } catch (e) {}
              }
            `,
          }}
        />
      </head>
      <body className="min-h-[100dvh] bg-[#fef8f4] text-[#1d1b19] antialiased selection:bg-[#C85A32]/20 selection:text-[#C85A32] flex flex-col font-sans relative">
        {/* Firebase Compat SDK */}
        <Script
          src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"
          strategy="beforeInteractive"
        />
        <Script id="firebase-init" strategy="afterInteractive">
          {`
            const firebaseConfig = {
              apiKey: "AIzaSyAjK2y49ia3YnDY3L1bMhwasAQGRikvAHA",
              authDomain: "studysync-al-2026.firebaseapp.com",
              projectId: "studysync-al-2026",
              storageBucket: "studysync-al-2026.firebasestorage.app",
              messagingSenderId: "99176264496",
              appId: "1:99176264496:web:1a6a69567c0f7619a98ef5"
            };
            if (typeof window !== 'undefined' && typeof window.firebase !== 'undefined' && window.firebase.initializeApp) {
              if (!window.firebase.apps || !window.firebase.apps.length) {
                window.firebase.initializeApp(firebaseConfig);
              }
            }
          `}
        </Script>

        <GlobalErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={200}>
              <AuthProvider>
                <AppProvider>
                  <AuroraBackground>
                    {/* Mouse Pointer Reactive Effect (Fine Desktop Only, Zero CPU Leak) */}
                    <MouseReactiveEffect />

                    {/* Global Navigation Header (<Header />) */}
                    <ConnectedHeader />

                    {/* Main Application Content */}
                    <main className="flex-1 relative z-10 flex flex-col">{children}</main>

                    {/* Global Footer */}
                    <Footer />
                  </AuroraBackground>

                  {/* Sonner Toast Notifications */}
                  <Toaster position="top-right" richColors />
                </AppProvider>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
