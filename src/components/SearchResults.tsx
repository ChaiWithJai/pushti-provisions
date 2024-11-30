import React from 'react';

interface SearchResult {
  path: string;
  value: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      {results.length === 0 ? (
        <p className="text-gray-500">No results found</p>
      ) : (
        <ul className="space-y-4">
          {results.map((result, index) => (
            <li key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <p className="font-medium text-gray-900">{result.path}</p>
              <p className="text-gray-600 mt-1">{result.value}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};