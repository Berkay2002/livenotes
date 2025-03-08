'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useThreads, useUser as useLiveblocksUser } from '@liveblocks/react/suspense';
import { sendCommentPushNotification, sendMentionPushNotification } from '@/lib/actions/room.actions';
import { useRouter } from 'next/navigation';
import { CommentData, ThreadData } from '@liveblocks/client';

interface CommentNotificationHandlerProps {
  roomId: string;
  documentTitle: string;
  documentOwnerEmail: string;
}

/**
 * This component handles sending push notifications for comments and mentions
 * It listens to Liveblocks comment events and triggers push notifications
 */
export function CommentNotificationHandler({ 
  roomId, 
  documentTitle, 
  documentOwnerEmail 
}: CommentNotificationHandlerProps) {
  const { user } = useUser();
  const { threads } = useThreads();
  const router = useRouter();
  
  // Use refs to persist these sets across renders
  const processedThreadIds = useRef(new Set<string>()).current;
  const processedCommentIds = useRef(new Set<string>()).current;
  
  useEffect(() => {
    if (!user || !threads || threads.length === 0) return;

    const currentUserEmail = user.primaryEmailAddress?.emailAddress;
    if (!currentUserEmail) return;

    // Process each thread for new comments
    threads.forEach((thread: ThreadData) => {
      // Skip if we've already processed this entire thread
      if (processedThreadIds.has(thread.id)) return;
      
      const comments = thread.comments;
      if (!comments || comments.length === 0) return;
      
      // Get the most recent comment
      const latestComment = comments[comments.length - 1];
      
      // Skip if we've already processed this comment
      if (processedCommentIds.has(latestComment.id)) return;
      
      // Mark as processed
      processedCommentIds.add(latestComment.id);
      
      // Only process comments created in the last minute to avoid sending notifications for old comments
      const commentCreatedAt = new Date(latestComment.createdAt);
      const now = new Date();
      const timeDifferenceInSeconds = (now.getTime() - commentCreatedAt.getTime()) / 1000;
      
      if (timeDifferenceInSeconds > 60) {
        return; // Skip comments older than 1 minute
      }
      
      // Get the user email from Liveblocks userId (which is the email in our case)
      const commenterEmail = latestComment.userId;
      
      // Skip if the comment was created by the current user
      if (commenterEmail === currentUserEmail) return;
      
      // Extract the comment text
      const commentText = latestComment.body?.content
        .map((node: any) => node.text || '')
        .join('') || '';
      
      // Check for mentions in the comment
      const mentions = latestComment.body?.content
        .filter((node: any) => node.type === 'mention')
        .map((mention: any) => mention.id) || [];
      
      // Send mention notifications
      mentions.forEach(async (mentionedEmail: string) => {
        // Skip if the mentioned user is the commenter
        if (mentionedEmail === commenterEmail) return;
        
        await sendMentionPushNotification({
          userEmail: mentionedEmail,
          documentId: roomId,
          documentTitle,
          mentionedBy: commenterEmail,
          commentText
        });
      });
      
      // Send notification to document owner if they're not the commenter and not already mentioned
      if (
        documentOwnerEmail !== commenterEmail && 
        !mentions.includes(documentOwnerEmail)
      ) {
        sendCommentPushNotification({
          userEmail: documentOwnerEmail,
          documentId: roomId,
          documentTitle,
          commentedBy: commenterEmail,
          commentText
        });
      }
    });
    
    // Mark all threads as processed after initial load
    if (threads.length > 0 && processedThreadIds.size === 0) {
      threads.forEach((thread: ThreadData) => {
        processedThreadIds.add(thread.id);
        thread.comments.forEach((comment: CommentData) => {
          processedCommentIds.add(comment.id);
        });
      });
    }
  }, [threads, user, roomId, documentTitle, documentOwnerEmail, processedThreadIds, processedCommentIds]);

  // This component doesn't render anything
  return null;
}

export default CommentNotificationHandler; 