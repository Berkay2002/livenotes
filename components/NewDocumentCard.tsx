'use client';

import { Plus } from 'lucide-react';
import AddDocumentBtn from './AddDocumentBtn';

interface NewDocumentCardProps {
  userId: string;
  email: string;
}

const NewDocumentCard = ({ userId, email }: NewDocumentCardProps) => {
  return (
    <div className="flex h-[230px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-dark-400 bg-dark-200 p-5 transition-colors hover:border-accent-primary/50 hover:bg-dark-300">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dark-300">
        <Plus className="h-6 w-6 text-accent-primary" />
      </div>
      <h3 className="mb-2 text-center text-lg font-medium text-white">Create New Document</h3>
      <p className="mb-4 text-center text-sm text-gray-400">Start with a blank page</p>
      <AddDocumentBtn 
        userId={userId}
        email={email}
      />
    </div>
  );
};

export default NewDocumentCard;