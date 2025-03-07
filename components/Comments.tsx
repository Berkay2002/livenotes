import { cn } from '@/lib/utils';
import { useIsThreadActive } from '@liveblocks/react-lexical';
import { Composer, Thread } from '@liveblocks/react-ui';
import { useThreads } from '@liveblocks/react/suspense';
import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

// Thread wrapper component with active state styling
const ThreadWrapper = ({ thread, isMobile = false }: ThreadWrapperProps & { isMobile?: boolean }) => {
  const isActive = useIsThreadActive(thread.id);

  if (isMobile) {
    return (
      <div className="border border-dark-400 rounded-lg my-2">
        <Thread 
          thread={thread}
          className="mobile-comment-thread"
        />
      </div>
    );
  }

  return (
    <Thread 
      thread={thread}
      data-state={isActive ? 'active' : null}
      className={cn('comment-thread border', 
        isActive && '!border-blue-500 shadow-md',
        thread.resolved && 'opacity-40'
      )}
    />
  );
};

// Mobile comment dialog component
const MobileCommentsDialog = ({ 
  isOpen, 
  onClose, 
  threads 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  threads: any[]; 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:hidden animate-in fade-in" onClick={onClose}>
      <div 
        className="fixed bottom-0 w-full max-w-lg rounded-t-xl bg-dark-200 border-t border-x border-dark-400 p-3 pb-5 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-auto"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-dark-400"></div>
        
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-medium text-white">Comments</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-dark-300 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Composer for adding new comments */}
          <div className="border border-dark-400 rounded-lg bg-dark-300 p-3">
            <Composer className="mobile-comment-composer" />
          </div>
          
          {/* Comment threads */}
          <div className="space-y-3">
            {/* Comment threads */}
            {threads.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
              </div>
            ) : (
              threads.map((thread) => (
                <ThreadWrapper key={thread.id} thread={thread} isMobile={true} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Comments component with responsive behavior
const Comments = ({ isMobileOpen = false, onMobileClose = () => {} }: CommentsProps) => {
  const { threads } = useThreads();

  return (
    <>
      {/* Desktop Comments View */}
      <div className="comments-container hidden sm:block">
        <Composer className="comment-composer" />

        {threads.map((thread) => (
          <ThreadWrapper key={thread.id} thread={thread} />
        ))}
      </div>

      {/* Mobile Comments Dialog */}
      <MobileCommentsDialog
        isOpen={isMobileOpen}
        onClose={onMobileClose}
        threads={threads}
      />
    </>
  );
};

// Types
interface ThreadWrapperProps {
  thread: any; // Using any for now, but should be properly typed
}

interface CommentsProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default Comments;