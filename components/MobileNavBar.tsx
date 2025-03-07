'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText, Users, Star, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddDocumentBtn from './AddDocumentBtn';
import { useEffect } from 'react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface MobileNavBarProps {
  email: string;
  userId: string;
}

// Single navigation item component
const NavItem = ({ href, icon, label, active }: NavItemProps) => (
  <Link 
    href={href}
    className={cn(
      "flex flex-col items-center justify-center p-1 rounded-md transition-colors", 
      active ? "text-accent-primary" : "text-gray-400 hover:text-gray-300"
    )}
  >
    <div className="w-6 h-6 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </Link>
);

const MobileNavBar = ({ email, userId }: MobileNavBarProps) => {
  const pathname = usePathname();
  
  // Debug logging
  useEffect(() => {
    console.log('MobileNavBar props:', { email, userId, pathname });
    console.log('Window width:', window.innerWidth);
    
    // Check if we're in a mobile viewport
    const isMobileView = window.innerWidth < 768;
    console.log('Is mobile view:', isMobileView);
  }, [email, userId, pathname]);

  // Only hide in document view
  if (pathname.includes('/documents/')) {
    console.log('MobileNavBar hidden: in document view');
    return null;
  }

  // Bottom navigation bar styling
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-200 border-t border-dark-400 shadow-lg">
      <div className="flex items-center justify-around px-2 h-16 relative">
        {/* Left Section */}
        <div className="flex items-center justify-center space-x-6 w-1/3">
          <NavItem 
            href="/"
            icon={<FileText size={20} />}
            label="My Docs"
            active={pathname === '/'}
          />
          <NavItem 
            href="/shared"
            icon={<Users size={20} />}
            label="Shared"
            active={pathname === '/shared'}
          />
        </div>
        
        {/* Middle - Add Button */}
        <div className="w-1/3 flex justify-center">
          <div className="-mt-5">
            <AddDocumentBtn 
              userId={userId}
              email={email}
              isMobile={true}
              className="w-14 h-14 border-4 border-dark-200 shadow-lg"
            />
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center justify-center space-x-6 w-1/3">
          <NavItem 
            href="/starred"
            icon={<Star size={20} />}
            label="Starred"
            active={pathname === '/starred'}
          />
          <NavItem 
            href="/settings"
            icon={<Settings size={20} />}
            label="Settings"
            active={pathname === '/settings'}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileNavBar; 