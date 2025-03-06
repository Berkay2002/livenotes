export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    require('./sentry.server.config.js');
  } else if (process.env.NEXT_RUNTIME === 'edge') {
    require('./sentry.edge.config.js');
  } else {
    require('./sentry.client.config.js');
  }
} 