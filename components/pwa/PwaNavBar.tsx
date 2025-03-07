'use client';

import { useStandaloneMode } from '../StandaloneDetector';
import { FileText, Home, Plus, Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PwaNavBarProps {
  activeView: string;
  onChangeView: (view: string) => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onCreateDocument: () => void;
}

export default function PwaNavBar({
  activeView,
  onChangeView,
  onOpenMenu,
  onOpenSearch,
  onCreateDocument,
}: PwaNavBarProps) {
  const { isStandalone } = useStandaloneMode();
  const [isFabOpen, setIsFabOpen] = useState(false);

  // This component will render in both PWA and non-PWA mode but
  // will have additional PWA-specific enhancements

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40",
      "pwa-standalone-padding-bottom" // Using our custom class instead of inline conditional
    )}>
      {/* FAB for quick actions */}
      <div className="absolute -top-16 right-4">
        <AnimatePresence>
          {isFabOpen && (
            <>
              {/* Overlay to catch clicks outside */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-20 z-40"
                onClick={() => setIsFabOpen(false)}
              />
              
              {/* Quick action buttons */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-16 right-0 w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center"
                onClick={() => {
                  onCreateDocument();
                  setIsFabOpen(false);
                }}
              >
                <FileText size={20} />
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-32 right-0 w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center"
                onClick={() => {
                  onOpenSearch();
                  setIsFabOpen(false);
                }}
              >
                <Search size={20} />
              </motion.button>
            </>
          )}
        </AnimatePresence>
        
        <button
          className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center"
          onClick={() => setIsFabOpen(!isFabOpen)}
        >
          {isFabOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {/* Bottom navigation bar */}
      <nav className="flex items-center justify-around h-16">
        <button
          className={cn(
            "flex flex-col items-center justify-center w-20 h-full transition-colors",
            activeView === 'home' ? "text-indigo-600" : "text-gray-500"
          )}
          onClick={() => onChangeView('home')}
        >
          <Home size={22} />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          className={cn(
            "flex flex-col items-center justify-center w-20 h-full transition-colors",
            "text-gray-500"
          )}
          onClick={() => onOpenSearch()}
        >
          <Search size={22} />
          <span className="text-xs mt-1">Search</span>
        </button>

        <div className="w-20 h-full"> 
          {/* Placeholder for FAB space */}
        </div>

        <button
          className={cn(
            "flex flex-col items-center justify-center w-20 h-full transition-colors",
            activeView === 'document' ? "text-indigo-600" : "text-gray-500"
          )}
          onClick={() => onCreateDocument()}
        >
          <FileText size={22} />
          <span className="text-xs mt-1">New</span>
        </button>

        <button
          className={cn(
            "flex flex-col items-center justify-center w-20 h-full transition-colors",
            "text-gray-500"
          )}
          onClick={() => onOpenMenu()}
        >
          <Menu size={22} />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </nav>
    </div>
  );
} 