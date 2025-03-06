import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://c3b70c2b9556a0db544c21005b83c847@o4508924336406528.ingest.de.sentry.io/4508924337848400',
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, adjust in production
  
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
  
  // Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to adjust this value in production
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change this to 1.0 to capture 100% of sessions when an error occurs
}); 