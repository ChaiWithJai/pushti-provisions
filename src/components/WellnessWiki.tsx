import React, { useState } from 'react';
import { CategoryNav } from './CategoryNav';
import { ContentDisplay } from './ContentDisplay';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { useWellness } from '../context/WellnessContext';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

export const WellnessWiki: React.FC = () => {
  const { searchContent, selectedCategory, setSelectedCategory, selectedSection, setSelectedSection } = useWellness();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const results = searchContent(query);
      setSearchResults(results);
      setSelectedCategory(null);
      setSelectedSection(null);
      setIsMobileNavOpen(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSection(null);
    setSearchResults([]);
    setIsMobileNavOpen(false);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-full max-w-2xl mx-auto px-4">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {searchResults.length > 0 ? (
        <SearchResults results={searchResults} />
      ) : (
        <div className="relative flex flex-col md:flex-row gap-6">
          <div className="md:hidden flex justify-between items-center px-4 py-2">
            <Button
              variant="ghost"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2"
            >
              {isMobileNavOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          <div className={`
            ${isMobileNavOpen ? 'block' : 'hidden'}
            md:block
            w-full md:w-64
            fixed md:relative
            top-0 left-0
            h-full md:h-auto
            z-50 md:z-auto
            bg-white md:bg-transparent
            shadow-lg md:shadow-none
            transition-all duration-300
          `}>
            <CategoryNav
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </div>

          <div className="flex-1">
            <ContentDisplay
              category={selectedCategory}
              section={selectedSection}
              onSectionSelect={setSelectedSection}
            />
          </div>
        </div>
      )}
    </div>
  );
};