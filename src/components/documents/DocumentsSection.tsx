import React from 'react';
import { DocumentCard } from './DocumentCard';
import { whitePaper } from '../../data/documents/whitePaper';
import { familyNote } from '../../data/documents/familyNote';

export const DocumentsSection: React.FC = () => {
  return (
    <div className="mt-12 mb-8">
      <h2 className="text-xl font-semibold mb-6 text-center">Research & Guides</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentCard document={whitePaper} />
        <DocumentCard document={familyNote} />
      </div>
    </div>
  );
};