'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import { getAttendanceRecordByListId, getStudentById, checkAttendance, getStudentByUserId, getAttendanceById } from '@/utils/api';
import { jwtDecode } from 'jwt-decode';

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

interface DecodedToken {
  id: number;
  exp: number;
  iat: number;
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

  const fetchStudentIdFromUserId = async (token: string) => {
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
      await fetchStudentIdFromUserId(token);
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
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-black">Attendance Check</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-lg font-semibold text-center my-8">
            {error}
          </div>
        ) : attendanceRecords.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => {
                  const isCurrentUser = record.student_id === currentStudentId;
                  const highlightClass = isCurrentUser ? 'bg-blue-50' : '';
                  
                  return (
                    <tr key={record.id} className={highlightClass}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={record.student?.profile_image || "/default-profile.png"} 
                              alt={record.student?.userFullName || 'Student'} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.student?.userFullName || 'Unknown Student'}
                              {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.student?.nickname || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <label className={`inline-flex items-center ${!isCurrentUser ? 'cursor-not-allowed' : ''}`}>
                            <input
                              type="checkbox" 
                              className="form-checkbox h-5 w-5 text-blue-600"
                              checked={record.status === 'attended'}
                              onChange={(e) => handleAttendanceChange(record.id, e.target.checked, record.student_id)}
                              disabled={checkingAttendance || !isCurrentUser || attendanceListStatus === 'closed'}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {record.status === 'attended' ? 'Attended' : 'Absent'}
                            </span>
                          </label>
                          {(!isCurrentUser || attendanceListStatus === 'closed') && (
                            <span className="ml-2 text-xs text-gray-500 italic">
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
          <div className="text-gray-500 text-center my-16 text-lg">
            No attendance records found
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetailPage;
