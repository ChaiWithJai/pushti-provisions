import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ResourceCardProps {
  title: string;
  description: string;
  type: string;
  color: string;
  onClick: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  description,
  type,
  color,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`${color} w-full p-6 rounded-lg transition-all duration-200 hover:shadow-md text-left group relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1 pr-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{type}</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
    </div>
  </button>
);