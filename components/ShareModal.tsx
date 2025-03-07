'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useSelf } from '@liveblocks/react/suspense';
import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import UserTypeSelector from "./UserTypeSelector";
import Collaborator from "./Collaborator";
import { updateDocumentAccess } from "@/lib/actions/room.actions";
import { X, Share2, UserPlus } from 'lucide-react';

const ShareModal = ({ roomId, collaborators, creatorId, currentUserType }: ShareDocumentDialogProps) => {
  const user = useSelf();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<UserType>('viewer');

  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const shareDocumentHandler = async () => {
    setLoading(true);

    await updateDocumentAccess({ 
      roomId, 
      email, 
      userType: userType as UserType, 
      updatedBy: user.info,
    });

    setEmail('');
    setLoading(false);
  }

  // Mobile UI for Share Dialog
  if (isMobile) {
    return (
      <>
        {/* Trigger button for mobile - using an icon only */}
        <Share2 
          className="h-5 w-5" 
          onClick={() => setOpen(true)}
        />

        {/* Mobile-optimized bottom sheet dialog */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-in fade-in" onClick={() => setOpen(false)}>
            <div 
              className="fixed bottom-0 w-full max-w-lg rounded-t-xl bg-dark-200 border-t border-x border-dark-400 p-3 pb-5 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-dark-400"></div>
              
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-lg font-medium text-white">Share Document</h3>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-dark-300 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Mobile-optimized email input and invite form */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-1 rounded-md bg-dark-300 border border-dark-400">
                      <Input 
                        id="mobile-email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-0 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <UserTypeSelector 
                        userType={userType}
                        setUserType={setUserType}
                      />
                      
                      <Button 
                        type="submit" 
                        onClick={shareDocumentHandler} 
                        className="bg-accent-primary hover:bg-accent-primary/90 text-white h-9 px-4"
                        disabled={loading || !email.trim()}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {loading ? 'Inviting...' : 'Invite'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Collaborators list */}
                <div className="mt-6 border-t border-dark-400 pt-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                    Current collaborators
                    {collaborators.length > 0 && (
                      <span className="ml-2 text-xs bg-dark-300 text-gray-300 rounded-full px-2 py-0.5">
                        {collaborators.length}
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                    {collaborators.length === 0 ? (
                      <div className="bg-dark-300 rounded-md border border-dark-400 py-4 px-3">
                        <p className="text-sm text-gray-400 flex items-center justify-center">
                          <span className="inline-block mr-2 h-2 w-2 rounded-full bg-gray-500"></span>
                          No collaborators yet
                        </p>
                      </div>
                    ) : (
                      <ul className="flex flex-col">
                        {collaborators.map((collaborator) => (
                          <li key={collaborator.id} className="border-b border-dark-400 last:border-b-0">
                            <Collaborator 
                              roomId={roomId}
                              creatorId={creatorId}
                              email={collaborator.email}
                              collaborator={collaborator}
                              user={user.info}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop UI (unchanged)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="gradient-blue flex h-9 gap-1 px-4" disabled={currentUserType !== 'editor'}>
          <Image
            src="/assets/icons/share.svg"
            alt="share"
            width={20}
            height={20}
            className="min-w-4 md:size-5"
          />
          <p className="mr-1 hidden sm:block">
            Share
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>Manage who can view this project</DialogTitle>
          <DialogDescription>Select which users can view and edit this document</DialogDescription>
        </DialogHeader>

        <Label htmlFor="email" className="mt-6 text-blue-100">
          Email address
        </Label>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 rounded-md bg-dark-400">
            <Input 
              id="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="share-input"
            />
            <UserTypeSelector 
              userType={userType}
              setUserType={setUserType}
            />
          </div>
          <Button type="submit" onClick={shareDocumentHandler} className="gradient-blue flex h-full gap-1 px-5" disabled={loading}>
            {loading ? 'Sending...' : 'Invite'}
          </Button>
        </div>

        {/* Collaborators list with improved styling */}
        <div className="mt-6 border-t border-dark-400 pt-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center">
            Current collaborators
            {collaborators.length > 0 && (
              <span className="ml-2 text-xs bg-dark-300 text-gray-300 rounded-full px-2 py-0.5">
                {collaborators.length}
              </span>
            )}
          </h4>
          
          <div className="my-2 space-y-1 max-h-[40vh] overflow-y-auto pr-1">
            {collaborators.length === 0 ? (
              <div className="bg-dark-300 rounded-md border border-dark-400 py-4 px-3">
                <p className="text-sm text-gray-400 flex items-center justify-center">
                  <span className="inline-block mr-2 h-2 w-2 rounded-full bg-gray-500"></span>
                  No collaborators yet
                </p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {collaborators.map((collaborator) => (
                  <li key={collaborator.id} className="border-b border-dark-400 last:border-b-0">
                    <Collaborator 
                      roomId={roomId}
                      creatorId={creatorId}
                      email={collaborator.email}
                      collaborator={collaborator}
                      user={user.info}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareModal