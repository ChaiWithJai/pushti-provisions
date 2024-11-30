import React from 'react';
import { useWellness } from '../context/WellnessContext';
import { WelcomeScreen } from './welcome/WelcomeScreen';
import { WellnessWiki } from './WellnessWiki';
import { Button } from './ui/Button';
import { Home } from 'lucide-react';

export const MainContent: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useWellness();

  const handleBackToHome = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4">
      {selectedCategory && (
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="text-gray-600 hover:text-gray-900"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      )}
      
      {selectedCategory ? <WellnessWiki /> : <WelcomeScreen />}
    </div>
  );
};