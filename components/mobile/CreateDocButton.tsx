import React from 'react';
import { Plus } from 'lucide-react';

interface CreateDocButtonProps {
  onClick: () => void;
}

const CreateDocButton: React.FC<CreateDocButtonProps> = ({ onClick }) => {
  return (
    <button 
      className="bg-accent-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-dark-200"
      onClick={onClick}
      aria-label="Create new document"
    >
      <Plus size={26} color="white" strokeWidth={3} />
    </button>
  );
};

export default CreateDocButton;