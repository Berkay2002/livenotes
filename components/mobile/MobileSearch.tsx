import React, { useState, useEffect } from 'react';
import { X, Search, FileText } from 'lucide-react';

interface MobileSearchProps {
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  date: string;
}

const MobileSearch: React.FC<MobileSearchProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  
  // Mock search results - replace with actual search implementation
  useEffect(() => {
    if (query.length > 0) {
      setResults([
        { id: '1', title: 'Project Proposal', date: '2 days ago' },
        { id: '2', title: 'Meeting Notes', date: '1 week ago' },
        { id: '3', title: 'Product Roadmap', date: 'Just now' }
      ]);
    } else {
      setResults([]);
    }
  }, [query]);
  
  return (
    <div className="absolute inset-0 z-20 bg-dark-100 p-4 pt-0 flex flex-col h-full">
      <div className="flex items-center gap-2 py-3 sticky top-0 bg-dark-100">
        <button onClick={onClose} className="p-2">
          <X size={22} className="text-white" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 bg-dark-200 border border-dark-400 rounded-lg pl-10 pr-4 text-white focus:border-accent-primary focus:outline-none"
            autoFocus
          />
          <Search size={18} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {results.length > 0 ? (
          <div className="mt-2 space-y-3">
            {results.map(doc => (
              <div key={doc.id} className="bg-dark-200 p-3 rounded-lg flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-dark-300 rounded mt-1">
                  <FileText size={16} className="text-accent-primary" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{doc.title}</h4>
                  <p className="text-gray-400 text-sm">{doc.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : query.length > 0 ? (
          <div className="flex flex-col items-center justify-center mt-10">
            <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-white text-center">No documents found matching &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          <div className="text-gray-400 text-center mt-10">
            <p>Type to search your documents</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearch;