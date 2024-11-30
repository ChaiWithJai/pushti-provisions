import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PathwayCardProps {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  details: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
  iconColor: string;
  section: string;
  onClick: () => void;
}

export const PathwayCard: React.FC<PathwayCardProps> = ({
  title,
  description,
  details,
  icon: Icon,
  color,
  textColor,
  iconColor,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`${color} w-full p-4 md:p-6 rounded-lg transition-all duration-200 hover:shadow-md text-left group relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
  >
    <div className="flex items-start space-x-3 md:space-x-4">
      <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor} flex-shrink-0 mt-1`} />
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${textColor} text-base md:text-lg truncate`}>
          {title}
        </h3>
        <p className={`${textColor} opacity-80 text-sm mt-1 line-clamp-2`}>
          {description}
        </p>
        <p className={`text-sm ${textColor} opacity-70 mt-2 hidden md:block`}>
          {details}
        </p>
      </div>
      <span className={`${iconColor} text-lg hidden md:inline-block`}>→</span>
    </div>
  </button>
);