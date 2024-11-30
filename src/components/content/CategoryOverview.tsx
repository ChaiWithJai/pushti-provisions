import React from 'react';
import { Category } from '../../data/types';
import { ChevronRight } from 'lucide-react';

interface CategoryOverviewProps {
  category: Category;
  onSectionSelect: (section: string) => void;
}

export const CategoryOverview: React.FC<CategoryOverviewProps> = ({
  category,
  onSectionSelect,
}) => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
      <p className="text-gray-600 mb-6">{category.subtitle}</p>
      <h3 className="text-lg font-medium mb-4">Available Sections</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.sections.map((section) => (
          <button
            key={section.title}
            onClick={() => onSectionSelect(section.title)}
            className="group flex items-center w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                {section.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {Object.keys(section.content).length} topics
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
          </button>
        ))}
      </div>
    </div>
  );
};