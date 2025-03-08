/**
 * Simple in-memory database for push subscriptions
 */

import { nanoid } from 'nanoid';
import { PushSubscriptionRecord } from './schema';

// In-memory storage for push subscriptions
const subscriptions: Record<string, PushSubscriptionRecord> = {};

/**
 * DB Interface for push subscriptions
 */
export const db = {
  pushSubscriptions: {
    /**
     * Find a subscription by endpoint
     */
    findByEndpoint: (endpoint: string): PushSubscriptionRecord | null => {
      return Object.values(subscriptions).find(sub => sub.endpoint === endpoint) || null;
    },

    /**
     * Find all subscriptions for a user
     */
    findByUser: (userEmail: string): PushSubscriptionRecord[] => {
      return Object.values(subscriptions).filter(sub => sub.userEmail === userEmail);
    },

    /**
     * Create a new subscription
     */
    create: (data: Omit<PushSubscriptionRecord, 'id'>): PushSubscriptionRecord => {
      const id = nanoid();
      const subscription: PushSubscriptionRecord = {
        id,
        ...data
      };
      subscriptions[id] = subscription;
      return subscription;
    },

    /**
     * Update an existing subscription
     */
    update: (endpoint: string, data: Partial<PushSubscriptionRecord>): PushSubscriptionRecord | null => {
      const subscription = Object.values(subscriptions).find(sub => sub.endpoint === endpoint);
      if (!subscription) return null;

      const updatedSubscription = {
        ...subscription,
        ...data,
        updatedAt: new Date().toISOString()
      };
      subscriptions[subscription.id] = updatedSubscription;
      return updatedSubscription;
    },

    /**
     * Delete a subscription by endpoint
     */
    deleteByEndpoint: (endpoint: string): boolean => {
      const subscription = Object.values(subscriptions).find(sub => sub.endpoint === endpoint);
      if (!subscription) return false;

      delete subscriptions[subscription.id];
      return true;
    },

    /**
     * Get all subscriptions
     */
    getAll: (): PushSubscriptionRecord[] => {
      return Object.values(subscriptions);
    }
  }
}; 