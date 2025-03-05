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

const Home = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const roomDocuments = await getDocuments(clerkUser.emailAddresses[0].emailAddress);

  return (
    <main className="min-h-screen bg-dark-100">
      {/* Header */}
      <Header className="sticky left-0 top-0 z-10 border-b border-dark-400">
        <div className="flex flex-1 items-center">
          <div className="relative ml-4 hidden md:block">
            <SearchBar 
              email={clerkUser.emailAddresses[0].emailAddress} 
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

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-28-semibold mb-2 text-white">Welcome back, {clerkUser.firstName}</h1>
          <p className="text-gray-300">Create, edit and collaborate on documents in real-time</p>
        </div>

        {/* Mobile Search */}
        <div className="mb-6 block md:hidden">
          <SearchBar 
            email={clerkUser.emailAddresses[0].emailAddress} 
            placeholder="Search documents" 
          />
        </div>

        {/* Quick Action Button */}
        <div className="mb-12">
          <AddDocumentBtn 
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>

        {/* Recent Documents Section */}
        {roomDocuments.data.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Documents</h2>
              <button className="flex items-center gap-1 text-sm text-gray-300 hover:text-accent-primary">
                <Clock className="h-4 w-4" />
                <span>View all</span>
              </button>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roomDocuments.data.map(({ id, metadata, createdAt }: any) => (
                <div key={id} className="group relative rounded-lg bg-dark-200 p-5 shadow-md transition-all hover:bg-dark-300 hover:shadow-xl">
                  <div className="mb-4 flex h-36 items-center justify-center rounded bg-dark-100/70">
                    <Image 
                      src="/assets/icons/doc.svg"
                      alt="file"
                      width={40}
                      height={40}
                      className="opacity-70"
                    />
                  </div>

                  <Link href={`/documents/${id}`} className="block">
                    <h3 className="mb-1 line-clamp-1 text-lg font-medium text-white group-hover:text-accent-primary">{metadata.title}</h3>
                    <p className="mb-3 text-sm font-light text-gray-400">
                      Edited {dateConverter(createdAt)}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="size-6 rounded-full bg-accent-primary ring-2 ring-dark-200" />
                      <div className="size-6 rounded-full bg-dark-500 ring-2 ring-dark-200" />
                    </div>
                    
                    <div className="flex items-center">
                      <DeleteModal roomId={id} />
                    </div>
                  </div>
                </div>
              ))}

              {/* New Document Card */}
              <div className="flex h-[230px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-dark-400 bg-dark-200 p-5 transition-colors hover:border-accent-primary/50 hover:bg-dark-300">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dark-300">
                  <Plus className="h-6 w-6 text-accent-primary" />
                </div>
                <h3 className="mb-2 text-center text-lg font-medium text-white">Create New Document</h3>
                <p className="mb-4 text-center text-sm text-gray-400">Start with a blank page</p>
                <AddDocumentBtn 
                  userId={clerkUser.id}
                  email={clerkUser.emailAddresses[0].emailAddress}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-dark-200 py-16 shadow-md">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-dark-300">
              <FileText className="h-10 w-10 text-accent-primary" />
            </div>
            <h2 className="mb-3 text-xl font-semibold text-white">No documents yet</h2>
            <p className="mb-8 max-w-md text-center text-gray-400">Create your first document to start collaborating in real-time with your team</p>
            <AddDocumentBtn 
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;