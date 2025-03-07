import React, { useState, useRef } from 'react';
import MobileHeader from './MobileHeader';
import MobileSearch from './MobileSearch';
import MobileSideMenu from './MobileSideMenu';
import DocumentsList from './DocumentsList';
import DocumentEditor from './DocumentEditor';
import MobileNavBar from './MobileNavBar';

const MobileApp: React.FC = () => {
  const [activeView, setActiveView] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Reference to the document editor component for comment functionality
  const editorRef = useRef<{ openComments: () => void } | null>(null);
  
  // Function to open comments from header
  const handleOpenComments = () => {
    if (editorRef.current) {
      editorRef.current.openComments();
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-dark-100 overflow-hidden">
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
        <MobileSearch onClose={() => setSearchOpen(false)} />
      )}
      
      {/* Mobile Side Menu */}
      {menuOpen && (
        <MobileSideMenu onClose={() => setMenuOpen(false)} />
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pb-16">
        {activeView === 'home' && <DocumentsList onOpenDoc={() => setActiveView('document')} />}
        {activeView === 'document' && <DocumentEditor ref={editorRef} />}
      </main>
      
      {/* Bottom Navigation Bar */}
      <MobileNavBar 
        activeView={activeView}
        onChange={setActiveView}
      />
    </div>
  );
};

export default MobileApp;