'use server';

import { nanoid } from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';

// Increase cache TTL for better performance
const CACHE_TTL = 60 * 1000; // 60 seconds (up from 30)
const cache = new Map<string, { data: any; timestamp: number }>();

// Improve the helper function to get data from cache or fetch it
async function getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl = CACHE_TTL): Promise<T> {
  const now = Date.now();
  const cachedItem = cache.get(key);

  // Return cached data if it exists and is still valid
  if (cachedItem && now - cachedItem.timestamp < ttl) {
    console.log(`Cache hit for ${key}`);
    return cachedItem.data;
  }

  console.log(`Cache miss for ${key}, fetching fresh data...`);
  
  // Fetch fresh data with timeout to avoid hanging requests
  try {
    // Add timeout to prevent long-running requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
    
    // Race the actual fetch against the timeout
    const data = await Promise.race([fetchFn(), timeoutPromise]) as T;
    
    // Store in cache
    cache.set(key, { data, timestamp: now });
    
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${key}:`, error);
    
    // Return stale cache if available rather than failing
    if (cachedItem) {
      console.log(`Returning stale data for ${key}`);
      return cachedItem.data;
    }
    
    throw error;
  }
}

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: 'Untitled'
    }

    const usersAccesses: RoomAccesses = {
      [email]: ['room:write']
    }

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: []
    });
    
    revalidatePath('/');

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
  }
}

export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {
  try {
      const room = await liveblocks.getRoom(roomId);
    
      const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    
      if(!hasAccess) {
        throw new Error('You do not have access to this document');
      }
    
      return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while getting a room: ${error}`);
  }
}

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title
      }
    })

    revalidatePath(`/documents/${roomId}`);

    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while updating a room: ${error}`);
  }
}

// This function is now marked with "use server" to be callable from client components
export async function getDocuments(email: string, searchQuery?: string) {
  const cacheKey = `documents-${email}-${searchQuery || ''}`;

  try {
    // Get from cache or fetch from Liveblocks with improved error handling
    return await getCachedData(cacheKey, async () => {
      console.time('getDocuments');
      
      // Get all rooms for the user
      const rooms = await liveblocks.getRooms({ userId: email });
      
      // If search query is provided, filter rooms by title
      if (searchQuery && searchQuery.trim() !== '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        
        // Filter rooms where title contains the search query (case insensitive)
        const filteredRooms = {
          ...rooms,
          data: rooms.data.filter((room: any) => {
            const title = room.metadata?.title?.toLowerCase() || '';
            return title.includes(lowerCaseQuery);
          })
        };
        
        console.timeEnd('getDocuments');
        return parseStringify(filteredRooms);
      }
      
      console.timeEnd('getDocuments');
      return parseStringify(rooms);
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    // Return empty array instead of throwing an error
    return parseStringify({ data: [] });
  }
}

export const updateDocumentAccess = async ({ roomId, email, userType, updatedBy }: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    }

    const room = await liveblocks.updateRoom(roomId, { 
      usersAccesses
    })

    if(room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email
        },
        roomId
      })
    }

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room access: ${error}`);
  }
}

export const removeCollaborator = async ({ roomId, email }: {roomId: string, email: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId)

    if(room.metadata.email === email) {
      throw new Error('You cannot remove yourself from the document');
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null
      }
    })

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
}

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
}