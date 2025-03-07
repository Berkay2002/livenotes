'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Maximize2, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import FormatButton from './FormatButton';

// Define the ref handle type
interface DocumentEditorHandle {
  openComments: () => void;
}

// Comment type definition
interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  authorImageUrl?: string;
  text: string;
  createdAt: Date;
}

// Mock function to calculate user color based on ID
// Replace with your actual implementation from utils
const getUserColor = (userId: string): string => {
  // Basic hash function to pick a color
  const colors = ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Format date helper function
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) === 1 ? '' : 's'} ago`;
  if (diffInDays < 2) return 'Yesterday';
  if (diffInDays < 7) return `${Math.floor(diffInDays)} days ago`;
  
  return date.toLocaleDateString();
};

// Get user initials helper
const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const DocumentEditor = forwardRef<DocumentEditorHandle, {}>((props, ref) => {
  const { user, isLoaded } = useUser();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    openComments: () => {
      setCommentsOpen(true);
    }
  }));
  
  // Fetch comments function
  const fetchComments = useCallback(async (documentId: string = 'current-document-id') => {
    setIsLoadingComments(true);
    try {
      // In a real implementation, you would fetch from your API
      // const response = await fetch(`/api/documents/${documentId}/comments`);
      // const data = await response.json();
      // setComments(data);
      
      // For demonstration, we'll use mock data
      // In a real implementation, replace this with an actual API call
      setTimeout(() => {
        const mockComments: Comment[] = [
          {
            id: '1',
            authorId: 'user1',
            authorName: 'John Doe',
            authorInitials: 'JD',
            authorColor: '#2196F3',
            text: "Let's add more details to the introduction section.",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            id: '2',
            authorId: 'user2',
            authorName: 'Alice Smith',
            authorInitials: 'AS',
            authorColor: '#4CAF50',
            text: "Great work on this document! The structure looks good.",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          }
        ];
        setComments(mockComments);
        setIsLoadingComments(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setIsLoadingComments(false);
    }
  }, []);
  
  // Add comment function
  const addComment = useCallback(async () => {
    if (!commentText.trim() || !isLoaded || !user) return;
    
    try {
      // In a real implementation, you would post to your API
      // const response = await fetch(`/api/documents/${documentId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: commentText })
      // });
      // const newComment = await response.json();
      
      // For demonstration, we'll create a mock new comment
      const newComment: Comment = {
        id: Date.now().toString(),
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorInitials: getUserInitials(`${user.firstName} ${user.lastName}`),
        authorColor: getUserColor(user.id),
        authorImageUrl: user.imageUrl,
        text: commentText,
        createdAt: new Date()
      };
      
      setComments(prevComments => [newComment, ...prevComments]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }, [commentText, user, isLoaded]);
  
  // Load comments when the component mounts or comments panel opens
  useEffect(() => {
    if (commentsOpen) {
      fetchComments();
    }
  }, [commentsOpen, fetchComments]);
  
  // Hide toolbar when scrolling down (for more editing space)
  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      // Don't change toolbar visibility when comments are open
      if (commentsOpen || isKeyboardOpen) return;
      
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 10) {
        setShowToolbar(false);
      } else if (currentScrollY < lastScrollY - 10) {
        setShowToolbar(true);
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [commentsOpen, isKeyboardOpen]);

  // Handle comment submit with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addComment();
    }
  };

  // Detect keyboard visibility and editing state
  useEffect(() => {
    const detectKeyboard = () => {
      // A simple heuristic to detect if keyboard might be open on mobile
      // This isn't perfect but can work as a starting point
      const visualViewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const heightDifference = windowHeight - visualViewportHeight;
      
      // If the visual viewport is significantly smaller than window height,
      // we can assume keyboard is open
      setIsKeyboardOpen(heightDifference > 150);
    };

    // Listen to visual viewport resize events for more accurate keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', detectKeyboard);
      window.visualViewport.addEventListener('scroll', detectKeyboard);
    } else {
      window.addEventListener('resize', detectKeyboard);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', detectKeyboard);
        window.visualViewport.removeEventListener('scroll', detectKeyboard);
      } else {
        window.removeEventListener('resize', detectKeyboard);
      }
    };
  }, []);

  // Focus detection for editing state
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      // Check if the focus is within our editor area
      if (editorRef.current && editorRef.current.contains(e.target as Node)) {
        setIsEditing(true);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      // Don't set editing to false if we're focusing another element within editor
      if (editorRef.current && !editorRef.current.contains(e.relatedTarget as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      {/* Document title */}
      <div className="flex items-center justify-between px-4 py-2">
        <input 
          type="text"
          defaultValue="Document Title"
          className="bg-transparent border-b border-dark-400 focus:border-accent-primary px-0 py-1 text-white focus:outline-none"
        />
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 text-gray-400"
        >
          <Maximize2 size={20} />
        </button>
      </div>
      
      {/* Static toolbar (only visible when not editing or keyboard is closed) */}
      <div className={`toolbar-wrapper transition-all duration-300 ${
        showToolbar ? 'h-12' : 'h-0 overflow-hidden'
      } ${commentsOpen || (isKeyboardOpen && isEditing) ? 'hidden' : ''}`}>
        <div className="flex items-center gap-2 px-2 overflow-x-auto py-2 h-full">
          <FormatButton icon="B" tooltip="Bold" />
          <FormatButton icon="I" tooltip="Italic" />
          <FormatButton icon="U" tooltip="Underline" />
          <div className="h-full w-px bg-dark-400 mx-1"></div>
          <FormatButton icon="H1" tooltip="Heading 1" />
          <FormatButton icon="H2" tooltip="Heading 2" />
          <div className="h-full w-px bg-dark-400 mx-1"></div>
          <FormatButton icon="•" tooltip="Bullet list" />
          <FormatButton icon="1." tooltip="Numbered list" />
          <div className="h-full w-px bg-dark-400 mx-1"></div>
          <FormatButton icon="↩" tooltip="Undo" />
          <FormatButton icon="↪" tooltip="Redo" />
        </div>
      </div>
      
      {/* Editor area */}
      <div className="p-4 bg-dark-100 flex-1 overflow-auto" ref={editorRef}>
        <div 
          className="bg-dark-200 rounded-lg p-4 min-h-[300px] shadow-lg"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onFocus={() => setIsEditing(true)}
          onClick={() => setIsEditing(true)}
        >
          <p className="text-white">
            Tap anywhere to start editing your document...
          </p>
        </div>
      </div>
      
      {/* Floating keyboard toolbar */}
      {isKeyboardOpen && isEditing && !commentsOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-200 shadow-lg border-t border-dark-400 z-40 transition-all duration-300">
          <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto">
            <FormatButton icon="B" tooltip="Bold" />
            <FormatButton icon="I" tooltip="Italic" />
            <FormatButton icon="U" tooltip="Underline" />
            <div className="h-full w-px bg-dark-400 mx-1"></div>
            <FormatButton icon="H1" tooltip="Heading 1" />
            <FormatButton icon="H2" tooltip="Heading 2" />
            <div className="h-full w-px bg-dark-400 mx-1"></div>
            <FormatButton icon="•" tooltip="Bullet list" />
            <FormatButton icon="1." tooltip="Numbered list" />
            <div className="h-full w-px bg-dark-400 mx-1"></div>
            <FormatButton icon="↩" tooltip="Undo" />
            <FormatButton icon="↪" tooltip="Redo" />
          </div>
        </div>
      )}
      
      {/* Comments panel overlay */}
      {commentsOpen && (
        <div className="fixed inset-0 z-30 bg-dark-100 flex flex-col">
          <div className="px-4 py-3 flex items-center justify-between border-b border-dark-400">
            <h2 className="text-lg font-semibold text-white">Comments</h2>
            <button 
              onClick={() => setCommentsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-dark-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0"
                      style={{ backgroundColor: comment.authorColor }}
                    >
                      {comment.authorImageUrl ? (
                        <Image 
                          src={comment.authorImageUrl} 
                          alt={comment.authorName} 
                          width={40} 
                          height={40} 
                          className="rounded-full"
                        />
                      ) : (
                        comment.authorInitials
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="text-white font-medium">{comment.authorName}</p>
                        <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                      </div>
                      <p className="text-white">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No comments yet</p>
                <p className="text-sm mt-2">Be the first to add a comment</p>
              </div>
            )}
          </div>
          
          {/* Comment input */}
          <div className="p-4 border-t border-dark-400">
            <div className="flex bg-dark-200 rounded-lg overflow-hidden">
              <input 
                type="text" 
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none"
              />
              <button 
                className={`px-4 py-2 font-medium ${
                  commentText.trim() 
                    ? 'bg-accent-primary text-white' 
                    : 'bg-dark-300 text-gray-400'
                }`}
                onClick={addComment}
                disabled={!commentText.trim() || !isLoaded}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DocumentEditor.displayName = 'DocumentEditor';

export default DocumentEditor;