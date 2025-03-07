'use client';

import { useSidebar } from '@/components/SidebarProvider';

export const HamburgerButton = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <button 
      onClick={toggleSidebar}
      className="hidden md:flex flex-col justify-center items-center w-12 h-12 mr-2 hover:bg-dark-300 rounded-md transition-colors"
      aria-label="Toggle sidebar"
    >
      <span className="w-5 h-0.5 bg-gray-300 mb-1.5"></span>
      <span className="w-5 h-0.5 bg-gray-300 mb-1.5"></span>
      <span className="w-5 h-0.5 bg-gray-300"></span>
    </button>
  );
}; 