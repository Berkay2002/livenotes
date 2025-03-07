'use client';

import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

/**
 * Responsive layout wrapper
 * Ensures proper spacing for mobile navigation
 */
export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className="w-full h-full min-h-screen relative">
      {/* Main content area with proper bottom padding on mobile */}
      <div className="w-full pb-safe">
        {children}
      </div>
      
      {/* Extra space to ensure content doesn't scroll behind the navbar on mobile */}
      <div className="h-20 md:h-0 w-full" />
    </div>
  );
}