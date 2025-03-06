import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import './globals.css'
import { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import Provider from "./Provider"
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer"

/**
 * PERFORMANCE BEST PRACTICES FOR ROOT LAYOUT
 * 
 * 1. FONT OPTIMIZATION:
 *    - KEEP display: 'swap' to prevent FOIT (Flash of Invisible Text)
 *    - KEEP preload: true for critical fonts
 *    - KEEP the font subset to minimum necessary characters
 * 
 * 2. METADATA & VIEWPORT:
 *    - KEEP viewport settings separate from metadata (Next.js requirement)
 *    - KEEP cache control headers for static metadata
 *    - DON'T add complex metadata that could delay Time To First Byte
 * 
 * 3. PERFORMANCE COMPONENTS:
 *    - KEEP the PerformanceOptimizer component
 *    - DON'T add heavy client components at the root layout level
 *    - PREFER server components for global layouts
 * 
 * 4. CRITICAL RENDERING PATH:
 *    - KEEP <Suspense> boundaries in child pages, not the root layout
 *    - KEEP the body minimal with focused styling
 *    - DON'T add unnecessary context providers in the root layout
 */

// Optimize font loading
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Prevents invisible text while loading
  preload: true,   // Prioritizes font loading
})

export const metadata: Metadata = {
  title: 'LiveDocs',
  description: 'Your go-to collaborative editor',
  other: {
    'Cache-Control': 'public, max-age=3600, must-revalidate'
  }
}

// Separate viewport export (Next.js 14.2+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000'
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
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            fontSans.variable
          )}
        >
          <Provider>
            {/* Performance optimizer - keep this component for optimal Web Vitals */}
            <PerformanceOptimizer />
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  )
}