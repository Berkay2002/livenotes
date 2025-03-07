'use client';

import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';

interface SidebarWrapperProps {
  children: React.ReactNode;
  email?: string;
}

export const SidebarWrapper = ({ children, email }: SidebarWrapperProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // In this simplified approach, we're expecting the Header to use the provided context
  // instead of trying to clone and modify it directly

  return (
    <>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        email={email}
      />
      <div className="sidebar-toggle-context" data-sidebar-toggle={toggleSidebar}>
        {children}
      </div>
    </>
  );
}; 