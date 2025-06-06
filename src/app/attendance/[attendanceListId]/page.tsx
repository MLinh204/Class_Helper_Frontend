'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import { getAttendanceRecordByListId, getStudentById, checkAttendance, getStudentByUserId, getAttendanceById } from '@/utils/api';

interface AttendanceRecord {
  id: number;
  attendance_list_id: number;
  student_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: number;
  userFullName: string;
  nickname: string;
  profile_image?: string;
}

const AttendanceDetailPage = ({ params }: { params: Promise<{ attendanceListId: string }> }) => {
  // Unwrap the promise for params using React.use()
  const resolvedParams = React.use(params);

  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<(AttendanceRecord & { student?: Student })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);
  const [attendanceListStatus, setAttendanceListStatus] = useState<string>('open');

  const fetchStudentIdFromUserId = async () => {
    try {
      if (typeof window === 'undefined') return; // Make sure this runs only on client
  
      const userString = localStorage.getItem('user');
      if (!userString) {
        setError('User not found in localStorage');
        return;
      }
  
      const user = JSON.parse(userString);
      const currentUserId = user?.id;
      console.log(currentUserId);
  
      if (!currentUserId) {
        setError('User ID not found');
        return;
      }
  
      try {
        const response = await getStudentByUserId(currentUserId);
        const student_id = response.data?.id;
        setCurrentStudentId(student_id);
      } catch (err) {
        console.error('Error fetching student by user ID:', err);
        setError('Failed to fetch student information');
      }
    } catch (error) {
      console.error('Error decoding token or parsing user:', error);
      setError('An unexpected error occurred');
    }
  };

  const fetchAttendanceListStatus = async (listId: number) => {
    try {
      const response = await getAttendanceById(listId);
      const attendanceList = response.data;
      setAttendanceListStatus(attendanceList.status);
    } catch (err) {
      console.error('Error fetching attendance list status:', err);
      // Default to 'open' if there's an error
      setAttendanceListStatus('active');
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const listId = parseInt(resolvedParams.attendanceListId);
      
      // Fetch attendance list status
      await fetchAttendanceListStatus(listId);
      
      const response = await getAttendanceRecordByListId(listId);
      const records = response.data;

      // Fetch student details for each record
      const recordsWithStudents = await Promise.all(
        records.map(async (record: AttendanceRecord) => {
          try {
            const studentResponse = await getStudentById(record.student_id);
            return {
              ...record,
              student: studentResponse.data
            };
          } catch (studentError) {
            console.error(`Error fetching student ${record.student_id}:`, studentError);
            return {
              ...record,
              student: { id: record.student_id, userFullName: 'Unknown', nickname: '' }
            };
          }
        })
      );

      setAttendanceRecords(recordsWithStudents);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to load attendance records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch the student ID
      await fetchStudentIdFromUserId();
      // Fetch attendance records
      await fetchAttendanceRecords();
    };

    initialize();
  }, [resolvedParams.attendanceListId, router]);

  const handleAttendanceChange = async (recordId: number, isAttended: boolean, studentId: number) => {
    // Check if current user is allowed to check attendance for this record
    if (currentStudentId !== studentId) {
      setError('You can only check your own attendance.');
      return;
    }
    
    try {
      setCheckingAttendance(true);
      await checkAttendance(recordId, { status: isAttended ? 'attended' : 'absent' });
      
      // Update local state
      setAttendanceRecords(records => 
        records.map(record => 
          record.id === recordId 
            ? { ...record, status: isAttended ? 'attended' : 'absent' } 
            : record
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance status. Please try again.');
    } finally {
      setCheckingAttendance(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-id="attendance-detail-page">
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-4" data-id="attendance-detail-container">
        <h1 className="text-2xl font-bold mb-6 text-black" data-id="attendance-detail-title">Attendance Check</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64" data-id="attendance-detail-loading">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" data-id="attendance-detail-loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-lg font-semibold text-center my-8" data-id="attendance-detail-error">
            {error}
          </div>
        ) : attendanceRecords.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden" data-id="attendance-detail-table-container">
            <table className="min-w-full divide-y divide-gray-200" data-id="attendance-detail-table">
              <thead className="bg-gray-50" data-id="attendance-detail-table-header">
                <tr data-id="attendance-detail-header-row">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-id="attendance-detail-student-header">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-id="attendance-detail-status-header">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" data-id="attendance-detail-table-body">
                {attendanceRecords.map((record) => {
                  const isCurrentUser = record.student_id === currentStudentId;
                  const highlightClass = isCurrentUser ? 'bg-blue-50' : '';
                  
                  return (
                    <tr key={record.id} className={highlightClass} data-id={`attendance-record-row-${record.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap" data-id={`attendance-record-student-${record.id}`}>
                        <div className="flex items-center" data-id={`attendance-student-info-${record.id}`}>
                          <div className="flex-shrink-0 h-10 w-10" data-id={`attendance-student-avatar-container-${record.id}`}>
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={record.student?.profile_image || "/default-profile.png"} 
                              alt={record.student?.userFullName || 'Student'} 
                              data-id={`attendance-student-avatar-${record.id}`}
                            />
                          </div>
                          <div className="ml-4" data-id={`attendance-student-details-${record.id}`}>
                            <div className="text-sm font-medium text-gray-900" data-id={`attendance-student-name-${record.id}`}>
                              {record.student?.userFullName || 'Unknown Student'}
                              {isCurrentUser && <span className="ml-2 text-xs text-blue-600" data-id={`attendance-current-user-indicator-${record.id}`}>(You)</span>}
                            </div>
                            <div className="text-sm text-gray-500" data-id={`attendance-student-nickname-${record.id}`}>
                              {record.student?.nickname || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-id={`attendance-record-status-${record.id}`}>
                        <div className="flex items-center" data-id={`attendance-status-controls-${record.id}`}>
                          <label className={`inline-flex items-center ${!isCurrentUser ? 'cursor-not-allowed' : ''}`} data-id={`attendance-checkbox-label-${record.id}`}>
                            <input
                              type="checkbox" 
                              className="form-checkbox h-5 w-5 text-blue-600"
                              checked={record.status === 'attended'}
                              onChange={(e) => handleAttendanceChange(record.id, e.target.checked, record.student_id)}
                              disabled={checkingAttendance || !isCurrentUser || attendanceListStatus === 'closed'}
                              data-id={`attendance-checkbox-${record.id}`}
                            />
                            <span className="ml-2 text-sm text-gray-700" data-id={`attendance-status-text-${record.id}`}>
                              {record.status === 'attended' ? 'Attended' : 'Absent'}
                            </span>
                          </label>
                          {(!isCurrentUser || attendanceListStatus === 'closed') && (
                            <span className="ml-2 text-xs text-gray-500 italic" data-id={`attendance-readonly-indicator-${record.id}`}>
                              {attendanceListStatus === 'closed' ? '(attendance closed)' : '(read-only)'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center my-16 text-lg" data-id="attendance-detail-empty-state">
            No attendance records found
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetailPage;
