import { getDocuments } from '@/lib/actions/room.actions';
import { SignedIn, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header'
import Notifications from '@/components/Notifications';
import SearchBar from '@/components/SearchBar';
import AddDocumentBtn from '@/components/AddDocumentBtn';
import { Clock, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { dateConverter } from '@/lib/utils';
import { DeleteModal } from '@/components/DeleteModal';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * PAGE COMPONENT PERFORMANCE BEST PRACTICES
 * 
 * 1. COMPONENT STRUCTURE:
 *    - KEEP the component hierarchy with smaller, focused components
 *    - KEEP server components for data-fetching parts
 *    - KEEP client components minimal and focused on interactivity
 *    - DON'T mix data fetching and UI rendering in the same component
 * 
 * 2. SUSPENSE & STREAMING:
 *    - KEEP Suspense boundaries around data-dependent components
 *    - KEEP appropriate skeleton loaders matching component dimensions
 *    - DON'T create unnecessarily nested Suspense boundaries
 *    - ENSURE each suspense boundary has a well-designed fallback
 * 
 * 3. IMAGE OPTIMIZATION:
 *    - KEEP priority={true} for above-the-fold images
 *    - KEEP loading="eager" for LCP (Largest Contentful Paint) images
 *    - USE loading="lazy" for below-the-fold images
 *    - ALWAYS specify width and height to prevent layout shifts
 * 
 * 4. DATA FETCHING:
 *    - USE parallel data fetching with component streaming
 *    - AVOID sequential/waterfall requests
 *    - LEVERAGE cached server actions for repetitive data
 */

// Define interface for document type
interface Document {
  id: string;
  metadata: {
    title: string;
  };
  createdAt: string;
}

// Header section - critical to load fast
function HeaderSection({ email }: { email: string }) {
  return (
    <Header className="sticky left-0 top-0 z-10 border-b border-dark-400">
      <div className="flex flex-1 items-center">
        <div className="relative ml-4 hidden md:block">
          <SearchBar 
            email={email} 
            placeholder="Search documents" 
          />
        </div>
      </div>
      <div className="flex items-center gap-3 lg:gap-4">
        <Notifications />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </Header>
  );
}

// Mobile search section - slightly less critical
function MobileSearchSection({ email }: { email: string }) {
  return (
    <div className="mb-6 block md:hidden">
      <SearchBar 
        email={email} 
        placeholder="Search documents" 
      />
    </div>
  );
}

// Separate component for documents section to enable streaming
const DocumentsSection = async ({ email }: { email: string }) => {
  // This will be streamed in after the initial HTML is sent
  const roomDocuments = await getDocuments(email);
  
  return (
    <>
      {roomDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {roomDocuments.map((document: Document, index: number) => (
            <div key={document.id} className="group relative rounded-lg bg-dark-200 p-5 shadow-md transition-all hover:bg-dark-300 hover:shadow-xl">
              <div className="mb-4 flex h-36 items-center justify-center rounded bg-dark-100/70">
                <Image 
                  src="/assets/icons/doc.svg"
                  alt="file"
                  width={40}
                  height={40}
                  className="opacity-70"
                  priority={index < 4} // Critical for LCP - first 4 images load with priority
                  loading={index < 4 ? "eager" : "lazy"} // Eager for visible, lazy for below fold
                />
              </div>

              <Link href={`/documents/${document.id}`} className="block">
                <h3 className="mb-1 line-clamp-1 text-lg font-medium text-white group-hover:text-accent-primary">{document.metadata.title}</h3>
                <p className="mb-3 text-sm font-light text-gray-400">
                  Edited {dateConverter(document.createdAt.toString())}
                </p>
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="size-6 rounded-full bg-accent-primary ring-2 ring-dark-200" />
                  <div className="size-6 rounded-full bg-dark-500 ring-2 ring-dark-200" />
                </div>
                
                <div className="flex items-center">
                  <DeleteModal roomId={document.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center">
          <Image
            src="/assets/images/empty-documents.png"
            alt="No documents found"
            width={270}
            height={200}
            className="object-contain"
            priority={true} // Empty state image is important for UX
            loading="eager"
          />
          <h3 className="text-center text-lg font-bold text-white">
            Create your first document
          </h3>
        </div>
      )}
    </>
  );
};

// Loading placeholder for documents section
const DocumentsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div key={item} className="flex flex-col gap-2 rounded-xl bg-dark-300 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);

const Home = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const email = clerkUser.emailAddresses[0].emailAddress;

  return (
    <main className="min-h-screen bg-dark-100">
      {/* Priority content - header loads first */}
      <HeaderSection email={email} />
      
      <div className="container mx-auto py-8">
        {/* Mobile search - loaded second */}
        <Suspense fallback={<Skeleton className="h-12 w-full max-w-md" />}>
          <MobileSearchSection email={email} />
        </Suspense>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Documents</h1>
          <AddDocumentBtn 
            userId={clerkUser.id}
            email={email}
          />
        </div>

        {/* Documents section with streaming - loaded last */}
        <section className="mt-8">
          <Suspense fallback={<DocumentsSkeleton />}>
            <DocumentsSection email={email} />
          </Suspense>
        </section>
      </div>
    </main>
  );
};

export default Home;