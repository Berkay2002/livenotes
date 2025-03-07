'use client';

import { useStandaloneMode } from './StandaloneDetector';

interface PwaAwareComponentProps {
  children?: React.ReactNode;
}

/**
 * Example component that uses the tailwindcss-displaymodes utility classes
 * to create different UI based on whether it's in PWA mode or not
 */
export function PwaAwareComponent({ children }: PwaAwareComponentProps) {
  // Optional: use hook if you need programmatic detection
  const { isStandalone } = useStandaloneMode();

  return (
    <div>
      {/* 
        Using the displaymodes Tailwind classes:
        - display-mode:standalone - shows only in PWA mode
        - display-mode:browser - shows only in browser mode
      */}
      <div className="display-mode:standalone:block hidden rounded-lg bg-emerald-100 p-4 text-emerald-800 shadow-lg border border-emerald-200 mb-4">
        <h3 className="font-bold text-lg">PWA Mode Active!</h3>
        <p>You&apos;re using the app in standalone PWA mode. Enjoy the optimized experience!</p>
      </div>

      <div className="display-mode:browser:block hidden rounded-lg bg-blue-100 p-4 text-blue-800 shadow-lg border border-blue-200 mb-4">
        <h3 className="font-bold text-lg">Browser Mode</h3>
        <p>Install this app to your device for the best experience!</p>
      </div>

      {/* You can also conditionally render based on the hook if needed */}
      {isStandalone && (
        <div className="bg-purple-100 p-4 text-purple-800 rounded-lg shadow-lg border border-purple-200 mb-4">
          <p>This is rendered programmatically based on the isStandalone hook.</p>
        </div>
      )}

      {/* Regular content */}
      {children}
    </div>
  );
} 