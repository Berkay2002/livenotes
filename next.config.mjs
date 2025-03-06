import { withSentryConfig } from '@sentry/nextjs';

/**
 * NEXT.JS PERFORMANCE CONFIGURATION BEST PRACTICES
 * 
 * 1. IMAGE OPTIMIZATION:
 *    - KEEP the modern image formats (WebP, AVIF) for better compression
 *    - KEEP the appropriate deviceSizes for responsive images
 *    - KEEP minimumCacheTTL for efficient browser caching
 *    - CONSIDER increasing cacheTTL in production for static images
 * 
 * 2. BUILD OPTIMIZATION:
 *    - KEEP removeConsole in production to reduce bundle size
 *    - KEEP compress enabled for better transfer speeds
 *    - DON'T enable experimental features in production without testing
 * 
 * 3. SENTRY INTEGRATION:
 *    - KEEP widenClientFileUpload for better debugging
 *    - KEEP hideSourceMaps to prevent exposing source code
 *    - KEEP disableLogger to reduce bundle size
 *    - CONSIDER setting sampleRate lower in high-traffic production
 * 
 * 4. WEBPACK WARNINGS:
 *    - The "[webpack.cache.PackFileCacheStrategy]" warning only affects dev mode
 *    - It doesn't impact production performance
 *    - If it's bothersome, consider using config.cache.cacheUnaffected = true
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { 
        remotePatterns: [{ protocol: 'https', hostname: 'img.clerk.com' }],
        // Image optimization settings - critical for LCP
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    },
    // Performance optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    // Uncomment to fix webpack cache warning in development (optional)
    // webpack: (config, { dev }) => {
    //   if (dev) {
    //     config.cache.cacheUnaffected = true;
    //   }
    //   return config;
    // },
};

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "berkay-13",
    project: "javascript-nextjs",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from the client
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
