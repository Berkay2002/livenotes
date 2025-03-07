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
      const email = propEmail || (user?.primaryEmailAddress?.emailAddress);
      
      if (!email) {
        throw new Error('No email available');
      }
      
      console.log('Fetching documents for email:', email);
      
      // Fetch documents from your API
      const response = await fetch(`/api/documents?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      console.log('Documents fetched:', data);
      
      setDocuments(data.data || []);
      
      // Fetch collaborator information for each document
      if (data.data && data.data.length > 0) {
        await Promise.all(data.data.map(fetchCollaboratorsForDoc));
      }
      
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
      const email = user.primaryEmailAddress?.emailAddress;
      
      if (!email) {
        throw new Error('No email available');
      }
      
      console.log('Creating document for:', { userId, email });
      
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
      console.log('Document created:', newDoc);
      
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
    <div className="p-4 pwa-scroll overflow-y-auto h-full bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Documents</h2>
        
        <button
          onClick={createDocument}
          disabled={isCreatingDoc}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md pwa-tap-target"
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
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading documents...</p>
        </div>
      ) : error ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center my-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 pwa-tap-target"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.length > 0 ? (
            documents.map(doc => (
              <div 
                key={doc.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 pwa-tap-target"
                onClick={() => onOpenDoc(doc.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
                    <FileText size={24} className="text-indigo-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">
                      {doc.metadata.title || 'Untitled Document'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Edited {dateConverter(doc.createdAt)}
                    </p>
                    
                    <div className="flex items-center mt-2">
                      <div className="flex -space-x-2 mr-2">
                        {collaborators[doc.id]?.slice(0, 3).map((collaborator, index) => (
                          <div 
                            key={`${doc.id}-collab-${index}`}
                            className="w-6 h-6 rounded-full ring-1 ring-white flex items-center justify-center text-xs font-medium overflow-hidden"
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
                      </div>
                      
                      {Object.keys(doc.usersAccesses).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{Object.keys(doc.usersAccesses).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add document options handling here (delete, share, etc.)
                      alert(`Options for: ${doc.metadata.title || 'Untitled Document'}`);
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <FileText size={48} className="text-gray-300" />
              </div>
              <h3 className="text-gray-700 font-medium mb-2">No documents yet</h3>
              <p className="text-gray-500 text-sm mb-4">Create your first document to get started</p>
              <button
                onClick={createDocument}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg pwa-tap-target"
              >
                Create Document
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsList;