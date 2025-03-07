'use client';

import { useStandaloneMode } from '../StandaloneDetector';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PwaEnhancedLayoutProps {
  children: React.ReactNode;
}

/**
 * Enhances the layout specifically for PWA users
 * Adds PWA-specific optimizations without changing desktop experience
 */
export default function PwaEnhancedLayout({ children }: PwaEnhancedLayoutProps) {
  const { isStandalone, isLoaded } = useStandaloneMode();
  const [isInstallPromptShown, setIsInstallPromptShown] = useState(false);

  // Handle PWA-specific behaviors
  useEffect(() => {
    if (isLoaded && !isStandalone) {
      // Show install prompt for browser users who haven't installed PWA
      // Check if we've shown this in the last 7 days
      const lastPromptDate = localStorage.getItem('pwa-install-prompt-date');
      const shouldShowPrompt = !lastPromptDate || 
        (Date.now() - parseInt(lastPromptDate)) > 7 * 24 * 60 * 60 * 1000;
      
      if (shouldShowPrompt) {
        setIsInstallPromptShown(true);
        localStorage.setItem('pwa-install-prompt-date', Date.now().toString());
      }
    }
  }, [isLoaded, isStandalone]);

  return (
    <>
      {/* PWA Install Prompt - Only shown in browser mode */}
      {isInstallPromptShown && !isStandalone && (
        <div className="browser-only flex items-center justify-between fixed bottom-0 left-0 right-0 p-4 bg-indigo-600 text-white z-50">
          <p className="text-sm">Install this app for a better experience</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsInstallPromptShown(false)}
              className="text-xs px-3 py-1 bg-transparent border border-white rounded-md"
            >
              Later
            </button>
            <button 
              className="text-xs px-3 py-1 bg-white text-indigo-600 rounded-md font-medium"
              onClick={() => {
                // Close the prompt in any case
                setIsInstallPromptShown(false);
                // Here you would typically trigger the browser's install prompt
                // But it requires user interaction directly with the UI first
                alert('To install: tap the browser menu and select "Add to Home Screen" or "Install App"');
              }}
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Apply PWA-specific classes only for standalone mode */}
      <div className={cn(
        isStandalone && "pwa-standalone-mode",
        "pwa-enhanced-container"
      )}>
        {children}
      </div>
    </>
  );
} 