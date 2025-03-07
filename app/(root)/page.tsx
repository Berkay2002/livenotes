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
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to avoid hydration issues
const MobileDocumentView = dynamic(
  () => import('../../components/mobile/MobileDocumentView'),
  { ssr: false }
);

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
  const documents = roomDocuments.data || [];
  
  return (
    <>
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {documents.map((document: Document, index: number) => (
            <div key={document.id} className="group relative rounded-lg bg-dark-200 p-5 shadow-md transition-all hover:bg-dark-300 hover:shadow-xl">
              <div className="mb-4 flex h-36 items-center justify-center rounded bg-dark-100/70">
                <Image 
                  src="/assets/icons/doc.svg"
                  alt="file"
                  width={40}
                  height={40}
                  className="opacity-70"
                  priority={index < 4}
                  loading={index < 4 ? "eager" : "lazy"}
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
            priority={true}
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

// Mobile view with client-side detection
const MobileViewWrapper = () => {
  return (
    <div className="md:hidden">
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <MobileDocumentView />
      </Suspense>
    </div>
  );
};

const Home = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const email = clerkUser.emailAddresses[0].emailAddress;

  return (
    <main className="min-h-screen bg-dark-100">
      {/* Priority content - header loads first */}
      <HeaderSection email={email} />
      
      <div className="container mx-auto py-8">
        {/* Mobile view - client-side rendered */}
        <MobileViewWrapper />

        {/* Desktop view - only shown on larger screens */}
        <div className="hidden md:block">
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
      </div>
    </main>
  );
};

export default Home;