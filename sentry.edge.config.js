import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://c3b70c2b9556a0db544c21005b83c847@o4508924336406528.ingest.de.sentry.io/4508924337848400',
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, adjust in production
}); 