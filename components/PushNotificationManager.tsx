'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions'
import { useUser } from '@clerk/nextjs'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Bell, BellOff } from 'lucide-react'

// Helper function to convert the VAPID public key to the format required by the browser
function urlBase64ToUint8Array(base64String: string) {
  if (!base64String) {
    console.error('VAPID public key is not available');
    return new Uint8Array();
  }
  
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
 
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { isLoaded, user } = useUser()

  // Check if the browser supports push notifications and if the app is installed as a PWA
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    // Check Push Notification support
    const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(isPushSupported);
    
    // Check if the app is running as an installed PWA
    const isPWAInstalled = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsPWA(isPWAInstalled);
    
    // If supported, register service worker and check subscription status
    if (isPushSupported) {
      registerServiceWorker();
    }
  }, [isLoaded, user]);

  // Register the service worker and check the subscription status
  async function registerServiceWorker() {
    try {
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      console.log('Service Worker registered successfully:', registration);
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      console.log('Existing push subscription:', existingSubscription);
      setSubscription(existingSubscription);
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  }

  // Subscribe to push notifications
  async function subscribeToPush() {
    if (!user) return;
    
    setIsLoading(true);
    setStatus('idle');
    
    try {
      console.log('Subscribing to push notifications...');
      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key is not available');
      }
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      
      console.log('Browser subscription created:', sub);
      setSubscription(sub);
      
      // Send the subscription to the server
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
      
      setStatus('success');
      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }

  // Unsubscribe from push notifications
  async function unsubscribeFromPush() {
    setIsLoading(true);
    setStatus('idle');
    
    try {
      console.log('Unsubscribing from push notifications...');
      if (!subscription) {
        throw new Error('No subscription to unsubscribe from');
      }
      
      // Unsubscribe locally
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Unsubscribe on the server
      await unsubscribeUser();
      
      setStatus('success');
      console.log('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }

  // Send a test notification
  async function sendTestNotification() {
    if (!message.trim() || !subscription) return;
    
    setIsLoading(true);
    setStatus('idle');
    
    try {
      console.log('Sending test notification with message:', message);
      await sendNotification(message);
      setMessage('');
      setStatus('success');
    } catch (error) {
      console.error('Error sending test notification:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }

  // If push notifications are not supported, show a message
  if (!isSupported) {
    return (
      <div className="rounded-lg bg-dark-200 p-5 border border-dark-400">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-dark-300 p-2 rounded-full">
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Push Notifications</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Push notifications are not supported in this browser. To receive notifications when you&apos;re not using the app, please try using a modern browser like Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  // If the app is not installed as a PWA, show installation instructions
  if (!isPWA) {
    return (
      <div className="rounded-lg bg-dark-200 p-5 border border-dark-400">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-dark-300 p-2 rounded-full">
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Push Notifications</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          To enable push notifications, please install LiveNotes as an app on your device. 
          Click the install button in your browser&apos;s address bar or use the &quot;Add to Home Screen&quot; option from your browser&apos;s menu.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-dark-200 p-5 border border-dark-400">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full ${subscription ? 'bg-accent-primary/20' : 'bg-dark-300'}`}>
          {subscription ? (
            <Bell className="h-5 w-5 text-accent-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-medium text-white">Push Notifications</h3>
      </div>
      
      {subscription ? (
        <div>
          <p className="text-gray-400 text-sm mb-4">
            You are currently subscribed to push notifications. You will be notified about important updates even when you&apos;re not using the app.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Send a test notification</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-dark-300 border-dark-400 text-white"
                />
                <Button 
                  onClick={sendTestNotification}
                  disabled={isLoading || !message.trim()}
                  className="whitespace-nowrap"
                >
                  Send Test
                </Button>
              </div>
            </div>
            
            <div>
              <Button 
                variant="destructive"
                onClick={unsubscribeFromPush}
                disabled={isLoading}
              >
                Unsubscribe from Notifications
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-400 text-sm mb-4">
            Enable push notifications to stay updated on important events like shared documents and comments, even when you&apos;re not actively using the app.
          </p>
          
          <Button 
            onClick={subscribeToPush}
            disabled={isLoading}
            className="bg-accent-primary hover:bg-accent-primary/90"
          >
            {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
          </Button>
        </div>
      )}
      
      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2">
          An error occurred. Please try again later.
        </p>
      )}
    </div>
  );
} 