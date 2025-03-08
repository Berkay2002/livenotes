import { getStarredDocuments } from '@/lib/actions/room.actions';
import { SignedIn, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header'
import Notifications from '@/components/Notifications';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentTableEnhanced } from '@/components/DocumentTableEnhanced';
import { FileText, Star, Info } from 'lucide-react';
import { Document } from '@/types/document';

// Separate component for starred documents section to enable streaming
const StarredDocumentsSection = async ({ email }: { email: string }) => {
  // This will be streamed in after the initial HTML is sent
  const starredDocuments = await getStarredDocuments(email);
  const documents = starredDocuments.data || [];
  
  return (
    <>
      {documents.length > 0 ? (
        <DocumentTableEnhanced documents={documents} userEmail={email} />
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-dark-300 mb-6">
            <Star className="text-gray-400" size={64} />
          </div>
          <h3 className="text-center text-xl font-bold text-white mb-2">
            No starred documents yet
          </h3>
          <p className="text-center text-gray-400 max-w-md">
            Star your favorite documents to access them quickly from this page
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

const StarredPage = async () => {
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
              placeholder="Search starred documents"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary text-white">
              <Star size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white">Starred Documents</h1>
          </div>
          <div className="md:hidden w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary text-white">
                <Star size={16} />
              </div>
              <h1 className="text-xl font-bold text-white">Starred Documents</h1>
            </div>
          </div>
        </div>
        
        {/* Info card about starred documents */}
        <div className="mb-8 rounded-lg border border-dark-400 bg-dark-200 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary">
              <Info size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">About starred documents</h3>
              <p className="mt-1 text-sm text-gray-400">
                Star your important documents for quick access. You can star or unstar documents from the document page or from the document list.
              </p>
            </div>
          </div>
        </div>

        {/* Starred Documents Section with responsive table layout */}
        <section className="mt-4 md:mt-8">
          <Suspense fallback={<DocumentsSkeleton />}>
            <StarredDocumentsSection email={email} />
          </Suspense>
        </section>
      </div>
    </main>
  );
};

export default StarredPage; 