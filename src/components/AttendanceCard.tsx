'use client';

import React from 'react';
import { format } from 'date-fns';

interface Attendance {
  id: number;
  title: string;
  status: string;
  created_at: string;
}

interface AttendanceCardProps {
  attendance: Attendance;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ attendance }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Determine the status color based on attendance status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300" data-id={`attendance-card-${attendance.id}`}>
      <div className="p-5" data-id={`attendance-card-content-${attendance.id}`}>
        <div className="flex justify-between items-start mb-3" data-id={`attendance-card-header-${attendance.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 truncate" data-id={`attendance-card-title-${attendance.id}`}>{attendance.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`} data-id={`attendance-card-status-${attendance.id}`}>
            {attendance.status}
          </span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm" data-id={`attendance-card-date-section-${attendance.id}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            data-id={`attendance-card-date-icon-${attendance.id}`}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span data-id={`attendance-card-date-text-${attendance.id}`}>{formatDate(attendance.created_at)}</span>
        </div>
        
        <div className="mt-4 flex justify-end" data-id={`attendance-card-actions-${attendance.id}`}>
            <a 
              href={`/attendance/${attendance.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
              data-id={`attendance-card-check-link-${attendance.id}`}
            >
              Check Attendance
            </a>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;