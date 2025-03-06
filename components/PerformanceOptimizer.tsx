'use client';

import { useEffect } from 'react';

/**
 * PerformanceOptimizer Component
 * 
 * IMPORTANT PERFORMANCE GUIDELINES:
 * 
 * 1. WHAT TO KEEP:
 *    - Font optimization (display: swap)
 *    - Preconnect hints for third-party domains
 *    - Resource preloading for critical assets
 *    - Deferring non-critical scripts
 *    - Web Vitals monitoring
 * 
 * 2. WHAT TO AVOID:
 *    - Don't add synchronous, render-blocking scripts
 *    - Don't add large JavaScript libraries in this component
 *    - Don't remove the fetchPriority hints for critical images
 *    - Don't add heavy computations in the useEffect
 * 
 * 3. WHEN ADDING NEW FEATURES:
 *    - Use performance monitoring to measure impact
 *    - Apply lazy loading for below-the-fold content
 *    - Add new domains to preconnect list when using new third-party services
 *    - Update critical assets list when adding new key visual elements
 * 
 * This component improves Core Web Vitals by optimizing resource loading
 * without changing the visible UI. It should be kept in the root layout.
 */
export function PerformanceOptimizer() {
  useEffect(() => {
    // Optimize font loading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    }

    // Add connection preloading to improve initial load
    // IMPORTANT: Keep this list updated with all third-party domains
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
    // IMPORTANT: Keep this list updated with the most important visual assets
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
    // IMPORTANT: This helps browsers prioritize LCP images
    setTimeout(() => {
      const importantImages = document.querySelectorAll('img[loading="eager"]');
      importantImages.forEach(img => {
        // @ts-ignore - fetchpriority is a newer attribute
        img.fetchPriority = 'high';
      });
    }, 0);

    // Optimize third-party scripts
    // IMPORTANT: Keep this to ensure scripts don't block rendering
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
    // IMPORTANT: This monitoring helps identify regressions
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