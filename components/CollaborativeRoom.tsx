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

const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) => {
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
          <Header className="sticky left-0 top-0 z-10 border-b border-dark-400 py-2 md:py-4 flex items-center px-2 md:px-6 bg-dark-200 shadow-sm">
            {/* Mobile: Back button and simple title */}
            <div className="flex md:hidden items-center gap-2">
              <a href="/" className="p-2 text-white">
                <Image
                  src="/assets/icons/arrow-clockwise.svg"
                  alt="back"
                  width={20}
                  height={20}
                  className="rotate-180"
                />
              </a>
              <div className="flex flex-col">
                <h1 className="text-white font-medium truncate max-w-[170px]">
                  {documentTitle || "Untitled Document"}
                </h1>
                <p className="text-xs text-gray-400">
                  {currentUserType === 'editor' ? 'Can edit' : 'View only'}
                </p>
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
            
            {/* Desktop: Notifications and User button - right side */}
            <div className="flex items-center justify-end md:w-48 w-10 gap-6 pr-0 md:pr-2">
              <div className="hidden md:flex items-center space-x-3">
                {/* Share button - desktop only */}
                <ShareModal 
                  roomId={roomId}
                  collaborators={users}
                  creatorId={roomMetadata.creatorId}
                  currentUserType={currentUserType}
                />
                
                {/* Active collaborators - desktop only */}
                <ActiveCollaborators />
              
                {/* Notifications - desktop only */}
                <Notifications className="h-6 md:h-7 w-6 md:w-7" />
              </div>

              {/* Mobile: Share button */}
              <div className="md:hidden flex items-center">
                <ShareModal 
                  roomId={roomId}
                  collaborators={users}
                  creatorId={roomMetadata.creatorId}
                  currentUserType={currentUserType}
                />
              </div>

              {/* UserButton for all screen sizes */}
              <div className="block">
                <div className="transform scale-125">
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </div>
          </Header>
          
          <Editor roomId={roomId} currentUserType={currentUserType} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom