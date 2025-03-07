import React from 'react';
import { Home, FileText, Bell, Settings } from 'lucide-react';
import NavBarButton from './NavBarButton';
import CreateDocButton from './CreateDocButton';

interface MobileNavBarProps {
  activeView: string;
  onChange: (view: string) => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ 
  activeView, 
  onChange 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-200 border-t border-dark-400 py-1 z-10">
      {/* Create button floating above the nav bar */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6">
        <CreateDocButton onClick={() => onChange('document')} />
      </div>
      
      {/* Navigation bar with perfect symmetry */}
      <div className="grid grid-cols-4 w-full px-2">
        <NavBarButton 
          icon={<Home size={22} />} 
          label="Home"
          isActive={activeView === 'home'}
          onClick={() => onChange('home')}
        />
        <NavBarButton 
          icon={<FileText size={22} />} 
          label="Recent"
          isActive={activeView === 'recent'}
          onClick={() => onChange('recent')}
        />
        <NavBarButton 
          icon={<Bell size={22} />} 
          label="Alerts"
          isActive={activeView === 'notifications'}
          onClick={() => onChange('notifications')}
        />
        <NavBarButton 
          icon={<Settings size={22} />} 
          label="Settings"
          isActive={activeView === 'settings'}
          onClick={() => onChange('settings')}
        />
      </div>
    </div>
  );
};

export default MobileNavBar;