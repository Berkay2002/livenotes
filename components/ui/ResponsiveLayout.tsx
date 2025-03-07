'use client';

import React, { useEffect, useState } from 'react';
import MobileApp from '@/components/mobile/MobileApp';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  // Server-side rendering safety - start with desktop view
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if screen width is less than 768px (tablet/mobile)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Return mobile UI for small screens, or pass through children (desktop) for larger screens
  return isMobile ? <MobileApp /> : children;
}