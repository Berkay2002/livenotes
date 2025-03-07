import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import './globals.css'
import { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import Provider from "./Provider"
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer"
import ResponsiveLayout from "@/components/ui/ResponsiveLayout"
import { Analytics } from "@vercel/analytics/react"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: 'LiveNotes',
  description: 'Your go-to collaborative editor',
  manifest: '/manifest.json',
  applicationName: 'LiveNotes',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LiveNotes',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'Cache-Control': 'public, max-age=3600, must-revalidate',
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { 
          colorPrimary: "#3371FF" ,
          fontSize: '16px'
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <meta name="apple-mobile-web-app-status-bar" content="#4f46e5" />
        </head>
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            fontSans.variable
          )}
        >
          <Provider>
            <PerformanceOptimizer />
            <ResponsiveLayout>
              {children}
            </ResponsiveLayout>
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  )
}