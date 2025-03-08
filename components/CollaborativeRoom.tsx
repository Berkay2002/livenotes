'use client';

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, UserButton } from '@clerk/nextjs'
import ActiveCollaborators from './ActiveCollaborators';
import { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import Image from 'next/image';
import { updateDocument, toggleDocumentStar, isDocumentStarred } from '@/lib/actions/room.actions';
import Loader from './Loader';
import ShareModal from './ShareModal';
import Notifications from './Notifications';
import { ChevronLeft, MessageSquare, Send, X, MoreVertical, Star, Download, Link as LinkIcon, Info, Settings, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Share2 } from 'lucide-react';
import { Thread } from '@liveblocks/react-ui';
import { LiveblocksPlugin } from '@liveblocks/react-lexical';
import { ThreadData } from '@liveblocks/client';
import { useUser } from '@clerk/nextjs';
import CommentNotificationHandler from './CommentNotificationHandler';
import { cn } from '@/lib/utils';
import { DocumentSidebar } from './editor/DocumentSidebar';

// Sheet component mimicking shadcn/ui structure
const Sheet = ({ 
  children, 
  open, 
  onOpenChange 
}: { 
  children: React.ReactNode, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => {
  return (
    <>
      {/* Backdrop with animation */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/40 transition-opacity z-40"
          onClick={() => onOpenChange(false)}
        />
      )}
      {children}
    </>
  );
};

const SheetContent = ({ 
  children, 
  className, 
  side = "right",
  open
}: { 
  children: React.ReactNode, 
  className?: string, 
  side?: "right" | "left",
  open: boolean
}) => {
  return (
    <div className={cn(
      "fixed top-0 h-full bg-dark-200 shadow-xl z-50 w-[280px] transition-transform duration-300 ease-in-out border-l border-dark-400",
      side === "right" ? "right-0" : "left-0",
      side === "right" 
        ? (open ? "translate-x-0" : "translate-x-full")
        : (open ? "translate-x-0" : "-translate-x-full"),
      className
    )}>
      {children}
    </div>
  );
};

const SheetHeader = ({ children }: { children: React.ReactNode }) => (
  <DialogHeader>{children}</DialogHeader>
);

const SheetTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <DialogTitle className={className}>{children}</DialogTitle>
);

const SheetDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <p className={cn("text-sm text-gray-500", className)}>{children}</p>
);

// Simple separator component
const Separator = ({ className }: { className?: string }) => (
  <div className={cn("h-px w-full bg-gray-200", className)} />
);

