'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Sidebar } from './Sidebar';

interface SidebarContextType {
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isOpen: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
  email?: string;
}

export const SidebarProvider = ({ children, email }: SidebarProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SidebarContext.Provider value={{ toggleSidebar, closeSidebar, isOpen }}>
      <Sidebar isOpen={isOpen} onClose={closeSidebar} email={email} />
      {children}
    </SidebarContext.Provider>
  );
}; 