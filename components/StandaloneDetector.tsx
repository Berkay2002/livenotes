'use client';

import { useEffect, useState } from 'react';

interface StandaloneDetectorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that detects if the app is running in standalone mode (PWA)
 * and conditionally renders children based on the mode
 */
export function StandaloneDetector({ children, fallback }: StandaloneDetectorProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);
    setIsLoaded(true);

    // Add listener for display mode changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, []);

  // Don't render anything until we've checked the mode
  if (!isLoaded) return null;

  // If in standalone mode, render children, otherwise render fallback
  return isStandalone ? <>{children}</> : <>{fallback || children}</>;
}

/**
 * Hook to detect if the app is running in standalone mode (PWA)
 */
export function useStandaloneMode() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);
    setIsLoaded(true);

    // Add listener for display mode changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, []);

  return { isStandalone, isLoaded };
} 