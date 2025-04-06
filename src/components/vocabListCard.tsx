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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="p-5 space-y-3 flex-grow">
        <div>
          <span className="text-sm font-medium text-gray-500">Title:</span>
          <h3 className="text-l font-bold text-gray-800 ml-2 inline-block">
            {vocab.title}
          </h3>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Description:</span>
          <p className="text-gray-600 ml-2 inline-block">{vocab.description}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Category:</span>
          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {vocab.category}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Word Count:</span>
          <span className="ml-2 text-gray-700">{vocab.word_count}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Created At:</span>
          <span className="ml-2 text-gray-700">{formatDate(vocab.created_at)}</span>
        </div>
      </div>
      <div className="p-5">
        <a 
          href={`/vocab-list/${vocab.id}`}
          className="inline-block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none transition-colors duration-200"
        >
          View Vocab List
        </a>
      </div>
    </div>
  );
};

export default VocabListCard;
