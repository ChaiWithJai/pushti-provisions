import React, { createContext, useContext, ReactNode, useState } from 'react';
import { wellnessData } from '../data/wellnessData';

interface WellnessContextType {
  wellnessData: typeof wellnessData;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedSection: string | null;
  setSelectedSection: (section: string | null) => void;
  getSection: (category: string, sectionTitle: string) => any;
  searchContent: (query: string) => SearchResult[];
}

interface SearchResult {
  path: string;
  value: string;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};

export const WellnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const getSection = (category: string, sectionTitle: string) => {
    const doc = wellnessData[category as keyof typeof wellnessData];
    if (!doc) return null;
    return doc.sections.find(section => section.title === sectionTitle);
  };

  const searchContent = (query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const search = (obj: any, path: string[] = []) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())) {
          results.push({ path: [...path, key].join('.'), value });
        } else if (typeof value === 'object' && value !== null) {
          search(value, [...path, key]);
        }
      }
    };
    search(wellnessData);
    return results;
  };

  return (
    <WellnessContext.Provider 
      value={{ 
        wellnessData, 
        selectedCategory,
        setSelectedCategory,
        selectedSection,
        setSelectedSection,
        getSection, 
        searchContent 
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
};