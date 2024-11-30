import React from 'react';
import { Heart, Clock, Book, Sprout } from 'lucide-react';
import { PathwayCard } from './PathwayCard';
import { WelcomeHeader } from './WelcomeHeader';
import { ResourcesSection } from '../resources/ResourcesSection';
import { useWellness } from '../../context/WellnessContext';

const pathways = [
  {
    id: 'quickStart',
    categoryId: 'dailyHealthRhythm',
    title: 'Quick Start Guide',
    description: 'Begin with simple daily practices',
    icon: Clock,
    details: 'Start with our Morning Additions guide',
    color: 'bg-emerald-50',
    textColor: 'text-emerald-900',
    iconColor: 'text-emerald-600',
    section: 'Morning Additions'
  },
  {
    id: 'foodCombos',
    categoryId: 'simpleFoodCombinations',
    title: 'Food Combinations',
    description: 'Essential food pairs for wellness',
    icon: Heart,
    details: 'Explore Everyday Base Pairs',
    color: 'bg-amber-50',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-600',
    section: 'Everyday Base Pairs'
  },
  {
    id: 'dictionary',
    categoryId: 'wellnessDictionary',
    title: 'Wellness Dictionary',
    description: 'Core ingredients and their benefits',
    icon: Book,
    details: 'Learn about Core Grains',
    color: 'bg-blue-50',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
    section: 'Core Grains'
  },
  {
    id: 'dailyRhythm',
    categoryId: 'dailyHealthRhythm',
    title: 'Daily Rhythm',
    description: 'Adapt practices to your schedule',
    icon: Sprout,
    details: 'Discover Main Meal Adjustments',
    color: 'bg-purple-50',
    textColor: 'text-purple-900',
    iconColor: 'text-purple-600',
    section: 'Main Meal Adjustments'
  }
];

export const WelcomeScreen: React.FC = () => {
  const { setSelectedCategory, setSelectedSection } = useWellness();

  const handlePathwaySelect = (pathway: typeof pathways[0]) => {
    setSelectedCategory(pathway.categoryId);
    setSelectedSection(pathway.section);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <WelcomeHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pathways.map((pathway) => (
          <PathwayCard
            key={pathway.id}
            {...pathway}
            onClick={() => handlePathwaySelect(pathway)}
          />
        ))}
      </div>

      <ResourcesSection />

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Based on traditional Pushti Marg wisdom, adapted for modern wellness</p>
      </footer>
    </div>
  );
};