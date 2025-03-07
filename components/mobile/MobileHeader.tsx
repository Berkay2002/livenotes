import React from 'react';
import { Menu, ArrowLeft, Search, Bell, FileText, MessageCircle } from 'lucide-react';

interface MobileHeaderProps {
  activeView: string;
  openMenu: () => void;
  openSearch: () => void;
  goBack: () => void;
  openComments?: () => void; // New prop for comment functionality
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  activeView, 
  openMenu, 
  openSearch, 
  goBack,
  openComments
}) => {
  return (
    <header className="bg-dark-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md">
      <div className="flex items-center gap-3">
        {activeView === 'home' ? (
          <button onClick={openMenu} className="p-2 -ml-2">
            <Menu size={24} className="text-white" />
          </button>
        ) : (
          <button onClick={goBack} className="p-2 -ml-2">
            <ArrowLeft size={24} className="text-white" />
          </button>
        )}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <h1 className="text-white text-lg font-medium ml-2">
            {activeView === 'home' ? 'LiveDocs' : 'Document Title'}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={openSearch}
          className="w-10 h-10 flex items-center justify-center rounded-full"
        >
          <Search size={22} className="text-white" />
        </button>
        
        {/* Comment button - only show in document view */}
        {activeView === 'document' && openComments && (
          <button 
            onClick={openComments}
            className="w-10 h-10 flex items-center justify-center rounded-full"
          >
            <MessageCircle size={22} className="text-white" />
          </button>
        )}
        
        <button className="w-10 h-10 flex items-center justify-center rounded-full relative">
          <Bell size={22} className="text-white" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;