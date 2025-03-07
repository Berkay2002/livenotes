'use client';

import { Search, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { DocumentData } from '@/types/document';
import { getDocuments } from '@/lib/actions/room.actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { dateConverter } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface SearchBarProps {
  email: string;
  placeholder?: string;
}

const SearchBar = ({ email, placeholder = "Search documents" }: SearchBarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchBarWidth, setSearchBarWidth] = useState(0);
  const debouncedValue = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Update search bar width for popup
  useEffect(() => {
    const updateWidth = () => {
      if (searchBarRef.current) {
        setSearchBarWidth(searchBarRef.current.offsetWidth);
      }
    };
    
    // Initial update
    updateWidth();
    
    // Update on resize
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedValue.trim() === '') {
        setSearchResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getDocuments(email, debouncedValue);
        setSearchResults(results.data || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Error searching documents:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [debouncedValue, email]);

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleDocumentClick = (id: string) => {
    router.push(`/documents/${id}`);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen && searchResults.length > 0} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div ref={searchBarRef} className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-dark-400 bg-dark-200 pl-10 pr-10 text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-dark-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-accent-primary"></div>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 bg-dark-200 border border-dark-400 shadow-lg rounded-xl overflow-hidden" 
        style={{ width: `${searchBarWidth}px` }}
        align="start" 
        sideOffset={4}
      >
        <div className="text-xs font-medium text-gray-400 p-2 border-b border-dark-400">
          {searchResults.length === 0
            ? 'No documents found'
            : `${searchResults.length} document${searchResults.length !== 1 ? 's' : ''} found`}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {searchResults.map((doc) => (
            <button
              key={doc.id}
              className="w-full text-left p-3 hover:bg-dark-300 flex items-start gap-3 transition-colors border-b border-dark-400/50 last:border-b-0"
              onClick={() => handleDocumentClick(doc.id)}
            >
              <div className="flex-shrink-0 p-1 bg-dark-300 rounded mt-1">
                <FileText className="h-4 w-4 text-accent-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white line-clamp-1">{doc.metadata.title}</h4>
                <p className="text-xs text-gray-400">
                  Edited {dateConverter(doc.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;