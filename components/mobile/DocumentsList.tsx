'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FileText, MoreVertical, Plus, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { dateConverter } from '@/lib/utils'; // Reusing your existing utility

interface DocumentsListProps {
  onOpenDoc: (id?: string) => void;
  email?: string; // Make email optional to maintain backward compatibility
}

interface DocumentData {
  id: string;
  metadata: {
    title: string;
    creatorId: string;
    email: string;
  };
  usersAccesses: Record<string, string[]>;
  createdAt: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ onOpenDoc, email: propEmail }) => {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Record<string, Collaborator[]>>({});
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    if (!isLoaded && !propEmail) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the user's email - prefer the prop if provided
      const email = propEmail || (user?.emailAddresses[0].emailAddress);
      
      if (!email) {
        throw new Error('No email available');
      }
      
      // Fetch documents from your API
      const response = await fetch(`/api/documents?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.data || []);
      
      // Fetch collaborator information for each document
      await Promise.all(data.data.map(fetchCollaboratorsForDoc));
      
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, user, propEmail]);

  // Fetch collaborators for a specific document
  const fetchCollaboratorsForDoc = async (doc: DocumentData) => {
    try {
      const docUserIds = Object.keys(doc.usersAccesses);
      if (docUserIds.length === 0) return;
      
      // In a real implementation, you'd fetch user details from your API
      // const response = await fetch(`/api/users?emails=${docUserIds.join(',')}`);
      // const users = await response.json();
      
      // For demonstration, we'll create placeholder collaborators
      // Replace this with actual API calls in production
      const mockCollaborators: Collaborator[] = docUserIds.slice(0, 3).map((email, index) => {
        // Generate deterministic user data based on email
        const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0'];
        
        return {
          id: `user-${index}`,
          name: email.split('@')[0],
          email,
          avatar: `/api/placeholder/40/40`,
          color: colors[hash % colors.length]
        };
      });
      
      setCollaborators(prev => ({
        ...prev,
        [doc.id]: mockCollaborators
      }));
      
    } catch (err) {
      console.error(`Error fetching collaborators for doc ${doc.id}:`, err);
    }
  };

  // Create a new document
  const createDocument = async () => {
    if (!isLoaded || !user) return;
    
    setIsCreatingDoc(true);
    
    try {
      const userId = user.id;
      const email = user.emailAddresses[0].emailAddress;
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document');
      }
      
      const newDoc = await response.json();
      
      // Navigate to the new document
      onOpenDoc(newDoc.id);
      
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document. Please try again.');
    } finally {
      setIsCreatingDoc(false);
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    if (isLoaded) {
      fetchDocuments();
    }
  }, [isLoaded, fetchDocuments]);

  // Refresh documents periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoaded && !isLoading) {
        fetchDocuments();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isLoaded, isLoading, fetchDocuments]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full py-8">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Documents</h2>
        
        <button
          onClick={createDocument}
          disabled={isCreatingDoc}
          className="flex items-center justify-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-lg shadow-md"
        >
          {isCreatingDoc ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          <span className="text-sm">New</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-accent-primary animate-spin mb-4" />
          <p className="text-gray-400">Loading documents...</p>
        </div>
      ) : error ? (
        <div className="bg-dark-200 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="bg-dark-300 text-white px-4 py-2 rounded-lg hover:bg-dark-400"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.length > 0 ? (
            documents.map(doc => (
              <div 
                key={doc.id}
                className="bg-dark-200 rounded-lg p-4 shadow-md"
                onClick={() => onOpenDoc(doc.id)}
              >
                <div className="flex items-center justify-center h-32 mb-3 bg-dark-100/70 rounded">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <h3 className="text-white font-medium mb-1 truncate">
                  {doc.metadata.title || 'Untitled Document'}
                </h3>
                <p className="text-gray-400 text-sm">
                  Edited {dateConverter(doc.createdAt)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex -space-x-2">
                    {collaborators[doc.id]?.slice(0, 3).map((collaborator, index) => (
                      <div 
                        key={`${doc.id}-collab-${index}`}
                        className="w-6 h-6 rounded-full ring-2 ring-dark-200 flex items-center justify-center text-xs font-medium overflow-hidden"
                        style={{ backgroundColor: collaborator.color }}
                        title={collaborator.name}
                      >
                        {collaborator.avatar ? (
                          <Image 
                            src={collaborator.avatar} 
                            alt={collaborator.name}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        ) : (
                          collaborator.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                    ))}
                    {Object.keys(doc.usersAccesses).length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-dark-400 ring-2 ring-dark-200 flex items-center justify-center text-xs text-white">
                        +{Object.keys(doc.usersAccesses).length - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-dark-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add document options menu here
                    }}
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-dark-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-dark-300 flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-accent-primary" />
              </div>
              <h3 className="text-white font-medium text-lg mb-2">No documents yet</h3>
              <p className="text-gray-400 mb-6">Create your first document to get started</p>
            </div>
          )}
          
          <div className="bg-dark-200 rounded-lg p-4 border-2 border-dashed border-dark-400 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-dark-300 flex items-center justify-center mb-3">
              <Plus size={24} className="text-accent-primary" />
            </div>
            <h3 className="text-white font-medium text-center">Create New Document</h3>
            <p className="text-gray-400 text-sm text-center mt-1 mb-3">Start with a blank page</p>
            <button 
              className="bg-accent-primary hover:bg-accent-hover text-white rounded-lg px-4 py-2 flex items-center gap-2 disabled:opacity-70"
              onClick={createDocument}
              disabled={isCreatingDoc}
            >
              {isCreatingDoc ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>New Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;