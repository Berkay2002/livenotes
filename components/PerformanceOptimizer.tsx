'use client';

import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Optimize font loading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    }

    // Add connection preloading to improve initial load
    const preconnectUrls = [
      'https://img.clerk.com', // Clerk images
      'https://api.liveblocks.io', // Liveblocks API
    ];

    preconnectUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical assets
    const criticalAssets = [
      '/assets/icons/doc.svg',
      '/assets/images/empty-documents.png'
    ];

    criticalAssets.forEach(asset => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = asset;
      preloadLink.as = asset.endsWith('.svg') ? 'image' : 'image';
      preloadLink.type = asset.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
      document.head.appendChild(preloadLink);
    });

    // Enable priority hints for images
    setTimeout(() => {
      const importantImages = document.querySelectorAll('img[loading="eager"]');
      importantImages.forEach(img => {
        // @ts-ignore - fetchpriority is a newer attribute
        img.fetchPriority = 'high';
      });
    }, 0);

    // Optimize third-party scripts
    const deferScripts = () => {
      const nonCriticalScripts = Array.from(document.querySelectorAll('script')).filter(script => {
        return !script.hasAttribute('type') || script.getAttribute('type') === 'text/javascript';
      });
      
      nonCriticalScripts.forEach(script => {
        if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
          script.setAttribute('defer', '');
        }
      });
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', deferScripts);
    } else {
      deferScripts();
    }

    // Report web vitals to Sentry
    if ('addEventListener' in window) {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Log metrics for debugging
          console.log(`${entry.name}: ${entry.startTime}ms`);
          
          // Send to Sentry as a custom event
          if (window.Sentry) {
            window.Sentry.captureMessage(`Web Vital: ${entry.name}`, {
              level: 'info',
              extra: {
                metric: entry.name,
                value: entry.name === 'CLS' ? (entry as any).value : entry.startTime,
                url: window.location.href
              }
            });
          }
        }
      });
      
      // Observe all relevant metrics
      observer.observe({ 
        type: 'paint', 
        buffered: true 
      });
      
      // Also observe LCP, CLS, and other core web vitals
      if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`LCP: ${lastEntry.startTime}ms`);
          
          if (window.Sentry) {
            window.Sentry.captureMessage('LCP observed', {
              level: 'info',
              extra: {
                metric: 'LCP',
                value: lastEntry.startTime,
                element: (lastEntry as any).element?.tagName || 'unknown',
                url: window.location.href
              }
            });
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    }
  }, []);

  return null;
}

// Declare Sentry type for TypeScript
declare global {
  interface Window {
    Sentry?: {
      captureMessage: (message: string, options?: any) => void;
    };
  }
} 