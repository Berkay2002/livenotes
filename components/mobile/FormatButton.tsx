import React from 'react';

interface FormatButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
}

const FormatButton: React.FC<FormatButtonProps> = ({ 
  icon, 
  tooltip,
  onClick
}) => {
  return (
    <button 
      className="min-w-8 h-8 rounded-md flex items-center justify-center text-white bg-dark-300 hover:bg-dark-400 font-medium text-sm"
      title={tooltip}
      onClick={onClick}
    >
      {icon}
    </button>
  );
};

export default FormatButton;