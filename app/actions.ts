'use server'

import webpush from 'web-push'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

// Define the PushSubscription interface expected by web-push
interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:berkayorhan@hotmail.se', // Replace with your actual email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// In-memory storage - in production use a database
let subscriptions: Map<string, WebPushSubscription> = new Map()

/**
 * Subscribe user to push notifications
 */
export async function subscribeUser(sub: PushSubscription) {
  try {
    // Convert browser PushSubscription to web-push compatible format
    const subscription: WebPushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: JSON.parse(JSON.stringify(sub)).keys.p256dh,
        auth: JSON.parse(JSON.stringify(sub)).keys.auth
      }
    };
    
    const subscriptionJSON = JSON.stringify(subscription)
    const subscriptionHash = createHash('sha256').update(subscriptionJSON).digest('hex')
    
    // Store subscription
    subscriptions.set(subscriptionHash, subscription)
    
    // Store subscription hash in cookie for later reference
    cookies().set('subscription_id', subscriptionHash, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    
    console.log('User subscribed to push notifications')
    return { success: true }
  } catch (error) {
    console.error('Error subscribing user:', error)
    return { success: false, error: 'Failed to subscribe' }
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeUser() {
  try {
    const subscriptionId = cookies().get('subscription_id')?.value
    
    if (subscriptionId) {
      // Remove subscription
      subscriptions.delete(subscriptionId)
      
      // Remove cookie
      cookies().delete('subscription_id')
    }
    
    console.log('User unsubscribed from push notifications')
    return { success: true }
  } catch (error) {
    console.error('Error unsubscribing user:', error)
    return { success: false, error: 'Failed to unsubscribe' }
  }
}

/**
 * Send a push notification
 */
export async function sendNotification(message: string) {
  if (subscriptions.size === 0) {
    return { success: false, error: 'No subscriptions available' }
  }
  
  try {
    // Get current user's subscription
    const subscriptionId = cookies().get('subscription_id')?.value
    
    if (!subscriptionId || !subscriptions.has(subscriptionId)) {
      return { success: false, error: 'No valid subscription found' }
    }
    
    const subscription = subscriptions.get(subscriptionId)!
    
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'LiveNotes Notification',
        body: message,
        icon: '/icons/icon-192x192.png',
        timestamp: Date.now(),
        data: {
          url: '/'
        }
      })
    )
    
    console.log('Push notification sent successfully')
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

/**
 * Send a notification to a specific user by email
 */
export async function sendNotificationToUser(userEmail: string, title: string, body: string, url: string = '/') {
  try {
    // In a real app, you would look up subscriptions by user email in a database
    // For this example, we'll just log that we would send to this user
    console.log(`Would send notification to ${userEmail}: ${title} - ${body}`)
    
    return { success: true, message: `Notification would be sent to ${userEmail}` }
  } catch (error) {
    console.error('Error sending push notification to user:', error)
    return { success: false, error: 'Failed to send notification to user' }
  }
} 