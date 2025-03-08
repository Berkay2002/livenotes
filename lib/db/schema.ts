/**
 * Push notification subscription schema
 */

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
} 