import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { 
        remotePatterns: [{ protocol: 'https', hostname: 'img.clerk.com' }],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self'",
                    },
                ],
            },
        ];
    },
};

// Configure PWA
const withPWAConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    publicExcludes: ['!icons/**/*'],
    buildExcludes: [/chunks\/.*$/],
    // Specify the custom service worker file to include
    sw: 'sw.js',
    swSrc: 'public/custom-sw.js'
});

export default withSentryConfig(
    withPWAConfig(nextConfig),
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
