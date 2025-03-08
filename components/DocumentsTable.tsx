'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dateConverter } from '@/lib/utils';
import { DeleteModal } from '@/components/DeleteModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateDocument, deleteDocument } from '@/lib/actions/room.actions';
import { Pencil, MoreVertical, ExternalLink, Trash2 } from 'lucide-react';
import { Document } from '@/types/document';

interface DocumentsTableProps {
  documents: Document[];
  userEmail: string;
}

// Title Edit Dialog Component
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
      <DialogContent className="bg-dark-200 border border-dark-400">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Document Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-dark-300 border-dark-400 text-white"
            placeholder="Document title"
            disabled={loading}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-dark-400 text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-primary hover:bg-accent-primary/90 text-white" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Mobile Action Menu Component
const MobileActionMenu = ({ document, isOwner, userEmail, onUpdate }: { document: Document, isOwner: boolean, userEmail: string, onUpdate: (id: string, newTitle: string) => Promise<void> }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState(document.metadata.title);
  const [loading, setLoading] = useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await onUpdate(document.id, title);
      setIsEditOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating document title:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    
    setLoading(true);
    try {
      await deleteDocument(document.id);
      setIsDeleteOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Action Menu Trigger */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-dark-400 bg-dark-300 text-gray-400 hover:bg-dark-400 hover:text-white"
        aria-label="Document actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Action Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:hidden" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed bottom-0 w-full max-w-lg rounded-t-xl bg-dark-200 border-t border-x border-dark-400 p-3 pb-8 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-dark-400"></div>
            
            <div className="mb-4 px-3 pb-2">
              <h3 className="text-lg font-medium text-white line-clamp-1">{document.metadata.title}</h3>
              <p className="text-xs text-gray-400">
                {isOwner ? 'My document' : 'Shared with me'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              <Link 
                href={`/documents/${document.id}`}
                className="flex items-center gap-3 px-4 py-3 text-white rounded-md hover:bg-dark-300"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="font-medium">Open Document</span>
              </Link>
              
              <button 
                className="flex items-center gap-3 px-4 py-3 text-white rounded-md hover:bg-dark-300 text-left"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditOpen(true);
                }}
              >
                <Pencil className="h-5 w-5" />
                <span className="font-medium">Rename</span>
              </button>
              
              {isOwner && (
                <button 
                  className="flex items-center gap-3 px-4 py-3 text-red-400 rounded-md hover:bg-dark-300 text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-medium">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-dark-200 border border-dark-400 max-w-[calc(100%-32px)] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Document Title</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-dark-300 border-dark-400 text-white"
              placeholder="Document title"
              disabled={loading}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-dark-400 text-gray-300">
                Cancel
              </Button>
              <Button type="submit" className="bg-accent-primary hover:bg-accent-primary/90 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-dark-200 border border-dark-400 max-w-[calc(100%-32px)] rounded-lg">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-red-500/10 rounded-full p-3 mb-2 w-fit">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-white">Delete document</DialogTitle>
            <p className="text-gray-400 mt-2">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="border-dark-400 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DocumentsTable = ({ documents, userEmail }: DocumentsTableProps) => {
  const handleTitleUpdate = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await updateDocument(id, newTitle);
      // We don't need to manually update the UI since we'll refresh the data
      // But in a real app, you might want to update the local state without a refresh
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
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-400">
          {documents.map((document: Document, index: number) => {
            // Determine if document is owned by current user or shared
            const isOwner = document.metadata.email === userEmail;
            
            return (
              <tr key={document.id} className="group transition-colors hover:bg-dark-300">
                <td className="px-4 py-3">
                  <Link href={`/documents/${document.id}`} className="flex items-center">
                    <Image 
                      src="/assets/icons/doc.svg"
                      alt="file"
                      width={24}
                      height={24}
                      className="mr-3"
                      priority={index < 10}
                      loading={index < 10 ? "eager" : "lazy"}
                    />
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
                <td className="px-4 py-3 text-center">
                  {/* Desktop Actions */}
                  <div className="hidden sm:flex items-center justify-center space-x-2">
                    {/* Open document button */}
                    <Link
                      href={`/documents/${document.id}`}
                      className="rounded p-1.5 text-gray-400 hover:bg-dark-400 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    
                    {/* Edit button */}
                    <TitleEditDialog document={document} onTitleUpdate={handleTitleUpdate} />
                    
                    {/* Delete button - only shown for owned documents */}
                    {isOwner && <DeleteModal roomId={document.id} />}
                  </div>

                  {/* Mobile Actions */}
                  <div className="sm:hidden flex justify-center">
                    <MobileActionMenu 
                      document={document} 
                      isOwner={isOwner}
                      userEmail={userEmail}
                      onUpdate={handleTitleUpdate}
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