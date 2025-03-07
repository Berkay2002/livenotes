'use client';

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import ActiveCollaborators from './ActiveCollaborators';
import { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import Image from 'next/image';
import { updateDocument } from '@/lib/actions/room.actions';
import Loader from './Loader';
import ShareModal from './ShareModal';
import Notifications from './Notifications';
import { ChevronLeft, MessageSquare, Send, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Share2 } from 'lucide-react';
import { Thread } from '@liveblocks/react-ui';
import { LiveblocksPlugin } from '@liveblocks/react-lexical';
import { ThreadData } from '@liveblocks/client';

const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) => {
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if(containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditing(false);
        updateDocument(roomId, documentTitle);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [roomId, documentTitle])

  useEffect(() => {
    if(editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing])
  

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header className="sticky left-0 top-0 z-10 border-b border-dark-400 py-2.5 md:py-4 flex items-center px-2 md:px-6 bg-dark-200 shadow-sm">
            {/* Mobile header layout */}
            <div className="w-full md:hidden flex items-center justify-between">
              {/* Left side: Back button and avatar - widened for symmetry */}
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <button 
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-dark-400 bg-dark-300 text-gray-400 hover:bg-dark-400 hover:text-white"
                    aria-label="Go back"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </Link>
                
                <div className="flex h-9 w-9 items-center justify-center">
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
              
              {/* Middle: Document title - shows when there's enough space */}
              <div className="hidden xs:block absolute left-1/2 transform -translate-x-1/2 max-w-[40%]">
                <h1 className="text-white text-sm font-medium truncate text-center">
                  {documentTitle || "Untitled Document"}
                </h1>
              </div>
              
              {/* Right side: Active collaborators, Share, and Comment buttons - widened for symmetry */}
              <div className="flex items-center space-x-3">
                {/* ActiveCollaborators container - sized to match header height */}
                <div className="h-9 flex items-center justify-center">
                  <ActiveCollaborators />
                </div>
                
                <button 
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-dark-400 bg-dark-300 text-gray-400 hover:bg-dark-400 hover:text-white"
                  aria-label="Share document"
                >
                  <ShareModal 
                    roomId={roomId}
                    collaborators={users}
                    creatorId={roomMetadata.creatorId}
                    currentUserType={currentUserType}
                  />
                </button>
                
                <button 
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-dark-400 bg-dark-300 text-gray-400 hover:bg-dark-400 hover:text-white"
                  aria-label="Comments"
                  onClick={() => setIsCommentOpen(true)}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Desktop: Centered title editor - in place of search bar */}
            <div className="hidden md:flex w-full flex-1 items-center justify-center">
              <div className="w-[60%] flex justify-center items-center">
                <div ref={containerRef} className="flex items-center justify-center gap-2">
                  {editing && !loading ? (
                    <Input 
                      type="text"
                      value={documentTitle}
                      ref={inputRef}
                      placeholder="Enter title"
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      onKeyDown={updateTitleHandler}
                      disabled={!editing}
                      className="document-title-input bg-dark-300 border-dark-400 h-12 text-center text-lg font-medium text-white px-4 py-2 rounded-md"
                    />
                  ) : (
                    <>
                      <h1 
                        className="text-lg md:text-xl font-medium text-white cursor-pointer hover:text-accent-primary transition-colors py-2"
                        onClick={() => currentUserType === 'editor' && setEditing(true)}
                      >
                        {documentTitle || "Untitled Document"}
                      </h1>
                    </>
                  )}

                  {currentUserType === 'editor' && !editing && (
                    <Image 
                      src="/assets/icons/edit.svg"
                      alt="edit"
                      width={20}
                      height={20}
                      onClick={() => setEditing(true)}
                      className="cursor-pointer opacity-70 hover:opacity-100"
                    />
                  )}

                  {currentUserType !== 'editor' && !editing && (
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-purple-400/20 text-purple-400 ml-2">
                      View only
                    </span>
                  )}

                  {loading && <p className="text-sm text-gray-400 ml-2">saving...</p>}
                </div>
              </div>
            </div>
            
            {/* Desktop: Right side actions - Increased width for proper icon sizing */}
            <div className="hidden md:flex items-center justify-end w-60 gap-3 pr-2">
              <div className="flex items-center space-x-4">
                {/* ActiveCollaborators container - properly sized for desktop */}
                <div className="h-9 flex items-center justify-center">
                  <ActiveCollaborators />
                </div>
                
                <ShareModal 
                  roomId={roomId}
                  collaborators={users}
                  creatorId={roomMetadata.creatorId}
                  currentUserType={currentUserType}
                />
                
                <div className="flex items-center justify-center">
                  <Notifications className="h-7 md:h-8 w-7 md:w-8" />
                </div>
                
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </Header>
          
          {/* Editor handles comments via the Comments component */}
          <Editor 
            roomId={roomId} 
            currentUserType={currentUserType}
            isCommentOpen={isCommentOpen}
            setIsCommentOpen={setIsCommentOpen}
          />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom