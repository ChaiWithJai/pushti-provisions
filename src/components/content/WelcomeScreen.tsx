import React from 'react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Welcome to the Pushti Provisions</h2>
      <p className="text-gray-600 mb-4">Select a category from the left to explore our wellness (anti-inflammatory; protein-focused) content that follows Pushti Marg guidelines.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Daily Practices</h3>
          <p className="text-blue-700">Discover simple routines for better health</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Food Wisdom</h3>
          <p className="text-green-700">Learn about beneficial food combinations</p>
        </div>
      </div>
    </div>
  );
};