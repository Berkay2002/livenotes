'use client';

import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import React, { useState, Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react';

import { FloatingComposer, FloatingThreads, liveblocksConfig, LiveblocksPlugin, useEditorStatus } from '@liveblocks/react-lexical'
import Loader from '../Loader';

import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin'
import { useThreads } from '@liveblocks/react/suspense';
import { DeleteModal } from '../DeleteModal';
import { Thread, Composer } from '@liveblocks/react-ui';
import { MessageSquare } from 'lucide-react';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

// Custom plugin to manage paginated content
function PaginationPlugin({ children, commentSection }: { children: React.ReactNode, commentSection: React.ReactNode }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  
  // Checks if content overflows and adds new pages as needed
  const checkContentOverflow = useCallback(() => {
    if (!editorRef.current) return;
    
    const contentContainer = editorRef.current.querySelector('.editor-input');
    if (!contentContainer) return;
    
    // Get total content height
    const contentHeight = contentContainer.scrollHeight;
    
    // A4 page height minus padding (in pixels)
    const pageHeight = 1123 - 75; // A4 height in px minus padding
    
    // Calculate how many pages we need
    const neededPages = Math.max(1, Math.ceil(contentHeight / pageHeight));
    
    if (neededPages !== pageCount) {
      setPageCount(neededPages);
    }
  }, [pageCount]);
  
  // Listen for content changes
  useEffect(() => {
    const observer = new MutationObserver(checkContentOverflow);
    const resizeObserver = new ResizeObserver(checkContentOverflow);
    
    if (editorRef.current) {
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      const editorInput = editorRef.current.querySelector('.editor-input');
      if (editorInput) {
        resizeObserver.observe(editorInput);
      }
    }
    
    // Initial check
    checkContentOverflow();
    
    // Set up interval for periodic checks (helps with edge cases)
    const interval = setInterval(checkContentOverflow, 1000);
    
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [checkContentOverflow]);
  
  return (
    <div className="w-full flex justify-center">
      <div ref={editorRef} className={`a4-paper-container ${commentSection ? 'with-comments' : 'without-comments'}`}>
        {/* A4 papers column for document content */}
        <div className="a4-papers-column">
          {Array.from({ length: pageCount }).map((_, index) => (
            <div key={index} className="a4-paper">
              {index === 0 && children}
              <div className="page-number text-center text-xs text-gray-400 absolute bottom-2 right-2">
                Page {index + 1}
              </div>
            </div>
          ))}
          {/* Visual indicator that content continues on next page */}
          {pageCount > 1 && (
            <div className="text-center text-sm text-gray-500 mb-4">
              ↓ Content continues to next page ↓
            </div>
          )}
        </div>
        
        {/* Comments sidebar next to A4 paper - only render if commentSection is provided */}
        {commentSection && (
          <div className="comments-sidebar hidden md:block">
            {commentSection}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple thread display component that doesn't use useIsThreadActive
const SimpleThreadDisplay = ({ thread, className = "comment-thread-card" }: { thread: any, className?: string }) => {
  // Calculate the number of comments to show in preview (all if less than 3, otherwise first 2)
  const shouldShowAllComments = thread.comments.length <= 3;
  const commentsToShow = shouldShowAllComments ? thread.comments : thread.comments.slice(0, 2);
  const hasMoreComments = !shouldShowAllComments;
  
  return (
    <div className={className}>
      <Thread 
        thread={thread} 
        className="comment-thread"
      />
    </div>
  );
};

// Simplified comments component that doesn't use useIsThreadActive
const SimpleComments = () => {
  const { threads } = useThreads();
  
  // If threads fails to load properly, provide fallback
  const safeThreads = Array.isArray(threads) ? threads : [];
  
  return (
    <div className="comments-sidebar">
      <div className="comments-section">
        <h3>
          Comments {safeThreads.length > 0 ? `(${safeThreads.length})` : ''}
        </h3>
      </div>
      
      {safeThreads.length > 0 ? (
        <div className="comments-threads-list">
          {safeThreads.map((thread) => (
            <SimpleThreadDisplay 
              key={thread.id} 
              thread={thread} 
            />
          ))}
        </div>
      ) : (
        <div className="no-comments-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No comments yet</p>
          <span className="hint">Highlight text to add a comment</span>
        </div>
      )}
      
      {/* Fixed comment composer at the bottom */}
      <div className="comments-container" style={{ margin: 0 }}>
        <Composer className="comment-composer" style={{ margin: 0 }} />
      </div>
    </div>
  );
};

export function Editor({ 
  roomId, 
  currentUserType,
  isCommentOpen,
  setIsCommentOpen
}: { 
  roomId: string, 
  currentUserType: UserType,
  isCommentOpen: boolean,
  setIsCommentOpen: Dispatch<SetStateAction<boolean>>
}) {
  const status = useEditorStatus();
  const { threads } = useThreads();
  
  const initialConfig = liveblocksConfig({
    namespace: 'Editor',
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === 'editor',
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <LiveblocksPlugin>
        <div className="editor-container w-full">
          {/* Responsive Toolbar - Hide on mobile */}
          <div className="toolbar-wrapper hidden md:flex justify-between">
            <ToolbarPlugin />
            {currentUserType === 'editor' && <DeleteModal roomId={roomId} />}
          </div>

          <div className="editor-wrapper">
            {status === 'not-loaded' || status === 'loading' ? (
              <Loader />
            ) : (
              <>
                <PaginationPlugin
                  commentSection={
                    isCommentOpen ? <SimpleComments /> : null
                  }
                >
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable className="editor-input h-full outline-none" />
                    }
                    placeholder={<Placeholder />}
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                </PaginationPlugin>
                {currentUserType === 'editor' && <FloatingToolbarPlugin />}
                <HistoryPlugin />
                <AutoFocusPlugin />
              </>
            )}

            {/* Keep composer for adding new comments */}
            <FloatingComposer className="w-[280px] shadow-lg rounded-lg border border-dark-300" />
          </div>
        </div>
      </LiveblocksPlugin>
    </LexicalComposer>
  );
}