'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function SearchIntegration({ className = '', onSearch }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef?.current && !containerRef?.current?.contains(event?.target)) {
        setIsExpanded(false);
        setIsFocused(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded && inputRef?.current) {
      inputRef?.current?.focus();
    }
  }, [isExpanded]);

  const handleSearchToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router?.push(`/product-catalog?search=${encodeURIComponent(searchQuery)}`);
      }
      setIsExpanded(false);
      setSearchQuery('');
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e?.target?.value);
  };

  const handleClear = () => {
    setSearchQuery('');
    inputRef?.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Desktop Search */}
      <div className="hidden md:block">
        {!isExpanded ? (
          <button
            onClick={handleSearchToggle}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200 group"
            aria-label="Open search"
          >
            <Icon 
              name="MagnifyingGlassIcon" 
              size={24} 
              className="text-foreground group-hover:text-primary transition-colors duration-200" 
            />
          </button>
        ) : (
          <div className="absolute right-0 top-0 w-80 bg-card border border-border rounded-lg shadow-dropdown p-3 z-[150] animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Icon 
                  name="MagnifyingGlassIcon" 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search products..."
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-all duration-200 ${
                    isFocused ? 'border-primary' : 'border-input'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors duration-200"
                    aria-label="Clear search"
                  >
                    <Icon name="XMarkIcon" size={16} className="text-muted-foreground" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchToggle}
                className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
                aria-label="Close search"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Search */}
      <div className="md:hidden">
        <button
          onClick={handleSearchToggle}
          className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
          aria-label="Open search"
        >
          <Icon name="MagnifyingGlassIcon" size={24} className="text-foreground" />
        </button>

        {isExpanded && (
          <div className="fixed inset-0 z-[200] bg-background">
            <div className="flex items-center p-4 border-b border-border">
              <button
                onClick={handleSearchToggle}
                className="p-2 mr-2 hover:bg-muted rounded-md transition-colors duration-200"
                aria-label="Close search"
              >
                <Icon name="ArrowLeftIcon" size={24} />
              </button>
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Icon 
                    name="MagnifyingGlassIcon" 
                    size={20} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-10 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors duration-200"
                      aria-label="Clear search"
                    >
                      <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? `Search for "${searchQuery}"` : 'Start typing to search products...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}