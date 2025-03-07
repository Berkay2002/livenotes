'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { 
  FileText, 
  Users, 
  Star, 
  Clock, 
  Trash, 
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  count?: number;
}

const NavItem = ({ href, icon, label, active, onClick, count }: NavItemProps) => (
  <Link 
    href={href} 
    className={cn(
      "flex items-center gap-3 px-4 py-3 text-gray-300 rounded-md transition-colors",
      active ? "bg-accent-primary/10 text-accent-primary" : "hover:bg-dark-300 hover:text-white"
    )}
    onClick={onClick}
  >
    <div className="text-current">{icon}</div>
    <span className="flex-1 font-medium text-current">{label}</span>
    {count !== undefined && (
      <span className="text-xs bg-dark-300 text-gray-400 px-2 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </Link>
);

export const Sidebar = ({ isOpen, onClose, email }: SidebarProps) => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop with animation - desktop only */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity z-40 hidden md:block",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      
      {/* Sidebar with slide animation */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full bg-dark-200 shadow-xl z-50 w-[280px] transition-transform duration-300 ease-in-out transform border-r border-dark-400 hidden md:block",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with app name */}
          <div className="py-5 px-6 border-b border-dark-400 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">LiveNotes</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-dark-300 text-gray-400 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          {/* Navigation links */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <NavItem 
              href="/" 
              icon={<FileText size={18} />} 
              label="My Documents" 
              active={pathname === '/'} 
              onClick={onClose}
            />
            <NavItem 
              href="/shared" 
              icon={<Users size={18} />} 
              label="Shared with me" 
              active={pathname === '/shared'} 
              onClick={onClose}
            />
            <NavItem 
              href="/starred" 
              icon={<Star size={18} />} 
              label="Starred" 
              active={pathname === '/starred'} 
              onClick={onClose}
              count={0}
            />
            <NavItem 
              href="/recent" 
              icon={<Clock size={18} />} 
              label="Recent" 
              active={pathname === '/recent'} 
              onClick={onClose}
            />
            
            <div className="pt-4 mt-4 border-t border-dark-400">
              <NavItem 
                href="/trash" 
                icon={<Trash size={18} />} 
                label="Trash" 
                active={pathname === '/trash'} 
                onClick={onClose}
              />
              <NavItem 
                href="/settings" 
                icon={<Settings size={18} />} 
                label="Settings" 
                active={pathname === '/settings'} 
                onClick={onClose}
              />
            </div>
          </nav>
          
          {/* User section with Clerk UserButton */}
          <div className="p-4 border-t border-dark-400">
            <div className="flex items-center px-4 py-3 rounded-md bg-dark-300">
              <div className="flex-shrink-0 mr-3">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-8"
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {email ? email.split('@')[0] : "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 