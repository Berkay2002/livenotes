import Image from 'next/image';
import React, { useState } from 'react'
import UserTypeSelector from './UserTypeSelector';
import { Button } from './ui/button';
import { removeCollaborator, updateDocumentAccess } from '@/lib/actions/room.actions';
import { Trash2 } from 'lucide-react';

const Collaborator = ({ roomId, creatorId, collaborator, email, user }: CollaboratorProps) => {
  const [userType, setUserType] = useState(collaborator.userType || 'viewer');
  const [loading, setLoading] = useState(false);

  // Check if current user is the document owner (creator)
  const isOwner = user.id === creatorId;

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);

    await updateDocumentAccess({ 
      roomId, 
      email, 
      userType: type as UserType, 
      updatedBy: user 
    });

    setLoading(false);
  }

  const removeCollaboratorHandler = async (email: string) => {
    // Only proceed if current user is the owner
    if (!isOwner) return;
    
    setLoading(true);

    await removeCollaborator({ roomId, email });

    setLoading(false);
  }

  return (
    <div className="flex items-center justify-between gap-2 py-3 px-1">
      <div className="flex gap-3 items-center overflow-hidden">
        <Image 
          src={collaborator.avatar}
          alt={collaborator.name}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full flex-shrink-0"
        />
        <div className="overflow-hidden">
          <div className="flex items-center">
            <p className="text-sm font-medium text-white truncate">
              {collaborator.name}
            </p>
            {loading && (
              <span className="ml-2 text-xs text-blue-100">
                updating...
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">
            {collaborator.email}
          </p>
        </div>
      </div>

      {creatorId === collaborator.id ? (
        <p className="text-xs font-medium bg-dark-300 text-blue-300 py-1 px-2 rounded-md">Owner</p>
      ): (
        <div className="flex items-center">
          <UserTypeSelector 
            userType={userType as UserType}
            setUserType={setUserType || 'viewer'}
            onClickHandler={shareDocumentHandler}
          />
          
          {/* Only show remove button to the document owner */}
          {isOwner && (
            <Button 
              type="button" 
              onClick={() => removeCollaboratorHandler(collaborator.email)}
              variant="destructive"
              size="sm"
              className="ml-2 px-2 h-8 bg-red-600/20 hover:bg-red-600/30 text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default Collaborator