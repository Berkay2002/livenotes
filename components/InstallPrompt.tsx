'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if this is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    // Only show after a delay to not interrupt initial user experience
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 5000) // Show after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [])

  // Don't show if not iOS, already installed, or not ready to be shown
  if (!isIOS || isStandalone || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-dark-200 rounded-lg shadow-lg border border-dark-400 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
          <AlertCircle className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white">Install LiveNotes</h4>
          <p className="mt-1 text-sm text-gray-400">
            To use push notifications and get the best experience, please install LiveNotes to your home screen.
          </p>
          <div className="mt-3 space-y-2 text-sm text-gray-300">
            <p>1. Tap the share button <span className="inline-block">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
              </svg>
            </span></p>
            <p>2. Scroll and tap &quot;Add to Home Screen&quot;</p>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="mt-3 px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded text-sm text-white"
          >
            Got it
          </button>
        </div>
        <button 
          onClick={() => setIsVisible(false)} 
          className="text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
} 