'use client'

import React from 'react';
import { format } from 'date-fns';

interface VocabList {
  id: number;
  title: string;
  description: string;
  category: string;
  word_count: number;
  created_at: string;
}

interface VocabProps {
  vocab: VocabList;
}

const VocabListCard: React.FC<VocabProps> = ({ vocab }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col" data-id={`vocab-list-card-${vocab.id}`}>
      <div className="p-5 space-y-3 flex-grow" data-id={`vocab-list-card-content-${vocab.id}`}>
        <div data-id={`vocab-list-card-title-section-${vocab.id}`}>
          <span className="text-sm font-medium text-gray-500" data-id={`vocab-list-card-title-label-${vocab.id}`}>Title:</span>
          <h3 className="text-l font-bold text-gray-800 ml-2 inline-block" data-id={`vocab-list-card-title-value-${vocab.id}`}>
            {vocab.title}
          </h3>
        </div>
        <div data-id={`vocab-list-card-description-section-${vocab.id}`}>
          <span className="text-sm font-medium text-gray-500" data-id={`vocab-list-card-description-label-${vocab.id}`}>Description:</span>
          <p className="text-gray-600 ml-2 inline-block" data-id={`vocab-list-card-description-value-${vocab.id}`}>{vocab.description}</p>
        </div>
        <div data-id={`vocab-list-card-category-section-${vocab.id}`}>
          <span className="text-sm font-medium text-gray-500" data-id={`vocab-list-card-category-label-${vocab.id}`}>Category:</span>
          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs" data-id={`vocab-list-card-category-value-${vocab.id}`}>
            {vocab.category}
          </span>
        </div>
        <div data-id={`vocab-list-card-count-section-${vocab.id}`}>
          <span className="text-sm font-medium text-gray-500" data-id={`vocab-list-card-count-label-${vocab.id}`}>Word Count:</span>
          <span className="ml-2 text-gray-700" data-id={`vocab-list-card-count-value-${vocab.id}`}>{vocab.word_count}</span>
        </div>
        <div data-id={`vocab-list-card-date-section-${vocab.id}`}>
          <span className="text-sm font-medium text-gray-500" data-id={`vocab-list-card-date-label-${vocab.id}`}>Created At:</span>
          <span className="ml-2 text-gray-700" data-id={`vocab-list-card-date-value-${vocab.id}`}>{formatDate(vocab.created_at)}</span>
        </div>
      </div>
      <div className="p-5" data-id={`vocab-list-card-actions-${vocab.id}`}>
        <a 
          href={`/vocab-list/${vocab.id}`}
          className="inline-block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none transition-colors duration-200"
          data-id={`vocab-list-card-view-link-${vocab.id}`}
        >
          View Vocab List
        </a>
      </div>
    </div>
  );
};

export default VocabListCard;