const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) => {
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isDocumentSidebarOpen, setIsDocumentSidebarOpen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || roomMetadata.email;

  const containerRef = useRef<HTMLDivElement>(null);

  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter') {
      setLoading(true);

      try {
        if(documentTitle !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, documentTitle);
          
          if(updatedDocument) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }
  }

  const handleBlur = async () => {
    if(documentTitle !== roomMetadata.title) {
      setLoading(true);

      try {
        await updateDocument(roomId, documentTitle);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }

    setEditing(false);
  }

  useEffect(() => {
    if(editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  // Function to handle document download
  const handleDownload = () => {
    const filename = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    
    // This is just a placeholder. In a real app, you would use the document content
    const documentText = "This is a placeholder for the document content. In a real implementation, you would export the editor's content.";
    
    // Create a blob and download it
    const blob = new Blob([documentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close settings sidebar after action
    setIsSettingsOpen(false);
  };

  // Function to copy link to document
  const copyLink = () => {
    const url = `${window.location.origin}/documents/${roomId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        // You could show a toast notification here
        console.log("Link copied to clipboard");
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
    
    // Close settings sidebar after action
    setIsSettingsOpen(false);
  };

  // Function to handle document star toggle
  const handleToggleStar = async () => {
    try {
      const result = await toggleDocumentStar(roomId, userEmail);
      if (result.success) {
        setIsStarred(result.isStarred || false);
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  // Check initial star status
  useEffect(() => {
    const checkStarStatus = async () => {
      try {
        const starred = await isDocumentStarred(roomId, userEmail);
        setIsStarred(starred);
      } catch (error) {
        console.error('Error checking star status:', error);
      }
    };

    checkStarStatus();
  }, [roomId, userEmail]);

  // Add handler for desktop comments toggle
  const handleDesktopCommentsToggle = () => {
    // Only toggle comments on desktop - this won't affect mobile comment panel due to md:hidden class
    setIsCommentOpen(!isCommentOpen);
  };

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selection: null,
        name: roomMetadata.email,
        color: "#ffffff",
        threadId: null,
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {() => (
          <div className="flex h-screen w-full flex-col overflow-hidden relative">
            <CommentNotificationHandler 
              roomId={roomId}
              documentTitle={documentTitle}
              documentOwnerEmail={roomMetadata.email}
            />
            
            <Header className="border-b border-dark-400 py-2 md:py-3 px-2 md:px-6 bg-dark-200 shadow-sm" showSidebarToggle={false}>
              {/* Left side header content (injected into first column) */}
              <div className="flex items-center gap-3 h-9">
                {/* Back button - visible only on mobile */}
                <Link href="/" className="md:hidden flex items-center justify-center h-8 w-8 text-gray-400 hover:text-white rounded-md hover:bg-dark-300">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </div>
                
              {/* Center header content (injected into second column) */}
              <div className="flex items-center justify-center w-full overflow-hidden">
                {editing ? (
                  <div className="w-full max-w-xl">
                    <Input
                      ref={inputRef}
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      onKeyDown={updateTitleHandler}
                      onBlur={handleBlur}
                      className="h-9 bg-dark-300 border-dark-400 text-white"
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-3 overflow-hidden h-9"
                    onClick={() => currentUserType === 'editor' && setEditing(true)}
                  >
                    <h1 
                      className={`text-lg md:text-xl font-medium text-white truncate ${currentUserType === 'editor' ? 'cursor-pointer hover:underline' : ''}`}
                    >
                      {documentTitle}
                    </h1>
                    {currentUserType === 'viewer' && (
                      <span className="view-only-tag">View only</span>
                    )}
                  </div>
                )}
              </div>
                
              {/* Right side header content (injected into third column) */}
              <div className="flex items-center gap-2 h-9">
                {/* Comments button - mobile only */}
                <button 
                  onClick={() => setIsCommentOpen(!isCommentOpen)}
                  className={`md:hidden flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                    isCommentOpen 
                    ? 'text-accent-primary bg-dark-300' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-300'
                  }`}
                  aria-label={isCommentOpen ? "Hide mobile comments" : "Show mobile comments"}
                >
                  <MessageSquare className="h-5 w-5" />
                  {/* Comment count badge would go here */}
                </button>
                
                {/* Active Collaborators */}
                <div className="flex items-center h-8">
                  <ActiveCollaborators />
                </div>

                {/* User Avatar */}
                <div className="hidden md:flex items-center h-8">
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
                
                
                {/* Share Modal */}
                <div className="flex items-center h-8">
                  <ShareModal 
                    roomId={roomId}
                    collaborators={users || []}
                    creatorId={roomMetadata.creatorId || ''}
                    currentUserType={currentUserType}
                  />
                </div>

                
                {/* Add this button near the other action buttons (e.g., near the ShareModal button) */}
                <button
                  className="hidden md:flex items-center gap-1.5 rounded-md border border-dark-400 bg-dark-300 px-3 py-2 text-sm font-medium text-white hover:bg-dark-400"
                  onClick={() => setIsDocumentSidebarOpen(true)}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="hidden md:inline">Document</span>
                </button>
              </div>
            </Header>
            
            {/* Document Settings Sidebar */}
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetContent className="p-0 flex flex-col" side="right" open={isSettingsOpen}>
                {/* Sidebar header with app name */}
                <div className="py-5 px-6 border-b border-dark-400 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Settings
                  </h2>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 rounded-full hover:bg-dark-300 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close sidebar"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                {/* Navigation-like content */}
                <div className="flex-1 py-4 px-4 space-y-6 overflow-y-auto">
                  {/* Document info section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">DOCUMENT INFO</h3>
                    <div className="space-y-3 px-2">
                      <p className="text-sm flex items-center justify-between">
                        <span className="text-gray-400">Title</span>
                        <span className="text-white font-medium truncate max-w-[200px]">{documentTitle}</span>
                      </p>
                      <p className="text-sm flex items-center justify-between">
                        <span className="text-gray-400">Created by</span>
                        <span className="text-white font-medium">{roomMetadata.email.split('@')[0]}</span>
                      </p>
                      
                      {/* Show access type for current user */}
                      <p className="text-sm flex items-center justify-between">
                        <span className="text-gray-400">Your access</span>
                        <span className="text-white font-medium">
                          {currentUserType === 'editor' ? 'Editor' : 'Viewer'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-dark-400" />
                  
                  {/* Document actions section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">ACTIONS</h3>
                    <div className="space-y-1">
                      {/* Star Document Button */}
                      <button 
                        onClick={handleToggleStar}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-md transition-colors w-full hover:bg-dark-300 hover:text-white text-left"
                      >
                        <Star className={cn("h-5 w-5", isStarred ? "text-yellow-400 fill-yellow-400" : "text-current")} />
                        <span className="flex-1 font-medium text-current">{isStarred ? 'Unstar Document' : 'Star Document'}</span>
                      </button>
                      
                      {/* Download Document Button */}
                      <button 
                        onClick={handleDownload}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-md transition-colors w-full hover:bg-dark-300 hover:text-white text-left"
                      >
                        <Download className="h-5 w-5 text-current" />
                        <span className="flex-1 font-medium text-current">Download Document</span>
                      </button>
                      
                      {/* Copy Link Button */}
                      <button 
                        onClick={copyLink}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-md transition-colors w-full hover:bg-dark-300 hover:text-white text-left"
                      >
                        <LinkIcon className="h-5 w-5 text-current" />
                        <span className="flex-1 font-medium text-current">Copy Link</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Document properties section - only for editors */}
                  {currentUserType === 'editor' && (
                    <>
                      <Separator className="bg-dark-400" />
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">PROPERTIES</h3>
                        <div className="space-y-1">
                          {/* Edit Document Title */}
                          <button 
                            onClick={() => {
                              setIsSettingsOpen(false);
                              setEditing(true);
                              // Focus the input after a short delay to allow the UI to update
                              setTimeout(() => inputRef.current?.focus(), 100);
                            }}
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-md transition-colors w-full hover:bg-dark-300 hover:text-white text-left"
                          >
                            <Settings className="h-5 w-5 text-current" />
                            <span className="flex-1 font-medium text-current">Edit Document Title</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Document help section */}
                  <Separator className="bg-dark-400" />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">HELP</h3>
                    <div className="space-y-1">
                      <button 
                        onClick={() => {
                          // This would open a help dialog in a real app
                          setIsSettingsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-md transition-colors w-full hover:bg-dark-300 hover:text-white text-left"
                      >
                        <Info className="h-5 w-5 text-current" />
                        <span className="flex-1 font-medium text-current">About This Document</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex-1 overflow-hidden relative">
              <div className="editor-container">
                <Editor 
                  roomId={roomId} 
                  currentUserType={currentUserType}
                  isCommentOpen={isCommentOpen}
                  setIsCommentOpen={setIsCommentOpen}
                />
              </div>
              
              {/* Mobile comment panel with simplified comments display */}
              <div 
                className={`fixed inset-y-0 right-0 w-80 bg-dark-200 border-l border-dark-400 transform transition-transform duration-300 ease-in-out z-20 md:hidden ${
                  isCommentOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <div className="flex items-center justify-between p-4 border-b border-dark-400">
                  <h2 className="text-lg font-medium text-white">Comments</h2>
                  <button 
                    onClick={() => setIsCommentOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-dark-300"
                    aria-label="Close comments panel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 h-full overflow-auto">
                  {/* Just display a simple message for mobile - comments are handled in the editor */}
                  <p className="text-gray-400 text-sm mb-4">
                    Comments are available in the document&apos;s right panel.
                  </p>
                  <div className="flex justify-center my-6">
                    <MessageSquare className="h-10 w-10 text-gray-500 opacity-50" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Document Sidebar */}
            <DocumentSidebar
              document={{
                id: roomId,
                metadata: {
                  title: documentTitle,
                  email: roomMetadata.email || '',
                },
                createdAt: new Date().toISOString(),
              }}
              isOpen={isDocumentSidebarOpen}
              onClose={() => setIsDocumentSidebarOpen(false)}
              onToggleComments={handleDesktopCommentsToggle}
              isCommentsOpen={isCommentOpen}
              currentUserType={currentUserType}
            />
          </div>
        )}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;