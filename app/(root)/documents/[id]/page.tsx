'use server';

import React from 'react'
import CollaborativeRoom from '@/components/CollaborativeRoom'
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { getDocument } from '@/lib/actions/room.actions';


const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return redirect('/sign-in');
  }

  const room = await getDocument({ 
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
   });


  return (
    <main className='flex w-full flex-col items-center'>
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={room.users || []}
        currentUserType={room.currentUserType || 'viewer'}
      />
    </main>

  )
}

export default Document