'use client';

import { DocumentData } from '@/types/document';
import DocumentCard from './DocumentCard';
import NewDocumentCard from './NewDocumentCard';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, FileText } from 'lucide-react';
import AddDocumentBtn from './AddDocumentBtn';

interface HomeClientProps {
  initialDocuments: DocumentData[];
  userId: string;
  email: string;
}

const HomeClient = ({ initialDocuments, userId, email }: HomeClientProps) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') || '';
  const [documents, setDocuments] = useState(initialDocuments);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // If search query changes, filter the documents
    if (searchQuery) {
      setIsSearching(true);
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = initialDocuments.filter(doc => 
        doc.metadata.title.toLowerCase().includes(lowerCaseQuery)
      );
      setDocuments(filtered);
    } else {
      setIsSearching(false);
      setDocuments(initialDocuments);
    }
  }, [searchQuery, initialDocuments]);

  return (
    <>
      {documents.length > 0 ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isSearching 
                ? `Search Results (${documents.length})` 
                : 'Recent Documents'}
            </h2>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
            
            {/* Only show the "New Document" card when not searching */}
            {!isSearching && (
              <NewDocumentCard userId={userId} email={email} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-dark-200 py-16 shadow-md">
          {isSearching ? (
            <>
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-dark-300">
                <SearchIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="mb-3 text-xl font-semibold text-white">No matching documents</h2>
              <p className="mb-8 max-w-md text-center text-gray-400">
                No documents match your search "{searchQuery}"
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-dark-300">
                <FileText className="h-10 w-10 text-accent-primary" />
              </div>
              <h2 className="mb-3 text-xl font-semibold text-white">No documents yet</h2>
              <p className="mb-8 max-w-md text-center text-gray-400">
                Create your first document to start collaborating in real-time with your team
              </p>
              <AddDocumentBtn 
                userId={userId}
                email={email}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default HomeClient;