import { getSharedDocuments } from '@/lib/actions/room.actions';
import { SignedIn, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header'
import Notifications from '@/components/Notifications';
import SearchBar from '@/components/SearchBar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentTableEnhanced } from '@/components/DocumentTableEnhanced';
import { Share2, ExternalLink } from 'lucide-react';
import { Document } from '@/types/document';

// Separate component for shared documents section to enable streaming
const SharedDocumentsSection = async ({ email }: { email: string }) => {
  // This will be streamed in after the initial HTML is sent
  const sharedDocuments = await getSharedDocuments(email);
  const documents = sharedDocuments.data || [];
  
  return (
    <>
      {documents.length > 0 ? (
        <DocumentTableEnhanced documents={documents} userEmail={email} />
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-dark-300 mb-6">
            <Share2 className="text-gray-400" size={64} />
          </div>
          <h3 className="text-center text-xl font-bold text-white mb-2">
            No shared documents yet
          </h3>
          <p className="text-center text-gray-400 max-w-md">
            When someone shares a document with you, it will appear here
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

const SharedPage = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const email = clerkUser.emailAddresses[0].emailAddress;

  return (
    <main className="min-h-screen bg-dark-100 w-screen overflow-hidden">
      {/* Responsive Header with balanced layout */}
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
              placeholder="Search shared documents"
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
        {/* Page title with icon */}
        <div className="mb-8 flex items-center">
          <div className="hidden md:flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
              <Share2 size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white">Shared with me</h1>
          </div>
          <div className="md:hidden w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                <Share2 size={16} />
              </div>
              <h1 className="text-xl font-bold text-white">Shared with me</h1>
            </div>
          </div>
        </div>
        
        {/* Info card about shared documents */}
        <div className="mb-8 rounded-lg border border-dark-400 bg-dark-200 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <ExternalLink size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">About shared documents</h3>
              <p className="mt-1 text-sm text-gray-400">
                Documents shared with you by others appear here. You can access and collaborate on these documents based on your permission level.
              </p>
            </div>
          </div>
        </div>

        {/* Shared Documents Section with responsive table layout */}
        <section className="mt-4 md:mt-8">
          <Suspense fallback={<DocumentsSkeleton />}>
            <SharedDocumentsSection email={email} />
          </Suspense>
        </section>
      </div>
    </main>
  );
};

export default SharedPage; 