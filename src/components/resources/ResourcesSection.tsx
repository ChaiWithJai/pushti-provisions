import React from 'react';
import { ResourceCard } from './ResourceCard';

export const ResourcesSection: React.FC = () => {
  const handleWhitePaperClick = () => {
    const link = document.createElement('a');
    link.href = '/documents/white-paper.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNoteClick = () => {
    const link = document.createElement('a');
    link.href = '/documents/note-from-jai.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-xl font-semibold mb-6 text-center">Additional Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResourceCard
          title="Traditional Wisdom, Modern Metrics"
          description="A comprehensive protocol for South Asian metabolic health, bridging ancestral wisdom with contemporary science."
          type="White Paper"
          color="bg-indigo-50 hover:bg-indigo-100"
          onClick={handleWhitePaperClick}
        />
        <ResourceCard
          title="Note from Jai"
          description="A personal guide to understanding and caring for our South Asian bodies, written for families."
          type="Family Guide"
          color="bg-rose-50 hover:bg-rose-100"
          onClick={handleNoteClick}
        />
      </div>
    </div>
  );
};