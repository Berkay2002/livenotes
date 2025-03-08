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

// Function to get documents shared with the user (where user is not the creator)
export async function getSharedDocuments(email: string, searchQuery?: string) {
  const cacheKey = `shared-documents-${email}-${searchQuery || ''}`;

  try {
    // Get from cache or fetch from Liveblocks with improved error handling
    return await getCachedData(cacheKey, async () => {
      console.time('getSharedDocuments');
      
      // Get all rooms for the user
      const rooms = await liveblocks.getRooms({ userId: email });
      
      // Filter rooms where user has access but is not the creator
      const sharedRooms = {
        ...rooms,
        data: rooms.data.filter((room: any) => {
          // Filter out rooms where the user is the creator
          return room.metadata?.email !== email;
        })
      };
      
      // If search query is provided, further filter rooms by title
      if (searchQuery && searchQuery.trim() !== '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        
        // Filter rooms where title contains the search query (case insensitive)
        const filteredRooms = {
          ...sharedRooms,
          data: sharedRooms.data.filter((room: any) => {
            const title = room.metadata?.title?.toLowerCase() || '';
            return title.includes(lowerCaseQuery);
          })
        };
        
        console.timeEnd('getSharedDocuments');
        return parseStringify(filteredRooms);
      }
      
      console.timeEnd('getSharedDocuments');
      return parseStringify(sharedRooms);
    });
  } catch (error) {
    console.error("Error fetching shared documents:", error);
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

    // Create notification in user's inbox
    const notificationId = nanoid();
    
    await liveblocks.triggerInboxNotification({
      userId: email,
      kind: '$documentAccess',
      subjectId: notificationId,
      roomId,
      activityData: {
        title: `You have been granted ${userType} access to a document`,
        userType,
        documentTitle: room.metadata?.title?.toString() || 'Document',
        sharedBy: typeof updatedBy === 'string' ? updatedBy : 'A user'
      }
    });

    // Send push notification to the user if they have subscriptions
    await sendDocumentSharedPushNotification({
      userEmail: email,
      documentId: roomId,
      documentTitle: room.metadata?.title?.toString() || 'Document',
      sharedBy: typeof updatedBy === 'string' ? updatedBy : 'A user',
      shareType: userType
    });

    return parseStringify(room);
  } catch (error) {
    console.error('Error updating document access:', error);
    return null;
  }
};

/**
 * Send push notification when a document is shared with a user
 */
export const sendDocumentSharedPushNotification = async ({
  userEmail,
  documentId,
  documentTitle,
  sharedBy,
  shareType
}: {
  userEmail: string;
  documentId: string;
  documentTitle: string;
  sharedBy: string;
  shareType: string;
}) => {
  try {
    const shareTypeLabel = shareType === 'editor' ? 'edit' : 'view';
    
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        title: 'Document Shared',
        body: `${sharedBy} shared "${documentTitle}" with you (${shareTypeLabel} access)`,
        url: `/documents/${documentId}`,
        documentId,
        documentTitle
      }),
    });

    if (!response.ok) {
      console.error('Failed to send push notification:', await response.text());
    }
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

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

interface StarToggleResult {
  success: boolean;
  isStarred?: boolean;
  error?: string;
}

