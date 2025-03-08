# Push Notifications for LiveNotes

This document explains how to set up and use push notifications in the LiveNotes application.

## Overview

Push notifications allow PWA (Progressive Web App) users to receive notifications even when they're not actively using the application. This is particularly useful for mobile users who have installed the app on their home screen.

## Features

- Receive notifications when documents are shared with you
- Get updates about comments and edits on your documents
- Stay informed about important system announcements
- Works on both desktop and mobile PWAs

## Setup Instructions

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications to work. To generate these keys:

```bash
# Make sure web-push is installed
npm install web-push --save

# Run the key generation script
node scripts/generate-vapid-keys.js
```

This will automatically generate the keys and update your `.env.local` file. Alternatively, you can run:

```bash
npx web-push generate-vapid-keys
```

And then manually add the keys to your `.env.local` file:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 2. Update the Service Worker

Make sure your service worker is configured to handle push events. The service worker code is already set up in `lib/custom-sw.js`.

### 3. Configure Your Environment

Make sure the following environment variables are set in your `.env.local` file:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

Replace `your-email@example.com` with a valid email address that you control.

## How It Works

### Subscription Flow

1. When a user visits the application, they'll be prompted to enable notifications (if using a PWA)
2. If they accept, their browser generates a subscription object
3. This subscription is sent to the server and stored
4. When a notification needs to be sent, the server pushes it to all relevant subscriptions

### Triggering Notifications

Notifications are triggered in several cases:

1. When a document is shared with a user
2. When a document is commented on
3. When a user is mentioned in a comment
4. For system announcements

## Using the API

### Sending a Push Notification

```typescript
// Example: Sending a notification when a document is shared
await fetch('/api/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userEmail: 'recipient@example.com',
    title: 'Document Shared',
    body: 'Alice shared "Project Notes" with you',
    url: '/documents/doc-id-here',
    documentId: 'doc-id-here',
    documentTitle: 'Project Notes'
  }),
});
```

### Managing Subscriptions

Users can manage their notification preferences in the Settings page.

## Troubleshooting

If push notifications aren't working:

1. Make sure you're using the application as a PWA (installed on home screen)
2. Check that notification permissions are granted in your browser settings
3. Verify that your VAPID keys are correctly configured
4. Check the browser console for any errors
5. Make sure the service worker is registered and active

## Browser Support

Push notifications are supported in:

- Chrome (Desktop & Android)
- Firefox (Desktop & Android)
- Edge
- Safari (macOS & iOS 16.4+)
- Samsung Internet

Note that iOS support for push notifications in PWAs is relatively recent (iOS 16.4+). 