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
import { InstallPrompt } from '@/components/InstallPrompt'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: 'LiveNotes',
  description: 'A collaborative note-taking platform with real-time editing',
  applicationName: 'LiveNotes',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LiveNotes',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/icons/favicon-32x32.png',
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-dark-100 font-sans antialiased", fontSans.variable)}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 'bg-accent-primary hover:bg-accent-primary/80 text-accent-contrast',
              card: 'bg-dark-200 border-dark-400',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-dark-300 border-dark-400 text-white',
              dividerLine: 'bg-dark-400',
              dividerText: 'text-gray-400',
              formField: 'text-white',
              formFieldLabel: 'text-gray-400 font-normal',
              inpuLabel: 'text-gray-400 font-normal',
              formFieldInput: 'bg-dark-300 border-dark-400',
              footer: 'hidden',
              footerActionLink: 'text-white font-normal',
              footerActionText: 'text-gray-400 font-normal',
              identityPreview: 'bg-dark-300 border-dark-400',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-accent-primary hover:text-accent-primary/80',
            }
          }}
        >
          <Provider>
            <PerformanceOptimizer />
            <ResponsiveLayout>
              {children}
            </ResponsiveLayout>
            <InstallPrompt />
            <Analytics />
          </Provider>
        </ClerkProvider>
      </body>
    </html>
  )
}