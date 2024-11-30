import React from 'react';
import { Section } from '../../data/types';

interface ContentSectionProps {
  section: Section;
}

const renderContent = (content: any) => {
  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2" />
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof content === 'object' && content !== null) {
    return Object.entries(content).map(([subKey, subContent]) => (
      <div key={subKey} className="mb-4">
        <h4 className="text-md font-medium mb-2 text-gray-800">
          {subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1')}
        </h4>
        {renderContent(subContent)}
      </div>
    ));
  }

  return <p className="text-gray-700">{content}</p>;
};

export const ContentSection: React.FC<ContentSectionProps> = ({ section }) => {
  if (Array.isArray(section.content)) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 md:p-6">
        {renderContent(section.content)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      {Object.entries(section.content).map(([key, content]) => (
        <div key={key} className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 text-gray-900">
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          </h3>
          {renderContent(content)}
        </div>
      ))}
    </div>
  );
};