'use client';

import React from 'react';
import { X, Home, FileText, Share } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

interface MobileSideMenuProps {
  onClose: () => void;
}

const MobileSideMenu: React.FC<MobileSideMenuProps> = ({ onClose }) => {
  // Get actual user data from Clerk
  const { user, isLoaded } = useUser();
  
  // Compute user display information
  const userName = isLoaded && user ? `${user.firstName} ${user.lastName}` : 'Loading...';
  const userEmail = isLoaded && user ? user.emailAddresses[0]?.emailAddress : '';
  const userAvatar = isLoaded && user ? user.imageUrl : '/api/placeholder/40/40';
  
  return (
    <div className="fixed inset-0 z-20 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="w-4/5 max-w-xs h-full bg-dark-200 p-5 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-end mb-6">
          <button onClick={onClose} className="p-2">
            <X size={20} className="text-white" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-accent-primary flex items-center justify-center">
            <Image 
              src={userAvatar} 
              alt={userName}
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div>
            <h3 className="text-white font-medium">{userName}</h3>
            <p className="text-gray-400 text-sm">{userEmail}</p>
          </div>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            <li>
              <a href="/" className="flex items-center gap-3 p-3 rounded-lg bg-dark-300 text-white">
                <Home size={20} />
                <span>My Documents</span>
              </a>
            </li>
            <li>
              <a href="/recent" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white">
                <FileText size={20} />
                <span>Recent Documents</span>
              </a>
            </li>
            <li>
              <a href="/shared" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white">
                <Share size={20} />
                <span>Shared with Me</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="border-t border-dark-400 pt-4 mt-4">
          <a href="/sign-out" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sign Out</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileSideMenu;