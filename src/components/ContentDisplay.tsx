import React from 'react';
import { useWellness } from '../context/WellnessContext';
import { ArrowLeft } from 'lucide-react';
import { WelcomeScreen } from './content/WelcomeScreen';
import { CategoryOverview } from './content/CategoryOverview';
import { ContentSection } from './content/ContentSection';

interface ContentDisplayProps {
  category: string | null;
  section: string | null;
  onSectionSelect: (section: string) => void;
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({
  category,
  section,
  onSectionSelect,
}) => {
  const { wellnessData, getSection } = useWellness();

  if (!category) {
    return <WelcomeScreen />;
  }

  const categoryData = wellnessData[category as keyof typeof wellnessData];

  if (!section) {
    return <CategoryOverview category={categoryData} onSectionSelect={onSectionSelect} />;
  }

  const sectionData = getSection(category, section);

  if (!sectionData) {
    return <CategoryOverview category={categoryData} onSectionSelect={onSectionSelect} />;
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <button
          onClick={() => onSectionSelect('')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to sections
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-6">{sectionData.title}</h2>
      <ContentSection section={sectionData} />
    </div>
  );
};