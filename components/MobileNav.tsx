'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText, Users, Plus, Star, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddDocumentBtn from './AddDocumentBtn';
import { useUser } from '@clerk/nextjs';

// Mobile navigation that matches app theme
export default function MobileNav() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  
  // Skip on document pages or if user not loaded
  if (pathname.includes('/documents/') || !isLoaded) return null;
  
  // Extract user information
  const userId = user?.id || '';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-200 border-t border-dark-400 shadow-lg backdrop-blur-sm">
      {/* Extra div to ensure no content shows behind navbar */}
      <div className="absolute inset-x-0 -top-2 h-2 bg-dark-200 blur-sm"></div>
      
      <div className="flex items-center justify-around h-16">
        <Link href="/" className={cn(
          "flex flex-col items-center justify-center p-1 rounded-md transition-colors",
          pathname === '/' ? "text-accent-primary" : "text-gray-400 hover:text-gray-300"
        )}>
          <FileText size={20} />
          <span className="text-[10px] mt-1 font-medium">My Docs</span>
        </Link>
        
        <Link href="/shared" className={cn(
          "flex flex-col items-center justify-center p-1 rounded-md transition-colors",
          pathname === '/shared' ? "text-accent-primary" : "text-gray-400 hover:text-gray-300"
        )}>
          <Users size={20} />
          <span className="text-[10px] mt-1 font-medium">Shared</span>
        </Link>
        
        {/* Add document button with proper functionality */}
        <div className="relative -mt-5">
          {userId && email && (
            <AddDocumentBtn 
              userId={userId}
              email={email}
              isMobile={true}
              className="w-14 h-14 border-4 border-dark-200"
            />
          )}
        </div>
        
        <Link href="/starred" className={cn(
          "flex flex-col items-center justify-center p-1 rounded-md transition-colors",
          pathname === '/starred' ? "text-accent-primary" : "text-gray-400 hover:text-gray-300"
        )}>
          <Star size={20} />
          <span className="text-[10px] mt-1 font-medium">Starred</span>
        </Link>
        
        <Link href="/settings" className={cn(
          "flex flex-col items-center justify-center p-1 rounded-md transition-colors",
          pathname === '/settings' ? "text-accent-primary" : "text-gray-400 hover:text-gray-300"
        )}>
          <Settings size={20} />
          <span className="text-[10px] mt-1 font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
} 