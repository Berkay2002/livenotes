'use client';

import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

/**
 * Responsive layout wrapper
 * With our new responsive approach, we don't need separate components
 * Each page handles its own responsive behavior
 */
export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}