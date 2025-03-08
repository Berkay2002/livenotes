'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toggleDocumentStar, isDocumentStarred } from '@/lib/actions/room.actions';
import { cn } from '@/lib/utils';

interface StarButtonProps {
  documentId: string;
  userEmail: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

const StarButton = ({ 
  documentId, 
  userEmail, 
  size = 'md', 
  className = '',
  showText = false,
  variant = 'default'
}: StarButtonProps) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get the initial star status
  useEffect(() => {
    const checkStarStatus = async () => {
      try {
        const starred = await isDocumentStarred(documentId, userEmail);
        setIsStarred(starred);
      } catch (error) {
        console.error('Error checking star status:', error);
      }
    };

    checkStarStatus();
  }, [documentId, userEmail]);

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await toggleDocumentStar(documentId, userEmail);
      
      if (result.success) {
        setIsStarred(result.isStarred || false);
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  // Icon sizes
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  // Variant classes
  const variantClasses = {
    default: cn(
      'bg-dark-300 hover:bg-dark-400',
      isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'
    ),
    outline: cn(
      'border border-dark-400 hover:border-dark-500 bg-transparent',
      isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'
    ),
    ghost: cn(
      'bg-transparent hover:bg-dark-300',
      isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'
    )
  };

  // Animation classes for the star
  const starAnimationClass = isStarred ? 'scale-110 transform transition-transform' : '';

  return (
    <button
      onClick={handleToggleStar}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'rounded-md transition-colors relative',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={isStarred ? 'Unstar document' : 'Star document'}
      disabled={isLoading}
      title={isStarred ? 'Unstar document' : 'Star document'}
    >
      <Star 
        size={iconSizes[size]} 
        className={cn(
          'transition-all duration-200',
          starAnimationClass,
          isStarred ? 'fill-yellow-400' : (isHovered ? 'fill-gray-300/20' : '')
        )} 
      />
      
      {showText && (
        <span className={cn(
          'ml-2 text-sm font-medium',
          isStarred ? 'text-yellow-400' : 'text-gray-400'
        )}>
          {isStarred ? 'Starred' : 'Star'}
        </span>
      )}
      
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-dark-300/80 rounded-md">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
    </button>
  );
};

export default StarButton; 