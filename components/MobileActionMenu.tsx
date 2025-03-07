'use client';

import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateDocument, deleteDocument } from '@/lib/actions/room.actions';

interface Document {
  id: string;
  metadata: {
    title: string;
    email: string;
  };
  createdAt: string;
}

interface MobileActionMenuProps {
  document: Document;
  isOwner: boolean;
  canEdit: boolean;
}

export function MobileActionMenu({ document, isOwner, canEdit }: MobileActionMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState(document.metadata.title);
  const [loading, setLoading] = useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !canEdit) return;
    
    setLoading(true);
    try {
      await updateDocument(document.id, title);
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

  // Helper function to get permission label and color
  const getPermissionInfo = () => {
    if (isOwner) {
      return { label: 'Owner', bgColor: 'bg-green-500/20', textColor: 'text-green-400' };
    } else if (canEdit) {
      return { label: 'Editor', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' };
    } else {
      return { label: 'Viewer', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400' };
    }
  };
  
  const permissionInfo = getPermissionInfo();

  return (
    <>
      {/* Action Menu Trigger */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`flex h-10 w-10 items-center justify-center rounded-md border border-dark-400 ${isOwner ? 'bg-dark-300 hover:bg-dark-400' : 'bg-dark-300'} text-gray-400 hover:text-white relative`}
        aria-label="Document actions"
      >
        <MoreVertical className="h-5 w-5" />

      </button>

      {/* Action Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:hidden" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed bottom-[calc(4rem)] w-full max-w-lg rounded-xl bg-dark-200 border border-dark-400 p-3 pb-5 animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-dark-400"></div>
            
            <div className="mb-4 px-3 pb-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-medium text-white line-clamp-1">{document.metadata.title}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${permissionInfo.bgColor} ${permissionInfo.textColor}`}>
                  {permissionInfo.label}
                </span>
              </div>
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
              
              {canEdit && (
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
              )}
              
              {isOwner && (
                <button 
                  className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 rounded-md bg-red-900/10 hover:bg-red-900/20 text-left"
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

      {/* Rename Dialog - only shown for users with edit permission */}
      {canEdit && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-dark-200 border border-dark-400 max-w-[calc(100%-32px)] p-6 rounded-lg mb-20 sm:mb-0">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-medium text-white">Rename Document</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleRename} className="space-y-5">
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-dark-300 border-dark-400 text-white h-12 px-4 text-base"
                placeholder="Document title"
                disabled={loading}
                autoFocus
              />
              <DialogFooter className="sm:space-x-2 flex flex-col sm:flex-row gap-3 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)} 
                  className="border-dark-400 text-gray-300 w-full sm:flex-1 h-11"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent-primary hover:bg-accent-primary/90 text-white w-full sm:flex-1 h-11" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog - only shown for owners */}
      {isOwner && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="bg-dark-200 border border-dark-400 max-w-[calc(100%-32px)] p-6 rounded-lg mb-20 sm:mb-0">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="bg-red-500/10 rounded-full p-3 mb-2">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <DialogTitle className="text-xl font-medium text-white">Delete document</DialogTitle>
              <p className="text-gray-400 mt-2 max-w-[280px] mx-auto">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
            </DialogHeader>

            <DialogFooter className="mt-6 sm:space-x-2 flex flex-col sm:flex-row gap-3 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="border-dark-400 text-gray-300 w-full sm:flex-1 h-11"
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:flex-1 h-11"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 