import React from 'react';
import { Document } from '../../data/types';
import { FileText, Download } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const handleDownload = () => {
    window.open(document.downloadUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-500">{document.type}</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">{document.title}</h3>
          <p className="text-gray-600 mb-4">{document.abstract}</p>
          
          <div className="space-y-3 mb-4">
            {document.sections.map((section) => (
              <div key={section.title} className="border-l-2 border-gray-200 pl-4">
                <h4 className="font-medium text-gray-900">{section.title}</h4>
                <p className="text-sm text-gray-600">{section.preview}</p>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{document.author} · {document.date}</span>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};