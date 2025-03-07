'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import MobileHeader from './MobileHeader';
import MobileSearch from './MobileSearch';
import MobileSideMenu from './MobileSideMenu';
import DocumentsList from './DocumentsList';
import DocumentEditor from './DocumentEditor';
import MobileNavBar from './MobileNavBar';
import { Loader2 } from 'lucide-react';

const MobileDocumentView: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [activeView, setActiveView] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | undefined>(undefined);
  
  // Reference to the document editor component for comment functionality
  const editorRef = useRef<{ openComments: () => void } | null>(null);
  
  // Function to open comments from header
  const handleOpenComments = () => {
    if (editorRef.current) {
      editorRef.current.openComments();
    }
  };

  // Handler for opening a document
  const handleOpenDocument = (docId?: string) => {
    if (docId) {
      setCurrentDocId(docId);
      setActiveView('document');
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-100">
        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-100">
        <p className="text-white">Please sign in to view your documents.</p>
      </div>
    );
  }

  const email = user.emailAddresses[0].emailAddress;
  
  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-dark-100 overflow-hidden rounded-xl shadow-lg">
      {/* Mobile App Header */}
      <MobileHeader 
        activeView={activeView}
        openMenu={() => setMenuOpen(true)}
        openSearch={() => setSearchOpen(true)}
        goBack={() => setActiveView('home')}
        openComments={handleOpenComments}
      />
      
      {/* Mobile Search Overlay */}
      {searchOpen && (
        <MobileSearch 
          onClose={() => setSearchOpen(false)} 
        />
      )}
      
      {/* Mobile Side Menu */}
      {menuOpen && (
        <MobileSideMenu 
          onClose={() => setMenuOpen(false)}
        />
      )}
      
      {/* Main Content Area - Increase bottom padding for nav bar */}
      <main className="flex-1 overflow-auto pb-20">
        {activeView === 'home' && (
          <DocumentsList 
            onOpenDoc={handleOpenDocument} 
            email={email}
          />
        )}
        {activeView === 'document' && (
          <DocumentEditor 
            ref={editorRef}
          />
        )}
      </main>
      
      {/* Bottom Navigation Bar */}
      <MobileNavBar 
        activeView={activeView}
        onChange={setActiveView}
      />
    </div>
  );
};

export default MobileDocumentView; 