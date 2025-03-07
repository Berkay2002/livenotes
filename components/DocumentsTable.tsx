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

interface Document {
  id: string;
  metadata: {
    title: string;
    email: string;
  };
  createdAt: string;
}

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
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
            const isOwnDocument = document.metadata.email === userEmail;
            
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
                  {isOwnDocument ? 'Me' : document.metadata.email.split('@')[0]}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 hidden sm:table-cell">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    isOwnDocument 
                    ? 'bg-accent-primary/20 text-accent-primary' 
                    : 'bg-purple-400/20 text-purple-400'
                  }`}>
                    {isOwnDocument ? 'My document' : 'Shared with me'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">

                    
                    {/* Title Edit Dialog */}
                    <TitleEditDialog document={document} onTitleUpdate={handleTitleUpdate} />
                    
                    <DeleteModal roomId={document.id} />
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