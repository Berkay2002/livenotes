'use client';

import React from 'react';
import { FileText, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { dateConverter } from '@/lib/utils';
import { useStandaloneMode } from '../StandaloneDetector';

interface PwaDocumentCardProps {
  id: string;
  title: string;
  createdAt: string;
  onClick: () => void;
  onMenuClick: () => void;
}

export default function PwaDocumentCard({
  id,
  title,
  createdAt,
  onClick,
  onMenuClick,
}: PwaDocumentCardProps) {
  const { isStandalone } = useStandaloneMode();
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden"
    >
      <div 
        className="flex items-center p-4 pwa-tap-target"
        onClick={onClick}
      >
        <div className="flex-shrink-0 mr-3 bg-indigo-100 rounded-lg p-3">
          <FileText className="text-indigo-600 h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">
            {title || "Untitled Document"}
          </h3>
          <p className="text-gray-500 text-sm">
            {dateConverter(createdAt)}
          </p>
        </div>
        
        <button 
          className="ml-2 p-2 rounded-full hover:bg-gray-100 pwa-tap-target"
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick();
          }}
        >
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </motion.div>
  );
} 