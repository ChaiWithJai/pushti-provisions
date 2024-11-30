import React from 'react';
import { useWellness } from '../context/WellnessContext';
import { BookOpen, Clock, Leaf } from 'lucide-react';

interface CategoryNavProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  simpleFoodCombinations: <Leaf className="h-5 w-5" />,
  dailyHealthRhythm: <Clock className="h-5 w-5" />,
  wellnessDictionary: <BookOpen className="h-5 w-5" />,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  onCategorySelect,
  selectedCategory,
}) => {
  const { wellnessData } = useWellness();

  return (
    <nav className="w-64 bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <ul className="space-y-2">
        {Object.entries(wellnessData).map(([key, category]) => (
          <li key={key}>
            <button
              onClick={() => onCategorySelect(key)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center space-x-3 ${
                selectedCategory === key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={selectedCategory === key ? 'text-blue-500' : 'text-gray-400'}>
                {categoryIcons[key]}
              </span>
              <span>{category.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};