import React from 'react';

interface NavBarButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavBarButton: React.FC<NavBarButtonProps> = ({ 
  icon, 
  label, 
  isActive, 
  onClick 
}) => {
  return (
    <button 
      className="flex flex-col items-center justify-center py-2"
      onClick={onClick}
    >
      <div className={`mb-1 transition-colors duration-200 ${isActive ? 'text-accent-primary' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-xs font-medium transition-colors duration-200 ${isActive ? 'text-accent-primary' : 'text-gray-500'}`}>
        {label}
      </span>
    </button>
  );
};

export default NavBarButton;