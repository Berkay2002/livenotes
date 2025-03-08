import { getDocuments } from '@/lib/actions/room.actions';
import { SignedIn, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header'
import Notifications from '@/components/Notifications';
import SearchBar from '@/components/SearchBar';
import AddDocumentBtn from '@/components/AddDocumentBtn';
import Link from 'next/link';
import Image from 'next/image';
import { dateConverter } from '@/lib/utils';
import { DeleteModal } from '@/components/DeleteModal';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentTableEnhanced } from '@/components/DocumentTableEnhanced';
import { FileText, FilePlus } from 'lucide-react';
import { Document } from '@/types/document';

// Separate component for documents section to enable streaming
const DocumentsSection = async ({ email }: { email: string }) => {
  // This will be streamed in after the initial HTML is sent
  const roomDocuments = await getDocuments(email);
  const documents = roomDocuments.data || [];
  
  return (
    <>
      {documents.length > 0 ? (
        <DocumentTableEnhanced documents={documents} userEmail={email} />
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-dark-300 mb-6">
            <FilePlus className="text-gray-400" size={64} />
          </div>
          <h3 className="text-center text-xl font-bold text-white mb-2">
            No documents yet
          </h3>
          <p className="text-center text-gray-400 max-w-md">
            Create your first document to get started with collaborative editing
          </p>
        </div>
      )}
    </>
  );
};

// Loading placeholder for documents section
const DocumentsSkeleton = () => (
  <div className="w-full overflow-hidden rounded-lg border border-dark-400 bg-dark-200 shadow-md">
    <div className="bg-dark-300 p-3">
      <Skeleton className="h-6 w-full max-w-md" />
    </div>
    <div className="divide-y divide-dark-400">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center gap-4 p-4">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="ml-auto h-5 w-24" />
        </div>
      ))}
    </div>
  </div>
);

const Home = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const email = clerkUser.emailAddresses[0].emailAddress;

  return (
    <main className="min-h-screen bg-dark-100 w-screen overflow-hidden">
      {/* 
       * Responsive Header with balanced layout
       */}
      <Header className="sticky left-0 top-0 z-10 border-b border-dark-400 py-2 md:py-4 px-2 md:px-6 bg-dark-200 shadow-sm" showSidebarToggle={true}>
        {/* Left section content */}
        <div className="md:hidden flex items-center ml-2">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        
        {/* Center section content */}
        <div className="w-full flex items-center justify-center">
          {/* Desktop search bar */}
          <div className="hidden md:flex w-full max-w-2xl justify-center">
            <SearchBar 
              email={email} 
              placeholder="Search documents"
              className="py-2 w-full text-base"
            />
          </div>
          
          {/* Mobile search bar */}
          <div className="md:hidden flex w-full justify-center">
            <SearchBar 
              email={email} 
              placeholder="Search" 
              className="w-full" 
            />
          </div>
        </div>
        
        {/* Right section content */}
        <div className="flex items-center justify-end gap-3 pr-0 md:pr-2">
          {/* Notifications - shown on both mobile and desktop */}
          <Notifications className="h-6 md:h-7 w-6 md:w-7" />
          
          {/* Desktop only: User avatar button */}
          <div className="hidden md:block">
            <div className="transform scale-125">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </Header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Desktop only: Title and Add button section */}
        <div className="hidden md:flex mb-8 items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Documents</h1>
          <AddDocumentBtn userId={clerkUser.id} email={email} />
        </div>

        {/* Documents Section with responsive table layout */}
        <section className="mt-4 md:mt-8">
          <Suspense fallback={<DocumentsSkeleton />}>
            <DocumentsSection email={email} />
          </Suspense>
        </section>
        
      </div>
    </main>
  );
};

export default Home;