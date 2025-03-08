// This file will be used by next-pwa to generate the service worker

// Import push notification handling
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