// Toggle star status for a document
export const toggleDocumentStar = async (roomId: string, email: string): Promise<StarToggleResult> => {
  try {
    // Get the current document
    const document = await liveblocks.getRoom(roomId);
    
    // If document doesn't exist, throw error
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Get current starred users (ensure it's an array)
    const starredBy = Array.isArray(document.metadata?.starredBy) 
      ? document.metadata.starredBy 
      : [];
    
    // Check if user already starred the document
    const isStarred = starredBy.includes(email);
    
    // Update the starred users list
    const updatedStarredBy = isStarred
      ? starredBy.filter((userEmail: string) => userEmail !== email) // Remove user if already starred
      : [...starredBy, email]; // Add user if not starred
    
    // Update document metadata
    await liveblocks.updateRoom(roomId, {
      metadata: {
        ...document.metadata,
        starredBy: updatedStarredBy,
      },
    });
    
    // Return the updated star status
    return {
      success: true,
      isStarred: !isStarred,
    };
  } catch (error) {
    console.error('Error toggling document star:', error);
    return {
      success: false,
      error: 'Failed to update star status',
    };
  }
};

// Get all documents starred by a user
export async function getStarredDocuments(email: string, searchQuery?: string) {
  const cacheKey = `starred-documents-${email}-${searchQuery || ''}`;

  try {
    // Get from cache or fetch from Liveblocks
    return await getCachedData(cacheKey, async () => {
      console.time('getStarredDocuments');
      
      // Get all rooms for the user
      const rooms = await liveblocks.getRooms({ userId: email });
      
      // Filter rooms that the user has starred
      const starredRooms = {
        ...rooms,
        data: rooms.data.filter((room: any) => {
          const starredBy = Array.isArray(room.metadata?.starredBy) 
            ? room.metadata.starredBy 
            : [];
          return starredBy.includes(email);
        })
      };
      
      // If search query is provided, further filter rooms by title
      if (searchQuery && searchQuery.trim() !== '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        
        // Filter rooms where title contains the search query (case insensitive)
        const filteredRooms = {
          ...starredRooms,
          data: starredRooms.data.filter((room: any) => {
            const title = room.metadata?.title?.toLowerCase() || '';
            return title.includes(lowerCaseQuery);
          })
        };
        
        console.timeEnd('getStarredDocuments');
        return parseStringify(filteredRooms);
      }
      
      console.timeEnd('getStarredDocuments');
      return parseStringify(starredRooms);
    });
  } catch (error) {
    console.error("Error fetching starred documents:", error);
    // Return empty array instead of throwing an error
    return parseStringify({ data: [] });
  }
}

// Check if a document is starred by a user
export const isDocumentStarred = async (roomId: string, email: string): Promise<boolean> => {
  try {
    const document = await liveblocks.getRoom(roomId);
    if (!document) return false;
    
    const starredBy = Array.isArray(document.metadata?.starredBy) 
      ? document.metadata.starredBy 
      : [];
      
    return Boolean(starredBy.includes(email));
  } catch (error) {
    console.error('Error checking document star status:', error);
    return false;
  }
};

/**
 * Send push notification when a user is mentioned in a comment
 */
export const sendMentionPushNotification = async ({
  userEmail,
  documentId,
  documentTitle,
  mentionedBy,
  commentText
}: {
  userEmail: string;
  documentId: string;
  documentTitle: string;
  mentionedBy: string;
  commentText: string;
}) => {
  try {
    // Truncate comment text if it's too long (for notification preview)
    const truncatedComment = commentText.length > 50
      ? `${commentText.substring(0, 50)}...`
      : commentText;
    
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        title: 'Mentioned in Comment',
        body: `${mentionedBy} mentioned you in ${documentTitle}: "${truncatedComment}"`,
        url: `/documents/${documentId}`,
        documentId,
        documentTitle,
        type: 'mention'
      }),
    });

    if (!response.ok) {
      console.error('Failed to send mention push notification:', await response.text());
    }
    
    return true;
  } catch (error) {
    console.error('Error sending mention push notification:', error);
    return false;
  }
};

/**
 * Send push notification when a comment is added to a user's document
 */
export const sendCommentPushNotification = async ({
  userEmail,
  documentId,
  documentTitle,
  commentedBy,
  commentText
}: {
  userEmail: string;
  documentId: string;
  documentTitle: string;
  commentedBy: string;
  commentText: string;
}) => {
  try {
    // Skip if commenter is the document owner (no need to notify yourself)
    if (commentedBy === userEmail) return true;
    
    // Truncate comment text if it's too long
    const truncatedComment = commentText.length > 50
      ? `${commentText.substring(0, 50)}...`
      : commentText;
    
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        title: 'New Comment',
        body: `${commentedBy} commented on ${documentTitle}: "${truncatedComment}"`,
        url: `/documents/${documentId}`,
        documentId,
        documentTitle,
        type: 'comment'
      }),
    });

    if (!response.ok) {
      console.error('Failed to send comment push notification:', await response.text());
    }
    
    return true;
  } catch (error) {
    console.error('Error sending comment push notification:', error);
    return false;
  }
};