'use client';

import { createDocument } from '@/lib/actions/room.actions';
import { Button } from './ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddDocumentBtnProps {
  userId: string;
  email: string;
  isMobile?: boolean;
  className?: string;
}

const AddDocumentBtn = ({ userId, email, isMobile = false, className }: AddDocumentBtnProps) => {
  const router = useRouter();

  const addDocumentHandler = async () => {
    try {
      const room = await createDocument({ userId, email });

      if(room) router.push(`/documents/${room.id}`);
    } catch (error) {
      console.log(error)
    }
  }

  // Mobile FAB style
  if (isMobile) {
    return (
      <button 
        onClick={addDocumentHandler} 
        className={cn(
          "bg-accent-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-accent-hover transition-colors",
          className
        )}
      >
        <Plus className="h-6 w-6 text-white" />
      </button>
    );
  }

  // Desktop button style
  return (
    <Button 
      type="button" 
      onClick={addDocumentHandler} 
      className={cn(
        "flex gap-1 bg-accent-primary hover:bg-accent-hover shadow-md transition-all",
        className
      )}
    >
      <Image 
        src="/assets/icons/add.svg" alt="add" width={24} height={24}
      />
      <p className="hidden sm:block">Start a blank document</p>
    </Button>
  )
}

export default AddDocumentBtn