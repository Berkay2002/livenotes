#!/usr/bin/env node

/**
 * Script to generate VAPID keys for web push notifications
 * Run with: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys generated successfully');
console.log('--------------------------------------------------');
console.log('Public Key:', vapidKeys.publicKey, '\nPrivate Key:', vapidKeys.privateKey);
console.log('--------------------------------------------------');

// Path to .env.local file
const envFilePath = path.join(process.cwd(), '.env.local');

// Update .env.local file with VAPID keys
console.log('Updating .env.local file...');

// Check if .env.local exists
let envFileContent = '';
if (fs.existsSync(envFilePath)) {
  // Read current content
  envFileContent = fs.readFileSync(envFilePath, 'utf8');

  // Remove existing VAPID keys if present
  envFileContent = envFileContent
    .replace(/^NEXT_PUBLIC_VAPID_PUBLIC_KEY=.*$/m, '')
    .replace(/^VAPID_PRIVATE_KEY=.*$/m, '')
    .replace(/^VAPID_SUBJECT=.*$/m, '')
    .replace(/\n\n+/g, '\n\n'); // Clean up multiple empty lines
} 

// Append VAPID keys
envFileContent = envFileContent.trim() + '\n\n# VAPID Keys for Push Notifications\n';
envFileContent += `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`;
envFileContent += `VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`;
envFileContent += `VAPID_SUBJECT=mailto:example@livenotes.com\n`;  // Replace with your email

// Write back to .env.local
fs.writeFileSync(envFilePath, envFileContent);
console.log('.env.local file updated with VAPID keys');

console.log('\nNOTE: Your VAPID keys have been generated and saved.');
console.log('Be sure to use a valid email address for VAPID_SUBJECT in your .env.local file.'); 