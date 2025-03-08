/**
 * Custom service worker for handling push notifications
 * This should be imported in your existing service worker (sw.js)
 */

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event with no data received');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification received:', data);

    const title = data.title || 'LiveNotes';
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      timestamp: data.timestamp,
      vibrate: [100, 50, 100],
      data: data.data || {}
    };

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Get the notification data
  const data = event.notification.data || {};
  
  // If there's a URL, open it
  if (data.url) {
    // This will only work if there's a client open
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if a window client already exists
        for (const client of clientList) {
          if (client.url === data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window client exists, open a new one
        if (clients.openWindow) {
          return clients.openWindow(data.url);
        }
      })
    );
  }
}); 