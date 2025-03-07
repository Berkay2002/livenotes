'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import MobileHeader from './MobileHeader';
import MobileSearch from './MobileSearch';
import MobileSideMenu from './MobileSideMenu';
import DocumentsList from './DocumentsList';
import DocumentEditor from './DocumentEditor';
import MobileNavBar from './MobileNavBar';
import PwaNavBar from '../pwa/PwaNavBar';
import PwaEnhancedLayout from '../pwa/PwaEnhancedLayout';
import { Loader2 } from 'lucide-react';
import { useStandaloneMode } from '../StandaloneDetector';

const MobileDocumentView: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { isStandalone } = useStandaloneMode();
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
    setCurrentDocId(docId);
    setActiveView('document');
  };

  // Create a new document
  const handleCreateDocument = () => {
    setCurrentDocId(undefined);
    setActiveView('document');
  };

  // Back to home view
  const handleBackToHome = () => {
    setActiveView('home');
    setCurrentDocId(undefined);
  };

  // Get user email safely
  const userEmail = isLoaded ? user?.primaryEmailAddress?.emailAddress : undefined;
  
  useEffect(() => {
    // Debugging log to ensure user data is available
    if (isLoaded) {
      console.log('User data loaded:', {
        hasUser: !!user,
        email: userEmail,
      });
    }
  }, [isLoaded, user, userEmail]);

  // Render loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  // Ensure we have a user
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="text-center p-6">
          <p className="text-red-500 mb-4">Please sign in to access your documents</p>
          <a 
            href="/sign-in" 
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <PwaEnhancedLayout>
      <div className="h-screen w-screen overflow-hidden relative">
        {/* Side menu (shown when menuOpen is true) */}
        {menuOpen && (
          <MobileSideMenu onClose={() => setMenuOpen(false)} />
        )}
        
        {/* Search overlay (shown when searchOpen is true) */}
        {searchOpen && (
          <MobileSearch
            onClose={() => setSearchOpen(false)}
          />
        )}
        
        {/* Main view container */}
        <div className="flex flex-col h-full">
          {/* Dynamic header based on active view */}
          <MobileHeader 
            activeView={activeView}
            openMenu={() => setMenuOpen(true)}
            openSearch={() => setSearchOpen(true)}
            goBack={handleBackToHome}
            openComments={handleOpenComments}
          />
          
          {/* Main content area */}
          <div className="flex-1 overflow-hidden">
            {activeView === 'home' ? (
              <DocumentsList 
                onOpenDoc={handleOpenDocument}
                email={userEmail}
              />
            ) : (
              <DocumentEditor 
                ref={editorRef}
              />
            )}
          </div>

          {/* Standard navigation - only visible in browser mode */}
          <div className="browser-only">
            <MobileNavBar 
              activeView={activeView}
              onChange={(view) => {
                if (view === 'document') {
                  handleCreateDocument();
                } else {
                  setActiveView(view);
                }
              }}
            />
          </div>

          {/* Enhanced PWA navigation - only visible in standalone mode */}
          <div className="pwa-only">
            <PwaNavBar 
              activeView={activeView}
              onChangeView={setActiveView}
              onOpenMenu={() => setMenuOpen(true)}
              onOpenSearch={() => setSearchOpen(true)}
              onCreateDocument={handleCreateDocument}
            />
          </div>
        </div>
      </div>
    </PwaEnhancedLayout>
  );
};

export default MobileDocumentView; 