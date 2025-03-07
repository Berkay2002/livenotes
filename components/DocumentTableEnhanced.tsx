'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dateConverter } from '@/lib/utils';
import { DeleteModal } from '@/components/DeleteModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateDocument } from '@/lib/actions/room.actions';
import { MobileActionMenu } from '@/components/MobileActionMenu';
import { Pencil, ExternalLink, Lock } from 'lucide-react';

interface Document {
  id: string;
  metadata: {
    title: string;
    email: string;
    creatorId?: string; // Optional creator ID
  };
  createdAt: string;
  usersAccesses?: Record<string, string[]>; // User access rights
}

interface DocumentsTableProps {
  documents: Document[];
  userEmail: string;
}

// Title Edit Dialog Component for Desktop
const TitleEditDialog = ({ document, onTitleUpdate }: { document: Document, onTitleUpdate: (id: string, newTitle: string) => Promise<void> }) => {
  const [title, setTitle] = useState(document.metadata.title);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onTitleUpdate(document.id, title);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded p-1.5 text-gray-400 hover:bg-dark-400 hover:text-white" aria-label="Edit title">
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-dark-200 border border-dark-400 md:max-w-md max-w-[calc(100%-32px)] p-6 rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-white text-xl font-medium">Edit Document Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-dark-300 border-dark-400 text-white h-12 px-4 text-base"
            placeholder="Document title"
            disabled={loading}
            autoFocus
          />
          <div className="flex justify-end gap-3 sm:space-x-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-dark-400 text-gray-300 h-11 w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-primary hover:bg-accent-primary/90 text-white h-11 w-full sm:w-auto" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to check user permissions
const getUserPermissions = (document: Document, userEmail: string) => {
  // Check if the user is the owner
  const isOwner = document.metadata.email === userEmail;
  
  // Check if user has edit access (if usersAccesses is available)
  let canEdit = isOwner; // Default to owner status
  if (document.usersAccesses && document.usersAccesses[userEmail]) {
    canEdit = document.usersAccesses[userEmail].includes('room:write');
  }
  
  return { isOwner, canEdit };
};

export const DocumentTableEnhanced = ({ documents, userEmail }: DocumentsTableProps) => {
  const handleTitleUpdate = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await updateDocument(id, newTitle);
      // We don't need to manually update the UI since we'll refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error updating document title:", error);
    }
  };

  return (
    <div className="w-full overflow-auto rounded-lg border border-dark-400 bg-dark-200 shadow-md">
      <table className="w-full min-w-full table-auto">
        <thead>
          <tr className="bg-dark-300 text-left text-sm font-medium text-gray-300">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 hidden md:table-cell">Last modified</th>
            <th className="px-4 py-3 hidden md:table-cell">Owner</th>
            <th className="px-4 py-3 hidden sm:table-cell">Location</th>
            <th className="px-4 py-3 hidden sm:table-cell">Permission</th>
            <th className="px-4 py-3 text-center w-[100px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-400">
          {documents.map((document: Document, index: number) => {
            // Determine document permissions
            const { isOwner, canEdit } = getUserPermissions(document, userEmail);
            
            return (
              <tr key={document.id} className="group transition-colors hover:bg-dark-300">
                <td className="px-4 py-3">
                  <Link href={`/documents/${document.id}`} className="flex items-center">
                    <div className="relative mr-3 flex-shrink-0">
                      <Image 
                        src="/assets/icons/doc.svg"
                        alt="file"
                        width={24}
                        height={24}
                        priority={index < 10}
                        loading={index < 10 ? "eager" : "lazy"}
                      />
                      {!canEdit && (
                        <div className="absolute -right-1 -bottom-1 rounded-full bg-dark-200 p-0.5">
                          <Lock className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <span className="line-clamp-1 font-medium text-white group-hover:text-accent-primary">
                      {document.metadata.title}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">
                  {dateConverter(document.createdAt.toString())}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">
                  {isOwner ? 'Me' : document.metadata.email.split('@')[0]}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden sm:table-cell">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    isOwner 
                    ? 'bg-accent-primary/20 text-accent-primary' 
                    : 'bg-purple-400/20 text-purple-400'
                  }`}>
                    {isOwner ? 'My document' : 'Shared with me'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden sm:table-cell">
                  {isOwner ? (
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400">
                      Owner
                    </span>
                  ) : canEdit ? (
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400">
                      Edit
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-400">
                      View
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {/* Desktop Actions */}
                  <div className="hidden sm:flex items-center justify-center space-x-2">
                    {/* Open document - always visible */}
                    <Link 
                      href={`/documents/${document.id}`}
                      className="rounded p-1.5 text-gray-400 hover:bg-dark-400 hover:text-white"
                      aria-label="Open document"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    
                    {/* Edit button - only visible for owners and editors */}
                    {canEdit && (
                      <TitleEditDialog document={document} onTitleUpdate={handleTitleUpdate} />
                    )}
                    
                    {/* Delete button - only visible for owners */}
                    {isOwner && (
                      <DeleteModal roomId={document.id} />
                    )}
                  </div>

                  {/* Mobile Action Menu - with permission checks */}
                  <div className="sm:hidden flex justify-center">
                    <MobileActionMenu 
                      document={document} 
                      isOwner={isOwner}
                      canEdit={canEdit}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 